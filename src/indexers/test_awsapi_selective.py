"""
Unit tests for the AWS indexer orchestrator (``indexers.awsapi``).

Coverage:
* ``_account_lod`` resolves per-account LOD, falling back to the workspace
  default and tolerating garbage values.
* ``index()`` honours account-level selective discovery: an account whose
  effective LOD is NONE is skipped entirely (no anchor, no typed pass, no Cloud
  Control pass).
* The account anchor is emitted (Phase 0) whenever the account is in scope.
* Typed (boto3) collectors run per region for regional types and once for
  global types, for accessed typed types only.
* The Cloud Control pass is scoped to exactly the CFN types of accessed
  *generic* types (typed types are excluded so nothing is written twice), once
  per region.

The dispatch tests drive ``index()`` with stubbed credentials / collectors /
writer / handler so they need no AWS SDK or network.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase, mock

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from enrichers.generation_rule_types import LevelOfDetail  # noqa: E402
from indexers import awsapi  # noqa: E402
from indexers.awsapi_resource_types import AwsResourceTypeSpec  # noqa: E402

ACCOUNT_ID = "123456789012"


class AccountLodTests(TestCase):
    def test_explicit_account_override(self):
        cfg = {"accountLevelOfDetails": {ACCOUNT_ID: "detailed"}}
        self.assertEqual(
            awsapi._account_lod(cfg, ACCOUNT_ID, LevelOfDetail.BASIC),
            LevelOfDetail.DETAILED,
        )

    def test_falls_back_to_default(self):
        cfg = {"accountLevelOfDetails": {ACCOUNT_ID: "detailed"}}
        self.assertEqual(
            awsapi._account_lod(cfg, "999999999999", LevelOfDetail.BASIC),
            LevelOfDetail.BASIC,
        )

    def test_none_override(self):
        cfg = {"accountLevelOfDetails": {ACCOUNT_ID: "none"}}
        self.assertEqual(
            awsapi._account_lod(cfg, ACCOUNT_ID, LevelOfDetail.BASIC),
            LevelOfDetail.NONE,
        )

    def test_garbage_falls_back_to_default(self):
        cfg = {"accountLevelOfDetails": {ACCOUNT_ID: "garbage"}}
        self.assertEqual(
            awsapi._account_lod(cfg, ACCOUNT_ID, LevelOfDetail.DETAILED),
            LevelOfDetail.DETAILED,
        )


class _FakeRuleSpec:
    """Mimics a generation-rule ResourceTypeSpec (only resource_type_name read)."""

    def __init__(self, resource_type_name: str):
        self.resource_type_name = resource_type_name

    def __hash__(self):
        return hash(self.resource_type_name)

    def __eq__(self, other):
        return getattr(other, "resource_type_name", None) == self.resource_type_name


class DispatchTests(TestCase):
    def setUp(self):
        self._calls = {"typed_ec2": [], "typed_s3": [], "cc": []}

        def _stub_ec2(session, account_id, region):
            self._calls["typed_ec2"].append(region)
            return []

        def _stub_s3(session, account_id, region):
            self._calls["typed_s3"].append(region)
            return []

        self.account_spec = AwsResourceTypeSpec(
            resource_type_name="account",
            cloudquery_table_name="aws_iam_accounts",
            cfn_type=None,
            mandatory=True,
            typed=True,
            collector=None,
        )
        self.ec2_spec = AwsResourceTypeSpec(
            resource_type_name="ec2_instance",
            cloudquery_table_name="aws_ec2_instances",
            cfn_type="AWS::EC2::Instance",
            mandatory=False,
            typed=True,
            collector=_stub_ec2,
            regional=True,
        )
        self.s3_spec = AwsResourceTypeSpec(
            resource_type_name="aws_s3_buckets",
            cloudquery_table_name="aws_s3_buckets",
            cfn_type="AWS::S3::Bucket",
            mandatory=False,
            typed=True,
            collector=_stub_s3,
            regional=False,
        )
        self.rds_spec = AwsResourceTypeSpec(
            resource_type_name="aws_rds_instances",
            cloudquery_table_name="aws_rds_instances",
            cfn_type="AWS::RDS::DBInstance",
            mandatory=False,
            typed=False,
            collector=None,
        )
        self._by_name = {
            "aws_iam_accounts": self.account_spec,
            "account": self.account_spec,
            "ec2_instance": self.ec2_spec,
            "aws_ec2_instances": self.ec2_spec,
            "aws_s3_buckets": self.s3_spec,
            "aws_rds_instances": self.rds_spec,
        }
        self._by_cfn = {
            "AWS::EC2::Instance": self.ec2_spec,
            "AWS::S3::Bucket": self.s3_spec,
            "AWS::RDS::DBInstance": self.rds_spec,
        }

    def _run(self, *, regions, account_lod, accessed):
        from enrichers.generation_rules import RESOURCE_TYPE_SPECS_PROPERTY
        from enrichers.generation_rule_types import PLATFORM_HANDLERS_PROPERTY_NAME

        platform_cfg = {
            "regions": list(regions),
            "accountLevelOfDetails": dict(account_lod),
        }

        def _stub_cc(session, region, cfn_type):
            self._calls["cc"].append((region, cfn_type))
            return []

        handler = mock.MagicMock()
        handler.parse_resource_data.return_value = ("nm", "q/nm", {})
        writer = mock.MagicMock()

        rule_specs = {"aws": {_FakeRuleSpec(name): {} for name in accessed}}

        class FakeContext:
            def __init__(self):
                self._cloud = {"aws": dict(platform_cfg)}
                self._props = {RESOURCE_TYPE_SPECS_PROPERTY: rule_specs}

            def get_setting(self, setting):
                name = getattr(setting, "name", setting)
                return {
                    "AWS_INDEXER_BACKEND": "awsapi",
                    "CLOUD_CONFIG": self._cloud,
                    "RESOURCE_STORE_BACKEND": "memory",
                    "RESOURCE_STORE_PATH": None,
                    "DEFAULT_LOD": None,
                }.get(name)

            def get_property(self, name):
                if name == PLATFORM_HANDLERS_PROPERTY_NAME:
                    return None
                return self._props.get(name)

            def add_warning(self, msg):
                pass

        scope = {
            "session": object(),
            "account_id": ACCOUNT_ID,
            "account_alias": "acme",
            "account_name": "Acme",
            "account_names": {ACCOUNT_ID: "Acme"},
            "regions": list(regions),
            "auth_type": "aws_explicit",
            "auth_secret": None,
            "region": regions[0] if regions else None,
        }

        with mock.patch.object(
            awsapi, "aws_get_session_and_scope", return_value=scope
        ), mock.patch.object(awsapi, "get_resource_writer", return_value=writer), \
            mock.patch.object(awsapi, "_resolve_platform_handler", return_value=handler), \
            mock.patch.object(awsapi, "collect_cloudcontrol_resources", _stub_cc), \
            mock.patch.object(awsapi, "find_spec", side_effect=lambda n: self._by_name.get(n)), \
            mock.patch.object(
                awsapi, "find_spec_by_cfn_type",
                side_effect=lambda t: self._by_cfn.get(t),
            ), \
            mock.patch("enrichers.aws.set_aws_credentials"):
            awsapi.index(FakeContext())

        return writer

    def test_skips_none_lod_account(self):
        writer = self._run(
            regions=["us-east-1"],
            account_lod={ACCOUNT_ID: "none"},
            accessed=["ec2_instance", "aws_rds_instances"],
        )
        # Nothing written, no collectors invoked.
        self.assertEqual(writer.add_resource.call_count, 0)
        self.assertEqual(self._calls["typed_ec2"], [])
        self.assertEqual(self._calls["cc"], [])

    def test_account_anchor_emitted_when_no_accessed_types(self):
        writer = self._run(regions=["us-east-1"], account_lod={}, accessed=[])
        # Only the account anchor is written; neither pass runs.
        self.assertEqual(writer.add_resource.call_count, 1)
        self.assertEqual(writer.add_resource.call_args_list[0].args[1], "account")
        self.assertEqual(self._calls["typed_ec2"], [])
        self.assertEqual(self._calls["cc"], [])

    def test_typed_excluded_from_generic_pass(self):
        # When only typed types are accessed, the Cloud Control pass never runs.
        self._run(
            regions=["us-east-1", "us-west-2"],
            account_lod={},
            accessed=["ec2_instance", "aws_s3_buckets"],
        )
        # EC2 is regional: runs once per region.
        self.assertEqual(self._calls["typed_ec2"], ["us-east-1", "us-west-2"])
        # S3 is global: runs once, with the primary region.
        self.assertEqual(self._calls["typed_s3"], ["us-east-1"])
        # No generic types -> no Cloud Control calls.
        self.assertEqual(self._calls["cc"], [])

    def test_generic_only_runs_cloud_control_per_region(self):
        self._run(
            regions=["us-east-1", "us-west-2"],
            account_lod={},
            accessed=["aws_rds_instances"],
        )
        self.assertEqual(self._calls["typed_ec2"], [])
        self.assertEqual(self._calls["typed_s3"], [])
        self.assertEqual(
            self._calls["cc"],
            [
                ("us-east-1", "AWS::RDS::DBInstance"),
                ("us-west-2", "AWS::RDS::DBInstance"),
            ],
        )

    def test_no_op_when_backend_not_awsapi(self):
        # When the backend is not 'awsapi', index() returns immediately.
        from enrichers.generation_rules import RESOURCE_TYPE_SPECS_PROPERTY
        from enrichers.generation_rule_types import PLATFORM_HANDLERS_PROPERTY_NAME

        writer = mock.MagicMock()

        class FakeContext:
            def get_setting(self, setting):
                name = getattr(setting, "name", setting)
                return {"AWS_INDEXER_BACKEND": "cloudquery"}.get(name)

            def get_property(self, name):
                return None

            def add_warning(self, msg):
                pass

        with mock.patch.object(awsapi, "get_resource_writer", return_value=writer):
            awsapi.index(FakeContext())
        self.assertEqual(writer.add_resource.call_count, 0)

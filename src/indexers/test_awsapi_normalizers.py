"""
Unit tests for ``indexers.awsapi_normalizers``.

The native AWS indexer claims output compatible with the legacy CloudQuery
path. These tests pin the contract:

1. ``normalize_cloudcontrol_resource`` flattens a Cloud Control
   ``ResourceDescription`` (with its JSON ``Properties`` blob) into the flat
   dict shape ``AWSPlatformHandler.parse_resource_data`` accepts (``arn``,
   ``name``, ``account_id``, ``region``, ``tags``).

2. ``normalize_aws_resource`` does the same for a typed boto3 payload, including
   synthesizing an ARN when the payload carries none.

3. Feeding those dicts into ``AWSPlatformHandler.parse_resource_data`` yields a
   sensible ``(name, qualified_name, attributes)`` tuple.

These tests run without boto3 installed because the normalizers operate on
plain dicts.
"""

from __future__ import annotations

import datetime
import json
import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.awsapi_normalizers import (  # noqa: E402
    _sanitize,
    make_account_resource_data,
    normalize_aws_resource,
    normalize_cloudcontrol_resource,
    normalize_tags,
)

ACCOUNT_ID = "123456789012"
REGION = "us-east-1"


class SanitizeAndTagTests(TestCase):
    def test_sanitize_handles_datetimes_enums_nested(self):
        import enum

        class Color(enum.Enum):
            RED = "red"

        payload = {
            "ts": datetime.datetime(2024, 1, 2, 3, 4, 5),
            "color": Color.RED,
            "nested": {"more_ts": datetime.datetime(2025, 1, 1)},
            "list": [Color.RED, datetime.date(2025, 6, 1)],
        }
        out = _sanitize(payload)
        self.assertEqual(out["ts"], "2024-01-02T03:04:05")
        self.assertEqual(out["color"], "red")
        self.assertEqual(out["nested"]["more_ts"], "2025-01-01T00:00:00")
        self.assertEqual(out["list"][0], "red")
        self.assertEqual(out["list"][1], "2025-06-01")

    def test_normalize_tags_from_aws_list(self):
        raw = [{"Key": "env", "Value": "prod"}, {"Key": "team", "Value": "sre"}]
        self.assertEqual(normalize_tags(raw), {"env": "prod", "team": "sre"})

    def test_normalize_tags_from_dict(self):
        self.assertEqual(normalize_tags({"env": "prod"}), {"env": "prod"})

    def test_normalize_tags_empty(self):
        self.assertEqual(normalize_tags(None), {})
        self.assertEqual(normalize_tags([]), {})


class NormalizeCloudControlTests(TestCase):
    def _bucket_description(self):
        return {
            "Identifier": "my-bucket",
            "Properties": json.dumps(
                {
                    "BucketName": "my-bucket",
                    "Arn": "arn:aws:s3:::my-bucket",
                    "Tags": [{"Key": "env", "Value": "prod"}],
                }
            ),
        }

    def test_bucket_top_level_shape(self):
        data = normalize_cloudcontrol_resource(
            self._bucket_description(),
            account_id=ACCOUNT_ID,
            region=REGION,
            cfn_type="AWS::S3::Bucket",
        )
        self.assertEqual(data["name"], "my-bucket")
        self.assertEqual(data["arn"], "arn:aws:s3:::my-bucket")
        self.assertEqual(data["account_id"], ACCOUNT_ID)
        self.assertEqual(data["region"], REGION)
        self.assertEqual(data["tags"], {"env": "prod"})
        self.assertEqual(data["cfn_type"], "AWS::S3::Bucket")

    def test_synthesize_arn_when_absent(self):
        desc = {
            "Identifier": "q1",
            "Properties": json.dumps({"QueueName": "q1"}),
        }
        data = normalize_cloudcontrol_resource(
            desc,
            account_id=ACCOUNT_ID,
            region="us-west-2",
            cfn_type="AWS::SQS::Queue",
        )
        self.assertEqual(data["arn"], f"arn:aws:sqs:us-west-2:{ACCOUNT_ID}:queue/q1")
        self.assertEqual(data["name"], "q1")

    def test_malformed_properties_string_is_tolerated(self):
        desc = {"Identifier": "abc", "Properties": "{not valid json"}
        data = normalize_cloudcontrol_resource(
            desc, account_id=ACCOUNT_ID, region=REGION, cfn_type="AWS::EC2::Vpc"
        )
        # Falls back to the identifier-based name + synthesized ARN.
        self.assertEqual(data["name"], "abc")
        self.assertTrue(data["arn"].startswith("arn:aws:ec2:"))


class NormalizeAwsResourceTests(TestCase):
    def test_typed_payload_with_arn(self):
        payload = {
            "InstanceId": "i-0abc",
            "Arn": f"arn:aws:ec2:{REGION}:{ACCOUNT_ID}:instance/i-0abc",
            "Tags": [{"Key": "Name", "Value": "web-1"}],
            "name": "web-1",
        }
        data = normalize_aws_resource(
            payload,
            account_id=ACCOUNT_ID,
            region=REGION,
            cfn_type="AWS::EC2::Instance",
            identifier="i-0abc",
        )
        self.assertEqual(data["name"], "web-1")
        self.assertEqual(data["arn"], f"arn:aws:ec2:{REGION}:{ACCOUNT_ID}:instance/i-0abc")
        self.assertEqual(data["tags"], {"Name": "web-1"})
        self.assertEqual(data["account_id"], ACCOUNT_ID)

    def test_global_payload_keeps_own_region_when_region_none(self):
        payload = {"name": "b", "Arn": "arn:aws:s3:::b", "region": "eu-west-1"}
        data = normalize_aws_resource(
            payload, account_id=ACCOUNT_ID, region=None, cfn_type="AWS::S3::Bucket"
        )
        self.assertEqual(data["region"], "eu-west-1")

    def test_make_account_resource_data(self):
        data = make_account_resource_data(ACCOUNT_ID, account_name="Acme")
        self.assertEqual(data["account_id"], ACCOUNT_ID)
        self.assertEqual(data["name"], "Acme")
        self.assertEqual(data["arn"], f"arn:aws:iam::{ACCOUNT_ID}:root")
        self.assertEqual(data["region"], "global")


class NormalizerParserRoundTripTests(TestCase):
    """End-to-end: normalizer dict -> AWSPlatformHandler.parse_resource_data."""

    def setUp(self):
        import component
        from component import Context
        from outputter import FileItemOutputter
        from resources import REGISTRY_PROPERTY_NAME, Registry
        from enrichers.generation_rule_types import LevelOfDetail

        # The AWS handler resolves LOD via ``Context.get_setting("DEFAULT_LOD")``
        # (string form), which needs the global settings registry populated.
        component.init_components()

        self.context = Context(
            setting_values={"DEFAULT_LOD": LevelOfDetail.BASIC},
            outputter=FileItemOutputter(),
        )
        self.context.set_property(REGISTRY_PROPERTY_NAME, Registry())

    def test_account_anchor_round_trip(self):
        from enrichers.aws import AWSPlatformHandler

        platform_cfg = {"_account_names": {ACCOUNT_ID: "Acme"}}
        data = make_account_resource_data(ACCOUNT_ID, account_name="Acme")
        handler = AWSPlatformHandler()
        name, qualified_name, attrs = handler.parse_resource_data(
            data, "account", platform_cfg, self.context
        )
        self.assertEqual(name, "Acme")
        self.assertEqual(attrs["account_id"], ACCOUNT_ID)
        self.assertEqual(attrs["region"], "global")
        self.assertEqual(attrs["service"], "iam")
        self.assertEqual(attrs["account_name"], "Acme")
        self.assertEqual(qualified_name, f"{ACCOUNT_ID}:global:Acme")
        self.assertIsNotNone(attrs.get("lod"))

    def test_generic_resource_round_trip(self):
        from enrichers.aws import AWSPlatformHandler

        platform_cfg = {"_account_names": {ACCOUNT_ID: "Acme"}}
        desc = {
            "Identifier": "my-bucket",
            "Properties": json.dumps(
                {"BucketName": "my-bucket", "Arn": "arn:aws:s3:::my-bucket"}
            ),
        }
        data = normalize_cloudcontrol_resource(
            desc, account_id=ACCOUNT_ID, region=REGION, cfn_type="AWS::S3::Bucket"
        )
        handler = AWSPlatformHandler()
        name, qualified_name, attrs = handler.parse_resource_data(
            data, "aws_s3_buckets", platform_cfg, self.context
        )
        self.assertEqual(name, "my-bucket")
        self.assertEqual(attrs["service"], "s3")
        self.assertEqual(attrs["account_id"], ACCOUNT_ID)
        # S3 bucket ARNs carry no region segment; handler falls back to the
        # normalized region field.
        self.assertEqual(attrs["region"], REGION)
        self.assertEqual(attrs["account_name"], "Acme")

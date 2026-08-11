"""
Tests for how the GCP indexer *reports* a failed Cloud Asset Inventory pass.

CAI is an optional accelerator, so a genuine CAI permission denial is
informational. Two things must not be swept into that "informational" bucket:

* A **credentials failure** (the pod cannot mint a token for *any* Google API).
  Its text happens to contain both "403" and "permission", which the
  best-effort string fallback in ``_is_permission_denied`` used to match --
  reporting a total auth outage as "CAI not enabled, no action needed".

* A CAI denial when the workspace's generation rules reference resource types
  that **only** CAI can discover. Those types silently go missing, so the
  operator does have action to take.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase, mock

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers import gcpapi  # noqa: E402
from indexers.gcpapi_resource_types import GcpResourceTypeSpec  # noqa: E402


# The verbatim shape of a Workload-Identity token-minting failure, as seen in
# the workspace-builder log. Note it contains both "403" and "permission".
TOKEN_MINTING_FAILURE_TEXT = (
    "Timeout of 60.0s exceeded, last exception: 503 Getting metadata from "
    "plugin failed with error: ('Failed to retrieve "
    "http://metadata.google.internal/computeMetadata/v1/instance/"
    "service-accounts/default/token?scopes=https%3A%2F%2Fwww.googleapis.com"
    "%2Fauth%2Fcloud-platform from the Google Compute Engine metadata "
    "service. Status: 403 Response:\\nb\"Unable to generate access token; IAM "
    "returned 403 Forbidden: Permission 'iam.serviceAccounts.getAccessToken' "
    "denied on resource (or it may not exist)."
)


class PermissionDenied(Exception):
    """Stand-in for google.api_core.exceptions.PermissionDenied."""


class PermissionDeniedClassificationTests(TestCase):
    def test_token_minting_failure_is_not_a_cai_denial(self):
        # A credentials outage must never be classified as "CAI unavailable",
        # even though its text matches the "403"+"permission" string fallback.
        exc = Exception(TOKEN_MINTING_FAILURE_TEXT)
        self.assertFalse(gcpapi._is_permission_denied(exc))

    def test_genuine_cai_denial_is_still_classified_as_permission_denied(self):
        # Regression guard for the behaviour we must keep.
        exc = PermissionDenied("403 The caller does not have permission")
        self.assertTrue(gcpapi._is_permission_denied(exc))

    def test_vpc_service_controls_denial_is_not_a_cai_denial(self):
        # An org-policy/VPC-SC block is an actionable infrastructure problem,
        # not an absent optional accelerator.
        exc = Exception(
            "403 GET https://storage.googleapis.com/storage/v1/b: Request is "
            "prohibited by organization's policy. "
            "vpcServiceControlsUniqueIdentifier: PO3GSM7cdmQd4QkgNSWcpRbyGgP"
        )
        self.assertFalse(gcpapi._is_permission_denied(exc))


class _FakeRuleSpec:
    def __init__(self, resource_type_name):
        self.resource_type_name = resource_type_name


class CaiUnavailableReportingTests(TestCase):
    """Drive index() with a denied CAI pass and inspect what gets reported."""

    def setUp(self):
        self.warnings: list[str] = []

        self.project_spec = GcpResourceTypeSpec(
            resource_type_name="project",
            cloudquery_table_name=gcpapi.PROJECTS_TABLE,
            cai_asset_type=None,
            mandatory=True,
            typed=True,
            collector=None,
        )
        # CAI-only: no typed collector, so it vanishes when CAI is denied.
        self.sql_spec = GcpResourceTypeSpec(
            resource_type_name="gcp_sql_instances",
            cloudquery_table_name="gcp_sql_instances",
            cai_asset_type="sqladmin.googleapis.com/Instance",
            mandatory=False,
            typed=False,
            collector=None,
        )

        def _typed_collector(credentials, project_id):
            if self.typed_raises is not None:
                raise self.typed_raises
            return []

        self.typed_raises: Exception | None = None
        self.compute_spec = GcpResourceTypeSpec(
            resource_type_name="gcp_compute_instances",
            cloudquery_table_name="gcp_compute_instances",
            cai_asset_type="compute.googleapis.com/Instance",
            mandatory=False,
            typed=True,
            collector=_typed_collector,
        )

        self._by_name = {
            "gcp_projects": self.project_spec,
            "gcp_sql_instances": self.sql_spec,
            "gcp_compute_instances": self.compute_spec,
        }
        self._by_cai = {
            "sqladmin.googleapis.com/Instance": self.sql_spec,
            "compute.googleapis.com/Instance": self.compute_spec,
        }

    def _run(self, *, accessed, cai_exception):
        from enrichers.generation_rules import RESOURCE_TYPE_SPECS_PROPERTY
        from enrichers.generation_rule_types import PLATFORM_HANDLERS_PROPERTY_NAME

        platform_cfg = {"projects": ["proj-a"], "projectLevelOfDetails": {}}
        rule_specs = {"gcp": {_FakeRuleSpec(n): {} for n in accessed}}
        outer = self

        def _stub_cai(credentials, project_id, asset_types=None):
            raise cai_exception

        handler = mock.MagicMock()
        handler.parse_resource_data.return_value = ("nm", "q/nm", {})

        class FakeContext:
            def __init__(self):
                self._cloud = {"gcp": dict(platform_cfg)}
                self._props = {RESOURCE_TYPE_SPECS_PROPERTY: rule_specs}

            def get_setting(self, setting):
                name = getattr(setting, "name", setting)
                return {
                    "GCP_INDEXER_BACKEND": "gcpapi",
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
                outer.warnings.append(msg)

        with mock.patch.object(
            gcpapi, "gcp_get_credentials_and_projects",
            return_value={
                "credentials": object(),
                "project_ids": ["proj-a"],
                "quota_project": "proj-a",
                "env": {},
            },
        ), mock.patch.object(gcpapi, "get_resource_writer", return_value=mock.MagicMock()), \
            mock.patch.object(gcpapi, "_resolve_platform_handler", return_value=handler), \
            mock.patch.object(gcpapi, "collect_assets_for_project", _stub_cai), \
            mock.patch.object(gcpapi, "find_spec", side_effect=lambda n: self._by_name.get(n)), \
            mock.patch.object(
                gcpapi, "find_spec_by_cai_type",
                side_effect=lambda t: self._by_cai.get(t),
            ), \
            mock.patch("enrichers.gcp.set_gcp_credentials"):
            with self.assertLogs(gcpapi.logger, level="INFO") as captured:
                gcpapi.index(FakeContext())
        return captured

    def test_warns_and_names_types_when_gen_rules_need_cai_only_types(self):
        # gcp_sql_instances is CAI-only, so a denied CAI pass means it is
        # simply missing from the workspace -- an actionable failure.
        captured = self._run(
            accessed=["gcp_sql_instances"],
            cai_exception=PermissionDenied("403 The caller does not have permission"),
        )
        warning_text = "\n".join(
            r.getMessage() for r in captured.records if r.levelname == "WARNING"
        )
        self.assertIn("gcp_sql_instances", warning_text)
        self.assertIn("gcp_sql_instances", "\n".join(self.warnings))

    def test_does_not_claim_no_action_needed_when_types_are_missing(self):
        captured = self._run(
            accessed=["gcp_sql_instances"],
            cai_exception=PermissionDenied("403 The caller does not have permission"),
        )
        all_text = "\n".join(r.getMessage() for r in captured.records)
        self.assertNotIn("no action is needed", all_text)

    def test_names_every_missing_cai_only_type(self):
        # Typed types are served by their SDK collector and must NOT be listed
        # as missing; only the CAI-only ones are actually lost.
        captured = self._run(
            accessed=["gcp_sql_instances", "gcp_compute_instances"],
            cai_exception=PermissionDenied("403 The caller does not have permission"),
        )
        warning_text = "\n".join(
            r.getMessage() for r in captured.records if r.levelname == "WARNING"
        )
        self.assertIn("gcp_sql_instances", warning_text)
        self.assertNotIn("gcp_compute_instances", warning_text)

    def test_no_success_summary_when_typed_baseline_collected_nothing(self):
        # Typed collectors all failed AND CAI was denied: discovery produced no
        # real resources, so the reassuring summary must not be emitted.
        # Both a typed and a CAI-only type are referenced so that the CAI pass
        # actually runs (it is gated on there being CAI-only types).
        self.typed_raises = Exception("boom")
        captured = self._run(
            accessed=["gcp_compute_instances", "gcp_sql_instances"],
            cai_exception=PermissionDenied("403 The caller does not have permission"),
        )
        all_text = "\n".join(r.getMessage() for r in captured.records)
        self.assertNotIn("does not indicate a failure", all_text)

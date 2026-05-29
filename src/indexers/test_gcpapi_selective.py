"""
Unit tests for the GCP indexer orchestrator (``indexers.gcpapi``).

Coverage:
* ``_project_lod`` resolves per-project LOD, falling back to the workspace
  default and tolerating garbage values.
* ``index()`` honours per-project selective discovery: projects whose effective
  LOD is NONE are skipped entirely (no anchor, no typed pass, no CAI pass).
* The project anchor is emitted for every in-scope project.
* Typed (SDK) collectors run per in-scope project for accessed typed types.
* The Cloud Asset Inventory pass is scoped to exactly the CAI asset types of
  accessed *generic* types (typed types are excluded so nothing is written
  twice).

The dispatch tests drive ``index()`` with stubbed credentials / collectors /
writer / handler so they need no GCP SDK or network.
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
from indexers import gcpapi  # noqa: E402
from indexers.gcpapi_resource_types import GcpResourceTypeSpec  # noqa: E402


class ProjectLodTests(TestCase):
    def test_explicit_project_override(self):
        cfg = {"projectLevelOfDetails": {"proj-a": "detailed"}}
        self.assertEqual(
            gcpapi._project_lod(cfg, "proj-a", LevelOfDetail.BASIC),
            LevelOfDetail.DETAILED,
        )

    def test_falls_back_to_default(self):
        cfg = {"projectLevelOfDetails": {"proj-a": "detailed"}}
        self.assertEqual(
            gcpapi._project_lod(cfg, "proj-b", LevelOfDetail.BASIC),
            LevelOfDetail.BASIC,
        )

    def test_none_override(self):
        cfg = {"projectLevelOfDetails": {"proj-a": "none"}}
        self.assertEqual(
            gcpapi._project_lod(cfg, "proj-a", LevelOfDetail.BASIC),
            LevelOfDetail.NONE,
        )

    def test_garbage_falls_back_to_default(self):
        cfg = {"projectLevelOfDetails": {"proj-a": "garbage"}}
        self.assertEqual(
            gcpapi._project_lod(cfg, "proj-a", LevelOfDetail.DETAILED),
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
        self._calls = {"typed": [], "cai": []}

        def _stub_compute(credentials, project_id):
            self._calls["typed"].append(project_id)
            return []

        self.project_spec = GcpResourceTypeSpec(
            resource_type_name="project",
            cloudquery_table_name="gcp_projects",
            cai_asset_type="cloudresourcemanager.googleapis.com/Project",
            mandatory=True,
            typed=True,
            collector=None,
        )
        self.compute_spec = GcpResourceTypeSpec(
            resource_type_name="compute_instance",
            cloudquery_table_name="gcp_compute_instances",
            cai_asset_type="compute.googleapis.com/Instance",
            mandatory=False,
            typed=True,
            collector=_stub_compute,
        )
        self.sql_spec = GcpResourceTypeSpec(
            resource_type_name="gcp_sql_instances",
            cloudquery_table_name="gcp_sql_instances",
            cai_asset_type="sqladmin.googleapis.com/Instance",
            mandatory=False,
            typed=False,
            collector=None,
        )
        self._by_name = {
            "gcp_projects": self.project_spec,
            "compute_instance": self.compute_spec,
            "gcp_compute_instances": self.compute_spec,
            "gcp_sql_instances": self.sql_spec,
        }
        self._by_cai = {
            "sqladmin.googleapis.com/Instance": self.sql_spec,
            "compute.googleapis.com/Instance": self.compute_spec,
        }

    def _run(self, *, projects, project_lod, accessed):
        from enrichers.generation_rules import RESOURCE_TYPE_SPECS_PROPERTY
        from enrichers.generation_rule_types import PLATFORM_HANDLERS_PROPERTY_NAME

        platform_cfg = {
            "projects": list(projects),
            "projectLevelOfDetails": dict(project_lod),
        }

        def _stub_cai(credentials, project_id, asset_types=None):
            self._calls["cai"].append((project_id, tuple(sorted(asset_types or []))))
            return []

        handler = mock.MagicMock()
        handler.parse_resource_data.return_value = ("nm", "q/nm", {})
        writer = mock.MagicMock()

        rule_specs = {
            "gcp": {_FakeRuleSpec(name): {} for name in accessed}
        }

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
                pass

        with mock.patch.object(
            gcpapi, "gcp_get_credentials_and_projects",
            return_value={
                "credentials": object(),
                "project_ids": list(projects),
                "quota_project": projects[0] if projects else None,
                "env": {},
            },
        ), mock.patch.object(gcpapi, "get_resource_writer", return_value=writer), \
            mock.patch.object(gcpapi, "_resolve_platform_handler", return_value=handler), \
            mock.patch.object(gcpapi, "collect_assets_for_project", _stub_cai), \
            mock.patch.object(gcpapi, "find_spec", side_effect=lambda n: self._by_name.get(n)), \
            mock.patch.object(
                gcpapi, "find_spec_by_cai_type",
                side_effect=lambda t: self._by_cai.get(t),
            ), \
            mock.patch("enrichers.gcp.set_gcp_credentials"):
            gcpapi.index(FakeContext())

        return writer

    def test_skips_none_lod_project(self):
        writer = self._run(
            projects=["proj-keep", "proj-skip"],
            project_lod={"proj-skip": "none"},
            accessed=["compute_instance", "gcp_sql_instances"],
        )
        # Typed compute collector ran only for the in-scope project.
        self.assertEqual(self._calls["typed"], ["proj-keep"])
        # CAI pass ran only for the in-scope project, scoped to the SQL type
        # (compute is owned by the typed pass and excluded from the filter).
        self.assertEqual(
            self._calls["cai"],
            [("proj-keep", ("sqladmin.googleapis.com/Instance",))],
        )

    def test_project_anchor_emitted_per_in_scope_project(self):
        writer = self._run(
            projects=["proj-a", "proj-b"],
            project_lod={},
            accessed=[],
        )
        # With no accessed types, only the project anchors are written (one per
        # project) and neither the typed nor CAI passes run.
        self.assertEqual(writer.add_resource.call_count, 2)
        self.assertEqual(self._calls["typed"], [])
        self.assertEqual(self._calls["cai"], [])
        for call in writer.add_resource.call_args_list:
            self.assertEqual(call.args[1], "project")  # resource_type arg

    def test_typed_excluded_from_cai_filter(self):
        # When only a typed type is accessed, the CAI pass should not run at all
        # (no generic types to fetch).
        self._run(
            projects=["proj-a"],
            project_lod={},
            accessed=["compute_instance"],
        )
        self.assertEqual(self._calls["typed"], ["proj-a"])
        self.assertEqual(self._calls["cai"], [])

    def test_generic_only_runs_cai(self):
        self._run(
            projects=["proj-a"],
            project_lod={},
            accessed=["gcp_sql_instances"],
        )
        self.assertEqual(self._calls["typed"], [])
        self.assertEqual(
            self._calls["cai"],
            [("proj-a", ("sqladmin.googleapis.com/Instance",))],
        )

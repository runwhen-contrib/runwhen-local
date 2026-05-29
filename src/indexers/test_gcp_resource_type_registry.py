"""
Unit tests for the GCP resource-type registry loader and the spec layer it
powers (``indexers.gcpapi_resource_types``).

These tests pin the contract that:

1. The loader produces a fully-populated registry from the YAML on disk
   (404 entries today, with stable metadata fields and alias resolution).

2. The hand-written typed-collector specs in ``gcpapi_resource_types`` resolve
   the legacy ``resource_type_name`` values generation rules expect
   (``project``, ``compute_instance``) and the canonical CQ table names.

3. Aliases route to the canonical CQ table name; Cloud Asset Inventory asset
   types reverse-map back to the owning table.
"""

from __future__ import annotations

import os
import sys
import tempfile
import textwrap
from pathlib import Path
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.gcp_resource_type_registry import (  # noqa: E402
    find_entry,
    load_registry,
    load_registry_from_path,
    reset_cache,
)


class RegistryLoaderTests(TestCase):
    def setUp(self) -> None:
        reset_cache()

    def tearDown(self) -> None:
        reset_cache()

    def test_default_registry_loads_with_expected_metadata(self) -> None:
        registry = load_registry()
        self.assertGreater(len(registry), 100)  # 404 today, allow for growth
        self.assertEqual(len(registry), registry.metadata.total_tables)
        self.assertGreaterEqual(registry.metadata.typed_collectors, 1)
        self.assertEqual(
            registry.metadata.generator,
            "scripts/gcp/sync_gcp_resource_type_registry.py",
        )
        self.assertTrue(
            registry.metadata.source.startswith("https://"),
            f"metadata.source should be a URL, got {registry.metadata.source!r}",
        )

    def test_registry_lookup_by_canonical_name(self) -> None:
        registry = load_registry()
        projects = registry.find("gcp_projects")
        self.assertIsNotNone(projects)
        self.assertEqual(projects.cloudquery_table_name, "gcp_projects")
        self.assertEqual(
            projects.cai_asset_type, "cloudresourcemanager.googleapis.com/Project"
        )
        self.assertTrue(projects.mandatory)
        self.assertTrue(projects.typed_collector)

    def test_registry_lookup_by_alias(self) -> None:
        registry = load_registry()
        legacy_project = registry.find("project")
        self.assertIsNotNone(legacy_project)
        self.assertEqual(legacy_project.cloudquery_table_name, "gcp_projects")

        legacy_instance = registry.find("compute_instance")
        self.assertIsNotNone(legacy_instance)
        self.assertEqual(
            legacy_instance.cloudquery_table_name, "gcp_compute_instances"
        )

    def test_registry_find_by_cai_type(self) -> None:
        registry = load_registry()
        entry = registry.find_by_cai_type("compute.googleapis.com/Instance")
        self.assertIsNotNone(entry)
        self.assertEqual(entry.cloudquery_table_name, "gcp_compute_instances")
        # Case-insensitive.
        entry2 = registry.find_by_cai_type("COMPUTE.GOOGLEAPIS.COM/INSTANCE")
        self.assertIs(entry2, entry)

    def test_registry_unknown_name_returns_none(self) -> None:
        self.assertIsNone(load_registry().find("not_a_real_table"))
        self.assertIsNone(load_registry().find(""))

    def test_module_level_find_entry_uses_cache(self) -> None:
        e1 = find_entry("project")
        e2 = find_entry("gcp_projects")
        self.assertIs(e1, e2)

    def test_membership_protocol(self) -> None:
        registry = load_registry()
        self.assertIn("project", registry)
        self.assertIn("gcp_projects", registry)
        self.assertNotIn("nope", registry)
        self.assertNotIn(123, registry)

    def test_all_cai_types_are_googleapis(self) -> None:
        registry = load_registry()
        cai_types = registry.all_cai_types()
        self.assertGreater(len(cai_types), 0)
        for value in cai_types:
            self.assertIsInstance(value, str)
            self.assertIn(".googleapis.com/", value, value)

    def test_typed_collector_tables_match_registry_flag(self) -> None:
        registry = load_registry()
        typed = set(registry.typed_collector_tables())
        for entry in registry:
            if entry.typed_collector:
                self.assertIn(entry.cloudquery_table_name, typed)
            else:
                self.assertNotIn(entry.cloudquery_table_name, typed)

    def test_mandatory_includes_projects(self) -> None:
        registry = load_registry()
        self.assertIn("gcp_projects", registry.mandatory_tables())

    def test_billing_accounts_has_no_cai_type(self) -> None:
        # Tables with no Cloud Asset Inventory equivalent are pinned to null
        # in the overrides so generic discovery skips them.
        registry = load_registry()
        entry = registry.find("gcp_billing_billing_accounts")
        self.assertIsNotNone(entry)
        self.assertIsNone(entry.cai_asset_type)


class RegistryFromTempYamlTests(TestCase):
    """Loader behavior tests that don't depend on the shipped registry."""

    def _write(self, contents: str) -> Path:
        tmp = tempfile.NamedTemporaryFile(
            "w", suffix=".yaml", delete=False, encoding="utf-8"
        )
        tmp.write(textwrap.dedent(contents))
        tmp.close()
        path = Path(tmp.name)
        self.addCleanup(path.unlink, missing_ok=True)
        return path

    def test_minimal_registry_round_trips(self) -> None:
        path = self._write(
            """
            metadata:
              source: https://example.test
              snapshot_date: 2026-01-01
              total_tables: 1
              typed_collectors: 0
              cai_types_assigned: 1
              generator: tests
              notes: synthetic
            types:
              gcp_test_widgets:
                cai_asset_type: test.googleapis.com/Widget
                cai_asset_type_source: heuristic
                category: test
                aliases: []
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        self.assertEqual(len(registry), 1)
        entry = registry.find("gcp_test_widgets")
        self.assertIsNotNone(entry)
        self.assertEqual(entry.cai_asset_type, "test.googleapis.com/Widget")

    def test_aliases_resolve_to_canonical(self) -> None:
        path = self._write(
            """
            metadata: {}
            types:
              gcp_alpha:
                cai_asset_type: a.googleapis.com/Thing
                cai_asset_type_source: heuristic
                category: a
                aliases: [legacy_alpha, vintage_alpha]
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        self.assertIs(registry.find("legacy_alpha"), registry.find("gcp_alpha"))
        self.assertIs(registry.find("vintage_alpha"), registry.find("gcp_alpha"))

    def test_alias_collision_raises(self) -> None:
        path = self._write(
            """
            metadata: {}
            types:
              gcp_alpha:
                cai_asset_type: a.googleapis.com/Thing
                aliases: [shared]
                typed_collector: false
                mandatory: false
              gcp_beta:
                cai_asset_type: b.googleapis.com/Thing
                aliases: [shared]
                typed_collector: false
                mandatory: false
            """
        )
        with self.assertRaises(ValueError):
            load_registry_from_path(path)

    def test_missing_file_raises_filenotfound(self) -> None:
        with self.assertRaises(FileNotFoundError):
            load_registry_from_path(Path("/nonexistent/registry.yaml"))

    def test_null_cai_type_is_allowed(self) -> None:
        path = self._write(
            """
            metadata: {}
            types:
              gcp_no_asset:
                cai_asset_type: null
                cai_asset_type_source: null
                category: x
                aliases: []
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        entry = registry.find("gcp_no_asset")
        self.assertIsNotNone(entry)
        self.assertIsNone(entry.cai_asset_type)
        # A null cai type must not be indexed for reverse lookup.
        self.assertIsNone(registry.find_by_cai_type(None))


class GcpapiResourceTypesSpecTests(TestCase):
    """The spec layer must surface the legacy ``resource_type_name`` values
    generation rules know about and bind the SDK collectors."""

    def setUp(self) -> None:
        reset_cache()
        import importlib

        import indexers.gcpapi_resource_types as mod

        self.mod = importlib.reload(mod)

    def test_typed_sdk_collectors_present(self) -> None:
        # The set of tables with a hand-written google-cloud-* collector.
        names = {s.cloudquery_table_name for s in self.mod.GCP_TYPED_RESOURCE_TYPE_SPECS}
        self.assertEqual(
            names,
            {
                "gcp_compute_instances",
                "gcp_storage_buckets",
                "gcp_container_clusters",
            },
        )

    def test_project_spec_is_first_and_mandatory(self) -> None:
        first = self.mod.GCP_RESOURCE_TYPE_SPECS[0]
        self.assertEqual(first.resource_type_name, "project")
        self.assertEqual(first.cloudquery_table_name, "gcp_projects")
        self.assertTrue(first.mandatory)

    def test_legacy_short_names_resolve_via_find_spec(self) -> None:
        spec = self.mod.find_spec("project")
        self.assertIsNotNone(spec)
        self.assertEqual(spec.cloudquery_table_name, "gcp_projects")

        inst = self.mod.find_spec("compute_instance")
        self.assertIsNotNone(inst)
        self.assertEqual(inst.cloudquery_table_name, "gcp_compute_instances")

    def test_find_spec_by_cai_type(self) -> None:
        spec = self.mod.find_spec_by_cai_type("storage.googleapis.com/Bucket")
        self.assertIsNotNone(spec)
        self.assertEqual(spec.cloudquery_table_name, "gcp_storage_buckets")

    def test_unknown_name_returns_none(self) -> None:
        self.assertIsNone(self.mod.find_spec("totally_made_up"))
        self.assertIsNone(self.mod.find_spec(""))

    def test_typed_specs_have_callable_collectors(self) -> None:
        for spec in self.mod.GCP_TYPED_RESOURCE_TYPE_SPECS:
            self.assertTrue(callable(spec.collector), spec.cloudquery_table_name)

    def test_generic_specs_have_no_collector(self) -> None:
        # A type with a CAI mapping but no SDK collector (e.g. sql instances)
        # is materialized as a generic spec the CAI pass owns.
        spec = self.mod.find_spec("gcp_sql_instances")
        self.assertIsNotNone(spec)
        self.assertIsNone(spec.collector)
        self.assertEqual(spec.cai_asset_type, "sqladmin.googleapis.com/Instance")

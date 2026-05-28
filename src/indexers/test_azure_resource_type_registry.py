"""
Unit tests for the Azure resource-type registry loader and the back-compat
shim it powers (``indexers.azureapi_resource_types``).

These tests pin the contract that:

1. The loader produces a fully-populated registry from the YAML on disk
   (619 entries today, with stable metadata fields and alias resolution).

2. The hand-written typed-collector specs in ``azureapi_resource_types``
   stay byte-compatible with what generation rules expect:
   ``resource_group``, ``virtual_machine``, ``azure_keyvault_vaults``,
   ``azure_storage_accounts`` etc. all still resolve via ``find_spec``.

3. Aliases route to the canonical CQ table name in both directions: legacy
   short names (``resource_group``) and renamed CQ tables
   (``azure_keyvault_vaults`` -> ``azure_keyvault_keyvaults``).
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

from indexers.azure_resource_type_registry import (  # noqa: E402
    AzureResourceTypeEntry,
    AzureResourceTypeRegistry,
    AzureRegistryMetadata,
    find_entry,
    load_registry,
    load_registry_from_path,
    reset_cache,
)


class RegistryLoaderTests(TestCase):
    def setUp(self) -> None:
        # Each test starts from a clean cache so module-level state doesn't
        # leak between tests (e.g. a temp-file load shouldn't poison the
        # default-path cache).
        reset_cache()

    def tearDown(self) -> None:
        reset_cache()

    def test_default_registry_loads_with_expected_metadata(self) -> None:
        registry = load_registry()
        self.assertGreater(len(registry), 100)  # 619 today, allow for growth
        self.assertEqual(len(registry), registry.metadata.total_tables)
        self.assertGreaterEqual(registry.metadata.typed_collectors, 1)
        self.assertEqual(
            registry.metadata.generator,
            "scripts/azure/sync_azure_resource_type_registry.py",
        )
        self.assertTrue(
            registry.metadata.source.startswith("https://"),
            f"metadata.source should be a URL, got {registry.metadata.source!r}",
        )

    def test_registry_lookup_by_canonical_name(self) -> None:
        registry = load_registry()
        rg = registry.find("azure_resources_resource_groups")
        self.assertIsNotNone(rg)
        self.assertEqual(rg.cloudquery_table_name, "azure_resources_resource_groups")
        self.assertEqual(rg.arm_type, "Microsoft.Resources/resourceGroups")
        self.assertTrue(rg.mandatory)
        self.assertTrue(rg.typed_collector)

    def test_registry_lookup_by_alias(self) -> None:
        registry = load_registry()
        legacy = registry.find("resource_group")
        self.assertIsNotNone(legacy)
        self.assertEqual(legacy.cloudquery_table_name, "azure_resources_resource_groups")

        legacy_vm = registry.find("virtual_machine")
        self.assertIsNotNone(legacy_vm)
        self.assertEqual(legacy_vm.cloudquery_table_name, "azure_compute_virtual_machines")

    def test_registry_keyvault_alias_routes_to_canonical_cq_name(self) -> None:
        # The canonical CQ table is ``azure_keyvault_keyvaults``;
        # ``azure_keyvault_vaults`` is the legacy alias RWL used to ship.
        registry = load_registry()
        canonical = registry.find("azure_keyvault_keyvaults")
        self.assertIsNotNone(canonical)
        alias = registry.find("azure_keyvault_vaults")
        self.assertIs(alias, canonical)
        self.assertEqual(canonical.arm_type, "Microsoft.KeyVault/vaults")

    def test_registry_unknown_name_returns_none(self) -> None:
        self.assertIsNone(load_registry().find("not_a_real_table"))
        self.assertIsNone(load_registry().find(""))

    def test_module_level_find_entry_uses_cache(self) -> None:
        e1 = find_entry("resource_group")
        e2 = find_entry("azure_resources_resource_groups")
        self.assertIs(e1, e2)  # alias and canonical return the same object

    def test_membership_protocol(self) -> None:
        registry = load_registry()
        self.assertIn("resource_group", registry)
        self.assertIn("azure_resources_resource_groups", registry)
        self.assertNotIn("nope", registry)
        self.assertNotIn(123, registry)  # non-string in -> False, never raises

    def test_all_arm_types_returns_unique_strings(self) -> None:
        registry = load_registry()
        arm_types = registry.all_arm_types()
        self.assertGreater(len(arm_types), 0)
        for value in arm_types:
            self.assertIsInstance(value, str)
            self.assertTrue(value.startswith("Microsoft."), value)

    def test_typed_collector_tables_match_registry_flag(self) -> None:
        registry = load_registry()
        typed = set(registry.typed_collector_tables())
        for entry in registry:
            if entry.typed_collector:
                self.assertIn(entry.cloudquery_table_name, typed)
            else:
                self.assertNotIn(entry.cloudquery_table_name, typed)

    def test_mandatory_includes_resource_groups(self) -> None:
        registry = load_registry()
        mandatory = registry.mandatory_tables()
        self.assertIn("azure_resources_resource_groups", mandatory)


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
              arm_types_assigned: 1
              generator: tests
              notes: synthetic
            types:
              azure_test_widgets:
                arm_type: Microsoft.Test/widgets
                arm_type_source: heuristic
                category: test
                aliases: []
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        self.assertEqual(len(registry), 1)
        entry = registry.find("azure_test_widgets")
        self.assertIsNotNone(entry)
        self.assertEqual(entry.arm_type, "Microsoft.Test/widgets")

    def test_aliases_resolve_to_canonical(self) -> None:
        path = self._write(
            """
            metadata: {}
            types:
              azure_alpha:
                arm_type: Microsoft.A/things
                arm_type_source: heuristic
                category: a
                aliases: [legacy_alpha, vintage_alpha]
                typed_collector: false
                mandatory: false
              azure_beta:
                arm_type: Microsoft.B/things
                arm_type_source: heuristic
                category: b
                aliases: []
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        self.assertIs(registry.find("legacy_alpha"), registry.find("azure_alpha"))
        self.assertIs(registry.find("vintage_alpha"), registry.find("azure_alpha"))

    def test_alias_collision_raises(self) -> None:
        path = self._write(
            """
            metadata: {}
            types:
              azure_alpha:
                arm_type: Microsoft.A/things
                arm_type_source: heuristic
                category: a
                aliases: [shared]
                typed_collector: false
                mandatory: false
              azure_beta:
                arm_type: Microsoft.B/things
                arm_type_source: heuristic
                category: b
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

    def test_metadata_defaults_when_omitted(self) -> None:
        path = self._write(
            """
            types:
              azure_solo:
                arm_type: Microsoft.X/y
                arm_type_source: heuristic
                category: x
                aliases: []
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        self.assertEqual(registry.metadata.total_tables, 0)
        self.assertIsNone(registry.metadata.source)


class AzureapiResourceTypesShimTests(TestCase):
    """The hand-written collector specs must surface the legacy
    ``resource_type_name`` values generation rules know about."""

    def setUp(self) -> None:
        reset_cache()
        # Reload the shim module so AZURE_RESOURCE_TYPE_SPECS is rebuilt
        # against the fresh registry.
        import importlib

        import indexers.azureapi_resource_types as mod

        self.mod = importlib.reload(mod)

    def test_typed_collectors_present(self) -> None:
        # Pin the full set of CloudQuery tables that have a hand-written
        # ``azure-mgmt-*`` collector. Whenever a new SDK collector is added
        # in ``azureapi_resource_types`` (and registered via the overrides),
        # this set should grow accordingly.
        #
        # ``AZURE_RESOURCE_TYPE_SPECS`` now contains one entry per registry
        # row (typed *and* generic-catch-all specs), so we filter to the
        # typed slice for this assertion.
        names = {
            s.cloudquery_table_name
            for s in self.mod.AZURE_RESOURCE_TYPE_SPECS
            if s.typed
        }
        self.assertEqual(
            names,
            {
                # Bootstrap (no per-RG endpoint exists for resource groups).
                "azure_resources_resource_groups",
                # Compute.
                "azure_compute_virtual_machines",
                "azure_compute_disks",
                "azure_compute_snapshots",
                "azure_compute_virtual_machine_scale_sets",
                # Storage / KeyVault.
                "azure_storage_accounts",
                "azure_keyvault_keyvaults",
                # Network.
                "azure_network_virtual_networks",
                "azure_network_security_groups",
                "azure_network_load_balancers",
                "azure_network_application_gateways",
                # Container service.
                "azure_containerservice_managed_clusters",
                "azure_containerregistry_registries",
                # Subscription as a top-level resource.
                "azure_subscription_subscriptions",
                # App Service.
                "azure_appservice_plans",
                "azure_appservice_web_apps",
                # RDBMS family.
                "azure_mysql_servers",
                "azure_mysqlflexibleservers_servers",
                "azure_postgresql_databases",
                # One-off SDKs.
                "azure_redis_caches",
                "azure_servicebus_namespaces",
                "azure_datafactory_factories",
                "azure_apimanagement_service",
                "azure_cosmos_sql_databases",
                "azure_azurearcdata_sql_server_instances",
            },
        )

    def test_resource_group_is_first_and_mandatory(self) -> None:
        first = self.mod.AZURE_RESOURCE_TYPE_SPECS[0]
        self.assertEqual(first.resource_type_name, "resource_group")
        self.assertEqual(first.cloudquery_table_name, "azure_resources_resource_groups")
        self.assertTrue(first.mandatory)

    def test_legacy_short_names_resolve_via_find_spec(self) -> None:
        spec = self.mod.find_spec("resource_group")
        self.assertIsNotNone(spec)
        self.assertEqual(spec.cloudquery_table_name, "azure_resources_resource_groups")

        vm = self.mod.find_spec("virtual_machine")
        self.assertIsNotNone(vm)
        self.assertEqual(vm.cloudquery_table_name, "azure_compute_virtual_machines")

    def test_canonical_cq_name_resolves_via_find_spec(self) -> None:
        # ``azure_keyvault_keyvaults`` is the canonical CQ name; the legacy
        # RWL spec name was ``azure_keyvault_vaults``.
        canonical = self.mod.find_spec("azure_keyvault_keyvaults")
        self.assertIsNotNone(canonical)
        self.assertEqual(canonical.cloudquery_table_name, "azure_keyvault_keyvaults")

        legacy = self.mod.find_spec("azure_keyvault_vaults")
        self.assertIs(legacy, canonical)
        self.assertEqual(legacy.resource_type_name, "azure_keyvault_vaults")

    def test_unknown_name_returns_none(self) -> None:
        self.assertIsNone(self.mod.find_spec("totally_made_up"))
        self.assertIsNone(self.mod.find_spec(""))

    def test_collector_callables_are_callable(self) -> None:
        for spec in self.mod.AZURE_RESOURCE_TYPE_SPECS:
            self.assertTrue(callable(spec.collector), spec.cloudquery_table_name)

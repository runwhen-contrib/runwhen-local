"""
Unit tests for the selective-indexing helpers in ``indexers.azureapi``.

Coverage:
* ``_extract_rg_name_from_arm_id`` and ``_extract_subscription_id_from_arm_id``
  parse the ARM resource ID grammar correctly (case-insensitive markers,
  preserves value casing, tolerates missing pieces).
* ``_compute_effective_lod`` mirrors the lookup chain documented in
  ``AzurePlatformHandler.parse_resource_data``.
* ``_resource_is_in_scope`` returns False iff the effective LOD resolves to
  ``LevelOfDetail.NONE``, dropping out-of-scope resources before they reach
  the writer.

The tests deliberately operate on the helper functions directly rather than
running the whole ``index()`` pipeline so they stay fast and don't require
any Azure SDK clients or stubs.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from enrichers.generation_rule_types import LevelOfDetail  # noqa: E402

from indexers.azureapi import (  # noqa: E402
    _build_subscription_rg_lod_map,
    _compute_effective_lod,
    _extract_rg_name_from_arm_id,
    _extract_subscription_id_from_arm_id,
    _resource_is_in_scope,
    _rgs_in_scope_from_config,
    _safe_lod,
)
from indexers.azureapi_resource_types import (  # noqa: E402
    AZURE_RESOURCE_TYPE_SPECS,
    AzureResourceTypeSpec,
    find_spec,
    find_spec_by_arm_type,
)


_KEEP_ARM_ID = (
    "/subscriptions/abc-123/resourceGroups/keepRG"
    "/providers/Microsoft.Storage/storageAccounts/keep"
)
_DROP_ARM_ID = (
    "/subscriptions/abc-123/resourceGroups/dropRG"
    "/providers/Microsoft.Storage/storageAccounts/drop"
)


class ArmIdParserTests(TestCase):

    def test_extract_rg_basic(self) -> None:
        self.assertEqual(_extract_rg_name_from_arm_id(_KEEP_ARM_ID), "keepRG")

    def test_extract_rg_case_insensitive_marker_preserves_value_case(self) -> None:
        # Real-world Azure IDs occasionally use ``resourceGroups`` casing
        # variations; the marker match must be case-insensitive but the
        # extracted value must preserve casing for registry lookups.
        arm = (
            "/SUBSCRIPTIONS/SUB/RESOURCEGROUPS/MixedCaseRG"
            "/providers/Microsoft.Storage/storageAccounts/x"
        )
        self.assertEqual(_extract_rg_name_from_arm_id(arm), "MixedCaseRG")

    def test_extract_rg_handles_trailing_rg_only(self) -> None:
        arm = "/subscriptions/sub/resourceGroups/onlyRG"
        self.assertEqual(_extract_rg_name_from_arm_id(arm), "onlyRG")

    def test_extract_rg_returns_none_for_missing_marker(self) -> None:
        self.assertIsNone(_extract_rg_name_from_arm_id(""))
        self.assertIsNone(_extract_rg_name_from_arm_id(None))
        self.assertIsNone(_extract_rg_name_from_arm_id("/subscriptions/sub/whatever"))

    def test_extract_subscription_basic(self) -> None:
        self.assertEqual(_extract_subscription_id_from_arm_id(_KEEP_ARM_ID), "abc-123")

    def test_extract_subscription_case_insensitive_marker(self) -> None:
        arm = "/SUBSCRIPTIONS/sub-xyz/resourceGroups/rg"
        self.assertEqual(_extract_subscription_id_from_arm_id(arm), "sub-xyz")

    def test_extract_subscription_returns_none_for_garbage(self) -> None:
        self.assertIsNone(_extract_subscription_id_from_arm_id("/no/markers/here"))
        self.assertIsNone(_extract_subscription_id_from_arm_id(None))


class LevelOfDetailLookupTests(TestCase):

    def _platform_cfg_with_subscriptions(self) -> dict:
        # Mimic the workspaceInfo "subscriptions" block; the per-subscription
        # ``defaultLOD: none`` is what makes "drop everything not explicitly
        # whitelisted" work.
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "none",
            "subscriptions": [
                {
                    "subscriptionId": "abc-123",
                    "defaultLOD": "none",
                    "resourceGroupLevelOfDetails": {
                        "keepRG": "detailed",
                        "dropRG": "none",
                    },
                }
            ],
        }
        _build_subscription_rg_lod_map(cfg)
        return cfg

    def test_keep_rg_resolves_detailed(self) -> None:
        cfg = self._platform_cfg_with_subscriptions()
        self.assertEqual(
            _compute_effective_lod(cfg, "abc-123", "keepRG", LevelOfDetail.BASIC),
            LevelOfDetail.DETAILED,
        )

    def test_drop_rg_resolves_none(self) -> None:
        cfg = self._platform_cfg_with_subscriptions()
        self.assertEqual(
            _compute_effective_lod(cfg, "abc-123", "dropRG", LevelOfDetail.BASIC),
            LevelOfDetail.NONE,
        )

    def test_unknown_rg_under_known_sub_uses_per_sub_default(self) -> None:
        # The per-subscription ``defaultLOD: none`` is stuffed into ``sub_map["*"]``
        # so unknown RGs in that subscription inherit it.
        cfg = self._platform_cfg_with_subscriptions()
        self.assertEqual(
            _compute_effective_lod(cfg, "abc-123", "noSuchRG", LevelOfDetail.BASIC),
            LevelOfDetail.NONE,
        )

    def test_unknown_subscription_falls_through_to_default(self) -> None:
        cfg = self._platform_cfg_with_subscriptions()
        self.assertEqual(
            _compute_effective_lod(cfg, "different-sub", "anyRG", LevelOfDetail.BASIC),
            LevelOfDetail.BASIC,
        )

    def test_top_level_lod_map_with_explicit_overrides(self) -> None:
        # Top-level (no subscriptions list): only ``resourceGroupLevelOfDetails``
        # is fed into the LOD map; the workspace ``defaultLOD`` falls through
        # to the default arg.
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "detailed",
            "resourceGroupLevelOfDetails": {"keepRG": "detailed"},
        }
        _build_subscription_rg_lod_map(cfg)
        self.assertEqual(
            _compute_effective_lod(cfg, "abc-123", "keepRG", LevelOfDetail.BASIC),
            LevelOfDetail.DETAILED,
        )
        # Unknown RG falls through to the default arg passed in.
        self.assertEqual(
            _compute_effective_lod(cfg, "abc-123", "noSuchRG", LevelOfDetail.BASIC),
            LevelOfDetail.BASIC,
        )

    def test_invalid_lod_string_falls_back_to_default(self) -> None:
        cfg = {
            "subscriptionResourceGroupLevelOfDetails": {
                "abc-123": {"weirdRG": "garbage"}
            }
        }
        self.assertEqual(
            _compute_effective_lod(cfg, "abc-123", "weirdRG", LevelOfDetail.BASIC),
            LevelOfDetail.BASIC,
        )


class ResourceIsInScopeTests(TestCase):

    def _cfg(self) -> dict:
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "none",
            "subscriptions": [
                {
                    "subscriptionId": "abc-123",
                    "defaultLOD": "none",
                    "resourceGroupLevelOfDetails": {
                        "keepRG": "detailed",
                        "dropRG": "none",
                    },
                }
            ],
        }
        _build_subscription_rg_lod_map(cfg)
        return cfg

    def test_storage_under_keep_rg_in_scope(self) -> None:
        in_scope, lod = _resource_is_in_scope(
            self._cfg(),
            {"id": _KEEP_ARM_ID, "name": "keep"},
            "azure_storage_accounts",
            "abc-123",
            LevelOfDetail.BASIC,
        )
        self.assertTrue(in_scope)
        self.assertEqual(lod, LevelOfDetail.DETAILED)

    def test_storage_under_drop_rg_out_of_scope(self) -> None:
        in_scope, lod = _resource_is_in_scope(
            self._cfg(),
            {"id": _DROP_ARM_ID, "name": "drop"},
            "azure_storage_accounts",
            "abc-123",
            LevelOfDetail.BASIC,
        )
        self.assertFalse(in_scope)
        self.assertEqual(lod, LevelOfDetail.NONE)

    def test_resource_group_keep_in_scope(self) -> None:
        in_scope, lod = _resource_is_in_scope(
            self._cfg(),
            {
                "id": "/subscriptions/abc-123/resourceGroups/keepRG",
                "name": "keepRG",
            },
            "resource_group",
            "abc-123",
            LevelOfDetail.BASIC,
        )
        self.assertTrue(in_scope)
        self.assertEqual(lod, LevelOfDetail.DETAILED)

    def test_resource_group_drop_out_of_scope(self) -> None:
        in_scope, lod = _resource_is_in_scope(
            self._cfg(),
            {
                "id": "/subscriptions/abc-123/resourceGroups/dropRG",
                "name": "dropRG",
            },
            "resource_group",
            "abc-123",
            LevelOfDetail.BASIC,
        )
        self.assertFalse(in_scope)
        self.assertEqual(lod, LevelOfDetail.NONE)

    def test_subscription_resources_always_in_scope(self) -> None:
        # Subscription resources are never dropped at the index layer because
        # downstream code (rendering / RG attribution) needs them.
        in_scope, lod = _resource_is_in_scope(
            self._cfg(),
            {"id": "/subscriptions/abc-123", "name": "abc-123"},
            "azure_subscription_subscriptions",
            "abc-123",
            LevelOfDetail.BASIC,
        )
        self.assertTrue(in_scope)
        self.assertEqual(lod, LevelOfDetail.BASIC)

    def test_unknown_subscription_uses_default(self) -> None:
        # Resources whose subscription isn't in the LOD map at all fall
        # through to the workspace default; if the default is BASIC they
        # remain in scope.
        in_scope, lod = _resource_is_in_scope(
            self._cfg(),
            {
                "id": "/subscriptions/different-sub/resourceGroups/anyRG"
                      "/providers/Microsoft.Storage/storageAccounts/x",
                "name": "x",
            },
            "azure_storage_accounts",
            "different-sub",
            LevelOfDetail.BASIC,
        )
        self.assertTrue(in_scope)
        self.assertEqual(lod, LevelOfDetail.BASIC)


class DiscoveryScopeTests(TestCase):
    """``_rgs_in_scope_from_config`` decides whether the indexer should
    enumerate per-RG (finite list returned) or subscription-wide (None).
    These tests pin the contract that selective discovery is triggered
    only when *every* escape hatch (per-sub wildcard, global wildcard,
    workspace default) resolves to NONE."""

    def test_selective_mode_returns_finite_rg_list(self) -> None:
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "none",
            "subscriptions": [
                {
                    "subscriptionId": "abc-123",
                    "defaultLOD": "none",
                    "resourceGroupLevelOfDetails": {
                        "keepRG": "detailed",
                        "alsoKeep": "basic",
                        "dropRG": "none",
                    },
                }
            ],
        }
        _build_subscription_rg_lod_map(cfg)
        rgs = _rgs_in_scope_from_config(cfg, "abc-123", LevelOfDetail.NONE)
        self.assertIsNotNone(rgs)
        self.assertEqual(sorted(rgs), ["alsoKeep", "keepRG"])

    def test_default_lod_basic_returns_none(self) -> None:
        cfg = {"subscriptionId": "abc-123", "defaultLOD": "basic"}
        _build_subscription_rg_lod_map(cfg)
        self.assertIsNone(
            _rgs_in_scope_from_config(cfg, "abc-123", LevelOfDetail.BASIC)
        )

    def test_default_lod_detailed_returns_none(self) -> None:
        cfg = {"subscriptionId": "abc-123", "defaultLOD": "detailed"}
        _build_subscription_rg_lod_map(cfg)
        self.assertIsNone(
            _rgs_in_scope_from_config(cfg, "abc-123", LevelOfDetail.DETAILED)
        )

    def test_per_sub_wildcard_non_none_returns_none(self) -> None:
        # Top-level defaultLOD is none, but the per-subscription default is
        # 'basic' so the subscription-wide wildcard kicks in.
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "none",
            "subscriptions": [
                {
                    "subscriptionId": "abc-123",
                    "defaultLOD": "basic",
                    "resourceGroupLevelOfDetails": {"keepRG": "detailed"},
                }
            ],
        }
        _build_subscription_rg_lod_map(cfg)
        self.assertIsNone(
            _rgs_in_scope_from_config(cfg, "abc-123", LevelOfDetail.NONE)
        )

    def test_global_wildcard_non_none_returns_none(self) -> None:
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "none",
            "resourceGroupLevelOfDetails": {"*": "detailed", "keepRG": "detailed"},
        }
        _build_subscription_rg_lod_map(cfg)
        self.assertIsNone(
            _rgs_in_scope_from_config(cfg, "abc-123", LevelOfDetail.NONE)
        )

    def test_legacy_top_level_rg_overrides_promote_to_in_scope(self) -> None:
        # No subscriptions[]; user uses the legacy top-level
        # resourceGroupLevelOfDetails dict + defaultLOD: none.
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "none",
            "resourceGroupLevelOfDetails": {"oldStyleRG": "detailed"},
        }
        _build_subscription_rg_lod_map(cfg)
        rgs = _rgs_in_scope_from_config(cfg, "abc-123", LevelOfDetail.NONE)
        self.assertIsNotNone(rgs)
        self.assertEqual(rgs, ["oldStyleRG"])

    def test_explicit_none_override_excluded_from_finite_list(self) -> None:
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "none",
            "subscriptions": [
                {
                    "subscriptionId": "abc-123",
                    "defaultLOD": "none",
                    "resourceGroupLevelOfDetails": {
                        "keepRG": "detailed",
                        "dropRG": "none",
                    },
                }
            ],
        }
        _build_subscription_rg_lod_map(cfg)
        rgs = _rgs_in_scope_from_config(cfg, "abc-123", LevelOfDetail.NONE)
        self.assertEqual(rgs, ["keepRG"])
        self.assertNotIn("dropRG", rgs)

    def test_no_overrides_at_all_returns_empty_list(self) -> None:
        # When defaultLOD is none and no per-RG overrides exist anywhere,
        # selective discovery resolves to "discover nothing". This is
        # behaviorally identical to "discover everything and drop everything"
        # but burns zero SDK calls.
        cfg = {
            "subscriptionId": "abc-123",
            "defaultLOD": "none",
        }
        _build_subscription_rg_lod_map(cfg)
        rgs = _rgs_in_scope_from_config(cfg, "abc-123", LevelOfDetail.NONE)
        self.assertEqual(rgs, [])

    def test_unknown_subscription_falls_through_to_default(self) -> None:
        cfg = {"subscriptionId": "abc-123", "defaultLOD": "detailed"}
        _build_subscription_rg_lod_map(cfg)
        # An unknown subscription with workspace default 'detailed' is
        # subscription-wide.
        self.assertIsNone(
            _rgs_in_scope_from_config(cfg, "no-such-sub", LevelOfDetail.DETAILED)
        )
        # But with workspace default 'none', the unknown sub also hits the
        # default-NONE branch and resolves to "selective with empty list".
        self.assertEqual(
            _rgs_in_scope_from_config(cfg, "no-such-sub", LevelOfDetail.NONE),
            [],
        )

    def test_safe_lod_helpers(self) -> None:
        self.assertIsNone(_safe_lod(None))
        self.assertIsNone(_safe_lod("garbage"))
        self.assertEqual(_safe_lod("none"), LevelOfDetail.NONE)
        self.assertEqual(_safe_lod("DETAILED"), LevelOfDetail.DETAILED)
        # Already-an-enum input is fine.
        self.assertEqual(_safe_lod(LevelOfDetail.BASIC), LevelOfDetail.BASIC)


class DiscoveryDispatchTests(TestCase):
    """End-to-end ``index()`` invocations with stubbed collectors, asserting
    that selective discovery actually calls per-RG SDK methods (not the
    subscription-wide ones) when the workspaceInfo declares a finite scope.

    The test wires:
      * a fake azureapi backend setting,
      * a stub credentials provider,
      * stubbed ``collector_all`` and ``collector_in_rg`` callables that
        record their invocations.

    What we assert:
      * In selective mode, ``collector_in_rg`` is called exactly for the
        whitelisted RGs and ``collector_all`` is *not* called for the spec.
      * In subscription-wide mode, the inverse holds.
      * Resource-group enumeration always uses ``collector_all`` (RGs have
        no per-RG endpoint).
    """

    def setUp(self) -> None:
        self._calls = {"all": [], "in_rg": []}

    def _make_spec(self, *, supports_in_rg: bool = True):
        """Build a minimal AzureResourceTypeSpec with stubbed collectors."""
        from indexers.azureapi_resource_types import AzureResourceTypeSpec

        def _fake_all(credential, subscription_id):
            self._calls["all"].append((subscription_id,))
            return []

        def _fake_in_rg(credential, subscription_id, rg_name):
            self._calls["in_rg"].append((subscription_id, rg_name))
            return []

        return AzureResourceTypeSpec(
            resource_type_name="azure_storage_accounts",
            cloudquery_table_name="azure_storage_accounts",
            # Mandatory in the test so we don't have to wire up the
            # generation-rule access list; production specs gate via
            # ``RESOURCE_TYPE_SPECS_PROPERTY`` on the context.
            mandatory=True,
            collector_all=_fake_all,
            collector_in_rg=_fake_in_rg if supports_in_rg else None,
        )

    def _make_rg_spec(self):
        from indexers.azureapi_resource_types import AzureResourceTypeSpec

        def _fake_rg_list(credential, subscription_id):
            self._calls["all"].append((subscription_id, "rg-list"))
            return []

        return AzureResourceTypeSpec(
            resource_type_name="resource_group",
            cloudquery_table_name="azure_resources_resource_groups",
            mandatory=True,
            collector_all=_fake_rg_list,
            collector_in_rg=None,
        )

    def _run_index(self, *, platform_cfg, specs, subscription_ids):
        """Drive ``index()`` with patched dependencies. Returns the indexer's
        captured stats dict."""
        from unittest import mock

        from indexers import azureapi

        captured_stats = {}

        # The indexer reads several context settings + helpers; patch the
        # exact pieces it touches and let everything else stay real.
        with mock.patch.object(azureapi, "AZURE_RESOURCE_TYPE_SPECS", tuple(specs)), \
             mock.patch.object(
                 azureapi, "az_get_credentials_and_subscription_id",
                 return_value={
                     "credential": object(),
                     "subscription_ids": list(subscription_ids),
                     "AZURE_TENANT_ID": "t",
                     "AZURE_CLIENT_ID": "c",
                     "AZURE_CLIENT_SECRET": "s",
                 },
             ), \
             mock.patch.object(azureapi, "_resolve_platform_handler") as resolve_handler, \
             mock.patch.object(azureapi, "get_resource_writer") as get_writer, \
             mock.patch.object(azureapi, "find_spec") as find_spec_mock, \
             mock.patch("enrichers.azure.set_azure_credentials"):

            # parse_resource_data is bypassed by our stub collectors returning
            # empty lists (no models -> no parse calls).
            resolve_handler.return_value = mock.MagicMock()
            writer = mock.MagicMock()
            get_writer.return_value = writer
            # Pretend every spec the test cares about is registered.
            find_spec_mock.side_effect = lambda name: next(
                (s for s in specs
                 if s.resource_type_name == name or s.cloudquery_table_name == name),
                None,
            )

            # Build a Context that returns our cloud_config + indexer backend.
            class FakeContext:
                def __init__(self, platform_cfg):
                    self._cloud_cfg = {"azure": dict(platform_cfg)}
                    self._properties = {}

                def get_setting(self, setting):
                    name = getattr(setting, "env_var", None) or getattr(setting, "name", "")
                    if name == "AZURE_INDEXER_BACKEND":
                        return "azureapi"
                    if name == "CLOUD_CONFIG":
                        return self._cloud_cfg
                    if name == "RESOURCE_STORE_BACKEND":
                        return "memory"
                    if name == "RESOURCE_STORE_PATH":
                        return None
                    if name == "DEFAULT_LOD":
                        return None
                    return None

                def get_property(self, name):
                    return self._properties.get(name)

                def add_warning(self, msg):
                    pass

            ctx = FakeContext(platform_cfg)
            azureapi.index(ctx)

            captured_stats["writer_calls"] = writer.add_resource.call_count

        return captured_stats

    def test_selective_mode_uses_per_rg_collector(self) -> None:
        rg_spec = self._make_rg_spec()
        storage_spec = self._make_spec(supports_in_rg=True)

        platform_cfg = {
            "subscriptionId": "sub-A",
            "defaultLOD": "none",
            "subscriptions": [
                {
                    "subscriptionId": "sub-A",
                    "defaultLOD": "none",
                    "resourceGroupLevelOfDetails": {
                        "keepA": "detailed",
                        "keepB": "basic",
                    },
                }
            ],
        }

        self._run_index(
            platform_cfg=platform_cfg,
            specs=[rg_spec, storage_spec],
            subscription_ids=["sub-A"],
        )

        # RG enumeration always uses collector_all.
        self.assertIn(("sub-A", "rg-list"), self._calls["all"])
        # Storage discovery should be per-RG, exactly for keepA + keepB.
        self.assertEqual(
            sorted(self._calls["in_rg"]),
            [("sub-A", "keepA"), ("sub-A", "keepB")],
        )
        # And the subscription-wide storage list endpoint was NOT hit.
        self.assertNotIn(("sub-A",), self._calls["all"])

    def test_unbounded_mode_uses_subscription_wide_collector(self) -> None:
        rg_spec = self._make_rg_spec()
        storage_spec = self._make_spec(supports_in_rg=True)

        platform_cfg = {
            "subscriptionId": "sub-A",
            "defaultLOD": "detailed",
        }

        self._run_index(
            platform_cfg=platform_cfg,
            specs=[rg_spec, storage_spec],
            subscription_ids=["sub-A"],
        )

        self.assertIn(("sub-A", "rg-list"), self._calls["all"])
        self.assertIn(("sub-A",), self._calls["all"])
        self.assertEqual(self._calls["in_rg"], [])

    def test_selective_mode_falls_back_to_all_when_no_per_rg_collector(self) -> None:
        """A spec that opted out of per-RG collection still works: the
        indexer falls back to ``collector_all`` and emits a warning."""
        rg_spec = self._make_rg_spec()
        opted_out_spec = self._make_spec(supports_in_rg=False)

        platform_cfg = {
            "subscriptionId": "sub-A",
            "defaultLOD": "none",
            "subscriptions": [
                {
                    "subscriptionId": "sub-A",
                    "defaultLOD": "none",
                    "resourceGroupLevelOfDetails": {"keepA": "detailed"},
                }
            ],
        }

        self._run_index(
            platform_cfg=platform_cfg,
            specs=[rg_spec, opted_out_spec],
            subscription_ids=["sub-A"],
        )

        # subscription-wide list_all was called for the opted-out spec.
        self.assertIn(("sub-A",), self._calls["all"])
        # and per-RG was NOT called (no callable to call).
        self.assertEqual(self._calls["in_rg"], [])

    def test_new_typed_collectors_are_registered(self) -> None:
        """Lock in the comprehensive collector coverage added in the
        Bucket A/B/C/D pass: every CQ table that the indexer is supposed
        to have a typed collector for must show up in
        ``AZURE_RESOURCE_TYPE_SPECS`` and resolve via ``find_spec``.

        Failing this test means the registry / overrides / dispatch dict
        have drifted out of sync with one another.
        """
        from indexers.azureapi_resource_types import (
            AZURE_RESOURCE_TYPE_SPECS,
            find_spec,
        )

        expected_typed_tables = {
            "azure_apimanagement_service",
            "azure_appservice_plans",
            "azure_appservice_web_apps",
            "azure_azurearcdata_sql_server_instances",
            "azure_compute_disks",
            "azure_compute_snapshots",
            "azure_compute_virtual_machine_scale_sets",
            "azure_compute_virtual_machines",
            "azure_containerregistry_registries",
            "azure_containerservice_managed_clusters",
            "azure_cosmos_sql_databases",
            "azure_datafactory_factories",
            "azure_keyvault_keyvaults",
            "azure_mysql_servers",
            "azure_mysqlflexibleservers_servers",
            "azure_network_application_gateways",
            "azure_network_load_balancers",
            "azure_network_security_groups",
            "azure_network_virtual_networks",
            "azure_postgresql_databases",
            "azure_redis_caches",
            "azure_resources_resource_groups",
            "azure_servicebus_namespaces",
            "azure_storage_accounts",
            "azure_subscription_subscriptions",
        }
        registered = {s.cloudquery_table_name for s in AZURE_RESOURCE_TYPE_SPECS}
        missing = expected_typed_tables - registered
        self.assertFalse(missing, f"Missing typed collectors: {sorted(missing)}")

        # find_spec should resolve every expected table by CQ name.
        for table in expected_typed_tables:
            self.assertIsNotNone(
                find_spec(table),
                f"find_spec returned None for registered table {table}",
            )

        # Subscriptions opt out of selective per-RG enumeration; everything
        # else exposes both ``collector_all`` and ``collector_in_rg``.
        for spec in AZURE_RESOURCE_TYPE_SPECS:
            if spec.cloudquery_table_name in (
                "azure_resources_resource_groups",
                "azure_subscription_subscriptions",
            ):
                self.assertFalse(
                    spec.supports_in_rg,
                    f"{spec.cloudquery_table_name} should not have a per-RG collector",
                )
            else:
                self.assertTrue(
                    spec.supports_in_rg,
                    f"{spec.cloudquery_table_name} is missing a per-RG collector",
                )

    def test_generic_specs_materialize_for_every_registry_entry(self) -> None:
        """Every registry entry must resolve via ``find_spec`` - typed
        when a hand-written collector exists, generic-catch-all otherwise.
        Together this is what gives the indexer coverage parity with the
        CloudQuery plugin's resource table.
        """
        from indexers.azure_resource_type_registry import load_registry

        registry = load_registry()
        # Every CQ table the registry knows about should have a spec.
        for entry in registry:
            spec = find_spec(entry.cloudquery_table_name)
            self.assertIsNotNone(
                spec, f"registry entry {entry.cloudquery_table_name} has no spec"
            )
        # The set of typed specs is a strict subset.
        typed = {s for s in AZURE_RESOURCE_TYPE_SPECS if s.typed}
        all_specs = set(AZURE_RESOURCE_TYPE_SPECS)
        self.assertLess(len(typed), len(all_specs))
        for s in typed:
            self.assertIn(s, all_specs)

    def test_find_spec_by_arm_type_routes_generic_resources(self) -> None:
        # An ARM type without a typed collector should round-trip through
        # the registry to a generic spec. ``Microsoft.Logic/workflows`` is
        # a representative non-typed ARM type today.
        spec = find_spec_by_arm_type("Microsoft.Logic/workflows")
        self.assertIsNotNone(spec)
        self.assertFalse(spec.typed)
        self.assertEqual(spec.cloudquery_table_name, "azure_logic_workflows")
        # Case-insensitive on ARM type.
        same = find_spec_by_arm_type("microsoft.logic/WORKFLOWS")
        self.assertEqual(same, spec)
        # And a typed ARM type still resolves to the typed spec.
        kv = find_spec_by_arm_type("Microsoft.KeyVault/vaults")
        self.assertIsNotNone(kv)
        self.assertTrue(kv.typed)
        self.assertEqual(kv.cloudquery_table_name, "azure_keyvault_keyvaults")
        # Unknown ARM types return None.
        self.assertIsNone(find_spec_by_arm_type("Microsoft.Nope/notathing"))
        self.assertIsNone(find_spec_by_arm_type(None))
        self.assertIsNone(find_spec_by_arm_type(""))

    def test_no_in_scope_rgs_means_zero_sdk_calls_for_storage(self) -> None:
        """With defaultLOD=none and no per-RG overrides, selective scope
        resolves to an empty list. The RG enumeration still runs once
        (we need the RG list to know what exists); storage enumeration
        is skipped entirely."""
        rg_spec = self._make_rg_spec()
        storage_spec = self._make_spec(supports_in_rg=True)

        platform_cfg = {
            "subscriptionId": "sub-A",
            "defaultLOD": "none",
        }

        self._run_index(
            platform_cfg=platform_cfg,
            specs=[rg_spec, storage_spec],
            subscription_ids=["sub-A"],
        )

        self.assertIn(("sub-A", "rg-list"), self._calls["all"])
        self.assertEqual(self._calls["in_rg"], [])
        # No subscription-wide storage list either.
        self.assertNotIn(("sub-A",), self._calls["all"])

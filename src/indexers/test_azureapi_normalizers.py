"""
Unit tests for ``indexers.azureapi_normalizers``.

The fundamental claim of the new Azure SDK indexer is "byte-compatible output"
with the legacy CloudQuery path. These tests pin the contract:

1. ``normalize_azure_resource`` produces a dict whose keys / nested shape match
   what the CloudQuery sqlite intermediate produces (top-level snake_case for a
   small set of well-known keys, ``properties``/``sku``/``identity`` preserved
   verbatim, ``tags`` defaulted to ``{}``, ``subscription_id`` always set).

2. Feeding that dict into ``AzurePlatformHandler.parse_resource_data`` yields
   the same ``(name, qualified_name, attributes)`` tuple the existing
   resource-dump fixture in ``.test/azure/multi-subscription-aks/output/``
   shows for the equivalent CloudQuery-discovered resource.

These tests run without any Azure SDK package installed because
``normalize_azure_resource`` accepts plain dicts and SDK-shaped fakes via
``as_dict()``.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase

# Tests live in the indexers package; ensure the project root is on sys.path
# when these are run directly (e.g. ``python -m unittest indexers.test_...``)
# so the local ``component``, ``resources``, ``enrichers`` modules import.
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.azureapi_normalizers import (  # noqa: E402
    _camel_to_snake,
    _sanitize,
    normalize_azure_resource,
)


SUBSCRIPTION_ID = "2a0cf760-baef-4446-b75c-75c4f8a6267f"


class _FakeAzureModel:
    """Mimics an Azure SDK model object that exposes ``as_dict()``."""

    def __init__(self, payload: dict):
        self._payload = payload

    def as_dict(self, keep_readonly: bool = True):
        return dict(self._payload)


def _resource_group_payload():
    return {
        "id": f"/subscriptions/{SUBSCRIPTION_ID}/resourceGroups/sandbox-contoso-rg",
        "name": "sandbox-contoso-rg",
        "type": "Microsoft.Resources/resourceGroups",
        "location": "eastus",
        "tags": None,
        "managedBy": None,
        "properties": {"provisioningState": "Succeeded"},
    }


def _storage_account_payload():
    return {
        "id": (
            f"/subscriptions/{SUBSCRIPTION_ID}/resourceGroups/"
            f"azure-apps-func-hlth-functions-rg/providers/"
            f"Microsoft.Storage/storageAccounts/rwapsfuncstorm1bxh"
        ),
        "name": "rwapsfuncstorm1bxh",
        "type": "Microsoft.Storage/storageAccounts",
        "kind": "StorageV2",
        "location": "canadacentral",
        "tags": {
            "env": "test",
            "lifecycle": "deleteme",
            "product": "runwhen",
        },
        "extendedLocation": None,
        "identity": {"type": "None"},
        "sku": {"name": "Standard_LRS", "tier": "Standard"},
        "properties": {
            "accessTier": "Hot",
            "allowBlobPublicAccess": True,
            "provisioningState": "Succeeded",
            "primaryEndpoints": {
                "blob": "https://rwapsfuncstorm1bxh.blob.core.windows.net/",
            },
        },
    }


# ---------------------------------------------------------------------------
# normalize_azure_resource
# ---------------------------------------------------------------------------

class NormalizeAzureResourceTests(TestCase):

    def test_camel_to_snake(self):
        self.assertEqual("foo_bar", _camel_to_snake("fooBar"))
        self.assertEqual("a_b_c", _camel_to_snake("aBC"))
        self.assertEqual("simple", _camel_to_snake("simple"))

    def test_sanitize_handles_datetimes_enums_nested(self):
        import datetime
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

    def test_normalize_resource_group_top_level_shape(self):
        model = _FakeAzureModel(_resource_group_payload())
        data = normalize_azure_resource(
            model, subscription_id=SUBSCRIPTION_ID, resource_type_name="resource_group"
        )
        self.assertEqual(data["name"], "sandbox-contoso-rg")
        self.assertEqual(data["type"], "Microsoft.Resources/resourceGroups")
        self.assertEqual(data["location"], "eastus")
        self.assertEqual(data["subscription_id"], SUBSCRIPTION_ID)
        # tags must be a dict, never None - generation rules path-match into it.
        self.assertEqual(data["tags"], {})
        # Azure SDK's camelCase 'managedBy' should be renamed to 'managed_by' so
        # it matches the CQ row shape that existing rules may path-match.
        self.assertIn("managed_by", data)
        self.assertNotIn("managedBy", data)
        # 'properties' is the Azure REST payload, kept camelCase as in CQ.
        self.assertEqual(data["properties"], {"provisioningState": "Succeeded"})

    def test_normalize_storage_account_preserves_nested_camel_case(self):
        model = _FakeAzureModel(_storage_account_payload())
        data = normalize_azure_resource(
            model,
            subscription_id=SUBSCRIPTION_ID,
            resource_type_name="azure_storage_accounts",
        )
        # Top-level extendedLocation must be renamed; nested camelCase under
        # 'properties' / 'sku' must be left exactly as Azure returns it.
        self.assertIn("extended_location", data)
        self.assertNotIn("extendedLocation", data)
        self.assertEqual(data["sku"], {"name": "Standard_LRS", "tier": "Standard"})
        self.assertEqual(data["properties"]["accessTier"], "Hot")
        self.assertEqual(
            data["properties"]["primaryEndpoints"]["blob"],
            "https://rwapsfuncstorm1bxh.blob.core.windows.net/",
        )
        self.assertEqual(data["kind"], "StorageV2")

    def test_normalize_accepts_plain_dict(self):
        # When tests / AWS / GCP code passes through plain dicts (e.g. from
        # CloudQuery), the normalizer should still produce the canonical shape.
        data = normalize_azure_resource(
            _resource_group_payload(),
            subscription_id=SUBSCRIPTION_ID,
            resource_type_name="resource_group",
        )
        self.assertEqual(data["subscription_id"], SUBSCRIPTION_ID)
        self.assertEqual(data["tags"], {})

    def test_subscription_id_overwritten_to_collector_value(self):
        # The collector knows which subscription the resource was discovered
        # in; that wins over whatever the SDK payload happens to contain.
        payload = _resource_group_payload()
        payload["subscriptionId"] = "garbage-value"
        model = _FakeAzureModel(payload)
        data = normalize_azure_resource(
            model, subscription_id=SUBSCRIPTION_ID, resource_type_name="resource_group"
        )
        self.assertEqual(data["subscription_id"], SUBSCRIPTION_ID)


# ---------------------------------------------------------------------------
# Round-trip: normalizer → AzurePlatformHandler.parse_resource_data
# ---------------------------------------------------------------------------

class NormalizerParserRoundTripTests(TestCase):
    """End-to-end check: the dict produced by the normalizer feeds cleanly
    through ``AzurePlatformHandler.parse_resource_data`` and yields the same
    ``(name, qualified_name, attributes)`` shape the legacy CloudQuery dump
    shows for an equivalent resource.
    """

    def setUp(self):
        # The platform handler uses ``Context.get_setting("DEFAULT_LOD")`` and
        # the registry on the context; we provide the minimum surface here.
        from component import Context  # local import: needs component bootstrap
        from outputter import FileItemOutputter
        from resources import REGISTRY_PROPERTY_NAME, Registry
        from enrichers.generation_rule_types import LevelOfDetail

        self.context = Context(
            setting_values={"DEFAULT_LOD": LevelOfDetail.BASIC},
            outputter=FileItemOutputter(),
        )
        self.context.set_property(REGISTRY_PROPERTY_NAME, Registry())

    def test_resource_group_round_trip_matches_dump_shape(self):
        from enrichers.azure import AzurePlatformHandler

        platform_cfg = {
            "subscriptions": [{"subscriptionId": SUBSCRIPTION_ID}],
            "subscriptionResourceGroupLevelOfDetails": {
                SUBSCRIPTION_ID: {"sandbox-contoso-rg": "none"},
            },
        }
        data = normalize_azure_resource(
            _FakeAzureModel(_resource_group_payload()),
            subscription_id=SUBSCRIPTION_ID,
            resource_type_name="resource_group",
        )
        handler = AzurePlatformHandler()
        name, qualified_name, attrs = handler.parse_resource_data(
            data, "resource_group", platform_cfg, self.context
        )
        self.assertEqual(name, "sandbox-contoso-rg")
        self.assertEqual(qualified_name, "sandbox-contoso-rg")
        self.assertEqual(attrs["tags"], {})
        self.assertEqual(attrs["subscription_id"], SUBSCRIPTION_ID)
        self.assertIsNotNone(attrs.get("lod"))

    def test_child_resource_round_trip_links_to_resource_group(self):
        from enrichers.azure import AZURE_PLATFORM, AzurePlatformHandler
        from resources import REGISTRY_PROPERTY_NAME

        platform_cfg = {
            "subscriptions": [{"subscriptionId": SUBSCRIPTION_ID}],
            "subscriptionResourceGroupLevelOfDetails": {
                SUBSCRIPTION_ID: {"*": "detailed"},
            },
        }
        # Pre-populate registry with the parent RG so the parser can link.
        registry = self.context.get_property(REGISTRY_PROPERTY_NAME)
        registry.add_resource(
            AZURE_PLATFORM,
            "resource_group",
            "azure-apps-func-hlth-functions-rg",
            "azure-apps-func-hlth-functions-rg",
            {"subscription_id": SUBSCRIPTION_ID, "tags": {}},
        )

        data = normalize_azure_resource(
            _FakeAzureModel(_storage_account_payload()),
            subscription_id=SUBSCRIPTION_ID,
            resource_type_name="azure_storage_accounts",
        )
        handler = AzurePlatformHandler()
        name, qualified_name, attrs = handler.parse_resource_data(
            data, "azure_storage_accounts", platform_cfg, self.context
        )
        self.assertEqual(name, "rwapsfuncstorm1bxh")
        # The CQ dump for this resource shows the qualified_name as
        # "<resource-group>/<name>"; the parser should reproduce it.
        self.assertEqual(
            qualified_name,
            "azure-apps-func-hlth-functions-rg/rwapsfuncstorm1bxh",
        )
        self.assertEqual(attrs["subscription_id"], SUBSCRIPTION_ID)
        self.assertIn("resource_group", attrs)
        self.assertEqual(
            attrs["resource_group"].name, "azure-apps-func-hlth-functions-rg"
        )

    def test_child_resource_with_missing_rg_records_deferred_lookup(self):
        # Mirror CQ behavior: when a child is indexed and the resource_group
        # type exists in the registry but not the specific parent RG, the
        # parser records a deferred lookup so
        # ``resolve_deferred_azure_relationships`` can fix the link later.
        from enrichers.azure import AZURE_PLATFORM, AzurePlatformHandler
        from resources import REGISTRY_PROPERTY_NAME

        platform_cfg = {
            "subscriptions": [{"subscriptionId": SUBSCRIPTION_ID}],
            "subscriptionResourceGroupLevelOfDetails": {
                SUBSCRIPTION_ID: {"*": "basic"},
            },
        }

        # Seed the registry with an unrelated RG so the ``resource_group``
        # type exists. This matches the real flow where RGs from one
        # subscription have already been written before children from
        # another are processed.
        registry = self.context.get_property(REGISTRY_PROPERTY_NAME)
        registry.add_resource(
            AZURE_PLATFORM,
            "resource_group",
            "unrelated-rg",
            "unrelated-rg",
            {"subscription_id": "00000000-0000-0000-0000-000000000000", "tags": {}},
        )

        data = normalize_azure_resource(
            _FakeAzureModel(_storage_account_payload()),
            subscription_id=SUBSCRIPTION_ID,
            resource_type_name="azure_storage_accounts",
        )
        handler = AzurePlatformHandler()
        _, qualified_name, attrs = handler.parse_resource_data(
            data, "azure_storage_accounts", platform_cfg, self.context
        )
        # When the RG isn't in the registry yet, qualified_name is rg/name
        # too (parser computes it from the ID), and the deferred-lookup info
        # is stamped on the attributes for later resolution.
        self.assertEqual(
            qualified_name,
            "azure-apps-func-hlth-functions-rg/rwapsfuncstorm1bxh",
        )
        deferred = attrs.get("_deferred_rg_lookup")
        self.assertIsNotNone(deferred)
        self.assertEqual(deferred["rg_name"], "azure-apps-func-hlth-functions-rg")
        self.assertEqual(deferred["subscription_id"], SUBSCRIPTION_ID)

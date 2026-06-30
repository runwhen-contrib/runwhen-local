"""
Unit tests for ``indexers.gcpapi_normalizers``.

The native GCP indexer claims output compatible with the legacy CloudQuery
path. These tests pin the contract:

1. ``normalize_gcp_asset`` flattens a Cloud Asset Inventory asset into the flat
   dict shape ``GCPPlatformHandler.parse_resource_data`` accepts (``project_id``,
   ``name``, ``id``, ``zone``/``region``/``location``, ``tags`` from labels).

2. ``normalize_gcp_sdk_model`` does the same for a typed google-cloud-* model.

3. Feeding those dicts into ``GCPPlatformHandler.parse_resource_data`` yields a
   sensible ``(name, qualified_name, attributes)`` tuple, including linking a
   child resource to its parent ``project``.

These tests run without any google-* package installed because the normalizers
operate on plain dicts and duck-typed objects.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.gcpapi_normalizers import (  # noqa: E402
    _region_from_location,
    _sanitize,
    make_project_resource_data,
    normalize_gcp_asset,
    normalize_gcp_sdk_model,
)

PROJECT_ID = "my-project"


def _instance_asset():
    return {
        "name": (
            "//compute.googleapis.com/projects/my-project/zones/"
            "us-central1-a/instances/web-1"
        ),
        "asset_type": "compute.googleapis.com/Instance",
        "resource": {
            "location": "us-central1-a",
            "data": {
                "name": "web-1",
                "labels": {"env": "prod", "team": "sre"},
                "zone": (
                    "https://www.googleapis.com/compute/v1/projects/"
                    "my-project/zones/us-central1-a"
                ),
                "status": "RUNNING",
            },
        },
    }


def _bucket_asset():
    return {
        "name": "//storage.googleapis.com/projects/_/buckets/my-bucket",
        "asset_type": "storage.googleapis.com/Bucket",
        "resource": {
            "location": "us-east1",
            "data": {"name": "my-bucket", "labels": {}, "storageClass": "STANDARD"},
        },
    }


class SanitizeAndLocationTests(TestCase):
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

    def test_region_from_location(self):
        self.assertEqual(_region_from_location("us-central1-a"), ("us-central1-a", "us-central1"))
        self.assertEqual(_region_from_location("us-east1"), (None, "us-east1"))
        self.assertEqual(_region_from_location("us"), (None, None))
        self.assertEqual(_region_from_location("global"), (None, None))
        self.assertEqual(_region_from_location(None), (None, None))


class NormalizeGcpAssetTests(TestCase):
    def test_instance_asset_top_level_shape(self):
        data = normalize_gcp_asset(_instance_asset())
        self.assertEqual(data["name"], "web-1")
        self.assertEqual(data["project_id"], PROJECT_ID)
        self.assertEqual(data["asset_type"], "compute.googleapis.com/Instance")
        # Zone full-URL collapsed to the leaf; region derivation left to handler.
        self.assertEqual(data["zone"], "us-central1-a")
        # labels copied into tags so cross-cloud filters work; labels preserved.
        self.assertEqual(data["tags"], {"env": "prod", "team": "sre"})
        self.assertEqual(data["labels"], {"env": "prod", "team": "sre"})
        # Full payload fields are hoisted to the top level for path matching.
        self.assertEqual(data["status"], "RUNNING")
        self.assertTrue(data["id"].startswith("//compute.googleapis.com/"))

    def test_explicit_project_id_wins(self):
        data = normalize_gcp_asset(_instance_asset(), project_id="override-proj")
        self.assertEqual(data["project_id"], "override-proj")

    def test_bucket_region_from_location(self):
        data = normalize_gcp_asset(_bucket_asset(), project_id=PROJECT_ID)
        self.assertEqual(data["name"], "my-bucket")
        self.assertEqual(data["project_id"], PROJECT_ID)
        self.assertEqual(data.get("region"), "us-east1")
        self.assertIsNone(data.get("zone"))
        self.assertEqual(data["tags"], {})

    def test_labels_default_to_empty_dict(self):
        asset = {
            "name": "//x.googleapis.com/projects/p/things/t",
            "asset_type": "x.googleapis.com/Thing",
            "resource": {"data": {"name": "t"}},
        }
        data = normalize_gcp_asset(asset, project_id="p")
        self.assertEqual(data["tags"], {})
        self.assertEqual(data["labels"], {})


class NormalizeGcpSdkModelTests(TestCase):
    def test_sdk_model_dict(self):
        model = {
            "name": "web-2",
            "labels": {"env": "dev"},
            "zone": "https://www.googleapis.com/compute/v1/projects/p/zones/us-west1-b",
            "selfLink": "https://.../instances/web-2",
        }
        data = normalize_gcp_sdk_model(model, project_id=PROJECT_ID)
        self.assertEqual(data["name"], "web-2")
        self.assertEqual(data["project_id"], PROJECT_ID)
        self.assertEqual(data["zone"], "us-west1-b")
        self.assertEqual(data["tags"], {"env": "dev"})

    def test_make_project_resource_data(self):
        data = make_project_resource_data(PROJECT_ID)
        self.assertEqual(data["project_id"], PROJECT_ID)
        self.assertEqual(data["name"], PROJECT_ID)
        self.assertEqual(data["asset_type"], "cloudresourcemanager.googleapis.com/Project")


class TypedFallbackRoundTripTests(TestCase):
    """Per-type round-trips for the new typed fallback collectors.

    Each fallback collector yields an SDK model that flows through
    ``normalize_gcp_sdk_model`` and then ``GCPPlatformHandler.parse_resource_data``.
    These tests pin that, for a representative SDK payload of each new type, the
    normalized dict carries the handler-read fields (name, zone/region, tags) and
    parses into the expected ``(name, qualified_name)`` under its CloudQuery
    ``resource_type`` - identical to what the Cloud Asset Inventory path produced
    for the same type, so generation rules are unaffected by the source.
    """

    def setUp(self):
        from component import Context
        from outputter import FileItemOutputter
        from resources import REGISTRY_PROPERTY_NAME, Registry
        from enrichers.generation_rule_types import LevelOfDetail

        self.context = Context(
            setting_values={"DEFAULT_LOD": LevelOfDetail.BASIC},
            outputter=FileItemOutputter(),
        )
        self.context.set_property(REGISTRY_PROPERTY_NAME, Registry())
        self.platform_cfg = {"projectLevelOfDetails": {PROJECT_ID: "detailed"}}

        from enrichers.gcp import GCP_PLATFORM, GCPPlatformHandler
        from resources import REGISTRY_PROPERTY_NAME as _RP

        self.handler = GCPPlatformHandler()
        # Write the project anchor so child resources link to it (Phase 0).
        registry = self.context.get_property(_RP)
        proj = make_project_resource_data(PROJECT_ID)
        pname, pqual, pattrs = self.handler.parse_resource_data(
            proj, "project", self.platform_cfg, self.context
        )
        registry.add_resource(GCP_PLATFORM, "project", pname, pqual, pattrs)

    def _round_trip(self, model, resource_type_name, *, expected_name):
        data = normalize_gcp_sdk_model(
            model, project_id=PROJECT_ID, resource_type_name=resource_type_name
        )
        name, qualified_name, attrs = self.handler.parse_resource_data(
            data, resource_type_name, self.platform_cfg, self.context
        )
        self.assertEqual(name, expected_name)
        self.assertEqual(qualified_name, f"{PROJECT_ID}/{expected_name}")
        self.assertEqual(attrs["project_id"], PROJECT_ID)
        self.assertIn("project", attrs)
        return data, attrs

    def test_compute_disk_zonal(self):
        model = {
            "name": "disk-1",
            "labels": {"env": "prod"},
            "zone": (
                "https://www.googleapis.com/compute/v1/projects/"
                "my-project/zones/us-central1-a"
            ),
            "sizeGb": "100",
        }
        data, attrs = self._round_trip(
            model, "gcp_compute_disks", expected_name="disk-1"
        )
        self.assertEqual(data["zone"], "us-central1-a")
        self.assertEqual(data["tags"], {"env": "prod"})
        # Region derived from zone by the handler.
        self.assertEqual(attrs["region"], "us-central1")

    def test_compute_snapshot_global(self):
        model = {"name": "snap-1", "labels": {}, "diskSizeGb": "50"}
        data, _ = self._round_trip(
            model, "gcp_compute_snapshots", expected_name="snap-1"
        )
        self.assertEqual(data["tags"], {})
        self.assertIsNone(data.get("zone"))
        self.assertIsNone(data.get("region"))

    def test_compute_network_global_no_labels(self):
        model = {
            "name": "default",
            "autoCreateSubnetworks": True,
            "selfLink": "https://www.googleapis.com/compute/v1/projects/p/global/networks/default",
        }
        data, _ = self._round_trip(
            model, "gcp_compute_networks", expected_name="default"
        )
        self.assertEqual(data["tags"], {})

    def test_compute_subnetwork_regional(self):
        model = {
            "name": "subnet-1",
            "region": (
                "https://www.googleapis.com/compute/v1/projects/"
                "my-project/regions/us-central1"
            ),
            "ipCidrRange": "10.0.0.0/24",
        }
        data, attrs = self._round_trip(
            model, "gcp_compute_subnetworks", expected_name="subnet-1"
        )
        self.assertEqual(data["region"], "us-central1")
        self.assertEqual(attrs["region"], "us-central1")

    def test_compute_firewall_global(self):
        model = {"name": "allow-ssh", "network": ".../networks/default"}
        self._round_trip(model, "gcp_compute_firewalls", expected_name="allow-ssh")

    def test_compute_address_regional(self):
        model = {
            "name": "ip-1",
            "address": "34.1.2.3",
            "region": (
                "https://www.googleapis.com/compute/v1/projects/"
                "my-project/regions/europe-west1"
            ),
        }
        data, attrs = self._round_trip(
            model, "gcp_compute_addresses", expected_name="ip-1"
        )
        self.assertEqual(data["region"], "europe-west1")

    def test_pubsub_topic_full_path_name_and_labels(self):
        # PublisherClient yields Topic messages whose name is the full path.
        model = {
            "name": f"projects/{PROJECT_ID}/topics/orders",
            "labels": {"team": "payments"},
        }
        data, _ = self._round_trip(
            model, "gcp_pubsub_topics", expected_name="orders"
        )
        self.assertEqual(data["tags"], {"team": "payments"})

    def test_pubsub_subscription_full_path_name(self):
        model = {
            "name": f"projects/{PROJECT_ID}/subscriptions/orders-sub",
            "topic": f"projects/{PROJECT_ID}/topics/orders",
            "labels": {},
        }
        self._round_trip(
            model, "gcp_pubsub_subscriptions", expected_name="orders-sub"
        )

    def test_iam_service_account_name_collapses_to_email(self):
        email = f"runner@{PROJECT_ID}.iam.gserviceaccount.com"
        model = {
            "name": f"projects/{PROJECT_ID}/serviceAccounts/{email}",
            "email": email,
            "display_name": "CI Runner",
            "unique_id": "10293847",
        }
        data, _ = self._round_trip(
            model, "gcp_iam_service_accounts", expected_name=email
        )
        # Service accounts have no labels -> tags default to {}.
        self.assertEqual(data["tags"], {})


class NormalizerParserRoundTripTests(TestCase):
    """End-to-end: normalizer dict -> GCPPlatformHandler.parse_resource_data."""

    def setUp(self):
        from component import Context
        from outputter import FileItemOutputter
        from resources import REGISTRY_PROPERTY_NAME, Registry
        from enrichers.generation_rule_types import LevelOfDetail

        self.context = Context(
            setting_values={"DEFAULT_LOD": LevelOfDetail.BASIC},
            outputter=FileItemOutputter(),
        )
        self.context.set_property(REGISTRY_PROPERTY_NAME, Registry())

    def test_project_round_trip(self):
        from enrichers.gcp import GCPPlatformHandler

        platform_cfg = {"projectLevelOfDetails": {PROJECT_ID: "detailed"}}
        data = make_project_resource_data(PROJECT_ID)
        handler = GCPPlatformHandler()
        name, qualified_name, attrs = handler.parse_resource_data(
            data, "project", platform_cfg, self.context
        )
        self.assertEqual(name, PROJECT_ID)
        self.assertEqual(qualified_name, PROJECT_ID)
        self.assertIsNotNone(attrs.get("lod"))

    def test_child_resource_links_to_project(self):
        from enrichers.gcp import GCP_PLATFORM, GCPPlatformHandler
        from resources import REGISTRY_PROPERTY_NAME

        platform_cfg = {"projectLevelOfDetails": {PROJECT_ID: "detailed"}}
        handler = GCPPlatformHandler()

        # Write the project anchor first (the orchestrator does this in Phase 0).
        registry = self.context.get_property(REGISTRY_PROPERTY_NAME)
        proj_data = make_project_resource_data(PROJECT_ID)
        pname, pqual, pattrs = handler.parse_resource_data(
            proj_data, "project", platform_cfg, self.context
        )
        registry.add_resource(GCP_PLATFORM, "project", pname, pqual, pattrs)

        data = normalize_gcp_asset(_instance_asset())
        name, qualified_name, attrs = handler.parse_resource_data(
            data, "compute_instance", platform_cfg, self.context
        )
        self.assertEqual(name, "web-1")
        self.assertEqual(qualified_name, f"{PROJECT_ID}/web-1")
        self.assertEqual(attrs["project_id"], PROJECT_ID)
        self.assertIn("project", attrs)
        self.assertEqual(attrs["project"].name, PROJECT_ID)
        # zone present; region derived by the handler from the zone.
        self.assertEqual(attrs["zone"], "us-central1-a")
        self.assertEqual(attrs["region"], "us-central1")

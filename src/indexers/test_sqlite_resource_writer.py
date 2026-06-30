"""
Unit tests for ``indexers.sqlite_resource_writer``.

These tests exercise the SQLite-backed :class:`ResourceWriter` end to end:

1. The encoder round-trips primitives, datetimes, ``LevelOfDetail`` enums,
   nested dicts/lists, and ``Resource`` cross-references via the documented
   marker scheme.
2. ``SqliteResourceWriter.finalize`` produces a SQLite database via the
   ``FileSystemOutputter`` containing every resource currently in the
   ``Registry`` (including resources written by indexers that bypass the
   writer).
3. Deferred Azure resource-group resolution runs *before* the snapshot, so
   the persisted attributes reflect the resolved ``resource_group`` ref.
4. The selector ``get_resource_writer`` honours the ``resourceStoreBackend``
   setting.

Tests use only the standard library + the local workspace-builder modules;
no Azure SDK or sqlalchemy required.
"""

from __future__ import annotations

import datetime as _dt
import os
import sqlite3
import sys
import tempfile
from unittest import TestCase

# Allow ``python -m unittest indexers.test_sqlite_resource_writer`` from any cwd.
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.sqlite_resource_writer import (  # noqa: E402
    SCHEMA_VERSION,
    SqliteResourceWriter,
    _snapshot_registry,
    count_workspace_artifacts,
    decode_attributes,
    encode_attributes,
    get_resource,
    get_schema_version,
    list_platforms,
    list_resource_types,
    list_resources,
    open_database,
    persist_sqlite_store,
    search_workspace_artifacts,
)


def _make_context(tmpdir: str, sqlite: bool = False):
    """Build a minimal workspace-builder Context backed by a real filesystem
    outputter under ``tmpdir``."""
    from component import Context
    from outputter import FileSystemOutputter
    from resources import REGISTRY_PROPERTY_NAME, Registry

    setting_values: dict = {}
    if sqlite:
        from indexers.resource_writer import RESOURCE_STORE_BACKEND_SETTING

        setting_values[RESOURCE_STORE_BACKEND_SETTING.name] = "sqlite"

    ctx = Context(
        setting_values=setting_values,
        outputter=FileSystemOutputter(tmpdir),
    )
    ctx.set_property(REGISTRY_PROPERTY_NAME, Registry())
    return ctx


class EncoderTests(TestCase):
    def test_primitive_round_trip(self):
        attrs = {
            "name": "foo",
            "count": 7,
            "enabled": True,
            "ratio": 1.5,
            "missing": None,
        }
        encoded = encode_attributes(attrs)
        self.assertIsInstance(encoded, str)
        self.assertEqual(decode_attributes(encoded), attrs)

    def test_datetime_round_trip(self):
        ts = _dt.datetime(2024, 1, 2, 3, 4, 5, tzinfo=_dt.timezone.utc)
        encoded = encode_attributes({"created_at": ts})
        decoded = decode_attributes(encoded)
        self.assertEqual(decoded["created_at"], ts)

    def test_date_round_trip(self):
        d = _dt.date(2024, 5, 25)
        encoded = encode_attributes({"on": d})
        decoded = decode_attributes(encoded)
        self.assertEqual(decoded["on"], d)

    def test_level_of_detail_round_trip(self):
        from enrichers.generation_rule_types import LevelOfDetail

        encoded = encode_attributes({"lod": LevelOfDetail.DETAILED})
        decoded = decode_attributes(encoded)
        self.assertEqual(decoded["lod"], LevelOfDetail.DETAILED)

    def test_nested_dict_and_list_preserved(self):
        attrs = {
            "tags": {"env": "prod", "team": "sre"},
            "nics": [
                {"name": "n1", "ips": ["10.0.0.1", "10.0.0.2"]},
                {"name": "n2", "ips": []},
            ],
        }
        encoded = encode_attributes(attrs)
        self.assertEqual(decode_attributes(encoded), attrs)

    def test_resource_reference_encoded_as_marker(self):
        from resources import Registry

        registry = Registry()
        rg = registry.add_resource(
            "azure", "resource_group", "rg1", "rg1", {"subscription_id": "s1"}
        )
        encoded = encode_attributes({"resource_group": rg})
        # The marker dict is stored verbatim (decoder leaves it as-is so a
        # downstream caller can decide how to resolve refs).
        decoded = decode_attributes(encoded)
        ref = decoded["resource_group"]["$ref"]
        self.assertEqual(ref["platform"], "azure")
        self.assertEqual(ref["resource_type"], "resource_group")
        self.assertEqual(ref["qualified_name"], "rg1")
        self.assertEqual(ref["name"], "rg1")

    def test_set_serialised_as_list(self):
        attrs = {"members": {"a", "b", "c"}}
        encoded = encode_attributes(attrs)
        decoded = decode_attributes(encoded)
        self.assertCountEqual(decoded["members"], ["a", "b", "c"])

    def test_unsupported_type_falls_back_to_string(self):
        class Quirky:
            def __repr__(self):
                return "<quirky>"

        encoded = encode_attributes({"weird": Quirky()})
        self.assertEqual(decode_attributes(encoded), {"weird": "<quirky>"})


class SchemaTests(TestCase):
    def test_schema_initialised_with_version(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir, sqlite=True)
            from indexers.resource_writer import RESOURCE_STORE_BACKEND_SETTING

            ctx.setting_values[RESOURCE_STORE_BACKEND_SETTING.name] = "sqlite"
            persist_sqlite_store(ctx, db_path="resources.sqlite")

            db_file = os.path.join(tmpdir, "resources.sqlite")
            self.assertTrue(os.path.exists(db_file))
            conn = open_database(db_file)
            try:
                self.assertEqual(get_schema_version(conn), SCHEMA_VERSION)
                tables = {
                    row[0]
                    for row in conn.execute(
                        "SELECT name FROM sqlite_master WHERE type='table'"
                    )
                }
                self.assertTrue(
                    {
                        "platforms",
                        "resource_types",
                        "resources",
                        "workspace_artifacts",
                        "schema_meta",
                    }.issubset(tables)
                )
            finally:
                conn.close()


class WriterTests(TestCase):
    def test_dual_write_persists_full_registry(self):
        from enrichers.generation_rule_types import LevelOfDetail
        from resources import REGISTRY_PROPERTY_NAME

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir, sqlite=True)
            writer = SqliteResourceWriter(ctx, db_path="store/resources.sqlite")

            # 1) Write through the writer (azureapi-style call).
            writer.add_resource(
                "azure",
                "resource_group",
                "rg1",
                "rg1",
                {
                    "subscription_id": "sub-1",
                    "tags": {"env": "prod"},
                    "lod": LevelOfDetail.BASIC,
                },
            )

            # 2) Bypass the writer to mimic kubeapi / cloudquery indexers
            #    that still mutate the registry directly. Snapshot must
            #    pick these up too.
            registry = ctx.get_property(REGISTRY_PROPERTY_NAME)
            registry.add_resource(
                "kubernetes",
                "cluster",
                "demo",
                "demo",
                {"server": "https://demo.example.com"},
            )

            writer.finalize()
            persist_sqlite_store(ctx, db_path="store/resources.sqlite")

            db_file = os.path.join(tmpdir, "store", "resources.sqlite")
            conn = open_database(db_file)
            try:
                self.assertEqual(
                    sorted(list_platforms(conn)), ["azure", "kubernetes"]
                )

                rg_rows = list_resources(conn, platform="azure", resource_type="resource_group")
                self.assertEqual(len(rg_rows), 1)
                rg = rg_rows[0]
                self.assertEqual(rg["name"], "rg1")
                self.assertEqual(rg["qualified_name"], "rg1")
                self.assertEqual(rg["attributes"]["subscription_id"], "sub-1")
                self.assertEqual(rg["attributes"]["tags"], {"env": "prod"})
                self.assertEqual(rg["attributes"]["lod"], LevelOfDetail.BASIC)

                kube_rows = list_resources(conn, platform="kubernetes")
                self.assertEqual(len(kube_rows), 1)
                self.assertEqual(kube_rows[0]["qualified_name"], "demo")
            finally:
                conn.close()

    def test_resource_reference_attributes_persist_as_ref_marker(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir, sqlite=True)
            writer = SqliteResourceWriter(ctx, db_path="resources.sqlite")

            rg = writer.add_resource(
                "azure",
                "resource_group",
                "rg1",
                "rg1",
                {"subscription_id": "sub-1"},
            )
            writer.add_resource(
                "azure",
                "azure_storage_accounts",
                "store1",
                "rg1/store1",
                {"subscription_id": "sub-1", "resource_group": rg},
            )
            writer.finalize()
            persist_sqlite_store(ctx, db_path="resources.sqlite")

            db_file = os.path.join(tmpdir, "resources.sqlite")
            conn = open_database(db_file)
            try:
                stored = get_resource(
                    conn,
                    "azure",
                    "azure_storage_accounts",
                    "rg1/store1",
                )
                self.assertIsNotNone(stored)
                ref = stored["attributes"]["resource_group"]["$ref"]
                self.assertEqual(ref["platform"], "azure")
                self.assertEqual(ref["resource_type"], "resource_group")
                self.assertEqual(ref["qualified_name"], "rg1")
            finally:
                conn.close()

    def test_finalize_runs_deferred_rg_resolution_before_snapshot(self):
        """The in-memory writer's ``finalize`` resolves
        ``_deferred_rg_lookup`` markers and re-keys child resources by
        ``rg/name``. The SQLite snapshot must reflect the *resolved* state.
        """
        from enrichers.azure import AzurePlatformHandler
        from enrichers.generation_rule_types import (
            PLATFORM_HANDLERS_PROPERTY_NAME,
        )
        from indexers.azureapi_normalizers import normalize_azure_resource
        from resources import REGISTRY_PROPERTY_NAME

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir, sqlite=True)
            ctx.setting_values["DEFAULT_LOD"] = "basic"
            ctx.set_property(
                PLATFORM_HANDLERS_PROPERTY_NAME,
                {"azure": AzurePlatformHandler()},
            )

            writer = SqliteResourceWriter(ctx, db_path="resources.sqlite")
            registry = ctx.get_property(REGISTRY_PROPERTY_NAME)

            sub_id = "11111111-1111-1111-1111-111111111111"
            platform_cfg = {
                "subscriptions": [{"subscriptionId": sub_id}],
                "subscriptionResourceGroupLevelOfDetails": {
                    sub_id: {"*": "detailed"},
                },
            }

            # Simulate the order azureapi typically processes things in: a
            # child resource referencing an RG that hasn't landed yet.
            child_payload = {
                "id": (
                    f"/subscriptions/{sub_id}/resourceGroups/"
                    f"app-rg/providers/Microsoft.Storage/storageAccounts/store1"
                ),
                "name": "store1",
                "type": "Microsoft.Storage/storageAccounts",
                "location": "eastus",
                "tags": {},
                "properties": {},
            }
            # Seed registry with a different RG so the ``resource_group``
            # type table exists and the deferred-lookup branch is taken.
            registry.add_resource(
                "azure",
                "resource_group",
                "other-rg",
                "other-rg",
                {"subscription_id": sub_id, "tags": {}},
            )

            class _Bag:
                def __init__(self, d):
                    self._d = d

                def as_dict(self, keep_readonly=True):
                    return dict(self._d)

            data = normalize_azure_resource(
                _Bag(child_payload),
                subscription_id=sub_id,
                resource_type_name="azure_storage_accounts",
            )
            handler = AzurePlatformHandler()
            name, qualified, attrs = handler.parse_resource_data(
                data, "azure_storage_accounts", platform_cfg, ctx
            )
            attrs["resource"] = data
            attrs["auth_type"] = "managed_identity"
            attrs["auth_secret"] = None
            self.assertIn("_deferred_rg_lookup", attrs)

            writer.add_resource(
                "azure", "azure_storage_accounts", name, qualified, attrs
            )

            # Now write the actual parent RG (this is the order azureapi
            # uses but only because it sorts spec-major; the deferred path
            # exists for cases where it doesn't).
            registry.add_resource(
                "azure",
                "resource_group",
                "app-rg",
                "app-rg",
                {"subscription_id": sub_id, "tags": {}},
            )

            writer.finalize()
            persist_sqlite_store(ctx, db_path="resources.sqlite")

            db_file = os.path.join(tmpdir, "resources.sqlite")
            conn = open_database(db_file)
            try:
                rows = list_resources(
                    conn,
                    platform="azure",
                    resource_type="azure_storage_accounts",
                )
                self.assertEqual(len(rows), 1)
                row = rows[0]
                # After deferred resolution, the child should be linked to
                # the real RG and the deferred marker should be gone.
                self.assertEqual(row["qualified_name"], "app-rg/store1")
                self.assertNotIn("_deferred_rg_lookup", row["attributes"])
                ref = row["attributes"]["resource_group"]["$ref"]
                self.assertEqual(ref["qualified_name"], "app-rg")
            finally:
                conn.close()


class SelectorTests(TestCase):
    def test_default_selector_returns_sqlite_writer(self):
        # The default resourceStoreBackend is now 'sqlite', so with no explicit
        # setting the selector must return the SQLite-backed writer.
        from indexers.resource_writer import get_resource_writer

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir)
            writer = get_resource_writer(ctx)
            self.assertIsInstance(writer, SqliteResourceWriter)

    def test_memory_backend_selected_by_setting(self):
        from indexers.resource_writer import (
            InMemoryRegistryWriter,
            RESOURCE_STORE_BACKEND_SETTING,
            get_resource_writer,
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir)
            ctx.setting_values[RESOURCE_STORE_BACKEND_SETTING.name] = "memory"
            writer = get_resource_writer(ctx)
            self.assertIsInstance(writer, InMemoryRegistryWriter)

    def test_sqlite_backend_selected_by_setting(self):
        from indexers.resource_writer import (
            RESOURCE_STORE_BACKEND_SETTING,
            RESOURCE_STORE_PATH_SETTING,
            get_resource_writer,
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir, sqlite=True)
            ctx.setting_values[RESOURCE_STORE_BACKEND_SETTING.name] = "sqlite"
            ctx.setting_values[RESOURCE_STORE_PATH_SETTING.name] = "custom/path.sqlite"
            writer = get_resource_writer(ctx)
            self.assertIsInstance(writer, SqliteResourceWriter)
            self.assertEqual(writer.db_output_path, "custom/path.sqlite")

    def test_unknown_backend_falls_back_to_in_memory(self):
        from indexers.resource_writer import (
            InMemoryRegistryWriter,
            RESOURCE_STORE_BACKEND_SETTING,
            get_resource_writer,
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir)
            ctx.setting_values[RESOURCE_STORE_BACKEND_SETTING.name] = "postgres"
            writer = get_resource_writer(ctx)
            self.assertIsInstance(writer, InMemoryRegistryWriter)

    def test_finalize_resource_store_writes_sqlite_from_registry(self):
        from indexers.resource_writer import (
            RESOURCE_STORE_BACKEND_SETTING,
            finalize_resource_store,
        )
        from resources import REGISTRY_PROPERTY_NAME

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir, sqlite=True)
            ctx.setting_values[RESOURCE_STORE_BACKEND_SETTING.name] = "sqlite"
            ctx.get_property(REGISTRY_PROPERTY_NAME).add_resource(
                "kubernetes",
                "Namespace",
                "default",
                "default",
                {"lod": "basic"},
            )
            finalize_resource_store(ctx)
            db_path = os.path.join(tmpdir, "resources.sqlite")
            self.assertTrue(os.path.exists(db_path))
            conn = sqlite3.connect(db_path)
            try:
                rows = conn.execute("SELECT COUNT(*) FROM resources").fetchone()[0]
                self.assertEqual(rows, 1)
            finally:
                conn.close()

    def test_persist_workspace_artifacts(self):
        from renderers.rendered_artifacts import record_rendered_artifact

        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir, sqlite=True)
            ctx.setting_values["WORKSPACE_NAME"] = "demo-ws"
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/my-app/slx.yaml",
                "kind: ServiceLevelX\nmetadata:\n  name: my-app\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/my-app/sli.yaml",
                "kind: ServiceLevelIndicator\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/my-app/runbook.yaml",
                "kind: Runbook\n",
            )
            persist_sqlite_store(ctx, db_path="resources.sqlite")

            conn = open_database(os.path.join(tmpdir, "resources.sqlite"))
            try:
                self.assertEqual(count_workspace_artifacts(conn, workspace_name="demo-ws"), 3)
                rows = search_workspace_artifacts(
                    conn, workspace_name="demo-ws", artifact_kind="slx"
                )
                self.assertEqual(len(rows), 1)
                self.assertIn("ServiceLevelX", rows[0]["content"])
            finally:
                conn.close()


class ReadApiTests(TestCase):
    def test_list_resource_types_includes_custom_attributes(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _make_context(tmpdir, sqlite=True)
            writer = SqliteResourceWriter(ctx, db_path="resources.sqlite")
            writer.add_resource(
                "azure",
                "resource_group",
                "rg1",
                "rg1",
                {"subscription_id": "sub-1", "tags": {}},
            )
            writer.finalize()
            persist_sqlite_store(ctx, db_path="resources.sqlite")

            conn = open_database(os.path.join(tmpdir, "resources.sqlite"))
            try:
                types = list_resource_types(conn, platform="azure")
                self.assertEqual(len(types), 1)
                self.assertEqual(types[0]["name"], "resource_group")
                self.assertIn("subscription_id", types[0]["custom_attributes"])
                self.assertIn("tags", types[0]["custom_attributes"])
            finally:
                conn.close()

    def test_attributes_json_is_deterministic(self):
        # Stable serialisation matters for diff-based tests downstream;
        # encode the same dict twice in different insertion orders and
        # confirm the JSON string matches.
        first = encode_attributes({"b": 2, "a": 1, "c": [3, 2, 1]})
        second = encode_attributes({"a": 1, "b": 2, "c": [3, 2, 1]})
        self.assertEqual(first, second)


class SnapshotHelperTests(TestCase):
    """Cover the lower-level ``_snapshot_registry`` directly so debug scripts
    can re-use it without instantiating a writer."""

    def test_snapshot_replaces_existing_rows(self):
        from resources import Registry

        with tempfile.TemporaryDirectory() as tmpdir:
            db_file = os.path.join(tmpdir, "snapshot.sqlite")
            conn = sqlite3.connect(db_file)
            try:
                from indexers.sqlite_resource_writer import _init_schema

                _init_schema(conn)

                # First snapshot: one resource.
                reg = Registry()
                reg.add_resource(
                    "azure",
                    "resource_group",
                    "rg1",
                    "rg1",
                    {"subscription_id": "sub-1"},
                )
                _snapshot_registry(conn, reg)
                conn.commit()
                self.assertEqual(
                    conn.execute("SELECT COUNT(*) FROM resources").fetchone()[0], 1
                )

                # Second snapshot with a *different* resource: old rows should
                # be wiped, not appended to.
                reg2 = Registry()
                reg2.add_resource(
                    "azure",
                    "resource_group",
                    "rg2",
                    "rg2",
                    {"subscription_id": "sub-2"},
                )
                _snapshot_registry(conn, reg2)
                conn.commit()

                names = [
                    row[0]
                    for row in conn.execute("SELECT qualified_name FROM resources")
                ]
                self.assertEqual(names, ["rg2"])
            finally:
                conn.close()

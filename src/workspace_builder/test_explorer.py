"""Tests for the resource explorer API."""

from __future__ import annotations

import os
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from indexers.sqlite_resource_writer import persist_sqlite_store
from outputter import FileSystemOutputter
from component import Context
from resources import REGISTRY_PROPERTY_NAME, Registry
from workspace_builder.api import app


def _seed_database(db_path: str) -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        ctx = Context(
            setting_values={"RESOURCE_STORE_BACKEND": "sqlite", "RESOURCE_STORE_PATH": "resources.sqlite"},
            outputter=FileSystemOutputter(tmpdir),
        )
        ctx.set_property(REGISTRY_PROPERTY_NAME, Registry())
        ctx.get_property(REGISTRY_PROPERTY_NAME).add_resource(
            "kubernetes",
            "Namespace",
            "default",
            "default",
            {"lod": "basic"},
        )
        ctx.get_property(REGISTRY_PROPERTY_NAME).add_resource(
            "kubernetes",
            "Deployment",
            "api",
            "default/api",
            {"lod": "detailed"},
        )
        ctx = Context(
            setting_values={
                "RESOURCE_STORE_BACKEND": "sqlite",
                "RESOURCE_STORE_PATH": "resources.sqlite",
                "WORKSPACE_NAME": "demo-ws",
            },
            outputter=FileSystemOutputter(tmpdir),
        )
        ctx.set_property(REGISTRY_PROPERTY_NAME, Registry())
        ctx.get_property(REGISTRY_PROPERTY_NAME).add_resource(
            "kubernetes",
            "Namespace",
            "default",
            "default",
            {"lod": "basic"},
        )
        ctx.get_property(REGISTRY_PROPERTY_NAME).add_resource(
            "kubernetes",
            "Deployment",
            "api",
            "default/api",
            {"lod": "detailed"},
        )
        from renderers.rendered_artifacts import record_rendered_artifact

        record_rendered_artifact(
            ctx,
            "workspaces/demo-ws/slxs/my-app/slx.yaml",
            "kind: ServiceLevelX\n",
        )
        persist_sqlite_store(ctx, db_path="resources.sqlite")
        with open(os.path.join(tmpdir, "resources.sqlite"), "rb") as src, open(db_path, "wb") as dst:
            dst.write(src.read())


class ExplorerApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_explorer_summary_and_resources(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                summary = self.client.get("/explorer/api/summary")
                self.assertEqual(200, summary.status_code)
                data = summary.json()
                self.assertEqual(2, data["resource_count"])
                self.assertGreaterEqual(data.get("artifact_count", 0), 1)
                self.assertIn("kubernetes", data["platforms"])

                resources = self.client.get("/explorer/api/resources?platform=kubernetes")
                self.assertEqual(200, resources.status_code)
                payload = resources.json()
                self.assertEqual(2, payload["total"])
                self.assertEqual(2, len(payload["items"]))

                detail = self.client.get(
                    "/explorer/api/resource",
                    params={
                        "platform": "kubernetes",
                        "resource_type": "Namespace",
                        "qualified_name": "default",
                    },
                )
                self.assertEqual(200, detail.status_code)
                self.assertEqual("default", detail.json()["name"])

    def test_explorer_page_loads(self):
        response = self.client.get("/explorer/")
        self.assertEqual(200, response.status_code)
        self.assertIn("Workspace Explorer", response.text)

    def test_explorer_slx_bundles(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                response = self.client.get("/explorer/api/slx-bundles")
                self.assertEqual(200, response.status_code)
                payload = response.json()
                self.assertGreaterEqual(payload["total"], 1)
                bundle = payload["items"][0]
                self.assertEqual("demo-ws", bundle["workspace_name"])
                self.assertIn("slx", bundle["kinds"])
                self.assertTrue(bundle["has_slx"])
                self.assertEqual(1, bundle["file_count"])

    def test_missing_database_returns_404(self):
        with patch.dict(
            os.environ,
            {"RW_RESOURCE_STORE_PATH": "/tmp/does-not-exist/resources.sqlite"},
            clear=False,
        ):
            response = self.client.get("/explorer/api/summary")
            self.assertEqual(404, response.status_code)

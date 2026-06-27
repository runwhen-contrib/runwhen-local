"""Tests for the workspace-builder landing page (``/`` and ``/api/overview``)."""

from __future__ import annotations

import json
import os
import tempfile
import textwrap
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from indexers.sqlite_resource_writer import (
    _init_schema,
    open_database,
)
from workspace_builder.api import app
from workspace_builder.home import redact_workspace_info


def _seed_resource_store(db_path: str) -> None:
    """Write a tiny resource + artifact snapshot so the overview API has
    something to summarise."""
    conn = open_database(db_path)
    _init_schema(conn)
    now = "2026-06-26T00:00:00Z"
    # Resource rows have a (platform, resource_type) FK that points into the
    # ``resource_types`` table, so seed the parents first.
    conn.execute("INSERT INTO platforms (name) VALUES ('kubernetes')")
    conn.executemany(
        "INSERT INTO resource_types (platform, name, custom_attributes) "
        "VALUES (?, ?, ?)",
        [
            ("kubernetes", "Namespace", "[]"),
            ("kubernetes", "Deployment", "[]"),
        ],
    )
    conn.executemany(
        "INSERT INTO resources (platform, resource_type, qualified_name, name, "
        "attributes_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
        [
            ("kubernetes", "Namespace", "default", "default", "{}", now, now),
            ("kubernetes", "Deployment", "default/api", "api", "{}", now, now),
        ],
    )
    conn.executemany(
        "INSERT INTO workspace_artifacts (workspace_name, relative_path, "
        "artifact_kind, media_type, content, slx_directory, created_at, updated_at) "
        "VALUES (?,?,?,?,?,?,?,?)",
        [
            (
                "demo-ws",
                "workspaces/demo-ws/slxs/my-app/slx.yaml",
                "slx",
                "application/yaml",
                'spec:\n  alias: "Demo App Health"\n',
                "workspaces/demo-ws/slxs/my-app",
                now,
                now,
            ),
        ],
    )
    conn.commit()
    conn.close()


def _write_workspace_info(path: str) -> None:
    """Write a workspaceInfo.yaml fixture that exercises the redaction path."""
    with open(path, "w", encoding="utf-8") as f:
        f.write(
            textwrap.dedent(
                """
                workspaceName: demo-workspace
                workspaceOwnerEmail: ops@example.com
                defaultLOD: basic
                useLocalGit: false
                azureIndexerBackend: azureapi
                cloudConfig:
                  azure:
                    subscriptionId: 11111111-1111-1111-1111-111111111111
                    tenantId: 22222222-2222-2222-2222-222222222222
                    clientId: 33333333-3333-3333-3333-333333333333
                    clientSecret: super-secret-value
                  kubernetes:
                    enabled: true
                codeCollections:
                  - repoURL: https://github.com/runwhen-contrib/rw-cli-codecollection.git
                    branch: main
                  - repoURL: https://github.com/runwhen-contrib/rw-public-codecollection.git
                """
            ).strip()
            + "\n"
        )


class HomePageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_home_page_loads_and_links_to_explorer(self):
        response = self.client.get("/")
        self.assertEqual(200, response.status_code)
        self.assertIn("RunWhen Local control center", response.text)
        # The explorer card is the primary call-to-action.
        self.assertIn('href="/explorer/"', response.text)
        # Future-work cards are placeholders, not broken links.
        self.assertIn("Troubleshooting tools", response.text)
        self.assertIn("Discovery activity", response.text)

    def test_overview_is_tolerant_of_missing_db_and_workspace_info(self):
        # Point at a non-existent DB and clear the workspace-info hint so
        # both sections degrade gracefully instead of 500ing.
        with patch.dict(
            os.environ,
            {
                "RW_RESOURCE_STORE_PATH": "/tmp/does-not-exist/resources.sqlite",
                "RW_WORKSPACE_INFO_PATH": "/tmp/does-not-exist.yaml",
            },
            clear=False,
        ):
            response = self.client.get("/api/overview")
        self.assertEqual(200, response.status_code)
        payload = response.json()
        self.assertIn("error", payload["resource_store"])
        self.assertIn("error", payload["workspace_info"])
        # The health section should still report a usable shape.
        self.assertIn("service_status", payload["health"])

    def test_overview_returns_store_and_redacted_config(self):
        with tempfile.TemporaryDirectory() as tmp:
            db_path = os.path.join(tmp, "resources.sqlite")
            ws_path = os.path.join(tmp, "workspaceInfo.yaml")
            _seed_resource_store(db_path)
            _write_workspace_info(ws_path)
            with patch.dict(
                os.environ,
                {
                    "RW_RESOURCE_STORE_PATH": db_path,
                    "RW_WORKSPACE_INFO_PATH": ws_path,
                },
                clear=False,
            ):
                response = self.client.get("/api/overview")
        self.assertEqual(200, response.status_code, response.text)
        payload = response.json()

        store = payload["resource_store"]
        self.assertEqual(2, store["resource_count"])
        self.assertGreaterEqual(store["artifact_count"], 1)
        self.assertEqual(1, store["slx_bundle_count"])
        # SLX bundle recap pulls the human-readable display_name through.
        self.assertEqual(
            "Demo App Health", store["recent_slx_bundles"][0]["display_name"]
        )
        self.assertEqual("my-app", store["recent_slx_bundles"][0]["slx_name"])
        self.assertIn("kubernetes", store["platforms"])

        ws = payload["workspace_info"]
        self.assertEqual(ws_path, ws["path"])
        self.assertEqual("demo-workspace", ws["summary"]["workspaceName"])
        self.assertIn("azure", ws["summary"]["platforms"])
        self.assertIn("kubernetes", ws["summary"]["platforms"])
        # Two code collections were declared; both surface in the summary.
        self.assertEqual(2, len(ws["summary"]["codeCollections"]))

        # Critical: the rendered tree must redact secrets while leaving
        # non-sensitive identifiers (subscription / tenant / client id)
        # alone so operators can still verify the config from the UI.
        azure = ws["redacted"]["cloudConfig"]["azure"]
        self.assertEqual("***REDACTED***", azure["clientSecret"])
        self.assertEqual(
            "11111111-1111-1111-1111-111111111111", azure["subscriptionId"]
        )
        self.assertEqual(
            "33333333-3333-3333-3333-333333333333", azure["clientId"]
        )


class RedactWorkspaceInfoTests(unittest.TestCase):
    def test_redacts_known_sensitive_keys_case_insensitively(self):
        tree = {
            "clientSecret": "abc",
            "AuthToken": "def",
            "api_key": "ghi",
            "GOOGLE_APPLICATION_CREDENTIALS": "/path/to.json",
            "nested": {
                "spSecretName": "azure-creds",
                "password": "p",
                "harmless": "value",
            },
            "items": [
                {"token": "should-mask", "name": "keep"},
                "raw-string",
            ],
        }
        redacted = redact_workspace_info(tree)
        self.assertEqual("***REDACTED***", redacted["clientSecret"])
        self.assertEqual("***REDACTED***", redacted["AuthToken"])
        self.assertEqual("***REDACTED***", redacted["api_key"])
        self.assertEqual(
            "***REDACTED***", redacted["GOOGLE_APPLICATION_CREDENTIALS"]
        )
        self.assertEqual("***REDACTED***", redacted["nested"]["spSecretName"])
        self.assertEqual("***REDACTED***", redacted["nested"]["password"])
        self.assertEqual("value", redacted["nested"]["harmless"])
        # List elements are walked too.
        self.assertEqual("***REDACTED***", redacted["items"][0]["token"])
        self.assertEqual("keep", redacted["items"][0]["name"])
        self.assertEqual("raw-string", redacted["items"][1])

    def test_leaves_empty_or_missing_values_untouched(self):
        # Don't mask empty strings or None — those are usually placeholders
        # the operator wants to spot and fix.
        self.assertEqual(
            {"clientSecret": "", "authToken": None},
            redact_workspace_info({"clientSecret": "", "authToken": None}),
        )

    def test_handles_non_dict_root(self):
        self.assertEqual("raw", redact_workspace_info("raw"))
        self.assertEqual([1, 2], redact_workspace_info([1, 2]))


if __name__ == "__main__":  # pragma: no cover
    unittest.main()

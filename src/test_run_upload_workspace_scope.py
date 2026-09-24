"""
Unit tests for the workspaceScope plumbing in src/run.py's shared upload code
path (used by both the `upload` and `run --upload` commands): the
workspace-scope.json a prior run wrote to the output directory root is
attached to the upload POST body as "workspaceScope", but never lands in the
uploaded tarball.
"""

from __future__ import annotations

import base64
import io
import json
import os
import sys
import tarfile
import tempfile
from unittest import TestCase
from unittest.mock import MagicMock, patch

import yaml

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

import run  # noqa: E402


def _fake_response(json_data, status_code=200):
    response = MagicMock()
    response.status_code = status_code
    response.json.return_value = json_data
    return response


class _UploadTestBase(TestCase):
    """Common fixture: a base directory with workspaceInfo.yaml/uploadInfo.yaml
    and an output directory shaped like a prior `run` produced it -- a
    workspaces/<ws>/ tree (what gets tarred) plus workspace-scope.json at the
    output root (what must NOT get tarred)."""

    WORKSPACE_NAME = "test-workspace"

    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp_dir.cleanup)
        self.base_directory = self.tmp_dir.name

        workspace_info = {
            "workspaceName": self.WORKSPACE_NAME,
            "workspaceOwnerEmail": "owner@example.com",
            "cloudConfig": {},
        }
        with open(os.path.join(self.base_directory, "workspaceInfo.yaml"), "w") as f:
            yaml.safe_dump(workspace_info, f)

        upload_info = {
            "token": "not-a-real-token",
            "defaultLocation": "location-1",
        }
        with open(os.path.join(self.base_directory, "uploadInfo.yaml"), "w") as f:
            yaml.safe_dump(upload_info, f)

        self.output_path = os.path.join(self.base_directory, "output")
        workspace_dir = os.path.join(self.output_path, "workspaces", self.WORKSPACE_NAME)
        os.makedirs(workspace_dir, exist_ok=True)
        with open(os.path.join(workspace_dir, "slx.yaml"), "w") as f:
            f.write("name: dummy\n")

    def _run_upload(self):
        captured = {}

        def fake_post(url, data=None, headers=None, verify=None):
            captured["url"] = url
            captured["body"] = json.loads(data)
            return _fake_response({"status": "ok"})

        argv = ["run.py", "upload", "--base-directory", self.base_directory]
        # run.main() unconditionally calls clear_stale_kubeconfig_artifacts(),
        # which removes ~/.kube/config and friends via os.path.expanduser("~").
        # Sandbox HOME to a throwaway directory so this test can NEVER touch
        # the real machine's kubeconfig.
        fake_home = os.path.join(self.base_directory, "fake-home")
        os.makedirs(fake_home, exist_ok=True)
        with patch.object(sys, "argv", argv), \
             patch.dict(os.environ, {"HOME": fake_home}), \
             patch("run.requests.get", return_value=_fake_response({"version": "0.12.2"})), \
             patch("run.requests.post", side_effect=fake_post):
            run.main()

        return captured


class UploadCarriesWorkspaceScopeTest(_UploadTestBase):
    def setUp(self):
        super().setUp()
        self.workspace_scope = {
            "version": 1,
            "generatedAt": "2026-09-25T10:00:00Z",
            "builderVersion": "0.12.2",
            "kubernetes": {"clusters": [{"name": "prod", "context": "prod-ctx"}]},
        }
        with open(os.path.join(self.output_path, run.WORKSPACE_SCOPE_FILENAME), "w") as f:
            json.dump(self.workspace_scope, f)

    def test_upload_body_carries_workspace_scope(self):
        captured = self._run_upload()
        self.assertIn("workspaceScope", captured["body"])
        self.assertEqual(captured["body"]["workspaceScope"], self.workspace_scope)

    def test_uploaded_tarball_does_not_contain_workspace_scope_file(self):
        captured = self._run_upload()
        archive_bytes = base64.b64decode(captured["body"]["output"])
        with tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r") as archive:
            names = archive.getnames()
        self.assertTrue(names, "expected the uploaded tarball to contain the dummy slx.yaml fixture")
        self.assertFalse(
            any(run.WORKSPACE_SCOPE_FILENAME in name for name in names),
            f"workspace-scope.json must never be tarred for upload; got entries: {names}",
        )


class UploadWithoutWorkspaceScopeFileTest(_UploadTestBase):
    """No prior `run` wrote workspace-scope.json (e.g. Kubernetes indexing
    never ran) -- upload must proceed normally without a workspaceScope key."""

    def test_upload_body_omits_workspace_scope_when_file_is_absent(self):
        captured = self._run_upload()
        self.assertNotIn("workspaceScope", captured["body"])


if __name__ == "__main__":
    import unittest
    unittest.main()


class WriteWorkspaceScopeFileTest(TestCase):
    def test_empty_scope_removes_a_previous_runs_file(self):
        with tempfile.TemporaryDirectory() as output_path:
            run._write_workspace_scope_file(output_path, {"version": 1, "kubernetes": {"clusters": []}})
            self.assertIsNotNone(run._read_workspace_scope_file(output_path))

            run._write_workspace_scope_file(output_path, None)

            self.assertFalse(os.path.exists(os.path.join(output_path, run.WORKSPACE_SCOPE_FILENAME)))
            self.assertIsNone(run._read_workspace_scope_file(output_path))

import io
import os
import sys
import tarfile
import tempfile
import unittest
from base64 import b64decode

import yaml

# Make src/ importable so we can reach the workspace builder + its test helper.
_SRC = os.path.join(os.path.dirname(__file__), "..", "..", "src")
sys.path.insert(0, os.path.abspath(_SRC))

from scripts.simulator.generate_scale_config import build_config

BUNDLES = ["k8s-deployment-ops", "k8s-statefulset-ops", "k8s-ingress-healthcheck"]


class IntegrationPipelineTestCase(unittest.TestCase):
    def test_generated_config_renders_expected_slx_count(self):
        # workspace_builder bootstraps at import time and loads
        # `default-code-collections.yaml` via a path relative to the process
        # cwd, so cwd must be `src/` before importing it (mirrors how the
        # workspace-builder test suite is normally invoked from `src/`).
        self.addCleanup(os.chdir, os.getcwd())
        os.chdir(_SRC)
        from fastapi.testclient import TestClient
        from workspace_builder.api import app
        from workspace_builder.tests_simulator import (
            _materialize_simulator_codecollection_repo,
        )

        cfg = build_config(20, 3, 4, seed=1, sli_ratio=0.25, slo_ratio=0.10,
                           code_bundles=BUNDLES)
        cc = _materialize_simulator_codecollection_repo(tempfile.mkdtemp())
        req = {
            "components": "test_synth,generation_rules,test_groups,render_output_items",
            "workspaceName": "ws-gen", "workspaceOwnerEmail": "t@e.com",
            "papiURL": "http://papi.local", "locationId": "loc-1",
            "testConfig": yaml.safe_dump(cfg),
            "codeCollections": [{"repoURL": cc, "ref": "main"}],
            "writeWorkspaceFilesToDisk": True,
        }
        resp = TestClient(app).post("/run/", json=req)
        self.assertEqual(resp.status_code, 200, resp.text[:500])
        arch = tarfile.open(fileobj=io.BytesIO(b64decode(resp.json()["output"])), mode="r")
        slx_dirs = {
            m.name.split("/slxs/", 1)[1].split("/", 1)[0]
            for m in arch.getmembers()
            if "/slxs/" in m.name and m.name.endswith("/slx.yaml")
        }
        self.assertEqual(len(slx_dirs), 20)

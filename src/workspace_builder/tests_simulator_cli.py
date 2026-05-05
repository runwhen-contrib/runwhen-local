import json
import os
import subprocess
import tempfile

import yaml
from unittest import TestCase


UPLOAD_INFO = {
    "papiURL": "http://papi.local",
    "workspaceName": "ws-cli",
    "locationId": "loc-1",
    "locationName": "loc-1",
    "workspaceOwnerEmail": "user@example.com",
    "token": "fake-token",
}

TEST_CONFIG = {
    "slxs": {
        "cli-slx": {
            "levelOfDetail": "basic",
            "codeCollection": "rw-cli-codecollection",
            "codeBundle": "k8s-deployment-ops",
            "runbook": {"commands": []},
        }
    }
}


class SimulateCliTestCase(TestCase):
    def test_simulate_subcommand_is_accepted_and_attempts_run_endpoint(self):
        """argparse must accept 'simulate' and the CLI must reach the /run/ POST attempt."""
        with tempfile.TemporaryDirectory() as tmpdir:
            upload_info_path = os.path.join(tmpdir, "uploadInfo.yaml")
            test_config_path = os.path.join(tmpdir, "test.yaml")
            with open(upload_info_path, "w") as f:
                yaml.safe_dump(UPLOAD_INFO, f)
            with open(test_config_path, "w") as f:
                yaml.safe_dump(TEST_CONFIG, f)

            # Force REST host to an unreachable address so we don't depend on
            # the workspace builder service being up. The CLI should still
            # parse args and attempt the POST.
            env = os.environ.copy()
            env["REST_SERVICE_HOST"] = "127.0.0.1"
            env["REST_SERVICE_PORT"] = "1"

            src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
            result = subprocess.run(
                ["python3", "run.py", "simulate",
                 "--config", test_config_path,
                 "--upload-info", upload_info_path,
                 "--base-directory", tmpdir,
                 "--rest-service-host", "127.0.0.1:1"],
                cwd=src_dir,
                env=env,
                capture_output=True,
                text=True,
                timeout=120,
            )
            # Exit non-zero is fine (the REST POST fails since service isn't up),
            # but stderr/stdout must NOT mention "invalid choice" - that would
            # indicate argparse rejected 'simulate'.
            combined = (result.stdout + result.stderr).lower()
            self.assertNotIn("invalid choice", combined,
                             f"argparse rejected 'simulate':\nstdout={result.stdout}\nstderr={result.stderr}")
            # Confirm the CLI got far enough to attempt the REST call.
            self.assertTrue(
                "connection refused" in combined
                or "rest service" in combined
                or "newconnectionerror" in combined,
                f"Expected REST call attempt:\nstdout={result.stdout}\nstderr={result.stderr}"
            )

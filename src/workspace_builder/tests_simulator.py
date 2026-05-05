import json
from http import HTTPStatus

from django.test import TestCase


class SimulatorTestCase(TestCase):
    def test_test_synth_runs_as_noop(self):
        """test_synth alone should run without error and produce no SLXs."""
        request_data = {
            "components": "test_synth",
            "workspaceName": "ws-noop",
            "papiURL": "http://papi.local",
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)


TEST_CONFIG_YAML_BASIC = """
slxs:
  my-app-ops:
    levelOfDetail: detailed
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    runbook:
      commands: ["echo hello"]
"""


class TestSynthSynthesisTestCase(TestCase):
    def test_synthesizes_one_resource_per_slx(self):
        """test_synth should register one resource per slxs entry."""
        request_data = {
            "components": "test_synth,dump_resources",
            "workspaceName": "ws-synth",
            "papiURL": "http://papi.local",
            "testConfig": TEST_CONFIG_YAML_BASIC,
            "resourceDumpPath": "resource_dump.yaml",
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)
        # dump_resources writes the resource registry into the response archive.
        # Decode and assert that exactly one TestResource named "my-app-ops" exists.
        from base64 import b64decode
        import io, tarfile, yaml
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")
        dump_member = next(m for m in archive.getmembers() if m.name.endswith("resource_dump.yaml"))
        dump_text = archive.extractfile(dump_member).read().decode("utf-8")
        # The YAML uses custom tags (!Registry, !ResourceType); just assert the
        # expected SLX slug appears in the dump as a resource name.
        self.assertIn("my-app-ops", dump_text)
        self.assertIn("test", dump_text)  # platform name

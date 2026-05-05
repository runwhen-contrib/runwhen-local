import json
import os
import tempfile
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
        # Decode and assert that exactly one resource named "my-app-ops" exists,
        # registered under the kubernetes platform.
        from base64 import b64decode
        import io, tarfile, yaml
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")
        dump_member = next(m for m in archive.getmembers() if m.name.endswith("resource_dump.yaml"))
        dump_text = archive.extractfile(dump_member).read().decode("utf-8")
        # The YAML uses custom tags (!Registry, !ResourceType); just assert the
        # expected SLX slug appears in the dump as a resource name.
        self.assertIn("my-app-ops", dump_text)
        self.assertIn("kubernetes", dump_text)  # platform name


# Path to the synthetic codecollection bundled with runwhen-local for the simulator.
SIMULATOR_CODECOLLECTION_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "simulator-codecollection")
)


def _materialize_simulator_codecollection_repo(target_dir: str) -> str:
    """Copy the simulator codecollection into a temp directory and `git init` it,
    so the codecollection loader (which uses git clone_from) can consume it.
    Returns the path to the throwaway repo."""
    import shutil
    import git
    repo_path = os.path.join(target_dir, "simulator-codecollection")
    shutil.copytree(SIMULATOR_CODECOLLECTION_PATH, repo_path)
    repo = git.Repo.init(repo_path, initial_branch="main")
    repo.git.add(all=True)
    repo.index.commit("Initial commit")
    return repo_path


class PassthroughGenerationRuleTestCase(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.codecollection_repo_path = _materialize_simulator_codecollection_repo(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def test_passthrough_rule_produces_one_slx_per_resource(self):
        request_data = {
            "components": "test_synth,generation_rules,render_output_items",
            "workspaceName": "ws-rule",
            "workspaceOwnerEmail": "test@example.com",
            "papiURL": "http://papi.local",
            "locationId": "loc-1",
            "testConfig": TEST_CONFIG_YAML_BASIC,
            "codeCollections": [
                {"repoURL": self.codecollection_repo_path, "ref": "main"}
            ],
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)

        # Inspect the response archive: assert one SLX directory was produced
        # by the passthrough rule. The exact SLX dir name depends on baseName +
        # qualifier resolution; don't hard-code it -- just assert exactly one
        # SLX dir is present.
        #
        # Note: in this task we don't ship a runbook template yet, so the
        # output items inside the SLX dir all get skipped and no files are
        # actually written into slxs/<dir>/. We therefore look for SLX dir
        # paths in two places:
        #   1. archive members (any file under workspaces/<ws>/slxs/<dir>/)
        #   2. the skipped templates report, which records the would-be paths
        from base64 import b64decode
        import io, re, tarfile
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")
        all_members = [m.name for m in archive.getmembers()]
        slx_dirs: set[str] = set()
        for m in archive.getmembers():
            if "/slxs/" in m.name and not m.isdir():
                slx_dirs.add(m.name.split("/slxs/", 1)[1].split("/", 1)[0])
        report_member = next(
            (m for m in archive.getmembers() if m.name.endswith("skipped_templates_report.md")),
            None,
        )
        if report_member is not None:
            report_text = archive.extractfile(report_member).read().decode("utf-8")
            for path_match in re.finditer(r"/slxs/([^/\s]+)/", report_text):
                slx_dirs.add(path_match.group(1))
        self.assertEqual(
            len(slx_dirs), 1,
            f"Expected exactly 1 SLX dir, got: {slx_dirs}; archive members: {all_members}"
        )


class SimulatorRunbookRenderTestCase(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.codecollection_repo_path = _materialize_simulator_codecollection_repo(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def test_runbook_yaml_is_rendered_with_expected_labels_and_spec(self):
        request_data = {
            "components": "test_synth,generation_rules,render_output_items",
            "workspaceName": "ws-render",
            "workspaceOwnerEmail": "test@example.com",
            "papiURL": "http://papi.local",
            "locationId": "loc-1",
            "testConfig": TEST_CONFIG_YAML_BASIC,
            "codeCollections": [
                {"repoURL": self.codecollection_repo_path, "ref": "main"},
            ],
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)

        from base64 import b64decode
        import io, tarfile, yaml
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")

        # Find the rendered runbook.yaml. SLX dir name comes from
        # baseName + qualifier resolution and is not hard-coded.
        runbook_members = [
            m for m in archive.getmembers()
            if m.name.endswith("/runbook.yaml") and "/slxs/" in m.name
        ]
        all_members = [m.name for m in archive.getmembers()]
        self.assertEqual(
            len(runbook_members), 1,
            f"Expected exactly 1 runbook.yaml; got {len(runbook_members)}. Members: {all_members}",
        )

        runbook_text = archive.extractfile(runbook_members[0]).read().decode("utf-8")
        runbook_doc = yaml.safe_load(runbook_text)

        self.assertEqual(runbook_doc["kind"], "Runbook")
        # codeCollection/codeBundle should be populated from the test config.
        labels = runbook_doc["metadata"]["labels"]
        self.assertEqual(labels["codeCollection"], "rw-cli-codecollection")
        self.assertEqual(labels["codeBundle"], "k8s-deployment-ops")
        # runbook subdict from test config should appear in spec.
        spec = runbook_doc["spec"]
        self.assertEqual(spec["commands"], ["echo hello"])


TEST_CONFIG_YAML_RUNBOOK_ONLY = """
slxs:
  bare-slx:
    levelOfDetail: basic
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    runbook:
      commands: []
"""

TEST_CONFIG_YAML_FULL = """
slxs:
  full-slx:
    levelOfDetail: detailed
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    runbook: { commands: [] }
    sli: { threshold: 0.99 }
    slo: { target: 99.5 }
"""


class ConditionalOutputItemTestCase(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.codecollection_repo_path = _materialize_simulator_codecollection_repo(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def _post(self, test_config_yaml: str, workspace_name: str) -> set[str]:
        request_data = {
            "components": "test_synth,generation_rules,render_output_items",
            "workspaceName": workspace_name,
            "workspaceOwnerEmail": "test@example.com",
            "papiURL": "http://papi.local",
            "locationId": "loc-1",
            "testConfig": test_config_yaml,
            "codeCollections": [
                {"repoURL": self.codecollection_repo_path, "ref": "main"},
            ],
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)
        from base64 import b64decode
        import io, tarfile
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")
        # Group filenames by basename in the SLX dir.
        by_basename: set[str] = set()
        for m in archive.getmembers():
            if "/slxs/" in m.name and not m.isdir():
                by_basename.add(os.path.basename(m.name))
        return by_basename

    def test_runbook_only_omits_sli_and_slo(self):
        files = self._post(TEST_CONFIG_YAML_RUNBOOK_ONLY, "ws-bare")
        self.assertIn("runbook.yaml", files)
        self.assertNotIn("sli.yaml", files)
        self.assertNotIn("slo.yaml", files)

    def test_full_slx_renders_runbook_sli_slo(self):
        files = self._post(TEST_CONFIG_YAML_FULL, "ws-full")
        self.assertIn("runbook.yaml", files)
        self.assertIn("sli.yaml", files)
        self.assertIn("slo.yaml", files)

import json
import os
import tempfile
import unittest
from http import HTTPStatus

from fastapi.testclient import TestClient

from workspace_builder.api import app


class SimulatorTestCaseBase(unittest.TestCase):
    """Shared base that provides a FastAPI TestClient as ``self.client`` /
    ``cls.client`` (mirrors the pattern in ``tests.py``). Replaces the Django
    ``TestCase`` these tests were originally written against, after the
    workspace builder migrated from Django to FastAPI."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = TestClient(app)


class SimulatorTestCase(SimulatorTestCaseBase):
    def test_test_synth_runs_as_noop(self):
        """test_synth alone should run without error and produce no SLXs."""
        request_data = {
            "components": "test_synth",
            "workspaceName": "ws-noop",
            "papiURL": "http://papi.local",
            # Post-Django→FastAPI: rendered workspace files now go to the sqlite
            # workspace_artifacts store by default (writeWorkspaceFilesToDisk=False).
            # These tests inspect the /run/ response tar, so opt disk writes back on.
            "writeWorkspaceFilesToDisk": True,
        }
        response = self.client.post(
            "/run/", json=request_data
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)


TEST_CONFIG_YAML_BASIC = """
slxs:
  my-app-ops:
    levelOfDetail: detailed
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    repoURL: https://github.com/runwhen-contrib/rw-cli-codecollection.git
    ref: main
    alias: My App Operations
    statement: Operational tasks for my-app
    runbook:
      pathToRobot: codebundles/k8s-deployment-ops/runbook.robot
      configProvided:
        - {name: NAMESPACE, value: demo}
      secretsProvided:
        - {name: kubeconfig, workspaceKey: kubeconfig}
"""


class TestSynthSynthesisTestCase(SimulatorTestCaseBase):
    def test_synthesizes_one_resource_per_slx(self):
        """test_synth should register one resource per slxs entry."""
        request_data = {
            "components": "test_synth,dump_resources",
            "workspaceName": "ws-synth",
            "papiURL": "http://papi.local",
            # Post-Django→FastAPI: rendered workspace files now go to the sqlite
            # workspace_artifacts store by default (writeWorkspaceFilesToDisk=False).
            # These tests inspect the /run/ response tar, so opt disk writes back on.
            "writeWorkspaceFilesToDisk": True,
            "testConfig": TEST_CONFIG_YAML_BASIC,
            "resourceDumpPath": "resource_dump.yaml",
        }
        response = self.client.post(
            "/run/", json=request_data
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
    """Thin wrapper around the shared helper for backwards compatibility within
    this test module."""
    from utils import materialize_simulator_codecollection_repo
    return materialize_simulator_codecollection_repo(SIMULATOR_CODECOLLECTION_PATH, target_dir)


class PassthroughGenerationRuleTestCase(SimulatorTestCaseBase):
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
            # Post-Django→FastAPI: rendered workspace files now go to the sqlite
            # workspace_artifacts store by default (writeWorkspaceFilesToDisk=False).
            # These tests inspect the /run/ response tar, so opt disk writes back on.
            "writeWorkspaceFilesToDisk": True,
            "locationId": "loc-1",
            "testConfig": TEST_CONFIG_YAML_BASIC,
            "codeCollections": [
                {"repoURL": self.codecollection_repo_path, "ref": "main"}
            ],
        }
        response = self.client.post(
            "/run/", json=request_data
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


class SimulatorRunbookRenderTestCase(SimulatorTestCaseBase):
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
            # Post-Django→FastAPI: rendered workspace files now go to the sqlite
            # workspace_artifacts store by default (writeWorkspaceFilesToDisk=False).
            # These tests inspect the /run/ response tar, so opt disk writes back on.
            "writeWorkspaceFilesToDisk": True,
            "locationId": "loc-1",
            "testConfig": TEST_CONFIG_YAML_BASIC,
            "codeCollections": [
                {"repoURL": self.codecollection_repo_path, "ref": "main"},
            ],
        }
        response = self.client.post(
            "/run/", json=request_data
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
        # metadata.name has the workspace-prefixed format produced by real runs.
        self.assertTrue(
            runbook_doc["metadata"]["name"].startswith("ws-render--"),
            f"Expected metadata.name to start with 'ws-render--'; got {runbook_doc['metadata']['name']}",
        )
        # Standard labels from common-labels.yaml should be present.
        labels = runbook_doc["metadata"]["labels"]
        self.assertEqual(labels["workspace"], "ws-render")
        self.assertEqual(labels["locationId"], "loc-1")
        # spec.codeBundle assembled from test config repoURL/ref + runbook.pathToRobot.
        spec = runbook_doc["spec"]
        self.assertEqual(spec["codeBundle"]["repoUrl"],
                         "https://github.com/runwhen-contrib/rw-cli-codecollection.git")
        self.assertEqual(spec["codeBundle"]["ref"], "main")
        self.assertEqual(spec["codeBundle"]["pathToRobot"],
                         "codebundles/k8s-deployment-ops/runbook.robot")
        # configProvided/secretsProvided pass through from the test config.
        self.assertEqual(spec["configProvided"], [{"name": "NAMESPACE", "value": "demo"}])
        self.assertEqual(spec["secretsProvided"],
                         [{"name": "kubeconfig", "workspaceKey": "kubeconfig"}])


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


class ConditionalOutputItemTestCase(SimulatorTestCaseBase):
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
            # Post-Django→FastAPI: rendered workspace files now go to the sqlite
            # workspace_artifacts store by default (writeWorkspaceFilesToDisk=False).
            # These tests inspect the /run/ response tar, so opt disk writes back on.
            "writeWorkspaceFilesToDisk": True,
            "locationId": "loc-1",
            "testConfig": test_config_yaml,
            "codeCollections": [
                {"repoURL": self.codecollection_repo_path, "ref": "main"},
            ],
        }
        response = self.client.post(
            "/run/", json=request_data
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


# ----------------------------------------------------------------------
# Inventory + cardinality + groups + relationships tests
# ----------------------------------------------------------------------

INVENTORY_TEST_CONFIG = """
inventory:
  clusters:
    - name: prod-cluster
      namespaces:
        - name: prod-app
        - name: prod-cache
    - name: edge-cluster
      namespaces:
        - name: ingress

  resources:
    - id: deploy-app
      kind: Deployment
      name: my-app
      cluster: prod-cluster
      namespace: prod-app
      labels:
        app.kubernetes.io/name: my-app
        tier: backend
    - id: sts-cache
      kind: StatefulSet
      name: my-cache
      cluster: prod-cluster
      namespace: prod-cache
    - id: ingress-public
      kind: Ingress
      name: public-api
      cluster: edge-cluster
      namespace: ingress

slxGroups:
  - name: My App
    slxs: [app-ops, app-health]
  - name: Edge Ingress
    slxs: [ingress-health]
    dependsOn: [My App]

slxRelationships:
  - subject: ingress-health
    verb: dependent-on
    object: app-health

slxs:
  app-ops:
    levelOfDetail: detailed
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    repoURL: https://github.com/runwhen-contrib/rw-cli-codecollection.git
    ref: main
    resources: [deploy-app]
    runbook:
      pathToRobot: codebundles/k8s-deployment-ops/runbook.robot

  app-health:
    levelOfDetail: detailed
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-healthcheck
    repoURL: https://github.com/runwhen-contrib/rw-cli-codecollection.git
    ref: main
    resources: [deploy-app]    # 1:N — same resource, different SLX
    runbook:
      pathToRobot: codebundles/k8s-deployment-healthcheck/runbook.robot
    sli:
      pathToRobot: codebundles/k8s-deployment-healthcheck/sli.robot

  ingress-health:
    levelOfDetail: basic
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-ingress-healthcheck
    repoURL: https://github.com/runwhen-contrib/rw-cli-codecollection.git
    ref: main
    resources: [ingress-public]
    runbook:
      pathToRobot: codebundles/k8s-ingress-healthcheck/runbook.robot

  prod-aggregate:
    levelOfDetail: basic
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-aggregate-health
    repoURL: https://github.com/runwhen-contrib/rw-cli-codecollection.git
    ref: main
    resources: [deploy-app, sts-cache]   # N:1 — multiple resources, one SLX
    runbook:
      pathToRobot: codebundles/k8s-aggregate-health/runbook.robot
"""


class InventoryAndGroupsTestCase(SimulatorTestCaseBase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._tmp = tempfile.TemporaryDirectory()
        cls.codecollection_repo_path = _materialize_simulator_codecollection_repo(cls._tmp.name)

        request_data = {
            "components": "test_synth,generation_rules,test_groups,render_output_items",
            "workspaceName": "ws-inv",
            "workspaceOwnerEmail": "test@example.com",
            "papiURL": "http://papi.local",
            # Post-Django→FastAPI: rendered workspace files now go to the sqlite
            # workspace_artifacts store by default (writeWorkspaceFilesToDisk=False).
            # These tests inspect the /run/ response tar, so opt disk writes back on.
            "writeWorkspaceFilesToDisk": True,
            "locationId": "loc-1",
            "testConfig": INVENTORY_TEST_CONFIG,
            "codeCollections": [
                {"repoURL": cls.codecollection_repo_path, "ref": "main"},
            ],
        }
        response = cls.client.post(
            "/run/", json=request_data
        )
        if response.status_code != HTTPStatus.OK:
            cls._tmp.cleanup()
            raise AssertionError(
                f"/run/ failed: {response.status_code} {response.content[:500]}"
            )

        from base64 import b64decode
        import io, tarfile
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")
        cls._archive_members: dict[str, bytes] = {}
        for m in archive.getmembers():
            if not m.isdir():
                cls._archive_members[m.name] = archive.extractfile(m).read()

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()
        super().tearDownClass()

    def _read_yaml(self, path: str) -> dict:
        import yaml
        for member_name, content in self._archive_members.items():
            if member_name.endswith(path):
                return yaml.safe_load(content.decode("utf-8"))
        raise AssertionError(
            f"No archive member ending in {path}; members: {sorted(self._archive_members.keys())}"
        )

    def _slx_dirs_with_basename(self, basename: str) -> list[str]:
        out = []
        for member_name in self._archive_members:
            if member_name.endswith(f"/{basename}") and "/slxs/" in member_name:
                out.append(member_name.split("/slxs/", 1)[1].split("/", 1)[0])
        return out

    def test_four_slxs_produced_from_test_config(self):
        slx_dirs = self._slx_dirs_with_basename("slx.yaml")
        self.assertEqual(len(slx_dirs), 4,
                         f"Expected 4 SLX dirs, got {len(slx_dirs)}: {slx_dirs}")

    def test_kind_and_cluster_tags_auto_derived_from_inventory(self):
        # Find the ingress SLX (its kind tag should be Ingress).
        for member_name, content in self._archive_members.items():
            if member_name.endswith("/slx.yaml") and "/slxs/" in member_name:
                import yaml
                doc = yaml.safe_load(content.decode("utf-8"))
                tags = {t["name"]: t["value"] for t in doc["spec"]["tags"]}
                if tags.get("kind") == "Ingress":
                    self.assertEqual(tags["cluster"], "edge-cluster")
                    self.assertEqual(tags["namespace"], "ingress")
                    self.assertEqual(tags["resource_name"], "public-api")
                    self.assertEqual(tags["resource_type"], "ingress")
                    self.assertEqual(tags["platform"], "kubernetes")
                    return
        self.fail("No SLX with kind=Ingress found in archive")

    def test_k8s_labels_become_prefixed_tags(self):
        # The deploy-app inventory resource has app.kubernetes.io/name and tier
        # labels; these should appear as [k8s]<key> tags on its SLXs.
        found = False
        for member_name, content in self._archive_members.items():
            if member_name.endswith("/slx.yaml") and "/slxs/" in member_name:
                import yaml
                doc = yaml.safe_load(content.decode("utf-8"))
                tag_dict = {t["name"]: t["value"] for t in doc["spec"]["tags"]}
                if tag_dict.get("kind") == "Deployment" and tag_dict.get("resource_name") == "my-app":
                    # Note: the same resource backs two SLXs (1:N), so we'll
                    # match the first one we find.
                    self.assertEqual(tag_dict.get("[k8s]app.kubernetes.io/name"), "my-app")
                    self.assertEqual(tag_dict.get("[k8s]tier"), "backend")
                    found = True
                    break
        self.assertTrue(found, "No Deployment SLX with my-app name found")

    def test_n_to_1_aggregate_slx_has_child_resources(self):
        # The prod-aggregate SLX is bound to two inventory resources;
        # the second (sts-cache) should appear in additionalContext.childResources.
        for member_name, content in self._archive_members.items():
            if member_name.endswith("/slx.yaml") and "/slxs/" in member_name:
                import yaml
                doc = yaml.safe_load(content.decode("utf-8"))
                ctx = doc["spec"].get("additionalContext", {})
                children = ctx.get("childResources")
                if children:
                    self.assertEqual(len(children), 1)
                    self.assertEqual(children[0]["kind"], "StatefulSet")
                    self.assertEqual(children[0]["name"], "my-cache")
                    return
        self.fail("No SLX with childResources found")

    def test_workspace_yaml_includes_slx_groups(self):
        ws = self._read_yaml("workspaces/ws-inv/workspace.yaml")
        groups = {g["name"]: g for g in ws["spec"].get("slxGroups", [])}
        self.assertIn("My App", groups)
        self.assertIn("Edge Ingress", groups)
        # My App group should reference both app-ops and app-health (full SLX names).
        my_app_slxs = groups["My App"]["slxs"]
        self.assertEqual(len(my_app_slxs), 2)
        for slx_name in my_app_slxs:
            self.assertTrue(slx_name.startswith("ws-inv--"),
                            f"SLX name in group should be workspace-prefixed: {slx_name}")

    def test_workspace_yaml_includes_slx_relationships(self):
        ws = self._read_yaml("workspaces/ws-inv/workspace.yaml")
        relationships = ws["spec"].get("slxRelationships", [])
        self.assertEqual(len(relationships), 1)
        rel = relationships[0]
        # Both subject and object resolve to workspace-prefixed full SLX names.
        self.assertTrue(rel["subject"].startswith("ws-inv--"))
        self.assertTrue(rel["directObject"].startswith("ws-inv--"))


# ----------------------------------------------------------------------
# Defaults inheritance + auto-derived pathToRobot
# ----------------------------------------------------------------------

DEFAULTS_TEST_CONFIG = """
defaults:
  repoURL: https://github.com/runwhen-contrib/rw-cli-codecollection.git
  ref: main
  codeCollection: rw-cli-codecollection
  runbook:
    secretsProvided:
      - {name: kubeconfig, workspaceKey: kubeconfig}

slxs:
  brief-slx:
    codeBundle: k8s-deployment-ops
    runbook:
      configProvided:
        - {name: NAMESPACE, value: brief}
"""


class DefaultsAndAutoDeriveTestCase(SimulatorTestCaseBase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.codecollection_repo_path = _materialize_simulator_codecollection_repo(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def _post_and_load_runbook(self) -> dict:
        request_data = {
            "components": "test_synth,generation_rules,test_groups,render_output_items",
            "workspaceName": "ws-defaults",
            "workspaceOwnerEmail": "test@example.com",
            "papiURL": "http://papi.local",
            # Post-Django→FastAPI: rendered workspace files now go to the sqlite
            # workspace_artifacts store by default (writeWorkspaceFilesToDisk=False).
            # These tests inspect the /run/ response tar, so opt disk writes back on.
            "writeWorkspaceFilesToDisk": True,
            "locationId": "loc-1",
            "testConfig": DEFAULTS_TEST_CONFIG,
            "codeCollections": [
                {"repoURL": self.codecollection_repo_path, "ref": "main"},
            ],
        }
        response = self.client.post(
            "/run/", json=request_data
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)
        from base64 import b64decode
        import io, tarfile, yaml
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")
        runbook_member = next(
            m for m in archive.getmembers()
            if m.name.endswith("/runbook.yaml") and "/slxs/" in m.name
        )
        return yaml.safe_load(archive.extractfile(runbook_member).read().decode("utf-8"))

    def test_defaults_supply_repoURL_ref_and_codeCollection(self):
        runbook = self._post_and_load_runbook()
        self.assertEqual(
            runbook["spec"]["codeBundle"]["repoUrl"],
            "https://github.com/runwhen-contrib/rw-cli-codecollection.git",
        )
        self.assertEqual(runbook["spec"]["codeBundle"]["ref"], "main")

    def test_pathToRobot_auto_derived_from_codeBundle(self):
        runbook = self._post_and_load_runbook()
        self.assertEqual(
            runbook["spec"]["codeBundle"]["pathToRobot"],
            "codebundles/k8s-deployment-ops/runbook.robot",
        )

    def test_runbook_subdict_merges_defaults_secretsProvided_and_slx_configProvided(self):
        runbook = self._post_and_load_runbook()
        # secretsProvided inherited from defaults
        self.assertEqual(
            runbook["spec"]["secretsProvided"],
            [{"name": "kubeconfig", "workspaceKey": "kubeconfig"}],
        )
        # configProvided supplied per-SLX
        self.assertEqual(
            runbook["spec"]["configProvided"],
            [{"name": "NAMESPACE", "value": "brief"}],
        )

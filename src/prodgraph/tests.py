from django.test import TestCase
from http import HTTPStatus
import io
import json
import os
import shutil
import tarfile
from typing import Any
from base64 import b64decode

from run import build_rest_request_data


BASE_REQUEST_DATA = {
    # "namespaceLODs": {"kube-system": 0, "kube-public": 0},
    # "defaultLOD": 2,
    "namespaceLODs": {"kube-system": 0, "kube-public": 0, "online-boutique": 2},
    "defaultLOD": 2,
    "defaultWorkspaceName": "my-workspace",
    "workspaceName": "my-workspace",
    "workspaceOwnerEmail": "test@runwhen.com",
    "kubeconfig": "kubeconfig-shea",
    # "kubeconfig": "kubeconfig-no-namespace-list",
    "gcpProjectId": "project-468-304505",
    "workspaceOutputPath": "workspace",
    "defaultLocation": "northamerica-northeast2-01",
    "mapCustomizationRules": "map-customization-rules-test",
    #"namespaces": ["cert-manager", "vault", "runwhen-local", "artifactory", "kube-system"],
    #"namespaces": ["online-boutique"],
    "customDefinitions": {
        "foo": "Hello",
        "bar": 3456,
        "test": [{"a": "def"}, {"b": "ghi"}],
        "promptStrategy": "dummy",
        "x": 0,
        "y": 0,
    },
    # "personas": {
    #     "eager-edgar": {
    #         "search": {
    #             "promptStrategy": "dummy",
    #             "x": 0,
    #             "y": 0,
    #         }
    #     },
    #     "careful-carl": {
    #         "search": {
    #             "promptStrategy": "dummy",
    #             "x": 0,
    #             "y": 0,
    #         }
    #     }
    # }
}

TEST_OUTPUT_DIRECTORY = "TestOutput"


class ProductionComponentTestCase(TestCase):
    """
    Defines some runs of component pipelines for standard use cases.
    Note that these tests can't be run successfully without doing some manual setup:
    - neo4j server must be running with a user/credentials that matches what's set in NEO4J_AUTH
    - the NEO4J_AUTH environment variable must be set with valid credentials
    - for Kubernetes-dependent testing a kubeconfig file must be copied to the prodgraph project root
      directory and named "kubeconfig"
    - for the gcpmetrics-based tests an appropriate shhh module containing the GCP credentials must
      be copied to the project root directory

    So these tests are more for manual execution during development, not as an automated build validation step.

    It would be nice if these were improved to be able to run in a more automated way,
    but the secrets/credential dependencies make that tricky. Also, the dynamic nature of a
    Kubernetes/GCP environment would make it tricky to get reproducible results for any
    tests that are scanning those things.

    So for now these will rely on some degree of manual setup and testing for validation.
    Probably should have some process/check-list in place for any of these manual testing
    requirements that should gate release readiness.
    """

    def run_common(self, components: str, base_request_data: dict[str, Any] = None):
        if base_request_data is None:
            base_request_data = BASE_REQUEST_DATA
        request_data = build_rest_request_data(base_request_data, components=components)
        response = self.client.post("/run/", data=request_data, content_type="application/json")
        self.assertEqual(HTTPStatus.OK, response.status_code)
        response_data = json.loads(response.content)
        archive_bytes = b64decode(response_data["output"])
        archive_file_obj = io.BytesIO(archive_bytes)
        archive = tarfile.open(fileobj=archive_file_obj, mode="r")
        if os.path.exists(TEST_OUTPUT_DIRECTORY):
            shutil.rmtree(TEST_OUTPUT_DIRECTORY)
        os.makedirs(TEST_OUTPUT_DIRECTORY)
        archive.extractall(TEST_OUTPUT_DIRECTORY)

    def test_index_gcpmetrics(self):
        # FIXME: Haven't tested this yet. Need to write the code to copy GCP credentials
        # from the shhh module and pass them in the input arguments.
        # And there needs to be corresponding code on the server side to have a
        # file-based GOOGLE_APPLICATION_CREDENTIALS setting that creates the file
        # and configures the setting to point to it. Need to investigate more about
        # how the credentials are handled by the gcpmetrics components. Would be
        # problematic if the credentials need to be configured by an environment
        # variable (which I think is how it works now?), since that would mean you
        # couldn't have concurrent executions of that component because the env
        # var is global state. Hopefully, there's some way to specify the credentials
        # explicitly.
        self.run_common("gcpmetrics,graphviz,runwhen_yamls")

    def test_index_kubeapi_graph(self):
        self.run_common("kubeapi,hclod,graphviz")

    def test_kubeapi_workspace_gen(self):
        self.run_common("reset_models,kubeapi,hclod,runwhen_default_workspace,runwhen_kube_triage_slxs,runwhen_yamls")

    def test_generation_rules_workspace_gen(self):
        self.run_common("reset_models,kubeapi,runwhen_default_workspace,hclod,generation_rules,render_output_items")

    def test_generation_rules_workspace_gen_no_indexing(self):
        self.run_common("generation_rules,render_output_items")

    def test_dump_resources(self):
        self.run_common("generation_rules,render_output_items,dump_resources")

    def test_graphviz(self):
        self.run_common("graphviz")

    def test_info(self):
        response = self.client.get("/info/")
        self.assertEqual(HTTPStatus.OK, response.status_code)

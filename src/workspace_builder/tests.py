import io
import json
import os
import shutil
import tarfile
import time
from base64 import b64decode
from base64 import b64encode
from http import HTTPStatus
from typing import Any, Union

from django.test import TestCase

from exceptions import WorkspaceBuilderException

TEST_OUTPUT_DIRECTORY = "TestOutput"

BASE_REQUEST_DATA = {
    "namespaceLODs": {"kube-system": 0, "kube-public": 0},
    "defaultLOD": 2,
    "defaultWorkspaceName": "my-workspace",
    "workspaceName": "my-workspace",
    "workspaceOwnerEmail": "test@runwhen.com",
    "kubeconfig": "kubeconfig",
    "gcpProjectId": "project-468-304505",
    "workspaceOutputPath": "workspace",
    "defaultLocation": "northamerica-northeast2-01",
    "mapCustomizationRules": "map-customization-rules-test",
    # "namespaces": ["cert-manager", "vault", "runwhen-local", "artifactory", "kube-system"],
    # "namespaces": ["online-boutique"],
    "customDefinitions": {
        "foo": "Hello",
        "bar": 3456,
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


def read_file(file_path: str, mode="r") -> Union[str, bytes]:
    with open(file_path, mode) as f:
        return f.read()


def build_rest_request_data(base_data: dict[str, Any], **kwargs) -> str:
    request_data = base_data.copy()
    for key, value in kwargs.items():
        request_data[key] = value
    for key in request_data.keys():
        # FIXME: Shouldn't hard-code "kubeconfig" setting here
        # FIXME: Should check that the all of the keys are valid
        # FIXME: Should dynamically determine which settings are file-based settings
        if key == "kubeconfig":
            data = read_file(request_data[key], "rb")
            request_data[key] = b64encode(data).decode('utf-8')
        elif key == 'mapCustomizationRules':
            map_customization_rules_path = request_data[key]
            # FIXME: This code is (mostly) copied from pgrun.py.
            # Should figure out a way to factor this to eliminate the code duplication
            if not os.path.exists(map_customization_rules_path):
                raise WorkspaceBuilderException("Map customization rules path does not exist")
            if os.path.isdir(map_customization_rules_path):
                tar_bytes = io.BytesIO()
                map_customization_rules_tar = tarfile.open(mode="x:gz", fileobj=tar_bytes)
                children = os.listdir(map_customization_rules_path)
                for child in children:
                    child_map_customization_rule_path = os.path.join(map_customization_rules_path, child)
                    data_bytes = read_file(child_map_customization_rule_path, "rb")
                    data_stream: io.BytesIO = io.BytesIO(data_bytes)
                    info = tarfile.TarInfo(child)
                    info.size = len(data_bytes)
                    info.mtime = time.time()
                    map_customization_rules_tar.addfile(info, data_stream)
                map_customization_rules_tar.close()
                map_customization_rules_data = tar_bytes.getvalue()
            else:
                map_customization_rules_data = read_file(map_customization_rules_path, "rb")
            encoded_map_customization_rules = b64encode(map_customization_rules_data).decode('utf-8')
            request_data[key] = encoded_map_customization_rules

    return json.dumps(request_data)


class ProductionComponentTestCase(TestCase):
    """
    Defines some runs of component pipelines for standard use cases.
    Note that these tests can't be run successfully without doing some manual setup:
    - neo4j server must be running with a user/credentials that matches what's set in NEO4J_AUTH
    - the NEO4J_AUTH environment variable must be set with valid credentials
    - for Kubernetes-dependent testing a kubeconfig file must be copied to the workspace builder project root
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

    def test_index_kubeapi_graph(self):
        self.run_common("kubeapi,hclod,graphviz")

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

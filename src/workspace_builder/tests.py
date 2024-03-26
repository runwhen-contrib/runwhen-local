import io
import json
import os
import shutil
import tarfile
import time
from base64 import b64decode
from base64 import b64encode
from http import HTTPStatus
from typing import Any
from utils import read_file
import yaml

from django.test import TestCase

from exceptions import WorkspaceBuilderException
from utils import transform_client_cloud_config

git_repo_root = os.getenv("WB_GIT_REPO_ROOT")
if not git_repo_root:
    print("The WB_GIT_REPO_ROOT environment variable must be set to directory where the "
          "code collection repos are cloned.")

workspace_info_name_default = os.getenv("WB_WORKSPACE_INFO_NAME", "workspaceInfo.yaml")
base_directory_default = os.getenv("WB_BASE_DIRECTORY", "shared")


def build_rest_request_data(base_directory, workspace_info_data: dict[str, Any], **kwargs) -> str:
    request_data = workspace_info_data.copy()
    for key, value in kwargs.items():
        request_data[key] = value
    for key in request_data.keys():
        # FIXME: Shouldn't hard-code "kubeconfig" setting here
        # FIXME: Should check that the all of the keys are valid
        # FIXME: Should dynamically determine which settings are file-based settings
        if key == "kubeconfig":
            data = read_file(request_data[key], "rb")
            request_data[key] = b64encode(data).decode('utf-8')
        elif key == "resourceLoadFile":
            data = read_file(request_data[key], "rb")
            request_data[key] = b64encode(data).decode('utf-8')
        elif key == "cloudConfig":
            cloud_config_data = request_data[key]
            transform_client_cloud_config(base_directory, cloud_config_data)
        elif key == 'mapCustomizationRules':
            map_customization_rules_path = request_data[key]
            # FIXME: This code is (mostly) copied from run.py.
            # Should figure out a way to factor this to eliminate the code duplication
            # FIXME: Seems like the path should be resolved relative to the base directory?
            # Otherwise, I don't see how you could load non-default map customizations from
            # the shared directory?
            # The logic in run.py is sort of weird and I can't remember why it's written that way.
            # Should take another look at this to refresh my memory and clean it up.
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

    def run_common(self, components: str, base_directory=None, workspace_info_name=None):
        if base_directory is None:
            base_directory = base_directory_default
        if workspace_info_name is None:
            workspace_info_name = workspace_info_name_default
        workspace_info_path = os.path.join(base_directory, workspace_info_name)
        workspace_info_text = read_file(workspace_info_path, "r")
        workspace_info_data = yaml.safe_load(workspace_info_text)
        request_data = build_rest_request_data(base_directory, workspace_info_data, components=components)
        response = self.client.post("/run/", data=request_data, content_type="application/json")
        self.assertEqual(HTTPStatus.OK, response.status_code)
        response_data = json.loads(response.content)
        archive_bytes = b64decode(response_data["output"])
        archive_file_obj = io.BytesIO(archive_bytes)
        archive = tarfile.open(fileobj=archive_file_obj, mode="r")
        output_directory_path = os.path.join(base_directory, "output")
        if os.path.exists(output_directory_path):
            shutil.rmtree(output_directory_path)
        os.makedirs(output_directory_path)
        archive.extractall(output_directory_path)
        print(response_data.get("message"))
        warnings = response_data.get("warnings")
        for warning in warnings:
            print("WARNING: " + warning)

    def test_generation_rules_workspace_gen(self):
        self.run_common("load_resources,kubeapi,cloudquery,generation_rules,render_output_items,dump_resources")

    # Need to implement some sort of dump/load feature to the resource registry
    # for this to make sense now that we're not using neo4j anymore.
    # def test_generation_rules_workspace_gen_no_indexing(self):
    #     self.run_common("generation_rules,render_output_items")

    def test_info(self):
        response = self.client.get("/info/")
        self.assertEqual(HTTPStatus.OK, response.status_code)

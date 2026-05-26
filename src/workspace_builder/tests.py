import io
import json
import os
import shutil
import tarfile
import time
import unittest
from base64 import b64decode
from base64 import b64encode
from http import HTTPStatus
from typing import Any

import yaml
from fastapi.testclient import TestClient

from exceptions import WorkspaceBuilderException
from utils import read_file, transform_client_cloud_config
from workspace_builder.api import app

git_repo_root = os.getenv("WB_GIT_REPO_ROOT")
if not git_repo_root:
    print(
        "The WB_GIT_REPO_ROOT environment variable must be set to directory where the "
        "code collection repos are cloned."
    )

workspace_info_name_default = os.getenv("WB_WORKSPACE_INFO_NAME", "workspaceInfo.yaml")
upload_info_name_default = os.getenv("WB_UPLOAD_INFO_NAME", "uploadInfo.yaml")
base_directory_default = os.getenv("WB_BASE_DIRECTORY", "shared")


def build_rest_request_data(
    base_directory,
    workspace_info_data: dict[str, Any],
    upload_info_data: dict[str, Any],
    **kwargs,
) -> dict[str, Any]:
    request_data = workspace_info_data.copy()
    for key in ("workspaceName", "defaultLocation", "defaultLocationName"):
        value = upload_info_data.get(key)
        if value is not None:
            request_data[key] = value
    for key, value in kwargs.items():
        request_data[key] = value
    for key in request_data.keys():
        if key == "kubeconfig":
            data = read_file(request_data[key], "rb")
            request_data[key] = b64encode(data).decode("utf-8")
        elif key == "resourceLoadFile":
            data = read_file(request_data[key], "rb")
            request_data[key] = b64encode(data).decode("utf-8")
        elif key == "cloudConfig":
            cloud_config_data = request_data[key]
            transform_client_cloud_config(base_directory, cloud_config_data)
        elif key == "mapCustomizationRules":
            map_customization_rules_path = request_data[key]
            if not os.path.exists(map_customization_rules_path):
                raise WorkspaceBuilderException("Map customization rules path does not exist")
            if os.path.isdir(map_customization_rules_path):
                tar_bytes = io.BytesIO()
                map_customization_rules_tar = tarfile.open(mode="x:gz", fileobj=tar_bytes)
                children = os.listdir(map_customization_rules_path)
                for child in children:
                    child_map_customization_rules_path = os.path.join(map_customization_rules_path, child)
                    data_bytes = read_file(child_map_customization_rules_path, "rb")
                    data_stream: io.BytesIO = io.BytesIO(data_bytes)
                    info = tarfile.TarInfo(child)
                    info.size = len(data_bytes)
                    info.mtime = time.time()
                    map_customization_rules_tar.addfile(info, data_stream)
                map_customization_rules_tar.close()
                map_customization_rules_data = tar_bytes.getvalue()
            else:
                map_customization_rules_data = read_file(map_customization_rules_path, "rb")
            encoded_map_customization_rules = b64encode(map_customization_rules_data).decode("utf-8")
            request_data[key] = encoded_map_customization_rules

    return request_data


class ProductionComponentTestCase(unittest.TestCase):
    """
    Defines some runs of component pipelines for standard use cases.
    Note that these tests can't be run successfully without doing some manual setup:
    - for Kubernetes-dependent testing a kubeconfig file must be copied to the workspace builder project root
      directory and named "kubeconfig"
    - for the gcpmetrics-based tests an appropriate shhh module containing the GCP credentials must
      be copied to the project root directory

    So these tests are more for manual execution during development, not as an automated build validation step.
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def run_common(
        self,
        components: str,
        base_directory=None,
        workspace_info_name=None,
        upload_info_name=None,
    ):
        if base_directory is None:
            base_directory = base_directory_default
        if workspace_info_name is None:
            workspace_info_name = workspace_info_name_default
        if upload_info_name is None:
            upload_info_name = upload_info_name_default
        workspace_info_path = os.path.join(base_directory, workspace_info_name)
        workspace_info_text = read_file(workspace_info_path, "r")
        workspace_info_data = yaml.safe_load(workspace_info_text)
        upload_info_path = os.path.join(base_directory, upload_info_name)
        if os.path.exists(upload_info_path):
            upload_info_text = read_file(upload_info_path, "r")
            upload_info_data = yaml.safe_load(upload_info_text)
        else:
            upload_info_data = dict()
        request_data = build_rest_request_data(
            base_directory,
            workspace_info_data,
            upload_info_data,
            components=components,
        )
        response = self.client.post("/run/", json=request_data)
        self.assertEqual(HTTPStatus.OK, response.status_code)
        response_data = response.json()
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

    def test_info(self):
        response = self.client.get("/info/")
        self.assertEqual(HTTPStatus.OK, response.status_code)

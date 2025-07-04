import base64
import io
import json
import os
import sys
import tarfile
import time
import shutil
import subprocess
import tempfile
from argparse import ArgumentParser
from http import HTTPStatus
from typing import Union

import requests
import yaml

from utils import transform_client_cloud_config
from utils import get_proxy_config
from utils import get_request_verify
from azure_utils import generate_kubeconfig_for_aks


debug_suppress_cheat_sheet = os.getenv("WB_DEBUG_SUPPRESS_CHEAT_SHEET")
cheat_sheet_enabled = (debug_suppress_cheat_sheet is None or
                      debug_suppress_cheat_sheet.lower() == 'false' or
                      debug_suppress_cheat_sheet == '0')
if cheat_sheet_enabled:
    import cheatsheet

# FIXME: Since we currently also do the cheat sheet generation in this tool
# should the service name be something more generic, e.g. RunWhen Local or
# something like that?
SERVICE_NAME = "Workspace Builder"
REST_SERVICE_HOST_DEFAULT = "localhost"
REST_SERVICE_PORT_DEFAULT = 8000

INFO_COMMAND = 'info'
RUN_COMMAND = 'run'
UPLOAD_COMMAND = 'upload'


CUSTOMIZATION_RULES_DEFAULT = "map-customization-rules"

tmpdir_value = os.getenv("TMPDIR", "/tmp")  # fallback to /tmp if TMPDIR not set
print("TMPDIR:", os.environ.get("TMPDIR", "not set"))
with tempfile.NamedTemporaryFile(delete=True) as f:
    print("Actual temp file location:", f.name)


def read_file(file_path: bytes, mode="r") -> Union[str, bytes]:
    with open(file_path, mode) as f:
        return f.read()


def fatal(message: str = None) -> None:
    if message:
        print(message)
    sys.exit(1)


def check_rest_service_error(response: requests.Response, command: str, verbose: bool) -> None:
    # FIXME: Should probably also check for other 2xx status code, but currently
    # for the workspace builder service a successful execution always returns 200.
    if response.status_code != HTTPStatus.OK:
        response_data = response.json()
        if verbose:
            print("Exception stack trace:")
            print(response_data["stackTrace"])
            print("Request data:")
            print(response_data["originalRequestData"])
        fatal(f'Error {response.status_code} from {SERVICE_NAME} service for command "{command}": '
              f'{response_data.get("message")}')

def call_rest_service_with_retries(rest_call_proc, max_attempts=10, retry_delay=5) -> requests.Response:
    attempts = 0
    while True:
        try:
            attempts += 1
            response = rest_call_proc()
            return response
        except requests.exceptions.ConnectionError:
            if attempts == max_attempts:
                fatal("Workspace builder REST service unavailable. "
                      "You must run it in a container before executing this tool.")
            print("Workspace builder REST service isn't available yet; waiting and trying again.")
            time.sleep(retry_delay)

def create_kubeconfig():
    create_secret = os.environ.get("RW_CREATE_KUBECONFIG_SECRET") == "true"
    api_server_host = os.environ.get("KUBERNETES_SERVICE_HOST")
    api_server_port = os.environ.get("KUBERNETES_SERVICE_PORT")
    api_server = f"https://{api_server_host}:{api_server_port}"
    default_cluster_name = "default"
    cluster_name = os.environ.get("KUBERNETES_CLUSTER_NAME", default_cluster_name)

    with open("/var/run/secrets/kubernetes.io/serviceaccount/token", "r") as f:
        token = f.read().strip()

    with open("/var/run/secrets/kubernetes.io/serviceaccount/namespace", "r") as f:
        namespace = f.read().strip()

    with open("/var/run/secrets/kubernetes.io/serviceaccount/ca.crt", "rb") as f:
        ca_cert = base64.b64encode(f.read()).decode('utf-8')

    kubeconfig = {
        "apiVersion": "v1",
        "kind": "Config",
        "clusters": [{
            "name": cluster_name,
            "cluster": {
                "certificate-authority-data": ca_cert,
                "server": api_server
            }
        }],
        "contexts": [{
            "name": cluster_name,
            "context": {
                "cluster": cluster_name,
                "namespace": namespace,
                "user": "runwhen-local"
            }
        }],
        "current-context": cluster_name,
        "users": [{
            "name": "runwhen-local",
            "user": {
                "token": token
            }
        }]
    }

    kubeconfig_yaml = yaml.dump(kubeconfig)
    secret_name = f"kubeconfig"

    if create_secret:
        # Check if the secret exists and update or create accordingly
        get_cmd = ['kubectl', 'get', 'secret', secret_name, '--namespace', namespace]
        result = subprocess.run(get_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        exists = result.returncode == 0

        secret_yaml = {
            "apiVersion": "v1",
            "kind": "Secret",
            "metadata": {
                "name": secret_name,
                "namespace": namespace
            },
            "data": {
                "kubeconfig": base64.b64encode(kubeconfig_yaml.encode('utf-8')).decode('utf-8')
            },
            "type": "Opaque"
        }

        secret_yaml_str = yaml.dump(secret_yaml)

        if exists:
            # Delete the existing secret
            del_cmd = ['kubectl', 'delete', 'secret', secret_name, '--namespace', namespace]
            subprocess.run(del_cmd, check=True)
            print("Secret deleted successfully.")

        # Create the new secret
        create_cmd = ['kubectl', 'create', '-f', '-']
        subprocess.run(create_cmd, input=secret_yaml_str, check=True, text=True)
        print("Secret created successfully.")

    return kubeconfig


def merge_kubeconfigs(kubeconfig_paths, output_path):
    merged_config = None

    # Ensure the directory for the output path exists
    output_dir = os.path.dirname(output_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for path in kubeconfig_paths:
        if path and os.path.exists(path):
            with open(path, 'r') as stream:
                config = yaml.safe_load(stream)
                if merged_config is None:
                    merged_config = config
                else:
                    merged_config['clusters'].extend(config['clusters'])
                    merged_config['contexts'].extend(config['contexts'])
                    merged_config['users'].extend(config['users'])

    if merged_config:
        with open(output_path, 'w') as stream:
            yaml.dump(merged_config, stream)
        print(f"Merged kubeconfig written to {output_path}")
    else:
        print("No valid kubeconfig files were found to merge.")

def coalesce(*vals):
    """Return the first non-empty value or None."""
    return next((v for v in vals if v not in (None, "")), None)


def main():
    parser = ArgumentParser(description="Run onboarding script to generate initial workspace and SLX info")
    parser.add_argument('command', action='store', choices=[INFO_COMMAND, RUN_COMMAND, UPLOAD_COMMAND],
                        help=f'{SERVICE_NAME} action to perform. '
                             '"info" returns info about the available components. '
                             '"run" runs the {SERVICE_NAME} components to generate workspace/SLX files.')
    parser.add_argument('-v', '--verbose', action='store_true',
                        help="Print more detailed output.")
    parser.add_argument('-k', '--kubeconfig', action='store', dest='kubeconfig', default='kubeconfig',
                        help="Path to the kubernetes config file to use to scan for info. "
                             "The path is relative to the shared directory.")
    parser.add_argument('-b', '--base-directory', action='store', dest='base_directory', default="/shared",
                        help="Path to the directory that's the base directory for input and output files. "
                             "When running the tool in a container this will be a directory that's shared "
                             "between the container and host environments. This setting is the path in "
                             "the container.")
    parser.add_argument('-w', '--workspace-info', action='store', dest="workspace_info", default="workspaceInfo.yaml",
                        help="Location of the workspace info file that was downloaded from the RunWhen GUI "
                             "after creating a new workspace. The path is relative to the base directory.")
    parser.add_argument('--upload-info', action='store', dest="upload_info", default="uploadInfo.yaml",
                        help="Location of the uploadInfo.yaml file that was downloaded from the RunWhen GUI "
                             "after creating a new workspace. The path is relative to the base directory.")
    parser.add_argument('--rest-service-host', action='store', dest="rest_service_host",
                        default="localhost:8000",
                        help=f'Host/port info for where the {SERVICE_NAME} REST service is running. '
                             f'Format is <host>:<port>')
    parser.add_argument('-c', '--components', action='store',
                        default="load_resources,kubeapi,cloudquery,azure_devops,generation_rules,render_output_items,dump_resources")
    parser.add_argument('-o', '--output', action='store', dest='output_path', default="output",
                        help="Path to output directory for generated files. "
                             "The path is relative to the base directory.")
    parser.add_argument('-d', '--define', action='append', nargs=1, dest='custom_definitions',
                        help="Define a custom variable that will be passed to the service and "
                             "made available to templates. Format of the argument is: <key>=<value>. "
                             "Multiple definitions are allowed.")
    parser.add_argument('-u', '--upload', action='store_true', dest="upload_data")
    parser.add_argument('--papi-url', action='store', dest='papi_url')
    parser.add_argument('--namespace-lods', action='store', dest="namespace_lods")
    parser.add_argument('--workspace-name', action='store', dest="workspace_name",
                        help="Name of the workspace to populate")
    parser.add_argument('--workspace-owner-email', action='store', dest="workspace_owner_email",
                        help="Email address to use as the owner of the workspace")
    parser.add_argument('--location-id', action='store', dest="location_id",
                        help="Location ID to use for the generated workspace")
    parser.add_argument('--location-name', action='store', dest="location_name",
                        help="Location name to use for the generated workspace")
    parser.add_argument('--default-lod', action='store', dest='default_lod', type=str,
                        help='Default level of detail to use; valid values are "none", "basic", and "detailed".')
    parser.add_argument('--resource-dump-path', action='store', dest='resource_dump_path', type=str,
                        help="Path (relative to output directory) to save a dump of the resource database state.")
    parser.add_argument('--resource-load-file', action='store', dest='resource_load_file', type=str,
                        help="Location (relative to the base directory) of a resource dump file to "
                             "initialize the resource database state.")
    parser.add_argument('--upload-merge-mode', action='store', dest='upload_merge_mode',
                        choices=['keep-existing', 'keep-uploaded'], default="keep-existing",
                        help='On upload, how to merge conflicting SLXs; valid values are:\n'
                             '  "keep-existing": Use the existing content of the SLX from the repo\n'
                             '  "keep-uploaded": Use the uploaded content of the SLX')
    parser.add_argument('--prune-stale-resources', action='store_true', dest='prune_stale_resources', default=False,
                        help='On upload, prune from the repo any old/stale resources from previous uploads that\n'
                             'are no longer active/valid in the current uploaded data.')
    parser.add_argument('--prune-stale-slxs', action='store_true', dest='prune_stale_slxs', default=False,
                        help='On upload, prune from the repo any old/stale SLXs from previous uploads that\n'
                             'are no longer active/valid in the current uploaded data.')
    parser.add_argument('-r', '--customization-rules', action='store', dest='customization_rules',
                        default=CUSTOMIZATION_RULES_DEFAULT,
                        help="Path to location of map customization rules file(s). The path "
                             "can be to either a single file or a directory. If it's a directory "
                             "then all of the customization rule files in the directory are "
                             "evaluated.")
    parser.add_argument('--namespaces', action='store', dest='namespaces',
                        help="Comma-separated list of namespaces to scan for matches for SLX generation.")
    args = parser.parse_args()

    # Parse the REST service host info
    if args.rest_service_host:
        if ':' in args.rest_service_host:
            rest_service_host, rest_service_port = args.rest_service_host.split(':')
        else:
            rest_service_host = args.rest_service_host
            rest_service_port = REST_SERVICE_PORT_DEFAULT
    else:
        rest_service_host = REST_SERVICE_HOST_DEFAULT
        rest_service_port = REST_SERVICE_PORT_DEFAULT

    if args.command == INFO_COMMAND:
        info_url = f"http://{rest_service_host}:{rest_service_port}/info/"
        response = call_rest_service_with_retries(lambda: requests.get(info_url))
        # NB: The following call exits if there's an error, so it won't return in that case
        # FIXME: The current fatal error handling approach is a little iffy, in case there's ever a
        # a case where there's some final cleanup we want to do. But for now that's not an issue.
        check_rest_service_error(response, args.command, args.verbose)
        response_data = response.json()
        print(f"Workspace builder version: {response_data.get('version')}")
        wb_version=response_data.get('version')
        # TBD Format/print more of the info from the response
        return

    # Get version
    info_url = f"http://{rest_service_host}:{rest_service_port}/info/"
    response = call_rest_service_with_retries(lambda: requests.get(info_url))
    check_rest_service_error(response, args.command, args.verbose)
    response_data = response.json()
    print(f"Workspace builder version: {response_data.get('version')}")
    wb_version=response_data.get('version')

    # First, initialize request data setting from the explicit command line args
    # These have the highest precedence, i.e. over the same setting from the workspace info.
    workspace_name = args.workspace_name
    workspace_owner_email = args.workspace_owner_email
    location_id = args.location_id
    location_name = args.location_name
    papi_url = args.papi_url
    default_lod = args.default_lod
    namespaces = [ns.strip() for ns in args.namespaces.split(',')] if args.namespaces else None
    resource_dump_path = args.resource_dump_path
    resource_load_file = args.resource_load_file
    base_directory = args.base_directory
    if not os.path.exists(base_directory):
        fatal(f'Base directory not found: {base_directory}')
    print(f"Using base directory: {base_directory}")
    # Initialize the settings that don't have corresponding command line arguments
    upload_token = None
    namespace_lods = None
    custom_definitions = dict()
    code_collections = None
    cloud_config = None

    # ------------------------------------------------------------------ 1. workspaceInfo
    workspace_info = {}
    if args.workspace_info:
        ws_path = os.path.join(base_directory, args.workspace_info)
        if os.path.exists(ws_path):
            try:
                workspace_info = yaml.safe_load(read_file(ws_path)) or {}
            except yaml.YAMLError as e:
                raise ValueError(f"Unable to parse workspaceInfo YAML in {ws_path}: {e}")

    # ------------------------------------------------------------------ 2. uploadInfo
    upload_info = {}
    if args.upload_info:
        up_path = os.path.join(base_directory, args.upload_info)
        if os.path.exists(up_path):
            try:
                upload_info = yaml.safe_load(read_file(up_path)) or {}
            except yaml.YAMLError as e:
                raise ValueError(f"Unable to parse uploadInfo YAML in {up_path}: {e}")

    # ------------------------------------------------------------------ 3. merge with precedence rules
    papi_url = coalesce(
        papi_url,
        upload_info.get("papiURL"),
        workspace_info.get("papiURL"),
        os.getenv("WB_PAPI_URL"),
    )

    upload_token = coalesce(
        upload_token,
        upload_info.get("token"),
        workspace_info.get("token"),
    )

    workspace_name = coalesce(
        workspace_name,
        upload_info.get("workspaceName"),
        workspace_info.get("workspaceName"),
        os.getenv("WB_WORKSPACE_NAME"),
    )

    # owner email: workspaceInfo beats uploadInfo, per new requirement
    workspace_owner_email = coalesce(
        workspace_owner_email,
        workspace_info.get("workspaceOwnerEmail"),
        upload_info.get("workspaceOwnerEmail"),
        os.getenv("WB_WORKSPACE_OWNER_EMAIL"),
    )

    location_id = coalesce(
        location_id,
        upload_info.get("locationId"),
        upload_info.get("defaultLocation"),
        workspace_info.get("locationId"),
        workspace_info.get("defaultLocation"),
        os.getenv("WB_LOCATION_ID"),
    )

    location_name = coalesce(
        location_name,
        upload_info.get("locationName"),
        upload_info.get("defaultLocationName"),
        workspace_info.get("locationName"),
        workspace_info.get("defaultLocationName"),
        os.getenv("WB_LOCATION_NAME"),
    )

    default_lod = coalesce(
        default_lod,
        workspace_info.get("defaultLOD"),
        os.getenv("WB_DEFAULT_LOD"),
    )

    namespace_lods = coalesce(
        namespace_lods,
        workspace_info.get("namespaceLODs"),
        os.getenv("WB_NAMESPACE_LODS"),
    )

    namespaces = namespaces or workspace_info.get("namespaces")
    if not namespaces:
        ns_env = os.getenv("WB_NAMESPACES")
        if ns_env:
            namespaces = [n.strip() for n in ns_env.split(",") if n.strip()]

    resource_dump_path = coalesce(
        resource_dump_path,
        workspace_info.get("resourceDumpPath", "resource-dump.yaml"),
    )

    resource_load_file = coalesce(
        resource_load_file,
        workspace_info.get("resourceLoadFile"),
    )

    cloud_config = coalesce(
        cloud_config,
        workspace_info.get("cloudConfig"),
        os.getenv("WB_CLOUD_CONFIG"),
    )

    custom_definitions = workspace_info.get("custom", {})
    code_collections = workspace_info.get("codeCollections")
    overrides = workspace_info.get("overrides", {})
    task_tag_exclusions = workspace_info.get("taskTagExclusions")

    # ------------------------------------------------------------------ 4. validation guards
    missing = []
    if not workspace_name:
        missing.append("workspaceName")
    if not workspace_owner_email:
        missing.append("workspaceOwnerEmail")
    if not location_id:
        missing.append("locationId")          # locationName no longer required

    if missing:
        raise ValueError(
            f"Required setting(s) missing: {', '.join(missing)}. "
            "Provide them via CLI flags, workspaceInfo.yaml, uploadInfo.yaml, or environment variables."
    )

    if cloud_config is None:
        raise ValueError("'cloudConfig' section is missing; discovery configuration must be explicit.")


    azure_config = None
    aks_clusters = None
    azure_kubeconfig_path = None  # Initialize the variable here

    if cloud_config:
        azure_config = workspace_info.get("cloudConfig", {}).get("azure")
        if azure_config:
            aks_clusters = azure_config.get('aksClusters', {}).get('clusters', [])  # Directly get the 'clusters' list if it exists

            if aks_clusters and isinstance(aks_clusters, list):  # Check if aks_clusters is a list of cluster dictionaries
                # Generate kubeconfig for each cluster with optional server override
                try:
                    generate_kubeconfig_for_aks(aks_clusters, workspace_info)
                    azure_kubeconfig_path = os.path.expanduser("~/.kube/azure-kubeconfig")
                    print(f"Kubeconfig generated and saved to {azure_kubeconfig_path}")
                except Exception as e:
                    print(f"Error generating kubeconfig for AKS clusters: {e}")
                    azure_kubeconfig_path = None  # Ensure path is None if generation fails
            else:
                print("AKS clusters not found or improperly formatted. Skipping Kubernetes discovery for AKS.")

    if not azure_config:
        print("Azure configuration not found in workspace_info.")

    # Check Kubernetes configuration in cloudConfig
    kubernetes_config = cloud_config.get('kubernetes') if cloud_config else None
    kubeconfig_path = None

    # Skip Kubernetes setup if kubernetes_config is None or doesn't exist
    if not kubernetes_config:
        print("Skipping Kubernetes setup as cloudConfig.kubernetes is missing or null.")
        final_kubeconfig_path = None
    else:
        # Proceed with Kubernetes configuration if valid
        print("Processing Kubernetes configuration...")
        kubeconfig_path = kubernetes_config.get('kubeconfigFile')
        in_cluster_auth_enabled = kubernetes_config.get('inClusterAuth', False)

        if kubeconfig_path and os.path.exists(kubeconfig_path):
            print(f"Using specified kubeconfig path: {kubeconfig_path}")
            final_kubeconfig_path = kubeconfig_path
        elif in_cluster_auth_enabled and os.getenv('KUBERNETES_SERVICE_HOST'):
            print("Creating in-cluster kubeconfig...")
            kubeconfig_data = create_kubeconfig()
            in_cluster_kubeconfig_file = os.path.join(base_directory, "in_cluster_kubeconfig.yaml")
            
            with open(in_cluster_kubeconfig_file, "w") as f:
                f.write(yaml.dump(kubeconfig_data))
            print(f"In-cluster kubeconfig created at {in_cluster_kubeconfig_file}")

            kubeconfig_path = os.path.join(base_directory, "kubeconfig")
            shutil.copyfile(in_cluster_kubeconfig_file, kubeconfig_path)
            final_kubeconfig_path = kubeconfig_path
            print(f"In-cluster Kubernetes auth configured with kubeconfig at {final_kubeconfig_path}")
        else:
            print("No valid kubeconfig found and inClusterAuth is disabled. Skipping Kubernetes setup.")
            final_kubeconfig_path = None

    # Continue only if valid kubeconfig paths are found
    if aks_clusters or kubeconfig_path:
        final_kubeconfig_path = os.path.expanduser("~/.kube/config")
        kubeconfigs_to_merge = []

        if aks_clusters and azure_kubeconfig_path: 
            if os.path.exists(azure_kubeconfig_path):
                kubeconfigs_to_merge.append(azure_kubeconfig_path)
                print(f"Merging azure kubeconfig into {final_kubeconfig_path}...")

        if kubeconfig_path and os.path.exists(kubeconfig_path):
            kubeconfigs_to_merge.append(kubeconfig_path)
            print(f"Merging user-provided kubeconfig into {final_kubeconfig_path}...")

        if kubeconfigs_to_merge:
            merge_kubeconfigs(kubeconfigs_to_merge, final_kubeconfig_path)
        else:
            print("No valid kubeconfigs found to merge.")
    else:
        print("Skipping Kubernetes discovery due to missing kubeconfig or AKS clusters configuration.")
        final_kubeconfig_path = None 

    if final_kubeconfig_path:
        if not kubernetes_config:
            kubernetes_config = dict()
            cloud_config["kubernetes"] = kubernetes_config
        kubernetes_config["kubeconfigFile"] = final_kubeconfig_path

    if cloud_config:
        try:
            transform_client_cloud_config(base_directory, cloud_config)
        except AttributeError as e:
            print(f"Error in transforming cloud configuration: {e}")
    else:
        print("Cloud configuration missing. Skipping client cloud configuration transformation.")
    # Add any custom definitions that were made as command line arguments to any custom
    # settings that came from the workspace info file
    if args.custom_definitions:
        for custom_definition in args.custom_definitions:
            parts = custom_definition[0].split('=')
            if len(parts) != 2:
                print("Error: Invalid format for --define arg; expected <key>=<value>")
                return 1
            key, value = parts
            key = key.strip()
            if not key:
                print("Error: Expected non-empty key for --define arg")
                return 1
            custom_definitions[key] = value.strip()

    map_customization_rules = args.customization_rules
    if not map_customization_rules:
        map_customization_rules = os.getenv("MB_CUSTOMIZATION_RULES_PATH")
    if "map-customization-rules" in map_customization_rules:
        map_customization_rules_path = map_customization_rules
    else:
        map_customization_rules_path = os.path.join(base_directory, map_customization_rules)

    if len(args.output_path) == 0:
        fatal("Name of output directory (--output arg) must not be empty.")
    output_path = os.path.join(base_directory, args.output_path)
    status_file_path = os.path.join(output_path, ".status")

    if args.command == RUN_COMMAND:
        request_data = dict()

        # If a map customization rules path was specified, then encode the contents of
        # the file or directory and add it as a request data field.
        if map_customization_rules_path:
            print(f"Using Map Customization Rules Path: {map_customization_rules_path}")
            if os.path.exists(map_customization_rules_path):
                if os.path.isdir(map_customization_rules_path):
                    tar_bytes = io.BytesIO()
                    map_customization_rules_tar = tarfile.open(mode="x:gz", fileobj=tar_bytes)
                    children = os.listdir(map_customization_rules_path)
                    for child in children:
                        child_map_customization_rule_path = os.path.join(map_customization_rules_path, child)
                        data_bytes = read_file(child_map_customization_rule_path, "rb")
                        data_stream = io.BytesIO(data_bytes)
                        info = tarfile.TarInfo(os.fsdecode(child))
                        info.size = len(data_bytes)
                        info.mtime = time.time()
                        map_customization_rules_tar.addfile(info, data_stream)
                    map_customization_rules_tar.close()
                    map_customization_rules_data = tar_bytes.getvalue()
                else:
                    map_customization_rules_data = read_file(map_customization_rules_path, "rb")
                encoded_map_customization_rules = base64.b64encode(map_customization_rules_data).decode('utf-8')
                request_data['mapCustomizationRules'] = encoded_map_customization_rules
            elif map_customization_rules != CUSTOMIZATION_RULES_DEFAULT:
                fatal("Error: Map customization rules path does not exist")

        if not args.components:
            fatal("Error: at least one component must be specified to run")
        request_data['components'] = args.components
        if final_kubeconfig_path and os.path.exists(final_kubeconfig_path):
            print(f"Indexing Kubernetes with kubeconfig from {final_kubeconfig_path}")
            kubeconfig_data = read_file(final_kubeconfig_path, "rb")
            encoded_kubeconfig_data = base64.b64encode(kubeconfig_data).decode('utf-8')
            request_data['kubeconfig'] = encoded_kubeconfig_data
        else:
            print("Kubernetes discovery not completed due to missing or invalid kubeconfig.")
        if wb_version: 
            request_data['wbVersion'] = wb_version
        if workspace_name:
            request_data['workspaceName'] = workspace_name
        if workspace_owner_email:
            request_data['workspaceOwnerEmail'] = workspace_owner_email
        if location_id:
            request_data['locationId'] = location_id
        if location_name:
            request_data['locationName'] = location_name
        if default_lod is not None:
            request_data['defaultLOD'] = default_lod
        if namespace_lods:
            request_data['namespaceLODs'] = namespace_lods
        if custom_definitions:
            request_data['customDefinitions'] = custom_definitions
        if namespaces:
            request_data['namespaces'] = namespaces
        if code_collections:
            request_data['codeCollections'] = code_collections
        if cloud_config:
            request_data['cloudConfig'] = cloud_config
        if overrides:
            request_data['overrides'] = overrides
        if task_tag_exclusions:
            request_data['taskTagExclusions'] = task_tag_exclusions
        if resource_dump_path:
            request_data['resourceDumpPath'] = resource_dump_path
        if resource_load_file:
            resource_load_path = os.path.join(base_directory, resource_load_file)
            resource_load_data = read_file(resource_load_path, "rb")
            encoded_resource_load_data = base64.b64encode(resource_load_data).decode('utf-8')
            request_data['resourceLoadFile'] = encoded_resource_load_data

        # Invoke the workspace builder /run REST endpoint
        run_url = f"http://{rest_service_host}:{rest_service_port}/run/"
        response = call_rest_service_with_retries(lambda: requests.post(run_url, json=request_data, proxies=get_proxy_config(run_url)))
        # FIXME: The current fatal error handling approach is a little iffy, in case there's ever a
        # a case where there's some final cleanup we want to do. But for now that's not an issue.
        check_rest_service_error(response, args.command, args.verbose)
        response_data = response.json()
        # Process the output
        # FIXME: Currently this only handles the case where the output is an archive,
        # but that's the only output supported by the REST service. Eventually, both
        # should be updated to support the file item output format.
        # FIXME: Should possibly/probably clear the output directory here before
        # extracting the archive data. Without clearing it you can be left with
        # obsolete SLXs from previous runs of the workspace builder. So really
        # currently the user should explicitly clean or remove the output directory
        # before each run (should check with Shea about making sure this is mentioned
        # in the docs). The current reason for not clearing the directory is being
        # somewhat paranoid about deleting data (especially a recursive tree
        # delete) in an end user tool with the possibility of user error and
        # inadvertent/accidental loss of data, e.g. the user maps the container
        # output directory to a top-level directory on the host that contains
        # other data. Maybe a safer approach would be to delete the workspaces
        # subdirectory instead of wiping the top-level output directory.
        os.makedirs(output_path, exist_ok=True)
        workspaces_path = os.path.join(output_path, "workspaces")
        if os.path.exists(workspaces_path):
            shutil.rmtree(workspaces_path)
        archive_text = response_data["output"]
        archive_bytes = base64.b64decode(archive_text)
        archive_file_obj = io.BytesIO(archive_bytes)
        archive = tarfile.open(fileobj=archive_file_obj, mode="r")
        archive.extractall(output_path)

        message = response_data.get("message", "Workspace data generated successfully.")
        warnings = response_data.get("warnings", list())
        
        # Count the number of SLXs (folders in the slxs directory)
        slxs_path = os.path.join(output_path, "workspaces", workspace_name, "slxs")
        slx_count = 0
        if os.path.exists(slxs_path) and os.path.isdir(slxs_path):
            slx_count = len([name for name in os.listdir(slxs_path) if os.path.isdir(os.path.join(slxs_path, name))])
        
        print(f"{message} Total SLXs: {slx_count}")
        for warning in warnings:
            print("WARNING: " + warning)


        # Note: Handling of the upload flag is done below, so that the code can be shared
        # with the upload command
    elif args.command == UPLOAD_COMMAND:
        # Don't do the invocation of REST service and just skip to the part
        # where we upload the generated data to the RunWhen server.
        # This assumes that there's been a previous "run" subcommand that
        # generated content to the specified output directory.
        if not os.path.exists(output_path) or len(os.listdir(output_path)) == 0:
            fatal("There's no existing generated content to upload; "
                  "you need to execute a run subcommand first before you can use the upload subcommand")
    else:
        fatal(f"Unsupported command: {args.command}")
        # NB: The fatal call will already have exited, so this return call isn't really
        # necessary, but it makes the linting code happy so that it doesn't complain
        # about possibly uninitialized variables, e.g. archive_text
        return

    if args.upload_data or args.command == UPLOAD_COMMAND:
        # For uploading we only send the workload subdirectory not the entire
        # contents of the output directory. So access the workload directory
        # and archive the data to be included in upload data.
        workspace_dir = os.path.join(output_path, "workspaces", workspace_name)
        tar_bytes = io.BytesIO()
        archive = tarfile.open(mode="x:gz", fileobj=tar_bytes)
        # We need to set the working directory to the output directory for the tarfile
        # to use the correct relative paths for the entries. Just to be safe, we
        # save and restore the working directory even though, at least currently,
        # I don't think anything else is affected by the working directory.
        saved_working_directory = os.getcwd()
        os.chdir(workspace_dir)
        try:
            archive.add(".")
        except Exception as e:
            fatal(f"Error creating archive from output directory contents: {e}")
        finally:
            os.chdir(saved_working_directory)
        archive.close()
        archive_bytes = tar_bytes.getvalue()
        archive_text = base64.b64encode(archive_bytes).decode('utf-8')

        if not upload_token:
            fatal('An uploadInfo.yaml file corresponding to an existing workspace in the '
                  'platform must be downloaded from the workspace info page and put in the '
                  'base directory to enable upload of the generated workspace content.')
        merge_mode = "keepexisting" if args.upload_merge_mode.lower() == "keep-existing" else "keepuploaded"
        upload_request_data = {
            "output": archive_text,
            "mergeMode": merge_mode,
            "pruneStaleSlxs": args.prune_stale_slxs,
            "pruneStaleResources": args.prune_stale_resources,
            "message": "Updated workspace from map builder.",
            "finalizeAction": "mergeToMain",
        }
        # We want the request body to be JSON, not form-encoded, so we need to
        # do the conversion to JSON ourselves.
        upload_request_text = json.dumps(upload_request_data)
        headers = {
            "Authorization": f"Bearer {upload_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        upload_url = f"{papi_url}/api/v3/workspaces/{workspace_name}/upload"
        try:
            response = requests.post(upload_url, data=upload_request_text, headers=headers, verify=get_request_verify())
        except requests.exceptions.ConnectionError as e:
            fatal("Upload of map builder data failed, because the PAPI upload URL is invalid or unavailable; {e}")
            # NB: The fatal call will already have exited, so this return call isn't really
            # necessary, but it makes the linting code happy so that it doesn't complain
            # about possibly uninitialized variables, e.g. response
            return

        if response.status_code != HTTPStatus.OK:
            # NB: The error response format from PAPI is not guaranteed to be the same
            # as what we get from the workspace builder REST service (even though
            # the WB error handler is derived from the PAPI error handler, so, at least
            # currently, they're mostly the same), so we don't use
            # handle_rest_service_error here.
            try:
                # Check if response has JSON content-type
                content_type = response.headers.get('content-type', '').lower()
                if 'application/json' not in content_type:
                    fatal(f"Error uploading map builder data; Non-JSON response (Content-Type: {content_type}); "
                          f"status={response.status_code}; Response body: {response.text[:500]}")
                
                # Check if response body is empty
                if not response.text.strip():
                    fatal(f"Error uploading map builder data; Empty response body; status={response.status_code}")
                
                response_data = response.json()
                detail = response_data.get('detail')
                code = response_data.get('code')
                fatal(f"Error uploading map builder data; {detail}; status={response.status_code}; code={code}")
            except requests.exceptions.JSONDecodeError as e:
                fatal(f"Error uploading map builder data; Invalid JSON response: {e}; "
                      f"status={response.status_code}; Response body: {response.text[:500]}")

        print("Workspace builder data uploaded successfully.")

    # Add cheat-sheet integration, which points at the output items and
    # generates the list of local commands that exist in the TaskSet.
    # FIXME: I think it would probably be cleaner and more decoupled to move the
    # command assist stuff to a separate command line tool and then have the
    # run.sh script handle calling it after invoking this tool.
    if cheat_sheet_enabled:
        # Update cheat sheet status by copying index
        mkdocs_dir=f"{tmpdir_value}/mkdocs-temp"
        cheatsheet.cheat_sheet(output_path, mkdocs_dir)


if __name__ == "__main__":
    main()

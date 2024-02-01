import base64
import io
import json
import os
import sys
import tarfile
import time
import shutil
from argparse import ArgumentParser
from http import HTTPStatus
from typing import Union

import requests
import yaml

from utils import transform_client_cloud_config

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
    api_server_host = os.environ.get("KUBERNETES_SERVICE_HOST")
    api_server_port = os.environ.get("KUBERNETES_SERVICE_PORT")
    api_server = f"https://{api_server_host}:{api_server_port}"

    with open("/var/run/secrets/kubernetes.io/serviceaccount/token", "r") as f:
        token = f.read().strip()

    with open("/var/run/secrets/kubernetes.io/serviceaccount/namespace", "r") as f:
        namespace = f.read().strip()

    ca_path = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"

    kubeconfig = {
        "apiVersion": "v1",
        "kind": "Config",
        "clusters": [{
            "name": "default",
            "cluster": {
                "certificate-authority": ca_path,
                "server": api_server
            }
        }],
        "contexts": [{
            "name": "default",
            "context": {
                "cluster": "default",
                "namespace": namespace,
                "user": "default"
            }
        }],
        "current-context": "default",
        "users": [{
            "name": "default",
            "user": {
                "token": token
            }
        }]
    }

    return kubeconfig

def status_update(update, status_file_path, append_mode=True):
    if cheat_sheet_enabled:
        # status_fpath = "/shared/output/.status"
        update_line = f"{update}\n"  # Add a newline character to separate updates
        print(update_line)

        file_mode = 'a' if os.path.exists(status_file_path) and append_mode else 'w'

        with open(status_file_path, file_mode) as status_file:
            status_file.write(update_line)

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
                        default="kubeapi,cloudquery,runwhen_default_workspace,generation_rules,render_output_items")
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
    parser.add_argument('--default-location', action='store', dest="default_location",
                        help="Default location to use for the generated workspace")
    parser.add_argument('--default-lod', action='store', dest='default_lod', type=int,
                        help="Default level of detail to use; valid values are 0 (none), 1 (basic), 2 (detailed)")
    parser.add_argument('--upload-merge-mode', action='store', dest='upload_merge_mode',
                        choices=['keep-existing', 'keep-uploaded'], default="keep-existing",
                        help='On upload, how to merge conflicting SLXs; valid values are:\n'
                             '  "keep-existing": Use the existing content of the SLX from the repo\n'
                             '  "keep-uploaded": Use the uploaded content of the SLX')
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
        # TBD Format/print more of the info from the response
        return

    # First, initialize request data setting from the explicit command line args
    # These have the highest precedence, i.e. over the same setting from the workspace info.
    workspace_name = args.workspace_name
    workspace_owner_email = args.workspace_owner_email
    default_location = args.default_location
    papi_url = args.papi_url
    default_lod = args.default_lod
    namespaces = [ns.strip() for ns in args.namespaces.split(',')] if args.namespaces else None

    base_directory = args.base_directory
    if not os.path.exists(base_directory):
        fatal(f'Base directory not found: {base_directory}')

    # Initialize the settings that don't have corresponding command line arguments
    upload_token = None
    namespace_lods = None
    custom_definitions = dict()
    code_collections = None
    cloud_config = None

    # Read the information from the uploadInfo.yaml file.
    # In theory, we should only need to do this if we're going to try to upload
    # to the platform (i.e. upload subcommand or --upload flag), but currently
    # there is other information in uploadInfo.yamll (e.g. workspaceName,
    # workspaceOwnerEmail, defaultLocation) that affect the workspace generation
    # process, so we need to parse the file even just for generation.
    # We currently give precedence to the settings in uploadInfo.yaml over
    # what's in workspaceInfo.yaml, so if a user has been operating in pure
    # RunWhen Local mode and then wants to upload to the platform and downloads
    # the uploadInfo.yaml the workspace name there will override whatever they
    # had been using in the workspaceInfo.yaml setting.
    upload_info_path = os.path.join(base_directory, args.upload_info)
    try:
        upload_info_text = read_file(upload_info_path)
        upload_info = yaml.safe_load(upload_info_text)
        upload_token = upload_info.get('token')
        if not papi_url:
            papi_url = upload_info.get('papiURL')
        if not workspace_name:
            workspace_name = upload_info.get('workspaceName')
        if not workspace_owner_email:
            workspace_owner_email = upload_info.get('workspaceOwnerEmail')
        if not default_location:
            default_location = upload_info.get("defaultLocation")
    except FileNotFoundError:
        # Don't treat this as a fatal error, to handle untethered, pure
        # RunWhen Local operation. In this case we assume that the workspace name
        # and the other fields are specified in workspaceInfo.yaml (or specified
        # as command line arguments, but I don't think that's a feature that
        # anyone is really using at this point).
        pass


    # Parse the settings info for calling the REST service
    if args.workspace_info:
        workspace_info_path = os.path.join(base_directory, args.workspace_info)
        if os.path.exists(workspace_info_path):
            workspace_info_str = read_file(workspace_info_path)
            workspace_info = yaml.safe_load(workspace_info_str)
            # FIXME: Should probably tweak the field in the workspace info from the GUI/PAPI
            # to name this just "workspace"
            if not workspace_name:
                workspace_name = workspace_info.get('workspaceName')
            # We've moved the upload token and PAPI URL settings to the uploadInfo.yaml file,
            # but we'll keep support for the old way of putting it in the workspaceInfo.yaml file for
            # a little while to avoid breaking existing setups.
            # FIXME: Should remove this eventually after we think it's safe to assume everybody has
            # switched over to using the uploadInfo.yaml file.
            if not upload_token:
                upload_token = workspace_info.get('token')
            if not papi_url:
                papi_url = workspace_info.get('papiURL')
            if not workspace_owner_email:
                workspace_owner_email = workspace_info.get('workspaceOwnerEmail')
            if not default_location:
                default_location = workspace_info.get("defaultLocation")
            if default_lod is None:
                default_lod = workspace_info.get("defaultLOD")
            if not namespaces:
                namespaces = workspace_info.get("namespaces")
            namespace_lods = workspace_info.get('namespaceLODs')
            custom_definitions = workspace_info.get("custom", dict())
            code_collections = workspace_info.get("codeCollections")
            cloud_config = workspace_info.get("cloudConfig")
            if cloud_config:
                transform_client_cloud_config(cloud_config)

    # If a setting has still not been set, try an environment variable as a last resort
    # FIXME: With the switch to having default values for the command line args, these
    # will typically never be undefined, unless I guess the user explicitly specifies
    # the command line arg with an empty string. Need to think about this some more.
    # One possibility would be to detect if we're using the default values or an
    # explicitly specified command line arg. If it's the default value, then let
    # that be overridden by the environment variable, if specified. There's not a
    # completely straightforward way to detect if an argparse arg is the default
    # value vs. an explicitly specified value that's the same as the default value,
    # but there are some kludgy ways to do it described in some SO posts. For now,
    # though, I don't think anything is reliant on using env vars to specify the
    # settings, so I don't think getting this ironed out is a super high priority.
    if not workspace_name:
        workspace_name = os.getenv('WB_WORKSPACE_NAME')
    if not workspace_owner_email:
        workspace_owner_email = os.getenv('WB_WORKSPACE_OWNER_EMAIL')
    if not default_location:
        default_location = os.getenv("WB_DEFAULT_LOCATION")
    if not papi_url:
        papi_url = os.getenv('WB_PAPI_URL')
    if default_lod is None:
        default_lod = os.getenv("WB_DEFAULT_LOD")
    if not namespace_lods:
        namespace_lods = os.getenv("WB_NAMESPACE_LODS")
    if not namespaces:
        namespaces_string = os.getenv("WB_NAMESPACES")
        if namespaces_string:
            namespaces = [ns.strip() for ns in namespaces_string.split(',')]
    if not cloud_config:
        cloud_config = os.getenv("WB_CLOUD_CONFIG")

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

    kubeconfig = args.kubeconfig
    kubeconfig_path = os.path.join(base_directory, kubeconfig)

    # Check if the file at the constructed path exists
    if not os.path.exists(kubeconfig_path):
        print(f"Auth file not found at {base_directory}/{kubeconfig}...")
        # Try getting the kubeconfig from the MB_KUBECONFIG environment variable
        kubeconfig = os.getenv('MB_KUBECONFIG')
        if kubeconfig:
            kubeconfig_path = os.path.join(base_directory, kubeconfig)

        # If the file still doesn't exist and we're in a Kubernetes environment, create a kubeconfig
        if not os.path.exists(kubeconfig_path) and os.getenv('KUBERNETES_SERVICE_HOST'):
            kubeconfig_data = create_kubeconfig()
            # Save the kubeconfig_data to a file in the base_directory
            kubeconfig_file = os.path.join(base_directory, "in_cluster_kubeconfig.yaml")
            with open(kubeconfig_file, "w") as f:
                f.write(yaml.dump(kubeconfig_data))
            kubeconfig_path = kubeconfig_file
            print("Using in-cluster Kubernetes auth...")
            print(f"Using auth from {base_directory}/{kubeconfig}...")
    else: 
        print(f"Using auth from {base_directory}/{kubeconfig}...")

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
        if os.path.exists(kubeconfig_path):
            kubeconfig_data = read_file(kubeconfig_path, "rb")
            encoded_kubeconfig_data = base64.b64encode(kubeconfig_data).decode('utf-8')
            request_data['kubeconfig'] = encoded_kubeconfig_data
        if workspace_name:
            request_data['workspaceName'] = workspace_name
        if workspace_owner_email:
            request_data['workspaceOwnerEmail'] = workspace_owner_email
        if default_location:
            request_data['defaultLocation'] = default_location
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

        if cheat_sheet_enabled:
            # Update cheat sheet status by copying index
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            status_update(f"Discovery started at: {timestamp} ", status_file_path, append_mode=False)
            status_update("Discovering resources...", status_file_path)
        # Invoke the workspace builder /run REST endpoint
        run_url = f"http://{rest_service_host}:{rest_service_port}/run/"
        response = call_rest_service_with_retries(lambda: requests.post(run_url, json=request_data))
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

        print("Workspace data generated successfully.")

        # Add cheat-sheet integration, which points at the output items and
        # generates the list of local commands that exist in the TaskSet.
        # FIXME: I think it would probably be cleaner and more decoupled to move the
        # command assist stuff to a separate command line tool and then have the
        # run.sh script handle calling it after invoking this tool.
        if cheat_sheet_enabled:
            # Update cheat sheet status by copying index
            status_update("Starting cheat sheet rendering...", status_file_path)
            cheatsheet.cheat_sheet(output_path)
            status_update("Cheat sheet rendering completed.", status_file_path)

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
            response = requests.post(upload_url, data=upload_request_text, headers=headers)
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
            response_data = response.json()
            detail = response_data.get('detail')
            code = response_data.get('code')
            fatal(f"Error uploading map builder data; {detail}; status={response.status_code}; code={code}")

        print("Workspace builder data uploaded successfully.")


if __name__ == "__main__":
    main()

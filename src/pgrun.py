from argparse import ArgumentParser
import base64
import git
from http import HTTPStatus
import io
import json
import os
import requests
import sys
import tarfile
import time
from typing import Union
import yaml

debug_suppress_cheat_sheet = os.getenv("WB_DEBUG_SUPPRESS_cheat_sheet")
cheat_sheet_enabled = (debug_suppress_cheat_sheet is None or
                      debug_suppress_cheat_sheet.lower() == 'false' or
                      debug_suppress_cheat_sheet == '0')
if cheat_sheet_enabled:
    import cheatsheet

# Check some environment variables to enable upload debug mode.
# If this is enabled, then the workspace upload is executed in process instead
# of via a REST request to the PAPI server. The upload code, workspaceupload.py,
# is a soft symbolic link to the code in the backend service PAPI code tree,
# so it's actually the same exact code that executed in the PAPI context.
UPLOAD_DEBUG_MODE = os.getenv("WB_UPLOAD_DEBUG_MODE")
UPLOAD_DEBUG_MODE_REMOTE_REPO_ROOT = os.getenv("WB_UPLOAD_DEBUG_MODE_REMOTE_REPO_ROOT")
if UPLOAD_DEBUG_MODE:
    from workspaceupload import WorkspaceUploadException, upload_workspace

SERVICE_NAME = "Workspace Builder"
REST_SERVICE_HOST_DEFAULT = "localhost"
REST_SERVICE_PORT_DEFAULT = 8000

INFO_COMMAND = 'info'
RUN_COMMAND = 'run'
UPLOAD_COMMAND = 'upload'


def read_file(file_path: bytes, mode="r") -> Union[str, bytes]:
    with open(file_path, mode) as f:
        return f.read()


CUSTOMIZATION_RULES_DEFAULT = "map-customization-rules"


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
              f'{response_data.get("detail")}')


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


def main():
    parser = ArgumentParser(description="Run onboarding script to generate initial workspace and SLX info")
    parser.add_argument('command', action='store', choices=[INFO_COMMAND, RUN_COMMAND, UPLOAD_COMMAND],
                        help=f'{SERVICE_NAME} action to perform. '
                             '"info" returns info about the available components. '
                             '"run" runs the {SERVICE_NAME} components to generate workspace/SLX files.')
    parser.add_argument('-v', '--verbose', action='store_true')
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
    parser.add_argument('--rest-service-host', action='store', dest="rest_service_host",
                        default="localhost:8000",
                        help=f'Host/port info for where the {SERVICE_NAME} REST service is running. Format is <host>:<port>')
    parser.add_argument('-c', '--components', action='store',
                        default="reset_models,kubeapi,runwhen_default_workspace,hclod,generation_rules,render_output_items")
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

    # Parse the settings info for calling the REST service
    if args.workspace_info:
        workspace_info_path = os.path.join(base_directory, args.workspace_info)
        workspace_info_str = read_file(workspace_info_path)
        workspace_info = yaml.safe_load(workspace_info_str)
        # FIXME: Should probably tweak the field in the workspace info from the GUI/PAPI
        # to name this just "workspace"
        if not workspace_name:
            workspace_name = workspace_info.get('workspaceName')
        upload_token = workspace_info.get('token')
        if not workspace_owner_email:
            workspace_owner_email = workspace_info.get('workspaceOwnerEmail')
        if not default_location:
            default_location = workspace_info.get("defaultLocation")
        if not papi_url:
            papi_url = workspace_info.get('papiURL')
        if default_lod is None:
            default_lod = workspace_info.get("defaultLOD")
        if not namespaces:
            namespaces = workspace_info.get("namespaces")
        namespace_lods = workspace_info.get('namespaceLODs')
        custom_definitions = workspace_info.get("custom", dict())
        personas = workspace_info.get("personas", dict())
    else:
        upload_token = None
        namespace_lods = None
        custom_definitions = dict()
        personas = dict()

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
    if not personas:
        personas = os.getenv("WB_PERSONAS")
    if not namespaces:
        namespaces_string = os.getenv("WB_NAMESPACES")
        if namespaces_string:
            namespaces = [ns.strip() for ns in namespaces_string.split(',')]

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
    if not kubeconfig:
        kubeconfig = os.getenv('MB_KUBECONFIG')
    kubeconfig_path = os.path.join(base_directory, kubeconfig)

    map_customization_rules = args.customization_rules
    if not map_customization_rules:
        map_customization_rules = os.getenv("MB_CUSTOMIZATION_RULES_PATH")
    if "map-customization-rules" in map_customization_rules:
        map_customization_rules_path = map_customization_rules
    else:
        map_customization_rules_path = os.path.join(base_directory, map_customization_rules)

    output = args.output_path
    if not output:
        output = os.getenv('MB_OUTPUT')
    output_path = os.path.join(base_directory, output)

    if args.command == RUN_COMMAND:
        request_data = dict()
        if not args.components:
            fatal("Error: at least one component must be specified to run")
        if not kubeconfig_path:
            fatal("Error: a kubeconfig file must be specified to scan")
        kubeconfig_data = read_file(kubeconfig_path, "rb")
        encoded_kubeconfig_data = base64.b64encode(kubeconfig_data).decode('utf-8')

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

        request_data['components'] = args.components
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
        if personas:
            request_data['personas'] = personas
        if namespaces:
            request_data['namespaces'] = namespaces

        # Call /run endpoint
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
        os.makedirs(output_path, exist_ok=True)
        # output_contents = os.listdir(output_path)
        # if len(output_contents) > 0:
        #     reply = input(f"The specified output directory {output_path} is not empty. Do you want to clear the contents and continue or quit? [yq]")
        #     if not reply.lower().startswith('y'):
        #         print(f"Exiting {SERVICE_NAME} tool without saving output")
        #         return 1
        #     os.removedirs(output_path)
        #     os.makedirs(output_path, exist_ok=True)
        archive_text = response_data["output"]
        archive_bytes = base64.b64decode(archive_text)
        archive_file_obj = io.BytesIO(archive_bytes)
        archive = tarfile.open(fileobj=archive_file_obj, mode="r")
        archive.extractall(output_path)

        # Add cheat-sheet integration, which points at the output items and
        # generates the list of local commands that exist in the TaskSet.
        if cheat_sheet_enabled:
            cheatsheet.cheat_sheet(output_path)

        # Note: Handling of the upload flag is done below, so that the code can be shared
        # with the upload command
        # FIXME: Might be more straightforward to factor the shared upload code into
        # a separate method and then just call it from both here and the code below
        # that handles the upload command. Only issue is that code depends on a
        # number of variables that have already been set up, so it might require
        # quite a few parameters for the refactored method.

    elif args.command == UPLOAD_COMMAND:
        # Don't do the invocation of REST service and just skip to the part
        # where we upload the generated data to the RunWhen server.
        # This assumes that there's been a previous "run" command that
        # generated content to the specified output directory.
        # In this case we need to package the contents of the output directory
        # to an in-memory archive and base64 encode it to be the text that
        # is included in the request payload when we upload. We name the
        # archive text "archive_text" to match what it's called in the run
        # command path above, so that the ensuing code that actually performs
        # the upload works the same in either case.
        if not os.path.exists(output_path) or len(os.listdir(output_path)) == 0:
            fatal("There's no existing generated content to upload; "
                  "you need to execute a run subcommand first before you can do the upload subcommand")
    else:
        fatal(f"Unsupported command: {args.command}")
        # NB: The fatal call will already have exited, so this return call isn't really
        # necessary, but it makes the linting code happy so that it doesn't complain
        # about possibly uninitialized variables, e.g. archive_text
        return

    print("Workspace builder data generated successfully.")

    if args.upload_data or args.command == UPLOAD_COMMAND:
        # For uploading we only send the workload subdirectory not the entire
        # contents of the output directory. So access the workload directory
        # and archive the data to be included in upload data.
        workspace_dir = os.path.join(output_path, "workspaces", workspace_name)
        tar_bytes = io.BytesIO()
        archive = tarfile.open(mode="x:gz", fileobj=tar_bytes)
        # We need to set the working directory to the output directory for the tarfile
        # to use the correct relative paths for the entries. Just to be safe we'll
        # save and restore the working directory even though, at least currently,
        # AFAIK nothing else is affected by the working directory.
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
        # with open("wbarchivetest.tar", "wb") as f:
        #     f.write(archive_bytes)
        archive_text = base64.b64encode(archive_bytes).decode('utf-8')

        # TODO: Implement the upload workflow
        # FIXME: Should refactor the above code that handles the upload for the
        # RUN command to here so it also handles the UPLOAD command case too. The
        # only change that will be needed is that in the UPLOAD case you don't
        # already have the archive data, so it will need to be rearchived from
        # the output directory.
        if not upload_token:
            fatal('An upload token value named "token" must be specified in the workspace info file to '
                  'enable upload of the generated workspace content. This token is set when the '
                  'workspace info is first downloaded from the workspace info web page.')
        merge_mode = "keepexisting" if args.upload_merge_mode.lower() == "keep-existing" else "keepuploaded"
        upload_request_data = {
            "output": archive_text,
            "mergeMode": merge_mode,
            "message": "Updated workspace from map builder.",
            "finalizeAction": "mergeToMain",
        }
        if UPLOAD_DEBUG_MODE:
            try:
                if not UPLOAD_DEBUG_MODE_REMOTE_REPO_ROOT:
                    fatal("Workspace upload debug mode requires WB_UPLOAD_DEBUG_MODE_REMOTE_REPO_ROOT "
                          "environment variable to be set.")
                working_directory = os.getcwd()
                remote_workspace_repo_path = f"{working_directory}/{UPLOAD_DEBUG_MODE_REMOTE_REPO_ROOT}/{workspace_name}"
                os.makedirs(remote_workspace_repo_path, exist_ok=True)
                remote_workspace_git_dir = f"{remote_workspace_repo_path}/.git"
                if not os.path.exists(remote_workspace_git_dir):
                    repo = git.Repo.init(remote_workspace_repo_path, b="main")
                    init_readme_file = f"{remote_workspace_repo_path}/README"
                    with open(init_readme_file, "w") as f:
                        f.write("# Dummy empty README")
                    repo.index.add(init_readme_file)
                    repo.index.commit("Initial commit")
                    current = repo.create_head("dummy")
                    current.checkout()
                workspace_repo_url = f"file://{remote_workspace_repo_path}"
                upload_workspace(workspace_name, workspace_repo_url, git.Repo.clone_from, upload_request_data)
            except WorkspaceUploadException as e:
                fatal(f"Error uploading map builder data in workspace upload debug mode; {e.message}")
        else:
            # We want the request body to be JSON not form-encoded, so we need to
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
                # as what we get from the workspace builder REST service (even though currently
                # the WB error handler is derived from the PAPI error handler so they're
                # mostly the same), so we don't use handle_rest_service_error here.
                response_data = response.json()
                detail = response_data.get('detail')
                code = response_data.get('code')
                fatal(f"Error uploading map builder data; {detail}; status={response.status_code}; code={code}")

        print("Workspace builder data uploaded successfully.")


if __name__ == "__main__":
    main()

"""
Utility file to parse robot file, runbook config, 
and perform variable substitution to produce clean 
shell cmd output. 
parse_robot_file written by Kyle Forster

Author: Shea Stewart
"""
import sys
import os
import fnmatch
import re
import shutil
import jinja2
import requests
import yaml
import json
import datetime
import time
import ruamel.yaml
import subprocess
import logging
from robot.api import TestSuite
from tempfile import NamedTemporaryFile
from functools import lru_cache
from git import Repo, GitCommandError
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

logger = logging.getLogger(__name__)
handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
# Check for the environment variable and set the log level
if os.environ.get('DEBUG_LOGGING') == 'true':
    logger.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)

@lru_cache(maxsize=2048)


def parse_robot_file(fpath):
    """
    Parses a robot file in to a python object that is
    json serializable, representing all kinds of interesting
    bits and pieces about the file contents (for UI purposes).
    """
    suite = TestSuite.from_file_system(fpath)
    # pprint.pprint(dir(suite))
    ret = {}
    ret["doc"] = suite.doc  # The doc string
    ret["type"] = suite.name.lower()
    ret["tags"] = []

    for k, v in suite.metadata.items():
        if k.lower() in ["author", "name"]:
            ret[k.lower()] = v
    tasks = []
    for task in suite.tests:
        tags = [str(tag) for tag in task.tags if tag not in ["skipped"]]
        # print (task.body)
        tasks.append(
            {
                "id": task.id,
                "name": task.name,
                # "tags": tags,
                "doc": str(task.doc),
                "keywords": task.body
            }
        )
        ret["tags"] = list(set(ret["tags"] + tags))
    ret["tasks"] = tasks
    resourcefile = suite.resource
    ret["imports"] = []
    for i in resourcefile.imports:
        ret["imports"].append(i.name)
    return ret

def strip_start_end_quotes(cmd):
    if (cmd.startswith('"') and cmd.endswith('"')) or (cmd.startswith("'") and cmd.endswith("'")):
        return cmd[1:-1]
    else:
        return cmd

def remove_escape_chars(cmd):
    # Cases where the command needs to use ${} but it's escaped from robot
    cmd = cmd.replace('\\\$', '$')
    cmd = cmd.replace('\\\%', '%')
    cmd = cmd.replace('\\\n', '')
    cmd = cmd.replace('\\\\', '\\')
    # Cases where two spaces are escaped in robot
    cmd = cmd.replace(' \\ ', '  ')
    cmd = cmd.encode().decode('unicode_escape')
    ## Handle cases where a wrapped quote has returned
    if cmd[0] == cmd[-1] == '"':
        cmd=cmd[1:-1]
    if cmd[0] == cmd[-1] == "'":
        cmd=cmd[1:-1]    
    return cmd

def cmd_expansion(keyword_arguments, parsed_runbook_config):
    """
    Cleans up the command details as sent in from robot parsing.
    Tries to make the command human readable / copy-pasta able. 
    And substitutes any vars with the config provided values.  


    Args:
        keyword_arguments (object): The cmd arguments as parsed from robot.  
        parsed_runbook_config (object): The parsed runbook config content.

    Returns:
        A cleaned up and variable expanded command string. 
    """
    cmd = {}
    cmd_components = str(keyword_arguments)
    logger.debug(f"Pre-rendered command components: {cmd_components}")       
    logger.debug(f"Runbook config: {parsed_runbook_config}")       

    ## Clean up the parsed cmd from robot
    cmd_components = cmd_components.lstrip('(').rstrip(')')

    logger.debug(f"Command Components: {cmd_components}")       
    ## Split by comma if comma is not wrapped in single or escaped quotes
    ## this is needed to separate the command from the args as 
    ## parsed by the robot parser
    split_regex = re.compile(r'''((?:[^,'"]|'(?:(?:\\')|[^'])*'|"(?:\\"|[^"])*")+)''')
    cmd_components = split_regex.split(cmd_components)[1::2]
    if cmd_components[0].startswith('\'cmd='): 
        cmd_components[0] = cmd_components[0].replace('cmd=', '')

        ## Substitute in the proper binary
        ## TODO Consider a check for Distribution type
        ## Jon Funk mentioned that distrubiton type might not be used 
        cmd_str=cmd_components[0]

        ## Remove authentication commands 
        cmd_str=remove_auth_commands(cmd_str)

        # Identify env keys (often secrets) and strip the additional $ and .key 
        # before passing into the next stage
        cmd_str = replace_env_key(cmd_str)
        if "binary_name" in cmd_str: 
            cmd_str = cmd_str.replace('${binary_name}', parsed_runbook_config["spec"]["servicesProvided"][0]["name"])
        if "BINARY_USED" in cmd_str: 
            cmd_str = cmd_str.replace('${BINARY_USED}', parsed_runbook_config["spec"]["servicesProvided"][0]["name"])
        if "KUBERNETES_DISTRIBUTION_BINARY" in cmd_str: 
            cmd_str = cmd_str.replace('${KUBERNETES_DISTRIBUTION_BINARY}', parsed_runbook_config["spec"]["servicesProvided"][0]["name"])
    elif cmd_components[0].startswith('\'bash_file='): 
        logger.debug(f"Rendering bash file: {cmd_components[0]}")
        script=cmd_components[0].replace('bash_file=','')
        codebundle_path_parts=parsed_runbook_config['spec']['codeBundle']['pathToRobot'].split('/')
        codebundle_directory_path='/'.join(codebundle_path_parts[:-1])
        file_path=f"{codebundle_directory_path}/{script}"
        file_path=file_path.replace("'","")
        logger.debug(f"Rendering bash file path: {file_path}")
        raw_script_url=generate_raw_git_url(git_url=parsed_runbook_config["spec"]["codeBundle"]["repoUrl"], ref=parsed_runbook_config["spec"]["codeBundle"]["ref"], file_path=file_path)
        env=""
        for var in parsed_runbook_config["spec"]["configProvided"]:
            env += f"{var['name']}={var['value']};"
        matched_cmd_override = None
        for arg in cmd_components:
            arg=arg.strip()
            logger.debug(f"Bash File Arg: {arg}")
            if arg.strip().startswith("\'cmd_override"):
                logger.debug(f"Command Override Detected: {arg}")
                matched_cmd_override = arg
                break
        if matched_cmd_override is not None:
            cmd_parts=matched_cmd_override.split()
            cmd_arguments=' '.join(cmd_parts[1:])
            cmd_arguments=cmd_arguments.strip("'")
            cmd_components[0]=f"{env} curl -s {raw_script_url} | bash -s {cmd_arguments}"
        else: 
            cmd_components[0]=f"{env} curl -s {raw_script_url} | bash"
        logger.debug(f"Rendering bash file after split: {cmd_components}") 
        cmd_str=cmd_components[0]      
    else: 
        cmd_str="Could not render command"
    # Set var for public command before configProvided substitutiuon
    # This is used for the Explain function and guarantees no sensitive information
    ## TODO check if we still need this since all explanation functions are handled 
    ## by github actions on the repo and stored in meta, instead of during rendering
    cmd["public"] = remove_escape_chars(cmd_str)


    # Substitue available vars from config provided into the command
    for var in parsed_runbook_config["spec"]["configProvided"]:
        cmd_str = cmd_str.replace('${'+ var["name"] +'}', var["value"])
    cmd["private"] = remove_escape_chars(cmd_str)

    return cmd

def generate_raw_git_url(git_url, file_path, ref):
    """
    Generates the raw Git URL for a file and checks if it is accessible.
    Currently supports GitHub, with a structure to add more providers.

    :param git_url: URL to the Git repository (e.g., GitHub)
    :param file_path: Path to the file in the repository
    :param ref: Git reference (branch, tag, or commit hash)
    :return: Raw URL if accessible, None otherwise
    """
    def get_github_raw_url(parsed_url, file_path, ref):
        # Transform the GitHub URL to its raw version
        # Example: https://github.com/user/repo.git/blob/main/file -> https://raw.githubusercontent.com/user/repo/main/file
        parts = parsed_url.path.split('/')
        user = parts[1]
        repo = parts[2].replace('.git', '')  # Remove .git if present
        return f"https://raw.githubusercontent.com/{user}/{repo}/{ref}/{file_path}"


    parsed_url = urlparse(git_url)
    raw_url = None
    logger.debug(f"Parsing git url: {git_url}")

    if 'github.com' in parsed_url.netloc:
        raw_url = get_github_raw_url(parsed_url, file_path, ref)
    # Add more conditions here for other Git providers
    # elif 'otherprovider.com' in parsed_url.netloc:
    #     raw_url = get_other_provider_raw_url(parsed_url, file_path, ref)

    if raw_url:
        try:
            response = requests.get(raw_url)
            response.raise_for_status()  # Will raise an HTTPError if the HTTP request returned an unsuccessful status code
            return raw_url
        except requests.RequestException as e:
            print(f"Error accessing {raw_url}: {e}")
            return None

    return None


def task_name_expansion(task_name, parsed_runbook_config):
    """
    Cleans up the task title as sent in from robot parsing.
    Tries to substitute any dynamic vars with config provided  


    Args:
        task_name (object): The cmd arguments as parsed from robot.  
        parsed_runbook_config (object): The parsed runbook config content.

    Returns:
        An expanded task title with substituted variables. 
    """
    for var in parsed_runbook_config["spec"]["configProvided"]:
        task_name = task_name.replace('${'+ var["name"] +'}', var["value"])
        logger.debug(f"Tailored var name {var['name']} for {var['value']}")       

    logger.debug(f"Task Title Substitution: return {task_name}")
    return task_name

def remove_auth_commands(command):
    """
    Removes common authentication patterns in cli output, as it's assumed that the user is already authenticated, or is authenticated 
    differently than RunWhen Platform codebundles require.  


    Args:
        command (str): The command string.  

    Returns:
        The command with any auth matching patterns removed.  
    """
    auth_patterns=[
        "gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS && "
    ]
    for pattern in auth_patterns: 
        command=command.replace(pattern, '')
    return command

def replace_env_key(text):
    """
    Replaces a pattern like $${JENKINS_SA_USERNAME.key} with ${JENKINS_SA_USERNAME}.

    Args:
        text (str): The input text containing the pattern to be replaced.

    Returns:
        str: The modified text with the pattern replaced.

    Example:
        >>> text = 'Some text $${JENKINS_SA_USERNAME.key} with a pattern.'
        >>> result = replace_pattern(text)
        >>> print(result)
        'Some text ${JENKINS_SA_USERNAME} with a pattern.'
    """
    pattern = r'\$\${([^}.]+)\.[^}]+\}'
    replacement = r'${\1}'
    return re.sub(pattern, replacement, text)

def search_keywords(parsed_robot, parsed_runbook_config, search_list, meta):
    """
    Search through the list of keywords in the robot file,
    looking for interesting patterns that we can extrapolate. 

    Args:
        parsed_robot (object): The parsed robot contents. 
        parsed_runbook_config (object): The parsed runbook config content.
        search_list (list): A list of strings to match desired keywords on. 
        meta (dict): The meta dict fetched from the runbook url

    Returns:
        A list of commands that matched the search pattern. 
    """
    # Default values if meta is None
    if meta is None:
        meta = {
            "commands": []
        }

    commands = []
    for task in parsed_robot['tasks']:
        for keyword in task['keywords']:
            if hasattr(keyword, 'name'):
                for item in search_list:
                    if item in keyword.args:
                        task_name=task_name_expansion(task["name"], parsed_runbook_config)
                        task_name_generalized = task["name"].replace('`', '').replace('${', '').replace('}', '')
                        name_snake_case = re.sub(r'\W+', '_', task_name_generalized.lower())
                        command = {
                            "name": f"{task_name}",
                            "command": cmd_expansion(keyword.args, parsed_runbook_config)
                        }
                        logger.debug(f"Searching for command name in meta: {name_snake_case}")
                        for cmd_meta in meta['commands']:
                            if cmd_meta['name'] == name_snake_case:
                                logger.debug(f"Found meta for {name_snake_case}")       
                                command['explanation'] = cmd_meta.get('explanation', "No command explanation available")
                                command['multi_line_details'] = cmd_meta.get('multi_line_details', "No multi-line explanation available")
                                command['doc_links'] = cmd_meta.get('doc_links', [])
                                break  # Break out of the loop once a match is found
                        else:
                            command['explanation'] = "No command explanation available"  # Executed if no match is found
                            command['multi_line_details'] = "No multi-line explanation available"
                            command['doc_links'] = []
                        commands.append(command)
    return commands

def parse_yaml (fpath):
    with open(fpath, 'r') as file:
        data = yaml.safe_load(file)
    return data


def find_files(directory, pattern):
    """
    Search for files given directory and its subdirectories matching a pattern.

    Args:
        directory (str): The path of the directory to search.

    Returns:
        A list of file paths that match the search criteria.
    """
    matches = []
    for root, dirnames, filenames in os.walk(directory):
        for filename in fnmatch.filter(filenames, pattern):
            matches.append(os.path.join(root, filename))
    return matches


def fetch_robot_source(parsed_runbook_config):
    """
    Fetch raw robot file from github as referenced in the runbook.yaml

    Args:
        parsed_runbook_config (dict): The parsed runbook configuration.

    Returns:
        str: The local path to the robot file.
    """
    repo = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-1]
    owner = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-2]
    ref = parsed_runbook_config["spec"]["codeBundle"]["ref"]
    robot_file_path = parsed_runbook_config["spec"]["codeBundle"]["pathToRobot"]

    cache_dir_name = f"{owner}_{repo}_{ref}-cache"
    local_path = os.path.join(os.getcwd(), cache_dir_name)

    # Assuming the repository exists because of the warm_git_cache function
    file_path = os.path.join(local_path, robot_file_path)
    return file_path

def generate_slx_hints(runbook_path):
    """
    From the runbook path, find the SLX and generate text hints. 

    Args:
        runbook_path (str): The path to the runbook yaml. 

    Returns:
        Object 
    """
    parsed_slx=parse_yaml(runbook_path.replace('runbook', 'slx'))
    slx_hints = {}
    slx_hints["slug"] = f'{parsed_slx["spec"]["alias"]}'.replace(' ','-')
    slx_hints["icon"] = parsed_slx["spec"]["imageURL"] if "imageURL" in parsed_slx["spec"] else "https://storage.googleapis.com/runwhen-nonprod-shared-images/icons/cloud_default.svg"    
    slx_hints["slx_short_name"] = f'{parsed_slx["metadata"]["name"]}'.split('--')[1].strip()
    slx_hints["nice_name"]=f'{parsed_slx["spec"]["alias"]}  '
    slx_hints["statement"]=f'{parsed_slx["spec"]["statement"]}'
    slx_hints["as_measured_by"]=f'<strong>As Measured By:</strong> {parsed_slx["spec"]["asMeasuredBy"]}'
    slx_hints["namespace"] = parsed_slx.get("spec", {}).get("additionalContext", {}).get("namespace", None)
    slx_hints["cluster"] = parsed_slx.get("spec", {}).get("additionalContext", {}).get("cluster", None)
    return slx_hints

def find_group_name(groups, target_slx):
    for group in groups:
        if target_slx in group['slxs']:
            return group['name']
    return f'ungrouped'

def find_cluster_name(groups, target_slx):
    for group in groups:
        if target_slx in group['slxs']:
            return group['name']
    return f'ungrouped'

def update_last_scan_time():
    file_path = "cheat-sheet-docs/mkdocs.yml"

    try:
        with open(file_path, "r") as file:
            content = file.readlines()

        current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        updated_content = []
        for line in content:
            if line.startswith("    scan_date:"):
                line = f"    scan_date: {current_date}\n"
            updated_content.append(line)

        with open(file_path, "w") as file:
            file.writelines(updated_content)
    except Exception as e:
        print(f"An error occurred while updating the file: {e}")

# def discovery_summary(resource_dump_file):
#     summary = {}
#     try:
#         with open(resource_dump_file, 'r') as file:
#             data = yaml.safe_load(file)
            
#             # Summarize Clusters
#             clusters = data["clusters"]
#             summary["num_clusters"] = len(clusters)
#             summary["cluster_names"] = list(clusters.keys())

#             total_ingresses = 0
#             total_namespaces = 0
#             total_pods = 0 
#             total_daemonsets = 0 
#             total_statefulsets = 0 
#             for cluster in clusters.values():
#                 ingresses = cluster.get('ingresses', [])
#                 total_ingresses += len(ingresses)
#                 namespaces = cluster.get('namespaces', [])
#                 total_namespaces += len(namespaces)
#                 pods = cluster.get('pods', [])
#                 total_pods += len(pods)
#                 daemonsets = cluster.get('daemonSets', [])
#                 total_daemonsets += len(daemonsets)
#                 statefulsets = cluster.get('statefulSets', [])
#                 total_statefulsets += len(statefulsets)

#             summary["num_namespaces"] = total_namespaces
#             summary["num_ingresses"] = total_ingresses
#             summary["num_pods"] = total_pods
#             summary["num_daemonsets"] = total_daemonsets
#             summary["num_statefulsets"] = total_statefulsets


#             return summary
            
#     except FileNotFoundError:
#         print("Resource Dump File not found.")
#     except yaml.YAMLError as e:
#         print(f"Error while parsing YAML: {e}")  
    

def generate_index(summarized_resources, workspace_details, command_generation_summary_stats, slx_count): 
    index_path = f'cheat-sheet-docs/docs/index.md'
    home_path = f'cheat-sheet-docs/docs/overrides/home.html'
    index_template_file = "cheat-sheet-docs/templates/index-template.j2"
    home_template_file = "cheat-sheet-docs/templates/home-template.j2"
    index_env = jinja2.Environment(loader=jinja2.FileSystemLoader("."))
    home_env = jinja2.Environment(loader=jinja2.FileSystemLoader("."))
    index_template = index_env.get_template(index_template_file)
    home_template = home_env.get_template(home_template_file)
    current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Convert objects to strings using list comprehension
    cluster_list = [str(cluster) for cluster in summarized_resources["cluster_names"]]
    cluster_names = ', '.join(cluster_list)

    index_output = index_template.render(
        current_date=current_date,
        summarized_resources=summarized_resources,
        workspace_details=workspace_details,
        cluster_names=cluster_names,
        command_generation_summary_stats=command_generation_summary_stats, 
        slx_count=slx_count
    )
    home_output = home_template.render(
        current_date=current_date,
        summarized_resources=summarized_resources,
        workspace_details=workspace_details,
        cluster_names=cluster_names,
        command_generation_summary_stats=command_generation_summary_stats,
        slx_count=slx_count
    )

    with open(index_path, 'w') as index_file:
        index_file.write(index_output)
    index_file.close()

    with open(home_path, 'w') as home_file:
        home_file.write(home_output)
    home_file.close()

def generate_platform_upload(workspace_info, slx_count, auth_details): 
    platform_upload_path = f'cheat-sheet-docs/docs/platform-upload.md'
    platform_upload_template_file = "cheat-sheet-docs/templates/platform-upload.j2"
    platform_upload_env = jinja2.Environment(loader=jinja2.FileSystemLoader("."))
    platform_upload_template = platform_upload_env.get_template(platform_upload_template_file)


    platform_upload_output = platform_upload_template.render(
        workspace_info=workspace_info,
        slx_count=slx_count,
        auth_details=auth_details,
        app_url=os.environ.get('RW_LOCAL_APP_ENDPOINT', 'https://app.beta.runwhen.com')
    )

    with open(platform_upload_path, 'w') as platform_upload_file:
        platform_upload_file.write(platform_upload_output)
    platform_upload_file.close()

def env_check():
    config_file = "cheat-sheet-docs/mkdocs.yml"

    # Load the mkdocs.yml file
    yaml = ruamel.yaml.YAML()
    yaml.preserve_quotes = True  # Preserve quotes around strings
    yaml.indent(mapping=4, sequence=4, offset=2)  # Set indentation for dumped YAML
    with open(config_file, "r") as f:
        config = yaml.load(f)

    # Update the 'demo' key under the 'build' dict
    if "build" not in config:
        config["build"] = {}

    # Check if RW_LOCAL_DEMO environment variable exists
    if "RW_LOCAL_DEMO" in os.environ:
        demo_env_value = os.environ["RW_LOCAL_DEMO"].lower()
        if demo_env_value == "true":
            config["build"]["demo"] = True
        else:
            config["build"]["demo"] = False

    # Check if RW_LOCAL_DEMO environment variable exists
    if "RW_LOCAL_TERMINAL_DISABLED" in os.environ:
        terminal_disabled_env_value = os.environ["RW_LOCAL_TERMINAL_DISABLED"].lower()
        if terminal_disabled_env_value == "true":
            config["build"]["terminal_disabled"] = True
        else:
            config["build"]["terminal_disabled"] = False

    # Write the updated config back to mkdocs.yml file
    with open(config_file, "w") as f:
        yaml.dump(config, f)

cache = {}
cache_directory = "cheat-sheet-docs/docs/github_profile_cache"  # Directory to store cached files
cache_file = os.path.join(cache_directory, "cache.json")  # Path to the cache file

def load_cache():
    if os.path.exists(cache_file):
        with open(cache_file, "r") as file:
            return json.load(file)
    return {}

def save_cache():
    with open(cache_file, "w") as file:
        json.dump(cache, file)

def fetch_github_profile_icon(identifier):
    author_details = {}
    if identifier in cache:
        return cache[identifier]  # Return the cached GitHub username details

    try:
        # Look up GitHub username based on identifier (username or email)
        response = requests.get(f"https://api.github.com/search/users?q={identifier}")
        data = json.loads(response.text)

        if data['total_count'] == 0:
            return None  # No GitHub user found for the given identifier

        username = data['items'][0]['login']

        # Check if the cache directory exists, create it if necessary
        if not os.path.exists(cache_directory):
            os.makedirs(cache_directory)

        # Check if the profile icon is already cached
        profile_icon_file = os.path.join(cache_directory, f"{username}_icon.png")
        if os.path.exists(profile_icon_file):
            author_details["username"] = username
            author_details["profile_icon_path"] = profile_icon_file
            author_details["url"] = f"https://github.com/{username}"
        else:
            # Fetch profile icon URL
            response = requests.get(f"https://api.github.com/users/{username}")
            user_data = json.loads(response.text)

            author_details["username"] = user_data["login"]
            author_details["profile_icon_path"] = profile_icon_file
            author_details["url"] = user_data["html_url"]

            # Download and cache the profile icon image
            profile_icon_url = user_data["avatar_url"]
            response = requests.get(profile_icon_url)
            with open(profile_icon_file, "wb") as file:
                file.write(response.content)

        # Cache the GitHub username details
        cache[identifier] = author_details
        save_cache()

        return author_details

    except requests.RequestException as e:
        print(f"Error occurred: {str(e)}")
        return "Not Available"

    except requests.HTTPError as e:
        if e.response.status_code == 403:
            author_details["username"] = "apiLimitReached"
            author_details["profile_icon_path"] = "apiLimitReached"
            author_details["url"] = "apiLimitReached"
            return author_details

        print(f"HTTP error occurred: {str(e)}")
        return "Not Available"

    except KeyError:
        print("KeyError occurred: Required data not found in the API response.")
        return "Not Available"


def get_last_commit_age(owner, repo, ref, path):
    # Construct the local path using the new cache directory naming convention
    local_path = os.path.join(os.getcwd(), f'{owner}_{repo}_{ref}-cache')
    
    # If the repo is not in the cache, return an error message or None
    if not os.path.exists(local_path):
        print(f"The repository for {owner}/{repo} with reference {ref} is not found in the cache.")
        return None

    # Get repo object
    repo_obj = Repo(local_path)

    # Ensure the repo object is pointing to the provided ref
    if ref not in repo_obj.heads:
        print(f"Reference {ref} not found in the cached repository for {owner}/{repo}.")
        return None

    # Get the latest commit that involves the given path
    commits_touching_path = list(repo_obj.iter_commits(paths=path))

    # If there are no commits that touch the path, return None
    if not commits_touching_path:
        return None

    # Get the timestamp of the latest commit
    last_commit_timestamp = commits_touching_path[0].committed_date

    # Calculate the age of the last commit
    last_commit_datetime = datetime.datetime.fromtimestamp(last_commit_timestamp)
    current_datetime = datetime.datetime.now()
    commit_age = current_datetime - last_commit_datetime

    # Convert the age to appropriate units
    age_in_hours = commit_age.total_seconds() / 3600
    if 1 <= age_in_hours < 48:
        return f"{int(age_in_hours)} hours ago"  # using int() to round down
    age_in_days = age_in_hours / 24
    if 2 <= age_in_days < 14:
        return f"{int(age_in_days)} days ago"  # using int() to round down
    age_in_weeks = age_in_days / 7
    if age_in_weeks >= 2:
        return f"{int(age_in_weeks)} weeks ago"  # using int() to round down

def fetch_meta(owner, repo, path, ref="main"):
    """
    Fetches the meta.yaml file for the given runbook URL.

    Args:
        runbook_url (str): The GitHub URL of the runbook file to infer the meta.yaml.
        repo (str): The repository in the format "owner/repo_name".
        branch (str, optional): The branch name. Defaults to "main".

    Returns:
        The meta.yaml content as a dictionary, or None if the request failed.
    """
    # Derive the cache directory name from the repo and owner parameters
    cache_dir_name = f"{owner}_{repo}_{ref}-cache"

    meta_path = path.rsplit('/', 1)[0] + '/meta.yaml'
    # Update the local_path to include the cache directory name
    local_path = os.path.join(os.getcwd(), cache_dir_name)
    # Check if the meta.yaml file exists in the local cache
    local_meta_path = os.path.join(local_path, meta_path)
    if os.path.exists(local_meta_path):
        try:
            with open(local_meta_path, 'r') as f:
                yaml_data = yaml.safe_load(f)
            return yaml_data
        except IOError as e:
            print(f"Failed to read local meta.yaml file due to: {str(e)}")


    return None

def find_group_path(group_name):
    # Split out cluster name for doc_group_formatting
    # looks for a pattern like "group-name (cluster-name)"
    cluster_separator = r'^(.*?)\s+\((.*?)\)$'
    cluster_match = re.match(cluster_separator, group_name)
    if cluster_match:
        # Extract the name and cluster from the matched groups
        group_name = cluster_match.group(1)
        cluster_name = cluster_match.group(2)
        doc_group_dir_path = f'{cluster_name}/{group_name}'
    else:
        doc_group_dir_path = f'{group_name}'
    return doc_group_dir_path

def generate_auth_details():
    """
    Inspects authentication files and assigns useful values to an auth object for 
    generating upload documentation. 

    Uses markdown extensions from https://facelessuser.github.io/pymdown-extensions/  

    Returns:
        Object 
    """    
    auth_config_details = {
        'kubernetes': {
            'kubeconfig_details': None
        }
    }

    # Identify kubeconfig auth details
    kubeconfig_auth = None

    # Check for the existence of the files in the /shared/ directory
    # Assume user-provided kubeconfig is better than in-cluster auth
    if os.path.exists('/shared/kubeconfig'):
        kubeconfig_auth = "user-provided"
        with open('/shared/kubeconfig', 'r') as file:
            config_details = yaml.safe_load(file)
            auth_config_details['kubernetes']['kubeconfig_details'] = config_details
    elif os.path.exists('/shared/in_cluster_kubeconfig.yaml'):
        kubeconfig_auth = "in-cluster"
        with open('/shared/in_cluster_kubeconfig.yaml', 'r') as file:
            config_details = yaml.safe_load(file)
            auth_config_details['kubernetes']['kubeconfig_details'] = config_details
    auth_config_details['kubernetes']['type']= kubeconfig_auth


    return auth_config_details

def warm_git_cache(runbook_files):
    """
    Gets passed in a list of runbook files. 
    Parses out all git repos and clones them locally for later use as a cache.

    Args:
        runbook_files (dict): The path the output contents from map-builder. 
    """
    unique_repos = set()
    unique_authors = set()
    # Read every runbook ref and build a unique list of repos to clone
    for runbook in runbook_files:
        parsed_runbook_config = parse_yaml(runbook)
        repo = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-1]
        owner = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-2]
        ref = parsed_runbook_config["spec"]["codeBundle"]["ref"]
        unique_repos.add((owner, repo, ref))
    
    for owner, repo, ref in unique_repos:
        repo_url = f"https://github.com/{owner}/{repo}.git"
        cache_dir_name = f"{owner}_{repo}_{ref}-cache"
        local_path = os.path.join(os.getcwd(), cache_dir_name)
        
        if not os.path.exists(local_path):
            subprocess.run(['git', 'clone', '-b', ref, repo_url, local_path], stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        else:
            # If the repo is already cloned, pull the latest changes
            subprocess.run(['git', '-C', local_path, 'pull', 'origin', ref], stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        
        # Build list of unique authors
        runbook_robot_files = find_files(f"{owner}_{repo}_{ref}-cache", 'runbook.robot')
        for runbook in runbook_robot_files: 
            parsed_robot=parse_robot_file(runbook)
            logger.debug(f"DEBUG: Create Unique Author List - Runbook Details: {parsed_robot}")       
            author = ''.join(parsed_robot["author"].split('\n'))
            fetch_github_profile_icon(author)


def process_runbook(runbook, groups, search_list, template):
    parsed_runbook_config = parse_yaml(runbook)
    robot_file = fetch_robot_source(parsed_runbook_config)
    runbook_url = f'{parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git")}/tree/{parsed_runbook_config["spec"]["codeBundle"]["ref"]}/{parsed_runbook_config["spec"]["codeBundle"]["pathToRobot"]}'
    owner = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-2]
    repo = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-1]
    path = parsed_runbook_config["spec"]["codeBundle"]["pathToRobot"].rstrip('runbook.robot')
    ref = parsed_runbook_config["spec"]["codeBundle"]["ref"]
    commit_age = get_last_commit_age(owner, repo, ref, path)
    parsed_robot = parse_robot_file(robot_file)
    slx_hints = generate_slx_hints(runbook)
    doc = ''.join(parsed_robot["doc"].split('\n'))
    author = ''.join(parsed_robot["author"].split('\n'))
    group_name = find_group_name(groups, slx_hints["slx_short_name"])  # NOTE: 'groups' variable is not defined in the provided context
    group_path = find_group_path(f"{group_name}")
    meta = fetch_meta(owner=owner, repo=repo, path=path, ref=ref)
    interesting_commands = search_keywords(parsed_robot, parsed_runbook_config, search_list, meta)
    command_generation_summary_stats["total_interesting_commands"] += len(interesting_commands)
    author_details = fetch_github_profile_icon(author)
    command_generation_summary_stats["unique_authors"].append(author)
    output = template.render(
        runbook=runbook.split("/output", 1)[-1],
        author=author,
        slx_hints=slx_hints,
        doc=doc,
        runbook_url=runbook_url,
        interesting_commands=interesting_commands,
        command_count=len(interesting_commands),
        author_details=author_details,
        commit_age=commit_age
    )
    content_dir = f'cheat-sheet-docs/docs-tmp/{group_path}/'
    command_assist_md_output = f'{content_dir}{slx_hints["slug"]}.md'
    if not os.path.exists(content_dir):
        try:
            os.makedirs(content_dir)  # Create the full directory path
        except OSError as e:
            print(f"Error creating directory: {e}")
    with open(command_assist_md_output, 'w') as md_file:
        md_file.write(output)

# Useful when testing changes like parallel processing
def timer(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        duration = end_time - start_time
        print(f"'{func.__name__}' executed in {duration:.2f} seconds")
        return result
    return wrapper


# Init global stats variables
command_generation_summary_stats = {}
command_generation_summary_stats["total_interesting_commands"] = 0 
command_generation_summary_stats["unique_authors"] = []
command_generation_summary_stats["num_unique_authors"] = 0

#@timer
def cheat_sheet(directory_path):
    """
    Gets passed in a directory to scan for robot files. 
    Performs variable substitution and summarises SLX detail, 
    written out into a local markdown file and served by mkdocs for local dev use.

    Uses markdown extensions from https://facelessuser.github.io/pymdown-extensions/  

    Args:
        args (str): The path the output contents from map-builder. 
    """
    ## Switched to args to only match on  render_in_commandlist=true
    ## Not sure if this is the most scalable approach, so it's just 
    ## a test for now
    # search_list = ['RW.K8s.Shell', 'RW.CLI.Run Cli']

    env_check()
    update_last_scan_time()
    auth_details=generate_auth_details()
    search_list = ['render_in_commandlist=true', 'show_in_rwl_cheatsheet=true']
    runbook_files = find_files(directory_path, 'runbook.yaml')
    workspace_files = find_files(directory_path, 'workspace.yaml')
    with open("/shared/workspaceInfo.yaml", 'r') as workspace_info_file:
        workspace_info = yaml.safe_load(workspace_info_file)
    workspace_info_file.close()


    slx_files = find_files(directory_path, 'slx.yaml')
    slx_count = len(slx_files)
    
    # Try to fetch all git clones before processing anything deeper
    warm_git_cache(runbook_files)
    
    # Generage customized upload page
    generate_platform_upload(workspace_info, slx_count, auth_details)

    ## TODO determine if we wish to support more than one workspace... 
    ## there would be a bit of refactoring to do if this is the case
    resource_dump_file = f'{directory_path}/resource-dump.yaml'
    workspace_details = parse_yaml(workspace_files[0])

    # Reset ungrouped path
    if os.path.exists(f'cheat-sheet-docs/docs-tmp/'):
        try: 
            shutil.rmtree(f'cheat-sheet-docs/docs-tmp/')
        except Exception as e:
            print(f"An error occurred while removing the files: {e}")
    if not os.path.exists(f'cheat-sheet-docs/docs-tmp/'):
        os.makedirs(f'cheat-sheet-docs/docs-tmp/')
        os.makedirs(f'cheat-sheet-docs/docs-tmp/ungrouped')
    ## Check if groups are defined in the workspace file
    ## If so, rebuild the directory path to set up for groupings
    if "spec" in workspace_details and "slxGroups" in workspace_details["spec"]:
        groups = workspace_details["spec"]["slxGroups"]

        for group in groups: 
            doc_group_dir_path = find_group_path(f"{group['name']}")
            if not os.path.exists(f'cheat-sheet-docs/docs-tmp/{doc_group_dir_path}'):
                os.makedirs(f'cheat-sheet-docs/docs-tmp/{doc_group_dir_path}')

    else: 
        groups = []

    # Prep to use jinja template for rendered commands
    template_file = "cheat-sheet-docs/templates/doc-template.j2"
    env = jinja2.Environment(loader=jinja2.FileSystemLoader("."))
    template = env.get_template(template_file)

    with ThreadPoolExecutor() as executor:
      results = list(executor.map(lambda runbook: process_runbook(runbook, groups, search_list, template), runbook_files))

    # Move from tmp to main docs foder
    source_dir = 'cheat-sheet-docs/docs-tmp/'

    destination_dir = 'cheat-sheet-docs/docs/'
    for root, dirs, files in os.walk(source_dir):
        # Get the relative path from the source directory
        relative_path = os.path.relpath(root, source_dir)
        destination_path = os.path.join(destination_dir, relative_path)

        # Create the destination directory if it doesn't exist
        os.makedirs(destination_path, exist_ok=True)

        # Copy each file to the destination directory
        for file in files:
            source_file = os.path.join(root, file)
            destination_file = os.path.join(destination_path, file)
            shutil.copy2(source_file, destination_file)
    # Determine unique authors
    command_generation_summary_stats["unique_authors"] = set(command_generation_summary_stats["unique_authors"])
    command_generation_summary_stats["num_unique_authors"] = len(command_generation_summary_stats["unique_authors"])

    # Generate stats and home page
    cluster_data = auth_details.get('kubernetes', {}).get('kubeconfig_details', {}).get('clusters', [])
    summarized_resources = {}
    summarized_resources["groups"] = len(groups)
    summarized_resources["num_clusters"] = len(cluster_data)
    summarized_resources["cluster_names"] = [cluster.get('name') for cluster in cluster_data]
    generate_index(summarized_resources, workspace_details, command_generation_summary_stats, slx_count)


if __name__ == "__main__":
    cheat_sheet(sys.argv[1])

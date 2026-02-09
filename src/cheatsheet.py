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
import tempfile
from utils import get_proxy_config, get_request_verify
from robot.api import TestSuite
from tempfile import NamedTemporaryFile
from functools import lru_cache
from git import Repo, GitCommandError
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse
from collections import Counter

logger = logging.getLogger(__name__)
handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Tags
all_support_tags = []
support_tags_to_remove = []

# Check for the environment variable and set the log level
if os.environ.get('DEBUG_LOGGING') == 'true':
    logger.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)


# ------------------------------------------------------------------
# Shared git-mirror helpers (same semantics as code_collection.py)
# ------------------------------------------------------------------
# ---------- resolve USE_LOCAL_GIT (precedence: env-var > workspaceInfo.yaml > default) ----------
USE_LOCAL_GIT: bool = False          # 1) default

# 2) workspaceInfo.yaml (lowest override)
_ws_path = "/shared/workspaceInfo.yaml"
try:
    with open(_ws_path, "r") as _f:
        _cfg = yaml.safe_load(_f) or {}
    _ws_val = _cfg.get("useLocalGit")
    if isinstance(_ws_val, bool):
        USE_LOCAL_GIT = _ws_val
    elif isinstance(_ws_val, str):
        USE_LOCAL_GIT = _ws_val.lower() == "true"
except Exception:
    pass

# 3) env-var override (highest precedence – wins over workspaceInfo)
_env_val = os.getenv("WB_USE_LOCAL_GIT")
if _env_val is not None:
    USE_LOCAL_GIT = _env_val.lower() == "true"

logger.info("USE_LOCAL_GIT resolved to %s (env=%s, yaml=%s)",
            USE_LOCAL_GIT, os.getenv("WB_USE_LOCAL_GIT"),
            _ws_path if os.path.isfile(_ws_path) else "<missing>")
# ---------- end USE_LOCAL_GIT resolution ----------

LOCAL_CACHE_ROOT = os.getenv("CODE_COLLECTION_CACHE_ROOT",
                             "/opt/runwhen/codecollection-cache")

def mirror_path(owner: str, repo: str) -> str:
    """Return the bare-mirror directory for owner/repo or '' if absent."""
    return os.path.join(LOCAL_CACHE_ROOT, f"{repo}.git")

def ensure_worktree_from_mirror(owner: str, repo: str, ref: str, dest: str):
    """
    Materialise <ref> (branch *or* tag) from the bare mirror into <dest>.

    * When USE_LOCAL_GIT is true, the mirror **must** exist.
    * Creates the work-tree in **detached HEAD** mode so tags work.
    """
    mpath = mirror_path(owner, repo)

    if USE_LOCAL_GIT:
        if not os.path.isdir(mpath):
            raise RuntimeError(
                f"Local git mirror missing for {owner}/{repo}. "
                "Rebuild the image with INCLUDE_CODE_COLLECTION_CACHE=true "
                "or disable useLocalGit."
            )

        bare = Repo(mpath)

        # Resolve commitish (branch, tag, or SHA); raise if absent.
        try:
            commitish = bare.git.rev_parse("--verify", ref)
        except GitCommandError:
            # try explicit tag path
            try:
                commitish = bare.git.rev_parse("--verify", f"refs/tags/{ref}")
            except GitCommandError as exc:
                raise RuntimeError(f"Ref '{ref}' not found in mirror {owner}/{repo}") from exc

        # If dest exists and is already a worktree on the same commit, skip.
        if os.path.isdir(dest):
            try:
                wt = Repo(dest)
                if wt.head.commit.hexsha == commitish:
                    return
            except Exception:
                shutil.rmtree(dest)

        # Add work-tree in detached-HEAD mode so both branches & tags work.
        bare.git.worktree("add", "--force", "--detach", dest, commitish)
        return

    # -------- network-clone fallback --------
    Repo.clone_from(
        f"https://github.com/{owner}/{repo}.git",
        dest,
        branch=ref,
        depth=1
    )
# ------------------------------------------------------------------


@lru_cache(maxsize=2048)
def parse_robot_file(fpath):
    """
    Parses a robot file into a python object that is
    JSON-serializable, representing key items about the file contents.
    """
    suite = TestSuite.from_file_system(fpath)
    ret = {}
    ret["doc"] = suite.doc  # The doc string
    ret["type"] = suite.name.lower()
    ret["tags"] = []
    ret["supports"] = []

    for k, v in suite.metadata.items():
        if k.lower() in ["author", "name"]:
            ret[k.lower()] = v
        if k.lower() in ["supports"]:
            support_tags = re.split(r'\s*,\s*|\s+', v.strip().upper())
            ret["support_tags"] = support_tags
            all_support_tags.extend(support_tags)

    tasks = []
    for task in suite.tests:
        tags = [str(tag) for tag in task.tags if tag not in ["skipped"]]
        tasks.append(
            {
                "id": task.id,
                "name": task.name,
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
    cmd = cmd.replace(r'\\\$', '$')
    cmd = cmd.replace(r'\\\%', '%')
    cmd = cmd.replace('\\\n', '')
    cmd = cmd.replace('\\\\', '\\')
    # Cases where two spaces are escaped in robot
    cmd = cmd.replace(' \\ ', '  ')
    cmd = cmd.encode().decode('unicode_escape')
    # Handle wrapped quotes
    if len(cmd) > 1 and cmd[0] == cmd[-1] == '"':
        cmd = cmd[1:-1]
    if len(cmd) > 1 and cmd[0] == cmd[-1] == "'":
        cmd = cmd[1:-1]
    return cmd

def safe_substitute(original_string, placeholder, replacement):
    """
    Safely substitutes a placeholder in a string with the replacement value.
    If the replacement is None or not a string, it substitutes with an empty string.
    """
    replacement = str(replacement) if isinstance(replacement, str) else ''
    return original_string.replace(placeholder, replacement)

def cmd_expansion(keyword_arguments, parsed_runbook_config):
    """
    Cleans up the command details from robot parsing,
    attempts to make the command human readable, substituting
    config-provided values.
    """
    cmd = {}
    cmd_components = str(keyword_arguments)
    logger.debug(f"Pre-rendered command components: {cmd_components}")       
    logger.debug(f"Runbook config: {parsed_runbook_config}")       

    cmd_components = cmd_components.lstrip('(').rstrip(')')

    logger.debug(f"Command Components: {cmd_components}")       
    split_regex = re.compile(r'''((?:[^,'"]|'(?:(?:\\')|[^'])*'|"(?:\\"|[^"])*")+)''')
    cmd_components = split_regex.split(cmd_components)[1::2]

    # Basic check for position
    logger.debug(f"Command: {cmd_components[0]}")
    if len(cmd_components) > 1:
        logger.debug(f"Arguments: {cmd_components[1]}")

    if cmd_components[0].startswith(("\'cmd=", "cmd=", "\"cmd=")):
        cmd_components[0] = cmd_components[0].replace('cmd=', '')
        cmd_str = cmd_components[0]
        cmd_str = remove_auth_commands(cmd_str)
        cmd_str = replace_env_key(cmd_str)

        service_name = ""
        if parsed_runbook_config.get("spec", {}).get("servicesProvided"):
            service_name = parsed_runbook_config["spec"]["servicesProvided"][0].get("name", "")
            logger.debug(f"Safe substitution of {service_name}.")
            cmd_str = safe_substitute(cmd_str, '${binary_name}', service_name)
            cmd_str = safe_substitute(cmd_str, '${BINARY_USED}', service_name)
            cmd_str = safe_substitute(cmd_str, '${KUBERNETES_DISTRIBUTION_BINARY}', service_name)
        else:
            logger.debug("No services provided in 'servicesProvided'; using empty string for service_name.")

    elif cmd_components[0].startswith('\'bash_file='):
        logger.debug(f"Rendering bash file: {cmd_components[0]}")
        script = cmd_components[0].replace('bash_file=', '')
        codebundle_path_parts = parsed_runbook_config['spec']['codeBundle']['pathToRobot'].split('/')
        codebundle_directory_path = '/'.join(codebundle_path_parts[:-1])
        file_path = f"{codebundle_directory_path}/{script}".replace("'", "")
        logger.debug(f"Rendering bash file path: {file_path}")

        raw_script_url = generate_raw_git_url(
            git_url=parsed_runbook_config["spec"]["codeBundle"]["repoUrl"],
            ref=parsed_runbook_config["spec"]["codeBundle"]["ref"],
            file_path=file_path
        )
        env = ""
        for var in parsed_runbook_config["spec"]["configProvided"]:
            env += f"{var['name']}=\"{var['value']}\" "

        matched_cmd_override = None
        for arg in cmd_components:
            arg = arg.strip()
            logger.debug(f"Bash File Arg: {arg}")
            if arg.startswith("\'cmd_override"):
                logger.debug(f"Command Override Detected: {arg}")
                matched_cmd_override = arg
                break

        if matched_cmd_override is not None:
            cmd_parts = matched_cmd_override.split()
            cmd_arguments = ' '.join(cmd_parts[1:]).strip("'")
            cmd_components[0] = f"{env} bash -c \"$(curl -s {raw_script_url})\" _ {cmd_arguments}"
        else:
            cmd_components[0] = f"{env} bash -c \"$(curl -s {raw_script_url})\" _"

        logger.debug(f"Rendering bash file after split: {cmd_components}")
        cmd_str = cmd_components[0]
    else:
        cmd_str = "Could not render command"

    cmd["public"] = remove_escape_chars(cmd_str)

    for var in parsed_runbook_config["spec"].get("configProvided", []):
        placeholder = '${' + var["name"] + '}'
        cmd_str = safe_substitute(cmd_str, placeholder, var["value"])

    cmd["private"] = remove_escape_chars(cmd_str)
    return cmd

def generate_raw_git_url(git_url, file_path, ref):
    """
    Returns a file:// URL when using local mirrors, falling back to raw.github
    when network clones are allowed.
    """
    parsed = urlparse(git_url)
    owner, repo = parsed.path.lstrip("/").rstrip(".git").split("/")[:2]

    if USE_LOCAL_GIT:
        mirror = mirror_path(owner, repo)
        if not os.path.isdir(mirror):
            logger.error("Mirror missing for %s/%s", owner, repo)
            return None
        return f"file://{mirror}/{file_path}"        # consumed via 'bash -c "$(cat …)"'

    # original behaviour (network)
    return f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{file_path}"


def task_name_expansion(task_name, parsed_runbook_config):
    """
    Cleans up the task title from robot parsing,
    substituting dynamic vars from configProvided.
    """
    logger.debug(f"Task Title Substitution: return {task_name}")
    for var in parsed_runbook_config["spec"]["configProvided"]:
        value_str = str(var["value"]) if var["value"] is not None else ''
        if var["value"] is None:
            logger.warning(f"Variable '{var['name']}' is None; substituting empty string.")
        task_name = task_name.replace('${' + var["name"] + '}', value_str)
        logger.debug(f"Tailored var name {var['name']} for {value_str}")
    return task_name

def remove_auth_commands(command):
    """
    Removes common authentication patterns in CLI output,
    assuming the user is already authenticated differently.
    """
    auth_patterns = [
        "gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS && "
    ]
    for pattern in auth_patterns:
        command = command.replace(pattern, '')
    return command

def replace_env_key(text):
    """
    Replaces a pattern like $${JENKINS_SA_USERNAME.key} with ${JENKINS_SA_USERNAME}.
    """
    pattern = r'\$\${([^}.]+)\.[^}]+\}'
    replacement = r'${\1}'
    return re.sub(pattern, replacement, text)

def search_keywords(parsed_robot, parsed_runbook_config, search_list, meta):
    """
    Search through the keywords in the robot file,
    looking for interesting patterns from search_list.
    """
    if meta is None:
        meta = {"commands": []}

    def is_unique_command(cmd_list, cmd_dict):
        return not any(
            c['name'] == cmd_dict['name'] and c['command'] == cmd_dict['command']
            for c in cmd_list
        )

    commands = []
    for task in parsed_robot['tasks']:
        for keyword in task['keywords']:
            if hasattr(keyword, 'name'):
                for item in search_list:
                    if item in keyword.args:
                        task_name = task_name_expansion(task["name"], parsed_runbook_config)
                        task_name_generalized = (
                            task["name"].replace('`', '').replace('${', '').replace('}', '')
                        )
                        name_snake_case = re.sub(r'\W+', '_', task_name_generalized.lower())
                        command_info = {
                            "name": f"{task_name}",
                            "command": cmd_expansion(keyword.args, parsed_runbook_config)
                        }
                        logger.debug(f"Searching for command name in meta: {name_snake_case}")
                        for cmd_meta in meta['commands']:
                            if cmd_meta['name'] == name_snake_case:
                                logger.debug(f"Found meta for {name_snake_case}")
                                command_info['explanation'] = cmd_meta.get('explanation', "No command explanation available")
                                command_info['multi_line_details'] = cmd_meta.get('multi_line_details', "No multi-line explanation available")
                                command_info['doc_links'] = cmd_meta.get('doc_links', [])
                                break
                        else:
                            command_info['explanation'] = "No command explanation available"
                            command_info['multi_line_details'] = "No multi-line explanation available"
                            command_info['doc_links'] = []

                        if is_unique_command(commands, command_info):
                            commands.append(command_info)

    return commands

def parse_yaml(fpath):
    with open(fpath, 'r') as file:
        return yaml.safe_load(file)

def find_files(directory, pattern):
    """
    Recursively search directory for files matching pattern.
    """
    matches = []
    for root, dirnames, filenames in os.walk(directory):
        for filename in fnmatch.filter(filenames, pattern):
            matches.append(os.path.join(root, filename))
    return matches

def fetch_robot_source(parsed_runbook_config, mkdocs_dir):
    """
    Fetch raw robot file from the local cache
    referenced by runbook.yaml.
    """
    repo = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-1]
    owner = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-2]
    ref = parsed_runbook_config["spec"]["codeBundle"]["ref"]
    robot_file_path = parsed_runbook_config["spec"]["codeBundle"]["pathToRobot"]

    cache_dir_name = f"{owner}_{repo}_{ref}-cache"
    local_path = os.path.join(mkdocs_dir, cache_dir_name)
    file_path = os.path.join(local_path, robot_file_path)
    return file_path

def generate_slx_hints(runbook_path):
    """
    From runbook path, find the corresponding SLX
    and generate hints from additionalContext, etc.
    """
    parsed_slx = parse_yaml(runbook_path.replace('runbook', 'slx'))
    slx_hints = {
        "slug": f'{parsed_slx["spec"]["alias"]}'.replace(' ', '-'),
        "icon": parsed_slx["spec"].get("imageURL", "https://storage.googleapis.com/runwhen-nonprod-shared-images/icons/cloud_default.svg"),
        "slx_short_name": f'{parsed_slx["metadata"]["name"]}'.split('--')[1].strip(),
        "nice_name": f'{parsed_slx["spec"]["alias"]}  ',
        "statement": f'{parsed_slx["spec"]["statement"]}',
        "as_measured_by": f'<strong>As Measured By:</strong> {parsed_slx["spec"]["asMeasuredBy"]}'
    }

    allowed_tags = ["namespace", "cluster", "project", "resource_group"]
    additional_context = parsed_slx.get("spec", {}).get("additionalContext", {})
    slx_hints["tags"] = {k: v for k, v in additional_context.items() if k in allowed_tags}
    return slx_hints

def find_group_name(groups, target_slx):
    for group in groups:
        if target_slx in group['slxs']:
            return group['name']
    return 'ungrouped'

def find_cluster_name(groups, target_slx):
    for group in groups:
        if target_slx in group['slxs']:
            return group['name']
    return 'ungrouped'

def update_last_scan_time(mkdocs_dir):
    """
    Update the 'scan_date' field in mkdocs.yml at mkdocs_dir.
    """
    file_path = os.path.join(mkdocs_dir, "mkdocs.yml")

    try:
        with open(file_path, "r") as file:
            content = file.readlines()

        current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        updated_content = []
        for line in content:
            if line.strip().startswith("scan_date:") or "scan_date:" in line:
                # Loose check in case indentation changes
                prefix_spaces = line.split("scan_date:")[0]
                line = f"{prefix_spaces}scan_date: {current_date}\n"
            updated_content.append(line)

        with open(file_path, "w") as file:
            file.writelines(updated_content)
    except Exception as e:
        print(f"An error occurred while updating the file: {e}")

def generate_index(all_support_tags_freq,
                   summarized_resources,
                   workspace_details,
                   command_generation_summary_stats,
                   slx_count,
                   mkdocs_dir):
    """
    Generate an index.md and overrides/home.html in mkdocs_dir/docs,
    using Jinja2 templates from mkdocs_dir/templates.
    """
    import jinja2
    import datetime
    import os

    # Paths where we'll render final output
    index_path = os.path.join(mkdocs_dir, "docs", "index.md")
    home_path = os.path.join(mkdocs_dir, "docs", "overrides", "home.html")

    # The directory where the .j2 templates live
    templates_dir = os.path.join(mkdocs_dir, "templates")

    # Basenames for the Jinja templates
    index_template_file = "index-template.j2"
    home_template_file = "home-template.j2"

    # Create two separate Jinja environments (or reuse one if you prefer)
    index_env = jinja2.Environment(loader=jinja2.FileSystemLoader(templates_dir))
    home_env = jinja2.Environment(loader=jinja2.FileSystemLoader(templates_dir))

    # Get the actual Template objects by their names
    index_template = index_env.get_template(index_template_file)
    home_template = home_env.get_template(home_template_file)

    current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Example data: cluster list -> string
    cluster_list = [str(c) for c in summarized_resources.get("cluster_names", [])]
    cluster_names = ', '.join(cluster_list) if cluster_list else None

    # Frequency of tags
    top_10_support_tags = all_support_tags_freq.most_common(10)
    top_10_support_tag_names = [tag for tag, _ in top_10_support_tags]
    tag_icon_url_map = load_icon_urls_for_tags(top_10_support_tag_names)

    tags_with_icons = [{
        "name": tag,
        "icon_url": tag_icon_url_map.get(tag, "default_icon_url")
    } for tag in top_10_support_tag_names]

    # Summaries
    resource_summary = {
        "clusters": summarized_resources.get("clusters", 0),
        "resource_groups": summarized_resources.get("resource_groups", 0),
        "aws_resources": summarized_resources.get("aws_resources", 0),
        "gcp_resources": summarized_resources.get("gcp_resources", 0),
        "groups": summarized_resources.get("groups", 0)
    }
    resource_summary = {k: v for k, v in resource_summary.items() if v > 0}

    # Render index
    index_output = index_template.render(
        current_date=current_date,
        summarized_resources=summarized_resources,
        workspace_details=workspace_details,
        cluster_names=cluster_names,
        command_generation_summary_stats=command_generation_summary_stats,
        slx_count=slx_count,
        tags_with_icons=tags_with_icons
    )

    # Render home
    home_output = home_template.render(
        current_date=current_date,
        summarized_resources=summarized_resources,
        resource_summary=resource_summary,
        workspace_details=workspace_details,
        cluster_names=cluster_names,
        command_generation_summary_stats=command_generation_summary_stats,
        slx_count=slx_count
    )

    # Ensure directories exist
    os.makedirs(os.path.dirname(index_path), exist_ok=True)
    with open(index_path, 'w') as index_file:
        index_file.write(index_output)

    os.makedirs(os.path.dirname(home_path), exist_ok=True)
    with open(home_path, 'w') as home_file:
        home_file.write(home_output)


def env_check(mkdocs_dir):
    """
    Loads and re-saves mkdocs.yml in mkdocs_dir to preserve quotes, indentation, etc.
    """
    config_file = os.path.join(mkdocs_dir, "mkdocs.yml")
    if not os.path.exists(config_file):
        logger.warning(f"No mkdocs.yml found at {config_file}; skipping env_check.")
        return

    yaml_loader = ruamel.yaml.YAML()
    yaml_loader.preserve_quotes = True
    yaml_loader.indent(mapping=4, sequence=4, offset=2)
    with open(config_file, "r") as f:
        config = yaml_loader.load(f)

    with open(config_file, "w") as f:
        yaml_loader.dump(config, f)

cache = {}
command_generation_summary_stats = {
    "total_interesting_commands": 0,
    "unique_authors": [],
    "num_unique_authors": 0
}

def load_cache(mkdocs_dir):
    """
    Loads a JSON cache from mkdocs_dir/docs/github_profile_cache/cache.json
    if present.
    """
    cache_directory = os.path.join(mkdocs_dir, "docs", "github_profile_cache")
    cache_file = os.path.join(cache_directory, "cache.json")
    if os.path.exists(cache_file):
        with open(cache_file, "r") as file:
            return json.load(file)
    return {}

def save_cache(mkdocs_dir):
    """
    Saves the global 'cache' to mkdocs_dir/docs/github_profile_cache/cache.json
    """
    cache_directory = os.path.join(mkdocs_dir, "docs", "github_profile_cache")
    cache_file = os.path.join(cache_directory, "cache.json")
    os.makedirs(cache_directory, exist_ok=True)
    with open(cache_file, "w") as file:
        json.dump(cache, file)

def fetch_github_profile_icon(identifier, mkdocs_dir=None):
    """
    Look up GitHub user info for 'identifier' (user or email),
    caching results in mkdocs_dir/docs/github_profile_cache/cache.json.
    """
    if mkdocs_dir is None:
        mkdocs_dir = "cheat-sheet-docs"  # fallback if none provided

    global cache
    if not cache:
        cache = load_cache(mkdocs_dir)

    if identifier in cache:
        return cache[identifier]

    author_details = {}
    try:
        response = requests.get(
            f"https://api.github.com/search/users?q={identifier}",
            verify=get_request_verify()
        )
        data = response.json()
        if data['total_count'] == 0:
            return None

        username = data['items'][0]['login']

        cache_directory = os.path.join(mkdocs_dir, "docs", "github_profile_cache")
        os.makedirs(cache_directory, exist_ok=True)

        profile_icon_file = os.path.join(cache_directory, f"{username}_icon.png")
        if os.path.exists(profile_icon_file):
            author_details["username"] = username
            author_details["profile_icon_path"] = profile_icon_file
            author_details["url"] = f"https://github.com/{username}"
        else:
            # fetch user info
            resp_user = requests.get(f"https://api.github.com/users/{username}", verify=get_request_verify())
            user_data = resp_user.json()

            author_details["username"] = user_data["login"]
            author_details["profile_icon_path"] = profile_icon_file
            author_details["url"] = user_data["html_url"]

            # download and cache icon
            profile_icon_url = user_data["avatar_url"]
            icon_resp = requests.get(profile_icon_url, verify=get_request_verify())
            with open(profile_icon_file, "wb") as file:
                file.write(icon_resp.content)

        cache[identifier] = author_details
        save_cache(mkdocs_dir)
        return author_details

    except requests.RequestException as e:
        logging.error(f"Error occurred: {str(e)}")
        return "Not Available"
    except requests.HTTPError as e:
        if e.response.status_code == 403:
            author_details["username"] = "apiLimitReached"
            author_details["profile_icon_path"] = "apiLimitReached"
            author_details["url"] = "apiLimitReached"
            return author_details
        logging.error(f"HTTP error occurred: {str(e)}")
        return "Not Available"
    except KeyError:
        logging.warning("KeyError occurred: Required data not found in the API response.")
        return "Not Available"

def get_last_commit_age(owner, repo, ref, path, mkdocs_dir):
    local_path = os.path.join(mkdocs_dir, f'{owner}_{repo}_{ref}-cache')
    if not os.path.exists(local_path):
        logging.debug(f"The repository for {owner}/{repo} with reference {ref} is not found in the cache.")
        return None

    repo_obj = Repo(local_path)
    if ref not in repo_obj.heads:
        logging.debug(f"Reference {ref} not found in the cached repository for {owner}/{repo}.")
        return None

    commits_touching_path = list(repo_obj.iter_commits(paths=path))
    if not commits_touching_path:
        return None

    last_commit_timestamp = commits_touching_path[0].committed_date
    last_commit_datetime = datetime.datetime.fromtimestamp(last_commit_timestamp)
    current_datetime = datetime.datetime.now()
    commit_age = current_datetime - last_commit_datetime

    age_in_hours = commit_age.total_seconds() / 3600
    if 1 <= age_in_hours < 48:
        return f"{int(age_in_hours)} hours ago"
    age_in_days = age_in_hours / 24
    if 2 <= age_in_days < 14:
        return f"{int(age_in_days)} days ago"
    age_in_weeks = age_in_days / 7
    if age_in_weeks >= 2:
        return f"{int(age_in_weeks)} weeks ago"
    return None

def fetch_meta(owner, repo, path, mkdocs_dir, ref="main"):
    cache_dir_name = f"{owner}_{repo}_{ref}-cache"
    meta_path = path.rsplit('/', 1)[0] + '/meta.yaml'
    local_path = os.path.join(mkdocs_dir, cache_dir_name)
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
    """
    Looks for a pattern like "group-name (cluster-name)"
    to handle nested doc paths.
    """
    cluster_separator = r'^(.*?)\s+\((.*?)\)$'
    cluster_match = re.match(cluster_separator, group_name)
    if cluster_match:
        gname = cluster_match.group(1)
        cname = cluster_match.group(2)
        return f'{cname}/{gname}'
    return group_name

def warm_git_cache(runbook_files, mkdocs_dir):
    """
    Build a unique set of repos from runbook_files and materialise them
    from the local mirror (or network, if allowed) into mkdocs_dir.
    """
    unique_repos = {
        (
            cfg["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-2],  # owner
            cfg["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-1],  # repo
            cfg["spec"]["codeBundle"]["ref"]                                     # ref
        )
        for cfg in map(parse_yaml, runbook_files)
    }

    for owner, repo, ref in unique_repos:
        worktree_path = os.path.join(mkdocs_dir, f"{owner}_{repo}_{ref}-cache")
        if os.path.isdir(worktree_path):
            # optional: fast-forward to latest mirror state
            try:
                Repo(worktree_path).git.reset("--hard", f"origin/{ref}")
            except GitCommandError:
                shutil.rmtree(worktree_path)

        if not os.path.isdir(worktree_path):
            logger.info("Materialising %s/%s@%s", owner, repo, ref)
            ensure_worktree_from_mirror(owner, repo, ref, worktree_path)

        # collect authors for summary
        for rb in find_files(worktree_path, 'runbook.robot'):
            author = ''.join(parse_robot_file(rb).get("author", "").split())
            if author:
                fetch_github_profile_icon(author, mkdocs_dir)


def clean_path(path):
    """
    Deletes the specified path (file or directory).
    """
    if os.path.exists(path):
        if os.path.isdir(path):
            shutil.rmtree(path)
            print(f"Directory '{path}' has been removed along with its contents.")
        else:
            os.remove(path)
            print(f"File '{path}' has been removed.")
    else:
        print(f"The path '{path}' does not exist.")

def process_runbook(runbook, groups, search_list, template, mkdocs_dir):
    """
    Renders a single runbook, writing the results into mkdocs_dir/docs-tmp.
    """
    try:
        parsed_runbook_config = parse_yaml(runbook)
        robot_file = fetch_robot_source(parsed_runbook_config, mkdocs_dir)
        runbook_url = (
            f'{parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git")}'
            f'/tree/{parsed_runbook_config["spec"]["codeBundle"]["ref"]}/'
            f'{parsed_runbook_config["spec"]["codeBundle"]["pathToRobot"]}'
        )
        owner = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-2]
        repo = parsed_runbook_config["spec"]["codeBundle"]["repoUrl"].rstrip(".git").split("/")[-1]
        path = parsed_runbook_config["spec"]["codeBundle"]["pathToRobot"].rstrip('runbook.robot')
        ref = parsed_runbook_config["spec"]["codeBundle"]["ref"]

        commit_age = get_last_commit_age(owner, repo, ref, path, mkdocs_dir)
        parsed_robot = parse_robot_file(robot_file)
        slx_hints = generate_slx_hints(runbook)
        doc = ''.join(parsed_robot.get("doc", "").split('\n'))
        author = ''.join(parsed_robot.get("author", "").split('\n'))
        group_name = find_group_name(groups, slx_hints["slx_short_name"])
        group_path = find_group_path(group_name)
        meta = fetch_meta(owner=owner, repo=repo, path=path, mkdocs_dir=mkdocs_dir, ref=ref)

        interesting_commands = search_keywords(parsed_robot, parsed_runbook_config, search_list, meta)
        command_generation_summary_stats["total_interesting_commands"] += len(interesting_commands)
        command_generation_summary_stats["unique_authors"].append(author)

        output = template.render(
            runbook=runbook.split("/output", 1)[-1],
            author=author,
            slx_hints=slx_hints,
            doc=doc,
            runbook_url=runbook_url,
            interesting_commands=interesting_commands,
            command_count=len(interesting_commands),
            author_details=fetch_github_profile_icon(author, mkdocs_dir),
            commit_age=commit_age,
            parsed_robot=parsed_robot
        )

        docs_tmp_dir = os.path.join(mkdocs_dir, 'docs-tmp', group_path)
        os.makedirs(docs_tmp_dir, exist_ok=True)
        md_output_path = os.path.join(docs_tmp_dir, f'{slx_hints["slug"]}.md')
        with open(md_output_path, 'w') as md_file:
            md_file.write(output)

    except Exception as e:
        logger.error(f"Failed to process runbook {runbook}: {e}")


def load_icon_urls_for_tags(tags, filename="map-tag-icons.yaml", default_url="https://storage.googleapis.com/runwhen-nonprod-shared-images/icons/tag.svg"):
    """
    Load icon URLs for given tags from a YAML file, with a default URL for unmapped tags.

    :param tags: A single tag or a list of tags to find icon URLs for.
    :param filename: The path to the YAML file.
    :param default_url: The default icon URL to use for tags not found in the map.
    :return: A dictionary of tags to their icon URLs.
    """
    # Ensure tags is a list
    if isinstance(tags, str):
        tags = [tags]
    
    tag_icon_url_map = {}
    try:
        with open(filename, "r") as file:
            data = yaml.safe_load(file)
            icons = data.get("icons", [])
            for tag in tags:
                # Initialize each tag with a default URL
                tag_icon_url_map[tag] = default_url
                for icon in icons:
                    if tag in icon.get("tags", []):
                        # Update with specific URL if found
                        tag_icon_url_map[tag] = icon.get("url")
                        break
    except FileNotFoundError:
        print(f"File {filename} not found.")
    except yaml.YAMLError as exc:
        print(f"Error parsing YAML file: {exc}")
    
    return tag_icon_url_map

def remove_custom_tags(file_path):
    """
    Strips custom YAML tags like !Something from the file content.
    """
    with open(file_path, 'r') as file:
        content = file.read()
    content = re.sub(r'!\w+', '', content)
    return yaml.safe_load(content)

def parse_and_summarize_resource_dump(file_path):
    summarized_resources = {
        "clusters": 0,
        "namespaces": 0,
        "resource_groups": 0,
        "azure_resources": 0,
        "aws_resources": 0,
        "gcp_resources": 0,
    }

    try:
        data = remove_custom_tags(file_path)
        # Summarize clusters
        k8s_clusters = data.get("platforms", {}).get("kubernetes", {}).get("resourceTypes", {}).get("cluster", {}).get("instances", [])
        summarized_resources["clusters"] = len(k8s_clusters)

        # Summarize namespaces
        namespaces = data.get("platforms", {}).get("kubernetes", {}).get("resourceTypes", {}).get("custom", {}).get("instances", [])
        summarized_resources["namespaces"] = len(namespaces)

        # Azure
        azure_rgs = data.get("platforms", {}).get("azure", {}).get("resourceTypes", {}).get("resource_group", {}).get("instances", [])
        azure_vmss = data.get("platforms", {}).get("azure", {}).get("resourceTypes", {}).get("azure_compute_virtual_machine_scale_sets", {}).get("instances", [])
        summarized_resources["resource_groups"] = len(azure_rgs)
        summarized_resources["azure_resources"] = len(azure_vmss) + len(azure_rgs)

        # AWS
        aws_resources = data.get("platforms", {}).get("aws", {}).get("resourceTypes", {})
        summarized_resources["aws_resources"] = sum(len(res.get("instances", [])) for res in aws_resources.values())

        # GCP
        gcp_resources = data.get("platforms", {}).get("gcp", {}).get("resourceTypes", {})
        summarized_resources["gcp_resources"] = sum(len(res.get("instances", [])) for res in gcp_resources.values())

    except FileNotFoundError:
        print(f"File {file_path} not found.")
    except yaml.YAMLError as e:
        print(f"Error parsing YAML: {e}")

    return summarized_resources

def cheat_sheet(directory_path, mkdocs_dir):
    """
    Main function to parse runbooks in directory_path,
    then generate docs inside mkdocs_dir for mkdocs usage.
    """
    env_check(mkdocs_dir)
    update_last_scan_time(mkdocs_dir)

    search_list = ['render_in_commandlist=true', 'show_in_rwl_cheatsheet=true']
    runbook_files = find_files(directory_path, 'runbook.yaml')
    workspace_files = find_files(directory_path, 'workspace.yaml')

    with open("/shared/workspaceInfo.yaml", 'r') as workspace_info_file:
        workspace_info = yaml.safe_load(workspace_info_file)

    slx_files = find_files(directory_path, 'slx.yaml')
    slx_count = len(slx_files)

    warm_git_cache(runbook_files, mkdocs_dir)

    resource_dump_file = os.path.join(directory_path, 'resource-dump.yaml')
    if workspace_files:
        workspace_details = parse_yaml(workspace_files[0])
    else:
        workspace_details = {}

    # Clear any leftover docs-tmp
    docs_tmp_path = os.path.join(mkdocs_dir, 'docs-tmp')
    if os.path.exists(docs_tmp_path):
        try:
            shutil.rmtree(docs_tmp_path)
        except Exception as e:
            print(f"An error occurred while removing docs-tmp: {e}")

    os.makedirs(docs_tmp_path, exist_ok=True)
    os.makedirs(os.path.join(docs_tmp_path, 'ungrouped'), exist_ok=True)

    # Build group directories if present
    if "spec" in workspace_details and "slxGroups" in workspace_details["spec"]:
        groups = workspace_details["spec"]["slxGroups"]
        for group in groups:
            doc_group_dir_path = find_group_path(group['name'])
            full_path = os.path.join(docs_tmp_path, doc_group_dir_path)
            os.makedirs(full_path, exist_ok=True)
    else:
        groups = []

    # Prepare Jinja
    templates_dir = os.path.join(mkdocs_dir, "templates")
    template_file = "doc-template.j2"

    env = jinja2.Environment(loader=jinja2.FileSystemLoader(templates_dir))
    template = env.get_template(template_file)

    # Process runbooks in parallel
    with ThreadPoolExecutor() as executor:
        executor.map(
            lambda rb: process_runbook(rb, groups, search_list, template, mkdocs_dir),
            runbook_files
        )

    # Move from docs-tmp to docs/
    source_dir = os.path.join(mkdocs_dir, 'docs-tmp')
    destination_dir = os.path.join(mkdocs_dir, 'docs')
    for root, dirs, files in os.walk(source_dir):
        relative_path = os.path.relpath(root, source_dir)
        dest_path = os.path.join(destination_dir, relative_path)
        os.makedirs(dest_path, exist_ok=True)
        for f in files:
            src_file = os.path.join(root, f)
            dst_file = os.path.join(dest_path, f)
            shutil.copy2(src_file, dst_file)

    # Unique authors
    command_generation_summary_stats["unique_authors"] = set(command_generation_summary_stats["unique_authors"])
    command_generation_summary_stats["num_unique_authors"] = len(command_generation_summary_stats["unique_authors"])

    all_support_tags_freq = Counter(all_support_tags)

    # Summarize resources
    summarized_resources = {
        "groups": len(groups),
        "kubernetes_clusters": [],
        "azure_resources": [],
        "aws_resources": [],
        "gcp_resources": []
    }

    # If resourceDumpPath in workspace info, use that; else fallback
    resource_dump_path = workspace_info.get("resourceDumpPath", resource_dump_file)
    summarized_resources = parse_and_summarize_resource_dump(resource_dump_path)
    summarized_resources["groups"] = len(groups)

    generate_index(
        all_support_tags_freq,
        summarized_resources,
        workspace_details,
        command_generation_summary_stats,
        slx_count,
        mkdocs_dir
    )

if __name__ == "__main__":
    # Usage: python cheatsheet.py <directory_path> <mkdocs_dir>
    cheat_sheet(sys.argv[1], sys.argv[2])

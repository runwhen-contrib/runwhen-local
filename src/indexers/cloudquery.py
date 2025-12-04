from azure.identity import DefaultAzureCredential, ClientSecretCredential
from azure.mgmt.resource import ResourceManagementClient, SubscriptionClient
import requests
from kubernetes import client, config

from copy import deepcopy
from dataclasses import dataclass
import json
import logging
import os, sys
import sqlite3
import tempfile
from template import render_template_file
from typing import Any, Optional, Union, Dict, List, Tuple
import subprocess
import yaml
import base64
import boto3
import time
import random

from component import SettingDependency, Context
from enrichers.generation_rule_types import (
    PlatformHandler,
    PLATFORM_HANDLERS_PROPERTY_NAME,
    RESOURCE_TYPE_SPECS_PROPERTY
)
from enrichers.generation_rules import GenerationRuleInfo
from exceptions import WorkspaceBuilderException
from resources import Registry, REGISTRY_PROPERTY_NAME, ResourceTypeSpec
from utils import read_file, write_file, mask_string
from .common import CLOUD_CONFIG_SETTING
from .airgap_support import get_airgap_manager
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from k8s_utils import get_secret
from gcp_utils import get_gcp_credential, authenticate_gcloud, validate_gcp_credentials

logger = logging.getLogger(__name__)
tmpdir_value = os.getenv("TMPDIR", "/tmp")  # fallback to /tmp if TMPDIR not set

debug_logging_str = os.environ.get('DEBUG_LOGGING')
debug_logging = debug_logging_str is not None and debug_logging_str.lower() == 'true'

# Separate CloudQuery debug logging control
cq_debug_logging_str = os.environ.get('CQ_DEBUG')
cq_debug_logging = cq_debug_logging_str is not None and cq_debug_logging_str.lower() == 'true'

# Set logging level for Azure SDKs based on DEBUG_LOGGING (not CQ_DEBUG)
if debug_logging:
    logging.getLogger("azure").setLevel(logging.DEBUG)
    logging.getLogger("azure.identity").setLevel(logging.DEBUG)
    logging.getLogger("azure.mgmt").setLevel(logging.DEBUG)
else:
    logging.getLogger("azure").setLevel(logging.WARNING)
    logging.getLogger("azure.identity").setLevel(logging.WARNING)
    logging.getLogger("azure.mgmt").setLevel(logging.WARNING)

DOCUMENTATION = "Index resources using CloudQuery"

SETTINGS = (
    SettingDependency(CLOUD_CONFIG_SETTING, False),
)

@dataclass
class CloudQueryResourceTypeSpec:
    resource_type_name: str
    cloudquery_table_name: str
    mandatory: bool

@dataclass
class CloudQueryPlatformSpec:
    name: str
    config_file_name: str
    config_template_name: str
    environment_variables: dict[str, str]
    resource_type_specs: list[CloudQueryResourceTypeSpec]

platform_specs = [
    CloudQueryPlatformSpec("azure",
                           config_file_name="azure.yaml",
                           config_template_name="azure-config.yaml",
                           environment_variables={
                               "AZURE_SUBSCRIPTION_ID": "subscriptionId",
                               "AZURE_TENANT_ID": "tenantId",
                               "AZURE_CLIENT_ID": "clientId",
                               "AZURE_CLIENT_SECRET": "clientSecret"
                           },
                           resource_type_specs=[
                               CloudQueryResourceTypeSpec(resource_type_name="resource_group",
                                                          cloudquery_table_name="azure_resources_resource_groups",
                                                          mandatory=True),
                               CloudQueryResourceTypeSpec(resource_type_name="virtual_machine",
                                                          cloudquery_table_name="azure_compute_virtual_machines",
                                                          mandatory=False),
                           ]),
    CloudQueryPlatformSpec("gcp",
                           config_file_name="gcp.yaml",
                           config_template_name="gcp-config.yaml",
                           environment_variables={
                               "GOOGLE_APPLICATION_CREDENTIALS": "applicationCredentialsFile"
                           },
                           resource_type_specs=[
                               CloudQueryResourceTypeSpec(resource_type_name="project",
                                                          cloudquery_table_name="gcp_projects",
                                                          mandatory=True),
                               CloudQueryResourceTypeSpec(resource_type_name="compute_instance",
                                                          cloudquery_table_name="gcp_compute_instances",
                                                          mandatory=False),
                           ]),
    CloudQueryPlatformSpec("aws",
                           config_file_name="aws.yaml",
                           config_template_name="aws-config.yaml",
                           environment_variables={
                               "AWS_ACCESS_KEY_ID": "awsAccessKeyId",
                               "AWS_SECRET_ACCESS_KEY": "awsSecretAccessKey",
                               "AWS_SESSION_TOKEN": "awsSessionToken",
                           },
                           resource_type_specs=[
                               CloudQueryResourceTypeSpec(resource_type_name="ec2_instance",
                                                          cloudquery_table_name="aws_ec2_instances",
                                                          mandatory=False),
                           ]),
]

def has_included_tags(resource_data: dict, include_tags: dict[str, str]) -> bool:
    """Returns True if any of the tags in `include_tags` are found in `resource_data`."""
    tags = resource_data.get("tags", {})
    return any(tags.get(key) == value for key, value in include_tags.items())


def has_excluded_tags(resource_data: dict, exclude_tags: dict[str, str]) -> bool:
    """Returns True if any of the tags in `exclude_tags` are found in `resource_data`."""
    tags = resource_data.get("tags", {})
    for key, value in exclude_tags.items():
        if tags.get(key) == value:
            logger.info(f"Excluding resource {resource_data.get('name', 'unknown')} due to tag '{key}: {value}'")
            return True
    return False

def is_rate_limited(stdout_text: str, stderr_text: str) -> bool:
    """
    Detect if CloudQuery output indicates rate limiting.
    
    Args:
        stdout_text: CloudQuery stdout output
        stderr_text: CloudQuery stderr output
        
    Returns:
        True if rate limiting is detected, False otherwise
    """
    rate_limit_indicators = [
        "429",  # HTTP 429 Too Many Requests
        "rate limit",
        "rate-limit", 
        "ratelimit",
        "throttle",
        "throttled",
        "throttling",
        "too many requests",
        "quota exceeded",
        "request limit exceeded",
        "api rate limit",
        "calls per second"
    ]
    
    combined_output = (stdout_text + " " + stderr_text).lower()
    
    for indicator in rate_limit_indicators:
        if indicator in combined_output:
            return True
    
    return False

def invoke_cloudquery(cq_command: str,
                      cq_config_dir: str,
                      cq_env_vars: dict[str, str],
                      cq_output_dir: Optional[str] = None) -> None:
    """
    Invoke CloudQuery with rate limiting detection and retry logic.
    
    Args:
        cq_command: CloudQuery command to run (e.g., 'sync', 'tables')
        cq_config_dir: Directory containing CloudQuery configuration files
        cq_env_vars: Environment variables to pass to CloudQuery
        cq_output_dir: Optional output directory for CloudQuery results
        
    Raises:
        WorkspaceBuilderException: If CloudQuery fails after all retries
    """
    max_retries = 3
    base_delay = 5  # Base delay in seconds
    max_delay = 60  # Maximum delay in seconds
    
    path = os.getenv("PATH")
    cq_env_vars["PATH"] = path

    http_proxy = os.getenv("HTTP_PROXY")
    https_proxy = os.getenv("HTTPS_PROXY")
    if http_proxy:
        cq_env_vars["HTTP_PROXY"] = http_proxy
    if https_proxy:
        cq_env_vars["HTTPS_PROXY"] = https_proxy

    # Make sure all env var values are strings
    cq_env_vars = {k: str(v) for k, v in cq_env_vars.items()}

    # Enhanced debugging: Log environment variables (mask sensitive values)
    if cq_debug_logging:
        logger.debug("CloudQuery environment variables:")
        for key, value in cq_env_vars.items():
            if any(sensitive in key.upper() for sensitive in ['SECRET', 'PASSWORD', 'TOKEN', 'KEY']):
                logger.debug(f"  {key}=***MASKED***")
            else:
                logger.debug(f"  {key}={value}")

    #
    # 1) Decide on a plugin directory under your writable temp dir
    #
    plugin_dir = os.path.join(os.path.dirname(cq_config_dir), "cloudquery_plugins")
    os.makedirs(plugin_dir, exist_ok=True)  # Make sure it exists
    cq_env_vars["CQ_PLUGIN_DIR"] = plugin_dir
    logger.debug(f"CloudQuery plugin directory: {plugin_dir}")
    
    # Setup airgap environment if enabled
    airgap_manager = get_airgap_manager()
    if airgap_manager.is_enabled():
        logger.info("CloudQuery airgap mode detected - using pre-installed plugins")
        airgap_env_vars = airgap_manager.setup_airgap_environment(plugin_dir)
        cq_env_vars.update(airgap_env_vars)
    else:
        logger.debug("CloudQuery online mode - plugins will be downloaded as needed")

    #
    # 2) Prepare CloudQuery arguments
    #
    cq_args = ["cloudquery"]
    if cq_debug_logging:
        cq_args += ["--log-level", "debug"]
    # Optionally pass --plugin-dir here as well:
    # cq_args += [f"--plugin-dir={plugin_dir}"]

    cq_args += [cq_command, cq_config_dir]
    if cq_output_dir:
        cq_args += ["--output-dir", cq_output_dir]
    
    # Enhanced debugging: Log the full command
    logger.info(f"Executing CloudQuery command: {' '.join(cq_args)}")
    logger.debug(f"CloudQuery working directory: {os.path.dirname(cq_config_dir)}")
    logger.debug(f"CloudQuery config directory: {cq_config_dir}")

    # Retry loop with exponential backoff
    for attempt in range(max_retries + 1):
        try:
            # 3) Run CloudQuery with streaming output for real-time visibility
            logger.info("Starting CloudQuery execution with streaming output...")
            
            process = subprocess.Popen(
                cq_args,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,  # Combine stderr into stdout for unified streaming
                env=cq_env_vars,
                cwd=os.path.dirname(cq_config_dir),
                universal_newlines=True,
                bufsize=1  # Line buffered
            )

            # Stream output in real-time
            stdout_lines = []
            start_time = time.time()
            last_progress_time = time.time()
            progress_interval = 30  # Log progress every 30 seconds if no output
            timeout_minutes = int(os.getenv("CLOUDQUERY_TIMEOUT_MINUTES", "60"))  # Default 60 minutes
            timeout_seconds = timeout_minutes * 60
            
            while True:
                output = process.stdout.readline()
                if output == '' and process.poll() is not None:
                    break
                if output:
                    output_line = output.strip()
                    stdout_lines.append(output_line)
                    last_progress_time = time.time()  # Reset progress timer
                    
                    # Real-time logging with different levels based on content
                    if any(keyword in output_line.lower() for keyword in ['error', 'failed', 'exception']):
                        logger.error(f"CloudQuery: {output_line}")
                    elif any(keyword in output_line.lower() for keyword in ['warning', 'warn']):
                        logger.warning(f"CloudQuery: {output_line}")
                    elif any(keyword in output_line.lower() for keyword in ['rate limit', 'throttle', 'retry', 'backoff']):
                        logger.warning(f"CloudQuery RATE LIMIT: {output_line}")
                    elif any(keyword in output_line.lower() for keyword in ['sync', 'table', 'resource', 'rows', 'syncing']):
                        logger.info(f"CloudQuery: {output_line}")
                    elif cq_debug_logging:
                        logger.debug(f"CloudQuery: {output_line}")
                else:
                    # No output received, check if we should log progress or timeout
                    current_time = time.time()
                    elapsed_time = current_time - start_time
                    
                    # Check for timeout
                    if elapsed_time > timeout_seconds:
                        logger.error(f"CloudQuery timeout after {timeout_minutes} minutes. Terminating process.")
                        process.terminate()
                        try:
                            process.wait(timeout=10)  # Wait up to 10 seconds for graceful termination
                        except subprocess.TimeoutExpired:
                            logger.error("CloudQuery process did not terminate gracefully, killing it.")
                            process.kill()
                        raise WorkspaceBuilderException(f"CloudQuery timed out after {timeout_minutes} minutes")
                    
                    # Log progress if no output for a while
                    if current_time - last_progress_time > progress_interval:
                        elapsed_minutes = int(elapsed_time / 60)
                        logger.info(f"CloudQuery is still running... ({elapsed_minutes}m elapsed, no output for 30s)")
                        last_progress_time = current_time
                        
                    # Small sleep to prevent busy waiting
                    time.sleep(0.1)

            # Wait for process to complete
            return_code = process.poll()
            stdout_text = '\n'.join(stdout_lines)
            stderr_text = ""  # Combined with stdout above
            
            # Enhanced logging: Always log basic info
            logger.info(f"CloudQuery execution completed - Return code: {return_code}")
            
            if return_code == 0:
                logger.info("CloudQuery sync completed successfully")
            else:
                logger.error(f"CloudQuery failed with return code: {return_code}")
                # In case of failure, also log the last few lines for context
                if stdout_lines:
                    last_lines = stdout_lines[-10:]  # Last 10 lines
                    logger.error("CloudQuery final output:")
                    for line in last_lines:
                        logger.error(f"  {line}")
            
            # Create a process_info-like object for compatibility with existing code
            class ProcessInfo:
                def __init__(self, args, returncode, stdout, stderr):
                    self.args = args
                    self.returncode = returncode
                    self.stdout_text = stdout
                    self.stderr_text = stderr
            
            process_info = ProcessInfo(cq_args, return_code, stdout_text, stderr_text)

            if process_info.returncode != 0:
                # Check if this is a rate limiting error
                if is_rate_limited(process_info.stdout_text, process_info.stderr_text):
                    if attempt < max_retries:
                        # Calculate delay with exponential backoff and jitter
                        delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                        
                        logger.warning(
                            f"CloudQuery rate limiting detected (attempt {attempt + 1}/{max_retries + 1}). "
                            f"Retrying in {delay:.1f} seconds. "
                            f"Error output: {process_info.stderr_text[:200]}..."
                        )
                        
                        time.sleep(delay)
                        continue
                    else:
                        # Final attempt failed due to rate limiting
                        error_message = (
                            f"CloudQuery failed due to rate limiting after {max_retries + 1} attempts. "
                            f"Final error: return-code={process_info.returncode}; "
                            f"stderr={process_info.stderr_text}; "
                            f"stdout={process_info.stdout_text}"
                        )
                        logger.error(error_message)
                        raise WorkspaceBuilderException(error_message)
                else:
                    # Non-rate-limiting error - fail immediately
                    error_message = (
                        f"Error running CloudQuery to discover resources: "
                        f"return-code={process_info.returncode}; "
                        f"stderr={process_info.stderr_text}; "
                        f"stdout={process_info.stdout_text}"
                    )
                    raise WorkspaceBuilderException(error_message)
            else:
                # Success - break out of retry loop
                if attempt > 0:
                    logger.info(f"CloudQuery succeeded after {attempt + 1} attempts")
                break
                
        except subprocess.SubprocessError as e:
            if attempt < max_retries:
                delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                logger.warning(
                    f"CloudQuery subprocess error (attempt {attempt + 1}/{max_retries + 1}). "
                    f"Retrying in {delay:.1f} seconds. Error: {e}"
                )
                time.sleep(delay)
                continue
            else:
                error_message = f"Error launching CloudQuery after {max_retries + 1} attempts; {e}"
                raise WorkspaceBuilderException(error_message) from e
        except Exception as e:
            error_message = f"Error launching CloudQuery; {e}"
            raise WorkspaceBuilderException(error_message) from e

cloudquery_premium_table_info: Optional[dict[str, list[str]]] = None

def get_premium_tables(table_info_list: list[dict[str, Union[str, Any]]]) -> list[str]:
    premium_tables: list[str] = []
    for table_info in table_info_list:
        is_premium = table_info.get("is_paid", False)
        if is_premium:
            table_name: str = table_info.get("name")
            premium_tables.append(table_name)
        relations: list[dict[str, Union[str, Any]]] = table_info.get("relations", [])
        if relations:
            premium_relation_tables = get_premium_tables(relations)
            premium_tables += premium_relation_tables
    return premium_tables

def init_cloudquery_table_info():
    global cloudquery_premium_table_info
    if cloudquery_premium_table_info:
        return
    
    # Initialize with empty dict - we'll only populate for platforms we can discover
    cloudquery_premium_table_info = dict()
    
    # In airgap mode, try to load pre-packaged table information
    airgap_manager = get_airgap_manager()
    if airgap_manager.is_enabled():
        logger.info("Loading table information from airgap package")
        for platform_name in ["azure", "aws", "gcp"]:
            tables_info = airgap_manager.get_tables_info(platform_name)
            if tables_info:
                # Extract premium tables from airgap info
                premium_tables = tables_info.get("premium_tables", [])
                cloudquery_premium_table_info[platform_name] = premium_tables
                logger.info(f"Loaded {len(premium_tables)} premium tables for {platform_name} from airgap package")
            else:
                # Default to empty list for airgap mode
                cloudquery_premium_table_info[platform_name] = []
                logger.debug(f"No airgap table info found for {platform_name}, assuming no premium tables")
        
        logger.info("Airgap table information loaded successfully")
        return
    
    with tempfile.TemporaryDirectory(dir=tmpdir_value) as cq_temp_dir:
        cq_config_dir = os.path.join(cq_temp_dir, "config")
        cq_output_dir = os.path.join(cq_temp_dir, "docs")
        templates_dir = "indexers/cloudquery_templates"
        template_loader_func = lambda name: read_file(os.path.join(templates_dir, name))

        sqlite_config_path = os.path.join(cq_config_dir, "sqlite.yaml")
        db_file_path = os.path.join(cq_temp_dir, "db.sql")
        template_variables = {"database_path": db_file_path}
        sqlite_config_text = render_template_file("sqlite-config.yaml", template_variables, template_loader_func)
        write_file(sqlite_config_path, sqlite_config_text)

        # Skip table discovery for all platforms during init phase since they require credentials
        # This will be handled later when we have the actual cloud config
        platforms_to_discover = []
        
        for platform_spec in platform_specs:
            # Skip all platforms in init phase since they require credentials or have other issues
            logger.debug(f"Skipping {platform_spec.name} table discovery in init phase - requires credentials or cloud config")
            continue
                
            platforms_to_discover.append(platform_spec)
            
            template_variables = {
                "tables": ["*"],
                "destination_plugin_name": "sqlite",
            }
            config_file_path = os.path.join(cq_config_dir, platform_spec.config_file_name)
            config_text = render_template_file(platform_spec.config_template_name, template_variables,
                                               template_loader_func)
            logger.info(f"Generated CloudQuery config for {platform_spec.name}: {config_file_path}")
            if cq_debug_logging:
                logger.debug(f"-------CloudQuery {platform_spec.name} CONFIG-------\n{config_text}")
            else:
                # In non-debug mode, just log key config details
                logger.info(f"CloudQuery {platform_spec.name} config includes {len(template_variables.get('tables', []))} tables")
            write_file(config_file_path, config_text)

        if platforms_to_discover:
            cq_env_vars = dict()
            invoke_cloudquery("tables", cq_config_dir, cq_env_vars, cq_output_dir)

            for platform_spec in platforms_to_discover:
                table_doc_path = os.path.join(cq_output_dir, platform_spec.name, "__tables.json")
                if os.path.exists(table_doc_path):
                    table_doc_text = read_file(table_doc_path)
                    table_doc_data = json.loads(table_doc_text)
                    premium_tables = get_premium_tables(table_doc_data)
                    cloudquery_premium_table_info[platform_spec.name] = premium_tables
                else:
                    logger.warning(f"Table documentation not found for {platform_spec.name}")
                    cloudquery_premium_table_info[platform_spec.name] = []
        else:
            logger.info("No platforms available for table discovery in init phase")

def get_managed_identity_details():
    credential = DefaultAzureCredential()

    subscription_client = SubscriptionClient(credential)
    subscription = next(subscription_client.subscriptions.list())
    subscription_id = subscription.subscription_id
    tenant_id = subscription.tenant_id

    imds_url = "http://169.254.169.254/metadata/identity/oauth2/token"
    headers = {"Metadata": "true"}
    params = {
        "api-version": "2019-08-01",
        "resource": "https://management.azure.com/"
    }

    response = requests.get(imds_url, headers=headers, params=params)
    response.raise_for_status()

    token_data = response.json()
    client_id = token_data.get("client_id")

    return {
        "AZURE_TENANT_ID": tenant_id,
        "AZURE_CLIENT_ID": client_id,
        "AZURE_SUBSCRIPTION_ID": subscription_id,
        "credential": credential
    }

def gcp_get_credentials_and_project_ids(platform_config_data: dict[str, Any], temp_dir: str = None) -> dict[str, Any]:
    """
    Resolve GCP authentication and return:
        project_ids            – list[str]   (final list for CloudQuery)
        GOOGLE_* keys          – env-var values for service account auth
        credentials_file       – path to service account key file
    
    Args:
        platform_config_data: GCP platform configuration
        temp_dir: Optional temporary directory for credentials file (for proper cleanup)
    """
    
    # ──────────────────────── 0. optional SA via K8s secret
    sa_secret_name = platform_config_data.get("saSecretName")
    project_id = service_account_key = None
    if sa_secret_name:
        secret = get_secret(sa_secret_name)
        project_id = base64.b64decode(secret.get("projectId")).decode() if secret.get("projectId") else None
        service_account_key = base64.b64decode(secret.get("serviceAccountKey")).decode() if secret.get("serviceAccountKey") else None

    # ──────────────────────── 1. inline SA or explicit config
    if not all([project_id, service_account_key]):
        project_id = platform_config_data.get("projectId")
        service_account_key = platform_config_data.get("serviceAccountKey")

    # ──────────────────────── 2. collect project IDs
    explicit_project_ids = []
    
    # From projects list
    projects_list = platform_config_data.get("projects", [])
    if isinstance(projects_list, list):
        explicit_project_ids.extend([str(p) for p in projects_list])
    elif isinstance(projects_list, str):
        # Handle comma-separated string
        explicit_project_ids.extend([p.strip() for p in projects_list.split(",")])
    
    # From single projectId field (legacy)
    if project_id and project_id not in explicit_project_ids:
        explicit_project_ids.append(str(project_id))
    
    # From environment variable
    env_project = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT")
    if env_project and env_project not in explicit_project_ids:
        explicit_project_ids.append(str(env_project))

    if not explicit_project_ids:
        raise WorkspaceBuilderException(
            "No GCP projects configured. Please specify 'projects' or 'projectId' in GCP config."
        )

    project_ids = explicit_project_ids

    # ──────────────────────── 3. authentication setup
    env_vars = {}
    credentials_file = None
    
    if service_account_key:
        # Create temporary credentials file
        if temp_dir:
            # Create credentials file in the managed temporary directory for proper cleanup
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, dir=temp_dir) as f:
                f.write(service_account_key)
                credentials_file = f.name
        else:
            # Fallback to system temp directory (caller responsible for cleanup)
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                f.write(service_account_key)
                credentials_file = f.name
        
        env_vars["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_file
        logger.info("Using GCP service account authentication")
    else:
        # Use Application Default Credentials
        logger.info("Using GCP Application Default Credentials")
        # Check if gcloud is authenticated
        try:
            result = subprocess.run(
                ["gcloud", "auth", "list", "--filter=status:ACTIVE", "--format=value(account)"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0 and result.stdout.strip():
                logger.info(f"Found active gcloud authentication: {result.stdout.strip()}")
            else:
                logger.warning("No active gcloud authentication found. CloudQuery may fail if no other credential sources are available.")
        except Exception as e:
            logger.warning(f"Could not check gcloud authentication status: {e}")

    # Set project environment variable to first project
    if project_ids:
        env_vars["GOOGLE_CLOUD_PROJECT"] = project_ids[0]

    return {
        "project_ids": project_ids,
        "credentials_file": credentials_file,
        "env_vars": env_vars
    }

def az_get_credentials_and_subscription_id(platform_config_data: dict[str, Any]) -> dict[str, Any]:
    """
    Resolve Azure authentication and return:
        credential             – azure-identity credential object
        subscription_ids       – list[str]   (final list for CloudQuery)
        AZURE_* keys           – env-var values for SP / MI auth
    """

    # ──────────────────────── 0.   optional SP via K8s secret
    sp_secret_name = platform_config_data.get("spSecretName")
    client_id = client_secret = tenant_id = None
    if sp_secret_name:
        secret = get_secret(sp_secret_name)
        tenant_id     = base64.b64decode(secret.get("tenantId")).decode()
        client_id     = base64.b64decode(secret.get("clientId")).decode()
        client_secret = base64.b64decode(secret.get("clientSecret")).decode()

    # ──────────────────────── 1.   inline SP
    if not all([client_id, client_secret, tenant_id]):
        client_id     = platform_config_data.get("clientId")
        client_secret = platform_config_data.get("clientSecret")
        tenant_id     = platform_config_data.get("tenantId")

    # ──────────────────────── 2.   collect subscription IDs
    explicit_sub_ids = [
        str(e["subscriptionId"])
        for e in platform_config_data.get("subscriptions", [])
        if e.get("subscriptionId")
    ]

    if explicit_sub_ids:
        subscription_ids = explicit_sub_ids                            # ← preferred
    else:
        # Legacy single field + env-var
        subscription_ids: list[str] = []
        legacy_sid = platform_config_data.get("subscriptionId")
        if legacy_sid:
            subscription_ids.append(str(legacy_sid))
        env_sid = os.getenv("AZURE_SUBSCRIPTION_ID")
        if env_sid and env_sid not in subscription_ids:
            subscription_ids.append(str(env_sid))

    if not subscription_ids:
        raise ValueError("No Azure subscriptionId supplied.")

    # ──────────────────────── 3.   credential object
    if all([client_id, client_secret, tenant_id]):
        credential = ClientSecretCredential(tenant_id, client_id, client_secret)
    else:
        mi = get_managed_identity_details()
        credential  = mi["credential"]
        client_id   = client_id or mi.get("AZURE_CLIENT_ID")
        tenant_id   = tenant_id or mi.get("AZURE_TENANT_ID")

    # ──────────────────────── 4.   package result
    result = {
        "credential":           credential,
        "subscription_ids":     subscription_ids,
        "AZURE_SUBSCRIPTION_ID": subscription_ids[0],  # env-var for SDKs
    }
    if client_id:     result["AZURE_CLIENT_ID"]     = client_id
    if client_secret: result["AZURE_CLIENT_SECRET"] = client_secret
    if tenant_id:     result["AZURE_TENANT_ID"]     = tenant_id
    return result

def init_cloudquery_config(
    context: Context,
    cloud_config_data: dict[str, Any],
    cloud_config_dir: str,
    db_file_path: str,
    accessed_resource_type_specs: dict[str, dict[ResourceTypeSpec, list[GenerationRuleInfo]]],
    temp_dir: str = None,
) -> tuple[dict[str, str], list[tuple[CloudQueryPlatformSpec, list[CloudQueryResourceTypeSpec]]]]:

    # ───────────────────────────── shared CQ env vars
    cq_process_environment_vars: dict[str, str] = {}
    cq_api_key = cloud_config_data.get("cloudquery", {}).get("apiKey")
    if cq_api_key:
        cq_process_environment_vars["CLOUDQUERY_API_KEY"] = cq_api_key

    # ───────────────────────────── write sqlite destination once
    tmpl_dir = "indexers/cloudquery_templates"
    render = lambda n, v: render_template_file(
        n, v, lambda f: read_file(os.path.join(tmpl_dir, f))
    )
    write_file(
        os.path.join(cloud_config_dir, "sqlite.yaml"),
        render("sqlite-config.yaml", {"database_path": db_file_path}),
    )

    platform_tables: list[
        tuple[CloudQueryPlatformSpec, list[CloudQueryResourceTypeSpec]]
    ] = []

    # ========================================================= per-platform
    for platform_spec in platform_specs:
        platform_name = platform_spec.name
        platform_cfg  = cloud_config_data.get(platform_name)
        if platform_cfg is None:
            continue

        # ---------- mandatory specs/tables ----------
        cq_resource_type_specs: list[CloudQueryResourceTypeSpec] = []
        tables: list[str] = []
        for r in platform_spec.resource_type_specs:
            if r.mandatory:
                cq_resource_type_specs.append(r)
                tables.append(r.cloudquery_table_name)

        # ──────────────────────────── AZURE ───────────────────────────────
        resource_groups_override = None
        if platform_name == "azure":
            logger.debug("Entering Azure configuration block")

            az = az_get_credentials_and_subscription_id(platform_cfg)
            cq_process_environment_vars.update({k: v for k, v in az.items() if k.startswith("AZURE_")})
            credential = az["credential"]
            
            # Update enrichers.azure module with these credentials so it can use them
            # This ensures consistent authentication between CloudQuery and our code
            try:
                from enrichers.azure import set_azure_credentials
                tenant_id = az.get("AZURE_TENANT_ID")
                client_id = az.get("AZURE_CLIENT_ID")
                client_secret = az.get("AZURE_CLIENT_SECRET")
                logger.debug("Setting Azure credentials in enrichers.azure module")
                set_azure_credentials(
                    tenant_id=tenant_id, 
                    client_id=client_id, 
                    client_secret=client_secret,
                    credential=credential
                )
            except Exception as e:
                logger.warning(f"Could not update enrichers.azure credentials: {e}")

            # ---------------- subscription list -----------------
            explicit_sub_ids = [
                str(item["subscriptionId"])
                for item in platform_cfg.get("subscriptions", [])
                if isinstance(item, dict) and item.get("subscriptionId")
            ]
            subscription_ids: list[str] = explicit_sub_ids        # (no fallback)
            if credential is None:
                raise ValueError("Azure credential missing.")

            # ---------------- build nested RG-LOD map ------------
            #   { subId : { rgName|'*' : lod, … } }
            rg_lod_map: dict[str, dict[str, str]] = {}
            global_default = platform_cfg.get("defaultLOD") or platform_cfg.get("defaultLevelOfDetail")

            for item in platform_cfg.get("subscriptions", []):
                if not isinstance(item, dict):
                    continue
                sid = str(item.get("subscriptionId", "")).strip()
                if not sid:
                    continue
                sub_default = (
                    item.get("defaultLOD")
                    or item.get("defaultLevelOfDetail")
                    or global_default
                )
                lod_dict: dict[str, str] = {}
                if sub_default:
                    lod_dict["*"] = sub_default          # per-sub default
                lod_dict.update(item.get("resourceGroupLevelOfDetails", {}))
                if lod_dict:
                    rg_lod_map[sid] = lod_dict

            # legacy single-subscription fields
            if not platform_cfg.get("subscriptions"):
                sid = platform_cfg.get("subscriptionId")
                if sid:
                    lod_dict = platform_cfg.get("resourceGroupLevelOfDetails", {})
                    if not lod_dict and global_default:
                        lod_dict = {"*": global_default}
                    if lod_dict:
                        rg_lod_map[str(sid)] = lod_dict

            platform_cfg["subscriptionResourceGroupLevelOfDetails"] = rg_lod_map


        # ──────────────────────────── GCP ────────────────────────────────
        elif platform_name == "gcp":
            logger.debug("Entering GCP configuration block")
            
            gcp_result = gcp_get_credentials_and_project_ids(platform_cfg, temp_dir)
            cq_process_environment_vars.update(gcp_result["env_vars"])
            project_ids = gcp_result["project_ids"]
            credentials_file = gcp_result["credentials_file"]
            
            # Update enrichers.gcp module with these credentials so it can use them
            try:
                from enrichers.gcp import set_gcp_credentials
                logger.debug("Setting GCP credentials in enrichers.gcp module")
                set_gcp_credentials(
                    project_id=project_ids[0] if project_ids else None,
                    service_account_key=platform_cfg.get("serviceAccountKey"),
                    auth_type="gcp_service_account" if credentials_file else "gcp_adc",
                    auth_secret=platform_cfg.get("saSecretName")
                )
            except Exception as e:
                logger.warning(f"Could not update enrichers.gcp credentials: {e}")
            
            # Set projects list for CloudQuery template
            platform_cfg["projects"] = project_ids
            
            # Legacy support for applicationCredentialsFile
            sa_file = platform_cfg.get("applicationCredentialsFile")
            if sa_file and not credentials_file:
                cq_process_environment_vars["GOOGLE_APPLICATION_CREDENTIALS"] = sa_file

        # ──────────────────────────── AWS ────────────────────────────────
        elif platform_name == "aws":
            akid = platform_cfg.get("awsAccessKeyId")
            sak  = platform_cfg.get("awsSecretAccessKey")
            stkn = platform_cfg.get("awsSessionToken")
            if not (akid and sak):
                raise ValueError("AWS credentials incomplete.")
            cq_process_environment_vars["AWS_ACCESS_KEY_ID"]     = akid
            cq_process_environment_vars["AWS_SECRET_ACCESS_KEY"] = sak
            if stkn:
                cq_process_environment_vars["AWS_SESSION_TOKEN"] = stkn

        # ---------- dynamic tables from generation-rules ----------
        premium_tables = cloudquery_premium_table_info.get(platform_name, [])
        accessed_specs = accessed_resource_type_specs.get(platform_name, {})
        for rt_spec, _ in accessed_specs.items():
            # match against existing preset list
            for preset in platform_spec.resource_type_specs:
                if preset.resource_type_name == rt_spec.resource_type_name:
                    cq_rt_spec = preset
                    break
            else:
                # create ad-hoc mapping
                cq_rt_spec = CloudQueryResourceTypeSpec(
                    resource_type_name=rt_spec.resource_type_name,
                    cloudquery_table_name=rt_spec.resource_type_name,
                    mandatory=False,
                )

            if cq_rt_spec.cloudquery_table_name in tables:
                continue

            if cq_api_key is None and cq_rt_spec.cloudquery_table_name in premium_tables:
                warn = (f'Suppressing access to premium table "{cq_rt_spec.cloudquery_table_name}" '
                        f"(CloudQuery API key required)")
                logger.warning(warn)
                context.add_warning(warn)
                continue

            cq_resource_type_specs.append(cq_rt_spec)
            tables.append(cq_rt_spec.cloudquery_table_name)

        if not cq_resource_type_specs:
            continue  # nothing to pull for this platform

        platform_tables.append((platform_spec, cq_resource_type_specs))

        # ---------- render per-platform YAML ----------
        tmpl_vars = deepcopy(platform_cfg)
        tmpl_vars["destination_plugin_name"] = "sqlite"
        tmpl_vars["tables"] = tables
        if platform_name == "azure":
            tmpl_vars["subscriptions"] = subscription_ids
            # do NOT include RG LOD keys in CQ YAML
            tmpl_vars.pop("resourceGroupLevelOfDetails", None)
            tmpl_vars.pop("resourceGroups", None)
        if resource_groups_override:
            tmpl_vars["resourceGroups"] = resource_groups_override

        cfg_path = os.path.join(cloud_config_dir, platform_spec.config_file_name)
        final_yaml = render(platform_spec.config_template_name, tmpl_vars)
        
        # Apply airgap modifications if enabled
        airgap_manager = get_airgap_manager()
        if airgap_manager.is_enabled():
            # Get version from airgap manager's plugin config
            from .airgap_support import CLOUDQUERY_PLUGINS
            platform_version = CLOUDQUERY_PLUGINS.get(platform_name)
            
            if platform_version:
                final_yaml = airgap_manager.generate_offline_config(platform_name, platform_version, final_yaml)
                logger.info(f"Applied airgap configuration for {platform_name} {platform_version}")
            else:
                logger.warning(f"No version configured for platform {platform_name} in cloudquery-plugins.yaml")
        
        write_file(cfg_path, final_yaml)
        
        # Enhanced logging for main CloudQuery config
        logger.info(f"Generated CloudQuery sync config for {platform_name}: {cfg_path}")
        logger.info(f"CloudQuery {platform_name} will sync {len(tables)} tables: {tables}")
        
        if airgap_manager.is_enabled():
            logger.info(f"CloudQuery {platform_name} configured for airgap/offline mode")
        
        if cq_debug_logging:
            logger.debug(f"-------FINAL CQ CONFIG ({platform_name})-------\n{final_yaml}")
        else:
            # In non-debug mode, log key configuration details
            if platform_name == "azure" and "subscriptions" in tmpl_vars:
                logger.info(f"Azure subscriptions to sync: {tmpl_vars['subscriptions']}")
            if resource_groups_override:
                logger.info(f"Resource groups override: {resource_groups_override}")

    return cq_process_environment_vars, platform_tables


def az_discover_resource_groups(credential, subscription_id) -> list[str]:
    if not subscription_id:
        raise ValueError("subscription_id cannot be None in az_discover_resource_groups.")
    
    logger.debug(f"Discovering resource groups for subscription_id: {mask_string(subscription_id)}")
    
    resource_groups = []
    try:
        resource_client = ResourceManagementClient(credential, subscription_id)
        for rg in resource_client.resource_groups.list():
            resource_groups.append(rg.name)
            logger.info(f"Discovered resource group: {rg.name}")
    except Exception as e:
        logger.error(f"Failed to discover resource groups: {str(e)}")
        raise WorkspaceBuilderException(f"Error discovering resource groups: {str(e)}")
    
    if not resource_groups:
        logger.warning("No resource groups were discovered.")
    else:
        logger.info(f"Total resource groups discovered: {len(resource_groups)}")

    return resource_groups

def transform_cloud_config(cloud_config: dict[str, Any],
                           cq_temp_dir: str,
                           platform_handlers: dict[str, PlatformHandler]) -> None:
    for platform_spec in platform_specs:
        platform_name = platform_spec.name
        platform_cloud_config = cloud_config.get(platform_name)
        if platform_cloud_config:
            platform_handler = platform_handlers[platform_name]
            platform_handler.transform_cloud_config(platform_cloud_config, cq_temp_dir)

def az_validate_credential_access(credential, subscription_id):
    try:
        resource_client = ResourceManagementClient(credential, subscription_id)
        resource_groups = list(resource_client.resource_groups.list())
        if resource_groups:
            logger.info(f"Successfully accessed {len(resource_groups)} resource groups.")
        else:
            logger.warning("No resource groups found.")
    except Exception as e:
        logger.error(f"Failed to validate credential access: {str(e)}")
        raise WorkspaceBuilderException("Credential validation failed.")

def index(context: Context):
    logger.info("Starting CloudQuery indexing")

    # Initialize CloudQuery statistics tracking
    cq_stats = {
        'platforms': {},
        'total_discovered': 0,
        'total_added_to_registry': 0,
        'total_skipped': 0,
        'start_time': time.time()
    }
    context.set_property("CQ_STATS", cq_stats)

    init_cloudquery_table_info()

    cloud_config = context.get_setting("CLOUD_CONFIG")

    if cloud_config:
        platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
        accessed_resource_type_specs: dict[str, dict[ResourceTypeSpec, list[GenerationRuleInfo]]] = \
            context.get_property(RESOURCE_TYPE_SPECS_PROPERTY)

        registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
        with tempfile.TemporaryDirectory(dir=tmpdir_value) as cq_temp_dir:
            cq_config_dir = os.path.join(cq_temp_dir, "config")
            os.makedirs(cq_config_dir)

            cloud_config = deepcopy(cloud_config)
            transform_cloud_config(cloud_config, cq_temp_dir, platform_handlers)

            sqlite_database_file_path = os.path.join(cq_temp_dir, "db.sql")
            env_vars, cq_platform_infos = init_cloudquery_config(context,
                                                                 cloud_config,
                                                                 cq_config_dir,
                                                                 sqlite_database_file_path,
                                                                 accessed_resource_type_specs,
                                                                 cq_temp_dir)

            if len(cq_platform_infos) > 0:
                invoke_cloudquery("sync", cq_config_dir, env_vars)

                sql_connection = sqlite3.connect(sqlite_database_file_path)
                cursor = sql_connection.cursor()
                for cq_platform_spec, cq_resource_type_specs in cq_platform_infos:
                    platform_name = cq_platform_spec.name
                    platform_config_data = cloud_config.get(platform_name, dict())
                    platform_handler = platform_handlers[platform_name]

                    include_tags = platform_config_data.get("includeTags", {})
                    exclude_tags = platform_config_data.get("excludeTags", {})

                    for cq_resource_type_spec in cq_resource_type_specs:
                        table_name = cq_resource_type_spec.cloudquery_table_name
                        resource_type_name = cq_resource_type_spec.resource_type_name
                        logger.info(f"Processing table: {table_name} (resource type: {resource_type_name})")

                        try:
                            # Enhanced debugging: Check table structure first
                            if cq_debug_logging:
                                schema_response = cursor.execute(f"PRAGMA table_info({table_name})")
                                schema_info = schema_response.fetchall()
                                logger.debug(f"Table {table_name} schema:")
                                for col_info in schema_info:
                                    logger.debug(f"  Column: {col_info[1]} ({col_info[2]})")
                            
                            response = cursor.execute(f"SELECT * FROM {table_name}")
                        except sqlite3.OperationalError as e:
                            logger.warning(f"Table {table_name} not found or query failed: {e}")
                            continue

                        table_rows = response.fetchall()
                        row_count = len(table_rows)
                        logger.info(f"Found {row_count} rows in table {table_name}")
                        
                        if not table_rows:
                            logger.info(f"No rows found in table {table_name} - skipping processing.")
                            continue
                        field_descriptions = response.description
                        
                        # Enhanced debugging: Log field names
                        if cq_debug_logging:
                            field_names = [desc[0] for desc in field_descriptions]
                            logger.debug(f"Table {table_name} fields: {field_names}")

                        # Track discovered resources per platform and table
                        platform_stats = cq_stats['platforms'].setdefault(platform_name, {
                            'tables': {},
                            'discovered': 0,
                            'added_to_registry': 0,
                            'skipped': 0
                        })
                        
                        table_stats = platform_stats['tables'].setdefault(table_name, {
                            'discovered': 0,
                            'added_to_registry': 0,
                            'skipped': 0
                        })

                        for table_row in table_rows:
                            resource_data = {}

                            for i in range(len(field_descriptions)):
                                attribute_name = field_descriptions[i][0]
                                attribute_value = table_row[i]
                                if isinstance(attribute_value, str):
                                    try:
                                        attribute_value = yaml.safe_load(attribute_value)
                                    except yaml.YAMLError:
                                        pass
                                resource_data[attribute_name] = attribute_value

                            # Count discovered resource
                            table_stats['discovered'] += 1
                            platform_stats['discovered'] += 1
                            cq_stats['total_discovered'] += 1

                            resource_data["tags"] = resource_data.get("tags", {})
                            logger.debug(f"Resource tags: {resource_data['tags']}")

                            if exclude_tags and has_excluded_tags(resource_data, exclude_tags):
                                logger.info(f"Resource {resource_data.get('name', 'unknown')} excluded due to tags.")
                                table_stats['skipped'] += 1
                                platform_stats['skipped'] += 1
                                cq_stats['total_skipped'] += 1
                                continue
                            if include_tags and not has_included_tags(resource_data, include_tags):
                                logger.info(f"Resource {resource_data.get('name', 'unknown')} does not meet inclusion tags, skipping.")
                                table_stats['skipped'] += 1
                                platform_stats['skipped'] += 1
                                cq_stats['total_skipped'] += 1
                                continue

                            try:
                                resource_name, qualified_resource_name, resource_attributes = \
                                    platform_handler.parse_resource_data(resource_data,
                                                                         cq_resource_type_spec.resource_type_name,
                                                                         platform_config_data,
                                                                         context)
                            except WorkspaceBuilderException as e:
                                logger.warning(f"Resource group or required qualifier missing for resource: {resource_data.get('name', 'unknown')}. Skipping. Error: {e}")
                                table_stats['skipped'] += 1
                                platform_stats['skipped'] += 1
                                cq_stats['total_skipped'] += 1
                                # Track parsing errors for summary
                                if 'parsing_errors' not in cq_stats:
                                    cq_stats['parsing_errors'] = []
                                cq_stats['parsing_errors'].append({
                                    'platform': platform_name,
                                    'table': table_name,
                                    'resource_id': resource_data.get('id', 'unknown'),
                                    'error_type': 'WorkspaceBuilderException',
                                    'error_message': str(e)
                                })
                                continue
                            except (KeyError, ValueError, TypeError, AttributeError) as e:
                                # Handle common parsing errors that shouldn't crash the indexer
                                resource_id = resource_data.get('id', resource_data.get('name', 'unknown'))
                                logger.warning(f"Failed to parse resource data for {resource_id} in table {table_name}. Skipping. Error: {type(e).__name__}: {e}")
                                table_stats['skipped'] += 1
                                platform_stats['skipped'] += 1
                                cq_stats['total_skipped'] += 1
                                # Track parsing errors for summary
                                if 'parsing_errors' not in cq_stats:
                                    cq_stats['parsing_errors'] = []
                                cq_stats['parsing_errors'].append({
                                    'platform': platform_name,
                                    'table': table_name,
                                    'resource_id': resource_id,
                                    'error_type': type(e).__name__,
                                    'error_message': str(e)
                                })
                                continue
                            except Exception as e:
                                # Catch any other unexpected errors to prevent total crash
                                resource_id = resource_data.get('id', resource_data.get('name', 'unknown'))
                                logger.error(f"Unexpected error parsing resource data for {resource_id} in table {table_name}. Skipping. Error: {type(e).__name__}: {e}")
                                table_stats['skipped'] += 1
                                platform_stats['skipped'] += 1
                                cq_stats['total_skipped'] += 1
                                # Track parsing errors for summary
                                if 'parsing_errors' not in cq_stats:
                                    cq_stats['parsing_errors'] = []
                                cq_stats['parsing_errors'].append({
                                    'platform': platform_name,
                                    'table': table_name,
                                    'resource_id': resource_id,
                                    'error_type': type(e).__name__,
                                    'error_message': str(e)
                                })
                                continue

                            resource_attributes['resource'] = resource_data
                            auth_type, auth_secret = get_auth_type(platform_name, platform_config_data)
                            resource_attributes['auth_type'] = auth_type
                            resource_attributes['auth_secret'] = auth_secret
                            
                            # Enhanced debugging: Log LOD assignment for resources
                            if cq_debug_logging:
                                resource_lod = resource_attributes.get('lod', 'NOT_SET')
                                subscription_id = resource_attributes.get('subscription_id', 'UNKNOWN')
                                logger.debug(f"Resource {resource_name} (type: {cq_resource_type_spec.resource_type_name}):")
                                logger.debug(f"  Subscription ID: {subscription_id}")
                                logger.debug(f"  LOD: {resource_lod}")
                                logger.debug(f"  Qualified name: {qualified_resource_name}")
                                
                                # Special logging for resource groups to help debug LOD issues
                                if cq_resource_type_spec.resource_type_name == "resource_group":
                                    logger.info(f"Resource Group processed: {resource_name} with LOD: {resource_lod} in subscription: {subscription_id}")
                            
                            registry.add_resource(platform_name,
                                                  cq_resource_type_spec.resource_type_name,
                                                  resource_name,
                                                  qualified_resource_name,
                                                  resource_attributes)
                            
                            # Count successfully added resource
                            table_stats['added_to_registry'] += 1
                            platform_stats['added_to_registry'] += 1
                            cq_stats['total_added_to_registry'] += 1
                            
                            logger.info(f"Added resource: {resource_name} (type: {cq_resource_type_spec.resource_type_name}) to registry.")

    # Calculate and log CloudQuery statistics
    cq_stats['end_time'] = time.time()
    cq_stats['duration'] = cq_stats['end_time'] - cq_stats['start_time']
    
    logger.info("Finished CloudQuery indexing")
    
    # RESOLVE DEFERRED RELATIONSHIPS: Handle resources that couldn't find their resource groups during initial processing
    resolve_deferred_azure_relationships(registry, platform_handlers)
    
    # Log summary statistics
    logger.info(f"CloudQuery Discovery Summary:")
    logger.info(f"  Total resources discovered: {cq_stats['total_discovered']}")
    logger.info(f"  Total resources added to registry: {cq_stats['total_added_to_registry']}")
    logger.info(f"  Total resources skipped: {cq_stats['total_skipped']}")
    logger.info(f"  Discovery duration: {cq_stats['duration']:.2f} seconds")
    
    # Log parsing error summary if any errors occurred
    parsing_errors = cq_stats.get('parsing_errors', [])
    if parsing_errors:
        logger.warning(f"  Parsing errors encountered: {len(parsing_errors)} resources failed to parse")
        
        # Group errors by type for summary
        error_summary = {}
        for error in parsing_errors:
            error_type = error['error_type']
            if error_type not in error_summary:
                error_summary[error_type] = {'count': 0, 'platforms': set(), 'tables': set()}
            error_summary[error_type]['count'] += 1
            error_summary[error_type]['platforms'].add(error['platform'])
            error_summary[error_type]['tables'].add(error['table'])
        
        for error_type, summary in error_summary.items():
            platforms_str = ', '.join(sorted(summary['platforms']))
            tables_str = ', '.join(sorted(summary['tables']))
            logger.warning(f"    {error_type}: {summary['count']} errors across platforms [{platforms_str}] in tables [{tables_str}]")
    
    # Log per-platform statistics
    for platform_name, platform_stats in cq_stats['platforms'].items():
        logger.info(f"  {platform_name.upper()}: discovered={platform_stats['discovered']}, added={platform_stats['added_to_registry']}, skipped={platform_stats['skipped']}")
        
        # Log per-table statistics if CQ_DEBUG is enabled
        if cq_debug_logging:
            for table_name, table_stats in platform_stats['tables'].items():
                logger.debug(f"    Table {table_name}: discovered={table_stats['discovered']}, added={table_stats['added_to_registry']}, skipped={table_stats['skipped']}")


def resolve_deferred_azure_relationships(registry: Registry, platform_handlers: dict[str, PlatformHandler]):
    """
    Resolve deferred resource group relationships for Azure resources.
    This handles cases where storage accounts were processed before their resource groups.
    """
    logger.info("Starting deferred Azure relationship resolution...")
    
    # Get Azure platform handler
    azure_handler = platform_handlers.get("azure")
    if not azure_handler:
        logger.debug("No Azure platform handler found, skipping deferred relationship resolution")
        return
    
    # Get Azure platform from registry
    azure_platform = registry.platforms.get("azure")
    if not azure_platform:
        logger.debug("No Azure platform in registry, skipping deferred relationship resolution")
        return
    
    # Get resource group type
    rg_type = azure_platform.resource_types.get("resource_group")
    if not rg_type:
        logger.debug("No resource groups in registry, skipping deferred relationship resolution")
        return
    
    resolved_count = 0
    failed_count = 0
    
    # Process all resource types that might have deferred relationships
    for resource_type_name, resource_type in azure_platform.resource_types.items():
        if resource_type_name == "resource_group":
            continue  # Skip resource groups themselves
            
        # Create a snapshot to avoid "dictionary changed size during iteration" error
        for resource_qualified_name, resource in list(resource_type.instances.items()):
            deferred_info = getattr(resource, '_deferred_rg_lookup', None)
            if not deferred_info:
                continue  # No deferred lookup needed
                
            rg_name = deferred_info.get('rg_name')
            subscription_id = deferred_info.get('subscription_id')
            
            logger.debug(f"Resolving deferred relationship for {resource.name}: looking for RG '{rg_name}' in subscription '{subscription_id}'")
            
            # Try to find the resource group now that all resources are loaded
            rg_resource = None
            for rg in rg_type.instances.values():
                if (rg.name.upper() == rg_name.upper() and 
                    getattr(rg, 'subscription_id', None) == subscription_id):
                    rg_resource = rg
                    break
            
            if rg_resource:
                # SUCCESS: Establish the relationship
                setattr(resource, 'resource_group', rg_resource)
                # Update qualified name to include resource group
                new_qualified_name = f"{rg_resource.name}/{resource.name}"
                
                # Update the registry with the new qualified name
                old_qualified_name = resource.qualified_name
                resource.qualified_name = new_qualified_name
                
                # Update the instances dictionary
                if old_qualified_name in resource_type.instances:
                    del resource_type.instances[old_qualified_name]
                resource_type.instances[new_qualified_name] = resource
                
                # Clean up the deferred lookup info
                delattr(resource, '_deferred_rg_lookup')
                
                resolved_count += 1
                logger.info(f"SUCCESS: Resolved deferred relationship for '{resource.name}' -> resource group '{rg_resource.name}' (qualified name: {old_qualified_name} -> {new_qualified_name})")
            else:
                failed_count += 1
                logger.warning(f"FAILED: Could not resolve deferred relationship for '{resource.name}' - resource group '{rg_name}' in subscription '{subscription_id}' still not found")
    
    logger.info(f"Deferred relationship resolution completed: {resolved_count} resolved, {failed_count} failed")


def get_auth_type(platform_name, platform_config_data: dict[str,Any]): 
    # Determine auth type from platform_config_data for use with azure-auth.yaml template
    auth_secret=None
    auth_type=None
    if platform_name == "azure":
        auth_secret=platform_config_data.get("clientId")
        if auth_secret:    
            auth_type="azure_explicit"
            auth_secret=None
        else: 
            auth_secret=platform_config_data.get("spSecretName")
            if auth_secret: 
                auth_type="azure_service_principal_secret"
            else: 
                auth_type="azure_identity"
                auth_secret=None
    return auth_type, auth_secret
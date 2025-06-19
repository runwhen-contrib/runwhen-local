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
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from k8s_utils import get_secret

logger = logging.getLogger(__name__)
tmpdir_value = os.getenv("TMPDIR", "/tmp")  # fallback to /tmp if TMPDIR not set

debug_logging_str = os.environ.get('DEBUG_LOGGING')
debug_logging = debug_logging_str and debug_logging_str.lower() == 'true'

# Set logging level for Azure SDKs based on DEBUG_LOGGING
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

def invoke_cloudquery(cq_command: str,
                      cq_config_dir: str,
                      cq_env_vars: dict[str, str],
                      cq_output_dir: Optional[str] = None) -> None:
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

    #
    # 1) Decide on a plugin directory under your writable temp dir
    #
    plugin_dir = os.path.join(os.path.dirname(cq_config_dir), "cloudquery_plugins")
    os.makedirs(plugin_dir, exist_ok=True)  # Make sure it exists
    cq_env_vars["CQ_PLUGIN_DIR"] = plugin_dir

    #
    # 2) Prepare CloudQuery arguments
    #
    cq_args = ["cloudquery"]
    if debug_logging:
        cq_args += ["--log-level", "debug"]
    # Optionally pass --plugin-dir here as well:
    # cq_args += [f"--plugin-dir={plugin_dir}"]

    cq_args += [cq_command, cq_config_dir]
    if cq_output_dir:
        cq_args += ["--output-dir", cq_output_dir]

    try:
        # 3) Run CloudQuery in a writable working directory
        process_info = subprocess.run(
            cq_args,
            capture_output=True,
            env=cq_env_vars,
            cwd=os.path.dirname(cq_config_dir)  # set to the parent (the temp dir) so "cq" isn't read-only
        )

        stdout_text = process_info.stdout.decode("utf-8", errors="replace")
        stderr_text = process_info.stderr.decode("utf-8", errors="replace")
        logger.debug("Results for subprocess run of CloudQuery:")
        logger.debug(f"args={process_info.args}")
        logger.debug(f"return-code={process_info.returncode}")
        logger.debug(f"stderr: {stderr_text}")
        logger.debug(f"stdout: {stdout_text}")

        if process_info.returncode != 0:
            error_message = (
                f"Error running CloudQuery to discover resources: "
                f"return-code={process_info.returncode}; "
                f"stderr={stderr_text}; "
                f"stdout={stdout_text}"
            )
            raise WorkspaceBuilderException(error_message)
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
            logger.debug(f"-------USING CQ CONFIG-------\n{config_text}")
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
            sa_file = platform_cfg.get("applicationCredentialsFile")
            if sa_file:
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
        write_file(cfg_path, final_yaml)
        logger.debug(f"-------FINAL CQ CONFIG ({platform_name})-------\n{final_yaml}")

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
                                                                 accessed_resource_type_specs)

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
                        logger.info(f"Processing table: {table_name}")

                        try:
                            response = cursor.execute(f"SELECT * FROM {table_name}")
                        except sqlite3.OperationalError:
                            logger.warning(f"Table {table_name} not found or no resources discovered.")
                            continue

                        table_rows = response.fetchall()
                        if not table_rows:
                            logger.info(f"No rows found in table {table_name}.")
                            continue
                        field_descriptions = response.description

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

                            resource_data["tags"] = resource_data.get("tags", {})
                            logger.debug(f"Resource tags: {resource_data['tags']}")

                            if exclude_tags and has_excluded_tags(resource_data, exclude_tags):
                                logger.info(f"Resource {resource_data.get('name', 'unknown')} excluded due to tags.")
                                continue
                            if include_tags and not has_included_tags(resource_data, include_tags):
                                logger.info(f"Resource {resource_data.get('name', 'unknown')} does not meet inclusion tags, skipping.")
                                continue

                            try:
                                resource_name, qualified_resource_name, resource_attributes = \
                                    platform_handler.parse_resource_data(resource_data,
                                                                         cq_resource_type_spec.resource_type_name,
                                                                         platform_config_data,
                                                                         context)
                            except WorkspaceBuilderException as e:
                                logger.warning(f"Resource group or required qualifier missing for resource: {resource_data.get('name', 'unknown')}. Skipping. Error: {e}")
                                continue

                            resource_attributes['resource'] = resource_data
                            auth_type, auth_secret = get_auth_type(platform_name, platform_config_data)
                            resource_attributes['auth_type'] = auth_type
                            resource_attributes['auth_secret'] = auth_secret
                            registry.add_resource(platform_name,
                                                  cq_resource_type_spec.resource_type_name,
                                                  resource_name,
                                                  qualified_resource_name,
                                                  resource_attributes)
                            logger.info(f"Added resource: {resource_name} to registry.")

    logger.info("Finished CloudQuery indexing")


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
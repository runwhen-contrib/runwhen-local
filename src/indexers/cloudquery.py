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
from typing import Any, Optional, Union
import subprocess
import yaml
import base64

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

debug_logging_str = os.environ.get('DEBUG_LOGGING')
debug_logging = debug_logging_str and debug_logging_str.lower() == 'true'

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

    # Ensure all environment variable values are strings
    cq_env_vars = {k: str(v) for k, v in cq_env_vars.items()}

    common_error_message = "Error running CloudQuery to discover resources"
    try:
        cq_args = ["cloudquery"]
        if debug_logging:
            cq_args += ["--log-level", "debug"]
        cq_args += [cq_command, f"{cq_config_dir}"]
        if cq_output_dir:
            cq_args += ["--output-dir", f"{cq_output_dir}"]

        process_info = subprocess.run(cq_args, capture_output=True, env=cq_env_vars)

        stdout_text = process_info.stdout.decode('utf-8')
        stderr_text = process_info.stderr.decode('utf-8')
        logger.debug("Results for subprocess run of cloudquery:")
        logger.debug(f"args={process_info.args}")
        logger.debug(f"return-code={process_info.returncode}")
        logger.debug(f"stderr: {stderr_text}")
        logger.debug(f"stdout: {stdout_text}")
        if process_info.returncode != 0:
            error_message = f"{common_error_message}: " \
                            f"return-code={process_info.returncode}; " \
                            f"stderr={stderr_text}; " \
                            f"stdout={stdout_text}"
            raise WorkspaceBuilderException(error_message)
    except Exception as e:
        error_message = f"{common_error_message}; error launching CloudQuery; {str(e)}"
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
    with tempfile.TemporaryDirectory() as cq_temp_dir:
        cq_config_dir = os.path.join(cq_temp_dir, "config")
        cq_output_dir = os.path.join(cq_temp_dir, "docs")
        templates_dir = "indexers/cloudquery_templates"
        template_loader_func = lambda name: read_file(os.path.join(templates_dir, name))

        sqlite_config_path = os.path.join(cq_config_dir, "sqlite.yaml")
        db_file_path = os.path.join(cq_temp_dir, "db.sql")
        template_variables = {"database_path": db_file_path}
        sqlite_config_text = render_template_file("sqlite-config.yaml", template_variables, template_loader_func)
        write_file(sqlite_config_path, sqlite_config_text)

        template_variables = {
            "tables": ["*"],
            "destination_plugin_name": "sqlite",
        }
        for platform_spec in platform_specs:
            config_file_path = os.path.join(cq_config_dir, platform_spec.config_file_name)
            config_text = render_template_file(platform_spec.config_template_name, template_variables,
                                               template_loader_func)
            write_file(config_file_path, config_text)

        cq_env_vars = dict()
        invoke_cloudquery("tables", cq_config_dir, cq_env_vars, cq_output_dir)

        cloudquery_premium_table_info = dict()
        for platform_spec in platform_specs:
            table_doc_path = os.path.join(cq_output_dir, platform_spec.name, "__tables.json")
            table_doc_text = read_file(table_doc_path)
            table_doc_data = json.loads(table_doc_text)
            premium_tables = get_premium_tables(table_doc_data)
            cloudquery_premium_table_info[platform_spec.name] = premium_tables

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

def az_get_credentials_and_subscription_id(platform_config_data):
    sp_secret_name = platform_config_data.get("spSecretName")
    client_id = None
    client_secret = None
    tenant_id = None
    subscription_id = None

    if sp_secret_name:
        logger.info(f"Using Kubernetes secret named {mask_string(sp_secret_name)} from workspaceInfo.yaml")
        secret_data = get_secret(sp_secret_name)
        tenant_id = base64.b64decode(secret_data.get('tenantId')).decode('utf-8')
        client_id = base64.b64decode(secret_data.get('clientId')).decode('utf-8')
        client_secret = base64.b64decode(secret_data.get('clientSecret')).decode('utf-8')
        subscription_id = base64.b64decode(secret_data.get('subscriptionId')).decode('utf-8') if secret_data.get('subscriptionId') else None

    if not client_id or not client_secret or not tenant_id:
        client_id = platform_config_data.get("clientId")
        client_secret = platform_config_data.get("clientSecret")
        tenant_id = platform_config_data.get("tenantId")
        subscription_id = platform_config_data.get("subscriptionId")
        if client_id and tenant_id:
            logger.info(f"Retrieved service principal details from workspaceInfo.yaml")

    if not subscription_id:
        subscription_id = os.getenv("AZURE_SUBSCRIPTION_ID")
        if subscription_id:
            logger.info(f"Retrieved subscription_id from environment variables")

    if client_id and client_secret and tenant_id:
        logger.info("Using service principal credentials for authentication.")
        credential = ClientSecretCredential(tenant_id, client_id, client_secret)
        return {
            "AZURE_CLIENT_ID": client_id,
            "AZURE_CLIENT_SECRET": client_secret,
            "AZURE_TENANT_ID": tenant_id,
            "AZURE_SUBSCRIPTION_ID": subscription_id,
            "credential": credential,
            "subscription_id": subscription_id
        }
    else:
        try:
            logger.info("Falling back to managed identity for authentication.")
            managed_identity_details = get_managed_identity_details()
            client_id = managed_identity_details.get("AZURE_CLIENT_ID")
            tenant_id = managed_identity_details.get("AZURE_TENANT_ID")
            subscription_id = managed_identity_details.get("AZURE_SUBSCRIPTION_ID")
            credential = managed_identity_details.get("credential")

            logger.info(f"Using Managed Identity with client_id: {client_id}, tenant_id: {tenant_id}")

            return {
                "credential": credential,
                "subscription_id": subscription_id
            }
        except Exception as e:
            error_message = f"Failed to acquire token using Managed Identity: {str(e)}"
            logger.error(error_message)
            raise WorkspaceBuilderException(error_message)

    if not subscription_id:
        logger.error("Parameter 'subscription_id' must not be None.")
        raise ValueError("Parameter 'subscription_id' must not be None.")

def init_cloudquery_config(context: Context,
                           cloud_config_data: dict[str, Any],
                           cloud_config_dir: str,
                           db_file_path: str,
                           accessed_resource_type_specs: dict[str, dict[ResourceTypeSpec, list[GenerationRuleInfo]]]
                           ) -> tuple[dict[str, str], list[tuple[CloudQueryPlatformSpec, list[CloudQueryResourceTypeSpec]]]]:
    cq_process_environment_vars = dict()

    cloudquery_config = cloud_config_data.get("cloudquery", dict())
    cq_api_key = cloudquery_config.get("apiKey")
    if cq_api_key:
        cq_process_environment_vars["CLOUDQUERY_API_KEY"] = cq_api_key

    templates_dir = "indexers/cloudquery_templates"
    template_loader_func = lambda name: read_file(os.path.join(templates_dir, name))

    sqlite_config_path = os.path.join(cloud_config_dir, "sqlite.yaml")
    template_variables = {"database_path": db_file_path}
    sqlite_config_text = render_template_file("sqlite-config.yaml", template_variables, template_loader_func)
    write_file(sqlite_config_path, sqlite_config_text)

    platform_tables: list[tuple[CloudQueryPlatformSpec, list[CloudQueryResourceTypeSpec]]] = list()

    for platform_spec in platform_specs:
        platform_name = platform_spec.name
        platform_config_data = cloud_config_data.get(platform_name)
        resource_groups_override = None
        if platform_config_data is None:
            continue

        if platform_name == "azure":
            logger.debug("Entering Azure configuration block")
            az_credentials = az_get_credentials_and_subscription_id(platform_config_data)
            cq_process_environment_vars.update(az_credentials)
            credential = az_credentials.get("credential")
            subscription_id = az_credentials.get("subscription_id")
            if not credential or not subscription_id:
                raise ValueError("Both 'credential' and 'subscription_id' must be provided for Azure.")

            resource_groups_override = platform_config_data.get("resourceGroupLevelOfDetails")
            if not resource_groups_override:
                discovered_resource_groups = az_discover_resource_groups(credential, subscription_id)
                resource_groups_override = platform_config_data.get("resourceGroups", discovered_resource_groups)

        elif platform_name == "gcp":
            logger.debug("Entering GCP configuration block")
            service_account_file = platform_config_data.get("applicationCredentialsFile")
            if service_account_file:
                cq_process_environment_vars["GOOGLE_APPLICATION_CREDENTIALS"] = service_account_file
                template_variables["service_account_key_json"] = service_account_file
                logger.info(f"GOOGLE_APPLICATION_CREDENTIALS set to: {service_account_file}")
            else:
                logger.warning("GCP service account credentials file not found in workspaceInfo.yaml")

        cq_resource_type_specs = list()
        tables = list()

        for cq_resource_type_spec in platform_spec.resource_type_specs:
            if cq_resource_type_spec.mandatory:
                cq_resource_type_specs.append(cq_resource_type_spec)
                tables.append(cq_resource_type_spec.cloudquery_table_name)

        premium_tables = cloudquery_premium_table_info.get(platform_spec.name, list())
        platform_accessed_resource_type_specs = accessed_resource_type_specs.get(platform_name, dict())
        for resource_type_spec, generation_rule_infos in platform_accessed_resource_type_specs.items():
            resource_type_name = resource_type_spec.resource_type_name
            for cq_resource_type_spec in platform_spec.resource_type_specs:
                if cq_resource_type_spec.resource_type_name == resource_type_name:
                    break
            else:
                cq_resource_type_spec = CloudQueryResourceTypeSpec(resource_type_name, resource_type_name, False)
            if not cq_resource_type_spec.mandatory:
                table_name = cq_resource_type_spec.cloudquery_table_name
                if not cq_api_key and table_name in premium_tables:
                    premium_table_warning = f'Suppressing access to premium table "{table_name}"; ' \
                                            f'an account and API key is required for access.")'
                    logger.warning(premium_table_warning)
                    context.add_warning(premium_table_warning)
                else:
                    cq_resource_type_specs.append(cq_resource_type_spec)
                    if table_name not in tables:
                        tables.append(table_name)

        if len(cq_resource_type_specs) == 0:
            continue

        platform_tables.append((platform_spec, cq_resource_type_specs))

        template_variables = deepcopy(platform_config_data)
        template_variables["destination_plugin_name"] = "sqlite"
        template_variables["tables"] = tables

        if resource_groups_override:
            template_variables["resourceGroups"] = resource_groups_override
        else:
            logger.info("No resource groups override found.")
        config_file_path = os.path.join(cloud_config_dir, platform_spec.config_file_name)
        config_text = render_template_file(platform_spec.config_template_name, template_variables, template_loader_func)
        write_file(config_file_path, config_text)
        logger.info(f"Wrote config file for platform {platform_name}; tables={tables}")

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
        with tempfile.TemporaryDirectory() as cq_temp_dir:
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
                    platform_config_data = cloud_config.get(cq_platform_spec.name, dict())
                    platform_handler = platform_handlers[cq_platform_spec.name]
                    for cq_resource_type_spec in cq_resource_type_specs:
                        table_name = cq_resource_type_spec.cloudquery_table_name
                        logger.info(f"Processing table: {table_name}")

                        try:
                            response = cursor.execute(f"SELECT * FROM {table_name}")
                        except sqlite3.OperationalError as e:
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

                            resource_name, qualified_resource_name, resource_attributes = \
                                platform_handler.parse_resource_data(resource_data,
                                                                     cq_resource_type_spec.resource_type_name,
                                                                     platform_config_data,
                                                                     context)
                            resource_attributes['resource'] = resource_data
                            auth_type, auth_secret = get_auth_type(cq_platform_spec.name, platform_config_data)
                            resource_attributes['auth_type'] = auth_type
                            resource_attributes['auth_secret'] = auth_secret
                            registry.add_resource(cq_platform_spec.name,
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
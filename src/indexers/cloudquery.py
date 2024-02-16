from copy import deepcopy
from dataclasses import dataclass
import json
import logging
import os
import sqlite3
import tempfile
from template import render_template_file
from typing import Any, Optional, Union
import subprocess
import yaml

# import models
from component import SettingDependency, Context
from enrichers.generation_rule_types import (
    PlatformHandler,
    PLATFORM_HANDLERS_PROPERTY_NAME,
    RESOURCE_TYPE_SPECS_PROPERTY
)
from enrichers.generation_rules import GenerationRuleInfo
from exceptions import WorkspaceBuilderException
from resources import Registry, REGISTRY_PROPERTY_NAME, ResourceTypeSpec
from utils import read_file, write_file
from .common import CLOUD_CONFIG_SETTING

logger = logging.getLogger(__name__)

debug_logging_str = os.environ.get('DEBUG_LOGGING')
debug_logging = debug_logging_str and debug_logging_str.lower() == 'true'

DOCUMENTATION = "Index resources using CloudQuery"

SETTINGS = (
    SettingDependency(CLOUD_CONFIG_SETTING, False),
)

@dataclass
class CloudQueryResourceTypeSpec:
    """
    Information about each CloudQuery resource type/table.

    FIXME: This is a sort of confusing class name, since it's actually unrelated to the
    ResourceTypeSpec class used by the resource registry and platform handlers.
    Should come up with different terminology for this and the related CloudQueryPlatformSpec.
    """

    # The name of the resource type in the resource registry
    resource_type_name: str
    # The name of the table in the CloudQuery database
    cloudquery_table_name: str
    # We should always index this table even if it's not directly referenced by a gen rule
    # This is for things like namespaces & resource groups that would be set up in the platform handler
    # to be referenced from name qualifiers, match rules, templates, etc.
    mandatory: bool


@dataclass
class CloudQueryPlatformSpec:
    name: str
    config_file_name: str
    # The path/name of the template file used to generate the config file for this platform
    config_template_name: str
    environment_variables: dict[str, str]
    # The info for the resource types supported for this platform
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
                               # IMPORTANT!!! The ResourceGroup resource type must be the first entry here so that
                               # they're all created before processing the other resource types, which
                               # set a resource_group field that points to their parent resource group instance.
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
                               # IMPORTANT!!! The project resource type must be the first entry here so that
                               # they're all created before processing the other resource types, which
                               # set a resource_group field that points to their parent resource group instance.
                               CloudQueryResourceTypeSpec(resource_type_name="project",
                                                          cloudquery_table_name="gcp_projects",
                                                          mandatory=True),
                               CloudQueryResourceTypeSpec(resource_type_name="compute_instance",
                                                          cloudquery_table_name="gcp_compute_instances",
                                                          mandatory=False),
                           ]),
]

def invoke_cloudquery(cq_command: str,
                      cq_config_dir: str,
                      cq_env_vars: dict[str, str],
                      cq_output_dir: Optional[str] = None) -> None:
    # We need to set the PATH environment variable so that the cloudquery CLI can be found
    path = os.getenv("PATH")
    cq_env_vars["PATH"] = path
    common_error_message = "Error running CloudQuery to discover resources"
    try:
        # Construct the args to use to invoke the CloudQuery CLI
        cq_args = ["cloudquery"]
        if debug_logging:
            cq_args += ["--log-level", "debug"]
        cq_args += [cq_command, f"{cq_config_dir}"]
        if cq_output_dir:
            cq_args += ["--output-dir", f"{cq_output_dir}"]

        process_info = subprocess.run(cq_args, capture_output=True, env=cq_env_vars)

        # Do some debug logging of the info from the CloudQuery run
        stderr_text = process_info.stdout.decode('utf-8')
        stdout_text = process_info.stderr.decode('utf-8')
        logger.debug("Results for subprocess run of cloudquery:")
        logger.debug(f"args={process_info.args}")
        logger.debug(f"return-code={process_info.returncode}")
        logger.debug(f"stderr: {stderr_text}")
        logger.debug(f"stdout: {stdout_text}")
        # If there was a failure code from CloudQuery, then raise an  exception
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
        relations: list[dict[str, Union[str, Any]]] = table_info.get("relations")
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
        # Set up a template loader func to load from the CloudQuery template dir
        # FIXME: There's some code duplication here with init_cloudquery_config.
        # Should refactor a bit to get rid of that.
        templates_dir = "indexers/cloudquery_templates"
        template_loader_func = lambda name: read_file(os.path.join(templates_dir, name))

        # Create the sqlite destination config file
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

        # Parse the generated table documentation
        cloudquery_premium_table_info = dict()
        for platform_spec in platform_specs:
            table_doc_path = os.path.join(cq_output_dir, platform_spec.name, "__tables.json")
            table_doc_text = read_file(table_doc_path)
            table_doc_data = json.loads(table_doc_text)
            premium_tables = get_premium_tables(table_doc_data)
            cloudquery_premium_table_info[platform_spec.name] = premium_tables

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

    # Set up a template loader func to load from the CloudQuery template dir
    templates_dir = "indexers/cloudquery_templates"
    template_loader_func = lambda name: read_file(os.path.join(templates_dir, name))

    # Create the sqlite destination config file
    sqlite_config_path = os.path.join(cloud_config_dir, "sqlite.yaml")
    template_variables = {"database_path": db_file_path}
    sqlite_config_text = render_template_file("sqlite-config.yaml", template_variables, template_loader_func)
    write_file(sqlite_config_path, sqlite_config_text)

    platform_tables: list[tuple[CloudQueryPlatformSpec, list[CloudQueryResourceTypeSpec]]] = list()

    for platform_spec in platform_specs:
        platform_name = platform_spec.name
        platform_config_data = cloud_config_data.get(platform_name)
        if platform_config_data is None:
            continue

        cq_resource_type_specs = list()
        tables = list()

        # First add any mandatory resource types
        for cq_resource_type_spec in platform_spec.resource_type_specs:
            if cq_resource_type_spec.mandatory:
                cq_resource_type_specs.append(cq_resource_type_spec)
                tables.append(cq_resource_type_spec.cloudquery_table_name)

        # cq_resource_type_spec.resource_type_name not in added_mandatory_resource_type_specs
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
                    # FIXME: Ideally here we'd like to report information about the generation rule(s)
                    # and associated code bundle(s) that are begin skipped because they rely on premium
                    # tables, but, unfortunately the current data structures for tracking the accessed
                    # resource types don't keep track of which generation rule(s) were the ones that
                    # triggered the inclusion of the resource type. So those data structures should be
                    # tweaked a bit to provide support for that info. So for now we just report the
                    # table name.
                    # FIXME: Also, logging at the workspace builder REST service is not the ideal way
                    # to report these warnings. Ideally, they'd be included in the REST response to
                    # the client invoking the workspace builder. That way they can be reported
                    # directly to the user when they make the docker exec call rather than requiring
                    # them to go through the docker container logs, which they may not even have
                    # access to. So there should be a mechanism for accumulating warning messages
                    # in the context that are then reported back in the response.
                    premium_table_warning = f'Suppressing access to premium table "{table_name}"; ' \
                                            f'an account and API key is required for access.")'
                    logger.warning(premium_table_warning)
                    context.add_warning(premium_table_warning)
                    for generation_rule_info in generation_rule_infos:
                        generation_rule_info_str = generation_rule_info.get_info_string()
                        suppressed_gen_rule_warning = f'Suppressing generation rule due to access to premium table: ' \
                                                      f'table="{table_name}"; {generation_rule_info_str}'
                        logger.warning(suppressed_gen_rule_warning)
                        context.add_warning(suppressed_gen_rule_warning)
                else:
                    cq_resource_type_specs.append(cq_resource_type_spec)
                    if table_name not in tables:
                        tables.append(table_name)

        if len(cq_resource_type_specs) == 0:
            continue

        platform_tables.append((platform_spec, cq_resource_type_specs))

        # Set up any environment variables for the platform
        for env_var_name, config_name in platform_spec.environment_variables.items():
            env_var_value = platform_config_data.get(config_name)
            if env_var_value is not None:
                cq_process_environment_vars[env_var_name] = env_var_value

        # Start the template variables from the platform config dict. That way the template
        # for a platform can support platform-specific configuration options without having
        # to hard-code anything in the platform spec.
        # NB: We do the deep copy just to be safe, since the root_config_data argument is
        # owned by the caller, so we shouldn't modify it.
        template_variables = deepcopy(platform_config_data)
        template_variables["destination_plugin_name"] = "sqlite"
        # tables = [resource_type_spec.cloudquery_table_name for resource_type_spec in platform_spec.resource_type_specs]
        template_variables["tables"] = tables
        config_file_path = os.path.join(cloud_config_dir, platform_spec.config_file_name)
        config_text = render_template_file(platform_spec.config_template_name, template_variables, template_loader_func)
        write_file(config_file_path, config_text)
        logger.info(f"Wrote config file for platform {platform_name}; tables={tables}")

    return cq_process_environment_vars, platform_tables

def transform_cloud_config(cloud_config: dict[str, Any],
                           cq_temp_dir: str,
                           platform_handlers: dict[str, PlatformHandler]) -> None:
    """
    Give the platform handlers a shot at transforming the cloud config data before
    we use it to set up the CloudQuery config files. Currently, this is just used
    as a hook to do the processing of file-based data to copy the inline file data
    to a temp file and replace the value with the path to the temp file. But the
    platform handler could make other changes to the config if it makes sense for
    that handler.
    """
    for platform_spec in platform_specs:
        platform_name = platform_spec.name
        platform_cloud_config = cloud_config.get(platform_name)
        if platform_cloud_config:
            platform_handler = platform_handlers[platform_name]
            platform_handler.transform_cloud_config(platform_cloud_config, cq_temp_dir)

def index(context: Context):
    logger.info("Starting CloudQuery indexing")

    # FIXME: Ideally this should just get called once on startup, since it's independent of
    # the parameters for any particular request. But for now there's just a check on the global
    # variable to short-circuit repeated invocations.
    init_cloudquery_table_info()

    cloud_config = context.get_setting("CLOUD_CONFIG")
    if cloud_config:
        platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
        accessed_resource_type_specs: dict[str, dict[ResourceTypeSpec, list[GenerationRuleInfo]]] = \
            context.get_property(RESOURCE_TYPE_SPECS_PROPERTY)

        registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
        with tempfile.TemporaryDirectory() as cq_temp_dir:
            # Create a config directory in the temp directory where we'll put all the CloudQuery config files
            cq_config_dir = os.path.join(cq_temp_dir, "config")
            os.makedirs(cq_config_dir)

            # Let the platform handlers transform the cloud config data.
            # NB: We do the deep copy just to be safe, since the root_config_data argument is
            # owned by the caller, so we shouldn't modify it.
            cloud_config = deepcopy(cloud_config)
            transform_cloud_config(cloud_config, cq_temp_dir, platform_handlers)

            # Create the CloudQuery source/destination config files
            sqlite_database_file_path = os.path.join(cq_temp_dir, "db.sql")
            env_vars, cq_platform_infos = init_cloudquery_config(context,
                                                                 cloud_config,
                                                                 cq_config_dir,
                                                                 sqlite_database_file_path,
                                                                 accessed_resource_type_specs)

            # common_error_message = "Error running CloudQuery to discover resources"
            if len(cq_platform_infos) > 0:
                invoke_cloudquery("sync", cq_config_dir, env_vars)

                # Convert the tables from the sqlite DB to resources in the resource registry
                sql_connection = sqlite3.connect(sqlite_database_file_path)
                cursor = sql_connection.cursor()
                for cq_platform_spec, cq_resource_type_specs in cq_platform_infos:
                    platform_config_data = cloud_config.get(cq_platform_spec.name, dict())
                    platform_handler = platform_handlers[cq_platform_spec.name]
                    for cq_resource_type_spec in cq_resource_type_specs:
                        # table_name = f"{platform_spec.name}_{resource_type_spec.cloudquery_table_name}"
                        # table_name = resource_type_spec.cloudquery_table_name
                        # Extract the fields we need from the sqlite table.
                        # Would simplify the spec for the platform and I don't think it's really buying us that
                        # much in terms of performance/efficiency to only fetch a subset, since we'll probably
                        # always want to get the full instance_view of the resource, which is likely the
                        # biggest field. So could just do a SELECT * and then use the description field in the
                        # response to get the field names.
                        try:
                            response = cursor.execute(f"SELECT * FROM {cq_resource_type_spec.cloudquery_table_name}")
                            # response = cursor.execute(f"SELECT {joined_cloudquery_field_names} FROM {table_name}")
                        except sqlite3.OperationalError as e:
                            # If no instances of the table were discovered, then the table will not be defined in the
                            # database, and the SQL execution raises an OperationalError. We don't want to treat
                            # that as an error, so we just continue in that case.
                            # FIXME: Are there are other errors that could occur here that we should handle differently?
                            # Should probably verify that the exception is due to the table not being found.
                            # Seems like the only way you can do that is to parse the error message, which is sort of ugly.
                            continue
                        table_rows = response.fetchall()
                        field_descriptions = response.description
                        # resource_name = None
                        for table_row in table_rows:
                            # Combine the field descriptions and the row values to set up the resource attributes.
                            resource_data = dict()
                            for i in range(len(field_descriptions)):
                                attribute_name = field_descriptions[i][0]
                                attribute_value = table_row[i]
                                # CloudQuery encodes a number of attributes as JSON text, so we try
                                # to convert to Python data, so that the data can be accessed/navigated
                                # by match predicates and template variable expressions. If the data,
                                # is not JSON, then an exception will be raised and ignored and we just
                                # use the original string value.
                                # FIXME: I think this should do the right thing for all expected values,
                                # but there are tons of different CloudQuery platforms and tables that
                                # I haven't looked at, so it's possible that there are cases where this
                                # won't be the right thing to do, so we may need to revisit this.
                                if type(attribute_value) == str:
                                    try:
                                        attribute_value = yaml.safe_load(attribute_value)
                                    except yaml.YAMLError as e:
                                        pass
                                resource_data[attribute_name] = attribute_value
                            # Call the platform handler to extract the name and qualified name from the
                            # resource attributes and possibly make alterations to the attributes.
                            resource_name, qualified_resource_name, resource_attributes = \
                                platform_handler.parse_resource_data(resource_data,
                                                                     cq_resource_type_spec.resource_type_name,
                                                                     platform_config_data,
                                                                     context)
                            resource_attributes['resource'] = resource_data
                            registry.add_resource(cq_platform_spec.name,
                                                  cq_resource_type_spec.resource_type_name,
                                                  resource_name,
                                                  qualified_resource_name,
                                                  resource_attributes)

    logger.info("Finished CloudQuery indexing")

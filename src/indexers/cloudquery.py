from copy import deepcopy
from dataclasses import dataclass
import logging
import os
import sqlite3
import tempfile
from template import render_template_file
from typing import Any
import subprocess
import yaml

# import models
from component import Setting, SettingDependency, Context
from enrichers.generation_rule_types import (
    PlatformHandler,
    PLATFORM_HANDLERS_PROPERTY_NAME,
    RESOURCE_TYPE_SPECS_PROPERTY
)
from resources import Registry, REGISTRY_PROPERTY_NAME, ResourceTypeSpec
from utils import read_file, write_file

logger = logging.getLogger(__name__)

DOCUMENTATION = "Index resources using CloudQuery"

CLOUD_CONFIG_SETTING = Setting("CLOUD_CONFIG",
                               "cloudConfig",
                               Setting.Type.DICT,
                               "Configuration/credential info for the cloud input sources",
                               dict())

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
                           ])
]

def init_cloudquery_config(cloud_config_data: dict[str, Any],
                           cloud_config_dir: str,
                           db_file_path: str,
                           accessed_resource_type_specs: dict[str, list[ResourceTypeSpec]]
                           ) -> tuple[dict[str, str], list[tuple[CloudQueryPlatformSpec, list[CloudQueryResourceTypeSpec]]]]:
    cq_process_environment_vars = dict()

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
        for resource_type_spec in accessed_resource_type_specs.get(platform_name, list()):
            resource_type_name = resource_type_spec.resource_type_name
            for cq_resource_type_spec in platform_spec.resource_type_specs:
                if cq_resource_type_spec.resource_type_name == resource_type_name:
                    break
            else:
                cq_resource_type_spec = CloudQueryResourceTypeSpec(resource_type_name, resource_type_name, False)
            if not cq_resource_type_spec.mandatory:
                cq_resource_type_specs.append(cq_resource_type_spec)
                tables.append(cq_resource_type_spec.cloudquery_table_name)

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

    return cq_process_environment_vars, platform_tables

def index(context: Context):
    logger.info("Starting CloudQuery indexing")

    cloud_config_data = context.get_setting("CLOUD_CONFIG")
    if cloud_config_data:
        platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
        accessed_resource_type_specs: dict[str, list[ResourceTypeSpec]] = context.get_property(RESOURCE_TYPE_SPECS_PROPERTY)

        registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
        with tempfile.TemporaryDirectory() as cq_temp_dir:
            # Create a config directory in the temp directory where we'll put all the CloudQuery config files
            cq_config_dir = os.path.join(cq_temp_dir, "config")
            os.makedirs(cq_config_dir)

            # Create the CloudQuery source/destination config files
            sqlite_database_file_path = os.path.join(cq_temp_dir, "db.sql")
            env_vars, cq_platform_infos = init_cloudquery_config(cloud_config_data,
                                                                 cq_config_dir,
                                                                 sqlite_database_file_path,
                                                                 accessed_resource_type_specs)

            if len(cq_platform_infos) > 0:
                # Invoke CloudQuery to scan for resources from all the configured platforms
                path = os.getenv("PATH")
                env_vars["PATH"] = path
                try:
                    process_info = subprocess.run(["cloudquery", "sync", f"{cq_config_dir}"],
                                                  capture_output=True,
                                                  env=env_vars)
                except Exception as e:
                    # This exception handling is just to aid in debugging/development.
                    # Can remove it once things are more settled.
                    raise e

                # Convert the tables from the sqlite DB to resources in the resource registry
                sql_connection = sqlite3.connect(sqlite_database_file_path)
                cursor = sql_connection.cursor()
                for cq_platform_spec, cq_resource_type_specs in cq_platform_infos:
                    platform_config_data = cloud_config_data.get(cq_platform_spec.name, dict())
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
                            resource_attributes = dict()
                            for i in range(len(field_descriptions)):
                                attribute_name = field_descriptions[i][0]
                                attribute_value = table_row[i]
                                # CloudQuery encodes a number of attributes as JSON text, so we try
                                # to convert to Python data, so that the data can be accessed/navigated
                                # by match predicates and template variable expressions. If the data,
                                # is not JSON, then an exception will be raised and ignored and we just
                                # use the original value.
                                # FIXME: I think this should do the right thing for all expected values,
                                # but there are tons of different CloudQuery platforms and tables that
                                # I haven't looked at, so it's possible that there are cases where this
                                # won't be the right thing to do, so we may need to revisit this.
                                if type(attribute_value) == str:
                                    try:
                                        attribute_value = yaml.safe_load(attribute_value)
                                    except yaml.YAMLError as e:
                                        pass
                                resource_attributes[attribute_name] = attribute_value
                            # Call the platform handler to extract the name and qualified name from the
                            # resource attributes and possibly make alterations to the attributes.
                            resource_name, qualified_resource_name = \
                                platform_handler.process_resource_attributes(resource_attributes,
                                                                             cq_resource_type_spec.resource_type_name,
                                                                             platform_config_data,
                                                                             context)
                            registry.add_resource(cq_platform_spec.name,
                                                  cq_resource_type_spec.resource_type_name,
                                                  resource_name,
                                                  qualified_resource_name,
                                                  resource_attributes)

    logger.info("Finished CloudQuery indexing")

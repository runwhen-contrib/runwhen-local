import base64
import os
from typing import Any, Optional

from component import Context
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import LevelOfDetail, PlatformHandler
from utils import write_file

import logging
logger = logging.getLogger(__name__)

GCP_PLATFORM = "gcp"

APPLICATION_CREDENTIALS_FILE_KEY = "applicationCredentialsFile"

def get_project(resource: Resource) -> Optional[Resource]:
    # FIXME: Shouldn't use hard-coded string here
    if resource.resource_type.name == "project":
        return resource
    try:
        return getattr(resource, "project")
    except AttributeError:
        return None

class GCPPlatformHandler(PlatformHandler):

    def __init__(self):
        super().__init__(GCP_PLATFORM)

    def transform_cloud_config(self, cloud_config: dict[str, Any], cq_temp_dir: str) -> None:
        encoded_application_credentials_text = cloud_config.get(APPLICATION_CREDENTIALS_FILE_KEY)
        if encoded_application_credentials_text:
            # Since the contents of the cloud config are not top-level settings for the
            # component framework, they don't get the normal settings processing, in
            # particular the file settings handling that automatically writes the
            # contents of the file settings to a temp file and replaces the setting with
            # a path to the temp file. So we need to do it manually here for the
            # application credentials file.
            application_credentials_text = base64.b64decode(encoded_application_credentials_text).decode('utf-8')
            application_credentials_file_name = f"{GCP_PLATFORM}.{APPLICATION_CREDENTIALS_FILE_KEY}.yaml"
            application_credentials_temp_file = os.path.join(cq_temp_dir, application_credentials_file_name)
            write_file(application_credentials_temp_file, application_credentials_text)
            cloud_config[APPLICATION_CREDENTIALS_FILE_KEY] = application_credentials_temp_file

        # Support a comma-separated list for the project setting in additional to
        # an explicit list representation (which we assume it already is if the
        # setting is not a string)
        projects = cloud_config.get("projects")
        if isinstance(projects, str):
            cloud_config["projects"] = [p.strip() for p in projects.split(",")]

    def parse_resource_data(self,
                            resource_data: dict[str,Any],
                            resource_type_name: str,
                            platform_config_data: dict[str,Any],
                            context: Context) -> tuple[str, str, dict[str, Any]]:
        resource_attributes = dict()
        if resource_type_name == "project":
            name: str = resource_data['project_id']
            qualified_name = name
            project_level_of_detail_config = platform_config_data.get("projectLevelOfDetails", dict())
            project_lod_value = project_level_of_detail_config.get(name)
            resource_attributes['lod'] = LevelOfDetail.construct_from_config(project_lod_value) \
                if project_lod_value is not None else context.get_setting("DEFAULT_LOD")
        else:
            name: str = resource_data['name']
            qualified_name = name
            project_id = resource_data.get("project_id")
            if project_id:
                registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
                project_resource_type = registry.lookup_resource_type(GCP_PLATFORM, "project")
                if project_resource_type:
                    for project in project_resource_type.instances.values():
                        if project.name.upper() == project_id.upper():
                            resource_attributes['project'] = project
                            break
                qualified_name = f"{project_id}/{name}"

        return name, qualified_name, resource_attributes

    def get_level_of_detail(self, resource: Resource) -> Optional[LevelOfDetail]:
        project = get_project(resource)
        if not project:
            return None
        level_of_detail = getattr(project, 'lod')
        return level_of_detail

    @staticmethod
    def get_common_resource_property_values(resource: Resource, qualifier_name: str) -> Optional[str]:
        if qualifier_name == "project":
            project = get_project(resource)
            if project:
                return project.name
        else:
            # FIXME: Should we treat this as an error, i.e. raise Exception?
            return None

    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        return self.get_common_resource_property_values(resource, qualifier_name)


    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        template_variables = dict()
        project = get_project(resource)
        if project:
            template_variables['project'] = project
        return template_variables

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        return self.get_common_resource_property_values(resource, variable_name)


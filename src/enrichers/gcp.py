import base64
import os
from typing import Any, Optional, Dict

from component import Context
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import LevelOfDetail, PlatformHandler
from utils import write_file, mask_string

import logging
logger = logging.getLogger(__name__)

GCP_PLATFORM = "gcp"

APPLICATION_CREDENTIALS_FILE_KEY = "applicationCredentialsFile"

# Cache for GCP project names
project_names_cache: Dict[str, str] = {}

# Cache for GCP credentials
_gcp_credentials = {
    "project_id": None,
    "service_account_key": None,
    "auth_type": None,
    "auth_secret": None
}

def set_gcp_credentials(project_id: str = None, service_account_key: str = None, 
                       auth_type: str = None, auth_secret: str = None):
    """
    Explicitly set GCP credentials to use for all GCP operations in this module.
    
    Args:
        project_id: The GCP project ID
        service_account_key: Service account JSON key as string
        auth_type: Type of authentication (gcp_service_account, gcp_adc, etc.)
        auth_secret: Name of Kubernetes secret containing credentials
    """
    global _gcp_credentials
    if project_id:
        _gcp_credentials["project_id"] = project_id
    if service_account_key:
        _gcp_credentials["service_account_key"] = service_account_key
    if auth_type:
        _gcp_credentials["auth_type"] = auth_type
    if auth_secret:
        _gcp_credentials["auth_secret"] = auth_secret
        
    logger.info(f"Set GCP credentials with auth type: {auth_type}")

def get_project_name(project_id: str) -> str:
    """
    Get the display name for a GCP project.
    Falls back to project ID if name cannot be retrieved.
    """
    global project_names_cache
    
    if project_id in project_names_cache:
        return project_names_cache[project_id]
    
    try:
        import subprocess
        # Try to get project display name using gcloud
        result = subprocess.run(
            ["gcloud", "projects", "describe", project_id, "--format=value(name)"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0 and result.stdout.strip():
            project_name = result.stdout.strip()
            project_names_cache[project_id] = project_name
            return project_name
        else:
            logger.warning(f"Could not retrieve project name for {mask_string(project_id)}: {result.stderr}")
            project_names_cache[project_id] = project_id
            return project_id
            
    except Exception as e:
        logger.warning(f"Error retrieving project name for {mask_string(project_id)}: {e}")
        project_names_cache[project_id] = project_id
        return project_id

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
        
        # Get project_id - either from direct field or extract from resource name/id
        project_id = resource_data.get("project_id") or resource_data.get("project")
        if not project_id:
            # Try to extract from resource name or ID if it contains project info
            resource_name = resource_data.get("name", "")
            if "/" in resource_name and "projects/" in resource_name:
                parts = resource_name.split("/")
                for i, part in enumerate(parts):
                    if part == "projects" and i + 1 < len(parts):
                        project_id = parts[i + 1]
                        break
        
        if project_id:
            resource_attributes["project_id"] = project_id
            
            # Add project name to the resource attributes
            project_name = get_project_name(project_id)
            resource_attributes["project_name"] = project_name
        
        if resource_type_name == "project":
            name: str = resource_data.get('project_id')
            if not name:
                raise ValueError(f"Project resource missing required 'project_id' field. Available fields: {list(resource_data.keys())}")
            qualified_name = name
            project_level_of_detail_config = platform_config_data.get("projectLevelOfDetails", dict())
            project_lod_value = project_level_of_detail_config.get(name)
            resource_attributes['lod'] = LevelOfDetail.construct_from_config(project_lod_value) \
                if project_lod_value is not None else context.get_setting("DEFAULT_LOD")
        else:
            name: str = resource_data.get('name')
            if not name:
                # Try alternative name fields
                name = resource_data.get("display_name") or resource_data.get("resource_name")
                if not name and "/" in resource_data.get("id", ""):
                    name = resource_data["id"].split("/")[-1]
                if not name:
                    raise ValueError(f"Resource missing required 'name' field and no alternative name found. Available fields: {list(resource_data.keys())}")
            qualified_name = name
            if project_id:
                registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
                project_resource_type = registry.lookup_resource_type(GCP_PLATFORM, "project")
                if project_resource_type:
                    for project in project_resource_type.instances.values():
                        if project.name.upper() == project_id.upper():
                            resource_attributes['project'] = project
                            break
                qualified_name = f"{project_id}/{name}"
        
        # Add zone and region information if available
        zone = resource_data.get("zone")
        region = resource_data.get("region")
        location = resource_data.get("location")
        
        if zone:
            resource_attributes["zone"] = zone
            # Extract region from zone if region not explicitly provided
            if not region and "-" in zone:
                # Zone format is typically region-zone (e.g., us-central1-a)
                region_parts = zone.split("-")
                if len(region_parts) >= 2:
                    region = "-".join(region_parts[:-1])
                    
        if region:
            resource_attributes["region"] = region
        elif location:
            resource_attributes["location"] = location

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


from typing import Any, Optional
from component import Context
from resources import Resource
from .generation_rule_types import PlatformHandler, LevelOfDetail

class AzureDevOpsPlatformHandler(PlatformHandler):
    def __init__(self):
        super().__init__("azure_devops")

    def parse_resource_data(
        self,
        resource_data: dict[str, Any],
        resource_type_name: str,
        platform_config_data: dict[str, Any],
        context: Context,
    ) -> tuple[str, str, dict[str, Any]]:
        name: str = resource_data["name"]
        qualified_name = name
        resource_attributes = {}

        # Add project information if available
        if "project" in resource_data:
            project = resource_data["project"]
            resource_attributes["project"] = project
            qualified_name = f"{project.name}/{name}"

        # Add common attributes
        for key in ["id", "url", "revision"]:
            if key in resource_data:
                resource_attributes[key] = resource_data[key]

        # Add type-specific attributes
        if resource_type_name == "repository":
            for key in ["default_branch", "size", "remote_url"]:
                if key in resource_data:
                    resource_attributes[key] = resource_data[key]
        elif resource_type_name == "pipeline":
            for key in ["type"]:
                if key in resource_data:
                    resource_attributes[key] = resource_data[key]
        elif resource_type_name == "project":
            for key in ["description", "state", "visibility"]:
                if key in resource_data:
                    resource_attributes[key] = resource_data[key]

        return name, qualified_name, resource_attributes

    def get_level_of_detail(self, resource: Resource) -> LevelOfDetail:
        return LevelOfDetail.DETAILED

    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        if qualifier_name == "project.name":
            project = getattr(resource, "project", None)
            if project:
                return project.name
        elif qualifier_name == "organization":
            return getattr(resource, "organization", None)
        return None

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        property_name = property_name.lower()
        if property_name in ["id", "name", "url", "revision"]:
            value = getattr(resource, property_name, None)
            if value is not None:
                return [value]
        return None

    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        template_variables = {}
        project = getattr(resource, "project", None)
        if project:
            template_variables["project"] = project
        
        organization = getattr(resource, "organization", None)
        if organization:
            template_variables["organization"] = organization
            
        return template_variables

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        return self.get_resource_qualifier_value(resource, variable_name) 
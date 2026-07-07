"""Platform handler for RunWhen platform generation rules."""

from __future__ import annotations

from typing import Any, Optional

from resources import Resource

from .generation_rule_types import LevelOfDetail, PlatformHandler

RUNWHEN_PLATFORM = "runwhen"
WORKSPACE_RESOURCE_TYPE = "workspace"


class RunWhenPlatformHandler(PlatformHandler):
    def __init__(self) -> None:
        super().__init__(RUNWHEN_PLATFORM)

    def get_level_of_detail(self, resource: Resource) -> LevelOfDetail:
        return LevelOfDetail.DETAILED

    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        if qualifier_name in ("workspace", "resource", "name"):
            return resource.name
        if qualifier_name == "owner_email":
            return getattr(resource, "owner_email", None)
        if qualifier_name == "location_id":
            return getattr(resource, "location_id", None)
        if qualifier_name == "location_name":
            return getattr(resource, "location_name", None)
        return None

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        property_name = property_name.lower()
        if property_name == "name":
            return [resource.name]
        value = getattr(resource, property_name, None)
        if value is not None:
            return [value]
        return None

    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        return {
            "workspace_resource": {
                "name": resource.name,
                "qualified_name": resource.qualified_name,
                "owner_email": getattr(resource, "owner_email", None),
                "location_id": getattr(resource, "location_id", None),
                "location_name": getattr(resource, "location_name", None),
            }
        }

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        return self.get_resource_qualifier_value(resource, variable_name)

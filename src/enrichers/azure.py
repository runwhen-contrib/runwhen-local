from typing import Any, Optional

from component import Context
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import PlatformHandler, LevelOfDetail
import logging
logger = logging.getLogger(__name__)


AZURE_PLATFORM = "azure"


def get_resource_group(resource: Resource) -> Optional[Resource]:
    # If resource itself is of type "resource_group", return it
    if resource.resource_type.name == "resource_group":
        return resource

    # Try accessing the resource_group attribute directly
    resource_group = getattr(resource, "resource_group", None)
    if resource_group is not None:
        return resource_group
    
    # Check for nested attributes or other ways to resolve the resource group
    # This might be specific to certain resource types; customize as needed
    if hasattr(resource, "parent"):
        parent = resource.parent
        if parent and parent.resource_type.name == "resource_group":
            return parent
    
    # Log a warning if resource group cannot be resolved
    logger.warning(f"Resource group not found for resource: {resource.resource_type.name}")
    return None


class AzurePlatformHandler(PlatformHandler):

    def __init__(self):
        super().__init__(AZURE_PLATFORM)

    #     return name, qualified_name, resource_attributes
    def parse_resource_data(
        self,
        resource_data: dict[str, Any],
        resource_type_name: str,
        platform_config_data: dict[str, Any],
        context: Context,
    ) -> tuple[str, str, dict[str, Any]]:

        name: str = resource_data["name"]
        qualified_name = name
        tags = resource_data.get("tags", {})
        resource_attributes = {"tags": tags}

        # keep subscription_id for per-sub LOD
        subscription_id = resource_data.get("subscription_id")
        if subscription_id:
            resource_attributes["subscription_id"] = subscription_id

        if resource_type_name == "resource_group":
                    # nested map built in init_cloudquery_config
                    sub_map = (
                        platform_config_data
                        .get("subscriptionResourceGroupLevelOfDetails", {})
                        .get(subscription_id, {})
                    )
                    global_rg_map = platform_config_data.get("resourceGroupLevelOfDetails", {})

                    lod_value = (
                        sub_map.get(name)      # 1. explicit RG override
                        or sub_map.get("*")    # 2. per-subscription default
                        or global_rg_map.get(name)     # (3) legacy top-level RG
                        or global_rg_map.get("*")      # (4) legacy wildcard
                    )

                    resource_attributes["lod"] = (
                        LevelOfDetail.construct_from_config(lod_value)
                        if lod_value is not None
                        else context.get_setting("DEFAULT_LOD")   # 3. workspace default
                    )
        else:
            # ------------- unchanged block resolving parent RG ----------------
            id_val = resource_data.get("id", "")
            rg_marker = "resourcegroups/"
            start = id_val.lower().find(rg_marker)
            if start >= 0:
                start += len(rg_marker)
                end = id_val.find("/", start)
                if end > start:
                    rg_name = id_val[start:end]
                    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
                    rg_type = registry.lookup_resource_type(AZURE_PLATFORM, "resource_group")
                    if rg_type:
                        for rg in rg_type.instances.values():
                            if rg.name.upper() == rg_name.upper():
                                resource_attributes["resource_group"] = rg
                                qualified_name = f"{rg.name}/{name}"
                                break

        return name, qualified_name, resource_attributes


    def get_level_of_detail(self, resource: Resource) -> LevelOfDetail:
        resource_group = get_resource_group(resource)
        if not resource_group:
            # If no resource group, return DEFAULT_LOD from context settings.
            return LevelOfDetail.DETAILED  # Or LevelOfDetail.BASIC, as per the default you'd like
        
        # Fetch level_of_detail from resource group, or fallback to DEFAULT_LOD
        level_of_detail = getattr(resource_group, 'lod', None)
        if level_of_detail is None:
            return LevelOfDetail.DETAILED  # Replace with context.get_setting("DEFAULT_LOD") if accessible here
        return level_of_detail


    @staticmethod
    def get_common_resource_property_values(resource: Resource, qualifier_name: str) -> Optional[str]:
        if qualifier_name == "resource_group":
            resource_group = get_resource_group(resource)
            if resource_group is not None:
                return resource_group.name
            else:
                # Handle case when resource_group is None
                return None
        else:
            # Log or raise an error if qualifier is unknown, or simply return None
            return None


    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        return self.get_common_resource_property_values(resource, qualifier_name)

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        property_name = property_name.lower()
        tags = getattr(resource, "tags")
        if property_name == "tags":
            return list(tags.keys()) + list(tags.values())
        elif property_name == "tag-keys":
            return list(tags.keys())
        elif property_name == "tag-values":
            return list(tags.values())
        else:
            # Note, the property value may be a path within the
            return None

    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        template_variables = dict()
        resource_group = get_resource_group(resource)
        if resource_group:
            template_variables['resource_group'] = resource_group
        return template_variables

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        return self.get_common_resource_property_values(resource, variable_name)



from typing import Any, Optional

from component import Context
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import PlatformHandler, LevelOfDetail
import logging

# Initialize the logger for this module
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

    def parse_resource_data(self,
                            resource_data: dict[str, Any],
                            resource_type_name: str,
                            platform_config_data: dict[str, Any],
                            context: Context) -> tuple[str, str, dict[str, Any]]:
        # FIXME: This assumes that all Azure tables have name and id fields/attributes.
        # Seems likely, but not 100% sure this is a valid assumption.
        name: str = resource_data['name']
        qualified_name = name
        tags = resource_data.get('tags', dict())
        resource_attributes = {'tags': tags}

        # Check if subscription_id is part of resource_data and add it to attributes if available
        subscription_id = resource_data.get('subscription_id')
        if subscription_id:
            resource_attributes['subscription_id'] = subscription_id
            logger.info(f"Resource '{name}' includes subscription_id: {subscription_id}")
        else:
            logger.warning(f"Resource '{name}' does not contain subscription_id in data.")


        if resource_type_name == "resource_group":
            # Set the 'lod' (level-of-detail) resource attribute from the per-resource-group
            # setting in the Azure cloud config or set to the default value if it's unspecified
            # FIXME: It's a bit kludgy to have the level of detail setting in the resource,
            # since that's really a generation rules feature, not an indexing feature.
            # Although we do currently use it in kubeapi to optimize the indexing to skip indexing
            # namespaces whose level-of-detail is "none". But I still think it would be
            # cleaner to not have any LOD setting logic in the indexers and just use it
            # internally in the generation rules module. There could be some other mechanism
            # to disable indexing for particular namespaces / resource groups in the indexers.
            # In any case, we want to skip the else logic here that tries to extract
            # the parent resource group of the resource since that doesn't make sense
            # for the resource group itself (unless Azure supports nested resource
            # groups? but I don't think it does).
            resource_group_level_of_detail_config = platform_config_data.get("resourceGroupLevelOfDetails", dict())
            resource_group_lod_value = resource_group_level_of_detail_config.get(name)
            # FIXME: Not great maintenance-wise to lookup setting values by the setting name here.
            # Would be better to lookup by the actual Setting class singleton (which is not supported
            # by the get_setting method). Unfortunately, currently, if we try to use the default LOD
            # setting it leads to a module import circularity, so some cleanup/refactoring of
            # where the settings are defined is needed to get that to work. So for the time being
            # we still use the hard-coded name :-(
            resource_attributes['lod'] = LevelOfDetail.construct_from_config(resource_group_lod_value) \
                if resource_group_lod_value is not None else context.get_setting("DEFAULT_LOD")
        else:
            # Updated to handle lowercase 'resourcegroups' in ID extraction logic
            id: str = resource_data.get('id', '')
            resource_groups_component_name = "resourcegroups/"
            resource_group_start = id.lower().find(resource_groups_component_name)  # Case-insensitive match
            
            if resource_group_start >= 0:
                resource_group_start += len(resource_groups_component_name)
                resource_group_end = id.find('/', resource_group_start)
                if resource_group_end > resource_group_start:
                    resource_group_name = id[resource_group_start:resource_group_end]
                    # Unfortunately the resource group name that's encoded in the id value has
                    # been converted to all upper-case, so its name doesn't match the key value
                    # in the instances for the ResourceGroup resource type. So instead we need to
                    # iterate over all the instances and do a case-insensitive comparison. Ugh!
                    # Should think some more if there's a better / more efficient way to handle
                    # this. AFAICT, there's no info in the resource attributes from which to
                    # obtain the original, unconverted resource group, so instead would presumably
                    # need to do some custom indexing of the resource groups where the key is
                    # the upper-case version of the name and then use that for the duration of
                    # the indexing process. We sort of do this already for the custom Kubernetes
                    # index (where we maintain a dictionary of the discovered namespaces).
                    # But I'm not sure in practice we're going to have cases where there are a
                    # ton of resource groups (at least not right away) where this would be a
                    # big scalability concern. Famous last words...
                    # NB: Note that this logic assumes that the resource groups are indexed
                    # first, so it should always be the first entry in the resource types
                    # array for the CloudQuery platform spec.
                    # FIXME: Ideally wouldn't hard-code/duplicate the "resource_group" name here
                    # but would instead define it once (not sure where makes the most sense?).
                    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
                    resource_group_resource_type = registry.lookup_resource_type(AZURE_PLATFORM, "resource_group")
                    
                    if resource_group_resource_type:
                        # Try to find the original casing by iterating over resource group instances
                        for resource_group in resource_group_resource_type.instances.values():
                            if resource_group.name.upper() == resource_group_name.upper():
                                # Switch the resource group name back to the original name,
                                # instead of the all-upper-case version.
                                resource_group_name = resource_group.name
                                resource_attributes['resource_group'] = resource_group
                                break
                    qualified_name = f"{resource_group_name}/{name}"

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



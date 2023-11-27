from typing import Any, Sequence

from component import Context
from resources import Resource, ResourceType, ResourceTypeSpec, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import LevelOfDetail, PlatformHandler

AZURE_PLATFORM = "azure"

class AzurePlatformHandler(PlatformHandler):

    def __init__(self):
        super().__init__(AZURE_PLATFORM)

    def process_resource_attributes(self,
                                    resource_attributes: dict[str,Any],
                                    resource_type_name: str,
                                    registry: Registry) -> tuple[str, str]:
        # FIXME: This assumes that all Azure tables have name and id fields/attributes.
        # Seems likely, but not 100% sure this is a valid assumption.
        name: str = resource_attributes['name']
        qualified_name = name
        if resource_type_name == "ResourceGroup":
            # FIXME: Add level-of-detail logic here to set a 'lod' field based on a
            # user-specified resourceGroupLODs configuration setting keyed by the
            # resource group name, modeled on what we currently do with Kubernetes
            # namespace resources. Or, alternatively, should possibly get rid of any
            # LOD handling by the indexing logic.
            # In any case, we want to skip the else logic here that tries to extract
            # the parent resource group of the resource since that doesn't make sense
            # for the resource group itself (unless Azure supports nested resource
            # groups? but I don't think it does).
            pass
        else:
            id: str = resource_attributes['id']
            resource_groups_component_name = "resourceGroups/"
            resource_group_start = id.find(resource_groups_component_name)
            if resource_group_start >= 0:
                resource_group_start += len(resource_groups_component_name)
                resource_group_end = id.find('/', resource_group_start)
                if resource_group_end > resource_group_start:
                    resource_group_name = id[resource_group_start:resource_group_end]
                    # Unfortunately the resource group name that's encoded in the id value has
                    # been converted to all upper-case, so it's name doesn't match the key value
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
                    # FIXME: Ideally wouldn't hard-code/duplicate the "ResourceGroup" name here
                    # but would instead define it once (not sure where makes the most sense?).
                    resource_group_resource_type = registry.lookup_resource_type(AZURE_PLATFORM, "ResourceGroup")
                    if resource_group_resource_type:
                        for resource_group in resource_group_resource_type.instances.values():
                            if resource_group.name.upper() == resource_group_name.upper():
                                # Switch the resource group name back to the original name,
                                # instead of the all-upper-case version.
                                resource_group_name = resource_group.name
                                resource_attributes['resource_group'] = resource_group
                                break
                    qualified_name = f"{resource_group_name}/{name}"

        # Slightly kludgy to modify the input attributes and return them as the attributes,
        # but this works with the existing CloudQuery indexer and is unlikely to change and
        # save the cost of making a copy of the attributes.
        del resource_attributes['name']
        return name, qualified_name

    # TODO: Override other methods (e.g. get_resource_property_values, add_template_variables)
    # to handle Azure-specific logic. Probably, minimally, should handle Azure tags similar to the
    # way we handle Kubernetes labels/annotations. Also, research what the Azure equivalent of a
    # Kubernetes namespace is and support that as a built-in template variable.

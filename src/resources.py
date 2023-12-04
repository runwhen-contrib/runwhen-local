from dataclasses import dataclass
from enum import Enum
from typing import Union

from exceptions import WorkspaceBuilderException
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


# Platform name to use for built-in resource types, e.g. workspace
# TODO: Possibly makes sense to not treat the workspace as a resource that's
# stored in the resource registry and instead consider it as a separate entity
# that is basically a parent/owner of the resource registry. I think that
# makes sense at least in the context of the workspace builder, but possibly
# not in the context of thinking of the resource discovery/registration
# process as a separate component. Needs more thought...
RUNWHEN_PLATFORM = "runwhen"
REGISTRY_PROPERTY_NAME = "registry"

class RunWhenResourceType(Enum):
    WORKSPACE = "workspace"


class Resource:
    name: str
    qualified_name: str
    resource_type: "ResourceType"

    def __init__(self,
                 name: str,
                 qualified_name: str,
                 resource_type: "ResourceType",
                 attributes: Optional[dict[str, Any]]):
        self.name = name
        self.qualified_name = qualified_name
        self.resource_type = resource_type
        if attributes:
            self.set_attributes(attributes)

    def set_attributes(self, attributes: dict[str, Any]):
        for key, value in attributes.items():
            setattr(self, key, value)

class ResourceType:
    name: str
    platform: "Platform"
    instances: dict[str, Resource]

    def __init__(self, name: str, platform: "Platform"):
        self.name = name
        self.platform = platform
        self.instances = dict()


class Platform:
    name: str
    resource_types: dict[str, ResourceType]

    def __init__(self, name: str):
        self.name = name
        self.resource_types = dict()


@dataclass
class ResourceTypeSpec:
    """
    Specification of a resource type. This is basically just the combination of the
    resource type name qualified by the platform name, but has logic for parsing the
    info from either a string or a dict, which is used to handle the way the resource
    type is specified in the generation rules.

    This class can be subclassed for different platform in their PlatformHandler to
    include other attributes that only apply to that platform.
    """
    platform_name: str
    resource_type_name: str

    # def __init__(self, platform_name: str, resource_type_name: str):
    #     self.platform_name = platform_name
    #     self.resource_type_name = resource_type_name
    #
    # def __eq__(self, other):
    #     if not isinstance(other, ResourceTypeSpec):
    #         # don't attempt to compare against unrelated types
    #         return NotImplemented
    #     return self.platform_name == other.platform_name and self.resource_type_name == other.resource_type_name

    def get_resource_type_name(self):
        return self.resource_type_name

    @staticmethod
    def parse_resource_type_name(config: Union[str, dict[str, Any]]):
        """
        Parse the resource type name out of the resource type spec config.
        """
        if isinstance(config, str):
            separator_index = config.find(':')
            resource_type_name = config[separator_index+1:] if separator_index > 0 else config
        elif isinstance(config, dict):
            resource_type_name = config.get("resourceType")
        else:
            raise WorkspaceBuilderException(f'Unexpected type ("{type(config)}") for ResourceTypeSpec; '
                                            f'expected str or dict.')
        return resource_type_name

    @staticmethod
    def parse_platform_name(config: Union[str, dict[str, Any]],
                            default_platform_name: str) -> tuple[str, Union[str, dict[str, Any]]]:
        if isinstance(config, str):
            separator_index = config.find(':')
            if separator_index > 0:
                platform_name = config[:separator_index]
                remaining_config = config[separator_index+1:]
            else:
                platform_name = default_platform_name
                remaining_config = config
        elif isinstance(config, dict):
            platform_name = config.get('platform', default_platform_name)
            remaining_config = config
        else:
            raise WorkspaceBuilderException(f'Unexpected type ("{type(config)}") for ResourceTypeSpec; '
                                            f'expected str or dict.')
        return platform_name, remaining_config

    @staticmethod
    def construct_from_config(config: Union[str, dict[str, Any]], default_platform_name: str) -> "ResourceTypeSpec":
        """
        Construct a ResourceTypeSpec from configuration in a generation rule.
        The spec can be either a string or a dict. If it's a string, the expected format
        is "kind.group/version", e.g. "workspaces.runwhen.com/v1".
        The kind field is the lower-case plural form of the kind.
        The version can be omitted (along with the slash), which maps to matching all available versions.
        :param config:
        :param default_platform_name:
        :return:
        """
        platform_name, remaining_config = ResourceTypeSpec.parse_platform_name(config, default_platform_name)
        if isinstance(remaining_config, str):
            resource_type_name = remaining_config
        elif isinstance(remaining_config, dict):
            resource_type_name = config.get("resourceType")
            if not resource_type_name:
                raise WorkspaceBuilderException(f'Resource type spec must specify a "resourceType" field')
        else:
            raise WorkspaceBuilderException(f'Unexpected type ("{type(config)}") for ResourceTypeSpec config; '
                                            f'expected str or dict.')
        return ResourceTypeSpec(platform_name, resource_type_name)


class Registry:
    """
    A registry of the resources that have been discovered/indexed across multiple
    cloud platforms.

    FIXME: The current implementation isn't thread-safe and would cause problems
    if there were current requests operating on the same registry, at least if
    there were requests that were making updates to the registry (e.g.
    incremental indexing support) while others were accessing the contents.
    Currently, this isn't a problem, because the registry is rebuilt for each
    new request and isn't accessed out the scope of that (single-threaded)
    request. But if we eventually make the indexing/registration process
    more stateful with support incremental updates, and add methods for other
    clients to access the resource contents, then we'll need to think
    through the thread-safety issues.
    """
    platforms: dict[str, Platform]

    def __init__(self):
        self.platforms = dict()

    @staticmethod
    def check_resource_type_is_string(resource_type_name):
        # FIXME: This is a debugging sanity check. Can remove eventually
        if type(resource_type_name) != str:
            raise WorkspaceBuilderException(f"Expected string value for resource type name, got {type(resource_type_name)} instead.")

    def add_resource(self,
                     platform_name: str,
                     resource_type_name: str,
                     resource_name: str,
                     resource_qualified_name: str,
                     resource_attributes: dict[str, Any]) -> Resource:
        """
        Add a new resource to the registry.

        Note: The specified dict of field names/value is added directly to the registry's
        internal data structure, so the registry assumes ownership of it and the caller
        shouldn't make any subsequent modifications to it.
        """
        self.check_resource_type_is_string(resource_type_name)
        platform = self.platforms.get(platform_name)
        if not platform:
            platform = Platform(platform_name)
            self.platforms[platform_name] = platform
        resource_type = platform.resource_types.get(resource_type_name)
        if not resource_type:
            resource_type = ResourceType(resource_type_name, platform)
            platform.resource_types[resource_type_name] = resource_type
        # Check if there's an existing resource with the same qualified name.
        # This could happen if an indexer might make multiple passes over
        # the same set of resources, e.g. Kubernetes scanning a cluster multiple
        # time because the kubeconfig has multiple context for the same cluster,
        # but presumably with different user credentials.
        # NB: We don't want to replace the existing resource with a new resource,
        # because then there might be other resources that reference the
        # existing resource, and we don't want to have reference an orphaned
        # resource. This probably wouldn't cause problems with the existing
        # way the workspace builder works, but it seems like it's asking for
        # subtle problems as the code evolves.
        resource = resource_type.instances.get(resource_qualified_name)
        if resource:
            logger.debug(f"Updating existing resource with name {resource_qualified_name}")
            if resource_attributes:
                resource.set_attributes(resource_attributes)
        else:
            resource = Resource(resource_name, resource_qualified_name, resource_type, resource_attributes)
            resource_type.instances[resource_qualified_name] = resource
        return resource

    def lookup_resource(self,
                        platform_name: str,
                        resource_type_name: str,
                        resource_qualified_name: str) -> Optional[Resource]:
        """
        Lookup a Resource instance with the specified platform/namespace/resource-type
        """
        self.check_resource_type_is_string(resource_type_name)
        resource_type = self.lookup_resource_type(platform_name, resource_type_name)
        return resource_type.instances.get(resource_qualified_name) if resource_type else None

    def lookup_resource_type(self,
                              platform_name: str,
                              resource_type_name: str) -> Optional[ResourceType]:
        """
        Lookup a ResourceType object with the specified platform/namespace
        """
        self.check_resource_type_is_string(resource_type_name)
        platform = self.platforms.get(platform_name)
        return platform.resource_types.get(resource_type_name) if platform else None

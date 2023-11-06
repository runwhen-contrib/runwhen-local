from enum import Enum
from exceptions import WorkspaceBuilderException
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

# @dataclass
# class Resource:
#     name: str
#     resource_type: "ResourceType"
#     fields: dict[str, Any]
#
#
# @dataclass
# class ResourceType:
#     name: str
#     namespace: "Namespace"
#     instances: dict[str, Resource]
#
#
# @dataclass
# class Namespace:
#     name: str
#     platform: "Platform"
#     resource_types: dict[str, ResourceType]
#
#
# @dataclass
# class Platform:
#     name: str
#     namespaces: dict[str, Namespace]
#
#
# class Registry:
#     """
#     A resource registry is a simple in-memory map of discovered/indexed resources.
#     It models a platform/namespace/resource-type/resource-name hierarchy, which
#     is mostly modeled from Kubernetes, but I think it should be flexible enough to
#     handle other platforms too. For platforms that don't have namespaces there
#     can be just a single "default" namespace. The current implementation doesn't
#     try to model Kubernetes hierarchical namespaces, but that could be added if it
#     proves necessary.
#
#     The data structure that maintains the resource is organized in several
#     levels. At the top level there is a dictionary that maps from a platform
#     name to the registered resources for that platform. A platform in this
#     case refers to a cloud platform from which the resources were discovered,
#     e.g. Kubernetes, AWS, Azure, etc. At the next level, a platform has namespaces
#     where each namespace provides a scope for resource types and resources.
#     At the next level the resources are groups by the type of the resource,
#     where the types are platform-specific. For example, Kubernetes has namespaces,
#     services, deployments, etc. while Azure has virtual machines, load balancers, etc.
#     At the next level the resource instances are indexed by the name of the resource.
#     Finally, the resource itself is represented as a dict of field names/values.
#
#     The resource registry is very loosely typed. The set of platforms,
#     resource types, and field names is purely determined by the
#     indexing components that populate the registry. The only
#     structural requirement is that the resources have a name that is
#     unique within the scope of a platform and resource type, i.e.
#     a <platform,resource-type,name> tuple must be unique across the
#     entire registry.
#
#     Currently, the implementation is super simple to support the current
#     operational model of the workspace builder, i.e. indexing from scratch
#     every time. So it doesn't support things like deleting resources or
#     doing incremental updates of the resource registry.
#     """
#     platforms: dict[str, Platform]
#
#     def __init__(self):
#         self.registry_map = dict()
#
#     def add_resource(self,
#                      platform_name: str,
#                      namespace_name: str,
#                      resource_type_name: str,
#                      resource_name: str,
#                      resource_fields: dict[str, Any]):
#         """
#         Add a new resource to the registry.
#
#         Note: The specified dict of field names/value is added directly to the registry's
#         internal data structure, so the registry assumes ownership of it and the caller
#         shouldn't make any subsequent modifications to it.
#         """
#         platform = self.platforms.get(platform_name)
#         if not platform:
#             platform = Platform(platform_name, dict())
#             self.platforms[platform_name] = platform
#         namespace = platform.namespaces.get(namespace_name)
#         if not namespace:
#             namespace = Namespace(namespace_name, platform, dict())
#             platform.namespaces[namespace_name] = namespace
#         resource_type = namespace.resource_types.get(resource_type_name)
#         if not resource_type:
#             resource_type = ResourceType(resource_type_name, namespace, dict())
#             namespace.resource_types[resource_type_name] = resource_type
#         resource = Resource(resource_name, resource_type, resource_fields)
#         resource_type.instances[resource_name] = resource
#
#     def lookup_resource(self,
#                         platform_name: str,
#                         namespace_name: str,
#                         resource_type_name: str,
#                         resource_name: str) -> Optional[Resource]:
#         """
#         Lookup a Resource instance with the specified platform/namespace/resource-type
#         """
#         resource_type = self.lookup_resources_type(platform_name, namespace_name, resource_type_name)
#         if not resource_type:
#             return None
#         return resource_type.instances.get(resource_name)
#
#     def lookup_resources_type(self,
#                               platform_name: str,
#                               namespace_name: str,
#                               resource_type_name: str) -> Optional[ResourceType]:
#         """
#         Lookup a ResourceType object with the specified platform/namespace
#         """
#         platform = self.platforms.get(platform_name)
#         if not platform:
#             return None
#         namespace = platform.namespaces.get(namespace_name)
#         if not namespace:
#             return None
#         return namespace.resource_types.get(resource_type_name)


# Platform name to use for built-in resource types, e.g. workspace
# TODO: Possibly makes sense to not treat the workspace as a resource that's
# stored in the resource registry and instead consider it as a separate entity
# that is basically a parent/owner of the resource registry. I think that
# makes sense at least in the context of the workspace builder, but possibly
# not in the context of thinking of the resource discovery/registration
# process as a separate component. Needs more thought...
RUNWHEN_PLATFORM = "runwhen"

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


class Registry:
    """
    A registry of the resources that have been discovered/indexed across multiple
    cloud platforms.
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
        # This could happen if an indexer might make multiple passes over the
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

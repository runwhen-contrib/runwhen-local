from dataclasses import dataclass
import datetime
from enum import Enum
from typing import Union

import yaml

from exceptions import WorkspaceBuilderException, WorkspaceBuilderUserException
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

CURRENT_DUMP_FORMAT_VERSION = 2

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
    resource_type: Optional["ResourceType"]

    def __init__(self,
                 name: str,
                 qualified_name: str,
                 resource_type: Optional["ResourceType"],
                 **kw):
        self.name = name
        self.qualified_name = qualified_name
        self.resource_type = resource_type
        if kw:
            self.set_attributes(kw)

    def set_attributes(self, attributes: dict[str, Any]):
        for key, value in attributes.items():
            setattr(self, key, value)


class ResourceType:
    name: str
    platform: Optional["Platform"]
    instances: dict[str, Resource]
    custom_attributes: set[str]

    def __init__(self, name: str, platform: Optional["Platform"], custom_attributes=None, instances=None):
        self.name = name
        self.platform = platform
        # The custom attributes will be dynamically updated as resources are added
        # based on the custom attributes in the resource instance. This isn't super
        # efficient since we update the custom attributes for each newly-added
        # resource, even though they will typically always be the same. But this
        # makes things a little easier to maintain, since there doesn't need to
        # be some one-time initialization step that needs to know the complete
        # set of custom attributes for each resource type. This can be revisited
        # if this turns out to be a problem, but I'm pretty sure it'll be fine.
        if custom_attributes is None:
            custom_attributes = set()
        self.custom_attributes = custom_attributes
        if instances is None:
            instances = dict()
        self.instances = instances

    def update_custom_attributes(self, custom_attributes: set[str]):
        self.custom_attributes.update(custom_attributes)


class Platform:
    name: str
    resource_types: dict[str, ResourceType]

    def __init__(self, name: str, resource_types: dict[str, ResourceType]=None):
        self.name = name
        if resource_types is None:
            resource_types = dict()
        self.resource_types = resource_types


@dataclass(unsafe_hash=True)
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

    def __init__(self, platforms=None):
        if not platforms:
            platforms = dict()
        self.platforms = platforms


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
        custom_attributes = set(resource_attributes.keys())
        resource_type.update_custom_attributes(custom_attributes)
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
            # NB: The resource attributes from the different cloud platform indexers
            # in some cases currently contains attributes that duplicate the built-in
            # name, qualified_name and resource_type attributes. This was causing a
            # function parameter clash between the explicit first few positional args
            # and the keyword args. I fixed this by just turning everything into
            # keyword args, at least from the calling perspective, and having the
            # explicit name, qualified_name, and resource_type values override any
            # duplicate setting in the resource attributes from the indexer.
            # It would probably be ok to just update the resource_arguments
            # argument in place rather than making a copy, but it seemed like
            # bad form from the caller's perspective to have the called function
            # modify the input argument, so I make a copy here just to be safe.
            # TODO: It might be better/cleaner to clean up the indexer code to not
            # populate any of the duplicate values in the resource_attributes
            # argument, but OTOH that would require the indexer to know which
            # attribute names it needs to avoid, which is sort of a funky
            # contract between it and this resource code, so I'm not 100% sure
            # that approach would actually be better. But worth thinking about
            # some more at some point.
            all_resource_attributes = resource_attributes.copy()
            all_resource_attributes['name'] = resource_name
            all_resource_attributes['qualified_name'] = resource_qualified_name
            all_resource_attributes['resource_type'] = resource_type
            try:
                resource = Resource(**all_resource_attributes)
            except Exception as e:
                raise e
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

    def dump(self) -> str:
        text = yaml.safe_dump(self)
        return text

    @staticmethod
    def load(data) -> "Registry":
        registry = yaml.safe_load(data)
        return registry


RESOURCE_YAML_TAG = "!Resource"
RESOURCE_TYPE_YAML_TAG = "!ResourceType"
PLATFORM_YAML_TAG = "!Platform"
REGISTRY_YAML_TAG = "!Registry"


def resource_representer(dumper: yaml.representer.Representer, resource: "Resource"):
    resource_type = resource.resource_type
    mapping = {
        "name": resource.name,
        "qualified_name": resource.qualified_name,
    }
    for attribute in resource_type.custom_attributes:
        try:
            value = getattr(resource, attribute)
            mapping[attribute] = value
        except AttributeError:
            pass
    node = dumper.represent_mapping(RESOURCE_YAML_TAG, mapping)
    return node


def resource_constructor(constructor, node):
    mapping = constructor.construct_mapping(node, True)
    mapping['resource_type'] = None
    resource = Resource(**mapping)
    return resource

def resource_type_representer(dumper: yaml.representer.Representer, resource_type):
    mapping = {
        "name": resource_type.name,
        "instances": resource_type.instances,
        "customAttributes": list(resource_type.custom_attributes),
    }
    node = dumper.represent_mapping(RESOURCE_TYPE_YAML_TAG, mapping)
    return node

def resource_type_constructor(constructor, node):
    mapping = constructor.construct_mapping(node, True)
    name = mapping.get('name')
    platform = None
    custom_attributes_list = mapping.get('customAttributes')
    custom_attributes = set(custom_attributes_list)
    instances = mapping.get('instances')
    resource_type = ResourceType(name, platform, custom_attributes, instances)
    if instances:
        for resource in instances.values():
            resource.resource_type = resource_type
    return resource_type

def platform_representer(dumper, platform):
    mapping = {
        "name": platform.name,
        "resourceTypes": platform.resource_types,
    }
    node = dumper.represent_mapping(PLATFORM_YAML_TAG, mapping)
    return node

def platform_constructor(constructor, node):
    mapping = constructor.construct_mapping(node, True)
    name = mapping.get('name')
    resource_types = mapping.get('resourceTypes')
    platform = Platform(name, resource_types)
    for resource_type in resource_types.values():
        resource_type.platform = platform
    return platform

def registry_representer(dumper, registry):
    mapping = {
        "version": CURRENT_DUMP_FORMAT_VERSION,
        "creationDate": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "description": "Dump of the resources collected during a run of the workspace builder tool",
        "platforms": registry.platforms,
    }
    node = dumper.represent_mapping(REGISTRY_YAML_TAG, mapping)
    return node

def registry_constructor(constructor, node):
    mapping = constructor.construct_mapping(node, True)
    # Do some simple version checking to make sure the resource dump is in a format
    # that we'll be able to deserialize. Currently, this is super simple and only
    # supports loading a resource dump with the same exact version as the current
    # resource dump version of this version of the workspace builder.
    # TODO: In the future if/when we make changes to the resource dump format
    # ideally we should have conversion code here to support loading older resource
    # dumps. Although, since this is really a developer-facing feature it's
    # probably acceptable to keep this current simple exact version match approach.
    version = mapping.get('version')
    if not version:
        raise WorkspaceBuilderUserException("Invalid format for resource dump file.")
    if version < CURRENT_DUMP_FORMAT_VERSION:
        raise WorkspaceBuilderUserException("Resource dump file is in an unsupported older format. "
                                            "The resource dump needs to be recreated with the current "
                                            "workspace builder version")
    if version > CURRENT_DUMP_FORMAT_VERSION:
        raise WorkspaceBuilderUserException("Resource dump file is in an unsupported newer format. "
                                            "Older versions of the workspace builder can't load dumps "
                                            "created with newer versions, so the resource dump needs "
                                            "to be recreated with the current version.")
    platforms = mapping['platforms']
    return Registry(platforms)

yaml.SafeDumper.add_representer(Resource, resource_representer)
yaml.SafeDumper.add_representer(ResourceType, resource_type_representer)
yaml.SafeDumper.add_representer(Platform, platform_representer)
yaml.SafeDumper.add_representer(Registry, registry_representer)
yaml.SafeLoader.add_constructor(RESOURCE_YAML_TAG, resource_constructor)
yaml.SafeLoader.add_constructor(RESOURCE_TYPE_YAML_TAG, resource_type_constructor)
yaml.SafeLoader.add_constructor(PLATFORM_YAML_TAG, platform_constructor)
yaml.SafeLoader.add_constructor(REGISTRY_YAML_TAG, registry_constructor)
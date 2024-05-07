from enum import Enum
from typing import Any, Optional, Sequence, Union
import yaml

from component import Context
from exceptions import WorkspaceBuilderException
from resources import Resource, ResourceTypeSpec, Registry, REGISTRY_PROPERTY_NAME

PLATFORM_HANDLERS_PROPERTY_NAME = "platform-handlers"

# The value of this is a dict whose key is platform names and value is a set of resource type names
RESOURCE_TYPE_SPECS_PROPERTY = "resource-type-specs"

class LevelOfDetail(Enum):
    """
    A setting that is used to control how much information to generate.
    Each generation rule has a level of detail value (not NONE). The user
    specifies a default level of detail value, plus (optional) overrides
    on a platform-dependent basic (e.g. per-namespace for Kubernetes).
    If the matching resource for a gen rule has a LOD value that's
    greater than or equal to the LOD value for the gen rule, then the
    gen rule is enabled.
    """
    NONE = 0
    BASIC = 1
    DETAILED = 2

    @staticmethod
    def construct_from_config(config: Any) -> "LevelOfDetail":
        try:
            if isinstance(config, int):
                return LevelOfDetail(config)
            elif isinstance(config, str):
                return LevelOfDetail[config.upper()]
        except (ValueError, KeyError):
            pass
        # FIXME: I think this should probably be a WorkspaceBuilderUserException, since
        # this would most likely be the result of someone using an incorrect value in
        # their workspace info data and thus would be user error. I guess it could also
        # come from a value in a gen rule for a code bundle, but presumably that should
        # get caught by the code bundle author and not be something that normal end
        # users would see. But, anyway, I need to think about it some more and would
        # need more testing for regressions, although I think it would just work.
        raise WorkspaceBuilderException(f"Invalid level of detail value: {config}")

# FIXME: It feels a bit kludgy to me to do the LevelOfDetail YAML serialization/deserialization
# this way by setting shared class properties of the yaml module. I made an attempt
# to do it with to_yaml and from_yaml class_method, but I couldn't get it to work.
# Also, there was some comment on the pyyaml repo that they had fixed a bug to enable
# automatic/built-in serialization support for enum subclasses, but it wasn't working
# for me. Maybe need to use a newer version of pyyaml? Also, should check if ruamel
# has cleaned up the way this works and maybe switch to that. Anyway, this is what
# I got to work for now.

LEVEL_OF_DETAIL_TAG = "!LevelOfDetail"

def level_of_detail_representer(dumper: yaml.SafeDumper, level_of_detail: LevelOfDetail) -> yaml.nodes.ScalarNode:
    return dumper.represent_scalar(LEVEL_OF_DETAIL_TAG, level_of_detail.name)

def level_of_detail_constructor(loader: yaml.SafeLoader, node: yaml.nodes.ScalarNode) -> LevelOfDetail:
    name = loader.construct_scalar(node)
    return LevelOfDetail[name]

# FIXME: Should possibly set this on the unsafe versions too?
# We don't use those currently, but there might be a case where we need them in the future.
yaml.SafeDumper.add_representer(LevelOfDetail, level_of_detail_representer)
yaml.SafeLoader.add_constructor(LEVEL_OF_DETAIL_TAG, level_of_detail_constructor)

class PlatformHandler:
    """
    This is the class/interface that's called by the generation rules code to handle
    any platform-specific logic, so that the generic generation rules code does not
    have any dependencies on any specific platform. This was created as a pretty
    direct refactoring of the code that existed in the initial version that only
    supported Kubernetes and had lots of Kubernetes dependencies in the
    generation rules code. There's a certain amount of redundancy in the methods
    that are defined that could probably be cleaned up with another pass over the
    code.

    Also, initially this was only called by the generation rules code, but the
    CloudQuery indexer also needed to have some platform-specific logic to handle
    certain indexing features. Instead of having a completely separate platform
    handler mechanism for the indexing those methods were just rolled into this
    class. That does make things a little kludgy, though, because it means this
    is used from both the indexer and enricher (generation rules) phases of the
    workspace builder execution. For historical reasons this code is in the
    enricher directory, but that's sort of arbitrary.

    TODO: Should give some more thought to how the code is organized and
    whether the overlap between the indexer and enricher phases is enough of a
    problem that it would justify the complexity of having parallel platform
    handler classes for the different phases. Probably not, at least at this point.
    """
    name: str

    def __init__(self, name: str):
        self.name = name

    def construct_resource_type_spec(self, config: Union[str, dict[str, Any]]) -> ResourceTypeSpec:
        return ResourceTypeSpec.construct_from_config(config, self.name)

    def transform_cloud_config(self, cloud_config: dict[str, Any], cq_temp_dir: str) -> None:
        """
        This is called at the beginning of the CloudQuery indexer's index method
        for any platform handlers that have a settings block defined in cloudConfig.
        It gives the platform handler a chance to tweak the cloud config before the
        CloudQuery indexer begins its generic processing of the platform settings.
        The main use case of this currently is to do the conversion of inline file
        data in the cloud config to write the data to a temp file and replace the
        cloud config setting with the path to the temp file. This is necessary
        because settings in the cloud config are not handled like top-level
        settings are handled in the component framework, so there's no automatic
        handling of the file data like we get with top-level file-based settings.
        So if there's any file-based settings in the cloud config (e.g. Kubernetes
        kubeconfig, GCP app credentials file, etc.) then the file conversion
        should happen here.
        """
        # By default, don't do anything and just leave the cloud config unchanged
        pass

    def parse_resource_data(self,
                            resource_data: dict[str,Any],
                            resource_type_name: str,
                            platform_config_data: Optional[dict[str,Any]],
                            context: Context) -> tuple[str, str, dict[str, Any]]:
        """
        This is primarily for use by the CloudQuery indexer to handle the processing of the raw
        resource attributes obtained from CloudQuery to the data that's used to create the resource
        in the registry. The return value is a tuple of:
            (<resource-name>, <qualified-resource-name>, <resource-attributes>)
        """
        name = resource_data['name']
        return name, name, dict()

    def get_resources(self, resource_type_spec: ResourceTypeSpec, context: Context) -> Sequence[Resource]:
        """
        Implement any platform-specific logic to look up the resources of the specified
        type. In most cases this will just be looking up the resource type in the registry,
        and returning the instances (i.e. the default/generic implementation below),
        but if the resource type name encodes other information (e.g. Kubernetes custom
        resources), then this is where that info would be parsed and translated into lookup
        calls in the registry.
        """
        registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
        resource_type = registry.lookup_resource_type(self.name, resource_type_spec.resource_type_name)
        return resource_type.instances.values() if resource_type else list()

    def get_level_of_detail(self, resource: Resource) -> LevelOfDetail:
        """
        Return the level of detail associated with the specified resource. Platforms
        override this to implement whatever platform-specific logic they support, if any.
        The typical model is to provide level-of-detail customization based on whatever
        resource scoping is supported by the platform, e.g. Kubernetes namespaces.
        """
        return LevelOfDetail.DETAILED

    def get_resource_qualifier_value(self, resource: Resource, qualfifier_name: str) -> Optional[str]:
        return None

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        """
        Handle any special property values supported by the platform.
        For example, the Kubernetes platform supports special values to match against
        all the keys and/or values of the labels and/or annotations.
        If the given property name doesn't match any of the platform's special values,
        then the handler should return None. This platform handler doesn't need to
        handle resolution of attributes specified by a path from the root of the resource.
        That is handled by the platform-independent gen rules code.
        """
        return None

    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        """
        Add any platform-specific template variables to the dictionary that will be passed to jinja.
        Typically, this will be attributes derived from the resource that was matched (e.g. for
        Kubernetes, the namespace and cluster associated with the resource), but could also be
        other things like platform-specific methods that the template can invoke.
        Adding these standard/built-in template variables simplifies things for template authors,
        so they don't need to explicitly declare these common variables in generation rules.
        """
        return dict()

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        """
        Resolve a platform-specific custom/special value for a template variable.
        For example, the Kubernetes platform supports special values like "namespace"
        and "cluster" for the value derived from the matching resource, although this
        is sort of obsolete/unnecessary at this point (see FIXME not below).

        FIXME: I'm not sure this is really needed anymore. In the early version of the WB the
        idea was that all of the template variables used in the templates for a gen rule
        needed to be specified explicitly in the gen rule. But that turned out to be
        annoying for the gen rule developer, since there were a few common ones that were
        almost always added. So instead, now all of the common ones are just implicitly
        added via the add_resource_template_variables method (above). I guess in theory
        it's possible that there might be a platform handler that has a bunch of supported
        special template variable values and we don't want to add all of them for every
        gen rule, so this could be used to specify less common template variables, which
        would need to be specified explicitly in the gen rule. I'm guessing that's not
        use case we'll have in practice, though. But for now I'm not sure if there are
        any of our gen rules that are taking advantage of this mechanism and I don't want
        to break them, so I'll continue to support it for now. Should check with Shea
        and/or do an audit pass over our gen rules to see if anything is still using this.
        If not, I'll probably remove it just to simplify things.
        """
        return None
from enum import Enum
from typing import Any, Optional, Sequence, Union

from component import Context
from exceptions import WorkspaceBuilderException
from resources import Resource, ResourceTypeSpec, Registry, REGISTRY_PROPERTY_NAME

PLATFORM_HANDLERS_PROPERTY_NAME = "platform-handlers"

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
        raise WorkspaceBuilderException(f"Invalid level of detail value: {config}")


class PlatformHandler:

    name: str

    def __init__(self, name: str):
        self.name = name

    def construct_resource_type_spec(self, config: Union[str, dict[str, Any]]) -> ResourceTypeSpec:
        return ResourceTypeSpec.construct_from_config(config, self.name)

    def process_resource_attributes(self,
                                    resource_attributes: dict[str,Any],
                                    resource_type_name: str,
                                    registry: Registry) -> tuple[str, str]:
        """
        This is primarily for use by the CloudQuery indexer to handle the processing of the raw
        resource attributes obtained from CloudQuery to the data that's used to create the resource
        in the registry. The return value is a tuple of:
            (<resource-name>, <qualified-resource-name>, <resource-attributes>)
        """
        name = resource_attributes['name']
        del resource_attributes['name']
        return name, name

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

    def get_level_of_detail(self, resource: Resource):
        """
        Return the level of detail associated with the specified resource. Platforms
        override this to implement whatever platform-specific logic they support, if any.
        The typical model is to provide level-of-detail customization based on whatever
        resource scoping is supported by the platform, e.g. Kubernetes namespaces.
        """
        return LevelOfDetail.DETAILED

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

    def add_template_variables(self, resource: Resource, template_variables: dict[str, Any]) -> None:
        """
        Add any platform-specific template variables to the dictionary that will be passed to jinja.
        Typically, this will be attributes derived from the resource that was matched (e.g. for
        Kubernetes, the namespace and cluster associated with the resource), but could also be
        other things like platform-specific methods that the template can invoke.
        Adding these standard/built-in template variables simplifies things for template authors,
        so they don't need to explicitly declare these common variables in generation rules.
        """
        pass

    def resolve_template_variable_value(self, resource: Resource, template_value_str: str) -> Optional[Any]:
        """
        Resolve a platform-specific custom/special value for a template variable.
        For example, the Kubernetes platform supports special values like "namespace"
        and "cluster" for the value derived from the matching resource, although this
        is sort of obsolete/unncessary at this point (see FIXME not below).

        FIXME: Not sure this is really needed anymore. In the early version of the WB the
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
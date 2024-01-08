from dataclasses import dataclass
import logging
import os
import re
from typing import Any, Union, Optional, Sequence
import yaml

from component import Context, Setting, SettingDependency, WORKSPACE_NAME_SETTING, WORKSPACE_OUTPUT_PATH_SETTING
from exceptions import WorkspaceBuilderException
from indexers.kubetypes import KUBERNETES_PLATFORM
from name_utils import shorten_name, make_qualified_slx_name, make_slx_name
from .generation_rule_types import (
    PLATFORM_HANDLERS_PROPERTY_NAME,
    PlatformHandler,
    LevelOfDetail,
    RESOURCE_TYPE_SPECS_PROPERTY
)

from .kubernetes import KubernetesPlatformHandler
from .azure import AzurePlatformHandler, AZURE_PLATFORM
from .gcp import GCPPlatformHandler, GCP_PLATFORM
from renderers.render_output_items import OUTPUT_ITEMS_PROPERTY
from renderers.render_output_items import OutputItem as RendererOutputItem
from resources import (
    RUNWHEN_PLATFORM,
    RunWhenResourceType,
    Resource,
    Registry,
    ResourceTypeSpec,
    REGISTRY_PROPERTY_NAME
)
from template import render_template_string
from .code_collection import (
    GenerationRuleFileSpec,
    CodeCollection,
    get_request_code_collections,
    get_code_collection,
)
from .map_customization_rules import MapCustomizationRules, SLXInfo, RelationshipVerb
from .match_predicate import (
    MatchPredicate,
    AndMatchPredicate,
    StringMatchMode,
    base_construct_match_predicate_from_config,
    match_path,
    matches_pattern,
    Visitor as MatchPredicateVisitor
)

logger = logging.getLogger(__name__)

# Check for the environment variable and set the log level
if os.environ.get('DEBUG_LOGGING') == 'true':
    logger.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)

DOCUMENTATION = "Implements pattern-based rules for generating SLXs"

# FIXME: Not sure exactly where this belongs.
# It's currently set in the resources by the indexers but the resulting LOD value is used here in the enricher
# It probably shouldn't be included in the resource, in which case the indexers wouldn't need/use it.
DEFAULT_LOD_SETTING = Setting("DEFAULT_LOD",
                              "defaultLOD",
                              Setting.Type.ENUM,
                              "Default LOD setting to use for any namespaces not specified in NAMESPACE_LODS",
                              default_value=LevelOfDetail.DETAILED,
                              enum_class=LevelOfDetail,
                              enum_constructor=LevelOfDetail.construct_from_config)

MAP_CUSTOMIZATION_RULES_SETTING = Setting("MAP_CUSTOMIZATION_RULES",
                                          "mapCustomizationRules",
                                          Setting.Type.FILE,
                                          "Location of map customization rules file(s)")

CUSTOM_DEFINITIONS_SETTING = Setting("CUSTOM_DEFINITIONS",
                                     "customDefinitions",
                                     Setting.Type.DICT,
                                     "Custom variable definitions from client.")

PERSONAS_SETTING = Setting("PERSONAS",
                           "personas",
                           Setting.Type.DICT,
                           "Persona data used to initialize persona files")

CODE_COLLECTIONS_SETTING = Setting("CODE_COLLECTIONS",
                                   "codeCollections",
                                   Setting.Type.LIST,
                                   "List of information about which code collections "
                                   "to scan for generation rules")

SETTINGS = (
    SettingDependency(WORKSPACE_NAME_SETTING, True),
    SettingDependency(WORKSPACE_OUTPUT_PATH_SETTING, True),
    SettingDependency(DEFAULT_LOD_SETTING, False),
    SettingDependency(MAP_CUSTOMIZATION_RULES_SETTING, False),
    SettingDependency(CUSTOM_DEFINITIONS_SETTING, False),
    SettingDependency(PERSONAS_SETTING, False),
    SettingDependency(CODE_COLLECTIONS_SETTING, False)
)

GROUPS_PROPERTY = "groups"
SLXS_PROPERTY = "SLXS"
SLX_RELATIONSHIPS_PROPERTY = "slx-relationships"
GENERATION_RULES_PROPERTY = "generation-rules"
# This is the dict key name for specifying the platform name in gen rules
# and the associated resource types.
PLATFORM_NAME_KEY_NAME = "platform"


def get_resources(context: Context, resource_type_spec: ResourceTypeSpec) -> Sequence[Resource]:
    platform_name = resource_type_spec.platform_name
    platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
    platform_handler = platform_handlers.get(platform_name)
    if not platform_handler:
        raise WorkspaceBuilderException(f"Platform handler not found for platform: {platform_name}")
    resources = platform_handler.get_resources(resource_type_spec, context)
    return resources

def update_resource_type_specs(resource_type_spec: ResourceTypeSpec,
                               resource_type_specs: dict[str, list[ResourceTypeSpec]]):
    platform_name = resource_type_spec.platform_name
    platform_resource_type_specs = resource_type_specs.get(platform_name)
    if not platform_resource_type_specs:
        platform_resource_type_specs = list()
        resource_type_specs[platform_name] = platform_resource_type_specs
    if resource_type_spec not in platform_resource_type_specs:
        platform_resource_type_specs.append(resource_type_spec)


@dataclass
class GenerationRuleMatchInfo:
    resource: Resource
    variables: dict[str, Any]
    context: Context


def construct_resource_type_spec(resource_type_spec_config: Union[str, dict[str, Any]],
                                 default_platform_name: str,
                                 context:Context):
    platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
    platform_name, _ = ResourceTypeSpec.parse_platform_name(resource_type_spec_config, default_platform_name)
    platform_handler = platform_handlers[platform_name]
    resource_type_spec = platform_handler.construct_resource_type_spec(resource_type_spec_config)
    return resource_type_spec


class ResourcePropertyMatchPredicate(MatchPredicate):
    """
    Match on one or more properties of the candidate resource.
    The property can either be a predefined name (e.g. name, labels, annotations)
    corresponding to properties that are handled specially in the model data, or
    else it can be a path that is resolved in the raw resource data, i.e. the
    "resource" field of the model instance, which is just a JSON-serialized
    version of the raw resource data.
    """

    resource_type_spec: Optional[ResourceTypeSpec]
    pattern: re.Pattern
    properties: list[str]
    string_match_mode: StringMatchMode

    # FIXME: Not sure "pattern" is the best name here?
    #  Maybe "property" would be better?
    TYPE_NAME: str = "pattern"

    def __init__(self,
                 resource_type_spec: ResourceTypeSpec,
                 pattern: re.Pattern,
                 properties: list[str],
                 string_match_mode: StringMatchMode):
        self.resource_type_spec = resource_type_spec
        self.pattern = pattern
        self.properties = properties
        self.string_match_mode = string_match_mode

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any],
                              default_platform_name: str,
                              context: Context) -> "ResourcePropertyMatchPredicate":
        resource_type_spec_config = predicate_config.get("resourceType")
        resource_type_spec = construct_resource_type_spec(resource_type_spec_config, default_platform_name, context) \
            if resource_type_spec_config else None
        pattern_config: str = predicate_config.get("pattern")
        if not pattern_config:
            raise WorkspaceBuilderException('A non-empty pattern must be specified for a '
                                            'resource property match predicate')
        pattern = re.compile(pattern_config)
        properties: list[str] = predicate_config.get("properties")
        if not properties:
            raise WorkspaceBuilderException('A non-empty list of resource properties must be specified '
                                            'for a resource property match predicate')
        string_match_mode_config: str = predicate_config.get("mode")
        string_match_mode = StringMatchMode[string_match_mode_config.upper()] \
            if string_match_mode_config else StringMatchMode.SUBSTRING
        return ResourcePropertyMatchPredicate(resource_type_spec, pattern, properties, string_match_mode)

    def matches_resource(self, resource: Resource, context: Context):
        # FIXME: This is sort of kludgy due to the union typing of the resource variable
        # between the Kubernetes resource and the variables dict. There's probably
        # a cleaner way to handle it, but this works for now.
        platform_name = resource.resource_type.platform.name
        platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
        platform_handler = platform_handlers[platform_name]

        # If it doesn't match one of the built-in resource names, then we
        # treat it as a path to be resolved to a value to be matched.
        def match_func(v: str) -> bool:
            return matches_pattern(v, self.pattern, self.string_match_mode)

        for prop in self.properties:
            if prop == "name":
                name = resource.name
                if matches_pattern(name, self.pattern, self.string_match_mode):
                    logger.debug(f"DEBUG: Match found for property {prop} with name {name}")
                    return True
            else:
                # Check if it's one of the platform-specific built-in values
                property_values = platform_handler.get_resource_property_values(resource, prop)
                if property_values is not None:
                    for value in property_values:
                        if matches_pattern(value, self.pattern, self.string_match_mode):
                            return True
                else:
                    resource_data = getattr(resource, "resource")
                    if match_path(resource_data, prop, match_func):
                        return True
        return False

    def matches(self, generation_rule_match_info: GenerationRuleMatchInfo):
        resource = generation_rule_match_info.resource
        variables = generation_rule_match_info.variables
        context = generation_rule_match_info.context
        if self.resource_type_spec:
            resources = get_resources(context, self.resource_type_spec)
            for resource in resources:
                if self.matches_resource(resource, context):
                    resource_type_name = self.resource_type_spec.get_resource_type_name()
                    variables['resources'][resource_type_name] = resource
                    return True
            return False
        else:
            return self.matches_resource(resource, context)

    def collect_resource_type_specs(self, resource_type_specs):
        if self.resource_type_spec:
            update_resource_type_specs(self.resource_type_spec, resource_type_specs)


class ResourcePathExistsMatchPredicate(MatchPredicate):

    TYPE_NAME: str = "exists"

    path_components: list[str]
    match_empty: bool

    def __init__(self, path: str, match_empty: bool):
        self.path = path
        self.match_empty = match_empty

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any]) -> "ResourcePathExistsMatchPredicate":
        path = predicate_config.get("path")
        if not path:
            raise WorkspaceBuilderException('A "path" field must be specified for a path exists match predicate')
        match_empty = predicate_config.get("matchEmpty", False)
        return ResourcePathExistsMatchPredicate(path, match_empty)

    def matches(self, generation_rule_match_info: GenerationRuleMatchInfo) -> bool:
        def match_func(value: str) -> bool:
            return (value is not None) or self.match_empty
        resource = generation_rule_match_info.resource
        resource_data = getattr(resource, "resource")
        return match_path(resource_data, self.path, match_func)


class CustomVariableMatchPredicate(MatchPredicate):

    TYPE_NAME: str = "custom-variable"

    path: str
    pattern: re.Pattern
    string_match_mode: StringMatchMode

    def __init__(self, path: str, pattern: re.Pattern, string_match_mode: StringMatchMode):
        self.path = path
        self.pattern = pattern
        self.string_match_mode = string_match_mode

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any]) -> "CustomVariableMatchPredicate":
        path = predicate_config.get("path")
        if not path:
            raise WorkspaceBuilderException('A non-empty path must be specified for a '
                                            'variable property match predicate')
        pattern_config: str = predicate_config.get("pattern")
        if not pattern_config:
            raise WorkspaceBuilderException('A non-empty pattern must be specified for a '
                                            'variable property match predicate')
        pattern = re.compile(pattern_config)
        string_match_mode_config: str = predicate_config.get("mode")
        string_match_mode = StringMatchMode[string_match_mode_config.upper()] \
            if string_match_mode_config else StringMatchMode.SUBSTRING
        return CustomVariableMatchPredicate(path, pattern, string_match_mode)

    def matches(self, generation_rule_match_info: GenerationRuleMatchInfo) -> bool:
        def match_func(v: str) -> bool:
            return matches_pattern(v, self.pattern, self.string_match_mode)
        return match_path(generation_rule_match_info.variables, self.path, match_func)


@dataclass
class OutputItem:
    """
    Specification of an output item/file to emit. This class is for deserializing the
    generation rules config, as opposed to the class with the same name that's defined
    in the render_output_items renderer. The enrich method operates on the deserialized
    generation rules info (which includes this class) and if there's a matching rule,
    then it generates an instance of render_output_items.OutputFile and appends it to
    a list in the context for later processing in the render phase by render_output_items.

    FIXME: The name conflict between this and the renderer OutputItem is a bit confusing.
    Should probably rename this one to something else, maybe OutputItemConfig?
    Might make sense to rename all of the classes that correspond to the config that's
    parsed from the generation rules files to include "Config" in the name.
    """
    type: str
    path: str
    template_name: str
    template_variables: dict[str, Any]
    level_of_detail: LevelOfDetail

    @staticmethod
    def construct_from_config(output_item_config: dict[str, Any],
                              default_level_of_detail=LevelOfDetail.DETAILED):
        type_ = output_item_config.get('type')
        path = output_item_config.get("path")
        template_name = output_item_config.get("templateName")
        template_variables = output_item_config.get("templateVariables", dict())
        # TODO: Think more about whether default value should be BASIC or DETAILED
        level_of_detail_config = output_item_config.get("levelOfDetail")
        level_of_detail = LevelOfDetail.construct_from_config(level_of_detail_config) \
            if level_of_detail_config is not None else default_level_of_detail
        return OutputItem(type_, path, template_name, template_variables, level_of_detail)

class SLX:
    base_name: str
    shortened_base_name: str
    base_template_name: str
    qualifiers: list[str]
    full_name: str
    level_of_detail: LevelOfDetail
    output_items: list[OutputItem]

    def parse_output_item(self, output_item_config: dict[str, Any]):
        output_item = OutputItem.construct_from_config(output_item_config, self.level_of_detail)
        # If no explicit path is specified, form one with the conventional file name
        # based on the type of the output item
        if not output_item.path:
            if not output_item.type:
                raise WorkspaceBuilderException('An SLX output item must have either a "type" or "path" property set.')
            # Using an f-string here makes it confusing with the curly brackets used
            # in the f-string vs. the template variables, so just use old school
            # string concatenation to keep things simple
            output_item.path = "{{slx_directory_path}}/" + output_item.type + ".yaml"
        # If no explicit template name is specified, form one with the conventional template
        # file name based on the base name of the SLX and the type of the output item
        if not output_item.template_name:
            if not output_item.type:
                raise WorkspaceBuilderException('An SLX output item must have either a '
                                                '"template_name" or "path" property set.')
            base_template_name = self.base_template_name
            if not base_template_name:
                base_template_name = self.base_name
            output_item.template_name = f"{base_template_name}-{output_item.type}.yaml"
        return output_item

    def __init__(self, slx_config: dict[str, Any]):
        self.base_name = slx_config['baseName']
        shortened_base_name = slx_config.get('shortenedBaseName', self.base_name)
        base_name_length_limit = 15
        if len(shortened_base_name) > base_name_length_limit:
            self.shortened_base_name = shorten_name(shortened_base_name, base_name_length_limit)
            logger.warning(f'SLX base name is too long, so shortening it from '
                           f'"{shortened_base_name}" to "{self.shortened_base_name}". '
                           f"The base name in the generation rule should be updated to "
                           f"comply with the max length of {base_name_length_limit}")
        else:
            self.shortened_base_name = self.base_name
        self.base_template_name = slx_config.get('baseTemplateName')
        self.qualifiers = slx_config.get('qualifiers', list())
        self.full_name = make_qualified_slx_name(self.base_name, self.qualifiers, None)
        level_of_detail_value = slx_config.get("levelOfDetail", LevelOfDetail.DETAILED.name)
        self.level_of_detail = LevelOfDetail[level_of_detail_value.upper()]
        output_items_config: list[dict[str, Any]] = slx_config.get("outputItems", list())
        self.output_items = [self.parse_output_item(oic) for oic in output_items_config]


class GenerationRule:
    """
    Class for the deserialization of the top-level generationRules list in the
    generation rules file/setting.
    """
    resource_type_specs: list[ResourceTypeSpec]
    match_predicate: MatchPredicate
    output_items: list[OutputItem]
    slxs: list[SLX]

    def __init__(self, resource_type_specs: list[ResourceTypeSpec],
                 match_predicate: MatchPredicate,
                 output_items: list[OutputItem],
                 slxs: list[SLX]):
        self.resource_type_specs = resource_type_specs
        self.match_predicate = match_predicate
        self.output_items = output_items
        self.slxs = slxs

    @staticmethod
    def construct_from_config(generation_rule_config: dict[str, Any],
                              default_platform_name: str,
                              context: Context) -> "GenerationRule":
        gen_rule_platform_name = generation_rule_config.get(PLATFORM_NAME_KEY_NAME, default_platform_name)

        resource_type_spec_configs = generation_rule_config.get("resourceTypes")
        if not resource_type_spec_configs:
            raise WorkspaceBuilderException("A generation rule must specify at least one resource type to check")
        resource_type_specs = list()
        for resource_type_spec_config in resource_type_spec_configs:
            resource_type_spec = construct_resource_type_spec(resource_type_spec_config, default_platform_name, context)
            resource_type_specs.append(resource_type_spec)
        match_predicate_configs: list[dict[str, Any]] = generation_rule_config.get("matchRules")

        # Define this as a nested method/closure, so it can access the context and default platform
        # name variables, which are needed to construct the match predicates, without having to pass
        # those things around as explicit parameters to all the match predicate construction methods.
        # Arguably a bit kludgy (or maybe elegant?)
        def construct_match_predicate_from_config(match_predicate_config: dict[str, Any],
                                                  parent_construct_from_config) -> MatchPredicate:
            match_predicate_type = match_predicate_config.get('type')
            if match_predicate_type == ResourcePropertyMatchPredicate.TYPE_NAME:
                # This next block is some somewhat kludgy backwards compatibility code to
                # handle the original way that a custom variable match was specified, i.e.
                # a "pattern" match predicate where the "resourceType" value was "variables".
                # This is now handled by a different match predicate specifically for matching
                # custom variables, so the following code parses the old format, converts it
                # to the new format then falls through to the rest of the code that checks
                # for other predicate types, and eventually handles the "variables" match
                # predicate type.
                resource_type = match_predicate_config.get("resourceType")
                if resource_type and resource_type.lower() == 'variables':
                    properties = match_predicate_config.get("properties")
                    if properties and isinstance(properties, list) and len(properties) == 1:
                        path = properties[0]
                        pattern = match_predicate_config.get("pattern")
                        string_match_mode = match_predicate_config.get("mode")
                        match_predicate_config = {
                            "type": CustomVariableMatchPredicate.TYPE_NAME,
                            "path": path,
                            "pattern": pattern
                        }
                        if string_match_mode:
                            match_predicate_config["mode"] = string_match_mode
                        match_predicate_type = CustomVariableMatchPredicate.TYPE_NAME
                        # Fall through to the checks for the other match predicate types
                    else:
                        raise WorkspaceBuilderException('Expected old variables match predicate to have a '
                                                        '"properties" list field with a single element of the '
                                                        'path in the custom variables to match against.')
                else:
                    return ResourcePropertyMatchPredicate.construct_from_config(match_predicate_config,
                                                                                gen_rule_platform_name,
                                                                                context)
            if match_predicate_type == ResourcePathExistsMatchPredicate.TYPE_NAME:
                return ResourcePathExistsMatchPredicate.construct_from_config(match_predicate_config)
            if match_predicate_type == CustomVariableMatchPredicate.TYPE_NAME:
                return CustomVariableMatchPredicate.construct_from_config(match_predicate_config)
            return base_construct_match_predicate_from_config(match_predicate_config, parent_construct_from_config)

        match_predicates = [construct_match_predicate_from_config(mpc, construct_match_predicate_from_config)
                            for mpc in match_predicate_configs]
        match_predicate = AndMatchPredicate(match_predicates)
        output_items_config: list[dict[str, Any]] = generation_rule_config.get("outputItems", list())
        output_items = [OutputItem.construct_from_config(oic) for oic in output_items_config]
        slxs_config: list[dict[str, Any]] = generation_rule_config.get("slxs", list())
        slxs = [SLX(slx_config) for slx_config in slxs_config]
        return GenerationRule(resource_type_specs, match_predicate, output_items, slxs)


class Group:
    """
    Class used to collect information about SLX group assignments and group
    dependencies. These are built up as we run the generation rules and then
    execute the map customization rules to determine group info.
    """
    name: str
    slxs: list[str]

    def __init__(self, name: str, slxs: Optional[list[str]] = None, dependencies: list[str] = None):
        if slxs is None:
            slxs = []
        if dependencies is None:
            dependencies = []
        self.name = name
        self.slxs = slxs
        self.dependencies = dependencies

    def add_slx(self, slx_name):
        self.slxs.append(slx_name)

    def add_dependency(self, dependency: str):
        self.dependencies.append(dependency)


class GenerationRuleInfo:
    """
    Collects the information that's obtained during the load phase that will later
    be needed to execute the generation rule in the enrich phase. Mostly, this is
    just the state that we need to access/load the templates that are referenced
    in the generation rule.
    """
    generation_rule: GenerationRule
    generation_rule_file_spec: GenerationRuleFileSpec
    code_collection: CodeCollection

    def __init__(self, generation_rule: GenerationRule,
                 generation_rule_file_spec: GenerationRuleFileSpec,
                 code_collection: CodeCollection = None):
        self.generation_rule = generation_rule
        self.generation_rule_file_spec = generation_rule_file_spec
        self.code_collection = code_collection


def get_template_variables(output_item: OutputItem,
                           resource: Resource,
                           base_template_variables: dict[str, Any],
                           generation_rule_info: GenerationRuleInfo,
                           context: Context) -> dict[str, Any]:
    """
    Convert the template variables configuration from a generation rule into
    a corresponding dictionary with the values of the template variables.
    :param output_item:
        The output item spec for a generation rule config.
    :param resource:
        The Kubernetes/RunWhen resource that's used to evaluate the
        TemplateValueSourceTypes in the template variable config.
    :param base_template_variables:
        base dictionary for the returned dictionary that contains some built-in,
        automatically defined variables.
    :param generation_rule_info:
    :param context:
    :return: dictionary of the template variables with the resolved/literal values
    """
    template_variables = base_template_variables.copy()

    if isinstance(resource, Resource):
        # If it's a resource (vs. the kludgy overloaded custom defs), then call the
        # associated platform handler to add any standard/built-in platform-specific
        # template variables.
        platform_name = resource.resource_type.platform.name
        platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
        platform_handler = platform_handlers[platform_name]
        standard_template_variables = platform_handler.get_standard_template_variables(resource)
        template_variables.update(standard_template_variables)
    else:
        platform_handler = None


    output_item_type = output_item.type.lower()
    # Check if the item is a workflow, as it has different path requirements
    # which are handled later on
    if output_item_type == 'workflow':
         template_variables['is_workflow'] = True
    else: 
        template_variables['is_workflow'] = False

    try:
        template_variables['repo_url'] = generation_rule_info.code_collection.repo_url
    except Exception as e:
        raise e
    template_variables['ref'] = generation_rule_info.generation_rule_file_spec.ref_name
    template_variables['generation_rule_file_path'] = generation_rule_info.generation_rule_file_spec.path
    for name, template_string in output_item.template_variables.items():
        value = None
        if platform_handler:
            value = platform_handler.resolve_template_variable_value(resource, template_string)
        if not value:
            value = render_template_string(template_string, template_variables)
        template_variables[name] = value

    return template_variables


def should_emit_output_item(output_item: OutputItem, level_of_detail: LevelOfDetail) -> bool:
    # FIXME: Would be a bit nicer if the enum instances were directly comparable
    try:
        return output_item and output_item.level_of_detail.value <= level_of_detail.value
    except Exception as e:
        raise e


def generate_output_item(generation_rule_info: GenerationRuleInfo,
                         output_item: OutputItem,
                         resource: Resource,
                         renderer_output_items: dict[str, RendererOutputItem],
                         base_template_variables: dict[str, Any],
                         context: Context) -> bool:
    template_variables = get_template_variables(output_item,
                                                resource,
                                                base_template_variables,
                                                generation_rule_info,
                                                context)
    path_template = output_item.path
    
    # Check if the item is a workflow file, and if so, fix the path to 
    # create a filename based on the SLX and put it in the workflows directory
    if template_variables['is_workflow'] == True:
        workflow_name=template_variables['slx_name'].split("--")[-1]
        path = f"{template_variables['workspace_path']}/workflows/{workflow_name}.yaml"
    else: 
        path = render_template_string(path_template, template_variables)

    # Only emit the output item if it's a path we haven't seen/emitted yet.
    # The assumption is that output items triggered from different match
    # rules/sources but with the same template variable values (and thus the
    # same path after template substitution) are identical
    # And we can only have one output item at a given path anyway...
    if path in renderer_output_items:
        logger.debug(f"DEBUG: Generate Output Item: {path} already exists")
        return False

    code_collection = generation_rule_info.code_collection
    if code_collection:
        ref_name = generation_rule_info.generation_rule_file_spec.ref_name
        code_bundle_name = generation_rule_info.generation_rule_file_spec.code_bundle_name
        template_loader_func = lambda name: code_collection.get_template_text(ref_name, code_bundle_name, name)
    else:
        template_loader_func = None
    output_item = RendererOutputItem(path, output_item.template_name, template_variables, template_loader_func)
    renderer_output_items[path] = output_item
    return True


def collect_emitted_slxs(generation_rule_info: GenerationRuleInfo,
                         resource: Resource,
                         level_of_detail: LevelOfDetail,
                         slxs: dict[str, SLXInfo],
                         context):
    generation_rule = generation_rule_info.generation_rule
    for slx in generation_rule.slxs:
        # See if the SLX has anything to output, i.e. has some output item that's not
        # filtered out by the level of detail
        emit_slx = False
        for output_item in slx.output_items:
            logger.debug(f"DEBUG: Collect Emitted SLXs: Review {output_item}")
            if should_emit_output_item(output_item, level_of_detail):
                logger.debug(f"DEBUG: Collect Emitted SLXs: should_emit_output is true")
                emit_slx = True
                break

        if emit_slx:
            slx_info = SLXInfo(slx, resource, level_of_detail, generation_rule_info, context)
            logger.debug(f"DEBUG: Collect Emitted SLXs: emit {slx_info}")
            slxs[slx_info.full_name] = slx_info


def assign_slx_names(slxs: dict[str, SLXInfo], workspace_name):
    slxs_by_default_shortened_name: dict[str, list[SLXInfo]] = dict()
    for slx_info in slxs.values():
        shortened_name = make_qualified_slx_name(slx_info.slx.shortened_base_name, slx_info.qualifier_values)
        slx_list = slxs_by_default_shortened_name.get(shortened_name)
        if not slx_list:
            slx_list = []
            slxs_by_default_shortened_name[shortened_name] = slx_list
        slx_list.append(slx_info)
    for shortened_name, slx_list in slxs_by_default_shortened_name.items():
        count = len(slx_list)
        if count > 1:
            # For now, we do the simplest thing to resolve the conflict: just insert an incrementing
            # integer in the name for each slx with the same default qualified name.
            # TODO: This could be a lot smarter. For example, it could look at the different
            # qualifier values that contribute to the qualified name and determine why the
            # conflict occurred (e.g. long common prefix in the qualifier value) and then apply
            # smarter shortening logic to ensure that the shortened names are unique.
            # count_chars = len(f"{count+1}")
            for i, slx_info in enumerate(slx_list):
                indexed_base_name = f"{slx_info.base_name}{i+1}"
                slx_info.qualified_name = make_qualified_slx_name(indexed_base_name, slx_info.qualifier_values)
                slx_info.name = make_slx_name(workspace_name, slx_info.qualified_name)
        else:
            slx_info = slx_list[0]
            slx_info.qualified_name = shortened_name
            slx_info.name = make_slx_name(workspace_name, shortened_name)


class SLXRelationship:
    subject: str
    verb: RelationshipVerb
    object: str

    def __init__(self, subject: str, verb: RelationshipVerb, obj: str):
        self.subject = subject
        self.verb = verb
        self.object = obj


def generate_slx_output_items(slx_info: SLXInfo,
                              base_template_variables: dict[str, Any],
                              renderer_output_items: dict[str, RendererOutputItem],
                              map_customization_rules: MapCustomizationRules,
                              groups: dict[str, Group],
                              slx_relationships: list[SLXRelationship],
                              context: Context) -> None:
    """
    Translate the output items from the generation rule config into the
    corresponding render_output_items OutputItems to be emitted during the
    render phase.
    :param slx_info:
    :param base_template_variables:
    :param renderer_output_items:
    :param map_customization_rules:
    :param groups:
    :param slx_relationships:
    :param context:
    :return:
    """
    resource = slx_info.resource
    generation_rule_info = slx_info.generation_rule_info

    slx_base_template_variables = base_template_variables.copy()
    slx_base_template_variables['base_name'] = slx_info.base_name
    slx_base_template_variables['slx_name'] = slx_info.name
    slx_base_template_variables['full_slx_name'] = slx_info.full_name
    slxs_path = base_template_variables['slxs_path']
    slx_directory_path = os.path.join(slxs_path, slx_info.qualified_name)
    slx_base_template_variables['slx_directory_path'] = slx_directory_path
    slx_base_template_variables['match_resource'] = resource

    for output_item in slx_info.slx.output_items:
        if should_emit_output_item(output_item, slx_info.level_of_detail):
            generate_output_item(generation_rule_info,
                                 output_item,
                                 resource,
                                 renderer_output_items,
                                 slx_base_template_variables,
                                 context)

    customization_variables = {
        "resource": resource,
        "slx-info": slx_info
    }

    # FIXME: This logic to set the standard template variables is a bit klunky and uses
    # duplicated code. Should clean up / refactor.
    platform_name = resource.resource_type.platform.name
    platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
    platform_handler = platform_handlers[platform_name]
    standard_template_variables = platform_handler.get_standard_template_variables(resource)
    customization_variables.update(standard_template_variables)
    group_name_template = map_customization_rules.match_group_rules(slx_info)
    if group_name_template:
        group_name = render_template_string(group_name_template, customization_variables)
        group = groups.get(group_name)
        if not group:
            group = Group(group_name)
            groups[group_name] = group
        group.add_slx(slx_info.qualified_name)

    subject_template, verb = map_customization_rules.match_slx_relationship_rules(slx_info)
    if subject_template:
        subject = render_template_string(subject_template, customization_variables)
        obj = slx_info.qualified_name
        if verb == RelationshipVerb.DEPENDED_ON_BY:
            verb = RelationshipVerb.DEPENDENT_ON
            subject, obj = obj, subject
        slx_relationship = SLXRelationship(subject, verb, obj)
        slx_relationships.append(slx_relationship)


class CollectResourceTypeSpecsVisitor(MatchPredicateVisitor):

    resource_type_specs: dict[str, list[ResourceTypeSpec]]

    def __init__(self, resource_type_specs: dict[str, list[ResourceTypeSpec]]):
        self.resource_type_specs = resource_type_specs

    def visit(self, match_predicate: "MatchPredicate"):
        try:
            # Improve the type-checking here to avoid type warnings
            # Could have a MatchPredicate subclass that defines the collect_resource_type_specs
            # that anything that supported that method would derive from. Then we could
            # use isinstance and cast to that. Or something like that...
            match_predicate.collect_resource_type_specs(self.resource_type_specs)
        except AttributeError:
            # This match predicate didn't implement the collect_resource_type_specs
            # method so just ignore the error.
            pass


def load(context: Context) -> None:
    # FIXME: Would be nice if this generic gen rule code didn't have to have dependencies
    # on all the platform handlers.
    # Could perhaps do some sort of dynamic discovery/loading/registration of all the platform handlers?
    platform_handlers = {
        KUBERNETES_PLATFORM: KubernetesPlatformHandler(),
        AZURE_PLATFORM: AzurePlatformHandler(),
        GCP_PLATFORM: GCPPlatformHandler(),
    }
    context.set_property(PLATFORM_HANDLERS_PROPERTY_NAME, platform_handlers)
    request_code_collections = context.get_setting("CODE_COLLECTIONS")
    code_collection_configs = get_request_code_collections(request_code_collections)

    slxs_by_shortened_base_name = dict()
    generation_rules = list()
    resource_type_specs: dict[str, list[ResourceTypeSpec]] = dict()
    collect_resource_types_visitor = CollectResourceTypeSpecsVisitor(resource_type_specs)

    for code_collection_config in code_collection_configs:
        code_collection = get_code_collection(code_collection_config)
        ref_name = code_collection_config.ref_name
        code_collection.update_repo(ref_name)
        code_bundle_names = code_collection.get_code_bundle_names(ref_name, code_collection_config)
        for code_bundle_name in code_bundle_names:
            generation_rules_configs = code_collection.get_generation_rules_configs(ref_name, code_bundle_name)
            for generation_rule_file_spec, generation_rules_config_text in generation_rules_configs:
                generation_rules_config = yaml.safe_load(generation_rules_config_text)
                spec_config = generation_rules_config["spec"]
                # NOTE: The Kubernetes dependency here is just for backward compatibility, since
                # the existing gen rules were written before there was the notion of a platform,
                # so they obviously don't specify one. Eventually/soon we should patch up the
                # gen rules to make their associated platform explicit, and then we can remove
                # this Kubernetes dependency.
                default_platform_name = spec_config.get(PLATFORM_NAME_KEY_NAME, KUBERNETES_PLATFORM)
                generation_rule_config_list = generation_rules_config["spec"]["generationRules"]
                for generation_rule_config in generation_rule_config_list:
                    generation_rule = GenerationRule.construct_from_config(generation_rule_config,
                                                                           default_platform_name,
                                                                           context)
                    generation_rule_info = GenerationRuleInfo(generation_rule,
                                                              generation_rule_file_spec,
                                                              code_collection)
                    generation_rules.append(generation_rule_info)
                    for slx in generation_rule.slxs:
                        shortened_base_name = slx.shortened_base_name
                        slx_list = slxs_by_shortened_base_name.get(shortened_base_name)
                        if not slx_list:
                            slx_list = []
                            slxs_by_shortened_base_name[shortened_base_name] = slx_list
                        slx_list.append(slx)
                    for resource_type_spec in generation_rule.resource_type_specs:
                        update_resource_type_specs(resource_type_spec, resource_type_specs)
                    generation_rule.match_predicate.accept(collect_resource_types_visitor)

    # Check for collisions in the generation of the shortened SLX base names
    # Collision are resolved by appending with an incrementing integer
    for slx_list in slxs_by_shortened_base_name.values():
        if len(slx_list) > 1:
            for i, slx in enumerate(slx_list):
                slx.shortened_base_name = f"{slx.shortened_base_name}{i+1}"

    logger.debug("Loaded resource type specs:")
    for platform_name, resource_type_spec_list in resource_type_specs.items():
        resource_type_names = [rts.resource_type_name for rts in resource_type_spec_list]
        logger.debug(f"platform={platform_name}; resource-types={resource_type_names}")

    context.set_property(GENERATION_RULES_PROPERTY, generation_rules)
    context.set_property(RESOURCE_TYPE_SPECS_PROPERTY, resource_type_specs)


def enrich(context: Context) -> None:
    logger.debug("Beginning generation_rules.enrich")
    map_customization_rules_path = context.get_setting("MAP_CUSTOMIZATION_RULES")
    map_customization_rules = MapCustomizationRules.load(map_customization_rules_path) \
        if map_customization_rules_path else MapCustomizationRules()

    custom_definitions: dict[str, Any] = context.get_setting("CUSTOM_DEFINITIONS")
    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
    renderer_output_items: dict[str, RendererOutputItem] = context.get_property(OUTPUT_ITEMS_PROPERTY)
    platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)

    workspace_name = context.get_setting("WORKSPACE_NAME")
    # workspace = models.RunWhenWorkspace.nodes.get(short_name=workspace_name)
    workspace = registry.lookup_resource(RUNWHEN_PLATFORM, RunWhenResourceType.WORKSPACE.value, workspace_name)

    slxs = context.get_property(SLXS_PROPERTY)
    if slxs is None:
        slxs = dict()
        context.set_property(SLXS_PROPERTY, slxs)

    groups = context.get_property(GROUPS_PROPERTY)
    if groups is None:
        groups = dict()
        context.set_property(GROUPS_PROPERTY, groups)

    slx_relationships = context.get_property(SLX_RELATIONSHIPS_PROPERTY)
    if slx_relationships is None:
        slx_relationships = list()
        context.set_property(SLX_RELATIONSHIPS_PROPERTY, slx_relationships)

    workspace_output_path = context.get_setting("WORKSPACE_OUTPUT_PATH")
    if not workspace_output_path:
        workspace_output_path = "."
    workspace_path = os.path.join(workspace_output_path, workspace_name)
    slxs_path = os.path.join(workspace_path, "slxs")
    default_location = context.get_setting("DEFAULT_LOCATION")
    base_template_variables = {
        'workspace': workspace,
        'workspace_path': workspace_path,
        'slxs_path': slxs_path,
        'default_location': default_location,
        'custom': custom_definitions,
        'shorten_name': shorten_name,
        'make_slx_name': make_slx_name,
        'make_slx_directory_name': make_qualified_slx_name,
    }

    generation_rule_infos: list[GenerationRuleInfo] = context.get_property(GENERATION_RULES_PROPERTY)
    for generation_rule_info in generation_rule_infos:
        generation_rule = generation_rule_info.generation_rule
        for resource_type_spec in generation_rule.resource_type_specs:
            resources = get_resources(context, resource_type_spec)
            base_template_variables['resources'] = dict()
            for resource in resources:
                platform_name = resource.resource_type.platform.name
                platform_handler = platform_handlers[platform_name]
                level_of_detail = platform_handler.get_level_of_detail(resource)
                resource_type_name = resource_type_spec.get_resource_type_name()
                generation_rule_match_info = GenerationRuleMatchInfo(resource, base_template_variables, context)
                matches = generation_rule.match_predicate.matches(generation_rule_match_info)
                if matches:
                    # Emit the non-SLX output items directly. We currently don't do any name/path config
                    # detection/resolution for these. I actually don't think we're using these for
                    # anything currently, so we might want to take out support for this to simplify
                    # things a bit.
                    #
                    # standard_template_variables = platform_handler.get_standard_template_variables(resource)
                    # resource_template_variables = base_template_variables.copy()
                    # resource_template_variables.update(standard_template_variables)
                    base_template_variables['resources'][resource_type_name] = resource
                    for output_item in generation_rule.output_items:
                        if should_emit_output_item(output_item, level_of_detail):
                            generate_output_item(generation_rule_info,
                                                 output_item,
                                                 resource,
                                                 renderer_output_items,
                                                 base_template_variables,
                                                 context)

                    collect_emitted_slxs(generation_rule_info, resource, level_of_detail, slxs, context)

    # Assign the shortened names to the enabled SLXs, including detecting and resolving any name conflicts.
    workspace_name = getattr(workspace, "short_name")
    assign_slx_names(slxs, workspace_name)

    # Now that we've assigned the SLX names, we can generate the output items.
    for slx_info in slxs.values():
        generate_slx_output_items(slx_info,
                                  base_template_variables,
                                  renderer_output_items,
                                  map_customization_rules,
                                  groups,
                                  slx_relationships,
                                  context)

    # Cleanup any SLX dependencies that refer to non-existent SLXs
    clean_slx_relationships = []
    for slx_relationship in slx_relationships:
        if (slx_relationship.subject in slxs) and (slx_relationship.object in slxs):
            clean_slx_relationships.append(slx_relationship)
    slx_relationships = clean_slx_relationships
    context.set_property(SLX_RELATIONSHIPS_PROPERTY, slx_relationships)

    # Generate the workspace file
    workspace_template_variables = {
        'workspace': workspace,
        'default_location': default_location,
        'custom': custom_definitions,
        'groups': groups,
        'slx_relationships': slx_relationships,
    }
    path = f"{workspace_path}/workspace.yaml"
    output_item = RendererOutputItem(path, "workspace.yaml", workspace_template_variables)
    renderer_output_items[path] = output_item

    # Generate the personas
    persona_data = context.get_setting("PERSONAS")
    if persona_data:
        for short_name, data in persona_data.items():
            persona_template_variables = {
                'workspace': workspace,
                'short_name': short_name,
                'custom': custom_definitions
            }
            persona_template_variables.update(data)
            path = f"{workspace_path}/personas/{short_name}.yaml"
            output_item = RendererOutputItem(path, "persona.yaml", persona_template_variables)
            renderer_output_items[path] = output_item

    logger.debug("Ending generation_rules.enrich")

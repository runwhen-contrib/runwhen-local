import logging
import os
import re
from enum import Enum
from typing import Any, Union, Optional, Sequence

import yaml

import models
from component import Context, Setting, SettingDependency, WORKSPACE_NAME_SETTING, WORKSPACE_OUTPUT_PATH_SETTING
from exceptions import WorkspaceBuilderException
from renderers.render_output_items import OUTPUT_ITEMS_PROPERTY
from renderers.render_output_items import OutputItem as RendererOutputItem
from template import render_template_string
from name_utils import shorten_name, make_qualified_slx_name, make_slx_name
from .map_customization_rules import MapCustomizationRules, SLXInfo, RelationshipVerb
from .match_predicate import MatchPredicate, AndMatchPredicate, StringMatchMode, \
    base_construct_match_predicate_from_config, match_resource_path, matches_pattern

logger = logging.getLogger(__name__)

DOCUMENTATION = "Implements pattern-based rules for generating SLXs"

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

SETTINGS = (
    SettingDependency(WORKSPACE_NAME_SETTING, True),
    SettingDependency(WORKSPACE_OUTPUT_PATH_SETTING, True),
    SettingDependency(MAP_CUSTOMIZATION_RULES_SETTING, False),
    SettingDependency(CUSTOM_DEFINITIONS_SETTING, False),
    SettingDependency(PERSONAS_SETTING, False),
)

GROUPS_PROPERTY = "groups"
SLXS_PROPERTY = "SLXS"
SLX_RELATIONSHIPS_PROPERTY = "slx-relationships"
GENERATION_RULES_PROPERTY = "generation-rules"
CUSTOM_RESOURCE_TYPE_SPECS = "custom-resource-type-specs"


class LevelOfDetail(Enum):
    """
    A per-namespace setting that is used to control how much information to generate.

    FIXME: This probably belongs somewhere else, but it causes a circular reference
    if this is in generation_rules. Possibly there should be an "slx" module where
    the low-level slx-related stuff goes...
    """
    NONE = 0
    BASIC = 1
    DETAILED = 2


class TemplateValueSourceType(Enum):
    # IP = "ip"
    # SETTING = "setting"
    # ATTRIBUTE = "attribute"
    NAMESPACE = "namespace"
    CONTEXT = "context"
    # WORKSPACE = "workspace"
    CLUSTER = "cluster"


class ResourceType(Enum):
    """
    The types of Kubernetes and RunWhen resources that generation rules can iterate over and
    check their attributes against the specified pattern to trigger the generation of an
    output file (most commonly an SLX, but also the workspace.yaml file and possibly other
    things too).
    """
    # FIXME: Not sure workspace makes sense here. We're using it currently for a generation
    # rule that creates the workspace yaml file, but I think it probably makes more sense
    # to treat the generation of that as something that's done in code, not via a
    # generation rule, especially when we start supporting group/road customizations
    # in the generated workspace.
    WORKSPACE = "workspace"
    VARIABLES = "variables"
    INGRESS = "ingress"
    SERVICE = "service"
    NAMESPACE = "namespace"
    CLUSTER = "cluster"
    DEPLOYMENT = "deployment"
    CONFIG_MAP = "configmap"
    DAEMON_SET = "daemonset"
    STATEFUL_SET = "statefulset"
    POD = "pod"
    CUSTOM = "custom"


class ResourceTypeSpec:
    resource_type: ResourceType
    # The rest of the fields only apply to custom resource types
    group: Optional[str]
    version: Optional[str]
    kind: Optional[str]

    def __init__(self, resource_type: ResourceType, group: Optional[str] = None,
                 version: Optional[str] = None, kind: Optional[str] = None):
        self.resource_type = resource_type
        self.group = group
        self.version = version
        self.kind = kind

    def __eq__(self, other):
        if not isinstance(other, ResourceTypeSpec):
            # don't attempt to compare against unrelated types
            return NotImplemented

        return self.group == other.group and self.version == other.version and self.kind == self.kind

    def get_name(self):
        group_suffix = f".{self.group}" if self.group else ""
        return f"{self.kind}{group_suffix}"

    @staticmethod
    def construct_from_config(config: Union[str, dict[str, Any]]) -> "ResourceTypeSpec":
        """
        Construct a ResourceTypeSpec from configuration in a generation rule.
        The spec can be either a string or a dict. If it's a string, the expected format
        is "kind.group/version", e.g. "workspaces.runwhen.com/v1".
        The kind field is the lower-case plural form of the kind.
        The version can be omitted (along with the slash), which maps to matching all available versions.
        :param config:
        :return:
        """
        if isinstance(config, str):
            try:
                resource_type = ResourceType(config)
                group = None
                version = None
                kind = None
            except ValueError:
                resource_type = ResourceType.CUSTOM
                parts = config.split('/')
                if len(parts) == 1:
                    version = None
                    group_and_kind = config
                elif len(parts) == 2:
                    version = parts[1]
                    group_and_kind = parts[0]
                else:
                    raise WorkspaceBuilderException(f"Invalid resource type spec configuration: {config}.")
                dot_index = group_and_kind.find('.')
                if dot_index > 0:
                    kind = group_and_kind[0:dot_index]
                    group = group_and_kind[dot_index+1:]
                elif dot_index < 0:
                    kind = group_and_kind
                    group = ""
                else:
                    raise WorkspaceBuilderException(f'Expected resource type spec string for a custom resource '
                                                    f'to begin with the kind: {config}')
        elif isinstance(config, dict):
            resource_type_str = config.get("resourceType")
            if not resource_type_str:
                raise WorkspaceBuilderException(f'Resource type spec must specify a "resourceType" field')
            resource_type = ResourceType(resource_type_str)
            group = config.get("group")
            version = config.get("version")
            kind = config.get("kind")
            if resource_type == ResourceType.CUSTOM and not kind:
                raise WorkspaceBuilderException(f'The resource type spec for a custom resource '
                                                f'must specify a "kind" field.')
        else:
            raise WorkspaceBuilderException(f'Unexpected type ("{type(config)}") for ResourceTypeSpec; '
                                            f'expected str or dict.')
        return ResourceTypeSpec(resource_type, group=group, version=version, kind=kind)


resource_map: dict[ResourceType, Any] = {
    ResourceType.NAMESPACE: models.KubernetesNamespace,
    ResourceType.INGRESS: models.KubernetesIngress,
    ResourceType.SERVICE: models.KubernetesService,
    ResourceType.CLUSTER: models.KubernetesCluster,
    ResourceType.WORKSPACE: models.RunWhenWorkspace,
    ResourceType.DEPLOYMENT: models.KubernetesDeployment,
    ResourceType.CONFIG_MAP: models.KubernetesConfigMap,
    ResourceType.DAEMON_SET: models.KubernetesDaemonSet,
    ResourceType.STATEFUL_SET: models.KubernetesStatefulSet,
    ResourceType.POD: models.KubernetesPod,
}


def get_resources(resource_type_spec: ResourceTypeSpec,
                  variables: dict[str, Any]) -> Sequence[Union[models.KubernetesBase, dict[str, Any]]]:
    resource_type = resource_type_spec.resource_type
    if resource_type == ResourceType.VARIABLES:
        return [variables]
    if resource_type == ResourceType.CUSTOM:
        # TODO: It's possibly a performance issue if there are lots of different custom resource types
        # and instances. Not sure how well neo4j will optimize the performance of the query in that case.
        # But probably not a huge deal, at least for now. Probably won't have too many different custom
        # resource types that we're accessing from gen rules (but should check with Shea).
        # If it turns out to be a problem, there's probably some way to set up indexing of fields in
        # neo4j; probably just doing the kind field would be sufficient.
        # Or just ditch neo4j...
        kwargs = {
            'group': resource_type_spec.group,
            'plural_name': resource_type_spec.kind
        }
        if resource_type_spec.version is not None and resource_type_spec.version != '*':
            kwargs['version'] = resource_type_spec.version
        result = models.KubernetesCustomResource.nodes.filter(**kwargs)
        if not result:
            result = []
        return result
    else:
        resource_class = resource_map[resource_type]
        return resource_class.nodes.all()


class ResourceProperty(Enum):
    NAME = "name"
    LABEL_KEYS = "label-keys"
    LABEL_VALUES = "label-values"
    LABELS = "labels"  # matches against both the label keys and values
    ANNOTATION_KEYS = "annotation-keys"
    ANNOTATION_VALUES = "annotation-values"
    ANNOTATIONS = "annotations"  # matches against both the annotation keys and values


class ResourcePropertyMatchPredicate(MatchPredicate):
    """
    Match on one or more properties of the candidate resource.
    The property can either be a predefined name (e.g. name, labels, annotations)
    corresponding to properties that are handled specially in the model data, or
    else it can be a path that is resolved in the raw resource data, i.e. the
    "resource" field of the model instance, which is just a JSON-serialized
    version of the raw resource data.
    """
    # FIXME: Not sure "pattern" is the best name here?
    #  Maybe "property" would be better?
    TYPE_NAME: str = "pattern"

    resource_type_spec: Optional[ResourceTypeSpec]
    pattern: re.Pattern
    properties: list[str]
    string_match_mode: StringMatchMode

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
    def construct_from_config(predicate_config: dict[str, Any]) -> "ResourcePropertyMatchPredicate":
        resource_type_spec_config = predicate_config.get("resourceType")
        resource_type_spec = ResourceTypeSpec.construct_from_config(resource_type_spec_config) \
            if resource_type_spec_config else None
        pattern_config: str = predicate_config.get("pattern")
        if not pattern_config:
            raise WorkspaceBuilderException('A non-empty pattern must be specified for a '
                                            'resource property match predicate')
        pattern = re.compile(pattern_config)
        properties_config: list[str] = predicate_config.get("properties")
        if not properties_config:
            raise WorkspaceBuilderException('A non-empty list of resource properties must be specified '
                                            'for a resource property match predicate')
        properties: set = set()
        for property_config in properties_config:
            try:
                rp = ResourceProperty(property_config.lower())
                # Expand the LABELS and ANNOTATIONS aggregate properties to the underlying
                # properties. We do this here to simplify the processing of the properties
                # in the "matches" method.
                if rp == ResourceProperty.LABELS:
                    properties.add(ResourceProperty.LABEL_KEYS)
                    properties.add(ResourceProperty.LABEL_VALUES)
                elif property == ResourceProperty.ANNOTATIONS:
                    properties.add(ResourceProperty.ANNOTATION_KEYS)
                    properties.add(ResourceProperty.ANNOTATION_VALUES)
                else:
                    properties.add(rp)
            except Exception as e:
                # If it didn't match one of the pre-defined property values, then
                # we treat it as a path that's resolved from the root of the
                # raw Kubernetes resource data
                # FIXME: This is a little kludgy, since it means that the elements in the
                # properties list are not a consistent type, i.e. a mix of ResourceProperty
                # and string/path. Might be cleaner to have a ResourceProperty enum named
                # "PATH", that corresponds to a path property and store the actual path value
                # in a separate field in the match predicate. That's more type-safe from
                # an implementation standpoint, but a little more verbose for the author,
                # so not sure if it should be changed.
                properties.add(property_config)
        string_match_mode_config: str = predicate_config.get("mode")
        string_match_mode = StringMatchMode[string_match_mode_config.upper()] \
            if string_match_mode_config else StringMatchMode.SUBSTRING
        return ResourcePropertyMatchPredicate(resource_type_spec, pattern, list(properties), string_match_mode)

    def matches_resource(self, resource: Union[models.KubernetesBase, dict[str, Any]]):
        for p in self.properties:
            if p == ResourceProperty.NAME:
                name = resource.get_name()
                if matches_pattern(name, self.pattern, self.string_match_mode):
                    return True
            elif p == ResourceProperty.LABEL_KEYS:
                for key in resource.labels.keys():
                    if matches_pattern(key, self.pattern, self.string_match_mode):
                        return True
            elif p == ResourceProperty.LABEL_VALUES:
                for value in resource.labels.values():
                    if matches_pattern(value, self.pattern, self.string_match_mode):
                        return True
            elif p == ResourceProperty.ANNOTATION_KEYS:
                for key in resource.annotations.keys():
                    if matches_pattern(key, self.pattern, self.string_match_mode):
                        return True
            elif p == ResourceProperty.ANNOTATION_VALUES:
                for value in resource.annotations.values():
                    if matches_pattern(value, self.pattern, self.string_match_mode):
                        return True
            else:
                # If it doesn't match one of the predefined resource names, then we
                # treat it as a path to be resolved to a value to be matched.
                def match_func(v: str) -> bool:
                    return matches_pattern(v, self.pattern, self.string_match_mode)

                # FIXME: This is sort of kludgy due to the union typing of the resource variable
                # between the Kubernetes resource and the variables dict. There's probably
                # a cleaner way to handle it, but this works for now.
                root = resource.resource if isinstance(resource, models.KubernetesBase) else resource
                return match_resource_path(root, p, match_func)
        return False

    def matches(self, resource: Union[models.KubernetesBase, dict[str, Any]], variables: dict[str, Any]):
        if self.resource_type_spec:
            resources = get_resources(self.resource_type_spec, variables)
            for resource in resources:
                if self.matches_resource(resource):
                    resource_type = self.resource_type_spec.resource_type
                    resource_name = self.resource_type_spec.get_name() \
                        if resource_type == ResourceType.CUSTOM else resource_type.value
                    variables['resources'][resource_name] = resource
                    return True
            return False
        else:
            return self.matches_resource(resource)

    def collect_custom_resource_type_specs(self, custom_resource_type_specs):
        if (self.resource_type_spec and
                self.resource_type_spec.resource_type == ResourceType.CUSTOM and
                self.resource_type_spec not in custom_resource_type_specs):
            custom_resource_type_specs.append(self.resource_type_spec)


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

    def matches(self, resource: models.KubernetesBase, variables: dict[str, Any]) -> bool:
        def match_func(value: str) -> bool:
            return (value is not None) or self.match_empty
        return match_resource_path(resource.resource, self.path, match_func)


def construct_match_predicate_from_config(predicate_config: dict[str, Any],
                                          parent_construct_from_config) -> MatchPredicate:
    match_predicate_type = predicate_config.get('type')
    if match_predicate_type == ResourcePropertyMatchPredicate.TYPE_NAME:
        match_predicate = ResourcePropertyMatchPredicate.construct_from_config(predicate_config)
    elif match_predicate_type == ResourcePathExistsMatchPredicate.TYPE_NAME:
        match_predicate = ResourcePathExistsMatchPredicate.construct_from_config(predicate_config)
    else:
        match_predicate = base_construct_match_predicate_from_config(predicate_config,
                                                                     parent_construct_from_config)
    return match_predicate


class OutputItem:
    """
    Specification of an output item/file to emit. This class is for deserializing the
    generation rules config, as opposed to the class with the same name that's defined
    in the render_output_items renderer. The enrich method operates on the deserialized
    generation rules info (which includes this class) and if there's a matching rule,
    then it generates an instance of render_output_items.OutputFile and appends it to
    a list in the context for later processing in the render phase by render_output_items.
    """
    type: str
    path: str
    template_name: str
    template_variables: dict[str, Any]
    level_of_detail: LevelOfDetail

    def __init__(self, output_item_config: dict[str, Any], default_lod=LevelOfDetail.DETAILED):
        self.type = output_item_config.get('type')
        self.path = output_item_config.get("path")
        self.template_name = output_item_config.get("templateName")
        template_variables_config = output_item_config.get("templateVariables", dict())
        self.template_variables = {
            k: TemplateValueSourceType[v.upper()] for (k, v) in template_variables_config.items()
        }
        # TODO: Think more about whether default value should be BASIC or DETAILED
        level_of_detail_value = output_item_config.get("levelOfDetail")
        self.level_of_detail = LevelOfDetail[level_of_detail_value.upper()] \
            if level_of_detail_value is not None else default_lod


class SLX:
    base_name: str
    shortened_base_name: str
    base_template_name: str
    qualifiers: list[str]
    full_name: str
    level_of_detail: LevelOfDetail
    output_items: list[OutputItem]

    def parse_output_item(self, output_item_config: dict[str, Any]):
        output_item = OutputItem(output_item_config, self.level_of_detail)
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


class SLXRelationship:
    subject: str
    verb: RelationshipVerb
    object: str

    def __init__(self, subject: str, verb: RelationshipVerb, object: str):
        self.subject = subject
        self.verb = verb
        self.object = object


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
    def construct_from_config(generation_rule_config: dict[str, Any]) -> "GenerationRule":
        resource_types_config = generation_rule_config.get("resourceTypes")
        if not resource_types_config:
            raise WorkspaceBuilderException("A generation rule must specify at least one resource type to check")
        resource_type_specs = [ResourceTypeSpec.construct_from_config(rtc) for rtc in resource_types_config]
        match_predicate_configs: list[dict[str, Any]] = generation_rule_config.get("matchRules")
        match_predicates = [construct_match_predicate_from_config(mpc, construct_match_predicate_from_config)
                            for mpc in match_predicate_configs]
        match_predicate = AndMatchPredicate(match_predicates)
        output_items_config: list[dict[str, Any]] = generation_rule_config.get("outputItems", list())
        output_items = [OutputItem(oic) for oic in output_items_config]
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


def get_template_variables(output_item: OutputItem,
                           resource: Any,
                           base_template_variables: dict[str, Any]) -> dict[str, Any]:
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

    :return: dictionary of the template variables with the resolved/literal values
    """
    template_variables = base_template_variables.copy()

    # Always configure some built-in template variables for Kubernetes resources
    # This simplifies things for template authors, so they don't need to explicitly
    # declare these variables in generation rules.
    if isinstance(resource, models.KubernetesBase):
        cluster = resource.get_cluster()
        if cluster:
            template_variables['cluster'] = cluster
            context = cluster.get_context()
            if context:
                template_variables['context'] = context
        namespace = resource.get_namespace()
        if namespace:
            template_variables['namespace'] = namespace

    # FIXME: Probably don't need this anymore after we simplified the templating
    # scheme to get rid of the generic header template that included the 'kind' field.
    output_item_type = output_item.type.lower()
    if output_item_type == 'slx':
        kind = "ServiceLevelX"
    elif output_item_type == 'sli':
        kind = "ServiceLevelIndicator"
    elif output_item_type == 'slo':
        kind = "ServiceLevelObjective"
    elif output_item_type == 'runbook':
        kind = "Runbook"
    elif output_item_type == 'taskset':
        kind = "TaskSet"
    else:
        raise WorkspaceBuilderException(f"Unsupported output item type: {output_item.type}")
    template_variables['kind'] = kind

    for name, template_string in output_item.template_variables.items():
        value = render_template_string(template_string, template_variables)
        template_variables[name] = value

    return template_variables


def should_emit_output_item(output_item: OutputItem, level_of_detail: LevelOfDetail) -> bool:
    # FIXME: Would be a bit nicer if the enum instances were directly comparable
    return output_item and output_item.level_of_detail.value <= level_of_detail.value


def generate_output_item(output_item: OutputItem,
                         resource: models.KubernetesBase,
                         renderer_output_items: dict[str, RendererOutputItem],
                         base_template_variables: dict[str, Any]) -> bool:
    template_variables = get_template_variables(output_item, resource, base_template_variables)
    path_template = output_item.path
    path = render_template_string(path_template, template_variables)
    # Only emit the output item if it's a path we haven't seen/emitted yet.
    # The assumption is that output items triggered from different match
    # rules/sources but with the same template variable values (and thus the
    # same path after template substitution) are identical
    # And we can only have one output item at a given path anyway...
    if path in renderer_output_items:
        return False

    output_item = RendererOutputItem(path, output_item.template_name, template_variables)
    renderer_output_items[path] = output_item
    return True


def collect_emitted_slxs(generation_rule: GenerationRule,
                         resource: models.KubernetesBase,
                         level_of_detail: LevelOfDetail,
                         slxs: dict[str, SLXInfo]):
    for slx in generation_rule.slxs:
        # See if the SLX has anything to output, i.e. has some output item that's not
        # filtered out by the level of detail
        emit_slx = False
        for output_item in slx.output_items:
            if should_emit_output_item(output_item, level_of_detail):
                emit_slx = True
                break

        if emit_slx:
            slx_info = SLXInfo(slx, resource, level_of_detail)
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


def generate_slx_output_items(slx_info: SLXInfo,
                              base_template_variables: dict[str, Any],
                              renderer_output_items: dict[str, RendererOutputItem],
                              map_customization_rules: MapCustomizationRules,
                              groups: dict[str, Group],
                              slx_relationships: list[SLXRelationship]) -> None:
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
    :return:
    """
    resource = slx_info.resource
    namespace = resource.get_namespace()
    cluster = resource.get_cluster()

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
            generate_output_item(output_item, resource, renderer_output_items, slx_base_template_variables)

    customization_variables = {
        "resource": resource,
        "slx-info": slx_info
    }
    if namespace:
        customization_variables['namespace'] = namespace
    if cluster:
        customization_variables['cluster'] = cluster
    group_name_template = map_customization_rules.match_group_rules(slx_info, slx_base_template_variables)
    if group_name_template:
        group_name = render_template_string(group_name_template, customization_variables)
        group = groups.get(group_name)
        if not group:
            group = Group(group_name)
            groups[group_name] = group
        group.add_slx(slx_info.qualified_name)

    subject_template, verb = map_customization_rules.match_slx_relationship_rules(slx_info, slx_base_template_variables)
    if subject_template:
        subject = render_template_string(subject_template, customization_variables)
        object = slx_info.qualified_name
        if verb == RelationshipVerb.DEPENDED_ON_BY:
            verb = RelationshipVerb.DEPENDENT_ON
            subject, object = object, subject
        slx_relationship = SLXRelationship(subject, verb.value, object)
        slx_relationships.append(slx_relationship)


def load(context: Context) -> None:
    # FIXME: Should probably pull this initialization code out to somewhere
    # where it's only executed once, at least if we switch to a model
    # where the base generation rules aren't something that's specified
    # by the caller in a request param
    generation_rules_path_config = os.environ.get("GENERATION_RULES_PATH")
    if not generation_rules_path_config:
        generation_rules_path_config = "generation-rules"

    if not os.path.exists(generation_rules_path_config):
        raise WorkspaceBuilderException("Specified generation rules path does not exist")

    if not os.path.isdir(generation_rules_path_config):
        raise WorkspaceBuilderException("Specified generation rules path must be a directory")

    child_names = os.listdir(generation_rules_path_config)
    generation_rules_paths = [os.path.join(generation_rules_path_config, child_name) for child_name in child_names]

    slxs_by_shortened_base_name = dict()
    generation_rules = list()
    custom_resource_type_specs = list()
    for generation_rules_path in generation_rules_paths:
        with open(generation_rules_path, "r") as f:
            generation_rules_config_str = f.read()
        generation_rules_config = yaml.safe_load(generation_rules_config_str)
        generation_rule_config_list = generation_rules_config["spec"]["generationRules"]
        for generation_rule_config in generation_rule_config_list:
            generation_rule = GenerationRule.construct_from_config(generation_rule_config)
            generation_rules.append(generation_rule)
            for slx in generation_rule.slxs:
                shortened_base_name = slx.shortened_base_name
                slx_list = slxs_by_shortened_base_name.get(shortened_base_name)
                if not slx_list:
                    slx_list = []
                    slxs_by_shortened_base_name[shortened_base_name] = slx_list
                slx_list.append(slx)
            for resource_type_spec in generation_rule.resource_type_specs:
                if (resource_type_spec.resource_type == ResourceType.CUSTOM and
                        resource_type_spec not in custom_resource_type_specs):
                    custom_resource_type_specs.append(resource_type_spec)
            generation_rule.match_predicate.collect_custom_resource_type_specs(custom_resource_type_specs)

    # Check for collisions in the generation of the shortened SLX base names
    # Collision are resolved by appending with an incrementing integer
    for slx_list in slxs_by_shortened_base_name.values():
        if len(slx_list) > 1:
            for i, slx in enumerate(slx_list):
                slx.shortened_base_name = f"{slx.shortened_base_name}{i+1}"

    context.set_property(GENERATION_RULES_PROPERTY, generation_rules)
    context.set_property(CUSTOM_RESOURCE_TYPE_SPECS, custom_resource_type_specs)


def enrich(context: Context) -> None:

    map_customization_rules_path = context.get_setting("MAP_CUSTOMIZATION_RULES")
    map_customization_rules = MapCustomizationRules.load(map_customization_rules_path) \
        if map_customization_rules_path else MapCustomizationRules()

    custom_definitions = context.get_setting("CUSTOM_DEFINITIONS")

    # Create the list of output items in the context if it hasn't already been created.
    # FIXME: Seems a little kludgy to have to do this here (and in theory in any other
    # enricher that emits output items for the render_output_items renderer.
    # Might be cleaner if there was some way for the render_output_items component
    # to get a crack at creating it before the enrichers are executed. But that
    # would imply a more sophisticated lifecycle model for the components, which
    # seems like overkill at this point.
    renderer_output_items = context.get_property(OUTPUT_ITEMS_PROPERTY)
    if not renderer_output_items:
        renderer_output_items = dict()
        context.set_property(OUTPUT_ITEMS_PROPERTY, renderer_output_items)

    workspace_name = context.get_setting("WORKSPACE_NAME")
    workspace = models.RunWhenWorkspace.nodes.get(short_name=workspace_name)

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
        'resources': dict(),
    }

    generation_rules = context.get_property(GENERATION_RULES_PROPERTY)
    for generation_rule in generation_rules:
        for resource_type_spec in generation_rule.resource_type_specs:
            resources = get_resources(resource_type_spec, base_template_variables)
            for resource in resources:
                # Currently, the level of detail logic depends on the hclod enricher component
                # to tag the namespaces with the configured LOD value. So it must be enabled
                # and must execute before this component. Could manage this with a component
                # dependency, but support for that is not completely fleshed out at this point.
                # Alternatively, we could just read the relevant LOD settings directly here
                # and not rely on the tags in the namespace model instances.
                try:
                    # Wrap this logic in a try block to catch the cases where the
                    # kubernetes_resource instance is not a KubernetesNamespacedResource
                    # or if the hclod enricher was not enabled and didn't set the lod attribute.
                    # The other error that could occur is if the integer lod value in the setting
                    # doesn't map to a value LevelOfDetail enum value.
                    # In all those cases, we just catch it and default to full level of detail.
                    # FIXME: Should improve this so you don't get the warning for resource/model
                    # types that don't have an associated namespace
                    level_of_detail_value = resource.get_namespace().lod
                    level_of_detail = LevelOfDetail(level_of_detail_value)
                except Exception as e:
                    # FIXME: Should catch narrower exception
                    logger.warning(f"Level of detail lookup failed; defaulting to full LOD; "
                                   f"resource type={type(resource)}")
                    level_of_detail = LevelOfDetail.DETAILED
                resource_type = resource_type_spec.resource_type
                resource_name = resource_type_spec.get_name() \
                    if resource_type == ResourceType.CUSTOM else resource_type.value
                base_template_variables['resources'][resource_name] = resource
                matches = generation_rule.match_predicate.matches(resource, base_template_variables)
                if matches:
                    # Emit the non-SLX output items directly. We currently don't do any name/path config
                    # detection/resolution for these. I actually don't think we're using these for
                    # anything currently, so we might want to take out support for this to simplify
                    # things a bit.
                    for output_item in generation_rule.output_items:
                        if should_emit_output_item(output_item, level_of_detail):
                            generate_output_item(output_item, resource, renderer_output_items, base_template_variables)

                    collect_emitted_slxs(generation_rule, resource, level_of_detail, slxs)

    # Assign the shortened names to the enabled SLXs, including detecting and resolving any name conflicts.
    assign_slx_names(slxs, workspace.short_name)

    # Now that we've assigned the SLX names, we can generate the output items.
    for slx_info in slxs.values():
        generate_slx_output_items(slx_info,
                                  base_template_variables,
                                  renderer_output_items,
                                  map_customization_rules,
                                  groups,
                                  slx_relationships)

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

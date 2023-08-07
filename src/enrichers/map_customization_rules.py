import os
import re
from enum import Enum
from typing import Any, Optional, Union

import yaml

import models
from exceptions import WorkspaceBuilderException, WorkspaceBuilderUserException
from models import KubernetesBase
from name_utils import make_qualified_slx_name
from .match_predicate import MatchPredicate, StringMatchMode
from .match_predicate import base_construct_match_predicate_from_config, match_resource_path, matches_pattern


def get_qualifier_value(qualifier: str, resource: Union[models.KubernetesBase, models.RunWhenBase]) -> str:
    qualifier = qualifier.lower()
    if qualifier == 'resource':
        return resource.get_name()
    elif qualifier == 'namespace':
        return resource.get_namespace().get_name()
    elif qualifier == 'cluster':
        return resource.get_cluster().get_name()
    elif qualifier == 'context':
        return resource.get_context()
    else:
        raise WorkspaceBuilderException(f"Unknown qualifier type for SLX name: {qualifier}")


class SLXInfo:
    """
    This is basically the SLX config state plus other info that's derived
    """
    name: str
    base_name: str
    qualifiers: dict[str, str]
    qualifier_values: list[str]
    full_name: str
    qualified_name: str
    resource: KubernetesBase
    # FIXME: Problem with circular import detail with type annotation for LOD
    # level_of_detail: LevelOfDetail

    def __init__(self, slx, resource: KubernetesBase, level_of_detail):
        # FIXME: Currently, it doesn't work to specify the type hint for the
        # slx member due to circular import dependencies with generation_rules.
        # Should be able to resolve by refactoring some of the class definitions
        # but punting on that for now.
        self.slx = slx
        # Note: we mirror the base_name here from the underlying SLX object
        # because this class is a source of data to the customization rules,
        # and we want the base name to be a top-level setting for that.
        self.base_name = slx.base_name
        self.qualifiers = {q: get_qualifier_value(q, resource) for q in slx.qualifiers}
        self.qualifier_values = [self.qualifiers[q] for q in slx.qualifiers]
        self.full_name = make_qualified_slx_name(slx.base_name, self.qualifier_values, None)
        self.resource = resource
        self.level_of_detail = level_of_detail


class MatchProperty(Enum):
    NAME = "name"
    FULL_NAME = "full-name"
    BASE_NAME = "base-name"
    QUALIFIED_NAME = "qualified-name"
    NAMESPACE = "namespace"
    CLUSTER = "cluster"


class SLXPropertyMatchPredicate(MatchPredicate):

    TYPE_NAME: str = "pattern"

    # FIXME: Should maybe make this just be a string to avoid the awkward union typing.
    # Then might make sense to get rid of the MatchProperty enum?
    match_property: Union[MatchProperty, str]
    match_pattern: re.Pattern
    string_match_mode: StringMatchMode

    def __init__(self, match_property: MatchProperty, match_pattern: str,
                 string_match_mode: StringMatchMode = StringMatchMode.EXACT):
        self.match_property = match_property
        self.match_pattern = re.compile(match_pattern)
        self.string_match_mode = string_match_mode

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any]) -> "SLXPropertyMatchPredicate":
        match_property_value = predicate_config.get("matchProperty")
        if not match_property_value:
            # Temporary backwards-compatibility code to handle the old name for this.
            # FIXME: Should get rid of this soon once any existing customization rules
            # have been updated to the new name.
            match_property_value = predicate_config.get("matchType")
        if not match_property_value:
            raise WorkspaceBuilderException('A "matchProperty" field must be specified for '
                                            'a SLX property match predicate')
        try:
            match_property = MatchProperty(match_property_value.lower())
        except Exception as e:
            # If it's not one of the pre-defined property value, then we treat it as
            # a path property that's resolved against the raw Kubernetes resource data
            match_property = match_property_value
        match_pattern = predicate_config.get("pattern")
        if not match_pattern:
            raise WorkspaceBuilderUserException('A "pattern" field is required for a property match predicate.')
        string_match_mode_value = predicate_config.get('matchMode', StringMatchMode.SUBSTRING.value)
        string_match_mode = StringMatchMode(string_match_mode_value.lower())
        return SLXPropertyMatchPredicate(match_property, match_pattern, string_match_mode)

    def matches(self, slx_info: SLXInfo, variables: dict[str, Any]) -> bool:
        if self.match_property == MatchProperty.NAME:
            match_value = slx_info.name
        elif self.match_property == MatchProperty.FULL_NAME:
            match_value = slx_info.full_name
        elif self.match_property == MatchProperty.BASE_NAME:
            match_value = slx_info.base_name
        elif self.match_property == MatchProperty.QUALIFIED_NAME:
            match_value = slx_info.qualified_name
        elif self.match_property == MatchProperty.NAMESPACE:
            match_value = slx_info.qualifiers.get('namespace')
        elif self.match_property == MatchProperty.CLUSTER:
            match_value = slx_info.qualifiers.get('cluster')
        else:
            path = self.match_property

            def match_func(value: str) -> bool:
                return matches_pattern(value, self.match_pattern, self.string_match_mode)

            match = match_resource_path(slx_info.resource.resource, path, match_func)
            return match
        if match_value is None:
            return False
        match = matches_pattern(match_value, self.match_pattern, self.string_match_mode)
        return match


class GroupPropertyMatchPredicate(MatchPredicate):

    TYPE_NAME: str = "pattern"

    match_property: MatchProperty
    match_pattern: re.Pattern
    string_match_mode: StringMatchMode

    def __init__(self, match_property: MatchProperty, match_pattern: re.Pattern, string_match_mode: StringMatchMode):
        self.match_property = match_property
        self.match_pattern = match_pattern
        self.string_match_mode = string_match_mode

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any]) -> "GroupPropertyMatchPredicate":
        match_property_config = predicate_config.get("matchProperty")
        match_property = MatchProperty(match_property_config.lower()) if match_property_config else MatchProperty.NAME
        match_pattern = predicate_config.get("pattern")
        if not match_pattern:
            raise WorkspaceBuilderUserException('A "pattern" field is required for a property match predicate.')
        string_match_mode_value = predicate_config.get('matchMode', StringMatchMode.SUBSTRING.value)
        string_match_mode = StringMatchMode(string_match_mode_value.lower())
        return GroupPropertyMatchPredicate(match_property, match_pattern, string_match_mode)

    def matches(self, group_info: str, variables: dict[str, Any]) -> bool:
        if self.match_property != MatchProperty.NAME:
            raise WorkspaceBuilderUserException('Currently group property matches only support the "name" property')
        # TODO: Currently the group info is just the group name, so it's the same as the name property
        # Eventually the group info will include more info about the group, e.g. any qualifiers/substitutions
        # that were used when the group was created via a group rule.
        match_value = group_info
        match = matches_pattern(match_value, self.match_pattern, self.string_match_mode)
        return match


def construct_slx_match_predicate_from_config(predicate_config: dict[str, Any],
                                              parent_construct_from_config) -> MatchPredicate:
    match_predicate_type = predicate_config.get('type')
    if match_predicate_type == SLXPropertyMatchPredicate.TYPE_NAME:
        match_predicate = SLXPropertyMatchPredicate.construct_from_config(predicate_config)
    else:
        match_predicate = base_construct_match_predicate_from_config(predicate_config,
                                                                     parent_construct_from_config)
    return match_predicate


def construct_group_match_predicate_from_config(predicate_config: dict[str, Any],
                                                parent_construct_from_config) -> MatchPredicate:
    match_predicate_type = predicate_config.get('type')
    if match_predicate_type == GroupPropertyMatchPredicate.TYPE_NAME:
        match_predicate = GroupPropertyMatchPredicate.construct_from_config(predicate_config)
    else:
        match_predicate = base_construct_match_predicate_from_config(predicate_config,
                                                                     parent_construct_from_config)
    return match_predicate


class GroupRule:
    """
    A customization rule that maps SLXs to groups.
    """
    match_predicate: MatchPredicate
    group_name: str
    priority: int

    def __init__(self, match_predicate: MatchPredicate, group_name: str, priority: int):
        self.match_predicate = match_predicate
        self.group_name = group_name
        self.priority = priority

    @staticmethod
    def construct_from_config(group_rule_config: dict[str, Any]):
        match_predicate_config = group_rule_config.get("match")
        if not match_predicate_config:
            raise WorkspaceBuilderUserException(f'A match predicate must be specified for a group rule')
        match_predicate = construct_slx_match_predicate_from_config(match_predicate_config,
                                                                    construct_slx_match_predicate_from_config)
        group_name = group_rule_config.get("group")
        if not group_name:
            raise WorkspaceBuilderUserException(f'A group name must be specified for a group rule')
        priority = group_rule_config.get('priority', 0)
        return GroupRule(match_predicate, group_name, priority)

    def match(self, slx_info: SLXInfo, variables: dict[str, Any]) -> Optional[str]:
        matches = self.match_predicate.matches(slx_info, variables)
        if not matches:
            return None
        return self.group_name


class RelationshipVerb(Enum):
    DEPENDENT_ON = "dependent-on"
    DEPENDED_ON_BY = "depended-on-by"


class RelationshipRule:
    """
    Rule to specify dependencies among groups.
    """
    subject: str
    verb: RelationshipVerb
    matches: list[MatchPredicate]

    def __init__(self, subject: str, verb: RelationshipVerb, matches: list[MatchPredicate]):
        self.subject = subject
        self.verb = verb
        self.matches = matches

    @staticmethod
    def construct_from_config(group_relationship_rule_config: dict[str, Any],
                              default_verb: RelationshipVerb,
                              construct_match_predicate_func) -> "RelationshipRule":
        subject = group_relationship_rule_config.get("subject")
        if not subject:
            raise WorkspaceBuilderException('A "subject" group must be specified for a group relationship rule')
        verb_string = group_relationship_rule_config.get("verb")
        verb = RelationshipVerb(verb_string.lower()) if verb_string is not None else default_verb
        match_configs = group_relationship_rule_config.get("matches")
        if not match_configs:
            raise WorkspaceBuilderException('A non-empty "objects" list of group names must '
                                            'be specified for a group relationship rule')
        matches = [construct_match_predicate_func(mc, construct_match_predicate_func) for mc in match_configs]
        return RelationshipRule(subject, verb, matches)

    def match(self, info: Any, variables: dict[str, Any]) -> bool:
        for match_predicate in self.matches:
            # TODO: Do we need to return the match_predicate somehow to continue
            # processing the rule? Probably not in the simple cases, but might
            # be useful in more complicated cases.
            if match_predicate.matches(info, variables):
                return True
        return False


class MapCustomizationRules:
    """
    Rules/settings that are specified by the user that customize the generation of the map.
    """
    group_rules: list[GroupRule]
    group_relationship_rules: list[RelationshipRule]
    slx_relationship_rules: list[RelationshipRule]

    def __init__(self, group_rules: list[GroupRule] = None,
                 group_relationship_rules: list[RelationshipRule] = None,
                 slx_relationship_rules: list[RelationshipRule] = None):
        if not group_rules:
            group_rules = []
        if not group_relationship_rules:
            group_relationship_rules = []
        if not slx_relationship_rules:
            slx_relationship_rules = []
        group_rules.sort(key=lambda e: e.priority)
        self.group_rules = group_rules
        self.group_relationship_rules = group_relationship_rules
        self.slx_relationship_rules = slx_relationship_rules

    @staticmethod
    def construct_from_config(map_customization_rules_config: dict[str, Any]) -> "MapCustomizationRules":
        kind = map_customization_rules_config['kind']
        if kind != "MapCustomizationRules":
            raise WorkspaceBuilderUserException(f'Expected "kind" value for map customization rules file '
                                                f'to be "MapCustomizationRules"; actual="{kind}"')
        spec = map_customization_rules_config.get('spec', {})
        group_rule_configs = spec.get("groupRules", [])
        group_rules = [GroupRule.construct_from_config(grc) for grc in group_rule_configs]
        group_relationship_verb_default_config: str = spec.get("groupRelationVerbDefault")
        group_relationship_verb_default = RelationshipVerb(group_relationship_verb_default_config) \
            if group_relationship_verb_default_config else RelationshipVerb.DEPENDENT_ON
        group_relationship_rule_configs = spec.get("groupRelationshipRules", [])
        group_relationship_rules = [
            RelationshipRule.construct_from_config(group_relationship_rule_config,
                                                   group_relationship_verb_default,
                                                   construct_group_match_predicate_from_config)
            for group_relationship_rule_config in group_relationship_rule_configs
        ]
        slx_relationship_verb_default_config: str = spec.get("slxRelationVerbDefault")
        slx_relationship_verb_default = RelationshipVerb(slx_relationship_verb_default_config) \
            if slx_relationship_verb_default_config else RelationshipVerb.DEPENDENT_ON
        slx_relationship_rule_configs = spec.get("slxRelationshipRules", [])
        slx_relationship_rules = [
            RelationshipRule.construct_from_config(slx_relationship_rule_config,
                                                   slx_relationship_verb_default,
                                                   construct_slx_match_predicate_from_config)
            for slx_relationship_rule_config in slx_relationship_rule_configs
        ]
        return MapCustomizationRules(group_rules, group_relationship_rules, slx_relationship_rules)

    @staticmethod
    def construct_from_config_file(file_path: str) -> "MapCustomizationRules":
        with open(file_path, "r") as f:
            map_customization_rules_config_text = f.read()
        map_customization_rules_config = yaml.safe_load(map_customization_rules_config_text)
        return MapCustomizationRules.construct_from_config(map_customization_rules_config)

    @staticmethod
    def merge(map_customization_rules_list: list["MapCustomizationRules"]) -> "MapCustomizationRules":
        # Merge the lists from all the separate map customization rules
        merged_group_rules = list()
        merged_group_relationship_rules = list()
        merged_slx_relationship_rules = list()
        for map_customization_rules in map_customization_rules_list:
            merged_group_rules += map_customization_rules.group_rules
            merged_group_relationship_rules += map_customization_rules.group_relationship_rules
            merged_slx_relationship_rules += map_customization_rules.slx_relationship_rules

        return MapCustomizationRules(merged_group_rules,
                                     merged_group_relationship_rules,
                                     merged_slx_relationship_rules)

    @staticmethod
    def load(map_customization_rules_path: Optional[str]) -> "MapCustomizationRules":
        if not map_customization_rules_path:
            map_customization_rules_path = os.environ.get("MAP_CUSTOMIZATION_RULES_PATH")
            if not map_customization_rules_path:
                map_customization_rules_path = "map-customization-rules"

        if not os.path.exists(map_customization_rules_path):
            raise WorkspaceBuilderException("Specified map customization rules path does not exist")

        if os.path.isdir(map_customization_rules_path):
            child_names = os.listdir(map_customization_rules_path)
            map_customization_rules_paths = [os.path.join(map_customization_rules_path, child_name)
                                             for child_name in child_names]
        else:
            map_customization_rules_paths = [map_customization_rules_path]

        map_customization_rules_list = [MapCustomizationRules.construct_from_config_file(path)
                                        for path in map_customization_rules_paths]
        merged_map_customization_rules = MapCustomizationRules.merge(map_customization_rules_list)
        return merged_map_customization_rules

    def match_group_rules(self, slx_info: SLXInfo, variables: dict[str, Any]) -> Optional[str]:
        for group_rule in self.group_rules:
            group = group_rule.match(slx_info, variables)
            if group:
                return group
        return None

    def _match_relationship_rules(self, match_info,
                                  variables: dict[str, Any],
                                  relationship_rules: list[RelationshipRule]) -> tuple[Optional[str],
                                                                                       Optional[RelationshipVerb]]:
        for relationship_rule in relationship_rules:
            matches = relationship_rule.match(match_info, variables)
            if matches:
                return relationship_rule.subject, relationship_rule.verb
        return None, None

    def match_group_relationship_rules(self,
                                       group_info: str,
                                       variables: dict[str, Any]) -> tuple[Optional[str], Optional[RelationshipVerb]]:
        return self._match_relationship_rules(group_info, variables, self.group_relationship_rules)

    def match_slx_relationship_rules(self,
                                     slx_info: SLXInfo,
                                     variables: dict[str, Any]) -> tuple[Optional[str], Optional[RelationshipVerb]]:
        return self._match_relationship_rules(slx_info, variables, self.slx_relationship_rules)

import os
import re
from enum import Enum
from typing import Any, Optional
import logging

import yaml

from component import Context
from exceptions import WorkspaceBuilderException, WorkspaceBuilderUserException
from name_utils import make_qualified_slx_name
from resources import Resource
from .generation_rule_types import PlatformHandler, PLATFORM_HANDLERS_PROPERTY_NAME
from .match_predicate import MatchPredicate, StringMatchMode
from .match_predicate import base_construct_match_predicate_from_config, match_path, matches_pattern

logger = logging.getLogger(__name__)

def get_qualifier_value(qualifier: str, resource: Resource, context: Context) -> Optional[str]:
    try:
        qualifier = qualifier.lower()
        if qualifier == 'resource':
            return resource.name
        
        platform_handlers: dict[str, PlatformHandler] = context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
        platform_name = resource.resource_type.platform.name
        platform_handler = platform_handlers[platform_name]

        value = platform_handler.get_resource_qualifier_value(resource, qualifier)
        if value is None:
            raise WorkspaceBuilderException(f'Unresolved qualifier value for SLX name: "{qualifier}"')
        
        return value

    except WorkspaceBuilderException as e:
        logger.warning(f"Unresolved qualifier for SLX '{qualifier}' in resource '{resource.name}'. "
                       f"Check include/exclude labels on parent resources: {e}")
        return None  # Return None to allow calling function to handle missing qualifier gracefully
    except Exception as e:
        logger.error(f"Unexpected error retrieving qualifier '{qualifier}' for resource '{resource.name}': {e}")
        return None


class SLXInfo:
    """
    This is basically the SLX config state plus other info that's derived from that.
    """
    name: str
    base_name: str
    qualifiers: dict[str, str]
    qualifier_values: list[str]
    # Names of all child resources (e.g., individual database resources) that contributed
    # to this SLX. When the SLX qualifier list does not include "resource" we aggregate
    # the names of *all* matching resources so that templates can reference them (for
    # example, to publish them as SLX tags).
    child_resource_names: list[str]
    full_name: str
    qualified_name: str
    resource: Resource

    # FIXME: Problem with circular import detail with type annotation for LOD
    # level_of_detail: LevelOfDetail

    def __init__(self, slx, resource: Resource, level_of_detail, generation_rule_info, context: Context):
        # FIXME: Currently, it doesn't work to specify the type hint for the
        # slx member due to circular import dependencies with generation_rules.
        # Should be able to resolve by refactoring some of the class definitions
        # but punting on that for now.
        self.slx = slx
        # Note: we mirror the base_name here from the underlying SLX object
        # because this class is a source of data to the customization rules,
        # and we want the base name to be a top-level setting for that.
        self.base_name = slx.base_name
        self.qualifiers = {q: get_qualifier_value(q, resource, context) for q in slx.qualifiers}
        self.qualifier_values = [self.qualifiers[q] for q in slx.qualifiers]
        self.full_name = make_qualified_slx_name(slx.base_name, self.qualifier_values, None)
        self.resource = resource
        # Track the initial resource; additional names may be aggregated later.
        self.child_resource_names = [resource.name]
        self.level_of_detail = level_of_detail
        # FIXME: It's a little kludgy to have this in the the SLX info, since it's
        # not really related to map customization rules and the evaluation of match
        # predicates on the SLX info. But we need to pass it around with the SLX info
        # to be able to have the info we need to find/load the associated templates
        # when we get to the template rendering phase. If we didn't put it here we
        # would have had to have another layer of data structure in the generation
        # rules code (possibly just a tuple) that's passed around as a unit when
        # we're working with the SLXs, which seemed like it would just be more confusing.
        # At some point, it makes sense to revisit some of the data structure
        # decisions based on how the code has evolved.
        # Also, note that we don't have a type hint for this member to avoid circular
        # dependencies between this module and generation_rules, which is also
        # a smell that the data structures aren't as clean as they should be...
        self.generation_rule_info = generation_rule_info

    def __repr__(self):
        try:
            return (f"SLXInfo(base_name={self.base_name!r}, "
                    f"qualifiers={self.qualifiers!r}, qualifier_values={self.qualifier_values!r}, "
                    f"child_resource_names={self.child_resource_names!r}, "
                    f"full_name={self.full_name!r}, resource={self.resource!r}, "
                    f"level_of_detail={self.level_of_detail!r}, generation_rule_info={self.generation_rule_info!r})")
        except Exception as e:
            return f"SLXInfo(repr error: {e})"

    # ---------------------------------------------------------------------
    # Helper API
    # ---------------------------------------------------------------------

    def add_child_resource_name(self, name: str):
        """Add an additional child resource name, ensuring we don't introduce duplicates."""
        if name not in self.child_resource_names:
            self.child_resource_names.append(name)


class SLXPropertyMatchPredicate(MatchPredicate):

    TYPE_NAME: str = "pattern"

    match_property: str
    match_pattern: re.Pattern
    string_match_mode: StringMatchMode

    def __init__(self, match_property: str, match_pattern: str,
                 string_match_mode: StringMatchMode = StringMatchMode.EXACT):
        self.match_property = match_property
        self.match_pattern = re.compile(match_pattern)
        self.string_match_mode = string_match_mode

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any]) -> "SLXPropertyMatchPredicate":
        match_property = predicate_config.get("matchProperty")
        if not match_property:
            # Temporary backwards-compatibility code to handle the old name for this.
            # FIXME: Should get rid of this soon once any existing customization rules
            # have been updated to the new name.
            match_property = predicate_config.get("matchType")
        if not match_property:
            raise WorkspaceBuilderException('A "matchProperty" field must be specified for '
                                            'a SLX property match predicate')
        match_pattern = predicate_config.get("pattern")
        if not match_pattern:
            raise WorkspaceBuilderUserException('A "pattern" field is required for a property match predicate.')
        string_match_mode_value = predicate_config.get('matchMode', StringMatchMode.SUBSTRING.value)
        string_match_mode = StringMatchMode(string_match_mode_value.lower())
        return SLXPropertyMatchPredicate(match_property, match_pattern, string_match_mode)

    def matches(self, slx_info: SLXInfo) -> bool:
        lower_case_match_property = self.match_property.lower()
        if lower_case_match_property == "name":
            match_value = slx_info.name
        elif lower_case_match_property == "full-name":
            match_value = slx_info.full_name
        elif lower_case_match_property == "base-name":
            match_value = slx_info.base_name
        elif lower_case_match_property == "qualified-name":
            match_value = slx_info.qualified_name
        else:
            match_value = slx_info.qualifiers.get(lower_case_match_property)
            if match_value is None:
                def match_func(value: str) -> bool:
                    return matches_pattern(value, self.match_pattern, self.string_match_mode)

                try:
                    resource = getattr(slx_info.resource, "resource")
                except AttributeError:
                    resource = slx_info.resource
                match = match_path(resource, self.match_property, match_func)
                logger.debug(
                    f"SLXPropertyMatchPredicate: property='{self.match_property}', pattern='{self.match_pattern}', "
                    f"resource='{resource}', match={match}"
                )
                return match
        if match_value is None:
            logger.debug(
                f"SLXPropertyMatchPredicate: property='{self.match_property}', no value found in SLXInfo qualifiers."
            )
            return False
        match = matches_pattern(match_value, self.match_pattern, self.string_match_mode)
        logger.debug(
            f"SLXPropertyMatchPredicate: property='{self.match_property}', value='{match_value}', "
            f"pattern='{self.match_pattern}', match={match}"
        )
        return match


class GroupPropertyMatchPredicate(MatchPredicate):

    TYPE_NAME: str = "pattern"

    match_property: str
    match_pattern: re.Pattern
    string_match_mode: StringMatchMode

    def __init__(self, match_property: str, match_pattern: re.Pattern, string_match_mode: StringMatchMode):
        self.match_property = match_property
        self.match_pattern = match_pattern
        self.string_match_mode = string_match_mode

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any]) -> "GroupPropertyMatchPredicate":
        match_property = predicate_config.get("matchProperty")
        if not match_property:
            match_property = "name"
        match_pattern = predicate_config.get("pattern")
        if not match_pattern:
            raise WorkspaceBuilderUserException('A "pattern" field is required for a property match predicate.')
        string_match_mode_value = predicate_config.get('matchMode', StringMatchMode.SUBSTRING.value)
        string_match_mode = StringMatchMode(string_match_mode_value.lower())
        return GroupPropertyMatchPredicate(match_property, match_pattern, string_match_mode)

    def matches(self, group_info: str) -> bool:
        if self.match_property != "name":
            raise WorkspaceBuilderUserException('Currently group property matches only support the "name" property')
        # TODO: Currently the group info is just the group name, so it's the same as the name property
        # Eventually the group info may include more info about the group, e.g. any qualifiers/substitutions
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

    def match(self, slx_info: SLXInfo) -> Optional[str]:
        matches = self.match_predicate.matches(slx_info)
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

    def match(self, info: Any,) -> bool:
        for match_predicate in self.matches:
            # TODO: Do we need to return the match_predicate somehow to continue
            # processing the rule? Probably not in the simple cases, but might
            # be useful in more complicated cases.
            if match_predicate.matches(info):
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

    def match_group_rules(self, slx_info: SLXInfo) -> Optional[str]:
        for group_rule in self.group_rules:
            group = group_rule.match(slx_info)
            if group:
                return group
        return None

    @staticmethod
    def _match_relationship_rules(match_info,
                                  relationship_rules: list[RelationshipRule]) -> tuple[Optional[str],
                                                                                       Optional[RelationshipVerb]]:
        for relationship_rule in relationship_rules:
            matches = relationship_rule.match(match_info)
            if matches:
                return relationship_rule.subject, relationship_rule.verb
        return None, None

    def match_group_relationship_rules(self, group_info: str) -> tuple[Optional[str], Optional[RelationshipVerb]]:
        return self._match_relationship_rules(group_info, self.group_relationship_rules)

    def match_slx_relationship_rules(self, slx_info: SLXInfo) -> tuple[Optional[str], Optional[RelationshipVerb]]:
        return self._match_relationship_rules(slx_info, self.slx_relationship_rules)

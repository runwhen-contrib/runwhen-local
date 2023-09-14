import re
from abc import ABC, abstractmethod
from collections.abc import Iterable
from enum import Enum
from typing import Any

from exceptions import WorkspaceBuilderException


class StringMatchMode(Enum):
    EXACT = "exact"
    SUBSTRING = "substring"


def matches_pattern(value: str, pattern: re.Pattern, string_match_mode: StringMatchMode) -> bool:
    match = pattern.match(value) if string_match_mode == StringMatchMode.EXACT else pattern.search(value)
    return match is not None


class MatchPredicate(ABC):
    @abstractmethod
    def matches(self, info: Any, variables: dict[str, Any]) -> bool: ...

    # FIXME: Not super clean to have this method here, since it only applies to
    # gen rule predicates. Would probably be cleaner to use some sort of visitor
    # pattern instead...
    def collect_custom_resource_type_specs(self, custom_resource_type_specs):
        pass


class AndMatchPredicate(MatchPredicate):
    """
    Match predicate that matches if all of its child predicates match.
    """
    TYPE_NAME: str = "and"

    predicates: list[MatchPredicate]

    def __init__(self, predicates: list[MatchPredicate]):
        self.predicates = predicates

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any], parent_construct_from_config):
        child_predicate_configs = predicate_config['matches']
        if not isinstance(child_predicate_configs, Iterable):
            raise WorkspaceBuilderException("Child predicates for an OR match predicate must be iterable")
        child_predicates = [parent_construct_from_config(cpc, parent_construct_from_config)
                            for cpc in child_predicate_configs]
        return AndMatchPredicate(child_predicates)

    def matches(self, info: Any, variables: dict[str, Any]):
        for predicate in self.predicates:
            match = predicate.matches(info, variables)
            if not match:
                return False
        return True

    def collect_custom_resource_type_specs(self, custom_resource_type_specs):
        for predicate in self.predicates:
            predicate.collect_custom_resource_type_specs(custom_resource_type_specs)


class OrMatchPredicate(MatchPredicate):
    """
    Match predicate that matches if any of its child predicates match.
    """
    TYPE_NAME: str = "or"

    predicates: list[MatchPredicate]

    def __init__(self, predicates: list[MatchPredicate]):
        self.predicates = predicates

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any], parent_construct_from_config):
        child_predicate_configs = predicate_config['matches']
        if not isinstance(child_predicate_configs, Iterable):
            raise WorkspaceBuilderException("Child predicates for an OR match predicate must be iterable")
        child_predicates = [parent_construct_from_config(cpc, parent_construct_from_config)
                            for cpc in child_predicate_configs]
        return OrMatchPredicate(child_predicates)

    def matches(self, info: Any, variables: dict[str, Any]):
        for predicate in self.predicates:
            match = predicate.matches(info, variables)
            if match:
                return True
        return False

    def collect_custom_resource_type_specs(self, custom_resource_type_specs):
        for predicate in self.predicates:
            predicate.collect_custom_resource_type_specs(custom_resource_type_specs)


class NotMatchPredicate(MatchPredicate):
    """
    Match predicate that matches if its child predicate does not match.
    """
    TYPE_NAME: str = "not"

    predicate: MatchPredicate

    def __init__(self, predicate):
        self.predicate = predicate

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any], parent_construct_from_config):
        for predicate_name in ['match', 'matches', 'predicate']:
            child_predicate_config = predicate_config.get(predicate_name)
            if child_predicate_config:
                break
        else:
            raise WorkspaceBuilderException('A "not" predicate expects a single child predicate field named "match"')
        child_predicate = parent_construct_from_config(child_predicate_config, parent_construct_from_config)
        return NotMatchPredicate(child_predicate)

    def matches(self, info: Any, variables: dict[str, Any]):
        return not self.predicate.matches(info, variables)

    def collect_custom_resource_type_specs(self, custom_resource_type_specs):
        self.predicate.collect_custom_resource_type_specs(custom_resource_type_specs)


def base_construct_match_predicate_from_config(predicate_config: dict[str, Any],
                                               parent_construct_from_config) -> MatchPredicate:
    match_predicate_type = predicate_config.get('type')
    if not match_predicate_type:
        raise WorkspaceBuilderException('A "type" field is required for a match predicate')
    if match_predicate_type == AndMatchPredicate.TYPE_NAME:
        match_predicate = AndMatchPredicate.construct_from_config(predicate_config,
                                                                  parent_construct_from_config)
    elif match_predicate_type == OrMatchPredicate.TYPE_NAME:
        match_predicate = OrMatchPredicate.construct_from_config(predicate_config,
                                                                 parent_construct_from_config)
    elif match_predicate_type == NotMatchPredicate.TYPE_NAME:
        match_predicate = NotMatchPredicate.construct_from_config(predicate_config,
                                                                  parent_construct_from_config)
    else:
        raise WorkspaceBuilderException(f"Unknown/unsupported match predicate type: {match_predicate_type}")
    return match_predicate


def path_to_components(path: str, separator_char=None) -> list[str]:
    if separator_char:
        components = path.split(separator_char)
    elif path.find('//') >= 0:
        slash_replacement = "!$^]"
        path = path.replace('//', slash_replacement)
        components = path.split('/')
        components = [component.replace(slash_replacement, '/') for component in components]
    else:
        components = path.split('/')
    return components


def _match_resource_path(data, path_components: list[str], match_func) -> bool:
    at_end_of_path = len(path_components) == 0

    if isinstance(data, str):
        # If there are still more path components, but we've reached a scalar string,
        # then we can't resolve the rest of the path, which we treat as a mismatch.
        # Note: We need to special-case str here because it is an Iterable instance
        # and would get handled by the Iterable case below, which we don't want.
        return at_end_of_path and match_func(data)
    elif isinstance(data, dict):
        if at_end_of_path:
            return False
        next_component = path_components[0]
        item = data.get(next_component)
        if item is None:
            return False
        remaining_components = path_components[1:]
        return _match_resource_path(item, remaining_components, match_func)
    if isinstance(data, Iterable):
        for item in data:
            if _match_resource_path(item, path_components, match_func):
                return True
        return False
    else:
        # If there are still more path components, but we've reached a scalar value,
        # then we can't resolve the rest of the path, which we treat as a mismatch.
        return at_end_of_path and match_func(str(data))


def match_resource_path(data: Any, path: str, match_func) -> bool:
    path_components = path_to_components(path)
    match = _match_resource_path(data, path_components, match_func)
    return match

import re
from abc import ABC, abstractmethod
from collections.abc import Iterable
from enum import Enum
from typing import Any

from exceptions import WorkspaceBuilderException
from resources import Resource

import logging
logger = logging.getLogger(__name__)

class StringMatchMode(Enum):
    EXACT = "exact"
    SUBSTRING = "substring"


def matches_pattern(value: str, pattern: re.Pattern, string_match_mode: StringMatchMode) -> bool:
    match = pattern.match(value) if string_match_mode == StringMatchMode.EXACT else pattern.search(value)
    return match is not None


class Visitor(ABC):
    @abstractmethod
    def visit(self, match_predicate: "MatchPredicate"): ...


class MatchPredicate(ABC):
    @abstractmethod
    def matches(self, match_info: Any) -> bool: ...

    def accept(self, visitor: Visitor):
        """
        Implementation of the visitor pattern
        """
        visitor.visit(self)


class CompoundMatchPredicate(MatchPredicate):

    predicates: list[MatchPredicate]

    def __init__(self, predicates: list[MatchPredicate]):
        self.predicates = predicates

    def matches(self, match_info: Any) -> bool:
        """
        Subclasses should override this, so this should never be called, but we
        need to implement it to keep the abstract base class mechanism happy.

        FIXME: Is there some way in Python to have an intermediate abstract base
        class that's meant to always be subclassed and doesn't have to implement
        all of the abstract methods?
        """
        raise WorkspaceBuilderException(f"Subclasses of CompoundMatchPredicate must implement the matches method: "
                                        f"class={type(self)}")

    def accept(self, visitor: Visitor):
        super().accept(visitor)
        for child_predicate in self.predicates:
            child_predicate.accept(visitor)



class AndMatchPredicate(CompoundMatchPredicate):
    """
    Match predicate that matches if all of its child predicates match.
    """
    TYPE_NAME: str = "and"

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any], parent_construct_from_config):
        child_predicate_configs = predicate_config['matches']
        if not isinstance(child_predicate_configs, Iterable):
            raise WorkspaceBuilderException("Child predicates for an OR match predicate must be iterable")
        child_predicates = [parent_construct_from_config(cpc, parent_construct_from_config)
                            for cpc in child_predicate_configs]
        return AndMatchPredicate(child_predicates)

    def matches(self, match_info: Any):
        for predicate in self.predicates:
            match = predicate.matches(match_info)
            if not match:
                return False
        return True


class OrMatchPredicate(CompoundMatchPredicate):
    """
    Match predicate that matches if any of its child predicates match.
    """
    TYPE_NAME: str = "or"

    @staticmethod
    def construct_from_config(predicate_config: dict[str, Any], parent_construct_from_config):
        child_predicate_configs = predicate_config['matches']
        if not isinstance(child_predicate_configs, Iterable):
            raise WorkspaceBuilderException("Child predicates for an OR match predicate must be iterable")
        child_predicates = [parent_construct_from_config(cpc, parent_construct_from_config)
                            for cpc in child_predicate_configs]
        return OrMatchPredicate(child_predicates)

    def matches(self, match_info: Any):
        for predicate in self.predicates:
            match = predicate.matches(match_info)
            if match:
                return True
        return False


class NotMatchPredicate(MatchPredicate):
    """
    Match predicate that matches if its child predicate does not match.
    """
    TYPE_NAME: str = "not"

    predicates: MatchPredicate

    def __init__(self, predicate: MatchPredicate):
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

    def matches(self, match_info: Any):
        return not self.predicate.matches(match_info)

    def accept(self, visitor: Visitor):
        super().accept(visitor)
        self.predicate.accept(visitor)


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

def _match_path(data, path_components: list[str], match_func) -> bool:
    at_end_of_path = len(path_components) == 0

    if isinstance(data, str):
        # If there are still more path components, but we've reached a scalar string,
        # then we can't resolve the rest of the path, which we treat as a mismatch.
        # Note: We need to special-case str here because it is an Iterable instance
        # and would get handled by the Iterable case below, which we don't want.
        return at_end_of_path and match_func(data)
    if isinstance(data, dict):
        if at_end_of_path:
            return False
        next_component = path_components[0]
        item = data.get(next_component)
        if item is None:
            return False
        remaining_components = path_components[1:]
        return _match_path(item, remaining_components, match_func)
    if isinstance(data, Iterable):
        for item in data:
            if _match_path(item, path_components, match_func):
                return True
        return False
    # If there are still more path components, but we've reached a scalar value,
    # then we can't resolve the rest of the path, which we treat as a mismatch.
    return at_end_of_path and match_func(str(data))


def match_path(data: Any, path: str, match_func) -> bool:
    path_components = path_to_components(path)
    match = _match_path(data, path_components, match_func)
    return match

from dataclasses import dataclass
from fnmatch import fnmatch
import logging
import os
from enum import Enum
import re
from tempfile import TemporaryDirectory
from typing import Any, Optional, Union

import yaml
from git import Repo, Reference, Tree, Blob, Submodule

from exceptions import (
    WorkspaceBuilderException,
    WorkspaceBuilderUserException,
    WorkspaceBuilderObjectNotFoundException
)
from .match_predicate import StringMatchMode
from git_utils import get_repo_name, create_repo_directory

logger = logging.getLogger(__name__)

DEFAULT_CODE_COLLECTIONS_FILE_NAME = "default-code-collections.yaml"

class CodeCollectionAction(Enum):
    INCLUDE = "include"
    EXCLUDE = "exclude"

class PatternType(Enum):
    LITERAL = "literal"
    REGEX = "regex"
    GLOB = "glob"

PATTERN_TYPE_FIELD_NAME = "patternType"
PATTERN_FIELD_NAME = "pattern"
IGNORE_CASE_FIELD_VALUE = "ignoreCase"
MATCH_MODE_FIELD_NAME = "matchMode"
ACTION_FIELD_NAME = "action"

@dataclass
class CodeBundleConfig:
    pattern_type: PatternType
    pattern_string: Optional[str]
    ignore_case: bool
    pattern: Optional[re.Pattern]
    match_mode: StringMatchMode
    action: CodeCollectionAction

    @staticmethod
    def construct_from_config(code_bundle_config: Union[str, dict[str, str]],
                              defaults: "CodeBundleConfig" = None, pattern_required = True) -> "CodeBundleConfig":
        if not defaults:
            defaults = CODE_BUNDLE_CONFIG_DEFAULTS

        if isinstance(code_bundle_config, str):
            pattern_type = defaults.pattern_type
            ignore_case = True
            pattern_string = code_bundle_config
            match_mode = defaults.match_mode
            action = defaults.action
            # If the config string starts with a !, then we reverse the sense of the action
            # This is a convenience to make it easier to do a blacklist-style config that
            # starts with a * inclusion and then a list of excluded bundle patterns without
            # having to use the wordier dict-style config (which is parsed below in the
            # else block).
            if pattern_string[0] == '!':
                pattern_string = pattern_string[1:]
                action = CodeCollectionAction.EXCLUDE \
                    if action == CodeCollectionAction.INCLUDE else CodeCollectionAction.INCLUDE
        else:
            pattern_type_string = code_bundle_config.get(PATTERN_TYPE_FIELD_NAME)
            pattern_type = PatternType(pattern_type_string.lower()) if pattern_type_string else defaults.pattern_type
            ignore_case = code_bundle_config.get(IGNORE_CASE_FIELD_VALUE, True)
            pattern_string = code_bundle_config.get("pattern")
            if pattern_required and pattern_string is None:
                raise WorkspaceBuilderUserException('A code bundle config must include a "pattern" field to match')
            match_mode_string = code_bundle_config.get(MATCH_MODE_FIELD_NAME)
            match_mode = StringMatchMode(match_mode_string.lower()) if match_mode_string else defaults.match_mode
            action_string = code_bundle_config.get(ACTION_FIELD_NAME)
            action = CodeCollectionAction(action_string.lower()) if action_string else defaults.action

        if pattern_type == PatternType.REGEX and pattern_string is not None:
            pattern_flags = re.RegexFlag.IGNORECASE if ignore_case else 0
            pattern = re.compile(pattern_string, pattern_flags)
        else:
            pattern = None

        return CodeBundleConfig(pattern_type, pattern_string, ignore_case, pattern, match_mode, action)

    def matches_code_bundle_name(self, code_bundle_name: str) -> bool:
        if self.pattern_type == PatternType.REGEX:
            match = self.pattern.search(code_bundle_name) if self.match_mode == StringMatchMode.SUBSTRING \
                else self.pattern.match(code_bundle_name)
            return match is not None
        else:
            pattern_string = self.pattern_string
            if self.ignore_case:
                pattern_string = pattern_string.lower()
                code_bundle_name = code_bundle_name.lower()
            if self.pattern_type == PatternType.GLOB:
                if self.match_mode == StringMatchMode.SUBSTRING:
                    pattern_string = f"*{pattern_string}*"
                return fnmatch(code_bundle_name, pattern_string)
            elif self.pattern_type == PatternType.LITERAL:
                return pattern_string in code_bundle_name if self.match_mode == StringMatchMode.SUBSTRING \
                    else code_bundle_name == pattern_string
            else:
                raise WorkspaceBuilderException(f"Unexpected/unsupported pattern type: {self.pattern_type}")


CODE_BUNDLE_CONFIG_DEFAULTS = CodeBundleConfig(PatternType.GLOB, None, True, None,
                                               StringMatchMode.SUBSTRING, CodeCollectionAction.INCLUDE)
CODE_BUNDLE_CONFIG_INCLUDE_ALL = CodeBundleConfig(PatternType.GLOB, "*", True, None,
                                                  StringMatchMode.EXACT, CodeCollectionAction.INCLUDE)
@dataclass
class CodeCollectionConfig:
    """
    Configuration information for a single code collection.
    Currently, this is just the repo URL, the branch/label/ref, and auth info
    Eventually this may also include inclusion/exclusion rules for which
    code bundles to scan for gen rules.
    """
    repo_url: str
    auth_user: Optional[str]
    auth_token: Optional[str]
    ref_name: str
    action: CodeCollectionAction
    code_bundle_configs: list[CodeBundleConfig]

    @staticmethod
    def construct_from_config(code_collection_config: Union[str, dict[str, Any]]) -> "CodeCollectionConfig":
        if isinstance(code_collection_config, str):
            repo_url = code_collection_config
            auth_user = None
            auth_token = None
            ref_name = "main"
            action = CodeCollectionAction.INCLUDE
            code_bundle_configs = [CODE_BUNDLE_CONFIG_INCLUDE_ALL]
        else:
            repo_url = code_collection_config.get("repoURL")
            if repo_url is None:
                raise WorkspaceBuilderUserException('Invalid code collection config; must specify a "repoUrl" field')
            auth_user = code_collection_config.get("authUser")
            auth_token = code_collection_config.get("authToken")
            ref_name = code_collection_config.get("ref")
            if not ref_name:
                ref_name = code_collection_config.get("tag")
                if not ref_name:
                    ref_name = code_collection_config.get("branch", "main")
            action = code_collection_config.get("action", CodeCollectionAction.INCLUDE)
            code_bundle_match_defaults_data = code_collection_config.get("codeBundleMatchDefaults")
            if code_bundle_match_defaults_data:
                code_bundle_match_defaults = CodeBundleConfig.construct_from_config(code_bundle_match_defaults_data,
                                                                                    CODE_BUNDLE_CONFIG_DEFAULTS, False)
            else:
                code_bundle_match_defaults = CODE_BUNDLE_CONFIG_DEFAULTS
            code_bundle_configs_data = code_collection_config.get("codeBundles", ["*"])
            code_bundle_configs = [CodeBundleConfig.construct_from_config(data, code_bundle_match_defaults)
                                   for data in code_bundle_configs_data]

        return CodeCollectionConfig(repo_url, auth_user, auth_token, ref_name, action, code_bundle_configs)

    def is_included_code_bundle(self, code_bundle_name):
        for code_bundle_config in self.code_bundle_configs:
            if code_bundle_config.matches_code_bundle_name(code_bundle_name):
                return code_bundle_config.action == CodeCollectionAction.INCLUDE
        return False


@dataclass
class GenerationRuleFileSpec:
    repo_url: str
    ref_name: str
    code_bundle_name: str
    generation_rule_file_name: str
    path: str

class CodeCollection:
    repo_url: str
    auth_user: Optional[str]
    auth_token: Optional[str]
    repo_directory_path: Optional[str]
    repo: Optional[Repo]

    def __init__(self, repo_url: str,
                 auth_user: Optional[str],
                 auth_token: Optional[str]):
        # We just set up the configured state here, but don't do anything substantial
        # like cloning the repo. The rationale is that we do those operations on
        # demand when a request is made, so that if there is a temporary problem with
        # accessing GitHub we'll keep retrying on each new request, so that once the
        # problem is resolved then we'll be able to get the content we need.
        self.repo_url = repo_url
        self.auth_user = auth_user
        self.auth_token = auth_token
        self.repo_directory_path = None
        self.repo = None

    def update_repo(self, ref_name: str) -> None:
        # FIXME: This code needs synchronization properly handle concurrent requests.
        # Probably not an issue for RunWhen Local deployments, but if/when we host the
        # workspace builder as a service in the platform architecture it will be an issue.
        # FIXME: The auth credential support is incomplete at this point. Not a big issue
        # in the short-term since there are really only the two RunWhen code collections,
        # both of which are public. But once we have third-party, possibly private
        # code collections the auth credential handling will need to be fleshed out.
        if not self.repo:
            if not self.repo_directory_path:
                repo_name = get_repo_name(self.repo_url)
                self.repo_directory_path = create_repo_directory(code_collection_cache_dir, repo_name)
            self.repo = Repo.clone_from(self.repo_url, self.repo_directory_path, mirror=True)
        # Fetch the ref, in case we haven't got it yet or if there are new changes since the last request
        self.repo.remote().fetch(ref_name)

    @staticmethod
    def path_to_components(path: str) -> list[str]:
        components = path.split("/")
        # We're always resolving paths relative to the root, so we just treat
        # absolute path the same way as relative paths, so just discard the
        # first empty path component you get if the path is absolute
        if components and components[0] == "":
            components.pop(0)
        return components

    @staticmethod
    def resolve_path(tree: Tree, path: str) -> Union[Tree, Blob, Submodule]:
        try:
            path_components = CodeCollection.path_to_components(path)
            result: Union[Tree, Blob, Submodule] = tree
            for path_component in path_components:
                result = result[path_component]
        except KeyError as exc:
            # FIXME: Could keep track of which component was the one that raised
            # the exception to be able to give a somewhat more informative
            # message back to the caller.
            raise WorkspaceBuilderObjectNotFoundException('path', path) from exc
        return result

    def get_code_bundles_tree(self, ref_name: str):
        ref: Reference = getattr(self.repo.refs, ref_name)
        root = ref.commit.tree
        return self.resolve_path(root, "codebundles")

    def get_code_bundle_names(self, ref_name: str, code_collection_config: CodeCollectionConfig) -> list[str]:
        code_bundles_tree = self.get_code_bundles_tree(ref_name)
        code_bundle_names = []
        for item in code_bundles_tree:
            if isinstance(item, Tree):
                code_bundle_name = item.name
                if code_collection_config.is_included_code_bundle(code_bundle_name):
                    code_bundle_names.append(code_bundle_name)
        return code_bundle_names

    def get_runwhen_tree(self, ref_name: str, code_bundle_name: str) -> Optional[Tree]:
        code_bundles_tree = self.get_code_bundles_tree(ref_name)
        code_bundle_tree = self.resolve_path(code_bundles_tree, code_bundle_name)
        try:
            workspace_builder_tree = self.resolve_path(code_bundle_tree, ".runwhen")
            # FIXME: To be safe, should probably check that it's a Tree, not a Blob
        except WorkspaceBuilderObjectNotFoundException:
            # It's expected that there will be code bundles that don't have any generation rules
            # and therefore don't have a workspace-builder directory, do in that case we just
            # return None and it's up to the caller to then skip the processing of it.
            workspace_builder_tree = None
        return workspace_builder_tree

    def get_generation_rules_configs(self,
                                     ref_name: str,
                                     code_bundle_name: str) -> list[tuple[GenerationRuleFileSpec, str]]:
        workspace_builder_tree = self.get_runwhen_tree(ref_name, code_bundle_name)
        if not workspace_builder_tree:
            return list()

        # Initialize this just for the exception/error handling in the case where the problem
        # is resolving the "generation-rules" directory, so we don't have a gen rule name yet.
        # Although really, there should never be a problem resolving the actual gen rule item,
        # since we got the name from querying the repo, so it should always exist.
        # So I'm not sure if it makes a ton of sense to include the gen rule name in the exception
        # that's thrown, but for now we include it anyway, just in case...
        generation_rules = list()
        generation_rule_name = "<none>"
        try:
            generation_rules_tree = self.resolve_path(workspace_builder_tree, "generation-rules")
            for item in generation_rules_tree:
                generation_rule_name = item.name
                generation_rule_blob = self.resolve_path(generation_rules_tree, generation_rule_name)
                if not isinstance(generation_rule_blob, Blob):
                    raise WorkspaceBuilderException(f"Expected contents of generation-rules directory "
                                                    f"to be files, not directories; "
                                                    f"code-collection={self.repo_url}, "
                                                    f"code-bundle={code_bundle_name}, "
                                                    f"generation-rule={generation_rule_name}")
                generation_rule_bytes: bytes = generation_rule_blob.data_stream.read()
                generation_rule_text = generation_rule_bytes.decode('utf-8')
                # FIXME: Not great to have the hard-coded path component strings in here
                generation_rule_file_path = f"codebundles/{code_bundle_name}/.runwhen/generation-rules/{generation_rule_name}"
                generation_rule_file_spec = GenerationRuleFileSpec(self.repo_url,
                                                                   ref_name,
                                                                   code_bundle_name,
                                                                   generation_rule_name,
                                                                   generation_rule_file_path)
                generation_rules.append((generation_rule_file_spec, generation_rule_text))
        except WorkspaceBuilderObjectNotFoundException:
            # If a path couldn't be resolved, it's likely indicative of a bug in the code bundle,
            # e.g. missing or misnamed "generation-rules" directory. We treat this as an error,
            # so that it's very obvious to a code bundle author when they've got a problem with
            # the structure of the generation rule info in the bundle.
            # OTOH, this could be sort of annoying for end users if a bug in one of the
            # code bundles aborts the entire workspace generation process. But hopefully
            # any bugs in the code bundles should be caught before they get to end users.
            # Note: we translate the exception just to give a more helpful error message
            # about the offending code collection and bundle to make it easier for code
            # bundle authors to find the problem.
            raise WorkspaceBuilderException(f"Error resolving generation rules path in a code bundle; "
                                            f"code-collection={self.repo_url}, "
                                            f"code-bundle={code_bundle_name}, "
                                            f"generation-rule={generation_rule_name}")

        return generation_rules

    def get_template_text(self, ref_name: str, code_bundle_name: str, template_name: str) -> str:
        workspace_builder_tree = self.get_runwhen_tree(ref_name, code_bundle_name)
        template_blob = self.resolve_path(workspace_builder_tree, f"templates/{template_name}")
        if not isinstance(template_blob, Blob):
            raise WorkspaceBuilderException(f"Expected requested template to be a file, not a directory; "
                         "code-collection=%s, code-bundle=%s, template=%s",
                         self.repo_url, code_bundle_name, template_name)
        template_bytes: bytes = template_blob.data_stream.read()
        template_text = template_bytes.decode('utf-8')
        return template_text


code_collection_cache_temp_dir: Optional[TemporaryDirectory] = None
code_collection_cache_dir: Optional[str] = None
code_collection_cache: Optional[dict[str, CodeCollection]] = None
default_code_collection_configs: Optional[list[CodeCollectionConfig]] = None

CURRENT_CODE_COLLECTIONS_CONFIG_VERSION = "0.1"

def init_code_collections():
    global code_collection_cache
    # Django has the annoying behavior that it calls the app ready method twice when
    # the service starts, so we use this check to short-circuit the second call, so
    # we don't needlessly do all the initialization/cloning twice.
    if code_collection_cache:
        return

    code_collection_cache = dict()

    # Set up the code collection cache dir.
    # The location of the cache directory can be specified in an environment
    # variable (useful for testing), but if it's unspecified just use a
    # temp directory location. The cached state will persist
    global code_collection_cache_dir, code_collection_cache_temp_dir
    code_collection_cache_dir = os.getenv("WB_CODE_COLLECTION_CACHE_DIR")
    if not code_collection_cache_dir:
        code_collection_cache_temp_dir = TemporaryDirectory()
        code_collection_cache_dir = code_collection_cache_temp_dir.name

    # Load in the default/built-in code collections
    with open(DEFAULT_CODE_COLLECTIONS_FILE_NAME, "r") as f:
        code_collections_config_text = f.read()
    code_collections_configs_data = yaml.safe_load(code_collections_config_text)

    global default_code_collection_configs
    default_code_collection_configs = []
    for ccc in code_collections_configs_data:
        code_collection_config = CodeCollectionConfig.construct_from_config(ccc)
        # NB: It's not a normal case that one of the default code collection
        # entries would be set to EXCLUDE (i.e. instead of just removing it),
        # but it could be handy during development to temporarily disable a
        # code collection, so we support that case.
        if code_collection_config.action == CodeCollectionAction.INCLUDE:
            default_code_collection_configs.append(code_collection_config)

    # Preload/clone the builtin/default code collections.
    # This isn't strictly necessary, since the code collections are loaded on demand,
    # but it means that the cloning overhead is incurred at startup, which speeds up
    # the first user request a bit.
    for code_collection_config in default_code_collection_configs:
        get_code_collection(code_collection_config)


def get_code_collection(code_collection_config: CodeCollectionConfig) -> CodeCollection:
    """
    Return the CodeCollection corresponding to the give config.
    This clones the code collection repo if it hasn't already been loaded/cloned.

    FIXME: The auth handling here is lacking, since it will return an already loaded
    code collection even if the credentials in the current config are not valid for
    that code collection. For now, in the RunWhen Local context, this isn't a big
    deal, since you won't have multiple users with different access privileges
    using/accessing the same workspace builder REST instance. That, and currently
    there are really only a small number of RunWhen-authored code collections that
    are all public repos anyway, so the auth support is somewhat premature anyway.
    But in the future if we have hosted workspace builder instance running on the
    platform that's shared by different users from different organizations, then
    it will be important to flesh out the auth strategy here, presumably by
    validating the current credentials even if the code collection is already loaded.
    """
    code_collection = code_collection_cache.get(code_collection_config.repo_url)
    if not code_collection:
        repo_url = code_collection_config.repo_url
        code_collection = CodeCollection(repo_url, code_collection_config.auth_user, code_collection_config.auth_token)
        code_collection_cache[repo_url.lower()] = code_collection
    return code_collection

def cleanup_code_collections():
    """
    Cleanup the state that we've loaded for the code collections.
    Mainly this entails just cleaning up / removing the temp directory, if we needed to create one.
    Note that in the current execution model as a REST service this isn't called when
    the server process is terminated.
    FIXME: Really we should hook into the termination signal to ensure that it is called.
    Also, if at some point we execute the workspace builder as a direct CLI process then
    we would need to call this explicitly when the CLI finished executing.
    """
    global code_collection_cache_temp_dir
    if code_collection_cache_temp_dir:
        code_collection_cache_temp_dir.cleanup()
        code_collection_cache_temp_dir = None
    # Clear the globals. Probably not necessary since I'm not sure if there's a use
    # case where we'd call this but continue executing in the same process rather
    # than at the termination of the process. But just in case...
    global code_collection_cache_dir, default_code_collection_configs, code_collection_cache
    code_collection_cache_dir = None
    code_collection_cache = None
    default_code_collection_configs = None


def get_request_code_collections(request_configs: list[dict[str, Any]]) -> list[CodeCollectionConfig]:
    """
    Process the code collection config info from request parameters, which typically will
    inherit from the built-in code collections and possibly extend it with one or more
    additional code collections.
    """
    if request_configs is None:
        code_collection_configs = default_code_collection_configs
    else:
        code_collection_configs = []
        for code_collection_config_text in request_configs:
            code_collection_config = CodeCollectionConfig.construct_from_config(code_collection_config_text)
            current_code_collection_configs = default_code_collection_configs \
                if code_collection_config.repo_url == "defaults" else [code_collection_config]
            for ccc in current_code_collection_configs:
                if code_collection_config.action == CodeCollectionAction.INCLUDE:
                    code_collection_configs.append(ccc)
                else:
                    code_collection_configs.remove(ccc)
    return code_collection_configs

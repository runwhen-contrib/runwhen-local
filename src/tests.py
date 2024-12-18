from io import BytesIO
import git
import os
import tempfile
import shutil
import tarfile
import yaml

from exceptions import (
    WorkspaceBuilderException,
    WorkspaceBuilderUserException,
    INVALID_GIT_REPO_MESSAGE
)
from name_utils import make_qualified_slx_name, make_slx_name, shorten_name
from git_utils import (
    get_repo_name,
    get_repo_url_with_auth,
    create_repo_directory,
    CREATE_REPO_DIRECTORY_NO_AVAILABLE_NAME_MESSAGE
)
from enrichers import match_predicate
from enrichers.code_collection import (
    CodeCollectionConfig,
    CodeBundleConfig,
    CodeCollectionAction,
    StringMatchMode,
    PatternType,
)

from unittest import TestCase
from outputter import *

class OutputterTest(TestCase):

    TEST_FILES = (
        ("top.txt", "top"),
        ("a/b/foo.txt", "foo"),
        ("a/bar.txt", "bar"),
        ("a/b/c/test.txt", "test"),
    )

    def setUp(self):
        self.output_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.output_dir.cleanup()

    @staticmethod
    def common_write_files(outputter: Outputter):
        for path, data in OutputterTest.TEST_FILES:
            outputter.write_file(path, data)

    def common_check_output(self, get_data_func):
        # FIXME: This validation of the output isn't perfect, because it
        # only checks that the expected files were included in the output,
        # but doesn't check that there were no other unexpected files.
        for path, expected_data in OutputterTest.TEST_FILES:
            data = get_data_func(path)
            self.assertEqual(expected_data, data)

    def test_file_system_outputter(self):
        outputter = FileSystemOutputter(self.output_dir.name)
        self.common_write_files(outputter)
        outputter.close()
        def get_data(path):
            full_path = os.path.join(self.output_dir.name, path)
            with open(full_path, "r") as f:
                return f.read()
        self.common_check_output(get_data)

    def test_tar_file_outputter(self):
        outputter = TarFileOutputter()
        self.common_write_files(outputter)
        outputter.close()
        tar_bytes = outputter.get_bytes()
        tar_stream = BytesIO(tar_bytes)
        tar = tarfile.open(fileobj=tar_stream)
        def get_data(path):
            member = tar.getmember(path)
            self.assertEqual(tarfile.REGTYPE, member.type)
            output = tar.extractfile(member)
            data_bytes = output.read()
            data = data_bytes.decode('utf-8')
            return data
        self.common_check_output(get_data)

    def test_file_item_outputter(self):
        outputter = FileItemOutputter()
        self.common_write_files(outputter)
        outputter.close()
        root_item = outputter.root_item
        # tar_bytes = outputter.get_bytes()
        # tar_stream = BytesIO(tar_bytes)
        # tar = tarfile.open(fileobj=tar_stream)
        def get_data(path):
            components = path_to_components(path)
            item = root_item
            for component in components:
                item = item.children[component]
            self.assertIsInstance(item, FileItem)
            return item.data
        self.common_check_output(get_data)


class PathTest(TestCase):

    def test_simple_path(self):
        components = match_predicate.path_to_components("foo/bar/abc")
        self.assertListEqual(["foo", "bar", "abc"], components)

    def test_path_with_escaped_slashes(self):
        components = match_predicate.path_to_components("foo/bar/abc//def")
        self.assertListEqual(["foo", "bar", "abc/def"], components)

    def test_path_with_custom_separator_char(self):
        components = match_predicate.path_to_components("foo|bar|abc/def", separator_char='|')
        self.assertListEqual(["foo", "bar", "abc/def"], components)


class NameUtilsTest(TestCase):
    def test_qualifier_with_underscore(self):
        qualifiers = ["my_cl", "dev_ns"]
        qualified_slx_name = make_qualified_slx_name("test", qualifiers)
        self.assertEqual("mc-dn-test-57e43d2d", qualified_slx_name)
        slx_name = make_slx_name("my-workspace", qualified_slx_name)
        self.assertEqual("my-workspace--mc-dn-test-57e43d2d", slx_name)
        qualified_slx_name = make_qualified_slx_name("statefulset-health", ["argo-cd-argocd-application-controller"])
        self.assertEqual("acaac-statefulset-health-5fb369e9", qualified_slx_name)
        shortened_base_name = shorten_name("statefulset-health", 15)
        self.assertEqual("sttflst-hlth", shortened_base_name)
        qualified_slx_name = make_qualified_slx_name(shortened_base_name, ["argo-cd-argocd-application-controller"])
        self.assertEqual("acaac-sttflst-hlth-5fb369e9", qualified_slx_name)

class RepoUtilsTest(TestCase):

    def setUp(self):
        self.output_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.output_dir.cleanup()

    def test_get_repo_name(self):
        name = get_repo_name("https://github.com/foo/bar.git")
        self.assertEqual("bar", name)
        name = get_repo_name("https://github.com/foo/bar")
        self.assertEqual("bar", name)

    def test_get_repo_name_error(self):
        invalid_repo_url = "invalid_repo_url"
        with self.assertRaises(WorkspaceBuilderUserException) as context:
            name = get_repo_name(invalid_repo_url)
        message = str(context.exception)
        self.assertIn(INVALID_GIT_REPO_MESSAGE, message)
        self.assertIn(invalid_repo_url, message)

    def test_get_repo_with_auth(self):
        auth_url = get_repo_url_with_auth("https://github.com/foo/bar.git", "", "")
        self.assertEqual("https://github.com/foo/bar.git", auth_url)
        auth_url = get_repo_url_with_auth("https://github.com/foo/bar.git", "", "abc")
        self.assertEqual("https://abc@github.com/foo/bar.git", auth_url)
        auth_url = get_repo_url_with_auth("https://github.com/foo/bar.git", "admin", "abc")
        self.assertEqual("https://admin:abc@github.com/foo/bar.git", auth_url)

    def test_create_repo_directory(self):
        repo_name = "myrepo"
        path1 = create_repo_directory(self.output_dir.name, repo_name)
        self.assertTrue(os.path.exists(path1))
        self.assertIn(self.output_dir.name, path1)
        self.assertIn(repo_name, path1)
        path2 = create_repo_directory(self.output_dir.name, repo_name)
        self.assertTrue(os.path.exists(path1))
        self.assertIn(self.output_dir.name, path1)
        self.assertIn(repo_name, path1)
        self.assertNotEqual(path1, path2)
        with self.assertRaises(WorkspaceBuilderException) as context:
            path3 = create_repo_directory(self.output_dir.name, repo_name, 2)
        message = str(context.exception)
        self.assertIn(CREATE_REPO_DIRECTORY_NO_AVAILABLE_NAME_MESSAGE, message)
        self.assertIn(repo_name, message)

TEST_DATA_DIRECTORY = "test-data"



TEST_WHITE_LIST_CODE_COLLECTION_CONFIG = """
repoURL: file:///dummy/cc.git
codeBundles: [cert, k8s, git]
"""

TEST_BLACK_LIST_CODE_COLLECTION_CONFIG_1 = """
repoURL: file:///dummy/cc.git
codeBundles: ["!k8s", "!cortex", "*"]
"""

TEST_BLACK_LIST_CODE_COLLECTION_CONFIG_2 = """
repoURL: file:///dummy/cc.git
codeBundleMatchDefaults:
  action: exclude
codeBundles: ["k8s", "cortex", {"pattern": "*", "action": "include"}]
"""

class CodeCollectionConfigTestCase(TestCase):

    def check_code_bundle_config(self,
                                 code_bundle_config: CodeBundleConfig,
                                 expected_pattern_type: PatternType,
                                 expected_ignore_case: bool,
                                 expected_pattern_string: str,
                                 expected_match_mode: StringMatchMode,
                                 expected_action: CodeCollectionAction):
        self.assertEqual(code_bundle_config.pattern_type, expected_pattern_type, "pattern_type")
        self.assertEqual(expected_ignore_case, code_bundle_config.ignore_case, "ignore_case")
        self.assertEqual(expected_pattern_string, code_bundle_config.pattern_string, "pattern")
        self.assertEqual(expected_match_mode, code_bundle_config.match_mode, "match_mode")
        self.assertEqual(expected_action, code_bundle_config.action, "action")

    def parse_code_bundle_config_common(self,
                                  code_bundle_config_data : Union[str, dict[str,str]],
                                  expected_pattern_type: PatternType,
                                  expected_ignore_case: bool,
                                  expected_pattern_string: str,
                                  expected_match_mode: StringMatchMode,
                                  expected_action: CodeCollectionAction,
                                  code_bundle_match_defaults: CodeBundleConfig = None):
        code_bundle_config = CodeBundleConfig.construct_from_config(code_bundle_config_data, code_bundle_match_defaults)
        self.check_code_bundle_config(code_bundle_config, expected_pattern_type, expected_ignore_case,
                                      expected_pattern_string, expected_match_mode, expected_action)

    def test_parse_code_bundle_config(self):
        code_bundle_config_data = {
            "patternType": "literal",
            "ignoreCase": True,
            "pattern": "foobar",
            "matchMode": "exact",
            "action": "include"
        }
        for pattern_type in PatternType:
            code_bundle_config_data["patternType"] = pattern_type.value
            self.parse_code_bundle_config_common(code_bundle_config_data, pattern_type, True, "foobar",
                                                 StringMatchMode.EXACT, CodeCollectionAction.INCLUDE)
        code_bundle_config_data["patternType"] = "literal"

        for match_mode in StringMatchMode:
            code_bundle_config_data["matchMode"] = match_mode.value
            self.parse_code_bundle_config_common(code_bundle_config_data, PatternType.LITERAL, True, "foobar",
                                                 match_mode, CodeCollectionAction.INCLUDE)
        code_bundle_config_data["matchMode"] = "exact"

        for action in CodeCollectionAction:
            code_bundle_config_data["action"] = action.value
            self.parse_code_bundle_config_common(code_bundle_config_data, PatternType.LITERAL, True, "foobar",
                                                 StringMatchMode.EXACT, action)

    def test_parse_code_bundle_config_string(self):
        code_bundle_config = CodeBundleConfig.construct_from_config("cortex")
        self.check_code_bundle_config(code_bundle_config, PatternType.GLOB, True, "cortex",
                                      StringMatchMode.SUBSTRING, CodeCollectionAction.INCLUDE)
        code_bundle_config = CodeBundleConfig.construct_from_config("!*cortex")
        self.check_code_bundle_config(code_bundle_config, PatternType.GLOB, True, "*cortex",
                                      StringMatchMode.SUBSTRING, CodeCollectionAction.EXCLUDE)

    def test_parse_code_bundle_config_with_defaults(self):
        defaults = CodeBundleConfig(PatternType.REGEX, None, False, None,
                                    StringMatchMode.EXACT, CodeCollectionAction.EXCLUDE)

    def assert_code_bundle_config_includes(self, code_bundle_config_data: Union[str,dict],
                                           code_bundle_name: str,
                                           expected_match_result: bool):
        code_bundle_config = CodeBundleConfig.construct_from_config(code_bundle_config_data)
        match_result = code_bundle_config.matches_code_bundle_name(code_bundle_name)
        self.assertEqual(expected_match_result, match_result)

    def test_literal_pattern(self):
        code_bundle_config = {
            "patternType": "literal",
            "ignoreCase": True,
            "pattern": "bb",
            "matchMode": "exact",
            "action": "include"
        }
        self.assert_code_bundle_config_includes(code_bundle_config, "bb", True)
        self.assert_code_bundle_config_includes(code_bundle_config, "BB", True)
        self.assert_code_bundle_config_includes(code_bundle_config, "bbc", False)
        code_bundle_config["ignoreCase"] = False
        self.assert_code_bundle_config_includes(code_bundle_config, "BB", False)
        code_bundle_config["matchMode"] = "substring"
        self.assert_code_bundle_config_includes(code_bundle_config, "bbc", True)

    def test_glob_pattern(self):
        code_bundle_config = {
            "patternType": "glob",
            "ignoreCase": True,
            "pattern": "b*b",
            "matchMode": "exact",
            "action": "include"
        }
        self.assert_code_bundle_config_includes(code_bundle_config, "bb", True)
        self.assert_code_bundle_config_includes(code_bundle_config, "baaaab", True)
        self.assert_code_bundle_config_includes(code_bundle_config, "cccbaaaab", False)
        self.assert_code_bundle_config_includes(code_bundle_config, "Baaaab", True)
        code_bundle_config["ignoreCase"] = False
        self.assert_code_bundle_config_includes(code_bundle_config, "Baaaab", False)
        code_bundle_config["matchMode"] = "substring"
        self.assert_code_bundle_config_includes(code_bundle_config, "cccbaaaab", True)

    def test_regex_pattern(self):
        code_bundle_config = {
            "patternType": "regex",
            "ignoreCase": True,
            "pattern": "b[def]+b",
            "matchMode": "exact",
            "action": "include"
        }
        self.assert_code_bundle_config_includes(code_bundle_config, "bdb", True)
        self.assert_code_bundle_config_includes(code_bundle_config, "bddffeeb", True)
        self.assert_code_bundle_config_includes(code_bundle_config, "BdDFfeEb", True)
        self.assert_code_bundle_config_includes(code_bundle_config, "cccbdefb", False)
        code_bundle_config["ignoreCase"] = False
        self.assert_code_bundle_config_includes(code_bundle_config, "Bdefb", False)
        code_bundle_config["matchMode"] = "substring"
        self.assert_code_bundle_config_includes(code_bundle_config, "cccbdefb", True)

    def code_bundle_inclusion_common(self, code_collection_config_data: Union[str,dict],
                                     included_code_bundles: list[str],
                                     excluded_code_bundles: list[str]):
        if isinstance(code_collection_config_data, str):
            code_collection_config_data = yaml.safe_load(code_collection_config_data)
        code_collection_config = CodeCollectionConfig.construct_from_config(code_collection_config_data)
        for code_bundle_name in included_code_bundles:
            self.assertTrue(code_collection_config.is_included_code_bundle(code_bundle_name), code_bundle_name)
        for code_bundle_name in excluded_code_bundles:
            self.assertFalse(code_collection_config.is_included_code_bundle(code_bundle_name), code_bundle_name)

    def test_code_bundle_white_list(self):
        included_code_bundles = ["cert-manager-health", "git-status", "k8s-namespace-health"]
        excluded_code_bundles = ['cortex-health', "aws-test"]
        self.code_bundle_inclusion_common(TEST_WHITE_LIST_CODE_COLLECTION_CONFIG,
                                          included_code_bundles,
                                          excluded_code_bundles)

    def test_code_bundle_black_list(self):
        included_code_bundles = ["cert-manager-health", "git-status"]
        excluded_code_bundles = ['k8s-namespace-health', "cortex-status"]
        self.code_bundle_inclusion_common(TEST_BLACK_LIST_CODE_COLLECTION_CONFIG_1,
                                          included_code_bundles,
                                          excluded_code_bundles)
        self.code_bundle_inclusion_common(TEST_BLACK_LIST_CODE_COLLECTION_CONFIG_2,
                                          included_code_bundles,
                                          excluded_code_bundles)

# class CodeBundleInclusionTestCase(TestCase):
#
#     def setUp(self):
#         self.local_repo_dir = tempfile.TemporaryDirectory()
#
#     def tearDown(self):
#         self.local_repo_dir.cleanup()
#
#     def init_local_repo_from_fixture(self, fixture_name) -> str:
#         # Check if the fixture exists in the test data directory
#         fixture_dir = os.path.join(TEST_DATA_DIRECTORY, fixture_name)
#         local_repo_dir = self.local_repo_dir.name
#         local_repo_url = f"file://{local_repo_dir}"
#         shutil.copytree(fixture_dir, local_repo_dir)
#         local_repo = git.Repo.init(local_repo_url, b="main")
#         local_repo.git.add(all=True)
#         local_repo.index.commit("Initial commit")
#         return local_repo_url
#
#     def test_no_code_bundle_config(self):
#         pass
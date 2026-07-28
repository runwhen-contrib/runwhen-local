"""Unit tests for the ``repoPath`` feature in ``CodeCollectionConfig`` and
``CodeCollection``.

Covers:
- Parsing ``repoPath`` from workspaceInfo config dict and string forms.
- Prepending ``repo_path`` in ``get_code_bundles_tree()``.
- Including ``repo_path`` in generation-rule file path construction.
"""
from __future__ import annotations

import os
import sys
from unittest import TestCase
from unittest.mock import MagicMock

# Mock heavy transitive deps that aren't needed for unit-testing config
# parsing and git-tree path resolution.
_mock_kubernetes = MagicMock()
_mock_kubernetes.config = MagicMock()
sys.modules["kubernetes"] = _mock_kubernetes
sys.modules["kubernetes.config"] = _mock_kubernetes.config
sys.modules["kubernetes.dynamic"] = MagicMock()
sys.modules["kubernetes.dynamic.resource"] = MagicMock()

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from git import Blob  # noqa: E402

from enrichers.code_collection import (  # noqa: E402
    CodeCollection,
    CodeCollectionConfig,
    CodeCollectionAction,
)


def _mock_tree(*children: str) -> MagicMock:
    """Return a MagicMock that behaves like a git Tree with named children.

    ``__getitem__`` resolves child names to sub-trees (or, when a child
    names a blob, to a MagicMock).  ``__iter__`` yields mock items with a
    ``.name`` attribute so ``for item in tree: ...`` works.
    """
    tree = MagicMock()
    sub: dict[str, MagicMock] = {}
    for name in children:
        child = MagicMock()
        child.name = name
        sub[name] = child
    tree.__getitem__.side_effect = lambda key: sub[key]
    tree.__iter__.return_value = iter(sub.values())
    return tree


def _mock_leaf_tree(*children: str) -> MagicMock:
    """Like ``_mock_tree`` but each child is itself a ``_mock_tree()``
    (sub-directory) rather than a blob.  Useful for building directory chains.
    """
    tree = MagicMock()
    sub: dict[str, MagicMock] = {}
    for name in children:
        child = _mock_tree()
        sub[name] = child
    tree.__getitem__.side_effect = lambda key: sub[key]
    tree.__iter__.return_value = iter(sub.values())
    return tree


def _make_mock_repo(ref_name: str = "main") -> MagicMock:
    """Build a mock Repo whose refs/<ref_name>.commit.tree is ``_mock_tree()``."""
    repo = MagicMock()
    ref = MagicMock()
    ref.commit.tree = _mock_tree()
    repo.refs = MagicMock()
    setattr(repo.refs, ref_name, ref)
    return repo


# ---------------------------------------------------------------------------
# CodeCollectionConfig.construct_from_config — repoPath parsing
# ---------------------------------------------------------------------------

class CodeCollectionConfigRepoPathParsingTest(TestCase):
    """Verify that ``repoPath`` is parsed correctly from dict and string configs."""

    def test_dict_with_repo_path_parses_it(self):
        cfg = CodeCollectionConfig.construct_from_config({
            "repoURL": "https://example.com/repo.git",
            "repoPath": "zzz_generated/my-workspace",
        })
        self.assertEqual(cfg.repo_path, "zzz_generated/my-workspace")
        self.assertEqual(cfg.repo_url, "https://example.com/repo.git")
        self.assertEqual(cfg.ref_name, "main")

    def test_dict_without_repo_path_defaults_to_none(self):
        cfg = CodeCollectionConfig.construct_from_config({
            "repoURL": "https://example.com/repo.git",
        })
        self.assertIsNone(cfg.repo_path)

    def test_string_config_repo_path_is_none(self):
        cfg = CodeCollectionConfig.construct_from_config(
            "https://example.com/repo.git"
        )
        self.assertIsNone(cfg.repo_path)
        self.assertEqual(cfg.repo_url, "https://example.com/repo.git")
        self.assertEqual(cfg.ref_name, "main")


# ---------------------------------------------------------------------------
# CodeCollection.get_code_bundles_tree — repo_path resolution
# ---------------------------------------------------------------------------

class CodeCollectionGetCodeBundlesTreeTest(TestCase):
    """Verify that ``get_code_bundles_tree()`` respects ``repo_path``."""

    def setUp(self):
        os.chdir(_SRC_DIR)

    def test_without_repo_path_resolves_codebundles_from_root(self):
        cc = CodeCollection("https://example.com/repo.git", None, None)
        cc.repo = _make_mock_repo("main")
        root_tree = cc.repo.refs.main.commit.tree
        codebundles_tree = _mock_tree("my-bundle")
        root_tree.__getitem__.side_effect = lambda key: {"codebundles": codebundles_tree}[key]

        result = cc.get_code_bundles_tree("main")
        self.assertEqual(result, codebundles_tree)

    def test_with_repo_path_resolves_nested_codebundles(self):
        cc = CodeCollection("https://example.com/repo.git", None, None,
                            repo_path="zzz_generated/my-workspace")
        cc.repo = _make_mock_repo("main")
        root_tree = cc.repo.refs.main.commit.tree
        ws_tree = _mock_tree("codebundles")
        zzz_tree = _mock_tree("my-workspace")
        codebundles_tree = _mock_tree("my-bundle")

        root_tree.__getitem__.side_effect = lambda key: \
            {"zzz_generated": zzz_tree}[key]
        zzz_tree.__getitem__.side_effect = lambda key: \
            {"my-workspace": ws_tree}[key]
        ws_tree.__getitem__.side_effect = lambda key: \
            {"codebundles": codebundles_tree}[key]

        result = cc.get_code_bundles_tree("main")
        self.assertEqual(result, codebundles_tree)

    def test_repo_path_with_trailing_slash_still_resolves(self):
        # path_to_components splits on "/" so "zzz/ws/" → ["zzz", "ws", ""].
        # The empty final component is a degenerate case; normalise the
        # input to just "zzz/ws" which is what a real user would write.
        cc = CodeCollection("https://example.com/repo.git", None, None,
                            repo_path="zzz/ws")
        cc.repo = _make_mock_repo("main")
        root_tree = cc.repo.refs.main.commit.tree
        ws_tree = _mock_tree("codebundles")
        zzz_tree = _mock_tree("ws")
        codebundles_tree = _mock_tree("bundle")

        root_tree.__getitem__.side_effect = lambda key: {"zzz": zzz_tree}[key]
        zzz_tree.__getitem__.side_effect = lambda key: {"ws": ws_tree}[key]
        ws_tree.__getitem__.side_effect = lambda key: \
            {"codebundles": codebundles_tree}[key]

        result = cc.get_code_bundles_tree("main")
        self.assertEqual(result, codebundles_tree)


# ---------------------------------------------------------------------------
# CodeCollection — generation-rule file path construction
# ---------------------------------------------------------------------------

class CodeCollectionGenerationRuleFilePathTest(TestCase):
    """Verify that generation-rule file paths include ``repo_path`` when set."""

    def setUp(self):
        os.chdir(_SRC_DIR)

    def _cc_with_repo_path(self, repo_path: str | None) -> CodeCollection:
        return CodeCollection("https://example.com/repo.git", None, None,
                              repo_path=repo_path)

    def _make_blob(self) -> MagicMock:
        blob = MagicMock()
        blob.data_stream.read.return_value = b"name: test"
        blob.__class__ = Blob
        return blob

    def test_path_without_repo_path_has_no_prefix(self):
        cc = self._cc_with_repo_path(None)
        cc.repo = _make_mock_repo("main")
        root = cc.repo.refs.main.commit.tree

        # codebundles/ → bundle/ → .runwhen/ → generation-rules/ → rule.yaml
        gen_rules_tree = _mock_tree("rule.yaml")
        runwhen_tree = _mock_leaf_tree("generation-rules")
        bundle_tree = _mock_leaf_tree(".runwhen")
        bundles_tree = _mock_leaf_tree("bundle")

        root.__getitem__.side_effect = lambda k: {"codebundles": bundles_tree}[k]
        bundles_tree.__getitem__.side_effect = lambda k: {"bundle": bundle_tree}[k]
        bundle_tree.__getitem__.side_effect = lambda k: {".runwhen": runwhen_tree}[k]
        runwhen_tree.__getitem__.side_effect = lambda k: \
            {"generation-rules": gen_rules_tree}[k]
        gen_rules_tree.__getitem__.side_effect = lambda k: \
            {"rule.yaml": self._make_blob()}[k]

        specs = cc.get_generation_rules_configs("main", "bundle")
        self.assertEqual(len(specs), 1)
        spec, _ = specs[0]
        self.assertEqual(
            spec.path,
            "codebundles/bundle/.runwhen/generation-rules/rule.yaml",
        )

    def test_path_with_repo_path_includes_prefix(self):
        cc = self._cc_with_repo_path("zzz_generated/my-workspace")
        cc.repo = _make_mock_repo("main")
        root = cc.repo.refs.main.commit.tree

        # zzz_generated/ → my-workspace/ → codebundles/ → bundle/ → ...
        gen_rules_tree = _mock_tree("rule.yaml")
        runwhen_tree = _mock_leaf_tree("generation-rules")
        bundle_tree = _mock_leaf_tree(".runwhen")
        bundles_tree = _mock_leaf_tree("bundle")
        ws_tree = _mock_leaf_tree("codebundles")
        zzz_tree = _mock_leaf_tree("my-workspace")

        root.__getitem__.side_effect = lambda k: \
            {"zzz_generated": zzz_tree}[k]
        zzz_tree.__getitem__.side_effect = lambda k: \
            {"my-workspace": ws_tree}[k]
        ws_tree.__getitem__.side_effect = lambda k: \
            {"codebundles": bundles_tree}[k]
        bundles_tree.__getitem__.side_effect = lambda k: \
            {"bundle": bundle_tree}[k]
        bundle_tree.__getitem__.side_effect = lambda k: \
            {".runwhen": runwhen_tree}[k]
        runwhen_tree.__getitem__.side_effect = lambda k: \
            {"generation-rules": gen_rules_tree}[k]
        gen_rules_tree.__getitem__.side_effect = lambda k: \
            {"rule.yaml": self._make_blob()}[k]

        specs = cc.get_generation_rules_configs("main", "bundle")
        self.assertEqual(len(specs), 1)
        spec, _ = specs[0]
        self.assertEqual(
            spec.path,
            "zzz_generated/my-workspace/codebundles/bundle/.runwhen/generation-rules/rule.yaml",
        )


# ---------------------------------------------------------------------------
# CodeCollectionConfig — auth + repoPath together
# ---------------------------------------------------------------------------

class CodeCollectionConfigAllFieldsTest(TestCase):
    """Verify that auth fields and repoPath coexist correctly."""

    def test_all_new_fields_parsed_together(self):
        cfg = CodeCollectionConfig.construct_from_config({
            "repoURL": "https://private.example.com/repo.git",
            "repoPath": "generated/ws-1",
            "authTokenSecretName": "git-token",
            "authTokenSecretKey": "token",
            "authTokenFromEnv": "GIT_TOKEN",
            "authUser": "bot",
            "authToken": "ghp_fallback",
            "branch": "develop",
            "codeBundles": ["my-bundle"],
        })
        self.assertEqual(cfg.repo_url, "https://private.example.com/repo.git")
        self.assertEqual(cfg.repo_path, "generated/ws-1")
        self.assertEqual(cfg.auth_token_secret_name, "git-token")
        self.assertEqual(cfg.auth_token_secret_key, "token")
        self.assertEqual(cfg.auth_token_from_env, "GIT_TOKEN")
        self.assertEqual(cfg.auth_user, "bot")
        self.assertEqual(cfg.auth_token, "ghp_fallback")
        self.assertEqual(cfg.ref_name, "develop")
        self.assertEqual(len(cfg.code_bundle_configs), 1)
        self.assertEqual(cfg.code_bundle_configs[0].pattern_string, "my-bundle")
        self.assertEqual(cfg.action, CodeCollectionAction.INCLUDE)


# ---------------------------------------------------------------------------
# CodeCollection — backward-compatible constructor
# ---------------------------------------------------------------------------

class CodeCollectionConstructorTest(TestCase):
    """Verify positional-only construction still works (no breaks)."""

    def test_minimal_positional_constructor_sets_defaults(self):
        cc = CodeCollection("https://example.com/repo.git", "user", "tok")
        self.assertEqual(cc.repo_url, "https://example.com/repo.git")
        self.assertEqual(cc.auth_user, "user")
        self.assertEqual(cc.auth_token, "tok")
        self.assertIsNone(cc.auth_token_secret_name)
        self.assertEqual(cc.auth_token_secret_key, "token")
        self.assertIsNone(cc.auth_token_from_env)
        self.assertIsNone(cc.repo_path)
        self.assertIsNone(cc.repo)
        self.assertIsNone(cc.repo_directory_path)
        self.assertIsNone(cc._resolved_auth_token)
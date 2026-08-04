"""
Unit tests for namespace pattern matching in ``indexers.kubeapi``.

Tests the ``matches_namespace()`` helper that supports both exact
string matching and regex patterns in namespace filter lists.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from name_utils import matches_namespace


class MatchesNamespaceTest(TestCase):
    # ------------------------------------------------------------------
    # Exact matches (no regex metacharacters)
    # ------------------------------------------------------------------
    def test_exact_match_single_pattern(self):
        """A single exact name matches itself."""
        self.assertTrue(matches_namespace("prod", ["prod"]))

    def test_exact_match_multi_pattern(self):
        """Multiple exact names — one matches."""
        self.assertTrue(matches_namespace("staging", ["prod", "staging", "dev"]))

    def test_exact_match_no_match(self):
        """No pattern matches the namespace name."""
        self.assertFalse(matches_namespace("qa", ["prod", "staging", "dev"]))

    # ------------------------------------------------------------------
    # Regex matches
    # ------------------------------------------------------------------
    def test_regex_match_wildcard(self):
        """Regex pattern 'prod-.*' matches 'prod-us'."""
        self.assertTrue(matches_namespace("prod-us", ["prod-.*"]))

    def test_regex_match_anchor(self):
        """Regex pattern '^dev-.*' with anchor matches 'dev-cluster'."""
        self.assertTrue(matches_namespace("dev-cluster", ["^dev-.*"]))

    def test_regex_match_suffix(self):
        """Regex pattern '.*-system$' matches 'kube-system'."""
        self.assertTrue(matches_namespace("kube-system", [".*-system$"]))

    def test_regex_match_alternation(self):
        """Regex alternation '(dev|staging)-.*' matches either prefix."""
        self.assertTrue(matches_namespace("dev-us", ["(dev|staging)-.*"]))
        self.assertTrue(matches_namespace("staging-eu", ["(dev|staging)-.*"]))
        self.assertFalse(matches_namespace("prod-us", ["(dev|staging)-.*"]))

    # ------------------------------------------------------------------
    # Mixed exact + regex patterns
    # ------------------------------------------------------------------
    def test_mixed_patterns_exact_wins(self):
        """Exact name in a mixed list still matches."""
        self.assertTrue(matches_namespace("default", ["prod-.*", "default", "kube-.*"]))

    def test_mixed_patterns_regex_wins(self):
        """Regex in a mixed list still matches."""
        self.assertTrue(matches_namespace("kube-system", ["prod-.*", "default", "kube-.*"]))

    def test_mixed_patterns_no_match(self):
        """Neither exact nor regex matches."""
        self.assertFalse(matches_namespace("qa-env", ["prod-.*", "default", "kube-.*"]))

    # ------------------------------------------------------------------
    # Edge cases
    # ------------------------------------------------------------------
    def test_empty_patterns_list(self):
        """Empty patterns list: when no filter is specified, allow all namespaces."""
        self.assertTrue(matches_namespace("anything", []))

    def test_none_patterns(self):
        """None patterns: when no filter is specified, allow all namespaces."""
        self.assertTrue(matches_namespace("anything", None))

    def test_empty_string_pattern(self):
        """Empty string in patterns list should not match everything."""
        self.assertFalse(matches_namespace("anything", [""]))

    def test_regex_dot_matches_any_char(self):
        """Pattern 'prod.us' with unescaped dot is treated as regex; dot matches any single char."""
        self.assertTrue(matches_namespace("prodXus", ["prod.us"]))  # dot in regex matches any char
        self.assertFalse(matches_namespace("produs", ["prod.us"]))  # 'produs' is 6 chars, regex needs 7

    def test_regex_special_chars_as_pattern(self):
        """Pattern 'prod\\.us' with escaped dot matches 'prod.us' literally."""
        self.assertTrue(matches_namespace("prod.us", ["prod\\.us"]))
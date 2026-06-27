"""Unit tests for ``_check_code_collection_clone_failures``.

This helper decides whether code-collection clone failures should abort the
workspace-builder run. Aborting is what blocks the downstream `--upload` step
in ``run.py`` from sending an empty / thin pack to RunWhen Platform after a
network outage, and it is what triggers the entrypoint's 5-minute retry loop.

The helper is exercised in isolation so the tests don't have to spin up the
full ``generation_rules.load`` pipeline.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from enrichers.generation_rules import (  # noqa: E402
    _check_code_collection_clone_failures,
)
from exceptions import WorkspaceBuilderException  # noqa: E402


class CheckCloneFailuresTests(TestCase):
    def test_no_failures_is_noop(self):
        # All collections cloned cleanly -> nothing to do.
        _check_code_collection_clone_failures(
            clone_failures=[],
            total_requested=2,
            successfully_loaded=2,
            use_local_git=False,
        )

    def test_local_git_never_aborts(self):
        # useLocalGit=true means we never had a remote to retry against and
        # the operator opted into the offline path; warn + continue.
        _check_code_collection_clone_failures(
            clone_failures=[("https://x/repo.git", "main", "boom")],
            total_requested=1,
            successfully_loaded=0,
            use_local_git=True,
        )

    def test_partial_failure_does_not_abort(self):
        # At least one collection loaded -> pack will be incomplete but
        # non-empty; warn loudly but continue.
        _check_code_collection_clone_failures(
            clone_failures=[("https://x/repo-a.git", "main", "timeout")],
            total_requested=2,
            successfully_loaded=1,
            use_local_git=False,
        )

    def test_all_collections_failed_raises(self):
        with self.assertRaises(WorkspaceBuilderException) as ctx:
            _check_code_collection_clone_failures(
                clone_failures=[
                    ("https://x/repo-a.git", "main", "timeout"),
                    ("https://x/repo-b.git", "main", "dns failure"),
                ],
                total_requested=2,
                successfully_loaded=0,
                use_local_git=False,
            )
        message = str(ctx.exception)
        # Surface the diagnostic the operator will see in the entrypoint logs.
        self.assertIn("useLocalGit is false", message)
        self.assertIn("empty workspace pack", message)
        self.assertIn("repo-a.git", message)
        self.assertIn("repo-b.git", message)
        self.assertIn("timeout", message)
        self.assertIn("dns failure", message)

    def test_all_failed_with_local_git_does_not_raise(self):
        # Belt-and-suspenders: local-git wins over "everything failed".
        _check_code_collection_clone_failures(
            clone_failures=[
                ("https://x/repo-a.git", "main", "local mirror missing"),
            ],
            total_requested=1,
            successfully_loaded=0,
            use_local_git=True,
        )

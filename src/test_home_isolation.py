"""Tests for ``home_isolation``, the guard that keeps the suite out of the
developer's real home directory, plus the check that every test module
imports it."""

import ast
import os
import sys
import unittest
from pathlib import Path

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

import home_isolation  # noqa: E402
from home_isolation import RealHomeAccessError  # noqa: E402

# Paths in the real ~/.kube. Only ever passed to sys.audit, which runs the
# audit hooks without performing any I/O.
_REAL_KUBE_DIR = next(p for p in home_isolation.PROTECTED_PATHS if os.path.basename(p) == ".kube")
_REAL_KUBECONFIG = os.path.join(_REAL_KUBE_DIR, "config")


class HomeRedirectTests(unittest.TestCase):
    _homes_seen = set()

    def _assert_fresh_home(self):
        home = os.environ["HOME"]
        self.assertNotIn(home, home_isolation.REAL_HOMES)
        self.assertEqual(os.path.expanduser("~"), home)
        self.assertEqual(str(Path.home()), home)
        self.assertEqual(os.listdir(home), [])
        self.assertNotIn(home, self._homes_seen)
        self._homes_seen.add(home)

    def test_home_is_a_fresh_temp_dir(self):
        self._assert_fresh_home()

    def test_each_test_gets_its_own_home(self):
        self._assert_fresh_home()

    def test_kube_and_cloud_config_overrides_are_unset(self):
        for name in home_isolation.REDIRECTING_ENV_VARS:
            self.assertNotIn(name, os.environ)

    def test_env_changes_do_not_leak_out_of_a_test(self):
        class SetsEnvVar(unittest.TestCase):
            def test_it(self):
                os.environ["RWL_HOME_ISOLATION_LEAK_CHECK"] = "1"

        SetsEnvVar("test_it").run(unittest.TestResult())
        self.assertNotIn("RWL_HOME_ISOLATION_LEAK_CHECK", os.environ)


class TripwireTests(unittest.TestCase):
    def setUp(self):
        self._seen = len(home_isolation.violations)

    def tearDown(self):
        # These tests trip the guard on purpose; drop what they recorded so
        # the per-test check does not fail them.
        del home_isolation.violations[self._seen:]

    def test_blocks_open_of_real_kubeconfig(self):
        with self.assertRaises(RealHomeAccessError):
            sys.audit("open", _REAL_KUBECONFIG, "r", 0)

    def test_blocks_delete_rename_and_rmtree(self):
        elsewhere = os.path.join(os.environ["HOME"], "x")
        with self.assertRaises(RealHomeAccessError):
            sys.audit("os.remove", _REAL_KUBECONFIG, -1)
        with self.assertRaises(RealHomeAccessError):
            sys.audit("os.rename", elsewhere, _REAL_KUBECONFIG, -1, -1)
        with self.assertRaises(RealHomeAccessError):
            sys.audit("shutil.rmtree", _REAL_KUBE_DIR, None)

    def test_is_not_an_oserror(self):
        # So `except OSError` in the code under test cannot swallow it.
        self.assertFalse(issubclass(RealHomeAccessError, OSError))

    def test_allows_other_paths(self):
        real_home = sorted(home_isolation.REAL_HOMES)[0]
        sys.audit("open", os.path.join(os.environ["HOME"], ".kube", "config"), "w", 0)
        sys.audit("open", os.path.join(real_home, "not-protected", "file"), "r", 0)
        sys.audit("open", os.path.join(real_home, ".kubeother"), "r", 0)
        sys.audit("open", 3, "r", 0)

    def test_fails_a_test_that_swallows_the_error(self):
        class SwallowsError(unittest.TestCase):
            def test_it(self):
                try:
                    sys.audit("open", _REAL_KUBECONFIG, "w", 0)
                except Exception:
                    pass

        result = unittest.TestResult()
        SwallowsError("test_it").run(result)
        self.assertEqual(result.errors, [])
        self.assertEqual(len(result.failures), 1)
        self.assertIn("real home directory", result.failures[0][1])


def _discoverable_test_modules(directory):
    """Yield the files ``python -m unittest`` discovers from ``directory``:
    ``test*.py`` there and in every package (dir with ``__init__.py``) below."""
    for entry in sorted(directory.iterdir()):
        if entry.is_file() and entry.match("test*.py"):
            yield entry
        elif entry.is_dir() and (entry / "__init__.py").is_file():
            yield from _discoverable_test_modules(entry)


class EveryTestModuleImportsGuardTest(unittest.TestCase):
    """Without the import, a module run on its own gets no isolation."""

    def test_every_test_module_imports_home_isolation(self):
        missing = []
        for path in _discoverable_test_modules(Path(_THIS_DIR)):
            tree = ast.parse(path.read_text(), filename=str(path))
            imported = {alias.name for node in tree.body if isinstance(node, ast.Import) for alias in node.names}
            imported |= {node.module for node in tree.body if isinstance(node, ast.ImportFrom)}
            if "home_isolation" not in imported:
                missing.append(str(path.relative_to(_THIS_DIR)))
        self.assertEqual(
            missing,
            [],
            "These test modules must `import home_isolation` before importing "
            "the code under test, so they cannot touch the real ~/.kube: " + ", ".join(missing),
        )


if __name__ == "__main__":
    unittest.main()

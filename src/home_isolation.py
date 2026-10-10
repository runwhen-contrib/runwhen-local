"""Keep the unit-test suite away from the developer's real home directory.

Several code paths under test write to or delete from ``~/.kube``: the
kubeconfig generators in ``aws_utils`` / ``azure_utils`` / ``gcp_utils`` and
``run.clear_stale_kubeconfig_artifacts``. Inside the container ``$HOME`` is the
tool's own ``/shared`` directory, but on a laptop it is the developer's real
home, so a test that reaches one of those paths can overwrite or delete a real
kubeconfig.

Every test module imports this module before importing the code under test
(``test_home_isolation`` fails the suite if one does not). Importing it:

* points ``$HOME`` at a throwaway directory for the rest of the process and
  unsets the variables that steer kube/cloud tooling to a config location
  outside ``$HOME``, so anything resolved at import time or in
  ``setUpClass`` lands in the throwaway directory;
* wraps ``unittest.TestCase.run`` so every test runs with its own fresh,
  empty ``$HOME``;
* installs an audit hook that refuses any access to the real home's kube and
  cloud-credential directories -- even through a path captured before
  ``$HOME`` was redirected -- and fails the test that tried, even if the code
  under test caught the error.
"""

import atexit
import os
import shutil
import sys
import tempfile
import unittest
from contextlib import contextmanager
from unittest import mock

# Variables that point kube/cloud tooling at a location outside $HOME. Left
# set, they would steer that tooling back to the developer's real config even
# with $HOME redirected.
REDIRECTING_ENV_VARS = ("KUBECONFIG", "CLOUDSDK_CONFIG", "AZURE_CONFIG_DIR")

# Entries under the real home that no test may touch.
PROTECTED_HOME_ENTRIES = (
    ".kube",
    ".aws",
    ".azure",
    ".azure-devops",
    os.path.join(".config", "gcloud"),
)

# Audit events that act on a path, mapped to the positions of their path
# arguments. Higher-level helpers (shutil.copy*, pathlib, ...) are covered
# through the os-level events they raise.
_PATH_EVENTS = {
    "open": (0,),
    "os.listdir": (0,),
    "os.scandir": (0,),
    "os.mkdir": (0,),
    "os.remove": (0,),
    "os.rmdir": (0,),
    "os.rename": (0, 1),
    "os.truncate": (0,),
    "os.chmod": (0,),
    "os.chown": (0,),
    "os.utime": (0,),
    "os.link": (0, 1),
    "os.symlink": (0, 1),
    "shutil.rmtree": (0,),
}


class RealHomeAccessError(RuntimeError):
    """Raised when test code touches a protected directory in the real home.

    Deliberately not an ``OSError``, so ``except OSError`` in the code under
    test does not swallow it.
    """


def _real_homes():
    homes = {os.path.expanduser("~")}
    try:
        import pwd

        homes.add(pwd.getpwuid(os.getuid()).pw_dir)
    except (ImportError, KeyError):
        pass
    return {h for home in homes for h in (home, os.path.realpath(home))}


# Resolved before $HOME is redirected below. pwd covers the case where this
# module is imported after something else already changed $HOME.
REAL_HOMES = frozenset(_real_homes())
PROTECTED_PATHS = tuple(
    sorted(os.path.join(home, entry) for home in REAL_HOMES for entry in PROTECTED_HOME_ENTRIES)
)

# Every blocked access, in order. The per-test check compares against this so
# a test fails even when the code under test swallowed RealHomeAccessError.
violations = []


def protected_path(path_arg):
    """Return the absolute path if ``path_arg`` is inside a protected
    directory of the real home, else ``None``."""
    if path_arg is None or isinstance(path_arg, int):
        return None
    try:
        path = os.path.abspath(os.fsdecode(path_arg))
    except TypeError:
        return None
    for root in PROTECTED_PATHS:
        if path == root or path.startswith(root + os.sep):
            return path
    return None


def _audit_hook(event, args):
    positions = _PATH_EVENTS.get(event)
    if positions is None:
        return
    for position in positions:
        if position >= len(args):
            continue
        path = protected_path(args[position])
        if path is not None:
            violations.append(f"{event} {path}")
            raise RealHomeAccessError(
                f"Test code tried to touch the real home directory ({event} {path}). "
                "Tests run with a temporary $HOME; derive paths from it at call "
                "time instead of capturing the real home."
            )


@contextmanager
def isolated_home():
    """Run the block with ``$HOME`` pointing at a fresh, empty directory."""
    home = tempfile.mkdtemp(prefix="rwl-test-home-")
    try:
        with mock.patch.dict(os.environ, {"HOME": home}):
            for name in REDIRECTING_ENV_VARS:
                os.environ.pop(name, None)
            yield home
    finally:
        shutil.rmtree(home, ignore_errors=True)


def _fail_on_new_violations(seen):
    new = violations[seen:]
    if new:
        raise AssertionError(
            "Test touched the real home directory (the access was blocked): " + "; ".join(new)
        )


def _install():
    if getattr(unittest.TestCase.run, "_isolates_home", False):
        return

    session_home = tempfile.mkdtemp(prefix="rwl-test-home-")
    atexit.register(shutil.rmtree, session_home, True)
    os.environ["HOME"] = session_home
    for name in REDIRECTING_ENV_VARS:
        os.environ.pop(name, None)

    sys.addaudithook(_audit_hook)

    original_run = unittest.TestCase.run

    def run(self, result=None):
        # Registered first, so it runs after the test's own cleanups.
        self.addCleanup(_fail_on_new_violations, len(violations))
        with isolated_home():
            return original_run(self, result)

    run._isolates_home = True
    unittest.TestCase.run = run


_install()

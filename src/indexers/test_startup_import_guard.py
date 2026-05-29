"""
Startup import regression guard.

The workspace-builder REST service bootstraps by importing
``workspace_builder.api`` -> ``startup.bootstrap()`` -> ``component.init_components()``,
which imports *every* registered component module (including the native
``gcpapi`` / ``awsapi`` / ``azure_devops`` indexers) at service-start time. If
any of those modules grows a top-level import with a side effect that fails in a
clean / locked-down image, uvicorn crashes on startup and the whole REST service
never comes up -- which takes down every CI job that uses the image, not just
the cloud whose indexer regressed.

The motivating regression (this file's reason to grow): ``indexers.azure_devops``
imported the Azure DevOps SDK at module scope (``from azure.devops.connection
import Connection`` etc). Importing ``azure.devops`` has a filesystem side effect
-- ``azure/devops/_file_cache.get_cache_dir()`` runs ``os.makedirs($HOME/.azure-devops/...)``
at import time. In the GCP/AWS CI containers ``$HOME`` resolves to the read-only
``/shared`` mount, so the makedirs raised ``PermissionError`` ->
``init_components()`` crashed -> uvicorn never started -> every CI job that uses
the image failed with "Total SLXs: 0" / "Error executing script".

These tests fail fast and cheaply (no container, no network). Cloud SDK clients
MUST stay lazily imported inside functions, and importing an indexer module MUST
NOT touch the filesystem.
"""

from __future__ import annotations

import importlib
import os
import re
import site
import subprocess
import sys
import tempfile
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)


def _registered_indexer_module_names() -> list[str]:
    """Read the INDEXER-stage component list straight from component.py so this
    guard automatically covers every indexer that init_components() imports.

    The list lives in the ``component_stages_init`` tuple as a local inside
    ``init_components()``, so we parse the source rather than import a private.
    """
    component_src_path = os.path.join(_SRC_DIR, "component.py")
    with open(component_src_path, "r", encoding="utf-8") as f:
        source = f.read()

    match = re.search(r"\(\s*Stage\.INDEXER\s*,\s*\[([^\]]*)\]", source)
    if not match:
        raise AssertionError(
            "Could not locate the (Stage.INDEXER, [...]) component list in "
            "component.py; update this guard if the registration moved."
        )
    names = re.findall(r"""['"]([^'"]+)['"]""", match.group(1))
    if not names:
        raise AssertionError("Parsed an empty INDEXER component list from component.py")
    return [f"indexers.{n}" for n in names]


def _import_module_in_isolated_home(module_name: str) -> tuple[int, str, list[str]]:
    """Import ``module_name`` in a fresh subprocess whose ``$HOME`` is an empty
    temp dir, then report (returncode, stderr, files_created_under_home).

    This reproduces the exact failure class: a module whose import touches the
    filesystem under ``$HOME`` (like the Azure DevOps SDK's
    ``os.makedirs($HOME/.azure-devops)``). A side-effect-free import leaves the
    temp HOME empty.
    """
    with tempfile.TemporaryDirectory() as home:
        env = dict(os.environ)
        # Preserve the real interpreter's import path. Python derives the
        # per-user site-packages dir from $HOME, so pointing HOME at a temp dir
        # would hide deps installed under ~/.local (e.g. in local dev). Pin the
        # real search path on PYTHONPATH so imports still resolve, while HOME
        # itself is the empty temp dir we watch for write side effects.
        extra_paths = [p for p in sys.path if p]
        try:
            extra_paths.append(site.getusersitepackages())
        except Exception:
            pass
        existing_pp = env.get("PYTHONPATH", "")
        env["PYTHONPATH"] = os.pathsep.join(
            [p for p in extra_paths if p] + ([existing_pp] if existing_pp else [])
        )
        env["HOME"] = home
        # Make sure the dedicated cache-dir override can't redirect the SDK's
        # makedirs away from HOME -- we want to observe writes under HOME.
        env.pop("AZURE_DEVOPS_CACHE_DIR", None)
        script = (
            "import importlib\n"
            f"importlib.import_module({module_name!r})\n"
        )
        result = subprocess.run(
            [sys.executable, "-c", script],
            cwd=_SRC_DIR,
            capture_output=True,
            text=True,
            env=env,
        )
        created = sorted(os.listdir(home))
        return result.returncode, result.stderr, created


class TopLevelImportGuardTests(TestCase):
    def test_native_indexers_import_at_module_scope(self):
        # A bare import must not require any cloud SDK to be installed.
        importlib.import_module("indexers.gcpapi")
        importlib.import_module("indexers.awsapi")

    def test_every_registered_indexer_imports_without_filesystem_side_effects(self):
        """Importing ANY registered indexer module must succeed and must NOT
        write to the filesystem (under $HOME). This is the generalized guard for
        the whole INDEXER stage and reproduces the azure_devops regression:
        pre-fix, importing ``indexers.azure_devops`` imported ``azure.devops``,
        which ran ``os.makedirs($HOME/.azure-devops)`` -> a ``.azure-devops``
        entry would appear under the isolated HOME and fail this test (and in a
        read-only HOME it crashed the import outright)."""
        indexer_modules = _registered_indexer_module_names()
        # azure_devops MUST be in the list we guard.
        self.assertIn("indexers.azure_devops", indexer_modules)

        for module_name in indexer_modules:
            returncode, stderr, created = _import_module_in_isolated_home(module_name)
            self.assertEqual(
                returncode,
                0,
                f"Importing {module_name} crashed (this is exactly what takes "
                f"down uvicorn on startup):\n{stderr}",
            )
            self.assertEqual(
                created,
                [],
                f"Importing {module_name} wrote {created} under $HOME at import "
                f"time. Module imports must be side-effect-free: move any SDK "
                f"import (and the filesystem work it triggers) inside the "
                f"function(s) that use it. A read-only $HOME (the CI /shared "
                f"mount) turns this write into a startup crash.",
            )

    def test_importing_azure_devops_does_not_import_sdk(self):
        """Importing indexers.azure_devops must not pull ``azure.devops`` into
        sys.modules. The dir-creation side effect only fires when ``azure.devops``
        is imported, so its absence proves the side effect could not have fired."""
        importlib.import_module("indexers.azure_devops")
        self.assertNotIn(
            "azure.devops",
            sys.modules,
            "indexers.azure_devops eagerly imported azure.devops, which runs "
            "os.makedirs($HOME/.azure-devops) at import time and crashes the REST "
            "service when $HOME is read-only. Keep the import lazy.",
        )

    def test_init_components_imports_every_registered_component(self):
        import component

        # Must not raise: this is exactly what startup.bootstrap() runs and what
        # would crash uvicorn (and thus the REST service) on a clean image.
        component.init_components()

        names = set(component.all_components.keys())
        # The native cloud indexers must be registered (they are imported
        # unconditionally for every run).
        for required in ("gcpapi", "awsapi", "azureapi", "azure_devops"):
            self.assertIn(required, names)

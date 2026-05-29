"""
Startup import regression guard.

The workspace-builder REST service bootstraps by importing
``workspace_builder.api`` -> ``startup.bootstrap()`` -> ``component.init_components()``,
which imports *every* registered component module (including the native
``gcpapi`` / ``awsapi`` indexers) at service-start time. If any of those
modules grows a top-level import that fails in a clean image (e.g. a cloud SDK
imported at module scope instead of lazily inside a function), uvicorn crashes
on startup and the whole REST service never comes up -- which takes down every
CI job that uses the image, not just the cloud whose indexer regressed.

These tests fail fast and cheaply (no container, no network) if that happens
again. The cloud SDK clients MUST stay lazily imported inside functions.
"""

from __future__ import annotations

import importlib
import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)


class TopLevelImportGuardTests(TestCase):
    def test_native_indexers_import_at_module_scope(self):
        # A bare import must not require any cloud SDK to be installed.
        importlib.import_module("indexers.gcpapi")
        importlib.import_module("indexers.awsapi")

    def test_init_components_imports_every_registered_component(self):
        import component

        # Must not raise: this is exactly what startup.bootstrap() runs and what
        # would crash uvicorn (and thus the REST service) on a clean image.
        component.init_components()

        names = set(component.all_components.keys())
        # The native cloud indexers must be registered (they are imported
        # unconditionally for every run).
        for required in ("gcpapi", "awsapi", "azureapi"):
            self.assertIn(required, names)

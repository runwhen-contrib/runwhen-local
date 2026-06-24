"""
Unit tests for the ``writeWorkspaceFilesToDisk`` fast path in
``renderers.render_output_items``.

Covers:
* default (unset) + sqlite store: per-file disk writes are skipped (the DB is
  canonical), but the ``workspace_artifacts`` record is still populated;
* explicit ``True``: files are written to disk in addition to the DB record;
* the memory-backend guardrail: skipping is forced OFF (files written) with a
  warning, so rendered output is never silently lost.
"""

from __future__ import annotations

import os
import sys
import tempfile
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from component import (  # noqa: E402
    Context,
    LOCATION_ID_SETTING,
    WORKSPACE_NAME_SETTING,
    WORKSPACE_OUTPUT_PATH_SETTING,
)
from outputter import FileSystemOutputter  # noqa: E402
from indexers.resource_writer import RESOURCE_STORE_BACKEND_SETTING  # noqa: E402
from renderers.rendered_artifacts import RENDERED_ARTIFACTS_PROPERTY  # noqa: E402
from renderers import render_output_items  # noqa: E402
from renderers.render_output_items import (  # noqa: E402
    OUTPUT_ITEMS_PROPERTY,
    OutputItem,
    WRITE_WORKSPACE_FILES_TO_DISK_SETTING,
    resolve_write_files_to_disk,
)


def _make_context(tmpdir, *, write_to_disk, backend):
    setting_values = {
        LOCATION_ID_SETTING.name: "loc1",
        WORKSPACE_NAME_SETTING.name: "ws",
        WORKSPACE_OUTPUT_PATH_SETTING.name: "workspaces",
        RESOURCE_STORE_BACKEND_SETTING.name: backend,
    }
    if write_to_disk is not None:
        setting_values[WRITE_WORKSPACE_FILES_TO_DISK_SETTING.name] = write_to_disk
    ctx = Context(setting_values=setting_values, outputter=FileSystemOutputter(tmpdir))
    render_output_items.load(ctx)
    return ctx


def _add_raw_items(ctx):
    # raw_content items render verbatim, avoiding template machinery.
    items = {
        "workspaces/ws/slxs/a/slx.yaml": "kind: ServiceLevelX\n",
        "workspaces/ws/slxs/a/runbook.yaml": "kind: Runbook\n",
    }
    output_items = ctx.get_property(OUTPUT_ITEMS_PROPERTY)
    for path, content in items.items():
        output_items[path] = OutputItem(path, "raw", {}, raw_content=content)
    return items


class ResolveWriteFlagTests(TestCase):
    def test_default_skips_with_sqlite(self):
        # New default: writeWorkspaceFilesToDisk is opt-out, so an unset value
        # with the sqlite store skips the per-file disk writes (DB is canonical).
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=None, backend="sqlite")
            self.assertFalse(resolve_write_files_to_disk(ctx))

    def test_setting_default_value_is_false(self):
        self.assertIs(WRITE_WORKSPACE_FILES_TO_DISK_SETTING.default_value, False)

    def test_explicit_true_writes_with_sqlite(self):
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=True, backend="sqlite")
            self.assertTrue(resolve_write_files_to_disk(ctx))

    def test_skip_with_sqlite(self):
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=False, backend="sqlite")
            self.assertFalse(resolve_write_files_to_disk(ctx))

    def test_default_with_memory_backend_forces_writes(self):
        # Guardrail also applies to the (now opt-out) default: with a non-sqlite
        # store there is no DB to fall back to, so writes are forced ON.
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=None, backend="memory")
            with self.assertLogs(render_output_items.logger, level="WARNING") as cm:
                result = resolve_write_files_to_disk(ctx)
            self.assertTrue(result)
            self.assertTrue(any("forcing workspace file writes ON" in m for m in cm.output))

    def test_guardrail_forces_writes_on_memory_backend(self):
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=False, backend="memory")
            with self.assertLogs(render_output_items.logger, level="WARNING") as cm:
                result = resolve_write_files_to_disk(ctx)
            self.assertTrue(result)
            self.assertTrue(any("forcing workspace file writes ON" in m for m in cm.output))


class RenderSkipTests(TestCase):
    def test_default_skips_disk_and_records_artifacts(self):
        # End-to-end through render() with the flag unset: the new opt-out
        # default skips disk writes (with the sqlite store) but still records
        # every artifact for the DB.
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=None, backend="sqlite")
            items = _add_raw_items(ctx)
            render_output_items.render(ctx)

            for path in items:
                self.assertFalse(os.path.exists(os.path.join(tmp, path)), f"unexpected file {path}")
            artifacts = ctx.get_property(RENDERED_ARTIFACTS_PROPERTY)
            recorded = {a["relative_path"]: a["content"] for a in artifacts}
            self.assertEqual(recorded, items)

    def test_skip_disk_writes_still_records_artifacts(self):
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=False, backend="sqlite")
            items = _add_raw_items(ctx)
            render_output_items.render(ctx)

            # No workspace files written to disk ...
            for path in items:
                self.assertFalse(os.path.exists(os.path.join(tmp, path)), f"unexpected file {path}")
            # ... but artifacts captured for the DB.
            artifacts = ctx.get_property(RENDERED_ARTIFACTS_PROPERTY)
            recorded = {a["relative_path"]: a["content"] for a in artifacts}
            self.assertEqual(recorded, items)

    def test_default_writes_files_and_records(self):
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=True, backend="sqlite")
            items = _add_raw_items(ctx)
            render_output_items.render(ctx)

            for path, content in items.items():
                full = os.path.join(tmp, path)
                self.assertTrue(os.path.exists(full), f"missing file {path}")
                with open(full) as fh:
                    self.assertEqual(fh.read(), content)
            artifacts = ctx.get_property(RENDERED_ARTIFACTS_PROPERTY)
            self.assertEqual(len(artifacts), len(items))

    def test_memory_backend_guardrail_writes_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            ctx = _make_context(tmp, write_to_disk=False, backend="memory")
            items = _add_raw_items(ctx)
            with self.assertLogs(render_output_items.logger, level="WARNING"):
                render_output_items.render(ctx)
            for path in items:
                self.assertTrue(os.path.exists(os.path.join(tmp, path)), f"missing file {path}")

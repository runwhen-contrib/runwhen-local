"""
Unit tests for ``indexers.workspace_artifacts_tar``.

These verify that a workspace tar built from the SQLite ``workspace_artifacts``
table is behaviour-equivalent to the disk-based tar that ``run.py`` produces with
``archive.add(".")`` from ``output/workspaces/<workspace_name>`` (same file
member set + byte-identical contents), and that the DB-sourced SLX count matches
the directory scan.
"""

from __future__ import annotations

import io
import os
import sqlite3
import sys
import tarfile
import tempfile
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.sqlite_resource_writer import persist_sqlite_store  # noqa: E402
from indexers.workspace_artifacts_tar import (  # noqa: E402
    build_upload_tar_gz_from_db_file,
    count_slxs_from_db_file,
    tar_file_members,
)

WORKSPACE_NAME = "my-workspace"

# A representative rendered tree: two SLX directories each with the usual
# slx/sli/runbook trio + a Skill overlay, plus the top-level workspace.yaml.
SAMPLE_FILES = {
    f"workspaces/{WORKSPACE_NAME}/workspace.yaml": "kind: Workspace\nname: my-workspace\n",
    f"workspaces/{WORKSPACE_NAME}/slxs/app-health/slx.yaml": "kind: ServiceLevelX\nname: app-health\n",
    f"workspaces/{WORKSPACE_NAME}/slxs/app-health/sli.yaml": "kind: ServiceLevelIndicator\n",
    f"workspaces/{WORKSPACE_NAME}/slxs/app-health/runbook.yaml": "kind: Runbook\nsteps: []\n",
    f"workspaces/{WORKSPACE_NAME}/slxs/app-health/Skill.md": "# Skill\nUnicode: café ✓\n",
    f"workspaces/{WORKSPACE_NAME}/slxs/db-latency/slx.yaml": "kind: ServiceLevelX\nname: db-latency\n",
    f"workspaces/{WORKSPACE_NAME}/slxs/db-latency/sli.yaml": "kind: ServiceLevelIndicator\nthreshold: 5\n",
    f"workspaces/{WORKSPACE_NAME}/slxs/db-latency/runbook.yaml": "kind: Runbook\nsteps: [a, b]\n",
}


def _build_context_with_artifacts(tmpdir: str):
    """Render the sample tree to disk (FileSystemOutputter) *and* record it as
    workspace artifacts, mirroring the real render path with disk writes on."""
    from component import Context, WORKSPACE_NAME_SETTING
    from outputter import FileSystemOutputter
    from resources import REGISTRY_PROPERTY_NAME, Registry
    from renderers.rendered_artifacts import init_rendered_artifacts, record_rendered_artifact
    from indexers.resource_writer import RESOURCE_STORE_BACKEND_SETTING

    ctx = Context(
        setting_values={
            RESOURCE_STORE_BACKEND_SETTING.name: "sqlite",
            WORKSPACE_NAME_SETTING.name: WORKSPACE_NAME,
        },
        outputter=FileSystemOutputter(tmpdir),
    )
    ctx.set_property(REGISTRY_PROPERTY_NAME, Registry())
    init_rendered_artifacts(ctx)
    for rel_path, content in SAMPLE_FILES.items():
        ctx.write_file(rel_path, content)
        record_rendered_artifact(ctx, rel_path, content)
    return ctx


def _disk_upload_tar(tmpdir: str) -> bytes:
    """Replicate run.py's disk-based upload tar: add('.') from the ws dir."""
    workspace_dir = os.path.join(tmpdir, "workspaces", WORKSPACE_NAME)
    tar_bytes = io.BytesIO()
    archive = tarfile.open(mode="x:gz", fileobj=tar_bytes)
    saved = os.getcwd()
    os.chdir(workspace_dir)
    try:
        archive.add(".")
    finally:
        os.chdir(saved)
    archive.close()
    return tar_bytes.getvalue()


class UploadTarEquivalenceTests(TestCase):
    def test_db_tar_matches_disk_tar(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _build_context_with_artifacts(tmpdir)
            persist_sqlite_store(ctx, db_path="resources.sqlite")
            db_file = os.path.join(tmpdir, "resources.sqlite")

            disk_tar = _disk_upload_tar(tmpdir)
            db_tar = build_upload_tar_gz_from_db_file(db_file, WORKSPACE_NAME)

            disk_members = tar_file_members(disk_tar)
            db_members = tar_file_members(db_tar)

            # Same set of file members ...
            self.assertEqual(set(disk_members.keys()), set(db_members.keys()))
            # ... rooted at the workspace dir (no leading workspaces/<ws>/) ...
            self.assertIn("slxs/app-health/slx.yaml", db_members)
            self.assertIn("workspace.yaml", db_members)
            # ... with byte-identical contents (incl. unicode).
            for name in disk_members:
                self.assertEqual(disk_members[name], db_members[name], f"content mismatch for {name}")

    def test_db_tar_content_matches_source(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _build_context_with_artifacts(tmpdir)
            persist_sqlite_store(ctx, db_path="resources.sqlite")
            db_file = os.path.join(tmpdir, "resources.sqlite")

            db_members = tar_file_members(build_upload_tar_gz_from_db_file(db_file, WORKSPACE_NAME))
            expected = {
                rel_path[len(f"workspaces/{WORKSPACE_NAME}/"):]: content.encode("utf-8")
                for rel_path, content in SAMPLE_FILES.items()
            }
            self.assertEqual(db_members, expected)


def _build_db_only_context(tmpdir: str):
    """Record the sample tree as workspace artifacts WITHOUT writing the files to
    disk -- mirrors the new default (writeWorkspaceFilesToDisk=False) where the
    sqlite store is the only copy of the rendered content."""
    from component import Context, WORKSPACE_NAME_SETTING
    from outputter import FileSystemOutputter
    from resources import REGISTRY_PROPERTY_NAME, Registry
    from renderers.rendered_artifacts import init_rendered_artifacts, record_rendered_artifact
    from indexers.resource_writer import RESOURCE_STORE_BACKEND_SETTING

    ctx = Context(
        setting_values={
            RESOURCE_STORE_BACKEND_SETTING.name: "sqlite",
            WORKSPACE_NAME_SETTING.name: WORKSPACE_NAME,
        },
        outputter=FileSystemOutputter(tmpdir),
    )
    ctx.set_property(REGISTRY_PROPERTY_NAME, Registry())
    init_rendered_artifacts(ctx)
    for rel_path, content in SAMPLE_FILES.items():
        # NB: no ctx.write_file(...) -- only the DB record, like skip-disk render.
        record_rendered_artifact(ctx, rel_path, content)
    return ctx


class StandaloneUploadFromDbTests(TestCase):
    """The standalone `upload` subcommand (a separate process from `run`) must
    build the upload tar from the extracted resources.sqlite, with NO
    workspaces/<ws> tree on disk (the default under writeWorkspaceFilesToDisk=False)."""

    def test_upload_tar_built_from_db_with_no_workspaces_dir(self):
        import run

        with tempfile.TemporaryDirectory() as output_dir:
            ctx = _build_db_only_context(output_dir)
            persist_sqlite_store(ctx, db_path="resources.sqlite")

            # Skip-disk run leaves resources.sqlite but no rendered file tree.
            self.assertTrue(os.path.exists(os.path.join(output_dir, "resources.sqlite")))
            self.assertFalse(os.path.exists(os.path.join(output_dir, "workspaces")))

            # run.py resolves the DB (sqlite backend default), keyed off the file
            # rather than the workspaces dir.
            db_path = run.resource_store_db_file(output_dir, "sqlite", None)
            self.assertEqual(db_path, os.path.join(output_dir, "resources.sqlite"))

            # ... and the upload tar is built from that DB.
            db_members = tar_file_members(build_upload_tar_gz_from_db_file(db_path, WORKSPACE_NAME))
            expected = {
                rel_path[len(f"workspaces/{WORKSPACE_NAME}/"):]: content.encode("utf-8")
                for rel_path, content in SAMPLE_FILES.items()
            }
            self.assertEqual(db_members, expected)

    def test_resource_store_db_file_none_for_memory_or_missing(self):
        import run

        with tempfile.TemporaryDirectory() as output_dir:
            # memory backend -> never sourced from a DB
            self.assertIsNone(run.resource_store_db_file(output_dir, "memory", None))
            # sqlite backend but no file present yet -> None (caller falls back)
            self.assertIsNone(run.resource_store_db_file(output_dir, "sqlite", None))
            # unset backend defaults to sqlite; still None until the file exists
            self.assertIsNone(run.resource_store_db_file(output_dir, None, None))


class SlxCountTests(TestCase):
    def test_db_slx_count_matches_listdir(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            ctx = _build_context_with_artifacts(tmpdir)
            persist_sqlite_store(ctx, db_path="resources.sqlite")
            db_file = os.path.join(tmpdir, "resources.sqlite")

            slxs_path = os.path.join(tmpdir, "workspaces", WORKSPACE_NAME, "slxs")
            listdir_count = len(
                [n for n in os.listdir(slxs_path) if os.path.isdir(os.path.join(slxs_path, n))]
            )
            db_count = count_slxs_from_db_file(db_file, WORKSPACE_NAME)

            self.assertEqual(db_count, 2)
            self.assertEqual(db_count, listdir_count)

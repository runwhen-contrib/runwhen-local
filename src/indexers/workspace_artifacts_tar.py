"""Build workspace ``tar.gz`` archives from the SQLite ``workspace_artifacts`` table.

The render phase records the full text of every rendered SLX / SLI / runbook /
workspace file into the ``workspace_artifacts`` table (see
:func:`renderers.rendered_artifacts.record_rendered_artifact`). That makes the
on-disk copy of those files redundant for the two packaging consumers in
``run.py``:

* the **upload tar** that is POSTed to ``{papi}/api/v3/workspaces/{ws}/upload``
* the **SLX count** printed after a run

This module lets those consumers reconstruct the workspace tree (or just count
SLXs) directly from the DB, so the small-file IO + tar-from-disk walk can be
skipped on large workspaces.

The produced archive is *behaviour-equivalent* to the disk-based tar that
``run.py`` builds today with ``archive.add(".")`` from
``output/workspaces/<workspace_name>``: it carries the same set of file members
with byte-identical contents. (Directory entries and per-file mtime/uid/gid
metadata are intentionally not reproduced - they are not needed for extraction
and depend on the filesystem, so they are never part of the equivalence
contract; see :func:`tar_file_members` which both sides are compared through.)
"""

from __future__ import annotations

import io
import sqlite3
import tarfile
from typing import Iterable, Optional

# A fixed modification time keeps the generated archive deterministic. The
# value is irrelevant to consumers (the platform reads file contents, not
# mtimes) but determinism makes the builder easy to test and cache-friendly.
_DETERMINISTIC_MTIME = 0


def _normalize_member_path(path: str) -> str:
    """Normalise a tar member path for comparison / construction.

    ``tarfile``'s ``add(".")`` prefixes every member with ``./``; the DB stores
    plain relative paths. Strip a single leading ``./`` and any leading ``/``
    so both representations line up.
    """
    normalized = path.replace("\\", "/")
    if normalized.startswith("./"):
        normalized = normalized[2:]
    normalized = normalized.lstrip("/")
    return normalized


def build_tar_gz_from_artifacts(
    artifacts: Iterable[tuple[str, str | bytes]],
    *,
    mtime: int = _DETERMINISTIC_MTIME,
) -> bytes:
    """Build an in-memory ``tar.gz`` from ``(member_path, content)`` pairs.

    Only file members are emitted (no explicit directory entries); tar
    extraction creates parent directories on demand, so the resulting tree is
    identical to the disk-based archive once extracted.
    """
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
        for member_path, content in artifacts:
            data = content if isinstance(content, bytes) else content.encode("utf-8")
            info = tarfile.TarInfo(_normalize_member_path(member_path))
            info.size = len(data)
            info.mtime = mtime
            tar.addfile(info, io.BytesIO(data))
    return buffer.getvalue()


def read_workspace_artifacts(
    conn: sqlite3.Connection, workspace_name: str
) -> list[tuple[str, str]]:
    """Return ``(relative_path, content)`` rows for a workspace, ordered by path."""
    rows = conn.execute(
        "SELECT relative_path, content FROM workspace_artifacts "
        "WHERE workspace_name = ? ORDER BY relative_path",
        (workspace_name,),
    ).fetchall()
    return [(row[0], row[1]) for row in rows]


def build_workspace_tar_gz(
    conn: sqlite3.Connection,
    workspace_name: str,
    *,
    strip_prefix: Optional[str] = None,
    mtime: int = _DETERMINISTIC_MTIME,
) -> bytes:
    """Build a ``tar.gz`` of a workspace's rendered files from the DB.

    :param strip_prefix: leading path component to drop from each member so the
        archive is rooted where the consumer expects. For the platform upload
        this is ``"workspaces/<workspace_name>/"`` so members become
        ``slxs/.../slx.yaml`` (matching ``add(".")`` from the workspace dir).
        When ``None`` the stored ``relative_path`` is used verbatim (matching
        the ``/run`` response tar produced by the outputter).
    """
    members: list[tuple[str, str]] = []
    for relative_path, content in read_workspace_artifacts(conn, workspace_name):
        member = relative_path
        if strip_prefix and member.startswith(strip_prefix):
            member = member[len(strip_prefix):]
        members.append((member, content))
    return build_tar_gz_from_artifacts(members, mtime=mtime)


def count_slxs(conn: sqlite3.Connection, workspace_name: str) -> int:
    """Count SLXs for a workspace (one ``slx.yaml`` per SLX directory)."""
    row = conn.execute(
        "SELECT COUNT(*) FROM workspace_artifacts "
        "WHERE workspace_name = ? AND artifact_kind = 'slx'",
        (workspace_name,),
    ).fetchone()
    return int(row[0]) if row else 0


# ---------------------------------------------------------------------------
# Convenience wrappers that operate on a DB file path (used by run.py, which
# only has the extracted sqlite file on disk, not a live connection).
# ---------------------------------------------------------------------------

def build_upload_tar_gz_from_db_file(
    db_file_path: str,
    workspace_name: str,
    workspace_output_path: str = "workspaces",
) -> bytes:
    """Build the platform-upload ``tar.gz`` for ``workspace_name`` from a DB file.

    Mirrors the disk path in ``run.py`` which tars ``output/workspaces/<ws>``
    rooted at the workspace dir, so the strip prefix is
    ``"<workspace_output_path>/<workspace_name>/"``.
    """
    strip_prefix = f"{workspace_output_path}/{workspace_name}/"
    conn = sqlite3.connect(db_file_path)
    try:
        return build_workspace_tar_gz(conn, workspace_name, strip_prefix=strip_prefix)
    finally:
        conn.close()


def count_slxs_from_db_file(db_file_path: str, workspace_name: str) -> int:
    """Count SLXs for ``workspace_name`` from a DB file."""
    conn = sqlite3.connect(db_file_path)
    try:
        return count_slxs(conn, workspace_name)
    finally:
        conn.close()


def tar_file_members(tar_bytes: bytes) -> dict[str, bytes]:
    """Extract ``{normalized_member_path: content_bytes}`` for file members.

    Directory members are skipped so this captures exactly the equivalence
    contract (same files + same bytes) shared by the DB-built and disk-built
    archives.
    """
    members: dict[str, bytes] = {}
    with tarfile.open(fileobj=io.BytesIO(tar_bytes), mode="r:*") as tar:
        for info in tar.getmembers():
            if not info.isfile():
                continue
            extracted = tar.extractfile(info)
            data = extracted.read() if extracted is not None else b""
            members[_normalize_member_path(info.name)] = data
    return members


__all__ = [
    "build_tar_gz_from_artifacts",
    "read_workspace_artifacts",
    "build_workspace_tar_gz",
    "count_slxs",
    "build_upload_tar_gz_from_db_file",
    "count_slxs_from_db_file",
    "tar_file_members",
]

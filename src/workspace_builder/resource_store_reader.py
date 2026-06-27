"""Read-only access to the persisted SQLite resource store."""

from __future__ import annotations

import json
import logging
import os
import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator, Optional

try:
    import yaml as _yaml  # PyYAML is already a runtime dep of workspace-builder
except ImportError:  # pragma: no cover - PyYAML is a hard dep but be defensive
    _yaml = None

logger = logging.getLogger(__name__)

from indexers.sqlite_resource_writer import (
    count_workspace_artifacts,
    get_resource,
    get_schema_version,
    list_platforms,
    list_resource_types,
    list_resources,
    list_workspace_artifact_kinds,
    open_database,
)

DEFAULT_DB_FILENAME = "resources.sqlite"


def resolve_resource_db_path() -> Path:
    """Return the filesystem path to the resource SQLite database."""
    explicit = os.getenv("RW_RESOURCE_STORE_PATH", "").strip()
    if explicit:
        path = Path(explicit)
        if path.is_absolute():
            return path
        output_dir = _output_directory()
        return output_dir / explicit

    output_dir = _output_directory()
    filename = os.getenv("RW_RESOURCE_STORE_FILENAME", DEFAULT_DB_FILENAME).strip()
    return output_dir / filename


def _output_directory() -> Path:
    output_dir = os.getenv("RW_OUTPUT_DIR", "").strip()
    if output_dir:
        return Path(output_dir)
    shared = os.getenv("RUNWHEN_SHARED", "/shared").strip() or "/shared"
    return Path(shared) / "output"


@contextmanager
def resource_db_connection() -> Iterator[sqlite3.Connection]:
    db_path = resolve_resource_db_path()
    if not db_path.is_file():
        raise FileNotFoundError(
            f"Resource store database not found at {db_path}. "
            "Run discovery with resourceStoreBackend: sqlite first."
        )
    conn = open_database(str(db_path))
    try:
        yield conn
    finally:
        conn.close()


def get_store_summary(conn: sqlite3.Connection) -> dict[str, Any]:
    platforms = list_platforms(conn)
    resource_types = list_resource_types(conn)
    resource_count = conn.execute("SELECT COUNT(*) FROM resources").fetchone()[0]
    artifact_count = count_workspace_artifacts(conn)
    artifact_kinds = list_workspace_artifact_kinds(conn)
    return {
        "schema_version": get_schema_version(conn),
        "platform_count": len(platforms),
        "resource_type_count": len(resource_types),
        "resource_count": resource_count,
        "artifact_count": artifact_count,
        "artifact_kinds": artifact_kinds,
        "platforms": platforms,
    }


def count_resources(
    conn: sqlite3.Connection,
    platform: Optional[str] = None,
    resource_type: Optional[str] = None,
    q: Optional[str] = None,
) -> int:
    where: list[str] = []
    params: list[Any] = []
    if platform:
        where.append("platform = ?")
        params.append(platform)
    if resource_type:
        where.append("resource_type = ?")
        params.append(resource_type)
    if q:
        where.append("(name LIKE ? OR qualified_name LIKE ?)")
        pattern = f"%{q}%"
        params.extend([pattern, pattern])
    sql = "SELECT COUNT(*) FROM resources"
    if where:
        sql += " WHERE " + " AND ".join(where)
    return int(conn.execute(sql, tuple(params)).fetchone()[0])


def search_resources(
    conn: sqlite3.Connection,
    platform: Optional[str] = None,
    resource_type: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[dict[str, Any]]:
    where: list[str] = []
    params: list[Any] = []
    if platform:
        where.append("platform = ?")
        params.append(platform)
    if resource_type:
        where.append("resource_type = ?")
        params.append(resource_type)
    if q:
        where.append("(name LIKE ? OR qualified_name LIKE ?)")
        pattern = f"%{q}%"
        params.extend([pattern, pattern])

    sql = (
        "SELECT platform, resource_type, qualified_name, name, "
        "attributes_json, created_at, updated_at FROM resources"
    )
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY platform, resource_type, qualified_name LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    from indexers.sqlite_resource_writer import decode_attributes

    return [
        {
            "platform": row[0],
            "resource_type": row[1],
            "qualified_name": row[2],
            "name": row[3],
            "attributes": decode_attributes(row[4]),
            "created_at": row[5],
            "updated_at": row[6],
        }
        for row in conn.execute(sql, tuple(params))
    ]


def json_safe(value: Any) -> Any:
    """Convert decoded attribute trees into JSON-serializable values."""
    if isinstance(value, dict):
        return {k: json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [json_safe(v) for v in value]
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return str(value)


# Fallback regex for ``spec.alias`` when PyYAML is unavailable or fails.
# The renderer always emits the field as ``"alias": "<value>"`` (double-quoted
# key and value) inside the ``"spec":`` block, but we keep the regex permissive
# so unquoted keys / single-quoted values are still recognized.
_ALIAS_REGEX = re.compile(
    r'''^\s*["']?alias["']?\s*:\s*(?:"([^"\n]*)"|'([^'\n]*)'|([^\n#]+))''',
    re.MULTILINE,
)


def extract_slx_display_name(slx_yaml_text: str) -> Optional[str]:
    """Return the human-readable ``spec.alias`` from a rendered ``slx.yaml``.

    Falls back to a permissive regex when PyYAML fails (e.g. truncated /
    malformed content). Returns ``None`` when no alias can be recovered, in
    which case callers should fall back to the on-disk SLX directory name.
    """
    if not slx_yaml_text:
        return None
    if _yaml is not None:
        try:
            parsed = _yaml.safe_load(slx_yaml_text)
        except _yaml.YAMLError as exc:
            logger.debug("slx.yaml parse failed; falling back to regex: %s", exc)
            parsed = None
        if isinstance(parsed, dict):
            spec = parsed.get("spec")
            if isinstance(spec, dict):
                alias = spec.get("alias")
                if isinstance(alias, str) and alias.strip():
                    return alias.strip()
    match = _ALIAS_REGEX.search(slx_yaml_text)
    if match:
        value = next((g for g in match.groups() if g is not None), None)
        if value:
            return value.strip().rstrip(",").strip()
    return None


def list_slx_bundles(
    conn: sqlite3.Connection,
    workspace_name: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 200,
    offset: int = 0,
) -> dict[str, Any]:
    """Group rendered artifacts by ``slx_directory`` into SLX bundles.

    Each returned bundle includes a ``display_name`` field parsed from the
    bundle's ``slx.yaml`` ``spec.alias`` (the human-readable label authored in
    the generation rule). This is what the web explorer and MCP tooling show
    instead of the cryptic on-disk SLX directory name (e.g.
    ``cvbm-sc1-sa-check-8e362b02``). Falls back to ``slx_name`` when no alias
    is recoverable.

    Returns a dict with ``items`` (each bundle has ``slx_directory``, ``slx_name``,
    ``display_name``, ``workspace_name``, file paths grouped by kind) and a
    ``total`` count of distinct bundles matching the filter.
    """
    where: list[str] = ["slx_directory IS NOT NULL"]
    params: list[Any] = []
    if workspace_name:
        where.append("workspace_name = ?")
        params.append(workspace_name)
    if q:
        # ``content LIKE`` already matches anything inside the rendered SLX
        # YAML, including ``spec.alias``, so the human-readable display name
        # is searchable even though the WHERE clause keys off raw columns.
        where.append("(slx_directory LIKE ? OR relative_path LIKE ? OR content LIKE ?)")
        pattern = f"%{q}%"
        params.extend([pattern, pattern, pattern])
    where_sql = " WHERE " + " AND ".join(where)

    total = int(
        conn.execute(
            f"SELECT COUNT(DISTINCT workspace_name || '|' || slx_directory) "
            f"FROM workspace_artifacts{where_sql}",
            tuple(params),
        ).fetchone()[0]
    )

    bundle_sql = (
        f"SELECT workspace_name, slx_directory, COUNT(*) AS file_count "
        f"FROM workspace_artifacts{where_sql} "
        f"GROUP BY workspace_name, slx_directory "
        f"ORDER BY workspace_name, slx_directory "
        f"LIMIT ? OFFSET ?"
    )
    bundle_params = list(params) + [limit, offset]
    bundle_rows = list(conn.execute(bundle_sql, tuple(bundle_params)))

    items: list[dict[str, Any]] = []
    for ws, slx_dir, file_count in bundle_rows:
        files_sql = (
            "SELECT relative_path, artifact_kind, media_type, "
            "length(content) AS size_bytes, updated_at "
            "FROM workspace_artifacts "
            "WHERE workspace_name = ? AND slx_directory = ? "
            "ORDER BY artifact_kind, relative_path"
        )
        files = [
            {
                "relative_path": row[0],
                "artifact_kind": row[1],
                "media_type": row[2],
                "size_bytes": row[3],
                "updated_at": row[4],
            }
            for row in conn.execute(files_sql, (ws, slx_dir))
        ]
        kinds = sorted({f["artifact_kind"] for f in files})
        slx_name = os.path.basename(slx_dir) if slx_dir else None

        # Pull just the SLX artifact's content (small string) so we can parse
        # the ``spec.alias`` for display. Anything else would be too big to
        # eagerly materialize in a list view.
        display_name: Optional[str] = None
        if "slx" in kinds:
            alias_row = conn.execute(
                "SELECT content FROM workspace_artifacts "
                "WHERE workspace_name = ? AND slx_directory = ? "
                "AND artifact_kind = 'slx' LIMIT 1",
                (ws, slx_dir),
            ).fetchone()
            if alias_row and alias_row[0]:
                display_name = extract_slx_display_name(alias_row[0])
        if not display_name:
            display_name = slx_name

        items.append(
            {
                "workspace_name": ws,
                "slx_directory": slx_dir,
                "slx_name": slx_name,
                "display_name": display_name,
                "file_count": file_count,
                "kinds": kinds,
                "has_slx": "slx" in kinds,
                "has_sli": "sli" in kinds,
                "has_runbook": "runbook" in kinds,
                "has_skill": "skill" in kinds,
                "files": files,
            }
        )

    return {"total": total, "items": items, "limit": limit, "offset": offset}

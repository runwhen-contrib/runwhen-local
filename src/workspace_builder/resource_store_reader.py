"""Read-only access to the persisted SQLite resource store."""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator, Optional

from indexers.sqlite_resource_writer import (
    get_resource,
    get_schema_version,
    list_platforms,
    list_resource_types,
    list_resources,
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
    return {
        "schema_version": get_schema_version(conn),
        "platform_count": len(platforms),
        "resource_type_count": len(resource_types),
        "resource_count": resource_count,
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

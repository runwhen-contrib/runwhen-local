"""
SQLite-backed :class:`ResourceWriter`.

The long-term direction for ``runwhen-local`` is to replace the in-memory
``Registry`` + FastAPI REST shell with a small local resource DB queried by a
fast read-only REST API. :class:`SqliteResourceWriter` is the first concrete
step: it persists the indexer-discovered resource graph to a SQLite database
so the future read service has something to talk to.

It is a *dual* writer today:

1. It composes :class:`indexers.resource_writer.InMemoryRegistryWriter` and
   forwards every ``add_resource`` / ``finalize`` call to it. This keeps the
   in-memory ``Registry`` populated for enrichers / renderers, which still
   read from it.
2. On ``finalize()`` (after deferred-RG resolution has run via the in-memory
   writer), it walks the **full** ``Registry`` and snapshots it into the
   SQLite database in one transaction.

The snapshot-at-finalize approach intentionally captures the *whole* registry,
not just resources the writer itself recorded. That means the DB reflects
state contributed by every indexer that happened to run before whichever
indexer triggered ``finalize()`` (today only the ``azureapi`` path goes
through ``ResourceWriter``; ``kubeapi`` and ``cloudquery`` still mutate the
registry directly). The migration roadmap in
``docs/architecture/resource-writer.md`` covers how this becomes a complete
picture once all indexers funnel writes through the seam.

Schema
------

Three tables form a normalised resource graph::

    platforms        (name PK)
    resource_types   (platform FK, name, custom_attributes JSON, PK platform+name)
    resources        (platform, resource_type, qualified_name) PK
                     + name, attributes_json, created_at, updated_at

``attributes_json`` is the JSON-encoded payload produced by
:func:`encode_attributes`, which preserves rich types via a small set of
reserved markers (``$ref`` for inter-resource references, ``$lod`` for
``LevelOfDetail`` enums, ``$datetime`` / ``$date`` for date types). The full
encoding is deterministic and round-trippable so a future REST service can
reconstruct cross-resource references when needed.
"""

from __future__ import annotations

import datetime as _dt
import enum
import json
import logging
import os
import sqlite3
import tempfile
from typing import TYPE_CHECKING, Any, Optional

from .resource_writer import InMemoryRegistryWriter

if TYPE_CHECKING:
    from component import Context
    from resources import Registry, Resource

logger = logging.getLogger(__name__)


# Bumped when the on-disk schema changes in a backwards-incompatible way.
SCHEMA_VERSION = 1


_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platforms (
    name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS resource_types (
    platform TEXT NOT NULL,
    name TEXT NOT NULL,
    custom_attributes TEXT NOT NULL,
    PRIMARY KEY (platform, name),
    FOREIGN KEY (platform) REFERENCES platforms(name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
    platform TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    qualified_name TEXT NOT NULL,
    name TEXT NOT NULL,
    attributes_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (platform, resource_type, qualified_name),
    FOREIGN KEY (platform, resource_type)
        REFERENCES resource_types(platform, name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resources_name
    ON resources (platform, resource_type, name);
"""


# ---------------------------------------------------------------------------
# Encoder / decoder
# ---------------------------------------------------------------------------

# Marker keys used inside ``attributes_json``. Chosen with a leading ``$`` so
# they cannot clash with attribute names that originate from cloud APIs (those
# are snake_case). Centralised here so the decoder mirror knows about them too.
_REF_KEY = "$ref"
_LOD_KEY = "$lod"
_DATETIME_KEY = "$datetime"
_DATE_KEY = "$date"
_ENUM_KEY = "$enum"


def encode_attributes(attributes: dict[str, Any]) -> str:
    """Serialise an attributes dict to a deterministic JSON string.

    See module docstring for the marker scheme. ``sort_keys=True`` keeps
    output stable for diff-based testing.
    """
    return json.dumps(_encode_value(attributes), sort_keys=True)


def decode_attributes(attributes_json: str) -> dict[str, Any]:
    """Round-trip companion to :func:`encode_attributes`.

    Resource ``$ref`` markers are *not* resolved against a live registry here -
    callers (e.g. a future REST service) decide whether to dereference. The
    decoder leaves them as plain dicts so they remain visible to consumers
    that want to follow them on demand.
    """
    raw = json.loads(attributes_json)
    return _decode_value(raw)


def _encode_value(value: Any) -> Any:
    # Local imports to avoid pulling enrichers / resources at module import
    # time (this writer is constructed late in the pipeline).
    from resources import Resource
    try:
        from enrichers.generation_rule_types import LevelOfDetail
    except Exception:
        LevelOfDetail = None  # type: ignore[assignment]

    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, dict):
        return {str(k): _encode_value(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set, frozenset)):
        return [_encode_value(v) for v in value]
    if isinstance(value, Resource):
        rt = getattr(value, "resource_type", None)
        platform_name = None
        type_name = None
        if rt is not None:
            type_name = getattr(rt, "name", None)
            platform = getattr(rt, "platform", None)
            if platform is not None:
                platform_name = getattr(platform, "name", None)
        return {
            _REF_KEY: {
                "platform": platform_name,
                "resource_type": type_name,
                "qualified_name": getattr(value, "qualified_name", None),
                "name": getattr(value, "name", None),
            }
        }
    if LevelOfDetail is not None and isinstance(value, LevelOfDetail):
        return {_LOD_KEY: value.name}
    if isinstance(value, _dt.datetime):
        return {_DATETIME_KEY: value.isoformat()}
    if isinstance(value, _dt.date):
        return {_DATE_KEY: value.isoformat()}
    if isinstance(value, enum.Enum):
        return {
            _ENUM_KEY: {"class": type(value).__name__, "name": value.name}
        }
    if isinstance(value, (bytes, bytearray)):
        # Bytes are not expected in resource attributes; encode as string so
        # the snapshot succeeds and surface a debug log so we notice if a new
        # path produces them.
        logger.debug(
            "encode_attributes: coercing %s to string; bytes-typed attributes "
            "are not supported by the SQLite store.",
            type(value).__name__,
        )
        try:
            return bytes(value).decode("utf-8")
        except UnicodeDecodeError:
            return bytes(value).hex()
    # Fallback: stringify. Logged so this is visible in CI if a new attribute
    # type starts flowing through.
    logger.debug(
        "encode_attributes: unsupported type %s; coercing via str()",
        type(value).__name__,
    )
    return str(value)


def _decode_value(value: Any) -> Any:
    if isinstance(value, dict):
        if _DATETIME_KEY in value and len(value) == 1:
            return _dt.datetime.fromisoformat(value[_DATETIME_KEY])
        if _DATE_KEY in value and len(value) == 1:
            return _dt.date.fromisoformat(value[_DATE_KEY])
        if _LOD_KEY in value and len(value) == 1:
            try:
                from enrichers.generation_rule_types import LevelOfDetail
                return LevelOfDetail[value[_LOD_KEY]]
            except Exception:
                return value
        # Refs / enums are passed through as-is - callers resolve.
        return {k: _decode_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_decode_value(v) for v in value]
    return value


# ---------------------------------------------------------------------------
# Writer
# ---------------------------------------------------------------------------

class SqliteResourceWriter:
    """Dual writer that persists resources to SQLite alongside the in-memory
    registry.

    Construction is cheap (no DB I/O); the SQLite file is built only on
    :meth:`finalize`. Until then the writer behaves like the in-memory one,
    which lets the rest of the pipeline (parse_resource_data, generation
    rules, renderers) run unchanged.
    """

    def __init__(
        self,
        context: "Context",
        db_path: str = "resources.sqlite",
    ):
        self._context = context
        self._memory = InMemoryRegistryWriter(context)
        self._db_path = db_path

    @property
    def registry(self) -> "Registry":
        return self._memory.registry

    @property
    def db_output_path(self) -> str:
        """Path the SQLite file will be written to via the outputter on finalize."""
        return self._db_path

    def add_resource(
        self,
        platform: str,
        resource_type: str,
        name: str,
        qualified_name: str,
        attributes: dict[str, Any],
    ) -> "Resource":
        # Forward to the in-memory writer; SQLite snapshot happens in finalize.
        return self._memory.add_resource(
            platform, resource_type, name, qualified_name, attributes
        )

    def finalize(self) -> None:
        # 1) Run in-memory finalize first so deferred Azure RG resolution
        #    settles and the registry holds final qualified names / refs.
        self._memory.finalize()

        # 2) Snapshot the full registry to SQLite on a local temp file
        #    (sqlite3 needs a real fd) and then publish via the outputter so
        #    the DB lands wherever non-SQL artefacts go (filesystem dir or
        #    tar archive).
        registry = self._memory.registry
        with tempfile.NamedTemporaryFile(
            suffix=".sqlite", delete=False
        ) as tmp:
            tmp_path = tmp.name
        try:
            conn = sqlite3.connect(tmp_path)
            try:
                conn.execute("PRAGMA foreign_keys = ON")
                _init_schema(conn)
                _snapshot_registry(conn, registry)
                conn.commit()
            finally:
                conn.close()
            with open(tmp_path, "rb") as fh:
                payload = fh.read()
            self._context.outputter.write_file(self._db_path, payload)
            logger.info(
                "SqliteResourceWriter wrote %d byte resource DB to %s",
                len(payload),
                self._db_path,
            )
            from .resource_writer import _RESOURCE_STORE_FINALIZED_PROPERTY

            self._context.set_property(_RESOURCE_STORE_FINALIZED_PROPERTY, True)
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# Schema / snapshot helpers (also used by tests)
# ---------------------------------------------------------------------------

def _init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(_SCHEMA_SQL)
    conn.execute(
        "INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)",
        ("schema_version", str(SCHEMA_VERSION)),
    )


def _snapshot_registry(conn: sqlite3.Connection, registry: "Registry") -> None:
    """Replace the contents of the SQLite DB with a fresh snapshot of ``registry``."""
    now = _dt.datetime.now(_dt.timezone.utc).isoformat()

    conn.execute("DELETE FROM resources")
    conn.execute("DELETE FROM resource_types")
    conn.execute("DELETE FROM platforms")

    for platform_name, platform in (registry.platforms or {}).items():
        conn.execute(
            "INSERT INTO platforms (name) VALUES (?)", (platform_name,)
        )
        for type_name, resource_type in (platform.resource_types or {}).items():
            custom_attrs = sorted(resource_type.custom_attributes or [])
            conn.execute(
                "INSERT INTO resource_types (platform, name, custom_attributes) "
                "VALUES (?, ?, ?)",
                (platform_name, type_name, json.dumps(custom_attrs)),
            )
            for qualified_name, resource in (resource_type.instances or {}).items():
                attrs = _collect_resource_attributes(resource, resource_type)
                conn.execute(
                    "INSERT INTO resources "
                    "(platform, resource_type, qualified_name, name, "
                    " attributes_json, created_at, updated_at) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (
                        platform_name,
                        type_name,
                        qualified_name,
                        getattr(resource, "name", ""),
                        encode_attributes(attrs),
                        now,
                        now,
                    ),
                )


def _collect_resource_attributes(
    resource: "Resource", resource_type
) -> dict[str, Any]:
    """Return the dict of resource attributes to persist.

    Walks ``vars(resource)`` rather than ``resource_type.custom_attributes``
    so attributes set via ``setattr`` (e.g. ``resource_group`` populated by
    :func:`indexers.azure_common.resolve_deferred_azure_relationships`) are
    captured even if they were never added to the type's
    ``custom_attributes`` set. The structural fields ``name`` /
    ``qualified_name`` / ``resource_type`` are stored as columns and so are
    excluded here.
    """
    structural = {"name", "qualified_name", "resource_type"}
    return {
        attr_name: value
        for attr_name, value in vars(resource).items()
        if attr_name not in structural
    }


# ---------------------------------------------------------------------------
# Read API
#
# Thin convenience helpers for consumers that want to read out of the
# SQLite store today (smoke tests, debug scripts, an eventual REST service).
# Intentionally minimal - this is not the future query layer.
# ---------------------------------------------------------------------------

def open_database(path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def list_platforms(conn: sqlite3.Connection) -> list[str]:
    return [
        row[0]
        for row in conn.execute("SELECT name FROM platforms ORDER BY name")
    ]


def list_resource_types(
    conn: sqlite3.Connection, platform: Optional[str] = None
) -> list[dict[str, Any]]:
    sql = (
        "SELECT platform, name, custom_attributes FROM resource_types"
        + (" WHERE platform = ?" if platform else "")
        + " ORDER BY platform, name"
    )
    params: tuple[Any, ...] = (platform,) if platform else ()
    return [
        {
            "platform": row[0],
            "name": row[1],
            "custom_attributes": json.loads(row[2]) if row[2] else [],
        }
        for row in conn.execute(sql, params)
    ]


def list_resources(
    conn: sqlite3.Connection,
    platform: Optional[str] = None,
    resource_type: Optional[str] = None,
) -> list[dict[str, Any]]:
    where: list[str] = []
    params: list[Any] = []
    if platform:
        where.append("platform = ?")
        params.append(platform)
    if resource_type:
        where.append("resource_type = ?")
        params.append(resource_type)
    sql = (
        "SELECT platform, resource_type, qualified_name, name, "
        "attributes_json, created_at, updated_at FROM resources"
    )
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY platform, resource_type, qualified_name"

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


def get_resource(
    conn: sqlite3.Connection,
    platform: str,
    resource_type: str,
    qualified_name: str,
) -> Optional[dict[str, Any]]:
    row = conn.execute(
        "SELECT name, attributes_json, created_at, updated_at FROM resources "
        "WHERE platform = ? AND resource_type = ? AND qualified_name = ?",
        (platform, resource_type, qualified_name),
    ).fetchone()
    if not row:
        return None
    return {
        "platform": platform,
        "resource_type": resource_type,
        "qualified_name": qualified_name,
        "name": row[0],
        "attributes": decode_attributes(row[1]),
        "created_at": row[2],
        "updated_at": row[3],
    }


def get_schema_version(conn: sqlite3.Connection) -> Optional[int]:
    row = conn.execute(
        "SELECT value FROM schema_meta WHERE key = 'schema_version'"
    ).fetchone()
    if not row:
        return None
    try:
        return int(row[0])
    except (TypeError, ValueError):
        return None


__all__ = [
    "SCHEMA_VERSION",
    "SqliteResourceWriter",
    "encode_attributes",
    "decode_attributes",
    "open_database",
    "list_platforms",
    "list_resource_types",
    "list_resources",
    "get_resource",
    "get_schema_version",
]

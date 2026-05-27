"""
ResourceWriter - the indexer/registry seam.

Today, indexers call ``Registry.add_resource(...)`` directly, which mutates the
in-memory ``Registry`` carried on the workspace builder ``Context``. That works
for the existing single-request, in-memory pipeline, but it tightly couples
every indexer to the in-memory registry implementation.

The future direction for runwhen-local is a small local resource DB queried by
a fast read-only REST API (extending the workspace-builder FastAPI service). To make that swap a
plug-in instead of a rewrite, all *new* indexers funnel writes through the
``ResourceWriter`` protocol declared here. The legacy ``cloudquery`` indexer is
still wired directly to the registry (intentional - we don't want to perturb
the existing path during the Azure SDK migration); it will migrate in a
follow-up once the AWS / GCP indexers are also native.

Shape of the contract
---------------------

``add_resource(platform, resource_type, name, qualified_name, attributes)`` is
the canonical write. ``attributes`` is the dict produced by the platform
handler's ``parse_resource_data`` (e.g. ``AzurePlatformHandler``) plus the
indexer-supplied keys ``resource``, ``auth_type``, ``auth_secret``. This is
exactly what ``cloudquery.py`` passes to ``registry.add_resource(...)`` today,
so the contract is fixed by current behaviour.

``finalize()`` runs once after all resources have been written. For the
in-memory implementation, that's where deferred RG resolution happens. Future
DB-backed implementations would commit their transaction here.

Implementations
---------------

* :class:`InMemoryRegistryWriter` - the default writer; delegates to
  ``Registry.add_resource`` and runs ``resolve_deferred_azure_relationships``
  on ``finalize()``.

* :class:`indexers.sqlite_resource_writer.SqliteResourceWriter` - dual writer
  that composes the in-memory writer **and** snapshots the registry into a
  local SQLite database on ``finalize()``. Selected via the
  ``resourceStoreBackend`` setting. The DB lands in the workspace output via
  the active ``Outputter`` so it works for both filesystem and tar runs.

* ``RestApiResourceWriter`` - **future**. POST resources to a fast REST
  service so we can decouple workspace builder from the storage layer
  entirely. Same protocol, different transport.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, Optional, Protocol, runtime_checkable

from component import Setting

if TYPE_CHECKING:
    from component import Context
    from enrichers.generation_rule_types import PlatformHandler
    from resources import Registry, Resource

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Settings
#
# Declared at module scope so individual indexer SETTINGS tuples can reference
# them (the workspace builder picks up settings via component.SETTINGS, so a
# setting must be reachable from at least one active component to appear in
# the schema).
# ---------------------------------------------------------------------------

RESOURCE_STORE_BACKEND_MEMORY = "memory"
RESOURCE_STORE_BACKEND_SQLITE = "sqlite"

RESOURCE_STORE_BACKEND_SETTING = Setting(
    "RESOURCE_STORE_BACKEND",
    "resourceStoreBackend",
    Setting.Type.STRING,
    "Selects the backend used by ResourceWriter for indexers that go through "
    "the writer seam. 'memory' (default) keeps the in-memory Registry only; "
    "'sqlite' additionally snapshots the discovered resource graph into a "
    "local SQLite database (path configurable via 'resourceStorePath') so "
    "the future read-only REST service has something to query.",
    RESOURCE_STORE_BACKEND_MEMORY,
)

RESOURCE_STORE_PATH_SETTING = Setting(
    "RESOURCE_STORE_PATH",
    "resourceStorePath",
    Setting.Type.STRING,
    "Output path (relative to the workspace output directory) for the "
    "SQLite resource store. Only used when 'resourceStoreBackend' is "
    "'sqlite'.",
    "resources.sqlite",
)


@runtime_checkable
class ResourceWriter(Protocol):
    """Protocol implemented by every indexer storage backend.

    Indexers should NOT depend on the concrete writer; they receive an
    instance via ``get_resource_writer(context)`` (see below) and call
    ``add_resource`` / ``finalize``.
    """

    def add_resource(
        self,
        platform: str,
        resource_type: str,
        name: str,
        qualified_name: str,
        attributes: dict[str, Any],
    ) -> "Resource":
        ...

    def finalize(self) -> None:
        ...


class InMemoryRegistryWriter:
    """Default writer - delegates to the in-memory ``Registry`` on the context.

    This is the only writer wired into the workspace builder today.

    On ``finalize()``, runs the Azure deferred-RG resolution pass so that
    child resources discovered before their resource group still end up
    correctly linked. The pass is a no-op if no Azure resources are present.
    """

    def __init__(self, context: "Context"):
        from resources import REGISTRY_PROPERTY_NAME  # local import to avoid cycles

        self._context = context
        self._registry: "Registry" = context.get_property(REGISTRY_PROPERTY_NAME)
        if self._registry is None:
            raise RuntimeError(
                "InMemoryRegistryWriter requires a Registry on the Context "
                f"under property '{REGISTRY_PROPERTY_NAME}'"
            )

    @property
    def registry(self) -> "Registry":
        return self._registry

    def add_resource(
        self,
        platform: str,
        resource_type: str,
        name: str,
        qualified_name: str,
        attributes: dict[str, Any],
    ) -> "Resource":
        return self._registry.add_resource(
            platform, resource_type, name, qualified_name, attributes
        )

    def finalize(self) -> None:
        from enrichers.generation_rule_types import PLATFORM_HANDLERS_PROPERTY_NAME
        from .azure_common import resolve_deferred_azure_relationships

        platform_handlers: Optional[dict[str, "PlatformHandler"]] = (
            self._context.get_property(PLATFORM_HANDLERS_PROPERTY_NAME)
        )
        if platform_handlers is None:
            logger.debug(
                "InMemoryRegistryWriter.finalize: no platform handlers on context; "
                "skipping deferred Azure RG resolution"
            )
            return
        resolve_deferred_azure_relationships(self._registry, platform_handlers)


def get_resource_writer(context: "Context") -> ResourceWriter:
    """Return the active ``ResourceWriter`` for the given workspace-builder context.

    Centralised so indexers don't pick the implementation themselves. The
    backend is selected via the ``resourceStoreBackend`` setting:

    * ``memory`` (default): :class:`InMemoryRegistryWriter`.
    * ``sqlite``:           :class:`indexers.sqlite_resource_writer.SqliteResourceWriter`,
      which composes the in-memory writer (so reads via the ``Registry``
      keep working) and additionally snapshots the registry into a local
      SQLite database on ``finalize()``.

    Unknown values fall back to the in-memory writer with a warning so a
    typo in ``workspaceInfo.yaml`` doesn't silently break indexing.
    """
    backend = (context.get_setting(RESOURCE_STORE_BACKEND_SETTING) or "").strip().lower()

    if backend == RESOURCE_STORE_BACKEND_SQLITE:
        # Local import to avoid pulling sqlite3 / tempfile / json at module
        # import time when only the in-memory writer is needed.
        from .sqlite_resource_writer import SqliteResourceWriter

        db_path = context.get_setting(RESOURCE_STORE_PATH_SETTING) or "resources.sqlite"
        logger.info(
            "ResourceWriter: using SQLite backend (path=%s)", db_path
        )
        return SqliteResourceWriter(context, db_path=db_path)

    if backend and backend != RESOURCE_STORE_BACKEND_MEMORY:
        logger.warning(
            "Unknown resourceStoreBackend %r; falling back to in-memory writer. "
            "Valid values are %r and %r.",
            backend,
            RESOURCE_STORE_BACKEND_MEMORY,
            RESOURCE_STORE_BACKEND_SQLITE,
        )

    return InMemoryRegistryWriter(context)


_RESOURCE_STORE_FINALIZED_PROPERTY = "RESOURCE_STORE_FINALIZED"


def finalize_resource_store(context: "Context") -> None:
    """Persist resources and rendered workspace artifacts when backend is sqlite."""
    from .sqlite_resource_writer import persist_sqlite_store

    backend = (context.get_setting(RESOURCE_STORE_BACKEND_SETTING) or "").strip().lower()
    if backend != RESOURCE_STORE_BACKEND_SQLITE:
        return
    if context.get_property(_RESOURCE_STORE_FINALIZED_PROPERTY):
        return
    persist_sqlite_store(context)

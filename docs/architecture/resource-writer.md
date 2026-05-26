# ResourceWriter — the indexer / registry seam

## Why this exists

Until now, every indexer in `runwhen-local` mutates the in-memory `Registry` directly via `Registry.add_resource(...)`. That works for the current single-request pipeline (FastAPI REST shell → indexers → enrichers → tar response), but it tightly couples each indexer to one specific storage backend.

The forward-looking design for `runwhen-local` is:

1. A small **local resource DB** (e.g. SQLite) that persists discovered resources between runs.
2. A **fast, read-only REST API** sitting on top of that DB, extending the workspace-builder service as the public surface.
3. Indexers continue to discover; the registry / DB and the REST layer are independent concerns.

To make that swap a plug-in instead of a rewrite, every *new* indexer funnels writes through the [`ResourceWriter`](../../src/indexers/resource_writer.py) protocol. The seam is small (two methods) and the contract is fixed by the existing `parse_resource_data` output shape, so when the DB / REST substrate lands, only the writer implementation changes.

## Contract

```python
class ResourceWriter(Protocol):
    def add_resource(
        self,
        platform: str,
        resource_type: str,
        name: str,
        qualified_name: str,
        attributes: dict[str, Any],
    ) -> "Resource": ...

    def finalize(self) -> None: ...
```

* `add_resource(...)` is the canonical write. The shape of `attributes` is whatever the platform handler's `parse_resource_data(...)` produces, plus the indexer-supplied `resource` (the raw cloud payload), `auth_type`, and `auth_secret` keys. This matches what the legacy CloudQuery indexer passes to `registry.add_resource(...)` today, so the contract is fixed by current behavior.

* `finalize()` runs once after all resources have been written. The in-memory implementation runs Azure deferred-RG resolution (so child resources written before their RG still get linked correctly). DB-backed implementations would commit their transaction here.

## Implementations

### `InMemoryRegistryWriter` (default)

Wraps the `Registry` carried on `Context` under the `registry` property. Delegates to `Registry.add_resource(...)` and runs `resolve_deferred_azure_relationships(...)` on `finalize()`. This is the default writer.

The legacy `cloudquery` indexer still writes to the registry directly (intentional — we don't want to perturb the existing path during the Azure SDK migration). It will migrate in a follow-up once AWS / GCP indexers are also native, at which point all indexers go through `ResourceWriter`.

### `SqliteResourceWriter` (opt-in)

A *dual* writer: it composes `InMemoryRegistryWriter` and forwards every `add_resource` / `finalize` call to it (so enrichers / renderers keep reading from the in-memory `Registry` unchanged), and on `finalize()` it snapshots the **full** registry into a local SQLite database. The DB lands wherever non-SQL artefacts go (filesystem dir or tar archive) via the active `Outputter`.

Selected by setting `resourceStoreBackend: sqlite` (see [Selecting a writer](#selecting-a-writer)). Lives in [`src/indexers/sqlite_resource_writer.py`](../../src/indexers/sqlite_resource_writer.py).

#### Schema

Three tables form a normalised resource graph:

```sql
CREATE TABLE platforms (
    name TEXT PRIMARY KEY
);

CREATE TABLE resource_types (
    platform           TEXT NOT NULL,
    name               TEXT NOT NULL,
    custom_attributes  TEXT NOT NULL,  -- JSON list
    PRIMARY KEY (platform, name),
    FOREIGN KEY (platform) REFERENCES platforms(name) ON DELETE CASCADE
);

CREATE TABLE resources (
    platform         TEXT NOT NULL,
    resource_type    TEXT NOT NULL,
    qualified_name   TEXT NOT NULL,
    name             TEXT NOT NULL,
    attributes_json  TEXT NOT NULL,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL,
    PRIMARY KEY (platform, resource_type, qualified_name),
    FOREIGN KEY (platform, resource_type)
        REFERENCES resource_types(platform, name) ON DELETE CASCADE
);

CREATE INDEX idx_resources_name ON resources (platform, resource_type, name);
```

A small `schema_meta` table carries the schema version (currently `1`) so future migrations can detect old DBs.

#### Encoding

`attributes_json` holds a deterministic JSON encoding (`sort_keys=True`) of every non-structural attribute on the `Resource` object. Rich Python types are preserved with reserved markers so a future REST service can decode them faithfully:

| Python type                      | JSON shape                                                     |
| -------------------------------- | -------------------------------------------------------------- |
| Primitives, dicts, lists         | as-is                                                          |
| `set` / `frozenset` / `tuple`    | list                                                           |
| `datetime.datetime`              | `{"$datetime": "<ISO 8601>"}`                                  |
| `datetime.date`                  | `{"$date": "<ISO 8601>"}`                                      |
| `LevelOfDetail`                  | `{"$lod": "BASIC" \| "DETAILED" \| "NONE"}`                    |
| `enum.Enum` (other)              | `{"$enum": {"class": "<ClassName>", "name": "<MEMBER>"}}`      |
| `Resource` (cross-resource link) | `{"$ref": {"platform": ..., "resource_type": ..., "qualified_name": ..., "name": ...}}` |
| Anything else                    | `str(value)` (with a debug log; we shouldn't hit this)         |

Cross-resource references (e.g. an Azure storage account's `resource_group`) are serialised as `$ref` markers rather than embedded objects, so each resource appears exactly once in the DB. The decoder leaves `$ref` entries as plain dicts; resolution is the caller's choice.

#### Snapshot semantics

`SqliteResourceWriter.finalize()`:

1. Calls the in-memory writer's `finalize()` first, so `resolve_deferred_azure_relationships(...)` settles all `_deferred_rg_lookup` markers and re-keys child resources by their final `<rg>/<name>` qualified names.
2. Walks the **full** in-memory `Registry` (not just resources written through this writer) and snapshots it to SQLite in a single transaction. Today only the `azureapi` indexer goes through `ResourceWriter`, but `kubeapi` / `cloudquery` mutate the same `Registry`, so their resources land in the snapshot too.
3. Replaces existing rows on each finalize so the DB is always a fresh, idempotent snapshot.

This means the SQLite store reflects the post-indexing, post-deferred-resolution state — i.e. exactly what `dump_resources.py` writes to `resource-dump.yaml`, but normalised into queryable rows.

### Future: `RestApiResourceWriter`

POST resources to a separate fast REST service if we want to fully decouple workspace-builder from the storage layer (e.g. multiple indexer workers, central resource graph). Same protocol, different transport.

## Selecting a writer

Indexers obtain their writer via:

```python
from indexers.resource_writer import get_resource_writer
writer = get_resource_writer(context)
```

`get_resource_writer(context)` is the single place that decides which implementation to construct. The selection is driven by two settings, exposed on the `azureapi` component:

| Setting (JSON name) | Type   | Default            | Description                                                                                                  |
| ------------------- | ------ | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `resourceStoreBackend` | string (`memory` \| `sqlite`) | `memory`            | Selects the writer implementation. `memory` keeps the in-memory `Registry` only; `sqlite` additionally snapshots the registry to a local SQLite DB on `finalize()`. |
| `resourceStorePath`    | string                        | `resources.sqlite`  | Output path (relative to the workspace output directory) for the SQLite file. Only used when the backend is `sqlite`.                                              |

Unknown values fall back to `memory` with a warning so a typo in `workspaceInfo.yaml` doesn't silently break indexing.

Example `workspaceInfo.yaml` snippet:

```yaml
resourceStoreBackend: sqlite
resourceStorePath: db/resources.sqlite
```

The resulting SQLite file lands next to `resource-dump.yaml` in the workspace output. You can poke at it with the standard `sqlite3` CLI or via the `list_platforms` / `list_resource_types` / `list_resources` / `get_resource` helpers in `indexers.sqlite_resource_writer`.

## Migration roadmap

1. **Done:** `InMemoryRegistryWriter` is the default. `azureapi` indexer writes through it. Legacy `cloudquery` still writes directly.
2. **Done:** `SqliteResourceWriter` ships as an opt-in dual writer (`resourceStoreBackend: sqlite`). It composes the in-memory writer and snapshots the registry to SQLite on `finalize()`.
3. **Next:** AWS / GCP native indexers (`awsapi`, `gcpapi`) — also write through `ResourceWriter`.
4. **Then:** Delete the CloudQuery code path entirely; every indexer goes through `ResourceWriter`. At that point, `SqliteResourceWriter`'s snapshot is the **complete** resource graph for every active backend.
5. **Then:** Make `SqliteResourceWriter` the default and treat the DB as the source of truth; the `Registry` becomes a hydrated cache in front of the DB.
6. **Then:** Extend the FastAPI REST service in front of the DB for read-only resource queries. The `/run/` endpoint continues to call `run_components(...)` via the SDK.

Throughout, the `Resource` shape that `parse_resource_data` produces — and that generation rules consume — does not change.

## See also

* [`src/indexers/resource_writer.py`](../../src/indexers/resource_writer.py) — protocol + in-memory implementation + selector.
* [`src/indexers/sqlite_resource_writer.py`](../../src/indexers/sqlite_resource_writer.py) — SQLite implementation, encoder, schema, and read helpers.
* [`src/indexers/azureapi.py`](../../src/indexers/azureapi.py) — the first indexer to write via this seam.
* [`src/resources.py`](../../src/resources.py) — the `Resource` / `Registry` shape every backend must speak.

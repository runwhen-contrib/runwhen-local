# GCP indexer internals

Engineering-level reference for the native GCP SDK indexer (`gcpapi`). For the
user-facing list of supported types and data shapes, see
[indexed-resources/gcp.md](../authoring/indexed-resources/gcp.md).

## Why a second indexer?

Historically RunWhen Local discovered GCP resources via the CloudQuery GCP
plugin (`indexers/cloudquery.py`). That works, but it pulls a heavy Go binary,
writes to an intermediate SQLite, and shells out to `gcloud`. The native
indexer (`indexers/gcpapi.py`) was added so RunWhen Local can:

* Discover only what `workspaceInfo.yaml` actually asks for (per-project scope
  + generation-rule-driven type selection).
* Use first-party Cloud Asset Inventory + `google-cloud-*` SDKs and skip the
  CloudQuery intermediate.
* Add new resource types incrementally without bumping a separate CloudQuery
  plugin version.

The end goal is to remove CloudQuery entirely once Azure, GCP, and AWS all have
native indexers at parity. Both indexers live in-tree and share the same
downstream pipeline; the toggle is `gcpIndexerBackend: cloudquery|gcpapi` in
`workspaceInfo.yaml` (or `WB_GCP_INDEXER_BACKEND`).

## Typed collectors are the baseline; CAI is an optional accelerator

The native GCP indexer's supported **functional baseline** is the per-service
typed `google-cloud-*` SDK collectors (plus the synthesized `project` anchor).
Any type with a typed collector is discovered using only its per-service viewer
role, whether or not Cloud Asset Inventory is available.

**Cloud Asset Inventory** (CAI) is an **optional accelerator** layered on top.
The key difference from Azure: Azure's generic `resources.list()` returns only a
sparse envelope (no `properties`), so Azure needs many hand-written typed
collectors for rich payloads. GCP's CAI
`list_assets(..., content_type=RESOURCE)` returns the *full* API representation
of each asset under `resource.data`, so a single CAI call per project broadens
coverage to the long tail of registry types that have a CAI asset type but no
typed collector. CAI is **not a hard dependency**: if it is not enabled or not
permitted, the typed baseline still discovers normally and the CAI-only types
are simply skipped.

The join key is the **CAI asset type** (`<service>.googleapis.com/<Entity>`,
e.g. `compute.googleapis.com/Instance`) — the GCP analogue of Azure's ARM type.

## Pieces

```
src/indexers/
├── gcpapi.py                         # the orchestration loop
├── gcpapi_resource_types.py          # CAI generic collector + typed SDK collectors + specs
├── gcpapi_normalizers.py             # CAI asset / SDK model -> CQ-shaped dict
├── gcp_common.py                     # credential + project resolution, label filters
├── gcp_resource_type_registry.py     # registry loader (data class)
├── gcp_resource_type_registry.yaml   # GENERATED catalog of all CQ tables
└── test_gcp*.py                      # unit tests

scripts/gcp/
├── sync_gcp_resource_type_registry.py    # registry generator
├── gcp_resource_type_overrides.yaml      # hand-edited overrides
└── gcp_cloudquery_tables.txt             # parity source (CloudQuery hub table list)
```

### `gcpapi.py` - the orchestration loop

`index(ctx)` runs in phases:

1. **Bootstrap**: resolves credentials + project list via
   `gcp_common.gcp_get_credentials_and_projects` (service-account key, K8s
   secret, or Application Default Credentials), mirrors them into
   `enrichers.gcp`, and resolves which projects are in scope. A project whose
   effective LOD (`projectLevelOfDetails[<id>]` -> workspace default) is `NONE`
   is skipped entirely — no anchor, no typed pass, no CAI pass. GCP LOD is
   **per-project**; there is no Azure-style resource-group dimension.
2. **Phase 0 - Project anchors**: the `project` resource is synthesized from
   config (no API call needed) and written *first* for every in-scope project,
   so child resources can link to their parent project at parse time (the
   handler does an immediate registry lookup).
3. **Phase 1 - Typed pass**: for each accessed type that has a hand-written
   `google-cloud-*` collector (the 12 typed tables — compute instances, disks,
   snapshots, networks, subnetworks, firewalls, addresses; storage buckets; GKE
   clusters; Pub/Sub topics and subscriptions; IAM service accounts), call
   `spec.collector(credentials, project_id)` per in-scope project. Rich SDK
   payloads land in the resource store, and these types are excluded from the
   Phase 2 CAI filter so they survive even when CAI is denied.
4. **Phase 2 - CAI generic pass**: one `list_assets` call per in-scope project,
   scoped to the CAI asset types of accessed *generic* types (typed types are
   excluded so nothing is written twice). Each returned asset is routed by
   `asset_type` through `find_spec_by_cai_type` back to the registry-mapped
   `resource_type_name`.

Every resource flows through: normalize -> label/tag filter -> handler
`parse_resource_data` -> `writer.add_resource`. The indexer is
generation-rule-driven: only types referenced by loaded gen rules are
collected, plus the mandatory `gcp_projects` anchor.

### The registry (`gcp_resource_type_registry.yaml`)

Generated by `scripts/gcp/sync_gcp_resource_type_registry.py` from three inputs:

1. The CloudQuery GCP table list (`scripts/gcp/gcp_cloudquery_tables.txt`,
   currently the v22.1.0 hub snapshot, 404 tables) — the parity source.
2. A heuristic mapping `gcp_<service>_<entity>` ->
   `<host>.googleapis.com/<EntitySingularPascal>` (singularises + PascalCases
   the entity; remaps service tokens to API hosts, e.g. `sql` -> `sqladmin`).
3. Hand-curated overrides in `scripts/gcp/gcp_resource_type_overrides.yaml`
   (service-host remaps, pinned CAI types for high-value/irregular tables,
   aliases, typed-collector flags, the mandatory `gcp_projects` anchor, and
   `null` CAI types for tables with no CAI equivalent — IAM bindings, billing
   rollups — so the generic pass skips them).

Never hand-edit the YAML; edit the overrides and re-run the sync script.

### Coverage parity vs. CloudQuery

Every one of the 404 CloudQuery tables resolves via `find_spec` (by canonical
table name or alias). Tables with a CAI asset type are discoverable via the CAI
pass the moment a generation rule references them; the 12 typed tables get
richer SDK payloads **and** survive without CAI. Of the 403 tables with a CAI
asset type, 390 are served solely by the CAI pass (down from 399 before the
typed fallback tier was expanded); the remaining high-value types have typed
collectors. The handful of tables with no CAI equivalent map to `null` and
would need a dedicated typed collector if ever referenced — the same
incremental model the Azure indexer uses.

#### What the baseline discovers when CAI is unavailable (normal, non-fatal)

If the optional Phase 2 `list_assets` call is permission-denied (missing
`roles/cloudasset.viewer` / `cloudasset.assets.listResource`, or the API is not
enabled), `index()` logs an **informational** `GCP_CAI_PERMISSION_DENIED` note
(at INFO — no error, no banner, no warning), increments `cai_permission_denied`,
and **continues** — it does not abort the run. The discovery that remains is the
functional baseline: the **12 typed types + the synthesized `gcp_projects`
anchor** (and only the subset the loaded generation rules reference). The 390
CAI-only types are simply skipped. This matches the live run against the sandbox
project, which does not have CAI enabled: the typed `gcp_storage_buckets`,
`gcp_container_clusters`, `gcp_compute_networks`, and `gcp_compute_firewalls`
collectors ran cleanly and populated the store while the optional generic pass
was skipped. The `assert-gcpapi-baseline` CI step treats the note as
**informational** and **passes** on the typed-baseline results — CAI's absence
is expected and never gates CI.

#### Deferred typed collectors

- `gcp_sql_instances`: the Cloud SQL Admin API has no idiomatic
  `google-cloud-*` client; listing instances requires the
  `google-api-python-client` discovery layer, which is a heavy non-idiomatic
  dependency not otherwise used. Deferred — stays CAI-served.
- `gcp_run_services`: the Cloud Run Admin v2 `ListServices` call has no
  aggregated/`-` cross-region wildcard, so a clean single-call fallback would
  require enumerating regions. Deferred — stays CAI-served.

## Authentication

`gcp_get_credentials_and_projects` resolves, in order: a K8s secret
(`saSecretName` -> `serviceAccountKey`), an inline `serviceAccountKey` or a
decoded `applicationCredentialsFile`, or Application Default Credentials. It
returns a `google.auth` credentials object suitable for the CAI and
`google-cloud-*` clients, plus the project list (from `projects`, `projectId`,
or `GOOGLE_CLOUD_PROJECT` / `GCP_PROJECT`).

## Adding a typed collector

1. Ensure the table is in the registry (regenerate if needed) and flag it as a
   `typed_collector` in the overrides YAML.
2. Implement `_collect_<type>(credentials, project_id)` in
   `gcpapi_resource_types.py` (lazy-import the `google-cloud-*` client) and
   register it in `_TYPED_COLLECTORS` keyed by canonical table name.
3. Its CAI asset type is automatically excluded from the generic pass so the
   resource is written once, from the richer SDK payload.

## Tests

* `test_gcp_resource_type_registry.py` — loader contract + spec materialization.
* `test_gcpapi_normalizers.py` — CAI/SDK normalization + handler round-trip.
* `test_gcpapi_selective.py` — per-project selective discovery + CAI filter
  dispatch.

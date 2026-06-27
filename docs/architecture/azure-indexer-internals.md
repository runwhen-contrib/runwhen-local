# Azure indexer internals

Engineering-level reference for the native Azure SDK indexer (`azureapi`).
For the user-facing list of supported types and data shapes, see
[indexed-resources/azure.md](../authoring/indexed-resources/azure.md).

## Why a second indexer?

Historically RunWhen Local discovered Azure resources via the CloudQuery
Azure plugin (`indexers/cloudquery.py`). That works, but it pulls a
heavy Go binary, writes to an intermediate SQLite, and has a fixed scope
(everything-or-nothing per subscription). The native indexer
(`indexers/azureapi.py`) was added so RunWhen Local can:

* Discover only what `workspaceInfo.yaml` actually asks for (selective
  per-RG enumeration), saving Azure throttling budget.
* Use first-party `azure-mgmt-*` SDKs and skip the CloudQuery
  intermediate.
* Add new resource types incrementally without bumping a separate
  CloudQuery plugin version.

Both indexers live in-tree and share the same downstream pipeline; the
toggle is `azureIndexerBackend: cloudquery|azureapi` in
`workspaceInfo.yaml`.

## Pieces

```
src/indexers/
├── azureapi.py                         # the orchestration loop
├── azureapi_resource_types.py          # 25 typed collectors + dispatch dict
├── azureapi_normalizers.py             # SDK model -> CQ-shaped dict
├── azure_common.py                     # credential resolution
├── azure_throttle.py                   # 429 / Retry-After-aware retry helper
├── azure_resource_type_registry.py     # registry loader (data class)
├── azure_resource_type_registry.yaml   # GENERATED catalog of all CQ tables
└── test_azureapi_*.py                  # unit tests

scripts/azure/
├── sync_azure_resource_type_registry.py    # registry generator
└── azure_resource_type_overrides.yaml      # hand-edited overrides
```

### `azureapi.py` - the orchestration loop

`index(ctx)` runs in three phases:

1. **Bootstrap**: resolves credentials via
   `azure_common.az_get_credentials_and_subscription_id` (Service
   Principal or `DefaultAzureCredential`), builds the per-RG LOD map,
   decides per-subscription whether discovery is **selective** (finite
   RG list) or **subscription-wide** (`None`).
2. **Phase 1 - Resource groups**: enumerates RGs subscription-wide via
   the typed `_collect_resource_groups_all` collector. RGs are mandatory
   because every other phase keys off the RG list to compute scope.
3. **Phase 2 - Typed pass**: for every typed spec referenced by a loaded
   generation rule (or otherwise mandatory), calls either
   `spec.collector_in_rg(...)` (selective) or `spec.collector_all(...)`
   (unbounded). Rich SDK payloads land in the resource store.
4. **Phase 3 - Generic pass**: one
   `ResourceManagementClient.resources.list[_by_resource_group]` call
   per subscription / in-scope RG returns every top-level ARM resource
   the credential can see. Each `GenericResource` is routed through the
   registry by ARM type to the spec that owns its `resource_type_name`,
   filtered against:
   * ARM types already owned by the typed pass (skip - typed wins).
   * ARM types not referenced by any loaded generation rule (skip -
     the indexer is gen-rule-driven by design).

Every resource (typed or generic) flows through `_process_models`:

* `normalize_azure_resource(model, subscription_id)` flattens to a
  CloudQuery-shaped dict.
* `_resource_is_in_scope` drops out-of-scope rows (effective LOD =
  NONE) before they reach the writer.
* On the generic pass only, the dispatcher consults a `typed_arm_ids`
  set so a typed-emitted resource never gets overwritten by a sparser
  generic copy.
* The ResourceWriter writes the normalized dict + parsed metadata.

### `azureapi_resource_types.py` - typed + generic collectors

This module owns three things:

1. **Typed collectors** - one pair per rich-payload type:

   ```python
   def _collect_<type>_all(credential, subscription_id):
       client = SomeMgmtClient(credential, subscription_id)
       return client.<group>.list()           # subscription-wide

   def _collect_<type>_in_rg(credential, subscription_id, rg_name):
       client = SomeMgmtClient(credential, subscription_id)
       return client.<group>.list_by_resource_group(resource_group_name=rg_name)
   ```

   The pair is registered in `_TYPED_COLLECTORS` keyed by the canonical
   CQ table name. The result is a typed `AzureResourceTypeSpec`
   (`spec.typed = True`).

2. **Generic catch-all collectors** -
   `_collect_generic_resources_all` and `_in_rg`. These wrap
   `ResourceManagementClient.resources.list[_by_resource_group]` and
   are reused by the synthetic generic spec the registry materializes
   for every untyped entry (`spec.typed = False`). The indexer's
   Phase 3 routes by ARM type rather than calling these per-spec, so
   only one generic call fires per subscription / RG.

3. **Spec materialization** - `_build_specs()` walks the registry and
   produces:
   * Typed specs first (resource groups, then the rest of the
     `_TYPED_COLLECTORS` dictionary).
   * One generic spec per remaining registry entry, so every
     registered type is addressable by `find_spec`.

Lookups: `find_spec(name)` returns the spec for any registry name or
alias (typed or generic). `find_spec_by_arm_type(arm_type)` is what
Phase 3 uses to route each `GenericResource.type` back to the owning
spec.

The same module hosts a small helper, `_rg_from_arm_id`, used by the
two **child-resource collectors** (`azure_postgresql_databases`,
`azure_cosmos_sql_databases`) that have to walk parent → child:

```python
def _collect_postgresql_databases_all(credential, subscription_id):
    client = PostgreSQLManagementClient(credential, subscription_id)
    for server in client.servers.list():
        rg = _rg_from_arm_id(server.id)
        try:
            yield from client.databases.list_by_server(rg, server.name)
        except Exception:
            continue
```

Per-server failures are swallowed so a single misconfigured server
doesn't abort the whole subscription.

### `azure_throttle.py` - throttle-aware retry

`call_with_throttle_retry(func, *, label, ...)` wraps every list call
made by the four dispatch helpers in `azureapi.py`
(`_list_subscription_wide`, `_list_in_rg`,
`_generic_pass_subscription_wide`, `_generic_pass_for_rg`). It is the
*only* layer that owns retry policy; collectors stay declarative.

Behavior:

* Throttle classification (`is_throttle_error`) matches both HTTP status
  (`408`, `429`, `500`, `502`, `503`, `504`) and ARM throttle codes in
  the message body (`ResourceCollectionRequestsThrottled`,
  `SubscriptionRequestsThrottled`, `ResourceRequestsThrottled`,
  `TooManyRequests`, `ServerBusy`, `ServerTimeout`, `RequestThrottled`).
* Wait time prefers an explicit hint (`Retry-After` header or the
  `Please try after 'N' seconds` sentence in the ARM message) and
  falls back to exponential backoff with full jitter, capped at
  `max_backoff` per sleep.
* Two-axis budget: `max_attempts` (default 6) and `max_total_wait`
  (default 180s) bound how long a single list call can stall the
  indexer. Either ceiling causes the helper to re-raise the last
  throttle, which the dispatcher then converts to a per-type warning
  via the existing `skipped_collector_error` path and increments the
  new `skipped_throttled` stat for the run summary.
* Non-throttle exceptions propagate immediately, preserving the
  pre-existing semantics for `ResourceGroupNotFound` and other terminal
  errors that the dispatchers special-case.
* Each retry is logged at INFO (`Azure throttled <label> (attempt N/M);
  sleeping <wait>s before retry: ...`). The `<label>` always includes
  the resource type and scope (RG / subscription) so operators can pin
  down which RP is rate-limiting the build.

Operators can tune the policy in `workspaceInfo.yaml` via the
`azureThrottleMaxAttempts`, `azureThrottleInitialBackoff`,
`azureThrottleMaxBackoff`, and `azureThrottleMaxTotalWait` keys (also
exposed as `AZURE_THROTTLE_*` env vars). Stub Contexts in unit tests
that return `None` for these settings fall back to the module defaults.

### `azureapi_normalizers.py` - shape parity with CloudQuery

The downstream pipeline (parsers, generation rules, the resource store)
was originally written against CloudQuery's table-row shape. To avoid
bifurcating that code, the native indexer normalizes every SDK model
into the same shape via `normalize_azure_resource`:

* Top-level keys are snake-cased (`resource_id`, `subscription_id`, ...).
* `properties` / `sku` / `identity` are preserved verbatim.
* `tags` is always a dict (defaulting to `{}` when absent).
* `subscription_id` is always set.

The contract is pinned by `test_azureapi_normalizers.py`, which feeds
SDK-shaped fakes through the normalizer and asserts that
`AzurePlatformHandler.parse_resource_data` returns the same
`(name, qualified_name, attributes)` triple it would have for the
CloudQuery row.

### Registry + overrides

`azure_resource_type_registry.yaml` is a GENERATED catalog of every
CloudQuery Azure plugin table (619 entries today). Each entry has:

```yaml
azure_keyvault_keyvaults:
  arm_type: Microsoft.KeyVault/vaults
  arm_type_source: override        # heuristic | override
  category: keyvault
  aliases: [azure_keyvault_vaults, azure_keyvault_keyvault]
  typed_collector: true            # set if listed in overrides.typed_collectors
  mandatory: false
```

`scripts/azure/azure_resource_type_overrides.yaml` is the hand-edited
input. The sync script (`sync_azure_resource_type_registry.py`) merges:

1. The current list of CQ table names (defaults to round-tripping the
   existing registry; can also fetch from CloudQuery's hub).
2. A heuristic that converts `azure_<service>_<entity>` into
   `Microsoft.<Service>/<entityCamelCase>`.
3. Manual overrides (`arm_type_overrides`, `aliases`,
   `typed_collectors`, `mandatory`).

**Always edit the overrides YAML, then re-run the sync script.** Never
hand-edit `azure_resource_type_registry.yaml`.

## Adding a new typed collector

The mechanical recipe (the same one used to add the 18 collectors in
the Bucket A/B/C/D pass):

1. **Implement the two functions** in `azureapi_resource_types.py`:

   ```python
   def _collect_<type>_all(credential, subscription_id):
       from azure.mgmt.<service> import <Client>
       client = <Client>(credential, subscription_id)
       return client.<group>.list()

   def _collect_<type>_in_rg(credential, subscription_id, rg_name):
       from azure.mgmt.<service> import <Client>
       client = <Client>(credential, subscription_id)
       return client.<group>.list_by_resource_group(resource_group_name=rg_name)
   ```

2. **Register in `_TYPED_COLLECTORS`** keyed by the canonical CQ table
   name. If no per-RG variant exists, pass `None` for the second slot;
   the orchestrator will fall back to `collector_all` and warn.

3. **Edit `scripts/azure/azure_resource_type_overrides.yaml`**:
   * Append the table name to `typed_collectors:`.
   * If the heuristic ARM type is wrong, add an entry to
     `arm_type_overrides:`.

4. **Regenerate the registry**:
   ```bash
   python scripts/azure/sync_azure_resource_type_registry.py
   ```

5. **Update the registry test set** in
   `src/indexers/test_azure_resource_type_registry.py::test_typed_collectors_present`.

6. **Bump dependencies if needed**: if the SDK isn't already a project
   dep, add it to `src/pyproject.toml` and regenerate `src/poetry.lock`
   inside a `python:3.14-slim` container:
   ```bash
   docker run --rm -v "$PWD/src:/app" -w /app python:3.14-slim \
     bash -lc "pip install poetry && poetry lock"
   ```

7. **Run the unit tests**:
   ```bash
   cd src && python -m pytest indexers/test_azureapi_*.py \
                              indexers/test_azure_resource_type_registry.py
   ```

8. **Document the new type** in
   [`docs/authoring/indexed-resources/azure.md`](../authoring/indexed-resources/azure.md).

## Selective vs unbounded discovery (in code)

`_rgs_in_scope_from_config` returns:

* `None` -> unbounded discovery for this subscription. The orchestrator
  uses `collector_all`.
* A list of RG names -> selective. Empty list means "discover nothing
  for this subscription except the RG list itself" (zero SDK calls
  beyond the RG enumeration).

The decision is made once per subscription, at the top of the indexer's
inner loop. Selective mode is triggered iff *every* escape hatch
resolves to `LevelOfDetail.NONE`:

* Workspace-wide `defaultLOD` is `none`.
* Per-subscription `defaultLOD` is `none`.
* No `*` wildcard override under
  `subscriptions[].resourceGroupLevelOfDetails`.

Anything else (a single non-`none` default anywhere) flips to unbounded
mode for safety.

## See also

* [User guide: Azure cloud discovery](../user-guide/cloud-discovery/azure.md)
* [Indexed resources: Azure reference](../authoring/indexed-resources/azure.md)
* [Resource store / ResourceWriter](./resource-writer.md)

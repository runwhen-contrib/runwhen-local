---
name: extend-discovery-type
description: >-
  Add or enrich a resource type in an existing RunWhen Local discovery indexer
  (Azure azureapi, GCP gcpapi, AWS, or Kubernetes). Use when asked to support a
  new cloud resource type, add a typed SDK collector, fix a resource type
  mapping, or extend what an indexer discovers. Enforces the registry sync,
  collector registration, normalizer, tests, docs, and generation-rule contract.
---

# Extend a discovery type

Use this when an **existing** indexer should discover a new resource type or
return richer data for one it already covers. To stand up a brand-new platform,
use the `add-discovery-type` skill instead.

The native SDK indexers (`azureapi`, `gcpapi`, future `awsapi`) all share the
same shape: a **generated registry** maps CloudQuery table names to native
cloud API types, a **generic collector** provides broad parity, and a small set
of **typed collectors** provide rich payloads for high-value types. Read the
canonical worked examples before editing:

- Azure: `docs/architecture/azure-indexer-internals.md`
- GCP: `docs/architecture/gcp-indexer-internals.md`

## Golden rules

1. **Never hand-edit a generated registry YAML** (`src/indexers/*_resource_type_registry.yaml`).
   Edit the overrides file and re-run the sync script.
2. **Maintain CloudQuery parity.** The CloudQuery table name is the public
   `resource_type` contract used in generation rules. New types must resolve by
   their canonical CloudQuery table name (or a registered alias).
3. **Done means done:** code + registry + tests + docs + generation-rule
   verification. A change that doesn't update docs is not complete.

## Workflow

Copy this checklist and track it:

```
- [ ] 1. Identify the target indexer + canonical CloudQuery table name
- [ ] 2. Edit the overrides YAML (type mapping / alias / typed_collector flag)
- [ ] 3. Regenerate the registry via the sync script (never hand-edit the YAML)
- [ ] 4. (typed only) Implement collector + register in _TYPED_COLLECTORS
- [ ] 5. (if needed) Extend the normalizer for the new payload shape
- [ ] 6. Add/extend the SDK dependency (pyproject + locked) if required
- [ ] 7. Update tests (registry + normalizer + selective)
- [ ] 8. Update docs (indexed-resources + indexer internals)
- [ ] 9. Verify the generation-rule contract still holds
- [ ] 10. Run the unit tests
```

### 1. Identify target + table name

Determine which backend (`azureapi` / `gcpapi` / `aws` / Kubernetes) owns the
type and the **canonical CloudQuery table name** (e.g. `gcp_compute_instances`,
`azure_compute_disks`). This name is the registry key and the generation-rule
`resource_type`.

### 2. Edit the overrides YAML

Per platform:

| Platform | Overrides file |
|----------|----------------|
| Azure | `scripts/azure/azure_resource_type_overrides.yaml` |
| GCP | `scripts/gcp/gcp_resource_type_overrides.yaml` |

Edit only what the heuristic gets wrong:

- **Wrong native type**: add an entry under `arm_type_overrides` (Azure) or
  `cai_type_overrides` (GCP). Set it to `null` if the table has no native API
  equivalent (so the generic pass skips it).
- **Alias**: add under `aliases` so older/alternate names still resolve.
- **Typed collector**: append the table name to `typed_collectors`.
- **Service host remap** (GCP): add under `service_api_hosts`.

### 3. Regenerate the registry

```bash
# GCP (round-trips existing table list, picks up override changes):
python scripts/gcp/sync_gcp_resource_type_registry.py

# Azure:
python scripts/azure/sync_azure_resource_type_registry.py
```

The script reports `added / removed / changed`. Inspect the diff in the
generated YAML; it should reflect only your intended change.

### 4. Implement a typed collector (only for rich-payload types)

Skip this for types that are fine coming from the generic pass (Azure
`resources.list()` envelope, GCP Cloud Asset Inventory full payload).

**GCP** (`src/indexers/gcpapi_resource_types.py`):

```python
def _collect_<type>(credentials, project_id):
    from google.cloud import <client_module>  # lazy import
    client = <Client>(credentials=credentials)
    return list(client.list_<entity>(project=project_id))
```

Register it keyed by canonical table name:

```python
_TYPED_COLLECTORS: dict[str, GcpCollector] = {
    "gcp_compute_instances": _collect_compute_instances,
    "gcp_<service>_<entity>": _collect_<type>,
}
```

**Azure** (`src/indexers/azureapi_resource_types.py`): implement both
`_collect_<type>_all(credential, subscription_id)` and
`_collect_<type>_in_rg(credential, subscription_id, rg_name)`, then register in
`_TYPED_COLLECTORS` keyed by canonical table name (pass `None` for the second
slot only if no per-RG SDK call exists).

A typed type is automatically excluded from the generic pass, so the resource is
written exactly once.

### 5. Extend the normalizer if the shape is new

Normalizers (`*_normalizers.py`) convert raw SDK/API objects into the
CloudQuery-shaped dict the platform handler expects. Reuse the existing
`normalize_*` helpers when possible. Only add code for genuinely new fields, and
always map cloud labels/tags into the canonical `tags` field.

### 6. Dependencies

If the typed collector needs an SDK that isn't already a dependency, add it to
`src/pyproject.toml` and regenerate the lock inside the pinned Python container:

```bash
docker run --rm -v "$PWD/src:/app" -w /app python:3.14-slim \
  bash -lc "pip install poetry && poetry lock"
```

Lazy-import SDK clients inside the collector so importing the indexer module
never hard-requires the SDK.

### 7. Tests (required)

- `test_<platform>_resource_type_registry.py`: assert the new type resolves and,
  if typed, appears in the typed-collector set.
- `test_<platform>api_normalizers.py`: a round-trip through the platform handler
  for the new payload shape.
- `test_<platform>api_selective.py`: if dispatch/selection logic changed.

### 8. Docs (required)

- `docs/authoring/indexed-resources/<platform>.md`: list the new matchable type
  and note whether it's typed (rich) or generic.
- The indexer internals doc if collector counts or behavior changed.

### 9. Generation-rule contract (required)

Generation rules reference the type by its CloudQuery table name as
`resource_type`. Confirm:

- The new type resolves via the registry's `find`/`find_spec` by that exact
  table name (and any aliases you added).
- The normalized dict carries the qualifier fields the tag/hierarchy templates
  expect (`resource_name`, scope qualifiers, `tags`). See the
  `template-tags-hierarchy` rule for the tag/hierarchy contract.

If a contrib generation rule should start matching the new type, update or note
it; do not silently change matching behavior for existing rules.

### 10. Run tests

```bash
cd src && python -m unittest discover -s indexers -p 'test_*.py'
```

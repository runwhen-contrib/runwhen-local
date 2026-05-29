---
name: add-discovery-type
description: >-
  Stand up a brand-new RunWhen Local discovery platform / indexer from scratch
  (a new cloud or resource source) following the native SDK pattern used by
  azureapi and gcpapi. Use when asked to add a new platform, new cloud provider,
  or new top-level discovery source. Covers the parity registry, indexer
  modules, platform handler, tag/hierarchy templates, pipeline wiring, tests,
  and docs.
---

# Add a new discovery type

Use this to add a **new platform** (a new cloud provider or discovery source).
To add a single resource type to an existing indexer, use the
`extend-discovery-type` skill instead.

`gcpapi` is the most recent end-to-end example — read
`docs/architecture/gcp-indexer-internals.md` first; it documents every piece you
are about to replicate. `azureapi` is the second reference. The mandate is to
build native SDK indexers so CloudQuery can eventually be removed entirely.

## Architecture (what you are building)

```
scripts/<platform>/
├── <platform>_cloudquery_tables.txt        # parity source (CloudQuery hub table list)
├── <platform>_resource_type_overrides.yaml # hand-curated overrides
└── sync_<platform>_resource_type_registry.py  # registry generator

src/indexers/
├── <platform>_resource_type_registry.yaml  # GENERATED catalog (never hand-edit)
├── <platform>_resource_type_registry.py     # read-only loader
├── <platform>_common.py                      # credentials + scope resolution + tag filters
├── <platform>api_normalizers.py              # raw SDK/API -> CloudQuery-shaped dict
├── <platform>api_resource_types.py           # generic collector + typed collectors + specs
├── <platform>api.py                          # orchestration loop
└── test_<platform>*.py                       # unit tests

src/enrichers/<platform>.py                   # PlatformHandler.parse_resource_data
src/templates/<platform>-tags.yaml            # tag template
src/templates/<platform>-hierarchy.yaml       # hierarchy template
docs/architecture/<platform>-indexer-internals.md
docs/authoring/indexed-resources/<platform>.md
```

## Core principles

1. **Parity first.** Seed the registry from the upstream CloudQuery plugin's
   table list (use the CloudQuery hub, not the old in-container plugin version).
   Every CloudQuery table must resolve via the registry by canonical name/alias.
2. **CloudQuery table name is the public contract.** Generation rules reference
   it as `resource_type`. The native indexer normalizes payloads into the same
   shape so rules don't change when the backend flips.
3. **Generic collector is the workhorse**, typed collectors are enrichment. Pick
   the broadest first-party API for the generic pass (Azure
   `resources.list()`, GCP Cloud Asset Inventory, AWS Cloud Control API).
4. **Selective, generation-rule-driven discovery.** Only collect types
   referenced by loaded generation rules (plus the mandatory anchor), and
   respect Level-of-Detail scoping.
5. **Never hand-edit the generated registry YAML.**

## Workflow

```
- [ ] 1. Obtain upstream CloudQuery table list -> scripts/<p>/<p>_cloudquery_tables.txt
- [ ] 2. Author the overrides YAML (type remaps, aliases, typed flags, anchor, nulls)
- [ ] 3. Write the sync script (heuristic table-name -> native-type mapping)
- [ ] 4. Generate the registry YAML + write the read-only loader
- [ ] 5. Add SDK deps to pyproject + regenerate lock in python:3.14-slim
- [ ] 6. Write <p>_common.py (credentials, scope/LOD, tag filters)
- [ ] 7. Write <p>api_normalizers.py (raw -> CloudQuery-shaped dict)
- [ ] 8. Write <p>api_resource_types.py (generic collector + typed + specs)
- [ ] 9. Write <p>api.py orchestrator (phases: bootstrap -> anchors -> typed -> generic)
- [ ] 10. Add/confirm the enricher PlatformHandler.parse_resource_data
- [ ] 11. Add src/templates/<p>-tags.yaml + <p>-hierarchy.yaml
- [ ] 12. Wire pipeline: component.py, run.sh, run.py setting, cloudquery skip
- [ ] 13. Tests: registry + normalizers + selective
- [ ] 14. Docs: indexer-internals + indexed-resources + READMEs
- [ ] 15. Run the full indexer test suite
```

### 1–4. Registry pipeline

Mirror `scripts/gcp/`:

- **Table list**: scrape the CloudQuery hub plugin table reference into a
  `.txt` with a header noting source + version. This is the parity source.
- **Overrides**: a YAML with native-type remaps, `aliases`, `typed_collectors`,
  the **mandatory anchor** type (e.g. GCP `gcp_projects`, Azure
  `azure_resources_resource_groups`), and `null` native types for tables with
  no API equivalent.
- **Sync script**: heuristic `<plugin>_<service>_<entity_plural>` ->
  `<host>/<EntitySingularPascal>`, plus override application. Copy
  `sync_gcp_resource_type_registry.py` and adapt the heuristic.
- **Loader** (`<platform>_resource_type_registry.py`): copy the GCP loader;
  provide `load_registry`, `find`, and a `find_by_<native>_type` lookup.

### 6–9. Indexer modules

- **`<platform>_common.py`**: resolve credentials (K8s secret, inline key, ADC /
  env) and the account/project/subscription scope; provide `has_included_tags` /
  `has_excluded_tags` label filters.
- **`<platform>api_normalizers.py`**: convert raw SDK/API objects to the
  CloudQuery-shaped dict the handler expects; hoist the full payload, map cloud
  labels/tags to `tags`, normalize names/IDs/regions. Include a
  `make_<anchor>_resource_data` helper for the synthesized anchor.
- **`<platform>api_resource_types.py`**: a `*ResourceTypeSpec` dataclass, the
  generic collector over the broad API, typed collectors (lazy-import SDK
  clients), `_TYPED_COLLECTORS` keyed by canonical table name, and
  `find_spec` / `find_spec_by_<native>_type`.
- **`<platform>api.py`** `index(ctx)` phases:
  1. Bootstrap: check `<platform>IndexerBackend`, resolve creds + scope, mirror
     into the enricher, resolve LOD (skip scopes with LOD `none`).
  2. Phase 0: emit the synthesized **anchor** resource first so children link to
     it at parse time.
  3. Phase 1: typed collectors for accessed types that have one.
  4. Phase 2: one generic pass per scope, filtered to accessed native types not
     already covered by a typed collector.
  Every resource flows: normalize -> tag filter -> `handler.parse_resource_data`
  -> `writer.add_resource`.

### 10–11. Handler + templates

- Confirm/extend `src/enrichers/<platform>.py` `parse_resource_data` consumes
  the normalized dict and links children to the anchor.
- Add `src/templates/<platform>-tags.yaml` and `-hierarchy.yaml` following the
  **`template-tags-hierarchy` rule** exactly (hierarchy ends with
  `resource_name`; emit `platform`, `resource_type`, `resource_name`,
  `child_resource`; specificity-ordered `resource_name`; dedup loop).

### 12. Pipeline wiring

- `src/component.py`: add `"<platform>api"` to the `INDEXER` stage.
- `src/run.sh`: include `<platform>api` in `COMPONENTS`.
- `src/run.py`: coalesce `<platform>IndexerBackend` from `workspaceInfo` or
  `WB_<PLATFORM>_INDEXER_BACKEND` into request data.
- `src/indexers/cloudquery.py`: skip this platform when the native backend is
  selected (mutual exclusion).

### 13–14. Tests + docs (required)

- Tests mirroring `test_gcp*.py`: registry loader contract, normalizer +
  handler round-trip, selective discovery + generic-pass filter dispatch.
- `docs/architecture/<platform>-indexer-internals.md` (link it from
  `docs/architecture/README.md`).
- `docs/authoring/indexed-resources/<platform>.md` documenting both backends,
  the matchable types, and the stable generation-rule contract.
- Update top-level `README.md` / docs indexes if the platform is newly listed.

### 15. Verify

```bash
cd src && python -m unittest discover -s indexers -p 'test_*.py'
python scripts/<platform>/sync_<platform>_resource_type_registry.py --dry-run
```

The sync dry-run must report 0 drift (registry matches overrides + table list).

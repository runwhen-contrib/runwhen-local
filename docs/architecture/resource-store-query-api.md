# Resource store query API

When discovery runs with `resourceStoreBackend: sqlite`, RunWhen Local writes a single SQLite file (default `output/resources.sqlite`) containing:

1. **Discovered resources** — Kubernetes and cloud objects from indexers (`resources` table).
2. **Rendered workspace files** — SLX, SLI, runbook, and workspace YAML from `render_output_items` (`workspace_artifacts` table).

The workspace-builder FastAPI service exposes read-only JSON endpoints under `/explorer/api/*`, and the same data can be queried directly with SQL or the Python helpers in `indexers/sqlite_resource_writer.py`.

## Prerequisites

Add to `workspaceInfo.yaml` (or pass equivalent fields via the `/run/` request):

```yaml
resourceStoreBackend: sqlite
resourceStorePath: resources.sqlite   # optional; relative to output directory
```

Run discovery (`./run.sh` or `task run-rwl-discovery`). The database appears under the workspace output directory, typically:

- Container: `/shared/output/resources.sqlite`
- Host (bind mount): `$workdir/shared/output/resources.sqlite`

Optional environment overrides when reading from a running container:

| Variable | Purpose |
|----------|---------|
| `RW_RESOURCE_STORE_PATH` | Absolute path to the `.sqlite` file |
| `RW_OUTPUT_DIR` | Output directory if the DB path is relative |

Interactive browser UI: [http://localhost:8000/explorer/](http://localhost:8000/explorer/) (use the **Rendered workspace** tab for SLXs).

## Schema (version 2)

### Discovered resources

| Table | Role |
|-------|------|
| `platforms` | `kubernetes`, `azure`, `aws`, … |
| `resource_types` | Types per platform + JSON list of custom attribute names |
| `resources` | One row per resource; `attributes_json` holds encoded indexer attributes |

Primary key: `(platform, resource_type, qualified_name)`.

### Rendered workspace artifacts (SLX / SLI / runbook)

| Column | Description |
|--------|-------------|
| `workspace_name` | From `workspaceName` in workspaceInfo |
| `relative_path` | Path under output, e.g. `workspaces/my-ws/slxs/backend-api/slx.yaml` |
| `artifact_kind` | `slx`, `sli`, `runbook`, `workspace`, `slx_bundle`, `other` |
| `media_type` | Usually `yaml` |
| `slx_directory` | Parent folder for SLX bundles, e.g. `workspaces/my-ws/slxs/backend-api` |
| `content` | Full rendered file text |

Primary key: `(workspace_name, relative_path)`.

**Listing all SLXs** means filtering `artifact_kind = 'slx'`. Each SLX directory normally also has sibling rows with `artifact_kind` of `sli` and `runbook` sharing the same `slx_directory`.

## HTTP API

Base URL: `http://localhost:8000` (workspace-builder service).

### Store summary

```http
GET /explorer/api/summary
```

Returns resource counts, artifact counts, platform list, navigation tree, and `db_path`.

```bash
curl -s http://localhost:8000/explorer/api/summary | jq .
```

### List all SLXs

```http
GET /explorer/api/artifacts?artifact_kind=slx&workspace_name={name}&limit=500&offset=0
```

| Query param | Description |
|-------------|-------------|
| `workspace_name` | Filter to one workspace (recommended) |
| `artifact_kind` | Use `slx` to list SLX definitions only |
| `q` | Substring search on `relative_path` or `content` |
| `limit` | Page size (1–500, default 100) |
| `offset` | Pagination offset |

Example:

```bash
WORKSPACE=my-workspace-sqlite

curl -s "http://localhost:8000/explorer/api/artifacts?workspace_name=${WORKSPACE}&artifact_kind=slx&limit=500" \
  | jq '.items[] | {path: .relative_path, dir: .slx_directory, preview: .content_preview}'
```

Response shape:

```json
{
  "total": 75,
  "limit": 500,
  "offset": 0,
  "items": [
    {
      "workspace_name": "my-workspace-sqlite",
      "relative_path": "workspaces/my-workspace-sqlite/slxs/backend-api/slx.yaml",
      "artifact_kind": "slx",
      "media_type": "yaml",
      "slx_directory": "workspaces/my-workspace-sqlite/slxs/backend-api",
      "content_preview": "kind: ServiceLevelX\nmetadata:\n  name: backend-api\n..."
    }
  ]
}
```

List responses omit full `content`; use the detail endpoint for the YAML body.

### Get one SLX (full YAML)

```http
GET /explorer/api/artifact?workspace_name={name}&relative_path={path}
```

`relative_path` must match the stored path exactly (URL-encode if needed).

```bash
curl -s --get "http://localhost:8000/explorer/api/artifact" \
  --data-urlencode "workspace_name=${WORKSPACE}" \
  --data-urlencode "relative_path=workspaces/${WORKSPACE}/slxs/backend-api/slx.yaml" \
  | jq -r .content
```

### List SLI and runbook files for the same SLX

Use the shared `slx_directory` from an SLX row:

```bash
SLX_DIR="workspaces/${WORKSPACE}/slxs/backend-api"

curl -s "http://localhost:8000/explorer/api/artifacts?workspace_name=${WORKSPACE}&q=${SLX_DIR}" \
  | jq '.items[] | select(.slx_directory == "'"${SLX_DIR}"'") | {kind: .artifact_kind, path: .relative_path}'
```

Or fetch each kind explicitly:

```bash
for kind in slx sli runbook; do
  curl -s "http://localhost:8000/explorer/api/artifacts?workspace_name=${WORKSPACE}&artifact_kind=${kind}&q=${SLX_DIR}"
done
```

### List SLX bundles (SLX + SLI + runbook + Skill grouped together)

```http
GET /explorer/api/slx-bundles?workspace_name={name}&q={substring}&limit=100&offset=0
```

Each bundle returned in `items` groups the rendered files that share the same
`slx_directory`. The response shape is:

```json
{
  "total": 17,
  "limit": 100,
  "offset": 0,
  "items": [
    {
      "workspace_name": "demo-ws",
      "slx_directory": "workspaces/demo-ws/slxs/backend-api",
      "slx_name": "backend-api",
      "file_count": 4,
      "kinds": ["runbook", "skill", "sli", "slx"],
      "has_slx": true,
      "has_sli": true,
      "has_runbook": true,
      "has_skill": true,
      "files": [
        {"relative_path": "...slx.yaml",     "artifact_kind": "slx",     "media_type": "yaml",     "size_bytes": 412},
        {"relative_path": "...sli.yaml",     "artifact_kind": "sli",     "media_type": "yaml",     "size_bytes": 198},
        {"relative_path": "...runbook.yaml", "artifact_kind": "runbook", "media_type": "yaml",     "size_bytes": 1031},
        {"relative_path": "...Skill.md",     "artifact_kind": "skill",   "media_type": "markdown", "size_bytes": 624}
      ]
    }
  ]
}
```

This endpoint backs the **SLX Bundles** tab in the explorer UI and is the most
convenient way to enumerate the rendered SLX surface without reassembling files
on the client.

The `skill` artifact is a verbatim copy of the source CodeBundle's Skill
markdown (when present, matched case-insensitively against `SKILL.md` /
`Skill.md` / `skill.md` at the bundle root). An MCP/agent can read the Skill
alongside the SLX to understand what the skill does and decide when to invoke
it — see [resource-writer.md](resource-writer.md#skill-overlay) for the overlay
mechanism.

### Discovered resources (indexer graph)

```http
GET /explorer/api/resources?platform=kubernetes&resource_type=Namespace&q=default&limit=100
GET /explorer/api/resource?platform=kubernetes&resource_type=Namespace&qualified_name=default
```

## SQL queries

Open the database:

```bash
sqlite3 output/resources.sqlite
```

### List all SLXs

```sql
SELECT
  workspace_name,
  relative_path,
  slx_directory,
  length(content) AS bytes
FROM workspace_artifacts
WHERE artifact_kind = 'slx'
ORDER BY workspace_name, slx_directory;
```

Filter to one workspace:

```sql
SELECT relative_path, slx_directory
FROM workspace_artifacts
WHERE workspace_name = 'my-workspace-sqlite'
  AND artifact_kind = 'slx';
```

### Count SLXs per workspace

```sql
SELECT workspace_name, COUNT(*) AS slx_count
FROM workspace_artifacts
WHERE artifact_kind = 'slx'
GROUP BY workspace_name;
```

### Full SLX bundle (SLX + SLI + runbook) per directory

```sql
SELECT artifact_kind, relative_path
FROM workspace_artifacts
WHERE slx_directory = 'workspaces/my-workspace-sqlite/slxs/backend-api'
ORDER BY artifact_kind;
```

### SLXs missing a runbook or SLI

```sql
WITH dirs AS (
  SELECT DISTINCT slx_directory, workspace_name
  FROM workspace_artifacts
  WHERE artifact_kind = 'slx' AND slx_directory IS NOT NULL
)
SELECT d.slx_directory,
       MAX(CASE WHEN a.artifact_kind = 'sli' THEN 1 ELSE 0 END) AS has_sli,
       MAX(CASE WHEN a.artifact_kind = 'runbook' THEN 1 ELSE 0 END) AS has_runbook
FROM dirs d
LEFT JOIN workspace_artifacts a
  ON a.workspace_name = d.workspace_name
 AND a.slx_directory = d.slx_directory
GROUP BY d.workspace_name, d.slx_directory
HAVING has_sli = 0 OR has_runbook = 0;
```

### Search SLX content by substring

```sql
SELECT relative_path, slx_directory
FROM workspace_artifacts
WHERE artifact_kind = 'slx'
  AND content LIKE '%namespace%'
ORDER BY relative_path;
```

### List Kubernetes namespaces (discovered resources)

```sql
SELECT name, qualified_name, attributes_json
FROM resources
WHERE platform = 'kubernetes'
  AND resource_type = 'Namespace'
ORDER BY name;
```

Decode `attributes_json` in application code using `decode_attributes()` from `indexers.sqlite_resource_writer`, or inspect raw JSON for simple fields.

## Python read helpers

```python
from indexers.sqlite_resource_writer import (
    open_database,
    search_workspace_artifacts,
    count_workspace_artifacts,
    get_workspace_artifact,
    list_resources,
)

conn = open_database("output/resources.sqlite")

# All SLXs in a workspace
slxs = search_workspace_artifacts(
    conn,
    workspace_name="my-workspace-sqlite",
    artifact_kind="slx",
    limit=500,
)
print(f"{len(slxs)} SLXs (page); total={count_workspace_artifacts(conn, workspace_name='my-workspace-sqlite', artifact_kind='slx')}")

for row in slxs:
    print(row["relative_path"], row["slx_directory"])

# Full YAML for one SLX
doc = get_workspace_artifact(
    conn,
    "my-workspace-sqlite",
    "workspaces/my-workspace-sqlite/slxs/backend-api/slx.yaml",
)
print(doc["content"])

conn.close()
```

## Relating SLXs to discovered resources

SLX YAML carries resource context under `spec.additionalContext` (for example `resourcePath`, `hierarchy`, and tags). The store does not yet foreign-key SLX rows to `resources` rows; correlate in application logic by:

1. Parsing SLX `content` as YAML and reading `spec.additionalContext.resourcePath` or tag values.
2. Matching those values to `resources.qualified_name` or attributes in `attributes_json`.

Example SQL to pair by path substring (illustrative only):

```sql
SELECT
  a.relative_path AS slx_path,
  r.platform,
  r.resource_type,
  r.qualified_name
FROM workspace_artifacts a
JOIN resources r
  ON a.artifact_kind = 'slx'
 AND a.content LIKE '%' || r.qualified_name || '%'
WHERE a.workspace_name = 'my-workspace-sqlite'
LIMIT 20;
```

Prefer explicit fields from parsed SLX YAML over fuzzy `LIKE` joins for production queries.

## Related documentation

- [ResourceWriter](resource-writer.md) — how data is written and schema versioning
- [Discovery Output](../user-guide/features/user_guide-feature_overview.md) — enabling the SQLite backend and explorer UI

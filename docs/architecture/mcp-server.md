# MCP server: design notes

This page covers the engineering shape of the MCP server. For the
user-facing "how do I connect Claude Code to this" guide, see
[user-guide/features/mcp-server.md](../user-guide/features/mcp-server.md).

## Goal

Give OSS users of `runwhen-local` (i.e. people who are not on the
[RunWhen Platform](https://www.runwhen.com)) a small, dependency-free
way to plug their indexed environment into agentic clients. The
workspace-builder already discovers resources and renders Skills; this
just exposes those over a protocol agents already speak.

We deliberately scope v1 to **read-only** so the MCP layer is a thin
wrapper over the existing SQLite resource store. Execution lives on
the Platform, and a sandboxed local runtime is a future iteration.

## Layout

```
src/workspace_builder/mcp/
├── __init__.py     # package docstring
├── tools.py        # data-access layer; one function per MCP tool
├── search.py       # token-overlap ranking helpers (no third-party deps)
└── server.py       # FastMCP server + tool registrations + ASGI app builder
```

`server.py` is intentionally thin: each `@mcp.tool()` decorator does
nothing but forward to a function in `tools.py`. That split lets the
MCP-side surface (schemas, descriptions, capability negotiation) move
independently of the data plane.

## Wiring into FastAPI

The MCP server is a Starlette ASGI sub-app mounted into the existing
FastAPI app at `/mcp`. The lifecycle wiring is the only subtle bit:

```python
# src/workspace_builder/api.py
_mcp_lifespan = build_mcp_lifespan() if is_mcp_enabled() else None
app = FastAPI(title="...", lifespan=_mcp_lifespan)
if _mcp_lifespan is not None:
    app.mount("/mcp", build_streamable_http_app())
```

`build_mcp_lifespan()` returns an async context manager that drives
the FastMCP server's `session_manager.run()`. Without it, every
JSON-RPC call to `/mcp/` fails with
`FastMCP's StreamableHTTPSessionManager task group was not initialized`,
because FastAPI does not propagate nested-mount lifespans automatically.

`is_mcp_enabled()` is a small env-var gate (`RW_MCP_DISABLED=true`
turns the route off) so operators who only want the discovery side of
the server can opt out.

## Tool surface

Twelve tools, all read-only. Every tool is side-effect-free. Content
is clipped per artifact at `MAX_CONTENT_CHARS = 32_000` to stay within
agent context budgets; the explorer REST API is the escape hatch for
full content.

### v1: ground-truth resource and Skill access

| Tool | Backed by |
| --- | --- |
| `get_workspace_summary` | `resource_store_reader.get_store_summary` + `list_slx_bundles` (count) + per-platform `count_resources` |
| `search_skills` | `list_slx_bundles` (candidate pool) + `search.score_candidate` re-rank |
| `list_skills` | `list_slx_bundles` |
| `get_skill` | `list_slx_bundles` (lookup) + `get_workspace_artifact` (full content per file) |
| `search_resources` | `count_resources` + `search_resources` |
| `get_resource` | `sqlite_resource_writer.get_resource` |

### v1.1: joins, recommendations, previews

| Tool | Backed by |
| --- | --- |
| `get_skills_for_resource` | Best-effort match: pull the resource, derive a small set of match terms (qualified name, short name, slugified variants), `list_slx_bundles(q=term)` for each, dedupe and rank by number of matched terms. The renderer doesn't store an explicit resource→SLX binding today; this scan is the contract that lets us later swap in a stored binding without changing the tool surface. |
| `get_workspace_health` | `workspace_builder.health.get_health_tracker()` — the same source the existing `/health/` endpoint uses. |
| `list_codebundles` | Iterates `enrichers.code_collection.code_collection_cache`, returning each loaded `CodeCollection`'s repo URL + on-disk path + load state. |
| `get_resource_neighbors` | Forward refs: walk the decoded attributes for `$ref` markers (the `_REF_KEY` produced by `sqlite_resource_writer.encode_attributes`) and resolve each via `get_resource`. Reverse refs: SQL `LIKE` against `attributes_json` for the resource's qualified name with proper `_` / `%` escaping. Both bounded by `limit`. |
| `recommend_skills` | Same scoring as `search_skills`, but skips the `LIKE` pre-filter and ranks every bundle in the candidate pool. Tuned for longer free-text input (error traces, user messages). |
| `preview_skill_invocation` | Reuses `get_skill` to fetch the bundle, then formats a templated `runwhen-cli` invocation. Read-only by design; the future micro-runtime tool replaces this with sandboxed execution. |

## Prompts

Four canned investigation prompts registered with `@mcp.prompt()`.
Each one returns a templated string that the MCP client surfaces as a
slash-menu entry. The agent receives the rendered prompt as the first
turn and orchestrates calls to the tools above.

| Prompt | Args | Tools it orchestrates |
| --- | --- | --- |
| `kickoff_investigation` | — | `get_workspace_summary`, `get_workspace_health`, `list_codebundles`, `list_skills` |
| `triage_kubernetes_namespace` | `namespace` | `search_resources`, `get_skills_for_resource`, `get_skill` |
| `diagnose_failing_deployment` | `namespace`, `deployment` | `get_resource`, `get_resource_neighbors`, `get_skills_for_resource`, `preview_skill_invocation`, `recommend_skills` |
| `audit_azure_keyvaults` | — | `search_resources`, `search_skills`, `get_skills_for_resource` |

Prompts are intentionally thin — they are *teaching* prompts, not
behaviour. The agent is free to skip steps if a tool returns enough
context, and the prompts are explicit about uncertainty (e.g. flag
gaps where Skills don't exist rather than inventing investigation
steps).

## Search ranking

`search_skills` is the only tool with non-trivial behaviour. The flow:

1. Pull a candidate pool of up to `_SEARCH_CANDIDATE_POOL = 100`
   bundles from `list_slx_bundles`. The query string is **not** used as
   a SQL `LIKE` filter for free-text queries because that would force
   all words to appear contiguously ("rotate key vault secrets" almost
   never appears verbatim). Only explicit `platform` / `resource_type`
   filters are applied as `LIKE`.
2. For each candidate, concatenate the `skill` + `runbook` + `sli` +
   `slx` artifact contents into one string and run token-overlap
   scoring against the query.
3. Field weights: `name × 4`, `path × 2`, `kinds × 1.5`, `content × 1`.
   Stop-words filtered, lowercased, distinct-token counts (so a long
   runbook can't drown out a tight name match).
4. Sort descending, return top-N with a snippet of `2 × _SNIPPET_RADIUS`
   characters around the first matching token.

This is dependency-free and good enough for typical workspace sizes
(O(few hundred) bundles). The contract is intentionally a `score` +
`snippet` pair attached to each candidate, so a future iteration can
swap in embeddings (sqlite-vec, Chroma sidecar, ...) without changing
the tool signature.

## Tests

`src/workspace_builder/test_mcp.py`:

* `SearchRankingTests` - `tokenize`, `score_candidate`, `make_snippet`
  unit tests with no DB.
* `WorkspaceSummaryTests` - empty-DB fallback + seeded-DB summary.
* `SkillToolTests` - `list`, ranked search (deployment vs key vault
  queries route to the right bundle), `get_skill`, lookup error.
* `ResourceToolTests` - `search_resources` filtering, `get_resource`
  attribute round-trip.
* `GetSkillsForResourceTests` - resource-bound Skill match via fan-out
  on qualified name / short name / slugified variants.
* `GetResourceNeighborsTests` - forward-ref resolution (Deployment →
  Namespace), reverse-ref discovery (Namespace ← Deployment), unknown-
  resource error.
* `RecommendSkillsTests` - long natural-language context surfaces a
  Deployment-related Skill ahead of unrelated Key Vault Skill.
* `PreviewSkillInvocationTests` - returns runbook content + templated
  `runwhen-cli` example.
* `GetWorkspaceHealthTests` / `ListCodebundlesTests` - shape contracts
  (the underlying state can vary in tests).
* `McpServerSmokeTests` - all 12 tools registered, all 4 prompts
  registered, ASGI app shape, env-var gate.

`MAX_CONTENT_CHARS` and `MAX_LIMIT` are exported from `tools.py` so
tests and future telemetry can read them without reaching into the
server module.

## Future work

| Theme | Sketch |
| --- | --- |
| **Auth** | Optional `RW_MCP_AUTH_TOKEN` bearer-token guard for non-localhost deployments. |
| **Explicit resource → SLX binding** | Today `get_skills_for_resource` falls back to scanning rendered content because the renderer doesn't record the binding. Storing it at render time would let this tool be exact rather than best-effort. |
| **Semantic search** | Optional embedding-based ranking. Likely sqlite-vec for the OSS path; the tool contract stays the same. Drops cleanly into `recommend_skills` first, then `search_skills`. |
| **Micro-runtime** | A sandboxed `run_skill(slx_name, parameters)` tool that executes the codebundle in a constrained subprocess. This is where the v1 read-only contract ends. `preview_skill_invocation` is the placeholder until then. |
| **More prompts** | The four shipped prompts cover Kubernetes triage, Deployment diagnosis, Key Vault audit, and a generic kickoff. AWS- and GCP-specific prompts (RDS audit, IAM key audit, GKE namespace triage) are obvious next additions. |

## See also

* [Resource store query API](./resource-store-query-api.md) - the
  lower-level read API the MCP tools delegate to.
* [ResourceWriter](./resource-writer.md) - how the SQLite store gets
  populated in the first place.
* [user-guide/features/mcp-server.md](../user-guide/features/mcp-server.md) -
  user-facing connection guide.

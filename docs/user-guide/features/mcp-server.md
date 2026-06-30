# MCP server: agentic access to your discovered Skills

RunWhen Local includes a built-in **Model Context Protocol (MCP)** server
so AI agents — Claude Code, Cursor, Claude Desktop, and any other
MCP-compatible client — can search, browse, and read the agentic Skills
that the workspace-builder has generated for *your* environment.

This is the lightweight, OSS-tier counterpart to the production-grade
governance and execution that the [RunWhen Platform](https://www.runwhen.com)
provides. v1 is **read-only**: it lets agents discover Skills and ground
their reasoning in the resources you actually have. Execution against
those Skills lives on the RunWhen Platform today, and a sandboxed local
micro-runtime is on the roadmap.

## What you get

The MCP server exposes **twelve read-only tools** and **four canned
prompts** to any agent that connects.

### Tools

#### Workspace introspection

| Tool | What it does |
| --- | --- |
| `get_workspace_summary` | Top-line stats: counts of resources by platform / type, number of generated Skills. Good first call for an agent. |
| `get_workspace_health` | Whether the last discovery run succeeded, when it ran, how long it took, warnings / parsing errors. Use this to answer "did discovery work?". |
| `list_codebundles` | Which CodeCollections are loaded, where each was cloned from. Lets the agent explain Skill provenance. |

#### Skill discovery and reading

| Tool | What it does |
| --- | --- |
| `search_skills` | Rank-search Skills by a curated query. Returns ranked matches with a short snippet around the first match. |
| `recommend_skills` | Like `search_skills` but takes free-text context (an error trace, a user message, a log line) and ranks **every** Skill against it. Use when a query string feels too narrow. |
| `list_skills` | Browse all generated Skills with pagination, optionally filtered by platform / resource type. |
| `get_skill` | Return the full bundle for one Skill: SLX yaml, SLI yaml, runbook yaml, and the SKILL.md describing what it does. |
| `preview_skill_invocation` | Return what *would* run for a Skill — runbook content + an illustrative `runwhen-cli` invocation — without executing anything. The handoff tool while the sandboxed micro-runtime is on the roadmap. |

#### Resource graph

| Tool | What it does |
| --- | --- |
| `search_resources` | Search the indexed resource graph (Kubernetes / Azure / AWS / GCP). |
| `get_resource` | Drill into one resource by `(platform, resource_type, qualified_name)` with the full attribute payload. |
| `get_resource_neighbors` | Walk one hop in the resource graph: forward refs (this Deployment → its Pods / Service / ReplicaSet) and reverse refs (the Namespace's members). |
| `get_skills_for_resource` | The agent's natural "I'm looking at this resource, what runbooks apply?" entry point. Returns Skill bundles bound to the given resource. |

The server reads from the same SQLite resource store that powers the
workspace explorer at `/explorer/`, so what an agent sees over MCP is
always consistent with what a human sees in the UI.

### Prompts

MCP prompts are pre-built starter templates that show up in your
client's slash-menu (e.g. `/triage-namespace` in Cursor or Claude
Code). Each one orchestrates calls to the tools above and gives the
agent a curated investigation flow rather than "figure it out from
scratch":

| Prompt | Arguments | What it does |
| --- | --- | --- |
| `kickoff_investigation` | — | Get oriented in a freshly-indexed workspace. Calls summary + health + list-codebundles + a sample of Skills, then proposes 2–3 investigation directions. The recommended first prompt after wiring the server up. |
| `triage_kubernetes_namespace` | `namespace` | Triage a Kubernetes namespace: enumerate its resources, find Skills bound to each, and produce a checklist with Skill links. |
| `diagnose_failing_deployment` | `namespace`, `deployment` | Drill into one failing Deployment: pull attributes, walk the resource graph, find matching Skills, propose the single most-likely-relevant runbook to read. |
| `audit_azure_keyvaults` | — | Audit indexed Azure Key Vaults for rotation / expiry / access-policy concerns. Returns a per-vault checklist linked to Skills. |

## Endpoint

The MCP server is mounted into the existing FastAPI process at:

```
http://<your-runwhen-local-host>:8000/mcp/
```

It speaks the [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http)
transport from the MCP spec.

> The trailing slash matters - clients that POST to `/mcp` (no slash)
> will be 307-redirected to `/mcp/`. Most MCP clients follow this
> automatically, but if you see "Method Not Allowed" or empty
> responses, double-check the URL.

## Connecting an MCP client

### Claude Code

Add a `claude_code` MCP server entry pointing at your runwhen-local
instance:

```json
{
  "mcpServers": {
    "runwhen-local": {
      "type": "http",
      "url": "http://localhost:8000/mcp/"
    }
  }
}
```

If you're running runwhen-local in Docker, the URL is whatever you've
mapped port `8000` to on the host.

### Cursor

In your Cursor settings, add a remote MCP server:

```json
{
  "mcp.servers": {
    "runwhen-local": {
      "url": "http://localhost:8000/mcp/"
    }
  }
}
```

### Claude Desktop

Claude Desktop currently prefers stdio transports for local servers.
The cleanest way to bridge HTTP into stdio is the
[`mcp-remote`](https://www.npmjs.com/package/mcp-remote) helper:

```json
{
  "mcpServers": {
    "runwhen-local": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8000/mcp/"]
    }
  }
}
```

### Any HTTP-capable client

Send a standard MCP `initialize` request to `/mcp/`:

```bash
curl -sL -X POST http://localhost:8000/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize",
       "params":{"protocolVersion":"2025-06-18",
                 "capabilities":{},
                 "clientInfo":{"name":"my-client","version":"0"}}}'
```

The response includes the negotiated protocol version, our server
capabilities, and a `mcp-session-id` header to use on subsequent
requests.

## Worked example: an agent investigating a problem

A typical interaction loop looks like this:

1. **Ground**: agent calls `get_workspace_summary` and
   `get_workspace_health` to learn what the user has indexed (e.g.
   "12 AKS clusters, 47 Azure Key Vaults, 230 Kubernetes Deployments,
   discovery last succeeded 4 minutes ago").
2. **Search**: user asks "are any of my key vaults about to expire?"
   The agent calls
   `search_skills(query="key vault expiry rotation")` and gets back
   the `azure-keyvault-rotation` Skill ranked first, with a snippet
   from its SKILL.md.
3. **Read**: agent calls `get_skill(slx_name="azure-keyvault-rotation")`
   to read the full runbook + SKILL.md so it can describe the right
   command set.
4. **Drill**: if the user wants to know which specific vaults are
   affected, the agent calls
   `search_resources(platform="azure", resource_type="azure_keyvault_vaults")`
   and presents the list.
5. **Bind**: for each interesting vault, agent calls
   `get_skills_for_resource(...)` to find runbooks bound to that
   specific vault, and `get_resource_neighbors(...)` to walk to
   related resources (private endpoints, network ACL rules).
6. **Preview**: when the user picks a Skill to run, agent calls
   `preview_skill_invocation(slx_name=...)` to show the exact command
   without executing it.

Or — much simpler — the user just types `/audit-azure-keyvaults` in
their MCP client. The pre-built prompt drives the same loop with no
hand-prompting.

## Configuration

| Environment variable | Default | Effect |
| --- | --- | --- |
| `RW_MCP_DISABLED` | `false` | Set to `true` / `1` to mount the FastAPI app **without** the MCP route. The rest of the server (REST API, explorer UI, health) keeps running. |
| `RW_RESOURCE_STORE_PATH` | `/shared/output/resources.sqlite` | Path to the SQLite store the MCP tools read from. Same setting the explorer uses. |

The MCP server reads the same SQLite database the workspace-builder
writes during a discovery run. If you call any MCP tool *before*
discovery has run, the server returns a friendly empty response with
a `discovery_complete: false` flag so the agent can prompt the user
to run discovery.

## Security model (v1)

* **Read-only**: every tool is a SELECT against the SQLite store. No
  cloud calls are issued by MCP; the workspace-builder owns all
  outbound traffic.
* **No auth on the route by default.** The server inherits the
  same trust model as the rest of `:8000` - it expects to be exposed
  on `localhost` or behind a reverse proxy you control. **Do not
  publish `/mcp/` to the public internet without a proxy that adds
  authentication.**
* **No execution.** Skills are returned as data (YAML + Markdown).
  Running a Skill against your environment is the
  [RunWhen Platform's](https://www.runwhen.com) job today.

## Roadmap

| Phase | What |
| --- | --- |
| **v1.1 (today)** | 12 read-only tools and 4 canned prompts. Search, browse, drill-in, resource ↔ Skill joins, free-text recommendations, invocation previews. |
| **Next** | Optional bearer-token auth on `/mcp/`, semantic / embedding-based ranking opt-in, more cloud-specific prompts (AWS RDS audit, GCP IAM, GKE namespace triage). |
| **Later** | A sandboxed micro-runtime that lets agents *execute* one Skill at a time against the user's environment. `preview_skill_invocation` is the placeholder until then. |

## See also

* [Workspace explorer](../../user-guide/features/workspace-builder.md) - the human-facing counterpart that reads the same resource store.
* [Resource store query API](../../architecture/resource-store-query-api.md) - the lower-level REST API powering both the explorer and the MCP tools.
* [Concepts: CodeBundle / Skill / SLX / Runbook](../../authoring/concepts.md) - the vocabulary the MCP tools speak in.

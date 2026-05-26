# WorkspaceInfo Customization

RunWhen Local's primary configuration is provided in a file called `workspaceInfo.yaml`. This file is used to specify:&#x20;

* Which resources to discover and index (currently supporting Kubernetes, Microsoft Azure, AWS, and Google Cloud Platform)
* Which [CodeCollection](https://registry.runwhen.com) repositories to scan for applicable tasks, health checks, and other automation scripts
* Additional customizations to apply when uploading to a [RunWhen Platform workspace](https://docs.runwhen.com/public/runwhen-platform/feature-overview/workspaces)

The top-level structure of the workspace info file is:

```yaml
# Information about the RunWhen workspace
workspaceName: my-workspace
# More workspace config
# Information about cloud platforms to scan to discover resources
cloudConfig:
  kubernetes:
    # Kubernetes config
  azure:
    # Azure config
  # Other platform configs
  
# Information about which code collections to scan for code bundles
codeCollections:
- "https://github.com/runwhen-contrib/rw-public-codecollection.git"
- # Another code collections to scan


# Information about MCP servers to discover tools from
mcpConfig:
  servers:
    - display_name: jira
      url: https://jira-mcp.internal:443/mcp
      secret_ref: jira-mcp-token


# Custom information about specific code bundles
custom:
  prometheus_provider: gmp
  # More custom configuration
```

#### MCP Server Discovery (`mcpConfig`)

The optional `mcpConfig` block declares one or more private MCP servers to introspect during the indexer phase. For each entry the workspace builder calls `initialize` + `tools/list` on the server, then emits one `mcp_tool` resource per discovered tool. The `mcp-tool-proxy` codebundle in [rw-generic-codecollection](https://github.com/runwhen-contrib/rw-generic-codecollection) renders one SLX + Runbook per `mcp_tool` resource via its generation rule.

<table><thead><tr><th width="220">Field</th><th width="120">Required</th><th>Description</th></tr></thead><tbody><tr><td><code>display_name</code></td><td>yes</td><td>Short identifier used in generated SLX names and tags (e.g. <code>jira</code>, <code>linear</code>). Lowercase, alphanumeric / underscores.</td></tr><tr><td><code>url</code></td><td>yes</td><td>Full HTTPS URL of the MCP endpoint, including the path (commonly <code>/mcp</code>). Must be reachable from the workspace-builder pod's network at index time, <em>and</em> from runner pods at execution time.</td></tr><tr><td><code>secret_ref</code></td><td>yes</td><td>Name of a Kubernetes <code>Secret</code> in the same namespace whose <code>data.token</code> is the bearer token to send as <code>Authorization: Bearer &lt;token&gt;</code>. Token is base64-decoded by the indexer before use.</td></tr><tr><td><code>verify_tls</code></td><td>no (default <code>true</code>)</td><td>Set to <code>false</code> to skip TLS certificate verification for this server. Intended for environments where the pod's CA bundle does not yet trust the server's issuer; a warning is logged for every cycle in which it is disabled. Prefer extending the CA bundle for production use.</td></tr></tbody></table>

> The generated Runbook's <code>codeBundle.ref</code> is pinned to the ref of the codecollection the template was loaded from (the <code>ref</code> standard template variable). Point your <code>codeCollections</code> entry for <code>rw-generic-codecollection</code> at the branch/tag you want runners to execute against — no extra knob in <code>mcpConfig</code>.

A single server's `tools/list` failure logs a warning and skips that server only — other servers and the rest of the cycle continue normally.

##### Required secret shape

```bash
kubectl -n <namespace> create secret generic jira-mcp-token \
  --from-literal=token='<bearer-token-value>'
```

The runner uses the same `secret_ref` at execution time (via `secretsProvided.workspaceKey`), so the secret must be reachable from the runner namespace too.

#### Basic Workspace Configuration Info

There are several settings that are used to configure information in the workspace that's generated to be uploaded to the RunWhen platform to. The available settings are:

<table><thead><tr><th width="290">Label</th><th>Description</th></tr></thead><tbody><tr><td>workspaceName</td><td>The name of the workspace to generate</td></tr><tr><td>workspaceOwnerEmail</td><td>The email address of the owner of the workspace</td></tr><tr><td>defaultLocation</td><td>The location where the the workspace is hosted</td></tr><tr><td>defaultLOD</td><td>The default level of detail to user for cloud resources</td></tr></tbody></table>

####

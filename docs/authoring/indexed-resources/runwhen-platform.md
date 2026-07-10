# RunWhen platform indexed resources

When you write a generation rule, you tell the workspace builder which
resources to match by listing one or more resource types under
`resourceTypes`. Most resource types map to cloud objects or Kubernetes
kinds, but the **`runwhen`** platform exposes workspace-scoped resources
that are not tied to a cloud object or Kubernetes CRD — the `workspace`
resource type, used by MCP tool-builder codebundles.

## Resource types

| Resource type | Scope | Description |
|---|---|---|
| `workspace` | One per workspace-builder run | Anchor for MCP tool-builder codebundles using `platform: runwhen` |

## Template variables

When a generation rule matches a `workspace` resource, templates receive:

| Variable | Value |
|---|---|
| `match_resource.name` | Workspace name |
| `match_resource.qualified_name` | Workspace name |
| `match_resource.owner_email` | `workspaceOwnerEmail` from workspaceInfo |
| `workspace.name` | Workspace name (from base template variables) |
| `workspace.owner_email` | Owner email |
| `default_location` | Default runner location id |

## Example generation rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: runwhen
  generationRules:
    - resourceTypes:
        - workspace
      matchRules:
        - type: pattern
          pattern: ".+"
          properties: [name]
          mode: substring
      slxs:
        - baseName: my-task
          qualifiers: ["workspace"]
          baseTemplateName: my-health-check
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: runbook
              templateName: my-health-check-taskset.yaml
```

See the RunWhen MCP `render_codecollection_skill` tool for generating this
layout from a tested tool-builder script — see the
[MCP tool-builder docs](https://docs.runwhen.com/public/docs/use/mcp-server/tool-builder/).

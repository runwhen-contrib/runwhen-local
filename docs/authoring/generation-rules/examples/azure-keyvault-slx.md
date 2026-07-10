# Example: Azure Key Vault SLX with Skill overlay

Generate an SLX for every Azure Key Vault that has public network access
disabled, and ship a `SKILL.md` so the SLX is invokable by an MCP-aware
AI agent.

## Matched resource

`azure_keyvault_vaults` (alias: `azure_keyvault_keyvaults`) with
`properties.publicNetworkAccess == "Disabled"`:

```yaml
id: /subscriptions/abc/resourceGroups/rg-prod/providers/Microsoft.KeyVault/vaults/kv-prod-001
name: kv-prod-001
resource_type: azure_keyvault_vaults
resource_group: rg-prod
subscription_id: abc
location: eastus
tags:
  environment: prod
properties:
  vaultUri: https://kv-prod-001.vault.azure.net/
  publicNetworkAccess: Disabled
  enableRbacAuthorization: true
  sku:
    name: standard
    family: A
```

## CodeBundle layout

```
codebundles/azure-keyvault-rotation/
├── SKILL.md
└── .runwhen/
    ├── generation-rules/
    │   └── private-keyvault-rotation.yaml
    └── templates/
        ├── azure-keyvault-rotation-slx.yaml
        ├── azure-keyvault-rotation-sli.yaml
        └── azure-keyvault-rotation-taskset.yaml
```

## Generation rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: azure
  generationRules:
    - resourceTypes:
        - azure_keyvault_vaults
      matchRules:
        - type: pattern
          pattern: "Disabled"
          properties: ["resource/properties/publicNetworkAccess"]
          mode: exact
      slxs:
        - baseName: az-kv-rotation
          qualifiers: ["resource", "resource_group", "subscription_id"]
          baseTemplateName: azure-keyvault-rotation
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: sli
            - type: runbook
              templateName: azure-keyvault-rotation-taskset.yaml
```

Place `SKILL.md` at the CodeBundle root — the workspace builder copies it
into every rendered SLX directory automatically (no `outputItems` entry
required).

## Template variables

In Jinja2 templates under `.runwhen/templates/`, use `match_resource` for
resource fields:

```yaml
# excerpt from azure-keyvault-rotation-taskset.yaml
spec:
  configProvided:
    - name: KEY_VAULT_NAME
      value: {{ match_resource.name }}
    - name: VAULT_URI
      value: {{ match_resource.resource.properties.vaultUri }}
    - name: RESOURCE_GROUP
      value: {{ resource_group.name }}
```

## Rendered output

For `kv-prod-001` in resource group `rg-prod`:

```
output/slx/az-kv-rotation--rg-prod--kv-prod-001--<subscription>/
├── SKILL.md          # auto-copied from CodeBundle root
├── slx.yaml
├── sli.yaml
└── taskset.yaml
```

The explorer UI shows `SKILL.md` next to the runbook; MCP agents can read
it as the canonical description of what the SLX does.

## Notes

* The `publicNetworkAccess` match scopes the rule to private vaults only.
* Use path notation (`resource/properties/...`) to match nested ARM fields.
* For public vaults, add a sibling rule with a complementary pattern or
  omit the property match entirely.

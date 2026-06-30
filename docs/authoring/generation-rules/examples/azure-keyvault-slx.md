# Example: Azure Key Vault SLX with Skill overlay

Generate an SLX for every Azure Key Vault that has public network access
disabled, and ship a `SKILL.md` so the SLX is invokable by an MCP-aware
AI agent.

## Matched resource

`azure_keyvault_keyvaults` with `properties.publicNetworkAccess ==
"Disabled"`:

```yaml
id: /subscriptions/abc/resourceGroups/rg-prod/providers/Microsoft.KeyVault/vaults/kv-prod-001
name: kv-prod-001
resource_type: azure_keyvault_keyvaults
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
├── SKILL.md                                # AI-agent-readable Skill description
├── runbook.robot.j2                        # rendered into each SLX
├── sli.yaml.j2
├── slo.yaml.j2
└── .runwhen/generation-rules/
    └── private-keyvault-rotation.yaml      # the rule below
```

## Generation rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRule
spec:
  match:
    resource_type: azure_keyvault_keyvaults
    predicates:
      - jsonpath: $.properties.publicNetworkAccess
        equals: "Disabled"

  slxName:
    template: "azure-keyvault-{{ resource.name }}-rotation"

  templates:
    runbook: runbook.robot.j2
    sli:     sli.yaml.j2
    slo:     slo.yaml.j2
    # No 'skill:' line is needed - the workspace builder auto-copies
    # SKILL.md from the CodeBundle root into every rendered SLX.

  context:
    keyVaultName:  "{{ resource.name }}"
    keyVaultId:    "{{ resource.id }}"
    vaultUri:      "{{ resource.properties.vaultUri }}"
    resourceGroup: "{{ resource.resource_group }}"
    subscription:  "{{ resource.subscription_id }}"
    rotationDays:  90
```

## SKILL.md (excerpt)

```markdown
# Azure Key Vault rotation

This Skill rotates secrets older than the configured threshold in a
single Azure Key Vault. It assumes the running identity has
`Microsoft.KeyVault/vaults/secrets/setSecret/action` permission on the
target vault.

## Inputs
- `keyVaultName` (string, required)
- `vaultUri` (URL, required)
- `rotationDays` (int, default 90)

## Side effects
- Generates new secret versions for any secret whose current version is
  older than `rotationDays`.
- Old versions are kept (not purged) so a rollback path remains.
```

When the workspace builder fires this rule for `kv-prod-001` it
renders:

```
output/slx/azure-keyvault-kv-prod-001-rotation/
├── SKILL.md          # auto-copied from CodeBundle root
├── runbook.robot
├── sli.yaml
└── slo.yaml
```

The explorer UI shows the `SKILL.md` next to the runbook; an MCP-aware
agent can read it as the canonical description of what the SLX *does*.

## Notes

* The `publicNetworkAccess` predicate scopes the rule to private vaults
  only; vaults that allow public network access get a different rule (or
  no SLX at all).
* `vaultUri` is exposed in the context because the runbook uses the
  data-plane URL, not the ARM ID, when calling the Key Vault REST API.
* If you also want a separate SLX for *public* vaults, write a sibling
  rule with `predicates: - jsonpath: $.properties.publicNetworkAccess
  not_equals: "Disabled"`.

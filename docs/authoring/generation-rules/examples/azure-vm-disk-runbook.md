# Example: Azure VM disk runbook

Generate an SLX for every production-tagged Azure VM that runs a "diagnose
slow disk" runbook against its OS disk.

## Matched resource

An `azure_compute_virtual_machines` resource with `tags.environment ==
"prod"`. Example payload (trimmed):

```yaml
id: /subscriptions/abc/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/web-01
name: web-01
resource_type: azure_compute_virtual_machines
subscription_id: abc
resource_group: rg-prod
location: eastus
tags:
  environment: prod
  team: web
properties:
  storageProfile:
    osDisk:
      managedDisk:
        id: /subscriptions/abc/resourceGroups/rg-prod/providers/Microsoft.Compute/disks/web-01-os
      name: web-01-os
```

## Generation rule

`.runwhen/generation-rules/azure-vm-disk-diagnose.yaml`:

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: azure
  generationRules:
    - resourceTypes:
        - azure_compute_virtual_machines
      matchRules:
        - type: pattern
          pattern: "prod"
          properties: [tags]
          mode: substring
        - type: exists
          properties: ["resource/properties/storageProfile/osDisk/managedDisk/id"]
      slxs:
        - baseName: az-vm-disk-hlth
          qualifiers: ["resource", "resource_group", "subscription_id"]
          baseTemplateName: azure-vm-disk-diagnose
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: sli
            - type: runbook
              templateName: azure-vm-disk-diagnose-taskset.yaml
```

Add `SKILL.md` at the CodeBundle root if you want MCP-readable metadata;
the workspace builder copies it into each rendered SLX directory.

## Rendered output

For each matching VM:

```
output/slx/az-vm-disk-hlth--rg-prod--web-01--<subscription>/
├── SKILL.md            # optional, from CodeBundle root
├── slx.yaml
├── sli.yaml
└── taskset.yaml
```

Reference disk fields in templates via `match_resource`:

```yaml
spec:
  configProvided:
    - name: VM_NAME
      value: {{ match_resource.name }}
    - name: OS_DISK_ID
      value: {{ match_resource.resource.properties.storageProfile.osDisk.managedDisk.id }}
    - name: RESOURCE_GROUP
      value: {{ resource_group.name }}
```

## Notes

* The `exists` match skips VMs without a managed OS disk (e.g. ephemeral OS).
* Tag predicates use the built-in `tags` property with `substring` mode.
* Missing `tags.environment` causes the rule not to fire for that VM.

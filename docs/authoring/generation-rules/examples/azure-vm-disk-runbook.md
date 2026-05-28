# Example: Azure VM disk runbook

Generate an SLX for every production-tagged Azure VM that runs a "diagnose
slow disk" runbook against its OS disk.

## Matched resource

A `azure_compute_virtual_machines` resource with `tags.environment ==
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

`.runwhen/generation-rules/azure-vm-disk-diagnose.yaml` inside your
CodeBundle:

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRule
spec:
  match:
    resource_type: azure_compute_virtual_machines
    predicates:
      - jsonpath: $.tags.environment
        equals: "prod"
      - jsonpath: $.properties.storageProfile.osDisk.managedDisk.id
        exists: true

  slxName:
    template: "azure-vm-{{ resource.name }}-disk-health"

  templates:
    runbook: runbook.robot.j2
    sli:     sli.yaml.j2
    skill:   SKILL.md

  context:
    vmName:        "{{ resource.name }}"
    vmId:          "{{ resource.id }}"
    osDiskId:      "{{ resource.properties.storageProfile.osDisk.managedDisk.id }}"
    osDiskName:    "{{ resource.properties.storageProfile.osDisk.name }}"
    resourceGroup: "{{ resource.resource_group }}"
    subscription:  "{{ resource.subscription_id }}"
```

## Rendered output

For each matching VM the workspace builder produces a directory like:

```
output/slx/azure-vm-web-01-disk-health/
├── SKILL.md            # copied verbatim from the CodeBundle root
├── runbook.robot       # rendered with vmName="web-01", osDiskName="web-01-os", ...
└── sli.yaml
```

`runbook.robot.j2` can reference the context directly:

```robot
*** Settings ***
Documentation     Diagnose slow disk on Azure VM ${vmName}.

*** Variables ***
${VM_ID}            {{ vmId }}
${DISK_ID}          {{ osDiskId }}
${RESOURCE_GROUP}   {{ resourceGroup }}
${SUBSCRIPTION}     {{ subscription }}

*** Tasks ***
Check IOPS on ${osDiskName}
    [Documentation]    Pulls 24h of disk metrics from Azure Monitor.
    ...
```

## Notes

* `predicates` here include an `exists` check so we skip VMs that don't
  expose a managed-disk OS disk (e.g. ephemeral OS disks).
* The `osDiskId` is enough on its own; we also expose `osDiskName` purely
  for human-readable runbook headers.
* `tags.environment` is user-supplied data; if it's missing the predicate
  evaluates to false and the SLX isn't generated.

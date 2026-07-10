# GCP indexed resources

When you write a generation rule, you tell the workspace builder which cloud
resources to match by listing one or more resource types under
`resourceTypes`. This page lists the resource types the GCP indexer
discovers, the names that work, and a working match rule example.

A transition from CloudQuery resource names to the native `gcpapi` indexer
names is underway — the alias column lists the legacy CloudQuery names which
will be deprecated. **404 resource types total** — 12 typed (SDK collectors),
391 generic, 1 unmapped. [Full catalog →](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/authoring/indexed-resources/gcp-resource-catalog.md)

## Commonly used resource types

| Resource type | Aliases | Notes |
|---|---|---|
| `gcp_projects` | `project` | anchor, always indexed |
| `gcp_compute_instances` | `compute_instance` | typed |
| `gcp_compute_disks` | — | typed |
| `gcp_compute_snapshots` | — | typed |
| `gcp_compute_networks` | — | typed |
| `gcp_compute_subnetworks` | — | typed |
| `gcp_compute_firewalls` | — | typed |
| `gcp_compute_addresses` | — | typed |
| `gcp_storage_buckets` | — | typed |
| `gcp_container_clusters` | — | typed (GKE) |
| `gcp_pubsub_topics` | — | typed |
| `gcp_pubsub_subscriptions` | — | typed |
| `gcp_iam_service_accounts` | — | typed |
| `gcp_sql_instances` | — | CAI-only (no typed collector) |
| `gcp_run_services` | — | CAI-only (Cloud Run) |

## Built-in matchable properties

| Property | Value |
|---|---|
| `name` | Resource name |
| `project` | GCP project ID |

Use `resource/<path>` to reach raw JSON fields — e.g.
`resource/zone` or `resource/status`.

Typed resources are always discovered with a rich payload via `google-cloud-*`
SDKs. The remaining types require the optional Cloud Asset Inventory
accelerator to be discovered (see
[cloud discovery user guide](../../user-guide/cloud-discovery/gcp.md)).

## Example match rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: gcp
  generationRules:
    - resourceTypes:
        - gcp_compute_instances
      matchRules:
        - type: pattern
          properties: [name]
          pattern: "^prod-"
          mode: substring
      slxs:
        - baseName: gce-health
          qualifiers: [project, name]
          baseTemplateName: gcp-gce-health
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: runbook
```

> [!NOTE]
> 12 types are always discovered via SDK collectors. The other 391 types require
> the optional Cloud Asset Inventory accelerator to be enabled. Check the
> [full catalog](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/authoring/indexed-resources/gcp-resource-catalog.md)
> for tier status. For credential setup and workspace configuration, see the
> [cloud discovery user guide](../../user-guide/cloud-discovery/gcp.md).
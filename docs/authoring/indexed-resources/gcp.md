# GCP indexer

RunWhen Local can discover GCP resources two ways, selected by
`gcpIndexerBackend` in `workspaceInfo.yaml`:

* **`cloudquery`** (default): invokes the
  [CloudQuery GCP plugin](https://hub.cloudquery.io/plugins/source/cloudquery/gcp)
  against the project(s) you've configured and reads the resulting SQLite
  intermediate.
* **`gcpapi`**: the native indexer — uses Google Cloud Asset Inventory plus
  first-party `google-cloud-*` SDKs, no CloudQuery binary or `gcloud`
  subprocesses. It discovers only the resource types your generation rules
  reference, per project, and respects per-project `projectLevelOfDetails`
  (projects with LOD `none` are skipped). See
  [GCP indexer internals](../../architecture/gcp-indexer-internals.md) for the
  design.

```yaml
# workspaceInfo.yaml
gcpIndexerBackend: gcpapi
```

Either way the CodeBundle-facing contract is the same: generation rules
reference the **CloudQuery table name** as `resource_type` (e.g.
`gcp_compute_instances`), and field shapes follow the CloudQuery GCP plugin
output. The native backend normalizes Cloud Asset Inventory payloads into that
same shape, so rules don't change when you flip the backend. Per-table schemas
live in the
[plugin's table reference](https://hub.cloudquery.io/plugins/source/cloudquery/gcp/latest/tables).

For credential setup (service-account JSON, ADC, project scoping) and
`workspaceInfo.yaml` snippets, see the user guide's
[GCP cloud-discovery page](../../user-guide/cloud-discovery/gcp.md).

## Common matchable types

Generation rules in the contrib CodeBundles most often target:

* `gcp_compute_instances`
* `gcp_compute_disks`, `gcp_compute_snapshots`
* `gcp_storage_buckets`
* `gcp_container_clusters` (GKE)
* `gcp_sql_instances`
* `gcp_pubsub_topics`, `gcp_pubsub_subscriptions`
* `gcp_iam_service_accounts`

Use the CloudQuery table name as `resource_type` in your generation
rule. Field shapes follow the CloudQuery GCP plugin output verbatim.

The native `gcpapi` backend ships hand-written SDK collectors for
`gcp_compute_instances`, `gcp_container_clusters`, and `gcp_storage_buckets`
(richer payloads); every other table is served by the Cloud Asset Inventory
pass. The full mapping of CloudQuery table -> CAI asset type lives in the
generated registry (`src/indexers/gcp_resource_type_registry.yaml`).

## Roadmap

The native `gcpapi` indexer is the path toward removing the CloudQuery
dependency entirely (alongside `azureapi` and a future native AWS indexer).
`cloudquery` remains the default backend until the native path has been
validated across the contrib CodeBundles.

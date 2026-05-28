# GCP indexer

The GCP indexer is CloudQuery-backed today: RunWhen Local invokes the
[CloudQuery GCP plugin](https://hub.cloudquery.io/plugins/source/cloudquery/gcp)
against the project(s) you've configured and reads the resulting SQLite
intermediate. Per-table schemas live in the
[plugin's table reference](https://hub.cloudquery.io/plugins/source/cloudquery/gcp/v17.0.0/tables).

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

## Roadmap

A future native `gcpapi` indexer (analogous to `azureapi`) is on the
roadmap. The CodeBundle-facing contract is intended to remain stable
when that lands.

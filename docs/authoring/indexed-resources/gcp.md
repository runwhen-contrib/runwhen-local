# GCP indexer

RunWhen Local can discover GCP resources two ways, selected by
`gcpIndexerBackend` in `workspaceInfo.yaml`:

* **`cloudquery`** (default): invokes the
  [CloudQuery GCP plugin](https://hub.cloudquery.io/plugins/source/cloudquery/gcp)
  against the project(s) you've configured and reads the resulting SQLite
  intermediate.
* **`gcpapi`**: the native indexer — uses first-party `google-cloud-*` SDK
  collectors as its functional baseline, plus an optional Google Cloud Asset
  Inventory accelerator, with no CloudQuery binary or `gcloud`
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

## Discovery tiers: the typed baseline and the optional CAI accelerator

The native `gcpapi` backend has two discovery tiers:

1. The **typed fallback collectors** — the supported **functional baseline**.
   A set of hand-written collectors built on first-party `google-cloud-*` SDKs
   for the high-value types. They need only the relevant per-service viewer
   roles and run whether or not Cloud Asset Inventory is available.
2. An **optional Cloud Asset Inventory (CAI) accelerator** — a catch-all generic
   pass that *broadens* coverage to the long tail of resource types that have no
   typed collector. CAI is **not required**; its absence is normal and never
   fails discovery.

The registry (`src/indexers/gcp_resource_type_registry.yaml`) currently
tracks **404** CloudQuery tables. **403** of them carry a CAI asset-type mapping
and are therefore discoverable by the generic pass (the one exception,
`gcp_billing_billing_accounts`, has no CAI mapping). Of those 403, **12** also
have a typed collector and **390** are served **only** by the CAI generic pass.

### Baseline — typed fallback collectors (no CAI required)

The supported baseline for native GCP discovery is the typed fallback tier. The
12 typed types below are discovered via their own SDK clients (each is
automatically excluded from the CAI pass so it is written exactly once), plus
the synthesized **`gcp_projects`** anchor (always emitted, no API call). They
require only the matching **per-service viewer roles**
(compute / storage / container / pubsub / iam) — there is no dependency on Cloud
Asset Inventory. Because discovery is selective, only the subset your loaded
generation rules actually reference is collected:

| CloudQuery table | SDK client | Required role |
|------------------|-----------|---------------|
| `gcp_projects` (anchor) | — (synthesized) | — |
| `gcp_compute_instances` | `google-cloud-compute` | `roles/compute.viewer` |
| `gcp_compute_disks` | `google-cloud-compute` | `roles/compute.viewer` |
| `gcp_compute_snapshots` | `google-cloud-compute` | `roles/compute.viewer` |
| `gcp_compute_networks` | `google-cloud-compute` | `roles/compute.viewer` |
| `gcp_compute_subnetworks` | `google-cloud-compute` | `roles/compute.viewer` |
| `gcp_compute_firewalls` | `google-cloud-compute` | `roles/compute.viewer` |
| `gcp_compute_addresses` | `google-cloud-compute` | `roles/compute.viewer` |
| `gcp_storage_buckets` | `google-cloud-storage` | `roles/storage.objectViewer` |
| `gcp_container_clusters` (GKE) | `google-cloud-container` | `roles/container.viewer` |
| `gcp_pubsub_topics` | `google-cloud-pubsub` | `roles/pubsub.viewer` |
| `gcp_pubsub_subscriptions` | `google-cloud-pubsub` | `roles/pubsub.viewer` |
| `gcp_iam_service_accounts` | `google-cloud-iam` | `roles/iam.serviceAccountViewer` |

### Optional accelerator — Cloud Asset Inventory (broadens coverage only)

CAI is an **optional** accelerator: enabling it broadens coverage to the **390
CAI-only** types that have no typed collector, but it is not needed for the
baseline. If you want that extra breadth, enable the API and grant a CAI viewer
role:

```bash
# OPTIONAL — only to broaden coverage beyond the typed baseline.
gcloud services enable cloudasset.googleapis.com --project <PROJECT_ID>
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:<SA_EMAIL>" \
  --role="roles/cloudasset.viewer"
```

Without CAI, the 390 CAI-only types are simply not discovered; the typed
baseline is unaffected.

`gcp_sql_instances` and `gcp_run_services` are **deferred** — they do not yet
have a typed collector (Cloud SQL Admin / Cloud Run lack an idiomatic
`google-cloud-*` client suited to the fallback pattern), so they remain
CAI-served. They, along with the other ~388 long-tail types, are only discovered
when the optional CAI accelerator is enabled.

### Permission matrix

| Tier | Roles / API | Status |
|------|-------------|--------|
| Typed fallback (baseline) | `roles/compute.viewer`, `roles/storage.objectViewer`, `roles/container.viewer`, `roles/pubsub.viewer`, `roles/iam.serviceAccountViewer` | **Required baseline** — these gate the always-on typed types |
| Cloud Asset Inventory | `roles/cloudasset.viewer` + `cloudasset.googleapis.com` enabled | **Optional accelerator** — broadens coverage to the other 390 types; not required |
| Convenience superset | `roles/viewer` | Optional — covers the typed tier in one grant for sandbox/test projects |

### When Cloud Asset Inventory is unavailable (normal, non-fatal)

If the optional CAI call is rejected with `403 ... cloudasset.assets.listResource`
(or the API is not enabled), the indexer logs an **informational**
`GCP_CAI_PERMISSION_DENIED` note (at INFO — not an error, no banner, no warning)
and **continues normally**: the typed baseline discovers as usual and the
CAI-only types are simply skipped. The `gcpapi` CI smoke test
(`.test/gcp/gcp-and-k8s`, `task ci-test-gcpapi-baseline`) **passes** with CAI
unavailable — it is driven entirely by the typed fallback collectors and asserts
their function (project anchor, storage buckets / GKE clusters, and the default
`gcp_compute_networks` / `gcp_compute_firewalls`).

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

Note that `gcp_sql_instances` is currently a **CAI-only** type (see
[Optional accelerator — Cloud Asset Inventory](#optional-accelerator--cloud-asset-inventory-broadens-coverage-only)),
so it is only discovered when the optional Cloud Asset Inventory accelerator is
enabled. The
[typed fallback collectors](#baseline--typed-fallback-collectors-no-cai-required)
table lists the baseline types that are discovered with or without CAI. The full mapping
of CloudQuery table → CAI asset type lives in the generated registry
(`src/indexers/gcp_resource_type_registry.yaml`).

## Roadmap

The native `gcpapi` indexer is the path toward removing the CloudQuery
dependency entirely (alongside `azureapi` and a future native AWS indexer).
`cloudquery` remains the default backend until the native path has been
validated across the contrib CodeBundles.

# Google Cloud Platform

{% hint style="warning" %}
This page previously contained AWS content by mistake. It has been rewritten to
document GCP cloud discovery. For AWS, see the AWS cloud-discovery page.
{% endhint %}

RunWhen Local discovers GCP resources and matches them with troubleshooting
commands. Discovery is configured under `cloudConfig.gcp` in
`workspaceInfo.yaml`, plus a couple of top-level toggles.

## Choosing a discovery backend

Two backends are available, selected by the top-level `gcpIndexerBackend` key
(or the `WB_GCP_INDEXER_BACKEND` environment variable):

```yaml
# workspaceInfo.yaml
gcpIndexerBackend: gcpapi   # default; or: cloudquery (legacy/fallback)
```

* **`gcpapi`** (default): the native indexer — first-party `google-cloud-*` SDK
  collectors as its functional baseline, plus an optional Google Cloud Asset
  Inventory (CAI) accelerator, with no CloudQuery binary or `gcloud` subprocesses.
* **`cloudquery`** (legacy/fallback): runs the
  [CloudQuery GCP plugin](https://hub.cloudquery.io/plugins/source/cloudquery/gcp)
  against the configured project(s). Set `gcpIndexerBackend: cloudquery` to opt
  back into it.

Both backends expose the **same** generation-rule contract (the CloudQuery
table name is the `resource_type`), so rules don't change when you flip the
backend. The `gcpapi` baseline needs only per-service viewer roles; Cloud Asset
Inventory is an optional add-on — see
[Cloud Asset Inventory (optional accelerator)](#cloud-asset-inventory-optional-accelerator)
below.

You can optionally select where discovered resources are persisted with the
top-level `resourceStoreBackend`. `sqlite` is now the default (it snapshots the
discovered resource graph into a local SQLite database); set `memory` to keep
only the in-memory registry:

```yaml
gcpIndexerBackend: gcpapi
resourceStoreBackend: sqlite   # default; use 'memory' to disable the SQLite snapshot
```

## GCP credentials

Credentials are resolved in the following priority order (see
`src/indexers/gcp_common.py`):

1. **Kubernetes secret** — `saSecretName` points at a secret whose
   `serviceAccountKey` (and optionally `projectId`) keys are base64-encoded.
2. **Inline service-account key** — `serviceAccountKey` (raw JSON or base64).
3. **Application credentials file** — `applicationCredentialsFile`, a path to a
   service-account JSON key mounted into the container (the common local /
   sandbox setup).
4. **Application Default Credentials (ADC)** — if none of the above are set,
   the `google.auth` default chain is used (e.g. Workload Identity, metadata
   server, or `GOOGLE_APPLICATION_CREDENTIALS`).

### Method 1: Service-account JSON file (`applicationCredentialsFile`)

Mount the service-account key into the container and point at it:

```yaml
cloudConfig:
  gcp:
    applicationCredentialsFile: /shared/gcp.secret
    projects:
    - my-gcp-project
```

### Method 2: Inline service-account key

```yaml
cloudConfig:
  gcp:
    serviceAccountKey: |
      { "type": "service_account", "project_id": "my-gcp-project", ... }
    projects:
    - my-gcp-project
```

### Method 3: Kubernetes secret

```yaml
cloudConfig:
  gcp:
    saSecretName: gcp-credentials
```

Create the secret with a base64-encoded service-account key:

```bash
kubectl create secret generic gcp-credentials \
  --from-file=serviceAccountKey=./gcp-sa-key.json
```

### Method 4: Application Default Credentials

If no explicit credentials are configured, ADC is used. The project is then
taken from `projects` / `projectId` in config, or from the
`GOOGLE_CLOUD_PROJECT` / `GCP_PROJECT` environment variables.

```yaml
cloudConfig:
  gcp:
    projects:
    - my-gcp-project
```

## Project scoping and Level of Detail

GCP discovery is scoped **per project**. List the projects to discover under
`projects`, and set how much is collected per project with
`projectLevelOfDetails` (`detailed`, `basic`, or `none`). A project whose
effective LOD is `none` is skipped entirely.

```yaml
defaultLOD: detailed
cloudConfig:
  gcp:
    applicationCredentialsFile: /shared/gcp.secret
    projects:
    - my-gcp-project
    - my-other-project
    projectLevelOfDetails:
      my-gcp-project: detailed
      my-other-project: none
```

The native `gcpapi` backend is also **generation-rule-driven**: within an
in-scope project it only collects the resource types your loaded generation
rules reference (plus the mandatory `gcp_projects` anchor).

## GKE Cluster Discovery

When using GCP credentials to discover Kubernetes resources in GKE clusters,
configure clusters under `gkeClusters` in the workspaceInfo.yaml `cloudConfig.gcp`
block. This follows the same **discovery-time kubeconfig generation** pattern as
Azure AKS (`aksClusters`) and AWS EKS (`eksClusters`): at discovery time RunWhen
Local builds a kubeconfig for each cluster directly from your GCP service account
and merges them into `~/.kube/gke-kubeconfig` (picked up alongside the other
generated kubeconfigs), so the Kubernetes indexer can scan them. You no longer
need to mount an explicit `cloudConfig.kubernetes.kubeconfigFile`.

This path uses the **native Google SDKs — there is no `gcloud` dependency**.
RunWhen Local calls the GKE Container API
(`google-cloud-container`'s `ClusterManagerClient`) to fetch each cluster's
API-server endpoint and CA certificate, then mints a short-lived OAuth bearer
token from the service account (`google-auth`) and writes it straight into the
kubeconfig. The container image does **not** ship the `gcloud` CLI for this
purpose, and the `gke-gcloud-auth-plugin` exec flow is deliberately avoided.

{% hint style="info" %}
This is distinct from the **runtime** `custom.gke_clusters` secret-provider
configuration (see the GCP extras guide). `gkeClusters` controls how RunWhen
Local builds the kubeconfig **during discovery** (to enumerate namespaces and
workloads); `custom.gke_clusters` plus the `gcp-kubernetes-auth.yaml` /
`gcp:sa@kubeconfig:...` templates control how generated tasks **re-authenticate**
to GKE **at task-execution time**. They are separate features and do not share
code.
{% endhint %}

### Explicit Configuration

List each GKE cluster explicitly when `autoDiscover` is `false` or omitted. Each
cluster needs a `name` (used verbatim as the kubeconfig context name) and a
`location` (a zone such as `us-central1-a` for zonal clusters, or a region such
as `us-central1` for regional clusters — the Container API treats both
identically). Per-cluster Level of Detail can be set just like AKS/EKS:

```yaml
cloudConfig:
  # No cloudConfig.kubernetes block needed -- the kubeconfig is generated.
  gcp:
    applicationCredentialsFile: /shared/gcp.secret   # or saSecretName / serviceAccountKey / ADC
    projects:
    - my-gcp-project
    gkeClusters:
      autoDiscover: false
      clusters:
        - name: sandbox-cluster-1
          location: us-central1-a          # zone (zonal) or region (regional)
          projectId: my-gcp-project         # optional; falls back to the workspace project
          defaultNamespaceLOD: basic        # optional per-cluster default LOD for its namespaces
          namespaceLODs:                    # optional per-namespace overrides
            kube-system: none
        - name: prod-cluster
          location: us-east1                # regional cluster
          projectId: my-other-project       # optional; defaults to the gcp project
          defaultNamespaceLOD: detailed
```

#### Per-cluster Level of Detail

`defaultNamespaceLOD` and `namespaceLODs` are honored for GKE exactly as they are
for AKS and EKS: a cluster's `defaultNamespaceLOD` sets the default LOD for every
namespace in **that** cluster, and `namespaceLODs` overrides individual
namespaces within it. These per-cluster values take precedence over the global
`defaultLOD` for the cluster's namespaces. Valid values are `detailed`, `basic`,
and `none`.

### Auto-Discovery

Enable `autoDiscover: true` to enumerate all GKE clusters visible to the
authenticated credentials. RunWhen Local lists them through the Container API
(`ClusterManagerClient.list_clusters` over `projects/<project>/locations/-`,
which spans every zone and region) — again, **no `gcloud`**:

```yaml
cloudConfig:
  gcp:
    applicationCredentialsFile: /shared/gcp.secret
    projects:
    - my-gcp-project
    gkeClusters:
      autoDiscover: true
      discoveryConfig:
        projectId: my-gcp-project   # optional; defaults to the gcp project
```

Explicitly listed `clusters` are always included and merged with anything
discovered (explicitly named clusters are de-duplicated against the discovered
set). Auto-discovery requires the service account to have the
`container.clusters.list`/`get` permissions (e.g. the
`roles/container.viewer` role).

## Configuration reference

| Field | Scope | Description |
| ----- | ----- | ----------- |
| `gcpIndexerBackend` | top-level | `gcpapi` (default) or `cloudquery` (legacy/fallback). Env: `WB_GCP_INDEXER_BACKEND` |
| `resourceStoreBackend` | top-level | Where discovered resources are persisted: `sqlite` (default) or `memory`. Env: `WB_RESOURCE_STORE_BACKEND` |
| `applicationCredentialsFile` | `cloudConfig.gcp` | Path to a mounted service-account JSON key |
| `serviceAccountKey` | `cloudConfig.gcp` | Inline service-account key (raw JSON or base64) |
| `saSecretName` | `cloudConfig.gcp` | Name of a Kubernetes secret holding `serviceAccountKey` / `projectId` |
| `projects` | `cloudConfig.gcp` | List of project IDs to discover |
| `projectId` | `cloudConfig.gcp` | Single project ID (alternative to `projects`) |
| `projectLevelOfDetails` | `cloudConfig.gcp` | Per-project LOD map: `detailed` / `basic` / `none` |
| `includeTags` / `excludeTags` | `cloudConfig.gcp` | Optional label-based include/exclude filters |
| `gkeClusters` | `cloudConfig.gcp` | GKE discovery-time kubeconfig generation via the native Google SDKs, no `gcloud` (see [GKE Cluster Discovery](#gke-cluster-discovery)) |
| `gkeClusters.autoDiscover` | `cloudConfig.gcp.gkeClusters` | Auto-enumerate GKE clusters via the Container API (`list_clusters` over all locations) (default: false) |
| `gkeClusters.clusters[].name` | `cloudConfig.gcp.gkeClusters` | Cluster name; used verbatim as the kubeconfig context name |
| `gkeClusters.clusters[].location` | `cloudConfig.gcp.gkeClusters` | Cluster zone or region (also accepts `zone` / `region`) |
| `gkeClusters.clusters[].projectId` | `cloudConfig.gcp.gkeClusters` | Optional per-cluster project ID; falls back to the workspace project |
| `gkeClusters.clusters[].defaultNamespaceLOD` | `cloudConfig.gcp.gkeClusters` | Per-cluster default LOD for that cluster's namespaces (`detailed` / `basic` / `none`) |
| `gkeClusters.clusters[].namespaceLODs` | `cloudConfig.gcp.gkeClusters` | Per-namespace LOD overrides within that cluster |
| `gkeClusters.discoveryConfig.projectId` | `cloudConfig.gcp.gkeClusters` | Project to enumerate when `autoDiscover: true` (defaults to the gcp project) |

## Cloud Asset Inventory (optional accelerator)

When using the native `gcpapi` backend, the supported **functional baseline** is
the per-service typed `google-cloud-*` SDK collectors (plus the synthesized
`gcp_projects` anchor): the **12** high-value types are discovered using only
the relevant per-service viewer roles
(compute / storage / container / pubsub / iam), **with or without** Cloud Asset
Inventory.

**Cloud Asset Inventory (CAI)** is an **optional** accelerator that *broadens*
coverage. The registry tracks **404** resource tables; **403** are discoverable
via CAI, of which **390** are served **only** by CAI. Enabling CAI adds those
390 long-tail types; it is **not required** for the baseline.

If the service account lacks `roles/cloudasset.viewer` (or the
`cloudasset.googleapis.com` API is disabled), discovery runs **normally** on the
typed baseline: the indexer logs an **informational** `GCP_CAI_PERMISSION_DENIED`
note (not an error) and simply skips the 390 CAI-only types. No action is needed.

For the permission matrix, the exact list of typed types, the deferred CAI-only
types (`gcp_sql_instances`, `gcp_run_services`), and the optional `gcloud`
enable/grant commands, see
[GCP indexer → discovery tiers](../../authoring/indexed-resources/gcp.md#discovery-tiers-the-typed-baseline-and-the-optional-cai-accelerator).

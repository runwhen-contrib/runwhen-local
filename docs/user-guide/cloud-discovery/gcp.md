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
gcpIndexerBackend: gcpapi   # or: cloudquery (default)
```

* **`cloudquery`** (default): runs the
  [CloudQuery GCP plugin](https://hub.cloudquery.io/plugins/source/cloudquery/gcp)
  against the configured project(s).
* **`gcpapi`**: the native indexer — first-party `google-cloud-*` SDK collectors
  as its functional baseline, plus an optional Google Cloud Asset Inventory (CAI)
  accelerator, with no CloudQuery binary or `gcloud` subprocesses.

Both backends expose the **same** generation-rule contract (the CloudQuery
table name is the `resource_type`), so rules don't change when you flip the
backend. The `gcpapi` baseline needs only per-service viewer roles; Cloud Asset
Inventory is an optional add-on — see
[Cloud Asset Inventory (optional accelerator)](#cloud-asset-inventory-optional-accelerator)
below.

You can optionally select where discovered resources are persisted with the
top-level `resourceStoreBackend` (e.g. `sqlite` or `memory`):

```yaml
gcpIndexerBackend: gcpapi
resourceStoreBackend: sqlite
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

## Configuration reference

| Field | Scope | Description |
| ----- | ----- | ----------- |
| `gcpIndexerBackend` | top-level | `cloudquery` (default) or `gcpapi`. Env: `WB_GCP_INDEXER_BACKEND` |
| `resourceStoreBackend` | top-level | Where discovered resources are persisted, e.g. `sqlite`, `memory` |
| `applicationCredentialsFile` | `cloudConfig.gcp` | Path to a mounted service-account JSON key |
| `serviceAccountKey` | `cloudConfig.gcp` | Inline service-account key (raw JSON or base64) |
| `saSecretName` | `cloudConfig.gcp` | Name of a Kubernetes secret holding `serviceAccountKey` / `projectId` |
| `projects` | `cloudConfig.gcp` | List of project IDs to discover |
| `projectId` | `cloudConfig.gcp` | Single project ID (alternative to `projects`) |
| `projectLevelOfDetails` | `cloudConfig.gcp` | Per-project LOD map: `detailed` / `basic` / `none` |
| `includeTags` / `excludeTags` | `cloudConfig.gcp` | Optional label-based include/exclude filters |

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

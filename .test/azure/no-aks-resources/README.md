# `no-aks-resources` Azure fixture

End-to-end fixture for validating the native `azureapi` indexer's selective-indexing behavior against live Azure infrastructure, **without** provisioning an AKS cluster. Uses cheap, fast-to-deploy resources (resource groups, storage accounts, vnet, NSG, key vault) so the indexer's filter logic can be exercised without the cost or wait time of a full multi-subscription AKS fixture.

## What it provisions

Two resource groups in a single subscription:

| Resource group        | Tags                              | Purpose |
| --------------------- | --------------------------------- | ------- |
| `rwl-azapi-keep-rg-*` | `project=rwl-azureapi-fixture`, `purpose=in-scope`     | Should always be discovered. Holds a storage account, a vnet, a subnet, an NSG, and a key vault. |
| `rwl-azapi-drop-rg-*` | `project=rwl-azureapi-fixture`, `purpose=out-of-scope` | Used to assert the indexer drops out-of-scope resources. Holds a storage account. |

The `*` suffix is a 6-character random string regenerated each `terraform apply` so concurrent runs don't collide.

## Prerequisites

1. **Azure subscription + service principal** with at least Reader on the target subscription. The SP also needs `Microsoft.KeyVault/vaults/write` to provision the key vault; see `terraform/main.tf` for the exact resource set.
2. **`terraform/tf.secret`** must export the credentials. Symlinked to `../multi-subscription-aks/terraform/tf.secret` by default so any updates to those creds flow through automatically. To use different creds for this fixture, replace the symlink with a real file containing:
   ```bash
   export TF_VAR_subscription_id=...
   export AZ_TENANT_ID=...
   export TF_VAR_tenant_id=$AZ_TENANT_ID
   export AZ_CLIENT_ID=...
   export AZ_CLIENT_SECRET=...
   export TF_VAR_sp_principal_id=$(az ad sp list --filter "appId eq '$AZ_CLIENT_ID'" --query '[0].id' -o tsv)
   ```
3. **Tooling**: `terraform`, `task`, `docker buildx` with a builder named `mybuilder`, `sqlite3`, `jq`, `python3`. The repo's `src/Dockerfile` is built locally as `runwhen-local:test`.

## Quick start

```bash
# Provision infra (once).
task build-infra

# Run the selective-indexing assertion (default).
task ci-test-azureapi-selective

# Tear down.
task clean
```

## CI tests

Each test generates a `workspaceInfo.yaml` tailored to its scenario, runs RWL discovery in a container, then queries the on-disk `output/resources.sqlite` and the indexer logs.

| Task                              | Scenario                                                                                                              | Pass criteria |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------- |
| `ci-test-azureapi-baseline`       | `defaultLOD: detailed`. Indexer uses subscription-wide list endpoints.                                                | Every provisioned resource is in `resources.sqlite`. |
| `ci-test-azureapi-selective`      | `defaultLOD: none` + per-RG override whitelisting `keep-rg` (detailed). Triggers selective discovery.                 | Indexer logs `selective discovery, in-scope RGs=[keep-rg-...]`; `keep-rg` and its resources present; `drop-rg` + its storage absent; `list_by_resource_group` is the only non-RG SDK call. |
| `ci-test-azureapi-tag-filter`     | `defaultLOD: detailed`, `excludeTags: { purpose: out-of-scope }`. Subscription-wide list + post-filter.               | The drop-rg storage is absent; the keep-rg storage is present; indexer logs show `skipped_tag_filter > 0`. |
| `ci-test-azureapi-equivalence`    | Runs the same baseline workspace once with `azureIndexerBackend: cloudquery` and once with `azureapi`, then diffs `resource-dump.yaml`. | Diff is empty (uses `multi-subscription-aks/diff_resource_dump.py` if available). |

### Discovery modes

The indexer picks one of two strategies per subscription based on the workspaceInfo it's given:

* **Selective discovery** — fires when the workspace declares a finite scope: `defaultLOD: none`, no non-NONE wildcard (`*`), and an explicit list of per-RG `detailed`/`basic` overrides. The indexer enumerates resource groups once (subscription-wide list, post-filtered to the in-scope set), then calls `list_by_resource_group(rg_name)` for each whitelisted RG. **Out-of-scope RGs are never enumerated** — the SDK is never asked about them. This is what makes selectivity real: zero spend on resources you don't want.
* **Subscription-wide discovery** — fires when *any* of the escape hatches is non-NONE (workspace `defaultLOD`, per-subscription `defaultLOD`, or wildcard `resourceGroupLevelOfDetails["*"]`). The indexer calls `list_all()` and post-filters via `skipped_lod_filter` for any explicitly NONE-marked RGs.

The indexer logs which mode it chose for each subscription at startup, e.g.:

```
INFO: Azure subscription <id>: selective discovery, in-scope RGs=['rwl-azapi-keep-rg-*'].
INFO: Selective discovery: listing azure_storage_accounts per-RG in subscription <id> (in-scope RGs=['rwl-azapi-keep-rg-*'])
```

### Observable counters

The indexer prints a single summary line per run:

```
Azure SDK indexing complete: discovered=N, added=N,
skipped_tag_filter=N, skipped_lod_filter=N, skipped_rg_not_found=N,
skipped_parse_error=N, skipped_collector_error=N
```

* `skipped_lod_filter` — resources dropped because effective LOD resolved to NONE. In selective mode this only fires for the resource-group enumeration step (RGs themselves can't be discovered per-RG). For non-RG types in selective mode it stays 0 because we never list out-of-scope RGs.
* `skipped_rg_not_found` — workspace whitelisted an RG that doesn't exist in Azure; the per-RG SDK call returned 404. Non-fatal.
* `skipped_tag_filter` — `excludeTags`/`includeTags` rejections.
* `skipped_collector_error` — SDK call failed with anything that isn't a 404; the type is skipped for that subscription.

## What the assertions actually check

* **`resources.sqlite` rows.** Each test queries the `resources` table directly:
  ```sql
  SELECT count(*) FROM resources WHERE platform='azure' AND name=?;
  ```
  This is the persisted store the explorer UI / API consume, so absence here is the strongest signal that the indexer dropped a resource.

* **Indexer log line.** The Azure SDK indexer prints a single summary line at the end of each run:
  ```
  Azure SDK indexing complete: discovered=N, added=N,
  skipped_tag_filter=N, skipped_lod_filter=N,
  skipped_parse_error=N, skipped_collector_error=N
  ```
  The fixture greps `run_sh_output.log` and `container_logs.log` for this line and sanity-checks the relevant counter is non-zero.

## Adding a new scenario

1. Add a `generate-<name>-config` task that writes a workspaceInfo.yaml variant.
2. Add an `assert-<name>` task that queries `output/resources.sqlite` and the indexer logs.
3. Add a `ci-test-azureapi-<name>` task that wires generate ⇒ build ⇒ run ⇒ assert.

Keep the assertion logic in shell - readability matters more than DRY when the failure mode is "explain what's wrong with this RWL deployment".

## Cleanup

`task clean` runs `terraform destroy` (safe even if no infra is deployed) and removes the local `output/`, `workspaceInfo.yaml`, and run logs.

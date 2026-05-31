# Azure indexer

The native Azure indexer (`azureapi`) discovers Azure resources via the
official Microsoft `azure-mgmt-*` Python SDKs and ships full coverage of
the Azure resource catalog. This page is the authoritative reference for
**what gets indexed** and **what data your generation rules will see**.

For the engineering deep dive (dispatch, selective discovery, how to add
a new typed collector), see
[Azure indexer internals](../../architecture/azure-indexer-internals.md).

> [!NOTE]
> `azureapi` is now the **default** backend. A second `cloudquery` backend
> exists for legacy reasons but is being phased out; set
> `azureIndexerBackend: cloudquery` only if you need to opt back into it.

## How to enable

`azureapi` is the default, so no backend key is required. To pin it explicitly
(or to opt into the legacy `cloudquery` backend) set `azureIndexerBackend` in
your `workspaceInfo.yaml`:

```yaml
azureIndexerBackend: azureapi   # default; use 'cloudquery' for the legacy path
cloudConfig:
  azure:
    tenantId:     ${AZ_TENANT_ID}
    clientId:     ${AZ_CLIENT_ID}
    clientSecret: ${AZ_CLIENT_SECRET}
    subscriptionId: <your-sub-id>
    defaultLOD: detailed
    # Or 'none' + per-RG overrides for selective mode.
```

Any of the three credential fields may be omitted to fall back to
`DefaultAzureCredential` (managed identity, az CLI cache, env vars). If
*some* are populated and *some* are blank, the indexer fails fast with a
clear error rather than silently falling back.

## What can be indexed

Every Azure resource type that the CloudQuery Azure plugin tabulates is
indexable by the native indexer too — **619 resource types total**, full
parity with the legacy backend. The full sortable catalog lives at
[`azure-resource-catalog.md`](./azure-resource-catalog.md); the rest of
this page covers the model.

Indexable types fall into two tiers:

### Typed (rich-payload) tier

Hand-written `azure-mgmt-*` collectors that return the full SDK model
for each resource. Use these when your generation rules need to match
against `properties.*` (status, configuration, network rules,
diagnostics, etc.).

| CloudQuery table name | ARM type | Aliases |
| --- | --- | --- |
| `azure_resources_resource_groups` | `Microsoft.Resources/resourceGroups` | `resource_group` |
| `azure_subscription_subscriptions` | `Microsoft.Subscription/subscriptions` | - |
| `azure_compute_virtual_machines` | `Microsoft.Compute/virtualMachines` | `virtual_machine` |
| `azure_compute_disks` | `Microsoft.Compute/disks` | - |
| `azure_compute_snapshots` | `Microsoft.Compute/snapshots` | - |
| `azure_compute_virtual_machine_scale_sets` | `Microsoft.Compute/virtualMachineScaleSets` | - |
| `azure_storage_accounts` | `Microsoft.Storage/storageAccounts` | - |
| `azure_keyvault_keyvaults` | `Microsoft.KeyVault/vaults` | `azure_keyvault_vaults`, `azure_keyvault_keyvault` |
| `azure_network_virtual_networks` | `Microsoft.Network/virtualNetworks` | - |
| `azure_network_security_groups` | `Microsoft.Network/networkSecurityGroups` | - |
| `azure_network_load_balancers` | `Microsoft.Network/loadBalancers` | - |
| `azure_network_application_gateways` | `Microsoft.Network/applicationGateways` | - |
| `azure_containerservice_managed_clusters` | `Microsoft.ContainerService/managedClusters` | - |
| `azure_containerregistry_registries` | `Microsoft.ContainerRegistry/registries` | - |
| `azure_appservice_plans` | `Microsoft.Web/serverFarms` | - |
| `azure_appservice_web_apps` | `Microsoft.Web/sites` | - |
| `azure_mysql_servers` | `Microsoft.DBforMySQL/servers` | - |
| `azure_mysqlflexibleservers_servers` | `Microsoft.DBforMySQL/flexibleServers` | - |
| `azure_postgresql_databases` | `Microsoft.DBforPostgreSQL/servers/databases` | walks parent servers |
| `azure_redis_caches` | `Microsoft.Cache/Redis` | - |
| `azure_servicebus_namespaces` | `Microsoft.ServiceBus/namespaces` | - |
| `azure_datafactory_factories` | `Microsoft.DataFactory/factories` | - |
| `azure_apimanagement_service` | `Microsoft.ApiManagement/service` | - |
| `azure_cosmos_sql_databases` | `Microsoft.DocumentDB/databaseAccounts/sqlDatabases` | walks parent accounts |
| `azure_azurearcdata_sql_server_instances` | `Microsoft.AzureArcData/sqlServerInstances` | - |

### Generic (basic-envelope) tier

Every other registry entry — covered by a single catch-all that calls
`ResourceManagementClient.resources.list()` once per subscription (or
once per resource group in selective mode) and routes each
`GenericResource` back to its registry entry by ARM type. No extra
configuration is required; gen rules referencing any registered type
"just work".

The full list — 594 types today, sorted by service — is in
[`azure-resource-catalog.md`](./azure-resource-catalog.md).

## What the data looks like

After collection, every resource is normalized into a flat dict so that
downstream code (parsers, generation rules, the resource store) doesn't
care which tier produced it.

**Common fields (always present)**:

```yaml
id: /subscriptions/<sub>/resourceGroups/<rg>/providers/<arm-type>/<name>
name: <resource-name>
resource_type: azure_<service>_<entity>     # canonical RWL name
subscription_id: <sub>
resource_group: <rg>                        # extracted from id
location: <azure-region>
tags: {}                                    # always a dict
sku: { ... }                                # when the resource exposes one
identity: { ... }                           # when the resource has a managed identity
kind: <string>                              # storage account kind, web app kind, etc.
managed_by: <arm-id>                        # when set
```

**Typed-tier-only fields**:

```yaml
properties:                                 # full SDK payload, verbatim
  <every field the SDK model exposes>
plan: { ... }                               # rare; some marketplace resources
```

The exact contract is pinned by tests in
`src/indexers/test_azureapi_normalizers.py`.

> [!IMPORTANT]
> Generic-tier resources do **not** carry `properties`. The Azure ARM
> Resources API doesn't expand them in list calls. If a generation rule
> needs to match on `properties.*` for a non-typed type, request a typed
> collector be added — see
> [adding a new typed collector](../../architecture/azure-indexer-internals.md#adding-a-new-typed-collector).

### Per-type highlights (typed tier)

A handful of typed types have idiosyncratic shapes worth knowing about:

* `azure_storage_accounts.properties.primaryEndpoints` - the public URLs
  for blob/queue/table/file. Useful for runbook templates.
* `azure_keyvault_keyvaults.properties.vaultUri` - the data-plane URL.
* `azure_compute_virtual_machines.properties.storageProfile.osDisk.managedDisk.id` -
  ARM ID of the OS disk. You can join against `azure_compute_disks` to
  write rules that pull both VM and disk into a single SLX.
* `azure_postgresql_databases.id` - includes the parent server segment
  (`/.../servers/<server-name>/databases/<db-name>`); the parent name
  is exposed as `properties.parentName` for convenience.
* `azure_subscription_subscriptions` - emitted exactly once per
  configured subscription, regardless of LOD. The `name` field is the
  subscription's display name; `id` is `/subscriptions/<sub>`.

## Selective discovery

When the workspace declares `defaultLOD: none` plus a per-RG whitelist,
the indexer skips the subscription-wide list endpoints (typed *and*
generic) and calls the per-RG variants instead. This keeps API budget
and latency bounded on large subscriptions.

```yaml
cloudConfig:
  azure:
    subscriptionId: my-sub
    defaultLOD: none
    subscriptions:
      - subscriptionId: my-sub
        defaultLOD: none
        resourceGroupLevelOfDetails:
          rg-prod:    detailed
          rg-staging: basic
          rg-legacy:  none      # explicit deny
```

In that example the indexer enumerates only `rg-prod` and `rg-staging`
across every supported type (typed and generic). `rg-legacy` is
excluded entirely; everything else in the subscription is invisible.

Two types ignore selective scoping by design:

* `azure_resources_resource_groups` — we always need the full RG list
  to compute scope in the first place.
* `azure_subscription_subscriptions` — one subscription resource per
  configured subscription, period.

## When the typed and generic passes overlap

The dispatcher runs the typed pass first, tracks every ARM ID it
emitted, and then runs the generic pass with two filters:

1. ARM types owned by the typed pass are skipped wholesale (a generic
   row would just be a sparser copy of one we already wrote).
2. ARM types not referenced by any loaded generation rule are dropped
   (the indexer is gen-rule-driven; we don't balloon the resource
   store with unused rows).

Net effect: every type the contrib CodeBundles reference is indexed
exactly once, with the richest payload available.

## Adding a new typed collector

When you need a richer payload for a resource type that's currently in
the generic tier, promote it to typed:

1. Implement `_collect_<type>_all` and `_collect_<type>_in_rg` in
   `src/indexers/azureapi_resource_types.py`.
2. Register the pair in `_TYPED_COLLECTORS`.
3. Add the table name to `typed_collectors:` in
   `scripts/azure/azure_resource_type_overrides.yaml`.
4. Re-run `scripts/azure/sync_azure_resource_type_registry.py`.
5. Re-run `scripts/azure/dump_azure_resource_catalog.py` to refresh
   this page's sibling catalog.
6. Update unit tests in
   `src/indexers/test_azure_resource_type_registry.py::test_typed_collectors_present`.

The full mechanical recipe (with examples) is in
[Azure indexer internals](../../architecture/azure-indexer-internals.md#adding-a-new-typed-collector).

## See also

* [Azure resource catalog](./azure-resource-catalog.md) — sortable table of all 619 indexable types.
* [Azure cloud-discovery user guide](../../user-guide/cloud-discovery/azure.md) — credentials, `workspaceInfo.yaml` snippets, troubleshooting auth.
* [Generation rules: examples](../generation-rules/examples/) — worked examples that match Azure resources.
* [Azure indexer internals](../../architecture/azure-indexer-internals.md) — engineering deep dive.

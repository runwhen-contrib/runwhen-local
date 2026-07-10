# Azure indexed resources

When you write a generation rule, you tell the workspace builder which cloud
resources to match by listing one or more resource types under
`resourceTypes`. This page lists the resource types the Azure indexer
discovers, the names that work, and a working match rule example.

A transition from CloudQuery resource names to the native `azureapi` indexer
names is underway — the alias column lists the legacy CloudQuery names which
will be deprecated. **619 resource types total** — 25 typed (rich
`properties`), 594 generic (basic envelope). [Full catalog →](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/authoring/indexed-resources/azure-resource-catalog.md)

## Commonly used resource types

| Resource type | Aliases | Notes |
|---|---|---|
| `azure_compute_virtual_machines` | `virtual_machine` | |
| `azure_compute_disks` | — | |
| `azure_compute_snapshots` | — | |
| `azure_compute_virtual_machine_scale_sets` | — | |
| `azure_storage_accounts` | — | `properties.primaryEndpoints.*` |
| `azure_keyvault_keyvaults` | `azure_keyvault_vaults`, `azure_keyvault_keyvault` | `properties.vaultUri` |
| `azure_network_virtual_networks` | — | |
| `azure_network_security_groups` | — | |
| `azure_network_load_balancers` | — | |
| `azure_network_application_gateways` | — | |
| `azure_containerservice_managed_clusters` | — | (AKS) |
| `azure_containerregistry_registries` | — | |
| `azure_appservice_web_apps` | — | |
| `azure_appservice_plans` | — | |
| `azure_mysql_servers` | — | |
| `azure_mysqlflexibleservers_servers` | — | |
| `azure_postgresql_databases` | — | parent server in properties |
| `azure_redis_caches` | — | |
| `azure_servicebus_namespaces` | — | |
| `azure_datafactory_factories` | — | |
| `azure_apimanagement_service` | — | |
| `azure_cosmos_sql_databases` | — | parent account in properties |
| `azure_azurearcdata_sql_server_instances` | — | |
| `azure_resources_resource_groups` | `resource_group` | always indexed |
| `azure_subscription_subscriptions` | — | anchor, always indexed |

## Built-in matchable properties

Every Azure resource carries these by default:

| Property | Value |
|---|---|
| `name` | Resource name |
| `tags`, `tag-keys`, `tag-values` | Azure tags |
| `resource_group` | Parent resource group name |
| `location` | Azure region |

Use `resource/<path>` to reach raw JSON fields — e.g.
`properties/storageProfile/osDisk/osType` or `properties/vaultUri`.

Typed resources carry their full SDK `properties` payload. Generic resources
carry **only** the basic envelope (id, name, type, location, tags, sku, kind,
identity) — no `properties`. To match on resource-specific fields, the type
needs a typed collector.

## Example match rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: azure
  generationRules:
    - resourceTypes:
        - virtual_machine
      matchRules:
        - type: and
          matches:
            - type: pattern
              properties: [tags]
              pattern: "production"
              mode: substring
            - type: pattern
              properties: ["resource/properties/storageProfile/osDisk/osType"]
              pattern: "Linux"
              mode: exact
      slxs:
        - baseName: vm-health
          qualifiers: [resource_group, name]
          baseTemplateName: azure-vm-health
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: runbook
```

> [!NOTE]
> 594 types are generic (basic envelope only: id, name, type, location, tags) — no
> `properties` for matching against resource-specific fields. Check the
> [full catalog](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/authoring/indexed-resources/azure-resource-catalog.md)
> for tier status. To get a richer payload for a generic type, a typed collector
> must be added; see
> [Azure indexer internals](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/architecture/azure-indexer-internals.md)
> for the recipe. For credential setup and workspace configuration, see the
> [cloud discovery user guide](../../user-guide/cloud-discovery/azure.md).
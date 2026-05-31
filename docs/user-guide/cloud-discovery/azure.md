# Microsoft Azure

{% hint style="info" %}
Microsoft Azure Discovery is supported from 0.5.0 onwards and supports discovery of resources **outside of Kubernetes,** such as VMs, load balancers, database instances, and so on. Kubernetes resources discovery configuration is covered in [getting-started.md](../user-guide/getting-started.md "mention")
{% endhint %}

## Azure Kubernetes Service Discovery

{% hint style="info" %}
Starting with 0.6.1, AKS Clusters can be discovered using Managed Identity or Service Principal authentication.&#x20;
{% endhint %}

AKS clusters can be discovered with credentials in the following ways:&#x20;

* Standard Kubeconfig (see [kubernetes-configuration.md](kubernetes-configuration.md "mention")) - This discovery method uses Kubernetes RBAC and has no integration or awareness of the supporting Azure resources
* Service Principal - Using Azure roles such as "Azure Kubernetes Service RBAC Reader"
* Managed Identity - Using Azure roles such as "Azure Kubernetes Service RBAC Reader"

When using Azure credentials to discover Kubernetes resources, list each cluster under `aksClusters` in the workspaceInfo.yaml `cloudConfig`

```
cloudConfig:
  kubernetes: null
  azure: 
    aksClusters:
      clusters:
        - name: [cluster_name]
          server: [https://cluster-address.hcp.region.azmk8s.io:443]
          resource_group: [resource_group_name]
```

## Azure Cloud Resource Discovery

Azure discovery builds up an inventory of cloud resources that gets matched with troubleshooting commands. RunWhen Local supports two backends for Azure resource discovery:

* **`azureapi`** (default) — Uses the native Azure management SDK (`azure-mgmt-*`) directly. Removes the CloudQuery process / binary requirement, integrates better with airgapped images, and is now the default backend for Azure (alongside the native AWS / GCP indexers).
* **`cloudquery`** (legacy/fallback) — Uses [cloudquery](https://github.com/cloudquery/cloudquery) with the Azure source plugin. Set `azureIndexerBackend: cloudquery` to opt back into this legacy path.

Both backends produce the same registry shape, so generation rules and SLX templates do not need to change when switching between them.

### Selecting the backend

Set `azureIndexerBackend` in `workspaceInfo.yaml`:

```yaml
azureIndexerBackend: azureapi   # default; use "cloudquery" for the legacy path

cloudConfig:
  azure:
    subscriptionId: "[subscription-id]"
    # ... rest of the existing azure config ...
```

When `azureIndexerBackend: azureapi` is set, the CloudQuery indexer skips Azure (it still runs for AWS / GCP if those are configured) and the native `azureapi` indexer takes over. When the value is omitted or set to `cloudquery`, behavior is unchanged from previous releases.

### Supported resource types (azureapi backend)

Out of the box the native backend can discover:

* `resource_group` (always)
* `virtual_machine`
* `azure_storage_accounts`
* `azure_network_virtual_networks`
* `azure_network_security_groups`
* `azure_keyvault_vaults`
* `azure_containerservice_managed_clusters`

Additional types can be added by registering a collector in `src/indexers/azureapi_resource_types.py`. If a generation rule references an Azure resource type with no registered collector under the `azureapi` backend, the build emits a warning and continues; under the legacy `cloudquery` backend the behavior is unchanged.

## Azure Credentials

Multiple authentication methods are available, including Service Principal and Managed Identity. If multiple authentication methods are available, the order is as follows:&#x20;

* Credentials specified in the `workspaceInfo.yaml` take precedence
* Credentials specified in the `spSecretName` are checked next
* If neither of the above exist, attempt to use Managed Identity &#x20;

#### Creating a Service Principal&#x20;

To create a service principal for use with RunWhen Local and the CloudQuery discovery component:&#x20;

```
export SUBSCRIPTION_ID=<YOUR_SUBSCRIPTION_ID>
az account set --subscription $SUBSCRIPTION_ID
az provider register --namespace 'Microsoft.Security'

# Create a service-principal for the plugin
az ad sp create-for-rbac --name runwhen-local-sp --scopes /subscriptions/$SUBSCRIPTION_ID --role Reader
```

The output of that command is then mapped into the [#azure-workspaceinfo-configuration](microsoft-azure.md#azure-workspaceinfo-configuration "mention") section as follows:&#x20;

* appID: clientId
* password:clientSecret
* tenant:tenantId

When using a Service Principal, the credential configuration can be set in the `workspaceInfo.yaml` as follows:&#x20;

```
cloudConfig:
  azure:
    subscriptionId: "[subscription-id]"
    tenantId: "[tenant-id]"
    clientId: "[client-id]"
    clientSecret: "[client-secret]"
```

This information can also be specified in a Kubernetes secret:&#x20;

```
cloudConfig:
  azure:
    spSecretName: [secret name]
```

The format of the secret is such that each configuration element is a specific key, for example:&#x20;

```
apiVersion: v1
data:
  clientId: *******************************
  clientSecret: *******************************
  subscriptionId: *******************************
  tenantId: *******************************
kind: Secret
metadata:
  name: azure-sp
  namespace: runwhen-local
type: Opaque
```



#### Using Managed Identity

When using Managed Identity, the pod will attempt to authenticate with the underlying Managed Identity. In this case, it's up to the Azure user to ensure that the Managed Identity of the pod (or the nodepool it is running on) has the necessary roles to perform discovery of the Azure resources that RunWhen should be aware of.&#x20;

### Azure CloudQuery Version Details

* Currently supported source plugin: [Azure 9.4.0](https://hub.cloudquery.io/plugins/source/cloudquery/azure/v9.4.0/docs?search=azure)
* Available resources: See [this link](https://hub.cloudquery.io/plugins/source/cloudquery/azure/v9.4.0/tables?search=azure)

### Additional Azure WorkspaceInfo Configurations

To perform discovery of Microsoft Azure resources, provide the appropriate Azure credentials inside of the workspaceInfo.yaml (as outlined above), and any additional configuration options. For example, the following configuration lists specific resource groups to discover, as well as a specific [level-of-detail.md](../configuration/level-of-detail.md "mention"). If left unspecified, RunWhen Local will attempt to discover all resource groups that is has access to.&#x20;

```
cloudConfig:
  azure:
    resourceGroupLevelOfDetails:
      resource-group1: basic
      resource-group2: detailed
```

The supported fields for Azure (block name = "azure") are:

| Field Name                  | Description                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| subscriptionId              | The subscription ID for the specified client/application ID                                          |
| tenantId                    | The tenant ID for the specified client/application ID                                                |
| clientId                    | The client/application ID to use to authenticate                                                     |
| clientSecret                | The client/application secret to use to authenticate                                                 |
| resourceGroupLevelOfDetails | Object/dictionary specifying level of detail values for specific resource groups                     |
| aksClusters                 | List of AKS clusters to discover using Azure credentials                                             |
| spSecretName                | The name of the local Kubernetes secret that contains the Service Principal authentication details.  |




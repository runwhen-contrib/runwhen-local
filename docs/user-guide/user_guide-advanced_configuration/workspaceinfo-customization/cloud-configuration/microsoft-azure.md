# Microsoft Azure

{% hint style="info" %}
Microsoft Azure Discovery is supported from 0.5.0 onwards and supports discovery of resources **outside of Kubernetes,** such as VMs, load balancers, database instances, and so on. Kubernetes resources discovery configuration is covered in [getting-started](../../../getting-started/ "mention")
{% endhint %}

### Azure Credentials

Azure discovery leverages [cloudquery](https://github.com/cloudquery/cloudquery) with the Azure source plugin to build up an inventory of cloud resources that should be matched with troubleshooting commands. &#x20;

It's recommended to create a service principal for use with RunWhen Local and the CloudQuery discovery component:&#x20;

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

### Azure CloudQuery Version Details

* Currently supported source plugin: [Azure 9.4.0](https://hub.cloudquery.io/plugins/source/cloudquery/azure/v9.4.0/docs?search=azure)
* Available resources: See [this link](https://hub.cloudquery.io/plugins/source/cloudquery/azure/v9.4.0/tables?search=azure)

### Azure WorkspaceInfo Configuration

To perform discovery of Microsoft Azure resources, provide the appropriate Azure credentials inside of the workspaceInfo.yaml under the `cloudConfig` section. For example:&#x20;

```
cloudConfig:
  azure:
    subscriptionId: "[subscription-id]"
    tenantId: "[tenant-id]"
    clientId: "[client-id]"
    clientSecret: "[client-secret]"
    resourceGroupLevelOfDetails:
      resource-group1: basic
      resource-group2: detailed
```

The supported fields for Azure (block name = "azure") are:

| Field Name                  | Description                                                                      |
| --------------------------- | -------------------------------------------------------------------------------- |
| subscriptionId              | The subscription ID for the specified client/application ID                      |
| tenantId                    | The tenant ID for the specified client/application ID                            |
| clientId                    | The client/application ID to use to authenticate                                 |
| clientSecret                | The client/application secret to use to authenticate                             |
| resourceGroupLevelOfDetails | Object/dictionary specifying level of detail values for specific resource groups |

The first four fields are necessary for authenticating to Azure to index/discover resources. The workspace builder uses CloudQuery under the covers to do the indexing for Azure. The documentation for the Azure plugin to CloudQuery (https://hub.cloudquery.io/plugins/source/cloudquery/azure/v11.4.2/docs) contains more information about those fields and how to generate them using the Azure CLI.

The resourceGroupLevelOfDetails fields is similar to the namespaceLODs field for the Kubernetes plugin. The key/field name is the name of the resource group and the value is the level of detail value.


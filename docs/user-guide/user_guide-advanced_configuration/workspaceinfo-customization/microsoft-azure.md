# Microsoft Azure

{% hint style="info" %}
Microsoft Azure Discovery is supported from 0.5.0 onwards.&#x20;
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




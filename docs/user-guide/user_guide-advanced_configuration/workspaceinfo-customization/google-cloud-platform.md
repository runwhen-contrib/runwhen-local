# Google Cloud Platform

{% hint style="info" %}
Google Cloud Platform discovery is supported from 0.5.0 onwards.&#x20;
{% endhint %}

### GCP Credentials

Google Cloud Platform discovery leverages [cloudquery](https://github.com/cloudquery/cloudquery) with the GCP source plugin to build up an inventory of cloud resources that should be matched with troubleshooting commands. &#x20;

It's recommended to create a service principal for use with RunWhen Local and the CloudQuery discovery component:&#x20;

```
export SUBSCRIPTION_ID=<YOUR_SUBSCRIPTION_ID>
az account set --subscription $SUBSCRIPTION_ID
az provider register --namespace 'Microsoft.Security'

# Create a service-principal for the plugin
az ad sp create-for-rbac --name runwhen-local-sp --scopes /subscriptions/$SUBSCRIPTION_ID --role Reader
```

The output of that command is then mapped into the [#azure-workspaceinfo-configuration](google-cloud-platform.md#azure-workspaceinfo-configuration "mention") section as follows:&#x20;

* appID: clientId
* password:clientSecret
* tenant:tenantId

### GCP CloudQuery Version Details

* Currently supported source plugin: [GCP v9.9.2](https://hub.cloudquery.io/plugins/source/cloudquery/gcp/v9.9.2/docs#configuration)
* Available resources: See [this link](https://hub.cloudquery.io/plugins/source/cloudquery/gcp/v9.9.2/tables)

### GCP WorkspaceInfo Configuration

To perform discovery of Microsoft Azure resources, provide the appropriate Azure credentials inside of the workspaceInfo.yaml under the `cloudConfig` section. For example:&#x20;

```
cloudConfig:
  gcp:
    applicationCredentialsFile: GCPServiceAccountKeyWorkspaceBuilder.json
    projects:
    - project1
    projectLevelOfDetails:
      project1: basic
```

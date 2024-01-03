# Google Cloud Platform

{% hint style="info" %}
Google Cloud Platform discovery is supported from 0.5.0 onwards.&#x20;
{% endhint %}

### GCP Credentials

Google Cloud Platform discovery leverages [cloudquery](https://github.com/cloudquery/cloudquery) with the GCP source plugin to build up an inventory of cloud resources that should be matched with troubleshooting commands. &#x20;

It's recommended to create a [service account ](https://cloud.google.com/iam/docs/service-accounts-create)for use with RunWhen Local and the CloudQuery discovery component:&#x20;

```
export PROJECT_ID=[project-id]
export KEY_FILE=GCPServiceAccountKeyWorkspaceBuilder.json
export SA_NAME=runwhen-local-sa
gcloud iam service-accounts create $SA_NAME \
    --description="Service Account for RunWhen Discovery" \
    --display-name="RunWhen Discovery Service Account"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/viewer"
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com
```

The output will be a service account file called `GCPServiceAccountKeyWorkspaceBuilder.json` which needs to be copied to the `shared` directory that is accessible to the RunWhen Local container image.&#x20;

### GCP CloudQuery Version Details

* Currently supported source plugin: [GCP v9.9.2](https://hub.cloudquery.io/plugins/source/cloudquery/gcp/v9.9.2/docs#configuration)
* Available resources: See [this link](https://hub.cloudquery.io/plugins/source/cloudquery/gcp/v9.9.2/tables)

### GCP WorkspaceInfo Configuration

To perform discovery of Google Cloud resources, provide the path to the GCP service account credentials inside of the workspaceInfo.yaml under the `cloudConfig` section. For example:&#x20;

```
cloudConfig:
  gcp:
    applicationCredentialsFile: /shared/GCPServiceAccountKeyWorkspaceBuilder.json
    projects:
    - [project-id]
    projectLevelOfDetails:
      [project-id]: basic
```

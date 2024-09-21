# Amazon Web Services

{% hint style="info" %}
AWS discovery is supported from 0.5.7 onwards.&#x20;
{% endhint %}

### AWS Credentials

AWS discovery leverages [cloudquery](https://github.com/cloudquery/cloudquery) with the AWS source plugin to build up an inventory of cloud resources that should be matched with troubleshooting commands. &#x20;

Workspace Builder requires the following AWS credentials:&#x20;

```
awsAccessKeyId
awsSecretAccessKey
```



### AWS CloudQuery Version Details

* Currently supported source plugin: AWS [v23.6.0](https://hub.cloudquery.io/plugins/source/cloudquery/aws/v23.6.0/docs)
* Available resources: See [this link](https://hub.cloudquery.io/plugins/source/cloudquery/aws/v23.6.0/tables)

### AWS WorkspaceInfo Configuration

To perform discovery of AWS resources, provide the AWS credentials inside of the workspaceInfo.yaml under the `cloudConfig` section. For example:&#x20;

```
cloudConfig:
  aws:
    awsAccessKeyId: 
    awsSecretAccessKey: 
```

The supported fields for aws (block name = "aws") are:

| Field Name         | Description                               |
| ------------------ | ----------------------------------------- |
| awsAccessKeyId     | The access key ID                         |
| awsSecretAccessKey | The secret associated with the access key |
|                    |                                           |

#### Level of Detail

To configure the specific Level of Detail (LoD)  that is collected with a discovered AWS resource, AWS tags can be applied to the resource. Currently there is no way to specific the LOD within the workspaceInfo.yaml.&#x20;

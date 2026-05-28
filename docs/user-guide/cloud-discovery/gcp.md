# Amazon Web Services

{% hint style="info" %}
AWS discovery is supported from 0.5.7 onwards.&#x20;
{% endhint %}

## AWS Credentials

AWS discovery leverages [cloudquery](https://github.com/cloudquery/cloudquery) with the AWS source plugin to build up an inventory of cloud resources that should be matched with troubleshooting commands.

### Authentication Methods

Multiple authentication methods are available, evaluated in the following priority order:

1. **Explicit Access Keys** - Credentials specified directly in `workspaceInfo.yaml`
2. **Kubernetes Secret** - Credentials stored in a Kubernetes secret (via `awsSecretName`)
3. **Workload Identity (IRSA)** - EKS IAM Roles for Service Accounts
4. **Assume Role** - IAM role assumption using default credential chain
5. **Default Credential Chain** - boto3 default credential provider (environment variables, AWS CLI profile, instance profile, etc.)

### AWS CloudQuery Version Details

* Currently supported source plugin: AWS [v23.6.0](https://hub.cloudquery.io/plugins/source/cloudquery/aws/v23.6.0/docs)
* Available resources: See [this link](https://hub.cloudquery.io/plugins/source/cloudquery/aws/v23.6.0/tables)

## AWS WorkspaceInfo Configuration

### Method 1: Explicit Access Keys

Provide AWS credentials directly in `workspaceInfo.yaml`:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    awsAccessKeyId: AKIA...
    awsSecretAccessKey: ...
    awsSessionToken: ...  # Optional, for temporary credentials
```

### Method 2: Kubernetes Secret

Store credentials in a Kubernetes secret and reference it:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    awsSecretName: aws-credentials
```

Create the Kubernetes secret with the following keys:
```bash
kubectl create secret generic aws-credentials \
  --from-literal=awsAccessKeyId=AKIA... \
  --from-literal=awsSecretAccessKey=... \
  --from-literal=region=us-east-1
```

### Method 3: Workload Identity (EKS IRSA)

For EKS clusters with IAM Roles for Service Accounts configured:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    useWorkloadIdentity: true
```

This automatically uses the `AWS_WEB_IDENTITY_TOKEN_FILE` and `AWS_ROLE_ARN` environment variables set by EKS.

### Method 4: Assume Role

Assume an IAM role using the default credential chain:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    assumeRoleArn: arn:aws:iam::123456789012:role/RunWhenDiscoveryRole
    assumeRoleExternalId: optional-external-id  # Optional
    assumeRoleSessionName: runwhen-local  # Optional, defaults to 'runwhen-local-session'
    assumeRoleDurationSeconds: 3600  # Optional, defaults to 3600
```

### Method 5: Default Credential Chain

If no explicit configuration is provided, the default boto3 credential chain is used:

```yaml
cloudConfig:
  aws:
    region: us-east-1
```

This will use credentials from (in order):
- Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- Shared credentials file (`~/.aws/credentials`)
- AWS config file (`~/.aws/config`)
- Instance profile (for EC2/ECS)

### Combined: Assume Role with Other Methods

Assume role can be combined with other authentication methods:

```yaml
# Explicit keys + assume role
cloudConfig:
  aws:
    awsAccessKeyId: AKIA...
    awsSecretAccessKey: ...
    assumeRoleArn: arn:aws:iam::TARGET_ACCOUNT:role/DiscoveryRole

# Kubernetes secret + assume role
cloudConfig:
  aws:
    awsSecretName: aws-credentials
    assumeRoleArn: arn:aws:iam::TARGET_ACCOUNT:role/DiscoveryRole
```

## Configuration Reference

| Field Name                | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| region                    | AWS region (default: us-east-1)                       |
| awsAccessKeyId            | Explicit access key ID                                |
| awsSecretAccessKey        | Explicit secret access key                            |
| awsSessionToken           | Session token for temporary credentials               |
| awsSecretName             | Name of Kubernetes secret containing credentials      |
| useWorkloadIdentity       | Enable EKS IRSA authentication (true/false)           |
| assumeRoleArn             | ARN of IAM role to assume                             |
| assumeRoleExternalId      | External ID for role assumption                       |
| assumeRoleSessionName     | Session name for role assumption                      |
| assumeRoleDurationSeconds | Duration for assumed role session (default: 3600)     |

## Level of Detail

To configure the specific Level of Detail (LoD) that is collected with a discovered AWS resource, AWS tags can be applied to the resource. Supported tag keys:

- `lod`
- `levelofdetail`
- `level-of-detail`

Example tag: `lod=detailed` or `lod=basic`

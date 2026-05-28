# Amazon Web Services

{% hint style="info" %}
AWS discovery is supported from 0.5.7 onwards and supports discovery of resources such as EC2 instances, S3 buckets, RDS databases, and more.
{% endhint %}

## AWS Cloud Resource Discovery

AWS discovery leverages [cloudquery](https://github.com/cloudquery/cloudquery) with the AWS source plugin to build up an inventory of cloud resources that should be matched with troubleshooting commands.

## AWS Credentials

Multiple authentication methods are available to access AWS resources. RunWhen Local evaluates authentication methods in the following priority order:

1. **Explicit Access Keys** - Credentials specified directly in `workspaceInfo.yaml`
2. **Kubernetes Secret** - Credentials stored in a Kubernetes secret (via `awsSecretName`)
3. **Workload Identity** - EKS IAM Roles for Service Accounts (IRSA) or EKS Pod Identity
4. **Assume Role** - IAM role assumption (can be combined with other methods)
5. **Default Credential Chain** - boto3 default credential provider chain

### Method 1: Explicit Access Keys

Provide AWS credentials directly in the `workspaceInfo.yaml` configuration:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    awsAccessKeyId: AKIA...
    awsSecretAccessKey: ...
    awsSessionToken: ...  # Optional, for temporary credentials
```

{% hint style="warning" %}
Store credentials securely. Consider using Kubernetes secrets or IAM roles instead of embedding credentials directly in configuration files.
{% endhint %}

**For codebundle access**, explicit credentials should be stored in a Kubernetes secret and referenced via the `custom` section:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    awsAccessKeyId: AKIA...
    awsSecretAccessKey: ...
custom:
  aws_credentials_secret_name: aws-explicit-credentials
```

Create the secret with the same credentials:
```bash
kubectl create secret generic aws-explicit-credentials \
  --from-literal=awsAccessKeyId=AKIA... \
  --from-literal=awsSecretAccessKey=... \
  --namespace runwhen-local
```

### Method 2: Kubernetes Secret

Store credentials in a Kubernetes secret and reference it in your configuration:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    awsSecretName: aws-credentials
```

Create the Kubernetes secret with the following format:

```bash
kubectl create secret generic aws-credentials \
  --from-literal=awsAccessKeyId=AKIA... \
  --from-literal=awsSecretAccessKey=... \
  --from-literal=region=us-east-1 \
  --namespace runwhen-local
```

The secret can also be created from a YAML manifest:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
  namespace: runwhen-local
type: Opaque
stringData:
  awsAccessKeyId: AKIA...
  awsSecretAccessKey: ...
  region: us-east-1
```

### Method 3: Workload Identity

RunWhen Local supports two types of EKS workload identity:

#### Method 3a: IRSA (IAM Roles for Service Accounts)

For EKS clusters with IRSA configured, RunWhen Local can use the pod's service account to authenticate:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    useWorkloadIdentity: true
```

This method automatically uses the `AWS_WEB_IDENTITY_TOKEN_FILE` and `AWS_ROLE_ARN` environment variables injected by EKS.

**Prerequisites:**
- EKS cluster with OIDC provider configured
- Service account annotated with IAM role ARN
- IAM role with trust relationship to the service account

Example service account annotation:
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: runwhen-local
  namespace: runwhen-local
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/RunWhenLocalRole
```

#### Method 3b: Pod Identity

{% hint style="info" %}
EKS Pod Identity is a newer, simpler alternative to IRSA. It's available in EKS 1.24+ and became GA in 2024.
{% endhint %}

For EKS clusters with Pod Identity configured:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    useWorkloadIdentity: true
```

Pod Identity is automatically detected via the `AWS_CONTAINER_CREDENTIALS_FULL_URI` environment variable.

**Prerequisites:**
- EKS 1.24+ with Pod Identity Agent addon enabled
- `PodIdentityAssociation` resource linking service account to IAM role
- IAM role with trust policy for `pods.eks.amazonaws.com`

**Key differences from IRSA:**
- ✅ No OIDC provider required
- ✅ No service account annotations needed
- ✅ Simpler IAM trust policy
- ✅ Uses EKS Pod Identity Agent addon

Example Pod Identity Association (created via Terraform/CloudFormation):
```hcl
resource "aws_eks_pod_identity_association" "runwhen_local" {
  cluster_name    = "my-eks-cluster"
  namespace       = "runwhen-local"
  service_account = "runwhen-local"
  role_arn        = "arn:aws:iam::123456789012:role/RunWhenLocalRole"
}
```

See `.test/aws/pod-identity-eks/` for complete infrastructure examples.

### Method 4: Assume Role

Assume an IAM role using credentials from any of the other authentication methods:

```yaml
cloudConfig:
  aws:
    region: us-east-1
    assumeRoleArn: arn:aws:iam::123456789012:role/RunWhenDiscoveryRole
    assumeRoleExternalId: optional-external-id  # Optional
    assumeRoleSessionName: runwhen-local  # Optional, defaults to 'runwhen-local-session'
    assumeRoleDurationSeconds: 3600  # Optional, defaults to 3600 (1 hour)
```

This is commonly used for:
- Cross-account access
- Least privilege access patterns
- Temporary credential scenarios

### Method 5: Default Credential Chain

If no explicit configuration is provided, RunWhen Local uses the boto3 default credential chain:

```yaml
cloudConfig:
  aws:
    region: us-east-1
```

The default chain checks credentials in the following order:
1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`)
2. Shared credentials file (`~/.aws/credentials`)
3. AWS config file (`~/.aws/config`)
4. Container credentials (ECS task role)
5. Instance profile (EC2 instance role)

### Combining Authentication Methods

Assume role can be combined with other authentication methods to enable cross-account access:

```yaml
# Example 1: Explicit keys + assume role
cloudConfig:
  aws:
    region: us-east-1
    awsAccessKeyId: AKIA...
    awsSecretAccessKey: ...
    assumeRoleArn: arn:aws:iam::TARGET_ACCOUNT:role/DiscoveryRole
    assumeRoleExternalId: shared-secret
custom:
  aws_credentials_secret_name: base-credentials  # Required for codebundle access

# Example 2: Kubernetes secret + assume role
cloudConfig:
  aws:
    region: us-east-1
    awsSecretName: base-aws-credentials
    assumeRoleArn: arn:aws:iam::TARGET_ACCOUNT:role/DiscoveryRole

# Example 3: Workload Identity (IRSA or Pod Identity) + assume role
cloudConfig:
  aws:
    region: us-east-1
    useWorkloadIdentity: true
    assumeRoleArn: arn:aws:iam::TARGET_ACCOUNT:role/DiscoveryRole
```

{% hint style="info" %}
When using explicit credentials with assume role, the base credentials must also be available in a Kubernetes secret (referenced via `custom.aws_credentials_secret_name`) so that codebundles can assume the target role at runtime.
{% endhint %}

## AWS CloudQuery Version Details

* Currently supported source plugin: AWS [v23.6.0](https://hub.cloudquery.io/plugins/source/cloudquery/aws/v23.6.0/docs)
* Available resources: See [tables documentation](https://hub.cloudquery.io/plugins/source/cloudquery/aws/v23.6.0/tables)

## EKS Cluster Discovery

When using AWS credentials to discover Kubernetes resources in EKS clusters, configure clusters under `eksClusters` in the workspaceInfo.yaml `cloudConfig`. This follows the same pattern as Azure AKS clusters.

### Explicit Configuration

List each EKS cluster explicitly when `autoDiscover` is `false` or omitted:

```yaml
cloudConfig:
  kubernetes: null  # Do not use generic kubernetes config for EKS
  aws:
    region: us-east-1
    useWorkloadIdentity: true  # or other auth method
    eksClusters:
      autoDiscover: false
      clusters:
        - name: my-eks-cluster
          server: https://ABC123.gr7.us-east-1.eks.amazonaws.com
          region: us-east-1
        - name: prod-eks-cluster
          server: https://XYZ456.gr7.us-west-2.eks.amazonaws.com
          region: us-west-2
```

### Auto-Discovery

Enable `autoDiscover: true` to automatically discover all EKS clusters in the configured region(s):

```yaml
cloudConfig:
  aws:
    region: us-east-1
    useWorkloadIdentity: true
    eksClusters:
      autoDiscover: true
      discoveryConfig:
        regions:
          - us-east-1
          - us-west-2
        # All discovered clusters will use the default LOD
```

**Benefits of auto-discovery:**
- No need to manually list each cluster
- Automatically picks up new clusters
- Can be combined with explicit cluster configurations
- Useful for development/testing environments

**When to use explicit configuration:**
- Production environments requiring strict control
- Limited subset of clusters should be discovered
- Different authentication methods per cluster

{% hint style="info" %}
Auto-discovery uses the configured AWS credentials to call `eks:ListClusters` and `eks:DescribeCluster` APIs in the specified regions. Ensure the IAM permissions include these actions.
{% endhint %}

## IAM Permissions

The AWS credentials used by RunWhen Local require specific IAM permissions to discover resources. At minimum, the following permissions are recommended:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "s3:List*",
        "s3:GetBucket*",
        "rds:Describe*",
        "elasticloadbalancing:Describe*",
        "cloudwatch:Describe*",
        "cloudwatch:Get*",
        "cloudwatch:List*",
        "iam:Get*",
        "iam:List*",
        "eks:ListClusters",
        "eks:DescribeCluster"
      ],
      "Resource": "*"
    }
  ]
}
```

For assume role scenarios, the trust policy must allow the base credentials:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::SOURCE_ACCOUNT:role/BaseRole"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "optional-external-id"
        }
      }
    }
  ]
}
```

## Level of Detail Configuration

RunWhen Local supports configuring the Level of Detail (LoD) for discovered AWS resources using AWS resource tags. This controls the granularity and number of troubleshooting commands generated for each resource.

Supported tag keys (case-insensitive):
- `lod`
- `levelofdetail`
- `level-of-detail`

Supported values:
- `basic` - Minimal set of troubleshooting commands
- `detailed` - Comprehensive set of troubleshooting commands

Example AWS resource tag:
```bash
aws ec2 create-tags --resources i-1234567890abcdef0 --tags Key=lod,Value=detailed
aws s3api put-bucket-tagging --bucket my-bucket --tagging 'TagSet=[{Key=lod,Value=basic}]'
```

If no LoD tag is specified, the default value from `workspaceInfo.yaml` is used:

```yaml
defaultLOD: detailed  # or basic
```

## Configuration Reference

The supported fields for AWS configuration (`cloudConfig.aws`) are:

| Field Name                | Type    | Required | Description                                           |
| ------------------------- | ------- | -------- | ----------------------------------------------------- |
| region                    | string  | No       | AWS region (default: us-east-1)                       |
| awsAccessKeyId            | string  | No       | Explicit access key ID                                |
| awsSecretAccessKey        | string  | No       | Explicit secret access key                            |
| awsSessionToken           | string  | No       | Session token for temporary credentials               |
| awsSecretName             | string  | No       | Name of Kubernetes secret containing credentials      |
| useWorkloadIdentity       | boolean | No       | Enable EKS Workload Identity (IRSA or Pod Identity) (default: false) |
| assumeRoleArn             | string  | No       | ARN of IAM role to assume                             |
| assumeRoleExternalId      | string  | No       | External ID for role assumption (security best practice) |
| assumeRoleSessionName     | string  | No       | Session name for role assumption (default: runwhen-local-session) |
| assumeRoleDurationSeconds | integer | No       | Duration for assumed role session in seconds (default: 3600, max: 43200) |
| eksClusters               | object  | No       | EKS cluster discovery configuration (see below)       |

### eksClusters Configuration

| Field Name       | Type    | Required | Description                                                 |
| ---------------- | ------- | -------- | ----------------------------------------------------------- |
| autoDiscover     | boolean | No       | Automatically discover all EKS clusters (default: false)    |
| clusters         | array   | No       | List of explicit EKS cluster configurations                 |
| discoveryConfig  | object  | No       | Configuration for auto-discovery (used when autoDiscover=true) |

### eksClusters.clusters[] Configuration

| Field Name | Type   | Required | Description                                    |
| ---------- | ------ | -------- | ---------------------------------------------- |
| name       | string | Yes      | EKS cluster name                               |
| server     | string | Yes      | EKS cluster API server endpoint                |
| region     | string | No       | Cluster region (defaults to global aws.region) |

### eksClusters.discoveryConfig Configuration

| Field Name | Type  | Required | Description                                      |
| ---------- | ----- | -------- | ------------------------------------------------ |
| regions    | array | No       | List of regions to discover clusters in          |

## Example Configurations

### Single Account Discovery

```yaml
workspaceName: aws-production-discovery
workspaceOwnerEmail: devops@example.com
defaultLocation: location-01
defaultLOD: detailed
cloudConfig:
  aws:
    region: us-east-1
    awsSecretName: aws-prod-credentials
codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/aws-c7n-codecollection"
    branch: "main"
```

### Multi-Account Discovery with Assume Role

```yaml
workspaceName: aws-multi-account
workspaceOwnerEmail: devops@example.com
defaultLocation: location-01
cloudConfig:
  aws:
    region: us-east-1
    useWorkloadIdentity: true
    assumeRoleArn: arn:aws:iam::987654321098:role/CrossAccountDiscoveryRole
    assumeRoleExternalId: secure-external-id
codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/aws-c7n-codecollection"
    branch: "main"
```

### Development Environment with Local Credentials

```yaml
workspaceName: aws-development
workspaceOwnerEmail: dev@example.com
defaultLocation: location-01
cloudConfig:
  aws:
    region: us-west-2
    # Uses default credential chain (AWS CLI profile, environment variables, etc.)
codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/aws-c7n-codecollection"
    branch: "main"
```

## Troubleshooting

### Authentication Failures

If you encounter authentication errors:

1. **Verify credentials are valid:**
```bash
# Test with AWS CLI
aws sts get-caller-identity --region us-east-1
```

2. **Check IAM permissions:**
```bash
# Test CloudQuery permissions
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::ACCOUNT:role/ROLE \
  --action-names ec2:DescribeInstances s3:ListAllMyBuckets
```

3. **Verify assume role trust relationships:**
```bash
aws iam get-role --role-name RunWhenDiscoveryRole
```

4. **Check RunWhen Local logs:**
```bash
kubectl logs -n runwhen-local deployment/runwhen-local --tail=100
```

### Common Issues

**Error: "Unable to locate credentials"**
- Ensure at least one authentication method is configured
- Verify Kubernetes secrets are in the correct namespace
- Check that environment variables are properly set

**Error: "AccessDenied" or "UnauthorizedOperation"**
- Review IAM permissions for the credentials or role being used
- Ensure the IAM policy includes necessary `Describe*`, `List*`, and `Get*` permissions

**Error: "AssumeRole failed"**
- Verify the assume role ARN is correct
- Check the trust policy allows the base credentials to assume the role
- Validate the external ID matches (if used)
- Ensure the assume role duration is within acceptable limits

### Debug Logging

Enable debug logging for AWS authentication issues:

```yaml
# In workspaceInfo.yaml or deployment configuration
env:
  - name: DEBUG_LOGGING
    value: "true"
```

## Additional Resources

- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [EKS IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)
- [AWS STS AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
- [CloudQuery AWS Plugin Documentation](https://hub.cloudquery.io/plugins/source/cloudquery/aws/latest/docs)

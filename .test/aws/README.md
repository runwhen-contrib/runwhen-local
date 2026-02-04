# AWS Authentication Tests

This directory contains test infrastructure and configurations for validating AWS authentication methods in RunWhen Local.

## Overview

RunWhen Local supports multiple AWS authentication methods, following patterns established for Azure and GCP:

| Auth Method | Auth Type | Configuration | Status |
|-------------|-----------|---------------|--------|
| Explicit Access Keys | `aws_explicit` | `awsAccessKeyId`, `awsSecretAccessKey` | Existing |
| Kubernetes Secret | `aws_secret` | `awsSecretName` | **New** |
| Assume Role | `aws_assume_role` | `assumeRoleArn` | **New** |
| Workload Identity (IRSA) | `aws_workload_identity` | `useWorkloadIdentity: true` | **New** |
| Default Credential Chain | `aws_default_chain` | (automatic fallback) | **New** |

## Test Directories

### `basic/`
Basic AWS discovery test using explicit access keys. This is the existing test case that validates the current AWS authentication.

### `secret-auth/`
Tests AWS authentication using credentials stored in a Kubernetes secret. Creates an IAM user with limited permissions and stores credentials in a K8s secret.

**Key files:**
- `terraform/main.tf` - Creates IAM user and access keys
- `workspaceInfo.yaml` - Uses `awsSecretName` configuration
- `Taskfile.yaml` - Automation for the full test workflow

### `assume-role/`
Tests AWS authentication using IAM role assumption (STS AssumeRole). Creates an IAM role with trust policy and external ID requirement.

**Key files:**
- `terraform/main.tf` - Creates assumable IAM role
- `workspaceInfo.yaml` - Uses `assumeRoleArn` and `assumeRoleExternalId`
- `Taskfile.yaml` - Includes `test-assume-role` task to verify setup

### `irsa-eks/`
Tests AWS authentication using EKS IAM Roles for Service Accounts (IRSA). Creates a full EKS cluster with OIDC provider and IRSA-enabled service account.

**Key files:**
- `terraform/main.tf` - Creates VPC, EKS cluster, and IRSA role
- `workspaceInfo.yaml` - Uses `useWorkloadIdentity: true` for IRSA
- `Taskfile.yaml` - Full EKS deployment and test workflow
- `values.yaml` - Helm values with IRSA annotation

**Note:** This test creates an EKS cluster which incurs hourly charges. Always run cleanup when done.

### `pod-identity-eks/`
Tests AWS authentication using EKS Pod Identity (newer alternative to IRSA, GA since 2024).

**Status**: ⚠️ Infrastructure ready, RunWhen Local code changes needed for full support.

**Key files:**
- `terraform/main.tf` - Creates EKS cluster with Pod Identity enabled
- `Taskfile.yaml` - Full EKS deployment and test workflow
- `values.yaml` - Helm values (no annotation needed for Pod Identity)

**Differences from IRSA:**
- ✅ No OIDC provider required
- ✅ Simpler setup - uses `PodIdentityAssociation` resource
- ✅ No service account annotations needed
- ✅ Requires EKS Pod Identity Agent addon
- ⚠️ RunWhen Local needs code updates to detect Pod Identity env vars

**What works now:**
- Infrastructure provisioning
- Pod Identity Agent installation
- IAM role creation and association

**What needs implementation in RunWhen Local:**
- Detection of `AWS_CONTAINER_CREDENTIALS_FULL_URI` in `aws_utils.py`
- Template updates for `workspaceKey` generation
- Documentation updates

See `pod-identity-eks/README.md` for details.

### `multi-account/`
Tests AWS authentication for multi-account scenarios. Creates multiple IAM roles simulating different accounts with varying permissions.

**Key files:**
- `terraform/main.tf` - Creates multiple roles with different policies
- `workspaceInfo.yaml` - Uses `accounts` array configuration
- `Taskfile.yaml` - Tests all roles and validates discovery

### `ecr-registry-sync/`
Tests ECR registry synchronization functionality. Not directly related to authentication but useful for testing ECR access.

## Running Tests

### Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.0.0
3. kubectl (for K8s secret and EKS tests)
4. Docker
5. Task (go-task.github.io)

### Quick Start

```bash
# Navigate to a test directory
cd secret-auth

# Deploy infrastructure
task build-terraform-infra

# Run the test
task default

# Cleanup
task cleanup
```

### CI Testing

Each test directory has a `ci-test` task that runs the full workflow:

```bash
task ci-test
```

## Configuration Schema

### Basic (Existing)

```yaml
cloudConfig:
  aws:
    awsAccessKeyId: "AKIA..."
    awsSecretAccessKey: "..."
    awsSessionToken: "..."  # Optional
```

### Kubernetes Secret (New)

```yaml
cloudConfig:
  aws:
    region: "us-east-1"
    awsSecretName: "aws-credentials"
```

Secret format:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
type: Opaque
data:
  awsAccessKeyId: <base64>
  awsSecretAccessKey: <base64>
  awsSessionToken: <base64>  # Optional
  region: <base64>           # Optional
```

### Assume Role (New)

```yaml
cloudConfig:
  aws:
    region: "us-east-1"
    assumeRoleArn: "arn:aws:iam::123456789012:role/MyRole"
    assumeRoleExternalId: "external-id"        # Optional
    assumeRoleSessionName: "my-session"        # Optional
    assumeRoleDurationSeconds: 3600            # Optional
```

### Workload Identity / IRSA (New)

```yaml
cloudConfig:
  aws:
    region: "us-east-1"
    useWorkloadIdentity: true
```

### Multi-Account (New)

```yaml
cloudConfig:
  aws:
    region: "us-east-1"
    accounts:
      - accountId: "111111111111"
        accountAlias: "production"
        assumeRoleArn: "arn:aws:iam::111111111111:role/discovery"
        regions:
          - "us-east-1"
          - "us-west-2"
      - accountId: "222222222222"
        accountAlias: "staging"
        assumeRoleArn: "arn:aws:iam::222222222222:role/discovery"
        regions:
          - "us-east-1"
```

## Authentication Priority

When multiple authentication options are configured, they are evaluated in this order:

1. **Explicit Access Keys** - If `awsAccessKeyId` and `awsSecretAccessKey` are present
2. **Kubernetes Secret** - If `awsSecretName` is present
3. **Workload Identity** - If `useWorkloadIdentity: true` or `AWS_WEB_IDENTITY_TOKEN_FILE` env var exists
4. **Assume Role** - If only `assumeRoleArn` is present (uses default chain for base credentials)
5. **Default Chain** - Fallback to boto3 default credential provider chain

## Related Documentation

- [AWS Authentication Enhancement Plan](../../docs/plans/aws-authentication-enhancement-plan.md)
- [Azure Authentication](../azure/) - Reference implementation
- [GCP Authentication](../gcp/) - Reference implementation

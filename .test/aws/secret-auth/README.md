# AWS Kubernetes Secret Authentication Test

This test validates AWS authentication using credentials stored in a Kubernetes secret.

## Authentication Method

- **Auth Type**: `aws_secret`
- **Configuration**: `awsSecretName` in workspaceInfo.yaml
- **K8s Secret Keys**: `awsAccessKeyId`, `awsSecretAccessKey`, `awsSessionToken` (optional)

## Prerequisites

1. AWS CLI configured with admin credentials
2. kubectl configured with target cluster
3. Terraform installed

## Test Infrastructure

The Terraform configuration creates:
- IAM user with limited read permissions (EC2, S3, IAM, STS)
- Access keys for the IAM user

## Running the Test

```bash
# Deploy test infrastructure
task build-terraform-infra

# Create K8s secret from Terraform outputs
task setup-k8s-secret

# Run RunWhen Local discovery
task run-rwl-discovery

# Verify results
task verify-results

# Cleanup
task cleanup
```

## Expected Results

- RunWhen Local should authenticate using credentials from K8s secret
- AWS resources (EC2, S3, etc.) should be discovered
- Auth type should be `aws_secret` in generated workspace files

## Validation Points

1. Kubernetes secret is properly read
2. Base64 decoding of secret values works
3. CloudQuery receives credentials via environment variables
4. Resources are discovered and enriched correctly

# AWS EKS Workload Identity (IRSA) Authentication Test

This test validates AWS authentication using EKS IAM Roles for Service Accounts (IRSA).

## Authentication Method

- **Auth Type**: `aws_workload_identity`
- **Configuration**: `useWorkloadIdentity: true` in workspaceInfo.yaml (or auto-detected via `AWS_WEB_IDENTITY_TOKEN_FILE`)
- **Mechanism**: Uses projected service account token to assume IAM role

## How IRSA Works

1. EKS cluster has an OIDC identity provider
2. IAM role has trust policy allowing the OIDC provider
3. Kubernetes service account is annotated with IAM role ARN
4. Pod gets projected token that can be exchanged for AWS credentials

## Prerequisites

1. AWS CLI configured with admin credentials
2. kubectl installed
3. Terraform installed
4. Sufficient IAM permissions to create EKS cluster and OIDC provider

## Test Infrastructure

The Terraform configuration creates:
- VPC with public and private subnets
- EKS cluster with OIDC provider enabled
- IAM role with trust policy for the service account
- Read-only policy for AWS resource discovery
- Test S3 bucket for discovery validation

## Running the Test

```bash
# Deploy test infrastructure (takes ~15-20 minutes for EKS)
task build-terraform-infra

# Configure kubectl
task configure-kubectl

# Deploy RunWhen Local with IRSA service account
task deploy-runwhen-local

# Run discovery (runs inside the EKS cluster)
task run-rwl-discovery

# Verify results
task verify-results

# Cleanup (important - EKS clusters are expensive!)
task cleanup
```

## Expected Results

- RunWhen Local pod should authenticate using IRSA
- AWS resources should be discovered without explicit credentials
- Auth type should be `aws_workload_identity` in generated workspace files

## Validation Points

1. Service account is annotated with IAM role ARN
2. Pod has `AWS_WEB_IDENTITY_TOKEN_FILE` and `AWS_ROLE_ARN` environment variables
3. AWS SDK uses web identity token provider
4. Resources are discovered with assumed role permissions

## Cost Considerations

EKS clusters incur hourly charges. Make sure to run `task cleanup` when done testing.

## Troubleshooting

### Pod cannot assume role
- Check OIDC provider is correctly configured
- Verify service account annotation matches role ARN
- Check trust policy has correct OIDC provider and service account

### Token file not found
- Ensure `fsGroup` is set in pod security context
- Verify projected volume is mounted correctly

### Permission denied
- Check IAM role policy has required permissions
- Verify trust policy allows the service account

# AWS Assume Role Authentication Test

This test validates AWS authentication using IAM role assumption (STS AssumeRole).

## Authentication Method

- **Auth Type**: `aws_assume_role`
- **Configuration**: `assumeRoleArn` (and optionally `assumeRoleExternalId`) in workspaceInfo.yaml
- **Base Credentials**: Uses default AWS credential chain for initial authentication

## Prerequisites

1. AWS CLI configured with credentials that can assume the test role
2. Terraform installed

## Test Infrastructure

The Terraform configuration creates:
- IAM role with trust policy allowing the current user/role to assume it
- IAM policy attached to the role with read-only discovery permissions
- External ID requirement for secure cross-account patterns
- Test S3 bucket for discovery validation

## Running the Test

```bash
# Deploy test infrastructure
task build-terraform-infra

# Generate workspaceInfo.yaml with role ARN
task generate-rwl-config

# Run RunWhen Local discovery
task run-rwl-discovery

# Verify results
task verify-results

# Cleanup
task cleanup
```

## Expected Results

- RunWhen Local should authenticate using default chain, then assume the target role
- Resources should be discovered using the assumed role's permissions
- Auth type should be `aws_assume_role` in generated workspace files

## Validation Points

1. STS AssumeRole is called with correct parameters
2. External ID is passed when configured
3. Session credentials are used for CloudQuery
4. Resources are discovered with assumed role permissions
5. Credential expiration is handled correctly

## Cross-Account Pattern

This test can be extended for cross-account scenarios:
1. Create the role in Account B
2. Update trust policy to allow Account A to assume
3. Run discovery from Account A, discovering resources in Account B

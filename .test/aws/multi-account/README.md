# AWS Multi-Account Authentication Test

This test validates AWS authentication for multi-account scenarios using cross-account role assumption.

## Authentication Method

- **Auth Type**: `aws_assume_role` (with multiple accounts)
- **Configuration**: Multiple account configurations with `assumeRoleArn` per account
- **Pattern**: Central account assumes roles into target accounts

## Prerequisites

1. AWS CLI configured with credentials in the "central" account
2. Terraform installed
3. Access to create IAM roles in target accounts (or use same account for testing)

## Test Infrastructure

For single-account simulation, the Terraform configuration creates:
- Multiple IAM roles simulating different "accounts"
- Each role has different permissions to simulate account boundaries
- Trust policies allowing the central identity to assume each role

For true multi-account testing:
- Deploy cross-account role in Account B
- Update trust policy to allow Account A
- Configure workspaceInfo.yaml with both account configurations

## Running the Test

```bash
# Deploy test infrastructure
task build-terraform-infra

# Generate workspaceInfo.yaml with multiple account configs
task generate-rwl-config

# Run RunWhen Local discovery
task run-rwl-discovery

# Verify results from all accounts
task verify-results

# Cleanup
task cleanup
```

## Expected Results

- RunWhen Local should authenticate and assume roles for each configured account
- Resources from all accounts should be discovered
- Auth type should show assume role for each account
- Resources should be properly attributed to their respective accounts

## Configuration Example

```yaml
cloudConfig:
  aws:
    region: "us-east-1"
    # Multiple accounts configuration
    accounts:
      - accountId: "111111111111"
        accountAlias: "production"
        assumeRoleArn: "arn:aws:iam::111111111111:role/runwhen-discovery"
        regions:
          - "us-east-1"
          - "us-west-2"
      - accountId: "222222222222"
        accountAlias: "staging"
        assumeRoleArn: "arn:aws:iam::222222222222:role/runwhen-discovery"
        regions:
          - "us-east-1"
```

## Validation Points

1. Each account's role is assumed successfully
2. Resources are discovered from each account
3. Account ID is correctly attributed to resources
4. Regional resources are discovered across configured regions

## True Cross-Account Setup

For production cross-account access:

1. In target account, create IAM role with trust policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::CENTRAL_ACCOUNT_ID:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "your-external-id"
        }
      }
    }
  ]
}
```

2. Attach read-only policy for discovery

3. Configure workspaceInfo.yaml with role ARN and external ID

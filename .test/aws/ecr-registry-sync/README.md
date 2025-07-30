# AWS ECR Registry Sync Test Infrastructure

This test infrastructure validates the AWS ECR registry sync functionality by:

1. Setting up ECR repositories using Terraform
2. Testing the sync script against real AWS infrastructure
3. Validating image copying and Helm values updates
4. Cleaning up resources after testing

## Prerequisites

- AWS CLI configured with appropriate permissions
- Docker installed and running
- Terraform installed
- Task (taskfile) installed
- jq, yq, curl utilities

## Required AWS Permissions

The test requires these IAM permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:*",
                "iam:GetUser",
                "sts:GetCallerIdentity"
            ],
            "Resource": "*"
        }
    ]
}
```

## Test Structure

- `terraform/` - Terraform infrastructure for ECR repositories
- `Taskfile.yaml` - Task definitions for testing
- `test_config.yaml` - Test configuration
- `expected_results/` - Expected test outputs
- `output/` - Test results and artifacts

## Quick Start

1. **Setup infrastructure:**
   ```bash
   task build-infra
   ```

2. **Run registry sync tests:**
   ```bash
   task test-registry-sync
   ```

3. **Clean up:**
   ```bash
   task clean
   ```

## Test Cases

### 1. Basic Registry Sync Test
- Tests syncing core RunWhen Local images to ECR
- Validates ECR repository creation
- Checks Helm values file updates

### 2. Multi-Registry Source Test
- Tests syncing from different source registries:
  - Google Artifact Registry
  - GitHub Container Registry  
  - Docker Hub

### 3. Tag Management Test
- Tests specific tag selection
- Tests latest tag handling
- Tests tag exclusion functionality

### 4. Architecture Support Test
- Tests amd64 architecture selection
- Validates multi-arch manifest handling

### 5. Error Handling Test
- Tests behavior with missing images
- Tests AWS credential failures
- Tests Docker daemon failures

## Configuration

The test uses environment variables and configuration files:

- `AWS_REGION` - AWS region for ECR repositories
- `AWS_ACCOUNT_ID` - AWS account ID (auto-detected)
- `TEST_REGISTRY_PREFIX` - Prefix for test ECR repositories

## Outputs

Test results are stored in:
- `output/test_results.json` - Test execution results
- `output/updated_values.yaml` - Generated Helm values
- `output/sync_logs.txt` - Registry sync logs
- `output/terraform_state/` - Terraform state files 
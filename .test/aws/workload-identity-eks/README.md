# AWS EKS Workload Identity (IRSA) Authentication Test

This test validates AWS authentication using EKS IAM Roles for Service Accounts (IRSA) while also discovering Kubernetes resources from the same EKS cluster.

## Authentication Method

- **EKS Cluster Discovery**: Uses AWS credentials (IRSA) to auto-discover EKS clusters
- **Kubernetes Discovery**: Uses AWS credentials via EKS to discover K8s resources
- **AWS Auth Type**: `aws_workload_identity`
- **Configuration**: 
  - `useWorkloadIdentity: true` in workspaceInfo.yaml
  - `eksClusters.autoDiscover: true` to automatically discover all clusters in the region
- **Mechanism**: Single IRSA service account provides access to both EKS/K8s API and AWS APIs

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

### Option 1: Using Helm (Recommended)

```bash
# Deploy test infrastructure (takes ~15-20 minutes for EKS)
task build-terraform-infra

# Configure kubectl
task configure-kubectl

# Setup Kubernetes resources (namespace, service account with IRSA)
task setup-k8s-resources

# Generate workspaceInfo.yaml
task generate-rwl-config

# Get latest RunWhen Local image tag (optional)
task get-latest-rwl-tag

# Install RunWhen Local via Helm
task install-rwl-helm

# Watch the discovery process
kubectl logs -f -n runwhen-local deployment/runwhen-local

# Cleanup (important - EKS clusters are expensive!)
task cleanup
```

### Option 2: Using Kubernetes Job

```bash
# Deploy test infrastructure (takes ~15-20 minutes for EKS)
task build-terraform-infra

# Configure kubectl
task configure-kubectl

# Setup Kubernetes resources (namespace, service account with IRSA)
task setup-k8s-resources

# Generate workspaceInfo.yaml
task generate-rwl-config

# Build and push RunWhen Local image to ECR
task build-rwl
task push-rwl-to-ecr

# Run discovery as a Kubernetes job
task run-rwl-discovery

# Watch progress
task watch-job

# Verify results
task verify-results

# Cleanup (important - EKS clusters are expensive!)
task cleanup
```

## Expected Results

- RunWhen Local discovers the EKS cluster using AWS IRSA credentials
- Kubernetes resources (namespaces, deployments) are discovered from the EKS cluster
- AWS resources (S3 buckets) are also discovered using the same IRSA credentials
- No explicit credentials required - single workload identity for both platforms
- Auth type should be `aws_workload_identity` in generated workspace files
- Generated kubeconfig uses AWS IAM authenticator (similar to Azure kubelogin)

## Validation Points

1. Service account is annotated with IAM role ARN
2. Pod has `AWS_WEB_IDENTITY_TOKEN_FILE` and `AWS_ROLE_ARN` environment variables
3. AWS SDK uses web identity token provider for both EKS and AWS resource discovery
4. EKS cluster is auto-discovered via `eks:ListClusters` and `eks:DescribeCluster` APIs
5. Kubeconfig is generated dynamically using AWS IAM authenticator
6. Both Kubernetes and AWS resources are discovered using the same IRSA identity
7. No explicit cluster configuration needed - auto-discovery handles it

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

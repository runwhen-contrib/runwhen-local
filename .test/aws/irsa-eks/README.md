# EKS IRSA (IAM Roles for Service Accounts) Test Infrastructure

This test infrastructure validates RunWhen Local's integration with AWS EKS using IRSA (IAM Roles for Service Accounts) for authentication.

## Overview

This test demonstrates:
- ✅ **Dual Discovery**: Both AWS cloud resources (via CloudQuery) and Kubernetes resources from the same EKS cluster
- ✅ **IRSA Authentication**: Service account annotation-based IAM role assumption
- ✅ **Auto-Discovery**: EKS cluster auto-discovery using `eksClusters.autoDiscover: true`
- ✅ **Runner Integration**: Task execution pods inherit IRSA credentials

## Architecture

```
EKS Cluster
├── OIDC Provider (for IRSA)
├── Service Account: runwhen-local
│   └── Annotation: eks.amazonaws.com/role-arn
├── IAM Role: runwhen-irsa-*
│   ├── Trust Policy: Allows OIDC federation
│   └── Permissions: AWS discovery + EKS describe
└── RunWhen Local Pod
    ├── Uses: runwhen-local service account
    ├── Discovers: AWS resources via CloudQuery
    └── Discovers: Kubernetes resources via kubectl
```

## Prerequisites

- AWS CLI configured with credentials
- Terraform installed
- kubectl installed
- Task (go-task) installed
- Sufficient AWS permissions to create EKS clusters

## Quick Start

```bash
cd .test/aws/irsa-eks

# 1. Deploy infrastructure (takes ~15-20 minutes)
task build-terraform-infra

# 2. Configure kubectl
task configure-kubectl

# 3. Configure aws-auth ConfigMap for IRSA role
task configure-eks-auth

# 4. Deploy RunWhen Local with Helm
export RUNNER_TOKEN="your-runner-token"
task install-rwl-helm

# 5. Monitor discovery
task run-rwl-discovery

# 6. Cleanup
task destroy-terraform-infra
```

### Recovering from "AlreadyExistsException" / "ResourceAlreadyExistsException"

If you see errors like **KMS Alias already exists** or **log group already exists**, Terraform is trying to create resources that already exist in AWS (e.g. after switching to local state or losing state). You can either:

**Option A – Import existing resources and continue**

```bash
cd .test/aws/irsa-eks
task import-orphaned-eks-resources   # imports KMS alias, log group, IRSA role + policy
cd terraform && terraform apply -auto-approve
# If more "already exists" errors appear, import those resources too, then apply again.
```

If you see **kms:UpdateAlias** or **kms:DescribeKey AccessDeniedException**: the KMS key’s resource policy doesn’t allow your IAM user/role. In AWS Console → KMS → the key → Key policy, add your identity with `kms:DescribeKey`, `kms:GetKeyPolicy`, `kms:UpdateAlias`, and `kms:PutKeyPolicy` (or use a key policy that allows your role).

If you use a non-default `resource_suffix`, run:

```bash
task import-orphaned-eks-resources -- RESOURCE_SUFFIX=your-suffix
```

**Option B – Remove leftovers in AWS and re-apply**

Delete the existing EKS cluster and related resources in the AWS console (or CLI), then run `task build-terraform-infra` again. Remove in this order: EKS cluster (wait for deletion) → CloudWatch log group `/aws/eks/runwhen-irsa-test-test/cluster` → KMS alias `alias/eks/runwhen-irsa-test-test` (and key if unused).

## What Gets Created

### AWS Resources
- VPC with public/private subnets across 2 AZs
- NAT Gateway for private subnet egress
- EKS Cluster (1.31)
- Managed node group (2 t3.medium nodes)
- OIDC provider for IRSA
- IAM role for RunWhen Local with:
  - Discovery permissions (EC2, S3, IAM, EKS)
  - Trust policy allowing OIDC federation
- Test S3 bucket
- Additional S3 bucket for discovery testing (`runwhen-irsa-discovery-*`)
- Test Lambda (`runwhen-discovery-test-*`) with access to the discovery bucket, for Lambda discovery testing

### Kubernetes Resources
- Namespace: `runwhen-local`
- Service Account: `runwhen-local` (with IRSA annotation)
- ConfigMap: `workspaceinfo`
- Secret: `uploadinfo` (optional)
- Secret: `runner-registration-token`
- Helm deployment: RunWhen Local + Runner

## Configuration Files

### `workspaceInfo.yaml`
Configures EKS cluster discovery:

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
```

### `values.yaml`
Helm values with IRSA configuration:

```yaml
runwhenLocal:
  serviceAccount:
    create: true
    annotations:
      eks.amazonaws.com/role-arn: "arn:aws:iam::ACCOUNT:role/runwhen-irsa-*"
    name: "runwhen-local"

runner:
  runEnvironment:
    deployment:
      serviceAccount: "runwhen-local"  # SLI pods use IRSA
    pod:
      serviceAccount: "runwhen-local"  # TaskSet pods use IRSA
```

## Key Tasks

| Task | Description |
|------|-------------|
| `build-terraform-infra` | Deploy EKS cluster and IAM resources |
| `configure-kubectl` | Update local kubeconfig |
| `configure-eks-auth` | Add IRSA role to aws-auth ConfigMap |
| `setup-k8s-resources` | Create namespace and secrets |
| `generate-rwl-config` | Create workspaceInfo configmap |
| `get-latest-rwl-tag` | Find latest PR Docker image tag |
| `install-rwl-helm` | Deploy RunWhen Local via Helm |
| `upgrade-rwl-helm` | Upgrade existing Helm deployment |
| `run-rwl-discovery` | Trigger on-demand discovery |
| `destroy-terraform-infra` | Cleanup all AWS resources |

## Validation

### 1. Verify IRSA Setup
```bash
# Check service account has annotation
kubectl get sa runwhen-local -n runwhen-local -o yaml

# Check pod has IRSA env vars
kubectl exec -n runwhen-local deployment/runwhen-local -- env | grep AWS_ROLE_ARN
```

### 2. Verify AWS Access
```bash
# Test from discovery pod
kubectl exec -n runwhen-local deployment/runwhen-local -- aws sts get-caller-identity

# Should show: arn:aws:sts::ACCOUNT:assumed-role/runwhen-irsa-*/botocore-session-*
```

### 3. Verify Discovery
```bash
# Check discovery logs
kubectl logs -n runwhen-local deployment/runwhen-local -f

# Should see:
# - CloudQuery discovering AWS resources
# - Kubernetes resource discovery
# - SLX generation with both AWS and K8s resources
```

### 4. Verify Task Execution
Check that runner task pods can authenticate:
```bash
# Find a recent task execution pod
kubectl get pods -n runwhen-local | grep runner

# Check it has IRSA credentials
kubectl exec -n runwhen-local <pod-name> -- env | grep AWS_
```

## Troubleshooting

### Issue: 401 Unauthorized when runner tasks access Kubernetes
**Cause**: IRSA role not mapped in aws-auth ConfigMap  
**Fix**: Run `task configure-eks-auth`

### Issue: "context does not exist" in task execution
**Cause**: Generated kubeconfig context name mismatch  
**Status**: Known issue - robot-runtime uses full ARN as context name

### Issue: Task pods authenticate as EC2 node, not IRSA role
**Cause**: Task pods not using service account with IRSA annotation  
**Fix**: Verify `runner.runEnvironment.pod.serviceAccount: runwhen-local` in values.yaml

### Issue: CloudQuery fails with "Access Denied"
**Cause**: IRSA role lacks necessary permissions  
**Fix**: Check IAM role policy in `terraform/main.tf`

## Costs

**Estimated hourly cost**: ~$0.20-0.30/hour
- EKS cluster: ~$0.10/hour
- EC2 nodes (2x t3.medium): ~$0.08/hour
- NAT Gateway: ~$0.045/hour
- Data transfer: Variable

**Always cleanup when done**: `task destroy-terraform-infra`

## See Also

- [Pod Identity Test Infrastructure](../pod-identity-eks/) - Future alternative to IRSA
- [AWS Authentication Documentation](../../docs/cloud-discovery-configuration/amazon-web-services.md)
- [AWS Workspace Key Reference](../../docs/cloud-discovery-configuration/aws-workspace-key-reference.md)

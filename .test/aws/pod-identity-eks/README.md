# EKS Pod Identity Test Infrastructure

{% hint style="success" %}
**Status**: ✅ **Fully Implemented and Ready for Testing**

Pod Identity support has been added to RunWhen Local!
{% endhint %}

## Overview

This test infrastructure will demonstrate RunWhen Local's integration with EKS Pod Identity, a newer alternative to IRSA that simplifies IAM role authentication for pods.

## EKS Pod Identity vs IRSA

| Feature | IRSA | Pod Identity |
|---------|------|--------------|
| Setup Complexity | Requires OIDC provider | Simpler, no OIDC needed |
| Service Account Annotation | `eks.amazonaws.com/role-arn` | Not needed |
| Pod Identity Agent | Not required | Required (addon) |
| Environment Variables | `AWS_WEB_IDENTITY_TOKEN_FILE`, `AWS_ROLE_ARN` | `AWS_CONTAINER_CREDENTIALS_FULL_URI` |
| IAM Trust Policy | Federated OIDC | `pods.eks.amazonaws.com` |
| Association Method | Service account annotation | `PodIdentityAssociation` resource |
| Release | GA since 2014 | GA since 2024 |

## Implementation Status

### ✅ Code Changes (Complete)

- ✅ Detection logic in `src/aws_utils.py` for `AWS_CONTAINER_CREDENTIALS_FULL_URI`
- ✅ Updated `src/templates/aws-auth.yaml` with `aws:pod-identity@cli` workspace keys
- ✅ Updated `src/indexers/cloudquery.py` to detect Pod Identity
- ✅ Environment variable propagation for CloudQuery subprocess
- ✅ Documentation in `docs/cloud-discovery-configuration/amazon-web-services.md`
- ✅ WorkspaceKey reference documentation

### ✅ Test Infrastructure (Complete)

- ✅ Terraform to provision EKS cluster with Pod Identity enabled
- ✅ EKS Pod Identity Agent addon configuration
- ✅ `PodIdentityAssociation` resource creation
- ✅ IAM role with discovery permissions
- ✅ Taskfile for automated testing workflow
- ✅ Helm values configuration (no annotations needed)

## Quick Start

### Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform >= 1.3
- kubectl
- Helm 3

### Deploy Test Infrastructure

```bash
cd .test/aws/pod-identity-eks

# 1. Create tf.secret file
echo 'resource_suffix = "test"' > terraform/tf.secret

# 2. Build infrastructure
task build-terraform-infra

# 3. Get latest RunWhen Local tag
task get-latest-rwl-tag

# 4. Run discovery
task run-rwl-discovery

# 5. Install with Helm
task install-rwl-helm

# 6. Verify Pod Identity
kubectl exec -n runwhen-local deployment/runwhen-local -- env | grep AWS_CONTAINER
```

## Validation

Once deployed, verify Pod Identity is working:

```bash
# Check environment variables
kubectl exec -n runwhen-local deployment/runwhen-local -- env | grep AWS

# Should see:
# AWS_CONTAINER_CREDENTIALS_FULL_URI=https://...
# AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE=/var/run/secrets/pods.eks.amazonaws.com/...

# Verify authentication
kubectl exec -n runwhen-local deployment/runwhen-local -- aws sts get-caller-identity

# Test S3 access
kubectl exec -n runwhen-local deployment/runwhen-local -- aws s3 ls
```

## See Also

- [IRSA Test Infrastructure](../irsa-eks/) - Alternative using IRSA
- [AWS Documentation on EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html)
- [WorkspaceKey Reference](../../../docs/cloud-discovery-configuration/aws-workspace-key-reference.md)

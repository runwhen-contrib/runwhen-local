# Google Cloud Platform Examples

This directory contains examples for the expanded GCP support in RunWhen Local, which provides multiple authentication methods and Robot Framework integration patterns similar to Azure support.

## Overview

The expanded GCP support includes:

- **Multiple Authentication Methods**: Service Account, Application Default Credentials, Kubernetes Secrets
- **Multi-Project Support**: Discovery across multiple GCP projects
- **Robot Framework Integration**: Secret provider patterns for seamless automation
- **GKE Cluster Support**: Automatic kubeconfig generation for GKE clusters
- **Enhanced Resource Tagging**: Comprehensive GCP label support

## Authentication Methods

### 1. Service Account from Kubernetes Secret (Recommended)

**Best for**: Production environments, CI/CD pipelines

```bash
# Create the secret
kubectl create secret generic gcp-service-account \
  --from-literal=projectId="my-project-id" \
  --from-literal=serviceAccountKey='{"type":"service_account",...}'
```

```yaml
# workspaceInfo.yaml
workspaceName: "production-workspace"
workspaceOwnerEmail: "team@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    saSecretName: "gcp-service-account"
    projects: ["my-project-id"]
```

### 2. Application Default Credentials

**Best for**: Development environments, Cloud Shell

```yaml
# workspaceInfo.yaml
workspaceName: "dev-workspace"
workspaceOwnerEmail: "dev@example.com"
defaultLocation: "location-01"
defaultLOD: "basic"
cloudConfig:
  gcp:
    projects: ["dev-project"]
    # No credentials needed - uses gcloud auth login
```

### 3. Explicit Service Account

**Best for**: Testing (not recommended for production)

```yaml
# workspaceInfo.yaml
workspaceName: "test-workspace"
workspaceOwnerEmail: "test@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    projectId: "my-project-id"
    serviceAccountKey: |
      {
        "type": "service_account",
        "project_id": "my-project-id",
        ...
      }
```

### 4. Legacy Application Credentials File

**Best for**: Backward compatibility

```yaml
# workspaceInfo.yaml
workspaceName: "legacy-workspace"
workspaceOwnerEmail: "team@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    applicationCredentialsFile: /shared/service-account.json
    projects: ["my-project-id"]
```

## Multi-Project Configuration

```yaml
workspaceName: "multi-project-workspace"
workspaceOwnerEmail: "platform@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    projects:
      - "production-project"
      - "staging-project"
      - "development-project"
    saSecretName: "cross-project-service-account"
    projectLevelOfDetails:
      "production-project": detailed
      "staging-project": basic
      "development-project": basic
```

## Robot Framework Integration

The GCP expansion introduces secret provider patterns for Robot Framework:

### Secret Patterns

#### Service Account Patterns
- **CLI Authentication**: `gcp:sa@cli`
- **Kubeconfig Generation**: `gcp:sa@kubeconfig:CLUSTER_NAME/ZONE_OR_REGION`

#### Application Default Credentials Patterns
- **CLI Authentication**: `gcp:adc@cli`
- **Kubeconfig Generation**: `gcp:adc@kubeconfig:CLUSTER_NAME/ZONE_OR_REGION`

### Example Robot Framework Usage

```robot
*** Settings ***
Library    RW.Core

*** Test Cases ***
GCP Service Account Example
    # Import required secrets
    Import Secret    gcp_projectId
    Import Secret    gcp_serviceAccountKey
    Import Secret    my_gke_kubeconfig
    
    # Use kubectl with authenticated cluster
    Shell    kubectl get nodes
    Shell    kubectl get pods --all-namespaces

GCP ADC Example
    # Project ID is optional with ADC
    Import Optional Secret    gcp_projectId
    Import Secret    my_gke_kubeconfig_adc
    Import Secret    my_gcp_cli_adc
    
    # Use gcloud commands
    Shell    gcloud compute instances list
    Shell    kubectl get services

Multi Environment Example
    # Production environment
    Import Secret    prod_gke_kubeconfig     # gcp:sa@kubeconfig:prod-cluster/us-east1
    
    # Staging environment  
    Import Secret    staging_gke_kubeconfig  # gcp:sa@kubeconfig:staging-cluster/us-west1
    
    # Use different clusters
    Shell    kubectl --kubeconfig=${prod_gke_kubeconfig} get nodes
    Shell    kubectl --kubeconfig=${staging_gke_kubeconfig} get nodes
```

## GKE Cluster Support

The system automatically handles both zonal and regional GKE clusters:

### Zonal Clusters
```yaml
# Pattern: cluster-name/zone
workspaceKey: gcp:sa@kubeconfig:my-cluster/us-central1-a
```

### Regional Clusters
```yaml
# Pattern: cluster-name/region
workspaceKey: gcp:sa@kubeconfig:my-cluster/us-central1
```

## Service Account Setup

### Required Permissions

Your service account needs the following IAM roles:

```bash
# Basic permissions for resource discovery
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
    --role="roles/viewer"

# For GKE cluster access
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
    --role="roles/container.viewer"

# For kubeconfig generation
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
    --role="roles/container.clusterViewer"
```

### Creating a Service Account

```bash
export PROJECT_ID="my-project-id"
export KEY_FILE="gcp-service-account-key.json"
export SA_NAME="runwhen-local-sa"

# Create service account
gcloud iam service-accounts create $SA_NAME \
    --description="Service Account for RunWhen Local Discovery" \
    --display-name="RunWhen Local Discovery Service Account" \
    --project=$PROJECT_ID

# Add IAM policy binding
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/viewer"

# Create and download key
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
    --project=$PROJECT_ID
```

## Environment Variables

Configure GCP patterns using these environment variables:

- `RW_GCP_CREDENTIAL_CACHE_TTL`: Cache TTL in seconds (default: 3600)
- `GOOGLE_APPLICATION_CREDENTIALS_DIR`: Directory for GCP config files
- `GOOGLE_CLOUD_PROJECT`: Default project ID
- `GCP_PROJECT`: Alternative project ID environment variable

## Migration Guide

### From Legacy Configuration

```yaml
# Old format
workspaceName: "legacy-workspace"
workspaceOwnerEmail: "team@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    applicationCredentialsFile: /shared/service-account.json
    projects: ["my-project"]

# New format (recommended)
workspaceName: "modern-workspace"
workspaceOwnerEmail: "team@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    saSecretName: "gcp-sa-secret"
    projects: ["my-project"]
```

### From Manual Authentication

1. Replace manual `gcloud auth` commands with secret imports
2. Consolidate kubeconfig generation into secret patterns
3. Leverage caching for improved performance

## Best Practices

1. **Use ADC for Development**: Prefer Application Default Credentials for local development
2. **Service Accounts for Production**: Use service accounts for automated environments
3. **Separate Credentials**: Use different service accounts for different environments
4. **Cache Configuration**: Tune cache TTL based on your security requirements
5. **Error Handling**: Always use optional secrets where appropriate
6. **Documentation**: Document your secret key naming conventions

## Troubleshooting

### Common Issues

#### "Required secret not found"
- Ensure `gcp_projectId` and `gcp_serviceAccountKey` are configured
- Verify secret keys exist in your vault

#### "Unable to determine project ID"
- Provide explicit `gcp_projectId` secret
- Check `GOOGLE_CLOUD_PROJECT` environment variable

#### "Cluster not found"
- Verify cluster name and zone/region are correct
- Ensure service account has GKE permissions

#### "Authentication failed"
- Validate service account JSON key format
- Check service account permissions in GCP Console

### Debug Information

Enable debug logging to see detailed information about:
- Credential cache hits/misses
- Kubeconfig generation steps
- Authentication attempts
- Project ID resolution

Set `DEBUG_LOGGING=true` in your environment to enable debug logging.

## Files in This Directory

- `workspaceInfo-simple.yaml`: Simple, clean example for quick setup
- `workspaceInfo-example.yaml`: Comprehensive example showing all authentication methods
- `README.md`: This documentation file

## Related Documentation

- [Google Cloud Platform - Expanded Authentication Support](../../docs/cloud-discovery-configuration/google-cloud-platform-expanded.md)
- [Original GCP Documentation](../../docs/cloud-discovery-configuration/google-cloud-platform-1.md)
- [Azure Authentication (for comparison)](../azure-devops/README.md) 
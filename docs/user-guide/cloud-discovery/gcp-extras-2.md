# Google Cloud Platform - Expanded Authentication Support

{% hint style="info" %}
This document describes the expanded GCP support introduced in RunWhen Local, which includes multiple authentication methods and Robot Framework integration patterns similar to Azure support.
{% endhint %}

## Overview

The expanded GCP support provides multiple authentication methods and seamless integration with Robot Framework through secret provider patterns. This allows for flexible deployment scenarios from development to production environments.

## Authentication Methods

### 1. Service Account Authentication (`gcp_service_account`)

Uses a service account JSON key for authentication. Ideal for:
- CI/CD pipelines
- Automated deployments
- Production environments
- Cross-project access

**Configuration Example:**
```yaml
workspaceName: "production-workspace"
workspaceOwnerEmail: "team@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    projectId: "my-production-project"
    serviceAccountKey: |
      {
        "type": "service_account",
        "project_id": "my-production-project",
        "private_key_id": "...",
        "private_key": "...",
        "client_email": "...",
        "client_id": "...",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
      }
```

### 2. Service Account from Kubernetes Secret (`gcp_service_account_secret`)

Uses service account credentials stored in a Kubernetes secret. Recommended for production:

**Secret Creation:**
```bash
kubectl create secret generic gcp-sa-secret \
  --from-literal=projectId="my-project-id" \
  --from-literal=serviceAccountKey='{"type":"service_account",...}'
```

**Configuration:**
```yaml
workspaceName: "production-workspace"
workspaceOwnerEmail: "team@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    saSecretName: "gcp-sa-secret"
```

### 3. Application Default Credentials (`gcp_adc`)

Uses Application Default Credentials for authentication. Works with:
- User credentials (via `gcloud auth login`)
- Compute Engine service accounts
- Cloud Shell environments
- Workload Identity

**Configuration:**
```yaml
workspaceName: "dev-workspace"
workspaceOwnerEmail: "dev@example.com"
defaultLocation: "location-01"
defaultLOD: "basic"
cloudConfig:
  gcp:
    projects: ["my-project-1", "my-project-2"]
    # No explicit credentials - uses ADC
```

### 4. Legacy Application Credentials File

Maintains backward compatibility with the original format:

```yaml
workspaceName: "legacy-workspace"
workspaceOwnerEmail: "team@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    applicationCredentialsFile: /shared/GCPServiceAccountKeyWorkspaceBuilder.json
    projects: ["my-project-id"]
```

## Multi-Project Support

The expanded GCP support allows discovery across multiple projects:

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
    saSecretName: "gcp-cross-project-sa"
    projectLevelOfDetails:
      "production-project": detailed
      "staging-project": basic
      "development-project": basic
```

## Robot Framework Integration

### Secret Provider Patterns

The GCP expansion introduces secret provider patterns for Robot Framework integration:

#### Service Account Patterns
- **CLI Authentication**: `gcp:sa@cli`
- **Kubeconfig Generation**: `gcp:sa@kubeconfig:CLUSTER_NAME/ZONE_OR_REGION`

#### Application Default Credentials Patterns
- **CLI Authentication**: `gcp:adc@cli`
- **Kubeconfig Generation**: `gcp:adc@kubeconfig:CLUSTER_NAME/ZONE_OR_REGION`

### Template Usage

#### GCP Authentication Template (`gcp-auth.yaml`)
```yaml
{% if cluster.cluster_type == "gke" and cluster.auth_type == "gcp_service_account" %}
    - name: gcp_credentials
      workspaceKey: gcp:sa@cli
    - name: gcp_projectId
      workspaceKey: k8s:file@secret/{{ custom.gcp_service_account_secret_name }}:projectId
    - name: gcp_serviceAccountKey
      workspaceKey: k8s:file@secret/{{ custom.gcp_service_account_secret_name }}:serviceAccountKey
{% elif cluster.auth_type == "gcp_adc" %}
    - name: gcp_credentials
      workspaceKey: gcp:adc@cli
{% endif %}
```

#### GKE Kubernetes Authentication Template (`gcp-kubernetes-auth.yaml`)
```yaml
{% if cluster.cluster_type == "gke" and cluster.auth_type == "gcp_service_account" %}
    - name: kubeconfig
      workspaceKey: gcp:sa@kubeconfig:{{ cluster.name }}/{{ cluster.zone | default(cluster.region) }}
{% elif cluster.auth_type == "gcp_adc" %}
    - name: kubeconfig
      workspaceKey: gcp:adc@kubeconfig:{{ cluster.name }}/{{ cluster.zone | default(cluster.region) }}
{% endif %}
```

### Robot Framework Usage Examples

#### Basic Service Account Authentication
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
```

#### Application Default Credentials
```robot
*** Test Cases ***
GCP ADC Example
    # Project ID is optional with ADC
    Import Optional Secret    gcp_projectId
    Import Secret    my_gke_kubeconfig_adc
    Import Secret    my_gcp_cli_adc
    
    # Use gcloud commands
    Shell    gcloud compute instances list
    Shell    kubectl get services
```

#### Multi-Environment Setup
```robot
*** Test Cases ***
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

### Cluster Configuration

GKE clusters are automatically detected and configured with appropriate authentication:

```yaml
# Example workspaceInfo.yaml with GKE cluster configuration
workspaceName: "gke-workspace"
workspaceOwnerEmail: "team@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"
cloudConfig:
  gcp:
    projects: ["my-production-project"]
    saSecretName: "gcp-production-sa"
custom:
  gke_clusters:
    production:
      name: "production-gke"
      cluster_type: "gke"
      project_id: "my-production-project"
      zone: "us-central1-a"
      region: "us-central1"
      auth_type: "gcp_service_account"
      auth_secret: "gcp-production-sa"
```

### Zone vs Regional Clusters

The system automatically handles both zonal and regional GKE clusters:

- **Zonal clusters**: `cluster-name/us-central1-a`
- **Regional clusters**: `cluster-name/us-central1`

## Resource Tagging and Labels

The GCP expansion includes comprehensive support for GCP resource labels:

```yaml
# GCP Tags Template (gcp-tags.yaml)
- name: gcp_project_id
  value: "{{ match_resource.project_id }}"
- name: gcp_region
  value: "{{ match_resource.region }}"
- name: gcp_zone
  value: "{{ match_resource.zone }}"
{% for label_key, label_value in match_resource.labels.items() %}
- name: gcp_label_{{ label_key | replace('-', '_') }}
  value: "{{ label_value }}"
{% endfor %}
```

## Environment Variables

The following environment variables can be used to configure GCP patterns:

- `RW_GCP_CREDENTIAL_CACHE_TTL`: Cache TTL in seconds (default: 3600)
- `GOOGLE_APPLICATION_CREDENTIALS_DIR`: Directory for GCP config files
- `GOOGLE_CLOUD_PROJECT`: Default project ID
- `GCP_PROJECT`: Alternative project ID environment variable

## Migration from Legacy Configuration

### From Application Credentials File
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
- Replace manual `gcloud auth` commands with secret imports
- Consolidate kubeconfig generation into secret patterns
- Leverage caching for improved performance

## Best Practices

1. **Use ADC for Development**: Prefer Application Default Credentials for local development
2. **Service Accounts for Production**: Use service accounts for automated environments
3. **Separate Credentials**: Use different service accounts for different environments
4. **Cache Configuration**: Tune cache TTL based on your security requirements
5. **Error Handling**: Always use optional secrets where appropriate
6. **Documentation**: Document your secret key naming conventions

## Troubleshooting

### Common Issues

1. **"Required secret not found"**
   - Ensure `gcp_projectId` and `gcp_serviceAccountKey` are configured
   - Verify secret keys exist in your vault

2. **"Unable to determine project ID"**
   - Provide explicit `gcp_projectId` secret
   - Check `GOOGLE_CLOUD_PROJECT` environment variable

3. **"Cluster not found"**
   - Verify cluster name and zone/region are correct
   - Ensure service account has GKE permissions

4. **"Authentication failed"**
   - Validate service account JSON key format
   - Check service account permissions in GCP Console

### Debug Information

Enable debug logging to see detailed information about:
- Credential cache hits/misses
- Kubeconfig generation steps
- Authentication attempts
- Project ID resolution

## Comparison with Azure Pattern

| Aspect | Azure | GCP |
|--------|-------|-----|
| **Authentication** | Service Principal / Managed Identity | Service Account / ADC |
| **Required Secrets** | tenantId, clientId, clientSecret | projectId, serviceAccountKey |
| **Cluster Format** | resource-group/cluster-name | cluster-name/zone-or-region |
| **CLI Tool** | az login | gcloud auth |
| **Managed K8s** | AKS | GKE |
| **Pattern Format** | azure:sp@kubeconfig:rg/cluster | gcp:sa@kubeconfig:cluster/zone |

## Future Enhancements

Potential future improvements to the GCP pattern:

- Support for Workload Identity
- Integration with Google Secret Manager
- Multi-region cluster support
- Automatic cluster discovery
- Enhanced error messages and troubleshooting 
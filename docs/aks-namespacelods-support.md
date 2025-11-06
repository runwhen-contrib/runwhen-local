# AKS namespaceLODs Support

## Overview

This document describes the enhanced support for `namespaceLODs` configuration with AKS (Azure Kubernetes Service) clusters. Previously, the traditional `namespaceLODs` setting was ignored for AKS clusters, limiting users to cluster-wide LOD settings. This enhancement enables fine-grained, per-namespace LOD control for AKS clusters.

## Problem Statement

Before this enhancement, AKS clusters had a limitation where:

1. **Only cluster-wide LOD** could be set via `defaultNamespaceLOD`
2. **Traditional `namespaceLODs`** configuration was completely ignored
3. **No namespace-specific configuration** was possible except through runtime Kubernetes annotations

This meant users couldn't specify different LOD levels for different namespaces within an AKS cluster using configuration files.

## Solution

The enhanced implementation now supports both traditional `namespaceLODs` configuration and **cluster-specific `namespaceLODs`** directly under AKS cluster configurations. This provides maximum flexibility for scenarios with or without kubernetes configuration sections.

### New Priority Order

The LOD determination now follows this priority order (highest to lowest):

1. **Kubernetes annotations** on namespace objects (`config.runwhen.com/lod`)
2. **aksClusters.clusters[].namespaceLODs** (cluster-specific namespace LODs)
3. **kubernetes.namespaceLODs** (global namespace LODs)
4. **contexts.defaultNamespaceLOD** (per-context default)
5. **aksClusters.clusters[].defaultNamespaceLOD** (per-AKS-cluster default)
6. **defaultLOD** (global default)

### Code Changes

#### Key Modifications in `src/indexers/kubeapi.py`:

1. **Added NAMESPACE_LODS setting dependency**:
   ```python
   SETTINGS = (
       SettingDependency(CLOUD_CONFIG_SETTING, False),
       SettingDependency(DEFAULT_LOD_SETTING, False),
       SettingDependency("NAMESPACE_LODS", False),  # New dependency
   )
   ```

2. **Load namespaceLODs from component context**:
   ```python
   # Load the traditional namespaceLODs setting for backward compatibility
   namespace_lods = component_context.get_setting("NAMESPACE_LODS") or {}
   ```

3. **Load namespaceLODs from kubernetes settings**:
   ```python
   # Load namespaceLODs from kubernetes settings (cloudConfig.kubernetes.namespaceLODs)
   kubernetes_namespace_lods = kubernetes_settings.get("namespaceLODs", {})
   if kubernetes_namespace_lods:
       namespace_lods.update(kubernetes_namespace_lods)
   ```

4. **Load cluster-specific namespaceLODs from AKS configuration**:
   ```python
   # Load namespaceLODs from AKS cluster configuration
   cluster_namespace_lods = cluster.get("namespaceLODs", {})
   if cluster_namespace_lods:
       # Store per-cluster namespaceLODs
       aks_cluster_namespace_lods[cluster_name] = cluster_namespace_lods
       # Also merge into global namespace_lods for backward compatibility
       namespace_lods.update(cluster_namespace_lods)
   ```

5. **Enhanced LOD determination logic for AKS clusters**:
   ```python
   # Enhanced LOD determination for AKS clusters with namespaceLODs support
   # Priority order: 1) cluster-specific namespaceLODs, 2) global namespaceLODs, 3) AKS defaultNamespaceLOD, 4) global default
   
   # Check cluster-specific namespaceLODs first
   cluster_specific_namespace_lods = aks_cluster_namespace_lods.get(cluster_name, {})
   if namespace_name in cluster_specific_namespace_lods:
       namespace_lod = LevelOfDetail.construct_from_config(cluster_specific_namespace_lods[namespace_name])
       lod_source = f"AKS cluster '{cluster_name}' namespaceLODs"
   # Then check global namespaceLODs
   elif namespace_name in namespace_lods:
       namespace_lod = LevelOfDetail.construct_from_config(namespace_lods[namespace_name])
       lod_source = "global namespaceLODs"
   # Finally fall back to cluster default
   else:
       namespace_lod = LevelOfDetail.construct_from_config(aks_cluster_lod_settings.get(cluster_name, default_lod))
       lod_source = f"AKS cluster '{cluster_name}' defaultNamespaceLOD"
   ```

## Usage Examples

### AKS-Only Configuration (No Kubernetes Section)

For scenarios where you only have AKS clusters and no traditional kubernetes configuration:

```yaml
workspaceName: "aks-only-workspace"
workspaceOwnerEmail: "admin@company.com"
defaultLocation: "location-01"
defaultLOD: "basic"

cloudConfig:
  # No kubernetes section needed!
  
  azure:
    subscriptionId: "your-subscription-id"
    tenantId: "your-tenant-id"
    clientId: "your-client-id"
    clientSecret: "your-client-secret"
    
    aksClusters:
      autoDiscover: false
      clusters:
        - name: aks-prod-cluster
          server: https://aks-prod.hcp.eastus.azmk8s.io:443
          resource_group: prod-rg
          subscriptionId: prod-subscription-id
          defaultNamespaceLOD: basic  # Fallback for unlisted namespaces
          
          # namespaceLODs directly under the cluster!
          namespaceLODs:
            production: "detailed"      # Production gets detailed monitoring
            prod-frontend: "detailed"   # Frontend production namespace
            prod-backend: "detailed"    # Backend production namespace
            monitoring: "basic"         # Monitoring namespace
            kube-system: "none"         # System namespaces excluded
            kube-public: "none"
            kube-node-lease: "none"
        
        - name: aks-staging-cluster
          server: https://aks-staging.hcp.westus.azmk8s.io:443
          resource_group: staging-rg
          subscriptionId: staging-subscription-id
          defaultNamespaceLOD: basic
          
          # Different namespaceLODs for staging cluster
          namespaceLODs:
            staging: "basic"            # Staging gets basic monitoring
            staging-frontend: "basic"
            test: "none"                # Test namespaces excluded
            kube-system: "none"
```

### Mixed Global and Cluster-Specific namespaceLODs

Combine global namespaceLODs with cluster-specific overrides:

```yaml
cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/kubeconfig
    
    # Global namespaceLODs (lower priority)
    namespaceLODs:
      kube-system: "none"         # Global system exclusion
      monitoring: "basic"         # Global monitoring setting

  azure:
    aksClusters:
      clusters:
        - name: aks-prod-cluster
          defaultNamespaceLOD: basic
          
          # Cluster-specific namespaceLODs (higher priority)
          namespaceLODs:
            production: "detailed"      # Cluster-specific
            monitoring: "detailed"      # Overrides global "basic"
            # kube-system uses global "none"
```

### Basic namespaceLODs with AKS

```yaml
workspaceName: "my-aks-workspace"
workspaceOwnerEmail: "admin@company.com"
defaultLocation: "location-01"
defaultLOD: "basic"

cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/kubeconfig
    
    # Now works with AKS clusters!
    namespaceLODs:
      production: "detailed"      # Production gets detailed monitoring
      staging: "basic"           # Staging gets basic monitoring
      development: "basic"       # Development gets basic monitoring
      kube-system: "none"        # System namespaces excluded
      kube-public: "none"
      kube-node-lease: "none"

  azure:
    aksClusters:
      autoDiscover: false
      clusters:
        - name: my-aks-cluster
          server: https://my-aks.hcp.eastus.azmk8s.io:443
          resource_group: my-rg
          subscriptionId: my-subscription-id
          defaultNamespaceLOD: basic  # Fallback for unlisted namespaces
```

### Mixed Priority Configuration

```yaml
cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/kubeconfig
    
    # Highest priority for specific namespaces
    namespaceLODs:
      critical-app: "detailed"
      monitoring: "basic"
    
    # Medium priority for context-level default
    contexts:
      my-aks-cluster:
        defaultNamespaceLOD: basic

  azure:
    aksClusters:
      clusters:
        - name: my-aks-cluster
          defaultNamespaceLOD: none  # Lowest priority
```

### Runtime Override with Annotations

Even with `namespaceLODs` configured, you can still override at runtime:

```bash
# This overrides any configuration-based LOD setting
kubectl annotate namespace my-namespace config.runwhen.com/lod=detailed
```

## Backward Compatibility

This enhancement maintains full backward compatibility:

1. **Existing configurations** continue to work unchanged
2. **AKS `defaultNamespaceLOD`** still works as before
3. **Context `defaultNamespaceLOD`** still works as before
4. **Kubernetes annotations** still have the highest priority
5. **Traditional `namespaceLODs`** now works with AKS clusters (previously ignored)

## Benefits

1. **Consistent Experience**: Same `namespaceLODs` syntax works across all cluster types
2. **Fine-Grained Control**: Per-namespace LOD settings for AKS clusters
3. **Flexible Priority**: Multiple levels of configuration with clear precedence
4. **Backward Compatible**: No breaking changes to existing configurations
5. **Runtime Override**: Annotations still provide highest-priority overrides

## Testing

The implementation includes comprehensive logging to help debug LOD assignments:

```
INFO: Using namespaceLODs setting for AKS namespace 'production': detailed
INFO: Using AKS cluster defaultNamespaceLOD for namespace 'other-namespace': basic
INFO: Overriding LOD for namespace 'annotated-namespace' based on annotation: detailed
```

## Migration Guide

### From AKS-only defaultNamespaceLOD

**Before**:
```yaml
azure:
  aksClusters:
    clusters:
      - name: my-cluster
        defaultNamespaceLOD: detailed  # Same LOD for all namespaces
```

**After**:
```yaml
kubernetes:
  namespaceLODs:
    production: "detailed"
    staging: "basic"
    development: "basic"
    kube-system: "none"

azure:
  aksClusters:
    clusters:
      - name: my-cluster
        defaultNamespaceLOD: basic  # Fallback for unlisted namespaces
```

### From Context-only Configuration

**Before**:
```yaml
kubernetes:
  contexts:
    my-aks-cluster:
      defaultNamespaceLOD: basic  # Same LOD for all namespaces
```

**After**:
```yaml
kubernetes:
  namespaceLODs:
    production: "detailed"
    staging: "basic"
    kube-system: "none"
  
  contexts:
    my-aks-cluster:
      defaultNamespaceLOD: basic  # Fallback for unlisted namespaces
```

## Troubleshooting

### Check LOD Assignment

Look for these log messages to understand which LOD source is being used:

- `"Using AKS cluster 'X' namespaceLODs for AKS namespace 'Y': Z"` - Cluster-specific namespaceLODs
- `"Using global namespaceLODs for AKS namespace 'X': Y"` - Global namespaceLODs
- `"Using AKS cluster 'X' defaultNamespaceLOD for namespace 'Y': Z"` - AKS cluster default
- `"Overriding LOD for namespace 'X' based on annotation: Y"` - Annotation override

### Common Issues

1. **Cluster-specific namespaceLODs not working**: Ensure the cluster name matches exactly and the namespace name is correct
2. **namespaceLODs not working**: Ensure the namespace name exactly matches the key in `namespaceLODs`
3. **Unexpected LOD**: Check the priority order - cluster-specific overrides global, annotations override everything
4. **Missing namespaces**: Unlisted namespaces use `defaultNamespaceLOD` or global `defaultLOD`
5. **AKS-only config issues**: Ensure cluster configuration is under `azure.aksClusters.clusters[]`

## See Also

- [Level of Detail Configuration](configuration/level-of-detail.md)
- [Kubernetes Configuration](cloud-discovery-configuration/kubernetes-configuration.md)
- [AKS Auto-Discovery Examples](../src/examples/aks-auto-discovery-examples.yaml)
- [AKS namespaceLODs Examples](../src/examples/aks-namespacelods-examples.yaml)
- [AKS-Only namespaceLODs Examples](../src/examples/aks-only-namespacelods-examples.yaml)

# Kubernetes Level of Detail (LOD) Configuration Guide

## Overview

RunWhen Local uses a flexible Level of Detail (LOD) system to control the depth and verbosity of Kubernetes resource discovery. This guide explains how LOD settings are applied and prioritized across multiple Kubernetes contexts.

## LOD Priority Order

The LOD for each namespace is determined using the following priority hierarchy (highest to lowest):

1. **Namespace Annotations** (Highest Priority)
   - Annotations directly on the Kubernetes namespace resource
   - Always override any configuration settings
   
2. **Context-Specific `namespaceLODs`**
   - Per-context namespace configurations
   - Most specific configuration setting
   
3. **Global `namespaceLODs`**
   - Cross-context namespace rules
   - Override context-level defaults
   
4. **Context `defaultNamespaceLOD`**
   - Default LOD for all namespaces in a specific context
   
5. **Global `defaultLOD`** (Lowest Priority)
   - System-wide fallback setting

## LOD Levels

- **`none`**: No resource discovery (namespace skipped)
- **`basic`**: Basic resource discovery (deployments, services, pods)
- **`detailed`**: Comprehensive resource discovery (includes jobs, configmaps, ingresses, etc.)

## Configuration Examples

### Example 1: Basic Multi-Context Setup

**Scenario**: You have multiple Kubernetes clusters with overlapping namespace names, and you want to control discovery selectively.

```yaml
workspaceName: "multi-cluster-production"
workspaceOwnerEmail: platform@example.com
defaultLocation: location-01
defaultLOD: none  # Disable discovery by default

cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/kubeconfig
    inClusterAuth: false
    
    # Context-specific defaults
    contexts:
      prod-cluster-01:
        defaultNamespaceLOD: none
      prod-cluster-02:
        defaultNamespaceLOD: none
      staging-cluster-01:
        defaultNamespaceLOD: basic
    
    # Global namespace rules (applied across all contexts)
    namespaceLODs:
      backend-services: "detailed"
      frontend-services: "detailed"
      monitoring: "basic"
```

**Result**:
- `backend-services` namespace: **detailed** LOD in all clusters (overrides context defaults)
- `frontend-services` namespace: **detailed** LOD in all clusters
- `monitoring` namespace: **basic** LOD in all clusters
- All other namespaces in `prod-cluster-01` and `prod-cluster-02`: **none** (no discovery)
- All other namespaces in `staging-cluster-01`: **basic**

---

### Example 2: Per-Context Namespace Overrides

**Scenario**: You want different LOD levels for the same namespace across different contexts.

```yaml
workspaceName: "multi-environment"
defaultLOD: basic

cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/kubeconfig
    
    contexts:
      production-cluster:
        defaultNamespaceLOD: detailed
        namespaceLODs:
          kube-system: "none"  # Skip kube-system in prod
          payment-service: "detailed"
      
      development-cluster:
        defaultNamespaceLOD: basic
        namespaceLODs:
          kube-system: "basic"  # Include kube-system in dev
          payment-service: "basic"  # Less detail in dev
    
    # Global rules (lower priority than context-specific)
    namespaceLODs:
      logging: "detailed"
```

**Result**:
- **Production cluster**:
  - `kube-system`: **none** (context-specific override)
  - `payment-service`: **detailed** (context-specific)
  - `logging`: **detailed** (global rule)
  - All others: **detailed** (context default)

- **Development cluster**:
  - `kube-system`: **basic** (context-specific override)
  - `payment-service`: **basic** (context-specific)
  - `logging`: **detailed** (global rule)
  - All others: **basic** (context default)

---

### Example 3: Selective Discovery with Defaults Set to None

**Scenario**: Disable all discovery by default, then selectively enable specific namespaces.

```yaml
workspaceName: "selective-discovery"
defaultLOD: detailed

cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/kubeconfig
    
    contexts:
      cluster-01:
        defaultNamespaceLOD: none  # Disable by default
      cluster-02:
        defaultNamespaceLOD: none
      cluster-03:
        defaultNamespaceLOD: none
    
    # Only these namespaces will be discovered
    namespaceLODs:
      production-app: "detailed"
      staging-app: "detailed"
      monitoring: "basic"
      logging: "basic"
```

**Result**:
- Only `production-app`, `staging-app`, `monitoring`, and `logging` namespaces are discovered across all clusters
- All other namespaces are skipped (LOD: none)
- This configuration works even when the same namespace exists in multiple contexts

---

### Example 4: Using Namespace Annotations

**Scenario**: Override configuration settings directly on namespace resources.

**Kubernetes Namespace YAML**:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: critical-service
  annotations:
    runwhen.com/lod: "detailed"
```

**workspaceInfo.yaml**:
```yaml
workspaceName: "annotation-demo"
defaultLOD: none

cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/kubeconfig
    
    contexts:
      my-cluster:
        defaultNamespaceLOD: basic
    
    namespaceLODs:
      critical-service: "none"  # This will be overridden
```

**Result**:
- `critical-service` namespace: **detailed** (annotation overrides everything)
- Even though config says "none", the annotation has highest priority

---

### Example 5: Complex Multi-Context with Overlapping Namespaces

**Scenario**: Real-world setup with multiple clusters, shared namespace names, and mixed LOD requirements.

```yaml
workspaceName: "enterprise-platform"
workspaceOwnerEmail: sre@enterprise.com
defaultLocation: us-east-1
defaultLOD: detailed

cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/multi-cluster.kubeconfig
    inClusterAuth: false
    
    excludeLabels:
      type:
        - "croncoderun"
        - "coderun"
    
    contexts:
      # Production clusters - restrictive by default
      prod-us-east-cluster:
        defaultNamespaceLOD: none
      prod-us-west-cluster:
        defaultNamespaceLOD: none
      prod-eu-cluster:
        defaultNamespaceLOD: none
      
      # Staging clusters - more permissive
      staging-us-cluster:
        defaultNamespaceLOD: basic
        namespaceLODs:
          test-namespace: "detailed"  # Extra detail for testing
      
      # Development clusters - full discovery
      dev-cluster:
        defaultNamespaceLOD: detailed
    
    # Global namespace rules across all clusters
    namespaceLODs:
      # Critical production services (detailed everywhere)
      backend-services: "detailed"
      frontend-services: "detailed"
      payment-processing: "detailed"
      user-authentication: "detailed"
      
      # Infrastructure services (basic everywhere)
      ingress-nginx: "basic"
      cert-manager: "basic"
      external-dns: "basic"
      
      # Monitoring/observability (detailed everywhere)
      prometheus: "detailed"
      grafana: "detailed"
      loki: "detailed"
      
      # CI/CD (basic everywhere)
      gitlab: "basic"
      argocd: "basic"
      flux-system: "basic"
      
      # Never discover these
      kube-system: "none"
      kube-public: "none"
      kube-node-lease: "none"

codeCollections: []
custom:
  kubernetes_distribution_binary: kubectl
```

**Result for `backend-services` namespace**:
- **All production clusters** (`prod-us-east-cluster`, `prod-us-west-cluster`, `prod-eu-cluster`):
  - LOD: **detailed** (global namespaceLODs overrides context default of "none")
  - SLXs generated from ALL three contexts
  
- **Staging cluster** (`staging-us-cluster`):
  - LOD: **detailed** (global namespaceLODs overrides context default of "basic")
  
- **Dev cluster** (`dev-cluster`):
  - LOD: **detailed** (matches both global rule and context default)

**Key Insight**: The `backend-services` namespace will be discovered with **detailed** LOD in **all five clusters**, even though the production clusters have `defaultNamespaceLOD: none`. This is because global `namespaceLODs` override context defaults.

---

## Multi-Context Processing

### How Multiple Contexts with Same Namespace Work

When multiple Kubernetes contexts contain namespaces with the same name:

1. **Each context processes independently**: Every context iterates through its namespaces and applies LOD rules
2. **Resources are updated, not skipped**: If a namespace is already in the registry from a previous context, it's updated with the new context's LOD and resources
3. **Each context generates SLXs**: Both contexts will emit SLXs for the namespace if the LOD is not "none"

**Example**:
```yaml
contexts:
  cluster-a:
    defaultNamespaceLOD: none
  cluster-b:
    defaultNamespaceLOD: none

namespaceLODs:
  shared-namespace: "detailed"
```

If both `cluster-a` and `cluster-b` have a namespace called `shared-namespace`:
- Context `cluster-a` processes first → discovers resources → generates SLXs
- Context `cluster-b` processes second → updates namespace → discovers resources → generates SLXs
- **Result**: SLXs generated for `shared-namespace` from **both** clusters

### Registry Behavior

The resource registry handles updates intelligently:
```
Context A: Adds namespace "backend-services" with LOD "detailed"
  → Registry creates entry
  → Resources discovered and added

Context B: Processes namespace "backend-services" with LOD "detailed"
  → Registry updates existing entry
  → New resources added from Context B
  → SLXs generated for both contexts
```

---

## Best Practices

### 1. Start Restrictive, Selectively Enable
```yaml
contexts:
  prod-cluster:
    defaultNamespaceLOD: none  # Disable by default

namespaceLODs:
  critical-app: "detailed"  # Enable only what you need
```

### 2. Use Context-Specific Overrides Sparingly
Only use per-context `namespaceLODs` when you truly need different behavior across clusters:
```yaml
contexts:
  prod-cluster:
    namespaceLODs:
      debug-tools: "none"  # Disable in prod only
  
  dev-cluster:
    namespaceLODs:
      debug-tools: "detailed"  # Enable in dev only
```

### 3. Leverage Global Rules for Shared Namespaces
Use global `namespaceLODs` for namespaces that should behave consistently:
```yaml
namespaceLODs:
  monitoring: "detailed"  # Same across all clusters
  logging: "detailed"
  ingress-nginx: "basic"
```

### 4. Use Annotations for Runtime Overrides
Add annotations when you need to temporarily change LOD without redeploying:
```bash
kubectl annotate namespace my-namespace runwhen.com/lod=detailed
```

### 5. Document Your Context Names
Ensure context names in your workspaceInfo.yaml match your kubeconfig:
```bash
# List contexts in your kubeconfig
kubectl config get-contexts

# Use exact names in workspaceInfo.yaml
contexts:
  exact-context-name-from-kubeconfig:
    defaultNamespaceLOD: basic
```

---

## Troubleshooting

### Issue: Namespace Not Being Discovered

**Check Priority Order**:
1. Does the namespace have a `runwhen.com/lod: "none"` annotation?
2. Is there a context-specific `namespaceLODs` setting to "none"?
3. Is the context `defaultNamespaceLOD` set to "none" without a global override?

**Enable Debug Logging**:
Look for these log messages:
```
INFO: Using context 'my-context' namespaceLODs for namespace 'backend-services': detailed
INFO: Adding new namespace 'backend-services' to registry from context 'my-context' with LOD 'detailed'
INFO: Context 'my-context' will process 5 namespace(s) for resources: ['ns1', 'ns2', ...]
```

### Issue: Context Name Mismatch

**Symptom**: Logs show:
```
DEBUG: Context 'my-cluster' not found in configured contexts for defaultNamespaceLOD
```

**Solution**: Verify context names match exactly:
```bash
# Get actual context names
kubectl config get-contexts -o name

# Update workspaceInfo.yaml with exact names
contexts:
  actual-context-name:  # Must match exactly
    defaultNamespaceLOD: basic
```

### Issue: Global namespaceLODs Not Overriding Context Default

**Verify Configuration Structure**:
```yaml
cloudConfig:
  kubernetes:
    contexts:
      my-context:
        defaultNamespaceLOD: none
    
    # This MUST be at the kubernetes level, not inside contexts
    namespaceLODs:
      my-namespace: "detailed"
```

---

## Testing Your Configuration

Use the provided test task to validate multi-context behavior:

```bash
cd .test/k8s/basic
task test-multi-kubeconfig
```

**Review Test Output**:
1. Check total SLXs generated
2. Verify both contexts processed the target namespaces
3. Review logs for LOD determination messages
4. Inspect generated SLXs in `output/workspaces/`

**Expected Log Output**:
```
INFO: Using global namespaceLODs for namespace 'backend-services': detailed
INFO: Adding new namespace 'backend-services' to registry from context 'cluster-01' with LOD 'detailed'
INFO: Context 'cluster-01' scanning for Kubernetes resources in namespace "backend-services" with LOD:detailed
...
INFO: Namespace 'backend-services' already exists in registry from previous context. Current context 'cluster-02' will update LOD to 'detailed' and process resources.
INFO: Context 'cluster-02' scanning for Kubernetes resources in namespace "backend-services" with LOD:detailed
```

---

## Migration Guide

### Upgrading from Previous Versions

If you previously relied on context defaults to control all namespaces:

**Old Behavior** (before v0.10.31):
- Global `namespaceLODs` were checked after context defaults
- If context had `defaultNamespaceLOD: none`, namespaces were skipped before checking global rules

**New Behavior** (v0.10.31+):
- Global `namespaceLODs` override context defaults
- Allows selective enabling of namespaces even when context default is "none"

**Migration Steps**:
1. Review your current `namespaceLODs` configuration
2. If you want namespace-specific behavior per context, move settings to context-specific `namespaceLODs`
3. Use global `namespaceLODs` for cross-context consistency
4. Test with `task test-multi-kubeconfig` before deploying

---

## Reference

### Complete Configuration Schema

```yaml
workspaceName: string
workspaceOwnerEmail: string
defaultLocation: string
defaultLOD: "none" | "basic" | "detailed"

cloudConfig:
  kubernetes:
    kubeconfigFile: string
    inClusterAuth: boolean
    
    # Context-specific configurations
    contexts:
      <context-name>:
        defaultNamespaceLOD: "none" | "basic" | "detailed"
        namespaceLODs:
          <namespace-name>: "none" | "basic" | "detailed"
    
    # Global namespace configurations
    namespaceLODs:
      <namespace-name>: "none" | "basic" | "detailed"
    
    # Optional filters
    excludeAnnotations:
      <annotation-key>: <annotation-value>
    
    excludeLabels:
      <label-key>:
        - <label-value>
    
    includeAnnotations:
      <annotation-key>: <annotation-value>
    
    includeLabels:
      <label-key>:
        - <label-value>

codeCollections: []
custom:
  kubernetes_distribution_binary: "kubectl" | "oc"
```

### Related Files

- **Source Code**: `src/indexers/kubeapi.py` (LOD determination logic)
- **Resource Registry**: `src/resources.py` (Registry.add_resource method)
- **Test Configuration**: `.test/k8s/basic/multi-kubeconfig-workspaceInfo.yaml`
- **Test Task**: `.test/k8s/basic/Taskfile.yaml` (test-multi-kubeconfig task)

---

## Support

For issues or questions:
1. Check debug logs for LOD determination messages
2. Verify context names match your kubeconfig exactly
3. Test with the multi-kubeconfig test task
4. Review this documentation's troubleshooting section

**Version**: 0.10.31+


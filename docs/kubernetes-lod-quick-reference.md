# Kubernetes LOD Quick Reference

## Priority Order (Highest → Lowest)

```
1. Namespace Annotations (kubectl annotate)
   ↓
2. Context-Specific namespaceLODs
   ↓
3. Global namespaceLODs
   ↓
4. Context defaultNamespaceLOD
   ↓
5. Global defaultLOD
```

## Common Patterns

### Pattern: Disable All, Enable Selectively

```yaml
defaultLOD: detailed
contexts:
  prod-cluster:
    defaultNamespaceLOD: none  # Disable everything
namespaceLODs:
  critical-app: "detailed"     # Enable only this
```

### Pattern: Different LOD Per Context for Same Namespace

```yaml
contexts:
  prod-cluster:
    namespaceLODs:
      shared-ns: "basic"
  dev-cluster:
    namespaceLODs:
      shared-ns: "detailed"
```

### Pattern: Consistent Cross-Cluster Discovery

```yaml
contexts:
  cluster-a:
    defaultNamespaceLOD: none
  cluster-b:
    defaultNamespaceLOD: none
namespaceLODs:
  backend-services: "detailed"  # Discovered in both clusters
```

## LOD Levels

| Level | Description |
|-------|-------------|
| `none` | Skip namespace completely |
| `basic` | Basic resources (deployments, services, pods) |
| `detailed` | Comprehensive discovery (jobs, configmaps, ingresses, etc.) |

## Quick Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| Namespace not discovered | Context default is `none` | Add to global `namespaceLODs` |
| Wrong context name | Logs show "not found" | Run `kubectl config get-contexts` |
| Annotation not working | Annotation key | Use `runwhen.com/lod` |
| Global rule not applying | Config structure | Ensure `namespaceLODs` is under `kubernetes:` not `contexts:` |

## Configuration Template

```yaml
workspaceName: "my-workspace"
defaultLOD: detailed

cloudConfig:
  kubernetes:
    kubeconfigFile: /shared/kubeconfig
    
    contexts:
      my-context:
        defaultNamespaceLOD: basic
        namespaceLODs:          # Context-specific (highest config priority)
          special-ns: "detailed"
    
    namespaceLODs:              # Global (overrides context defaults)
      common-ns: "detailed"
```

## Testing

```bash
cd .test/k8s/basic
task test-multi-kubeconfig
```

## Namespace Annotation Override

```bash
# Override any configuration
kubectl annotate namespace my-ns runwhen.com/lod=detailed

# Remove override
kubectl annotate namespace my-ns runwhen.com/lod-
```

## Multi-Context Behavior

**Same namespace in multiple contexts = Multiple SLX generations**

```yaml
# Both contexts will generate SLXs for backend-services
contexts:
  cluster-a:
    defaultNamespaceLOD: none
  cluster-b:
    defaultNamespaceLOD: none
namespaceLODs:
  backend-services: "detailed"
```

Result: SLXs from **both** cluster-a and cluster-b

---

See [kubernetes-lod-configuration.md](./kubernetes-lod-configuration.md) for detailed examples and explanations.


# Kubernetes Level of Detail (LOD) Configuration

Documentation for controlling Kubernetes resource discovery across multiple clusters and contexts.

## 📚 Available Documents

| Document | Purpose | Audience |
|----------|---------|----------|
| [**Kubernetes LOD Configuration Guide**](./kubernetes-lod-configuration.md) | Complete guide with detailed examples and explanations | All users - comprehensive reference |
| [**Kubernetes LOD Quick Reference**](./kubernetes-lod-quick-reference.md) | Quick lookup for priority order and common patterns | Experienced users - fast reference |
| [**Kubernetes LOD Flowchart**](./kubernetes-lod-flowchart.md) | Visual decision tree and flow diagrams | Visual learners - understanding the logic |
| [**Example Configuration**](./examples/workspaceInfo-multi-context-example.yaml) | Copy-paste ready configuration template | New users - getting started |

## 🚀 Quick Start

1. **New to LOD configuration?**
   - Start with the [Example Configuration](./examples/workspaceInfo-multi-context-example.yaml)
   - Copy it and customize for your environment
   - Refer to the [Configuration Guide](./kubernetes-lod-configuration.md) for detailed explanations

2. **Need a quick refresher?**
   - Use the [Quick Reference](./kubernetes-lod-quick-reference.md)
   - Check the priority order and common patterns
   - View the [Flowchart](./kubernetes-lod-flowchart.md) for visual decision logic

3. **Troubleshooting issues?**
   - See the [Configuration Guide - Troubleshooting section](./kubernetes-lod-configuration.md#troubleshooting)
   - Enable debug logging to see LOD determination

## 🎯 Key Concepts

**Level of Detail (LOD)** controls the depth of Kubernetes resource discovery:
- `none` - Skip namespace
- `basic` - Basic resources only
- `detailed` - Comprehensive discovery

**Priority Order** (highest to lowest):
1. Namespace annotations
2. Context-specific namespaceLODs
3. Global namespaceLODs
4. Context defaultNamespaceLOD
5. Global defaultLOD

**Multi-Context Support**: The same namespace name can exist in multiple Kubernetes contexts, and RunWhen Local will process each independently, generating SLXs from all matching contexts.

## 📖 Documentation Structure

```
docs/
├── kubernetes-lod-index.md (this file)
├── kubernetes-lod-configuration.md       # Comprehensive guide
├── kubernetes-lod-quick-reference.md     # Quick reference
├── kubernetes-lod-flowchart.md           # Visual decision tree
└── examples/
    └── workspaceInfo-multi-context-example.yaml   # Template
```

## 🧪 Testing Your Configuration

Test your multi-context LOD configuration:

```bash
cd .test/k8s/basic
task test-multi-kubeconfig
```

This will:
- Build RunWhen Local container
- Run discovery with multi-context kubeconfig
- Show LOD determination for each namespace
- Generate SLXs for matching namespaces
- Display summary of results

## 🔍 Common Use Cases

**Use Case 1: Selective Discovery Across Production Clusters**
```yaml
contexts:
  prod-cluster-01:
    defaultNamespaceLOD: none
  prod-cluster-02:
    defaultNamespaceLOD: none
namespaceLODs:
  critical-service: "detailed"  # Only this namespace discovered
```

**Use Case 2: Different LOD Per Environment**
```yaml
contexts:
  production:
    namespaceLODs:
      my-app: "basic"
  development:
    namespaceLODs:
      my-app: "detailed"
```

**Use Case 3: Override with Annotations**
```bash
# Temporarily enable detailed discovery
kubectl annotate namespace my-app runwhen.com/lod=detailed
```

## 📝 Version History

- **v0.10.31**: 
  - Fixed global namespaceLODs priority to override context defaults
  - Enhanced multi-context namespace processing
  - Added comprehensive logging for LOD determination
  - Support for per-context namespaceLODs

## 🤝 Contributing

When adding new documentation:
1. Keep examples clear and commented
2. Include troubleshooting sections
3. Update this index with links
4. Test all configuration examples

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting section](./kubernetes-lod-configuration.md#troubleshooting)
2. Review debug logs with LOD determination messages
3. Test with the multi-kubeconfig test task
4. Verify context names match your kubeconfig exactly

## 🔗 Related Resources

- Source Code: `src/indexers/kubeapi.py` (LOD logic)
- Resource Registry: `src/resources.py`
- Test Configuration: `.test/k8s/basic/multi-kubeconfig-workspaceInfo.yaml`
- Test Tasks: `.test/k8s/basic/Taskfile.yaml`

---

**Last Updated**: Version 0.10.31


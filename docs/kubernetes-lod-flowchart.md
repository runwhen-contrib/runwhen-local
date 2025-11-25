# Kubernetes LOD Determination Flowchart

This document provides a visual flowchart of how RunWhen Local determines the Level of Detail (LOD) for each namespace during Kubernetes discovery.

## Decision Flow

```
┌─────────────────────────────────────────────────────────┐
│  Start: Processing Namespace in Context                 │
│  Namespace: "backend-services"                          │
│  Context: "production-cluster"                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Step 1: Check Namespace Annotations                    │
│  Does namespace have runwhen.com/lod annotation?        │
└────────────┬────────────────────────┬───────────────────┘
             │ YES                    │ NO
             │                        │
             ▼                        ▼
    ┌────────────────┐      ┌─────────────────────────────────────┐
    │ USE ANNOTATION │      │  Step 2: Check Context-Specific     │
    │ LOD (HIGHEST   │      │  namespaceLODs                      │
    │ PRIORITY)      │      │  Is namespace in context config?    │
    │                │      │  contexts:                          │
    │ ✅ FINAL       │      │    production-cluster:              │
    └────────────────┘      │      namespaceLODs:                 │
                            │        backend-services: ?          │
                            └──────────┬──────────────────┬───────┘
                                       │ YES              │ NO
                                       │                  │
                                       ▼                  ▼
                            ┌────────────────────┐  ┌────────────────────────────┐
                            │ USE CONTEXT-       │  │  Step 3: Check Global      │
                            │ SPECIFIC           │  │  namespaceLODs             │
                            │ namespaceLODs      │  │  Is namespace in global    │
                            │                    │  │  config?                   │
                            │ ✅ FINAL           │  │  namespaceLODs:            │
                            └────────────────────┘  │    backend-services: ?     │
                                                    └─────┬──────────────┬───────┘
                                                          │ YES          │ NO
                                                          │              │
                                                          ▼              ▼
                                                ┌──────────────────┐  ┌────────────────────┐
                                                │ USE GLOBAL       │  │  Step 4: Check     │
                                                │ namespaceLODs    │  │  Context Default   │
                                                │                  │  │  contexts:         │
                                                │ ✅ FINAL         │  │    production:     │
                                                └──────────────────┘  │      default       │
                                                                      │      NamespaceLOD  │
                                                                      └──────┬─────────────┘
                                                                             │
                                                                             ▼
                                                                    ┌───────────────────┐
                                                                    │ USE CONTEXT       │
                                                                    │ defaultNamespace  │
                                                                    │ LOD (if set)      │
                                                                    │                   │
                                                                    │ If not set ↓      │
                                                                    └────────┬──────────┘
                                                                             │
                                                                             ▼
                                                                    ┌───────────────────┐
                                                                    │  Step 5: Use      │
                                                                    │  Global defaultLOD│
                                                                    │  (FINAL FALLBACK) │
                                                                    │                   │
                                                                    │ ✅ FINAL          │
                                                                    └───────────────────┘
```

## Priority Summary

```
┌────────────────────────────────────────────────────────────────┐
│                     PRIORITY HIERARCHY                          │
│                (Higher position = Higher priority)              │
├────────────────────────────────────────────────────────────────┤
│  🥇 LEVEL 1: Namespace Annotations                             │
│     kubectl annotate namespace X runwhen.com/lod=detailed      │
│     → ALWAYS WINS, overrides all config                        │
├────────────────────────────────────────────────────────────────┤
│  🥈 LEVEL 2: Context-Specific namespaceLODs                    │
│     contexts:                                                   │
│       my-context:                                              │
│         namespaceLODs:                                         │
│           my-namespace: "detailed"                             │
│     → Most specific configuration setting                      │
├────────────────────────────────────────────────────────────────┤
│  🥉 LEVEL 3: Global namespaceLODs                              │
│     namespaceLODs:                                             │
│       my-namespace: "detailed"                                 │
│     → Overrides context defaults, applies across all contexts  │
├────────────────────────────────────────────────────────────────┤
│  4️⃣ LEVEL 4: Context defaultNamespaceLOD                      │
│     contexts:                                                   │
│       my-context:                                              │
│         defaultNamespaceLOD: "basic"                           │
│     → Default for this context only                            │
├────────────────────────────────────────────────────────────────┤
│  5️⃣ LEVEL 5: Global defaultLOD                                │
│     defaultLOD: "basic"                                        │
│     → System-wide fallback                                     │
└────────────────────────────────────────────────────────────────┘
```

## Example Scenarios

### Scenario 1: All Levels Present

**Configuration:**
```yaml
defaultLOD: basic                           # Level 5

contexts:
  prod-cluster:
    defaultNamespaceLOD: none               # Level 4
    namespaceLODs:
      backend-services: "basic"             # Level 2

namespaceLODs:
  backend-services: "detailed"              # Level 3
```

**Namespace Annotation:**
```yaml
metadata:
  annotations:
    runwhen.com/lod: "none"                 # Level 1
```

**Result for `backend-services` in `prod-cluster`:**
```
✅ Final LOD: none (from namespace annotation - Level 1)
```

**Decision Path:**
1. ✅ Check annotation → Found "none" → **USE THIS**
2. ⏭️  Skip remaining checks

---

### Scenario 2: No Annotation, Context-Specific Config Present

**Configuration:**
```yaml
defaultLOD: basic                           # Level 5

contexts:
  prod-cluster:
    defaultNamespaceLOD: none               # Level 4
    namespaceLODs:
      backend-services: "basic"             # Level 2

namespaceLODs:
  backend-services: "detailed"              # Level 3
```

**No Namespace Annotation**

**Result for `backend-services` in `prod-cluster`:**
```
✅ Final LOD: basic (from context-specific namespaceLODs - Level 2)
```

**Decision Path:**
1. ⏭️  Check annotation → Not found
2. ✅ Check context-specific namespaceLODs → Found "basic" → **USE THIS**
3. ⏭️  Skip remaining checks

---

### Scenario 3: No Annotation, No Context Config, Global Config Present

**Configuration:**
```yaml
defaultLOD: basic                           # Level 5

contexts:
  prod-cluster:
    defaultNamespaceLOD: none               # Level 4
    # No namespaceLODs for this context

namespaceLODs:
  backend-services: "detailed"              # Level 3
```

**No Namespace Annotation**

**Result for `backend-services` in `prod-cluster`:**
```
✅ Final LOD: detailed (from global namespaceLODs - Level 3)
```

**Decision Path:**
1. ⏭️  Check annotation → Not found
2. ⏭️  Check context-specific namespaceLODs → Not found
3. ✅ Check global namespaceLODs → Found "detailed" → **USE THIS**
4. ⏭️  Skip remaining checks

**Key Insight:** Global namespaceLODs overrides the context default of "none"!

---

### Scenario 4: Only Context Default

**Configuration:**
```yaml
defaultLOD: basic                           # Level 5

contexts:
  prod-cluster:
    defaultNamespaceLOD: none               # Level 4
```

**No Namespace Annotation**
**Namespace not in any namespaceLODs**

**Result for `backend-services` in `prod-cluster`:**
```
✅ Final LOD: none (from context defaultNamespaceLOD - Level 4)
```

**Decision Path:**
1. ⏭️  Check annotation → Not found
2. ⏭️  Check context-specific namespaceLODs → Not found
3. ⏭️  Check global namespaceLODs → Not found
4. ✅ Check context defaultNamespaceLOD → Found "none" → **USE THIS**
5. ⏭️  Skip global default

---

### Scenario 5: Only Global Default

**Configuration:**
```yaml
defaultLOD: detailed                        # Level 5

contexts:
  prod-cluster:
    # No defaultNamespaceLOD set
```

**No Namespace Annotation**
**Namespace not in any namespaceLODs**

**Result for `backend-services` in `prod-cluster`:**
```
✅ Final LOD: detailed (from global defaultLOD - Level 5)
```

**Decision Path:**
1. ⏭️  Check annotation → Not found
2. ⏭️  Check context-specific namespaceLODs → Not found
3. ⏭️  Check global namespaceLODs → Not found
4. ⏭️  Check context defaultNamespaceLOD → Not set
5. ✅ Use global defaultLOD → Found "detailed" → **USE THIS**

---

## Multi-Context Processing Flow

When the same namespace exists in multiple contexts:

```
┌──────────────────────────────────────────────────────────┐
│  Multi-Context Processing                                 │
│  Namespace "backend-services" exists in:                  │
│  - cluster-a                                              │
│  - cluster-b                                              │
└───────────────────────┬──────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│ Process in      │            │ Process in      │
│ cluster-a       │            │ cluster-b       │
│                 │            │                 │
│ Apply LOD rules │            │ Apply LOD rules │
│ for cluster-a   │            │ for cluster-b   │
└────────┬────────┘            └────────┬────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│ Discover        │            │ Discover        │
│ resources in    │            │ resources in    │
│ cluster-a       │            │ cluster-b       │
└────────┬────────┘            └────────┬────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│ Generate SLXs   │            │ Generate SLXs   │
│ for cluster-a   │            │ for cluster-b   │
└─────────────────┘            └─────────────────┘

Result: SLXs generated from BOTH contexts
(if LOD is not "none" in each context)
```

### Example: Global namespaceLODs with Multiple Contexts

**Configuration:**
```yaml
contexts:
  cluster-a:
    defaultNamespaceLOD: none
  cluster-b:
    defaultNamespaceLOD: none
  cluster-c:
    defaultNamespaceLOD: basic

namespaceLODs:
  backend-services: "detailed"
```

**Processing Flow:**

```
Context: cluster-a
  Namespace: backend-services
    1. No annotation
    2. No context-specific config
    3. ✅ Global namespaceLODs: "detailed"
    → LOD = detailed
    → Discover resources
    → Generate SLXs

Context: cluster-b
  Namespace: backend-services
    1. No annotation
    2. No context-specific config
    3. ✅ Global namespaceLODs: "detailed"
    → LOD = detailed
    → Discover resources
    → Generate SLXs

Context: cluster-c
  Namespace: backend-services
    1. No annotation
    2. No context-specific config
    3. ✅ Global namespaceLODs: "detailed"
    → LOD = detailed (overrides context default of "basic")
    → Discover resources
    → Generate SLXs

Total SLXs: Generated from ALL THREE contexts
```

---

## Quick Decision Table

| Annotation | Context LODs | Global LODs | Context Default | Global Default | **Final LOD** | **Source** |
|:----------:|:------------:|:-----------:|:---------------:|:--------------:|:-------------:|:----------:|
| ✅ detailed | ✅ basic | ✅ none | ✅ none | ✅ basic | **detailed** | Annotation |
| ❌ | ✅ detailed | ✅ basic | ✅ none | ✅ basic | **detailed** | Context LODs |
| ❌ | ❌ | ✅ detailed | ✅ none | ✅ basic | **detailed** | Global LODs |
| ❌ | ❌ | ❌ | ✅ basic | ✅ detailed | **basic** | Context Default |
| ❌ | ❌ | ❌ | ❌ | ✅ detailed | **detailed** | Global Default |

---

## Related Documentation

- [Complete Configuration Guide](./kubernetes-lod-configuration.md)
- [Quick Reference](./kubernetes-lod-quick-reference.md)
- [Example Configuration](./examples/workspaceInfo-multi-context-example.yaml)

**Version:** 0.10.31+


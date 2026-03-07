# Tag & Hierarchy Template Contract

This document defines the conventions that all platform tag and hierarchy
templates **must** follow. It applies to every file under
`src/templates/*-tags.yaml` and `src/templates/*-hierarchy.yaml`.

---

## 1. Core Concepts

| Concept | Definition |
|---------|-----------|
| **Hierarchy** | Ordered list of tag names that define the `resourcePath` segments for an SLX. |
| **Tags** | Key/value metadata attached to each SLX. Every hierarchy entry must have a corresponding tag. |
| **Qualifiers** | Fields from the generation rule that determine the SLX's scope (e.g. `["project"]`, `["resource"]`). |
| **Resource-scoped** | The generation rule includes `resource` in its qualifiers list — one SLX per individual resource. |
| **Group-scoped** | The generation rule does NOT include `resource` — one SLX per grouping (project, account, namespace, etc.) covering many child resources. |

---

## 2. Hierarchy Rules

### 2.1 Structure

Each hierarchy template produces an ordered YAML list:

```
platform → organisational scopes → leaf
```

**Examples by platform:**

| Platform | Organisational scopes | Leaf (resource-scoped) | Leaf (group-scoped) |
|----------|----------------------|----------------------|-------------------|
| GCP | `project_id`, `location` | `resource_name` | `resource_type` |
| AWS | `account_name`, `region` | `resource_name` | `resource_type` |
| Azure ARM | `subscription_name`, `resource_group` | `resource_name` | `resource_type` |
| Azure DevOps | `organization`, `project` | `resource_name` | `resource_type` |
| Kubernetes | `cluster`, `namespace` | `resource_name` | `resource_type` |

### 2.2 Leaf Entry Rule

The last entry in the hierarchy is determined by the SLX scope:

```jinja
{% if qualifiers and qualifiers.resource is defined %}
    - resource_name
{% elif match_resource.resource_type is defined %}
    - resource_type
{% endif %}
```

- **Resource-scoped** → `resource_name` (identifies a specific instance).
- **Group-scoped** → `resource_type` (identifies the category of resources).

**Never** fall back to `resource_name` via `match_resource.name` for
group-scoped SLXs. That would pick one arbitrary child resource and produce
a misleading path.

### 2.3 Resulting Paths

| Scope | Example qualifiers | resourcePath |
|-------|-------------------|-------------|
| Resource | `["resource"]` | `gcp/my-project/us-central1/my-bucket` |
| Project | `["project"]` | `gcp/my-project/us-central1/gcp_storage_buckets` |
| Namespace | `["namespace"]` | `kubernetes/prod-cluster/default/deployment` |
| Namespace (CRD) | `["namespace"]` | `kubernetes/prod-cluster/default/kustomization` |
| Resource (CRD) | `["resource"]` | `kubernetes/prod-cluster/default/online-boutique-prod` |
| Resource Group | `["resource_group"]` | `azure/my-sub/my-rg/azure_compute_disks` |

---

## 3. Tag Rules

### 3.1 Required Standard Tags

Every tags template **must** emit these tags (when values are available):

| Tag name | Required | Notes |
|----------|----------|-------|
| `platform` | Always | Static value: `gcp`, `aws`, `azure`, `azure_devops`, `kubernetes` |
| `resource_type` | Always | From `match_resource.resource_type.name`; for K8s CRDs use `kind \| lower` (see 3.4) |
| `resource_name` | Resource-scoped only | Only when `qualifiers.resource` or `qualifiers.resource_group` is defined |
| `child_resource` | Group-scoped | One tag per entry in `child_resource_names`, deduplicated against `resource_name` |

### 3.2 resource_name Emission

Emit `resource_name` **only** when the SLX is scoped to a specific resource:

```jinja
{% if qualifiers and qualifiers.resource is defined %}
    - name: resource_name
      value: '{{ qualifiers.resource | string }}'
{% elif qualifiers and qualifiers.resource_group is defined %}
    - name: resource_name
      value: '{{ qualifiers.resource_group | string }}'
{% endif %}
```

Do **not** add an `else` or `elif match_resource.name` fallback. For
group-scoped SLXs, the individual resources appear as `child_resource` tags.

### 3.3 child_resource Deduplication

When a child resource name is identical to the `resource_name` value, skip it.
**Both sides of the comparison must apply identical normalization:**

```jinja
{% set _resource_name_value = (...) | default('') | string | replace(":", "_") | replace("/", "_") %}
{% for cr in child_resource_names | default([]) %}
{% set _cr_value = cr | string | replace(":", "_") | replace("/", "_") %}
{% if _cr_value != _resource_name_value %}
    - name: child_resource
      value: '{{ _cr_value }}'
{% endif %}
{% endfor %}
```

Asymmetric normalization (applying `replace` to one side but not the other)
defeats deduplication when names contain `:` or `/`.

### 3.4 Kubernetes CRD Conventions

Kubernetes custom resources (CRDs) require special handling because they are
all registered under a single internal `ResourceType` named `"custom"`.

**resource_type tag:** The kubernetes tags template must use the resource's
`kind` (lowercased) instead of the generic `"custom"`:

```jinja
{% if match_resource.resource_type.name == "custom" and match_resource.kind is defined %}
    - name: resource_type
      value: '{{ match_resource.kind | lower | string }}'
{% elif match_resource.resource_type %}
    - name: resource_type
      value: '{{ match_resource.resource_type.name | string }}'
{% endif %}
```

This produces values like `kustomization`, `helmrelease` — lowercase to be
consistent with built-in types (`deployment`, `statefulset`).

**resource_name:** CRD resources are indexed with their simple Kubernetes
metadata name (e.g. `online-boutique-prod`), not the composite
`plural_group_version_name` format. The composite is only used internally
for the `qualified_name` registry key. Templates, `child_resource_names`,
and qualifier values all receive the simple name.

**API version deduplication:** When a generation rule references a CRD
without pinning a version, the indexer queries only the **preferred** API
version (not all versions). This prevents the same physical resource from
appearing multiple times under different API versions.

### 3.5 Platform-Specific Tags

After the standard tags above, each platform appends its own enrichment tags:

| Platform | Tag pattern | Example |
|----------|------------|---------|
| GCP | `gcp_project_id`, `gcp_region`, `gcp_label_*` | `gcp_label_env: prod` |
| AWS | `[aws]key` | `[aws]Environment: production` |
| Azure | `[azure]key` | `[azure]department: engineering` |
| Kubernetes | `[k8s]key` | `[k8s]app.kubernetes.io/name: nginx` |

---

## 4. resourcePath Computation

`resourcePath` is **never** set in templates. It is always derived at render
time by `compute_resource_path_from_hierarchy()` in
`src/renderers/render_output_items.py`:

1. Read the `hierarchy` list from `spec.additionalContext.hierarchy`.
2. Build a lookup from `spec.tags` (tag name → first value).
3. If `resource_name` is in the hierarchy and is redundant (its value
   duplicates an organisational scope entry), skip it.
4. Join the remaining tag values with `/` to form `resourcePath`.

**Do not** add `resourcePath` or `qualified_name` logic to templates.

---

## 5. Generation Rule Qualifiers

The `qualifiers` list in a generation rule determines the SLX scope and
directly controls which tags and hierarchy entries appear:

| Qualifier includes | SLX scope | Hierarchy leaf | resource_name tag | child_resource tags |
|-------------------|-----------|---------------|-------------------|-------------------|
| `resource` | Individual resource | `resource_name` | Yes | No (empty list) |
| Not `resource` | Group | `resource_type` | No | Yes (all children) |

The `child_resource_names` template variable is populated only when
`resource` is **not** in the qualifier list. It contains the names of all
resources that matched the generation rule within that group scope.

---

## 6. Checklist for New Providers

When adding support for a new cloud platform:

- [ ] Create `src/templates/<platform>-hierarchy.yaml` following the leaf rule (Section 2.2)
- [ ] Create `src/templates/<platform>-tags.yaml` emitting all required standard tags (Section 3.1)
- [ ] Ensure `resource_type` is always emitted as a tag
- [ ] Emit `resource_name` only when resource-scoped (Section 3.2)
- [ ] Include the `child_resource` deduplication loop (Section 3.3)
- [ ] Append platform-specific enrichment tags after the standard block
- [ ] Verify `resourcePath` is computed correctly (not set manually)
- [ ] Test with both resource-scoped and group-scoped generation rules
- [ ] For Kubernetes: verify CRD `resource_type` shows `kind | lower`, not `custom`
- [ ] For Kubernetes: verify CRD `resource_name` shows simple K8s name, not composite

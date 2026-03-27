# Tag & Hierarchy Template Contract

This document defines the conventions that all platform tag and hierarchy
templates **must** follow. It applies to every file under
`src/templates/*-tags.yaml` and `src/templates/*-hierarchy.yaml`.

---

## 1. Core Concepts

| Concept | Definition |
|---------|-----------|
| **Hierarchy** | Ordered list of tag names that define the `resourcePath` segments for an SLX. Always ends with `resource_name`. |
| **Tags** | Key/value metadata attached to each SLX. Every hierarchy entry must have a corresponding tag. |
| **Qualifiers** | Fields from the generation rule that determine the SLX's scope (e.g. `["project"]`, `["resource"]`, `["namespace", "cluster"]`). Ordered from most-specific to broadest. |
| **resource_name** | Always the value of the **most-specific qualifier present**. Falls back to `match_resource.name` when no qualifier matches. Represents the primary scope of the SLX. |
| **Resource-scoped** | The generation rule includes `resource` in its qualifiers list — one SLX per individual resource. |
| **Group-scoped** | The generation rule does NOT include `resource` — one SLX per grouping (project, account, namespace, etc.) covering many child resources. |

---

## 2. Hierarchy Rules

### 2.1 Structure

Each hierarchy template produces an ordered YAML list:

```
platform → parent scopes → resource_name
```

The hierarchy **always** ends with `resource_name`. Parent scopes appear
**only when a more-specific qualifier exists** — a scope is never both a
parent entry and the `resource_name`. Non-qualifier details like `location`
are **not** included in the hierarchy — they exist only as informational tags.

### 2.2 Parent Inclusion Rule

A scope entry appears in the hierarchy **only** when there is a qualifier
more specific than it. This prevents duplication between a parent entry and
`resource_name`:

| Platform | Parent scope | Included when qualifier exists |
|----------|-------------|-------------------------------|
| GCP | `project_id` | `resource` |
| AWS | `account_name` | `resource` or `region` |
| AWS | `region` | `resource` |
| Azure ARM | `subscription_name` | `resource` or `resource_group` |
| Azure ARM | `resource_group` | `resource` |
| Azure DevOps | `organization` | `project`, or `resource` when the match is **not** `organization` |
| Azure DevOps | `project` | `resource` when the match is **not** `organization` or `project` |

For Azure DevOps, `match_resource.resource_type.name` gates parents so an
organization-scoped SLX does not list `organization` twice, and a project-
scoped SLX does not list `project` when `resource_name` is already the
project (see `azure-tags.yaml` for the same `organization` guard).
| Kubernetes | `cluster` | `resource` or `namespace` |
| Kubernetes | `namespace` | `resource` |

### 2.3 Leaf Entry Rule

The last entry in the hierarchy is **always** `resource_name`:

```jinja
    - resource_name
```

There is no conditional — `resource_name` is unconditionally the leaf of
every hierarchy. `resource_type` never appears in the hierarchy.

### 2.4 Resulting Paths

| Scope | Example qualifiers | resource_name value | resourcePath |
|-------|-------------------|-------------------|-------------|
| Resource (GCP) | `["resource", "project"]` | `my-bucket` | `gcp/my-project/my-bucket` |
| Project (GCP) | `["project"]` | `my-project` | `gcp/my-project` |
| Resource (K8s) | `["resource", "namespace", "cluster"]` | `my-pod` | `kubernetes/my-cluster/default/my-pod` |
| Namespace (K8s) | `["namespace", "cluster"]` | `online-boutique-dev` | `kubernetes/sandbox-cluster-1/online-boutique-dev` |
| Cluster (K8s) | `["cluster"]` | `sandbox-cluster-1` | `kubernetes/sandbox-cluster-1` |
| Resource (AWS) | `["resource", "region", "account_name"]` | `my-bucket` | `aws/my-account/us-east-1/my-bucket` |
| Region (AWS) | `["region", "account_name"]` | `us-east-1` | `aws/my-account/us-east-1` |
| Account (AWS) | `["account_name"]` | `my-account` | `aws/my-account` |
| Resource (Azure) | `["resource", "resource_group", "subscription_name"]` | `my-vm` | `azure/my-sub/my-rg/my-vm` |
| Resource Group (Azure) | `["resource_group", "subscription_name"]` | `my-rg` | `azure/my-sub/my-rg` |
| Subscription (Azure) | `["subscription_name"]` | `my-sub` | `azure/my-sub` |

---

## 3. Tag Rules

### 3.1 Required Standard Tags

Every tags template **must** emit these tags (when values are available):

| Tag name | Required | Notes |
|----------|----------|-------|
| `platform` | Always | Static value: `gcp`, `aws`, `azure`, `azure_devops`, `kubernetes` |
| `resource_type` | Always | From `match_resource.resource_type.name`; for K8s CRDs use `kind \| lower` (see 3.4) |
| `resource_name` | Always | From the most-specific qualifier value, or `match_resource.name` as fallback |
| `child_resource` | Group-scoped | One tag per entry in `child_resource_names`, deduplicated against `resource_name` |

### 3.2 resource_name Emission

`resource_name` is **always** the value of the **most-specific qualifier
present**, determined by a fixed specificity chain per platform. The order
qualifiers appear in the generation rule does **not** affect the output.

Each platform template checks qualifiers from most-specific to broadest and
picks the first one that is defined:

| Platform | Specificity chain (most → least) |
|----------|----------------------------------|
| GCP | `resource` > `project` |
| Kubernetes | `resource` > `namespace` > `cluster` |
| AWS | `resource` > `region` > `account_name` > `account_id` |
| Azure ARM | `resource` > `resource_group` > `subscription_name` > `subscription_id` |
| Azure DevOps | `resource` > `project` > `organization` |

**Example (GCP):**

```jinja
{% set _rn_val = qualifiers.resource if qualifiers and qualifiers.resource is defined else (qualifiers.project if qualifiers and qualifiers.project is defined else (match_resource.name if match_resource.name is defined else '')) %}
{% if _rn_val %}
    - name: resource_name
      value: '{{ _rn_val | string }}'
{% endif %}
```

**How it works:**

- **Qualifier `resource`** → `resource_name` = the resource's own name.
- **Qualifier `project`** → `resource_name` = the project name.
- **Qualifier `namespace`** → `resource_name` = the namespace name.
- **Qualifier `cluster`** → `resource_name` = the cluster name.
- **Qualifier `resource_group`** → `resource_name` = the resource group name.
- **Qualifier `subscription_name`** → `resource_name` = the subscription name.
- **No qualifiers** → falls back to `match_resource.name`.

The `resource_name` always represents the scope of the SLX — what is being
monitored. It is **never** set to `resource_type`.

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

The `_resource_name_value` follows the same specificity-chain logic, reusing
`_rn_val` which was already computed:

```jinja
{% set _resource_name_value = _rn_val | default('') | string | replace(":", "_") | replace("/", "_") %}
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
3. Walk the hierarchy in order, collecting each tag's value.
4. Join values with `/` to form `resourcePath`.

`resource_name` is **always** included in the path, even when its value
duplicates a parent entry. The hierarchy is the single source of truth.

**Do not** add `resourcePath` or `qualified_name` logic to templates.

---

## 5. Generation Rule Qualifiers

The `qualifiers` list in a generation rule determines the SLX scope and
directly controls which tags and hierarchy entries appear:

| Qualifier includes | SLX scope | resource_name value | child_resource tags |
|-------------------|-----------|-------------------|-------------------|
| `resource` | Individual resource | Resource's own name | No (empty list) |
| `project` only | GCP project | Project name | Yes (all matched resources) |
| `namespace`, `cluster` | K8s namespace | Namespace name | Yes (all matched resources) |
| `cluster` only | K8s cluster | Cluster name | Yes (all matched resources) |
| `resource_group` | Azure RG | Resource group name | Yes (all matched resources) |

The `child_resource_names` template variable is populated only when
`resource` is **not** in the qualifier list. It contains the names of all
resources that matched the generation rule within that group scope.

---

## 6. Render-Time Validation

After each template is rendered and parsed as YAML, `validate_rendered_yaml()`
in `src/renderers/render_output_items.py` checks structural invariants before
any post-processing (deduplication, resourcePath computation):

| Check | What it prevents |
|-------|-----------------|
| Every `hierarchy` entry is a `str` | Dict entries caused by missing trailing newlines in included hierarchy templates |
| Every tag entry is a mapping (`dict`) | Malformed YAML producing scalar or list tag entries |
| Tag `name` is a `str` | Non-string keys breaking deduplication lookups |
| Tag `value` is a scalar (not `dict`/`list`) | Complex values that break tag hashing |

If validation fails, the SLX is skipped and a `WorkspaceBuilderException` is
raised with an actionable message pointing to the likely root cause.

### Directory-level skip on SLX failure

Output items are sorted so that `slx.yaml` is always rendered **before** its
siblings (runbooks, SLIs, etc.) in the same directory. When `slx.yaml` fails
to render, all remaining files in that directory are skipped — you cannot
upload a runbook or SLI without its parent SLX.

A failure in a non-SLX file (e.g. a runbook template error) does **not** skip
its siblings. Only the `slx.yaml` primary file acts as the gate for the
directory.

---

## 7. Checklist for New Providers

When adding support for a new cloud platform:

- [ ] Create `src/templates/<platform>-hierarchy.yaml` ending with `- resource_name`
- [ ] Create `src/templates/<platform>-tags.yaml` emitting all required standard tags (Section 3.1)
- [ ] Ensure `resource_type` is always emitted as a tag (but never in hierarchy)
- [ ] Emit `resource_name` from the most-specific qualifier per the platform's specificity chain (Section 3.2)
- [ ] Include the `child_resource` deduplication loop (Section 3.3)
- [ ] Append platform-specific enrichment tags after the standard block
- [ ] Verify `resourcePath` is computed correctly (not set manually)
- [ ] Test with both resource-scoped and group-scoped generation rules
- [ ] For Kubernetes: verify CRD `resource_type` shows `kind | lower`, not `custom`
- [ ] For Kubernetes: verify CRD `resource_name` shows simple K8s name, not composite

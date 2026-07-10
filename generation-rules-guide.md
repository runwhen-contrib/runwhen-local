# Generation Rules Usage Guide

## Basic Structure

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: <platform-name>  # azure, kubernetes, gcp, aws, runwhen
  generationRules:
    - resourceTypes: [<resource-types>]
      matchRules: [<match-rules>]
      slxs: [<slx-definitions>]
      outputItems: [<output-items>]  # Optional: direct output items
```

## Resource Type Specifications

Each rule block lists names under `resourceTypes`. The file-level **`spec.platform`**
(`azure`, `kubernetes`, `aws`, `gcp`, `runwhen`) is the default platform for
every entry in that file unless an entry overrides it.

### Typical names (canonical + aliases)

Indexers resolve names through per-platform registries. Use the **CloudQuery table
name** (canonical) or a documented **alias** — both work when `spec.platform`
is set:

```yaml
# spec.platform: azure
resourceTypes:
  - azure_compute_virtual_machines    # canonical
  - virtual_machine                   # alias → same type as above
  - azure_appservice_web_apps

# spec.platform: kubernetes
resourceTypes:
  - deployment
  - pod
  - buckets.storage.gcp.upbound.io    # CRD: plural.group[/version]

# spec.platform: aws
resourceTypes:
  - aws_ec2_instances
  - aws_s3_buckets

# spec.platform: gcp
resourceTypes:
  - gcp_compute_instances
  - gcp_storage_buckets

# spec.platform: runwhen  (MCP tool-builder / workspace-scoped SLXs)
resourceTypes:
  - workspace
```

Full lists: [`docs/authoring/indexed-resources/`](../docs/authoring/indexed-resources/)
and the generated `*-resource-catalog.md` files (regenerated from indexer code).

### Optional platform override (`platform:type`)

Only the **first** `:` splits platform from type. Use this when one entry must
target a different platform than `spec.platform` (uncommon):

```yaml
spec:
  platform: azure
  generationRules:
    - resourceTypes:
        - resource_group           # → azure (from spec.platform)
        - kubernetes:deployment    # → kubernetes (override for this entry)
```

This is **not** “cross-platform matching” in one rule — it selects which indexer
serves that entry. Prefer **separate generation-rule files** per `spec.platform`.

Kubernetes CRDs use `plural.group[/version]` (dots in the group; optional
`/version`). Do not confuse CRD syntax with `platform:type` overrides.

### Dict form

```yaml
resourceTypes:
  - resourceType: azure_keyvault_vaults
  - platform: gcp
    resourceType: gcp_compute_instances
```

### Discovering available resource types

**Review discovered resources in the Workspace Explorer UI** (workspace-builder on
port **8000**) — not by opening `resource-dump.yaml` on the filesystem:

| Method | Use |
| --- | --- |
| [http://localhost:8000/explorer/](http://localhost:8000/explorer/) | Browse platforms, resource types, and instance payloads after discovery |
| `GET /explorer/api/summary` | JSON overview of indexed platforms and counts |
| `GET /explorer/api/resources?platform=…&resource_type=…` | Filter instances; inspect fields for `matchRules` paths |
| `docs/authoring/indexed-resources/*-resource-catalog.md` | Full type list from indexer registries (no cluster required) |

See [Resource store query API](docs/architecture/resource-store-query-api.md) for
API details. Legacy YAML dumps under `shared/` are deprecated for authoring.

CloudQuery plugin tables remain useful background for field shapes:

- **Azure**: [CloudQuery Azure Plugin](https://www.cloudquery.io/docs/plugins/sources/azure/tables)
- **AWS**: [CloudQuery AWS Plugin](https://www.cloudquery.io/docs/plugins/sources/aws/tables)
- **GCP**: [CloudQuery GCP Plugin](https://www.cloudquery.io/docs/plugins/sources/gcp/tables)
- **Kubernetes**: [CloudQuery Kubernetes Plugin](https://www.cloudquery.io/docs/plugins/sources/k8s/tables)

> **Important**: Which types appear in Explorer depends on your generation rules
> (selective discovery) and indexer backend — not every catalog row is indexed in
> every run.

## Match Rules

### 1. Pattern Matching
```yaml
matchRules:
  # Match resource name
  - type: pattern
    pattern: "^prod-.*"           # Regex pattern
    properties: [name]            # Built-in property
    mode: substring              # exact | substring

  # Match nested resource data
  - type: pattern
    pattern: "eastus"
    properties: ["resource/location"]  # Path notation
    mode: exact

  # Match multiple properties (OR logic)
  - type: pattern
    pattern: "critical|important"
    properties: [name, "resource/tags/environment"]
    mode: substring
```

### 2. Property Existence Matching
```yaml
matchRules:
  - type: exists
    path: "resource/tags/environment"
    matchEmpty: false             # true = match empty values too
```

### 3. Custom Variable Matching
```yaml
matchRules:
  - type: custom-variable
    path: "myCustomVar"
    pattern: "production"
    mode: exact
```

### 4. Compound Matching (AND/OR/NOT)
```yaml
matchRules:
  # AND logic
  - type: and
    matches:
      - type: pattern
        pattern: "prod"
        properties: [name]
        mode: substring
      - type: exists
        path: "resource/tags/critical"

  # OR logic  
  - type: or
    matches:
      - type: pattern
        pattern: "staging"
        properties: [name]
      - type: pattern
        pattern: "test"
        properties: [name]

  # NOT logic
  - type: not
    match:
      type: pattern
      pattern: "temp-.*"
      properties: [name]
```

## SLX Definitions

### Basic SLX
```yaml
slxs:
  - baseName: resource-health
    baseTemplateName: basic-health-check
    levelOfDetail: basic          # basic | detailed
    outputItems:
      - type: slx
```

### SLX with Qualifiers
```yaml
slxs:
  - baseName: k8s-pod-health
    qualifiers: ["namespace", "resource"]  # Creates unique names
    baseTemplateName: kubernetes-pod-health
    levelOfDetail: detailed
    outputItems:
      - type: slx
      - type: runbook
        templateName: pod-troubleshooting.yaml
```

### Platform-Specific Qualifiers

#### Azure Qualifiers
```yaml
qualifiers: 
  - "resource"              # Resource name
  - "subscription_id"       # Azure subscription ID
  - "subscription_name"     # Azure subscription name  
  - "resource_group"        # Resource group name
```

#### Kubernetes Qualifiers
```yaml
qualifiers:
  - "resource"              # Resource name
  - "namespace"             # Kubernetes namespace
  - "cluster"               # Cluster name
```

#### AWS Qualifiers
```yaml
qualifiers:
  - "resource"              # Resource name
  - "region"                # AWS region
  - "account_id"            # AWS account ID
```

## Output Items

### SLX Output
```yaml
outputItems:
  - type: slx
    path: "slxs/{{.resource_name}}-health.yaml"  # Optional custom path
    templateVariables:                           # Optional extra variables
      customVar: "value"
```

### Runbook Output  
```yaml
outputItems:
  - type: runbook
    templateName: troubleshoot-resource.yaml
    path: "runbooks/{{.resource_name}}-troubleshoot.yaml"
    levelOfDetail: detailed
```

### SLI Output
```yaml
outputItems:
  - type: sli
    templateName: resource-metrics.yaml
    templateVariables:
      metricName: "resource_health"
```

## Complete Examples

### 1. Azure Resource Group Health Monitoring
```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: azure
  generationRules:
    - resourceTypes:
        - resource_group
      matchRules:
        - type: pattern
          pattern: ".+"                    # Match all resource groups
          properties: [name]
          mode: substring
      slxs:
        - baseName: az-rg-health
          qualifiers: ["resource", "subscription_name"]
          baseTemplateName: azure-rg-health
          levelOfDetail: basic
          outputItems:
            - type: slx
            - type: runbook
              templateName: azure-rg-troubleshoot.yaml
```

### 2. Kubernetes Production Workload Monitoring
```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: kubernetes
  generationRules:
    - resourceTypes:
        - deployment
        - statefulset
      matchRules:
        - type: and
          matches:
            - type: pattern
              pattern: "prod"
              properties: ["resource/metadata/namespace"]
              mode: substring
            - type: exists
              path: "resource/metadata/labels/app"
      slxs:
        - baseName: k8s-workload-health
          qualifiers: ["namespace", "resource"]
          baseTemplateName: kubernetes-workload-health
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: sli
              templateName: workload-metrics.yaml
            - type: runbook
              templateName: workload-troubleshoot.yaml
```

### 3. Multi-Environment AWS Resource Monitoring
```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: aws
  generationRules:
    - resourceTypes:
        - ec2_instance
      matchRules:
        - type: or
          matches:
            - type: pattern
              pattern: "production"
              properties: ["resource/tags/Environment"]
              mode: exact
            - type: pattern
              pattern: "staging"
              properties: ["resource/tags/Environment"]
              mode: exact
      slxs:
        - baseName: aws-ec2-health
          qualifiers: ["region", "resource"]
          baseTemplateName: aws-ec2-health
          levelOfDetail: basic
          outputItems:
            - type: slx
```

### 4. Conditional Generation Based on Tags
```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: azure
  generationRules:
    # High-priority resources get detailed monitoring
    - resourceTypes:
        - virtual_machine
      matchRules:
        - type: pattern
          pattern: "critical|high"
          properties: ["resource/tags/priority"]
          mode: substring
      slxs:
        - baseName: az-vm-critical-health
          qualifiers: ["resource_group", "resource"]
          baseTemplateName: azure-vm-detailed-health
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: sli
            - type: runbook
    
    # Standard resources get basic monitoring
    - resourceTypes:
        - virtual_machine
      matchRules:
        - type: not
          match:
            type: pattern
            pattern: "critical|high"
            properties: ["resource/tags/priority"]
            mode: substring
      slxs:
        - baseName: az-vm-standard-health
          qualifiers: ["resource_group", "resource"]
          baseTemplateName: azure-vm-basic-health
          levelOfDetail: basic
          outputItems:
            - type: slx
```

## Advanced Patterns

### Path-Based Matching Examples
```yaml
# Match Kubernetes resources by annotation
properties: ["resource/metadata/annotations/monitoring.enabled"]

# Match Azure resources by nested tags
properties: ["resource/tags/environment", "resource/tags/team"]

# Match AWS resources by ARN pattern
properties: ["resource/arn"]

# Match nested JSON paths
properties: ["resource/spec/template/metadata/labels/app"]
```

### Template Variable Access
All matched resources provide these template variables:
- `{{.resource_name}}` - Resource name
- `{{.qualified_name}}` - Fully qualified resource name  
- `{{.platform}}` - Platform name
- `{{.subscription_id}}` - (Azure) Subscription ID
- `{{.namespace}}` - (Kubernetes) Namespace
- `{{.region}}` - (AWS/GCP) Region
- `{{.qualifiers}}` - Dictionary of qualifier key/value pairs

### Best Practices
1. **Use specific match rules** to avoid generating too many SLXs
2. **Choose meaningful qualifiers** for unique SLX names
3. **Start with basic levelOfDetail** and upgrade to detailed as needed
4. **Group related resources** using similar baseName patterns
5. **Test match rules** with small resource sets first
6. **Use compound matching** for complex filtering logic

## Common Troubleshooting

### Issue: Generation Rule Not Matching
- Confirm `resourceTypes` against Explorer (`http://localhost:8000/explorer/`) or the authoring catalogs — not legacy filesystem dumps
- Verify `properties` paths against a live resource payload in Explorer (use `/` for nested paths)
- Test regex patterns with online regex testers
- Enable debug logging to see match attempts

### Issue: Qualifiers Not Resolving
- Ensure qualifiers are valid for your platform (see platform-specific sections)
- Check that the qualifier exists in your resource data
- Use `resource` qualifier for resource name as fallback

### Issue: Too Many/Few SLXs Generated
- Refine match rules to be more/less specific
- Use compound matching with `and`/`or`/`not` for complex logic
- Test with a small subset of resources first

### Issue: Template Variables Not Available
- Verify template variable names match the qualifier names
- Use `{{.qualifiers.qualifier_name}}` to access qualifier values
- Check that the template exists and has the expected variable names 

### Template Variable Access 
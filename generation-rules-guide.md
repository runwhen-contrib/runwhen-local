# Generation Rules Usage Guide

## Basic Structure

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: <platform-name>  # azure, kubernetes, gcp, aws
  generationRules:
    - resourceTypes: [<resource-types>]
      matchRules: [<match-rules>]
      slxs: [<slx-definitions>]
      outputItems: [<output-items>]  # Optional: direct output items
```

## Resource Type Specifications

### Basic Resource Types
```yaml
resourceTypes:
  - resource_group                    # Simple name
  - azure:resource_group             # Platform-prefixed
  - kubernetes:pod                   # Cross-platform
```

### Discovering Available Resource Types

To find the exact resource types available in your environment, examine your resource dump:

```yaml
# Resource dump structure shows available resource types
platforms:
  azure: !Platform
    resourceTypes:
      resource_group: !ResourceType     # <- This is the resource type name to use
        instances: {...}
      virtual_machine: !ResourceType    # <- Another available resource type
        instances: {...}
```

You can also use the CloudQuery documentation to find the full list of supported resource types for your specific provider:
- **Azure**: [CloudQuery Azure Plugin](https://www.cloudquery.io/docs/plugins/sources/azure/tables) - All Azure resource types
- **AWS**: [CloudQuery AWS Plugin](https://www.cloudquery.io/docs/plugins/sources/aws/tables) - All AWS resource types  
- **GCP**: [CloudQuery GCP Plugin](https://www.cloudquery.io/docs/plugins/sources/gcp/tables) - All GCP resource types
- **Kubernetes**: [CloudQuery Kubernetes Plugin](https://www.cloudquery.io/docs/plugins/sources/k8s/tables) - All Kubernetes resource types

> **Important**: The available resource types depend on which CloudQuery provider plugins you have configured and enabled in your environment.

### Platform-Specific Resource Types

RunWhen Local supports **all CloudQuery resource types for the specific provider/platform** you're using. The resource type names correspond to the CloudQuery table schema names, but are typically simplified (e.g., `azure_resources_resource_groups` becomes `resource_group`).

```yaml
# Azure - Examples from CloudQuery Azure plugin
resourceTypes:
  - resource_group                    # azure_resources_resource_groups
  - virtual_machine                   # azure_compute_virtual_machines
  - storage_account                   # azure_storage_accounts
  - app_service                       # azure_web_apps
  - sql_database                      # azure_sql_databases
  - key_vault                         # azure_keyvault_vaults
  - network_security_group           # azure_network_security_groups
  - virtual_network                   # azure_network_virtual_networks
  - load_balancer                     # azure_network_load_balancers

# Kubernetes - Examples from CloudQuery Kubernetes plugin
resourceTypes:
  - pod                               # k8s_core_pods
  - service                           # k8s_core_services
  - deployment                        # k8s_apps_deployments
  - namespace                         # k8s_core_namespaces
  - configmap                         # k8s_core_config_maps
  - secret                            # k8s_core_secrets
  - ingress                           # k8s_networking_ingresses
  - persistent_volume                 # k8s_core_persistent_volumes
  - statefulset                       # k8s_apps_stateful_sets

# AWS - Examples from CloudQuery AWS plugin
resourceTypes:
  - ec2_instance                      # aws_ec2_instances
  - s3_bucket                         # aws_s3_buckets
  - rds_instance                      # aws_rds_instances
  - lambda_function                   # aws_lambda_functions
  - vpc                               # aws_ec2_vpcs
  - security_group                    # aws_ec2_security_groups
  - iam_role                          # aws_iam_roles
  - cloudformation_stack              # aws_cloudformation_stacks
  - elb_load_balancer                 # aws_elbv2_load_balancers

# GCP - Examples from CloudQuery GCP plugin
resourceTypes:
  - compute_instance                  # gcp_compute_instances
  - storage_bucket                    # gcp_storage_buckets
  - sql_instance                      # gcp_sql_instances
  - kubernetes_cluster                # gcp_container_clusters
  - cloud_function                    # gcp_cloudfunctions_functions
  - firewall_rule                     # gcp_compute_firewall_rules
  - vpc_network                       # gcp_compute_networks
```

> **Note**: The exact resource type names may vary. Check your resource dump or CloudQuery documentation for the specific resource types available in your environment.

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
- Check that `resourceTypes` matches exactly what's in your resource dump
- Verify `properties` paths are correct (use `/` for nested paths)
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
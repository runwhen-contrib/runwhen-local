# Map Customization Rules

This directory contains YAML files that define how RunWhen Local organizes SLXs into groups and subgroups. The customization rules allow you to create a logical structure based on resource properties, tags, or other attributes.

## Overview

Map customization rules support:

1. **Group Rules**: Define the main groups where SLXs are placed
2. **Subgroup Rules**: Define subgroups within main groups for additional organization
3. **Relationship Rules**: Define dependencies between groups or SLXs

## Examples

### Basic Group Rules

Group rules assign SLXs to groups based on matching conditions:

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  groupRules:
    - match:
        type: pattern
        matchProperty: "base-name"
        pattern: "aws-rds-health"
        matchMode: exact
      group: "Database Services"
      priority: 10
    
    - match:
        type: pattern
        matchProperty: "resource.metadata.namespace"
        pattern: "production"
        matchMode: exact
      group: "Production Services"
      priority: 20
```

### Subgroup Rules

Subgroup rules create hierarchical organization by placing SLXs into subgroups within their parent groups:

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  subGroupRules:
    - match:
        type: pattern
        matchProperty: "[aws]Environment"
        pattern: "Production"
        matchMode: exact
      parentGroup: "Database Services"
      subGroup: "Production Databases"
      priority: 10
    
    - match:
        type: pattern
        matchProperty: "resource.metadata.labels.team"
        pattern: "frontend"
        matchMode: exact
      parentGroup: "Production Services"
      subGroup: "Frontend Team"
      priority: 20
```

### Complex Match Conditions

You can use logical operators to create more complex match conditions:

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  groupRules:
    - match:
        type: and
        predicates:
          - type: pattern
            matchProperty: "service"
            pattern: "ec2"
            matchMode: exact
          - type: pattern
            matchProperty: "[aws]Environment"
            pattern: "Production"
            matchMode: exact
      group: "Production EC2 Instances"
      priority: 10
    
    - match:
        type: or
        predicates:
          - type: pattern
            matchProperty: "resource.metadata.labels.tier"
            pattern: "frontend"
            matchMode: exact
          - type: pattern
            matchProperty: "resource.metadata.labels.tier"
            pattern: "ui"
            matchMode: exact
      group: "User Interface Components"
      priority: 20
```

### Dynamic Group Names

You can use templating to include resource properties in group names:

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  groupRules:
    - match:
        type: pattern
        matchProperty: "region"
        pattern: ".*"
        matchMode: regex
      group: "AWS Region {{region}}"
      priority: 10
    
    - match:
        type: pattern
        matchProperty: "resource.metadata.namespace"
        pattern: ".*"
        matchMode: regex
      group: "Namespace: {{resource.metadata.namespace}}"
      priority: 20
```

### Group Relationships

You can define relationships between groups:

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  groupRelationshipRules:
    - subject: "Frontend Services"
      verb: dependent-on
      matches:
        - type: pattern
          matchProperty: name
          pattern: "Backend Services"
    
    - subject: "Web Applications"
      verb: dependent-on
      matches:
        - type: pattern
          matchProperty: name
          pattern: "Database Services"
```

### SLX Relationships

You can define relationships between SLXs:

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  slxRelationshipRules:
    - subject: "frontend-health"
      verb: dependent-on
      matches:
        - type: pattern
          matchProperty: base-name
          pattern: "api-health"
```

## Common Patterns by Cloud Provider

### AWS Resources

AWS resources typically use service type and AWS tags for organization:

```yaml
groupRules:
  - match:
      type: pattern
      matchProperty: "service"
      pattern: "rds"
      matchMode: exact
    group: "AWS Database Services"

subGroupRules:
  - match:
      type: pattern
      matchProperty: "[aws]Environment"
      pattern: "Production"
      matchMode: exact
    parentGroup: "AWS Database Services"
    subGroup: "Production Databases"
```

### Kubernetes Resources

Kubernetes resources typically use namespace, labels, and annotations:

```yaml
groupRules:
  - match:
      type: pattern
      matchProperty: "resource.metadata.namespace"
      pattern: "production"
      matchMode: exact
    group: "Production Applications"

subGroupRules:
  - match:
      type: pattern
      matchProperty: "resource.metadata.labels.app"
      pattern: "frontend"
      matchMode: exact
    parentGroup: "Production Applications"
    subGroup: "Frontend Services"
```

### Azure Resources

Azure resources typically use resource types, resource groups, and Azure tags:

```yaml
groupRules:
  - match:
      type: pattern
      matchProperty: "resource.type"
      pattern: "Microsoft.Compute/virtualMachines"
      matchMode: exact
    group: "Azure VMs"

subGroupRules:
  - match:
      type: pattern
      matchProperty: "resource.tags.Environment"
      pattern: "Production"
      matchMode: exact
    parentGroup: "Azure VMs"
    subGroup: "Production VMs"
```

## Best Practices

1. **Start simple**: Begin with a few clear groups based on your most important organizational dimensions
2. **Use meaningful names**: Choose group and subgroup names that make sense to all users
3. **Be consistent**: Use consistent naming patterns for related groups
4. **Avoid deep nesting**: Limit your hierarchy to 2-3 levels for usability
5. **Use priorities**: Set priorities to control which rules take precedence when multiple rules match
6. **Leverage existing tags**: Use the tags and labels already present in your infrastructure
7. **Use templates**: Dynamic group names based on tag values can automatically create a sensible structure 
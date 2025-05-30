# Map Customization Rules Documentation

## Overview

Map Customization Rules provide a flexible way to organize SLXs (Service Level eXpectation) into groups and subgroups, and define relationships between them. These rules are defined in YAML files and allow you to create a logical hierarchy based on resource properties, tags, labels, or other attributes.

## Rule Types

### 1. Group Rules (`groupRules`)
Define how SLXs are assigned to main groups.

### 2. Subgroup Rules (`subGroupRules`) 
Define how SLXs are assigned to subgroups within their parent groups.

### 3. Group Relationship Rules (`groupRelationshipRules`)
Define dependencies between groups.

### 4. SLX Relationship Rules (`slxRelationshipRules`)
Define dependencies between individual SLXs.

## Priority System

**Priority determines the order in which rules are evaluated.** 

- **Lower numbers = Higher priority** (evaluated first)
- **Higher numbers = Lower priority** (evaluated later)
- Rules are sorted by priority value in ascending order
- **First matching rule wins** - once a rule matches, no further rules are evaluated for that SLX

### Priority Examples

```yaml
groupRules:
  # This rule is checked FIRST (highest priority)
  - match:
      type: pattern
      matchProperty: "[aws]Critical"
      pattern: "true"
    group: "Critical Systems"
    priority: 1
  
  # This rule is checked SECOND
  - match:
      type: pattern
      matchProperty: "service"
      pattern: "rds"
    group: "Database Services"
    priority: 10
  
  # This rule is checked LAST (lowest priority)
  - match:
      type: pattern
      matchProperty: ".*"
      pattern: ".*"
    group: "Other Services"
    priority: 100
```

## File Structure

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  groupRules: []
  subGroupRules: []
  groupRelationshipRules: []
  slxRelationshipRules: []
  groupRelationVerbDefault: "dependent-on"  # Optional
  slxRelationVerbDefault: "dependent-on"    # Optional
```

## Match Predicates

### Pattern Match
Matches a property against a regular expression or exact string.

```yaml
match:
  type: pattern
  matchProperty: "property.path"
  pattern: "value_to_match"
  matchMode: "exact"  # or "substring"
```

### Logical AND
All predicates must match.

```yaml
match:
  type: and
  predicates:
    - type: pattern
      matchProperty: "service"
      pattern: "ec2"
    - type: pattern
      matchProperty: "[aws]Environment"
      pattern: "Production"
```

### Logical OR
At least one predicate must match.

```yaml
match:
  type: or
  predicates:
    - type: pattern
      matchProperty: "service"
      pattern: "rds"
    - type: pattern
      matchProperty: "service"
      pattern: "aurora"
```

### Logical NOT
The predicate must NOT match.

```yaml
match:
  type: not
  predicate:
    type: pattern
    matchProperty: "[aws]Environment"
    pattern: "Development"
```

## Match Properties

### Standard SLX Properties
- `name` - SLX name
- `base-name` - SLX base name (before qualifiers)
- `full-name` - Complete SLX name with qualifiers
- `qualified-name` - Qualified SLX name

### Resource Properties
You can match on any resource property using dot notation:

#### AWS Resources
- `service` - AWS service name (e.g., "ec2", "rds", "s3")
- `region` - AWS region
- `account_id` - AWS account ID
- `account_name` - AWS account name (if available)
- `resource_type` - Resource type name
- `resource_name` - Resource name
- `arn` - Resource ARN
- `is_public` - Whether resource is publicly accessible
- `[aws]TagName` - AWS resource tags (prefix with "[aws]")

#### Kubernetes Resources
- `resource.metadata.namespace` - Kubernetes namespace
- `resource.metadata.name` - Resource name
- `resource.metadata.labels.labelname` - Kubernetes labels
- `resource.metadata.annotations.annotationname` - Kubernetes annotations
- `resource.kind` - Resource kind (Pod, Service, etc.)

#### Azure Resources
- `resource.resourceGroup` - Azure resource group
- `resource.type` - Azure resource type
- `resource.location` - Azure region/location
- `resource.tags.TagName` - Azure resource tags
- `resource.subscription` - Azure subscription

#### GCP Resources
- `resource.project` - GCP project
- `resource.zone` - GCP zone
- `resource.region` - GCP region
- `resource.labels.labelname` - GCP resource labels

## Match Modes

- `exact` - Exact string match (default)
- `substring` - Substring match (value contains the pattern)

**Note**: Regular expressions are supported within the `pattern` field when using either match mode.

## Group Rules

```yaml
groupRules:
  - match:
      type: pattern
      matchProperty: "service"
      pattern: "rds"
      matchMode: exact
    group: "Database Services"
    priority: 10
```

### Dynamic Group Names
Use templating to include resource properties in group names:

```yaml
groupRules:
  - match:
      type: pattern
      matchProperty: "region"
      pattern: ".*"
      matchMode: regex
    group: "AWS {{region}} Region"
    priority: 10
```

## Subgroup Rules

Subgroups provide additional organization within parent groups:

```yaml
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
      matchProperty: "[aws]Environment"
      pattern: "Staging"
      matchMode: exact
    parentGroup: "Database Services"
    subGroup: "Staging Databases"
    priority: 10
```

### Dynamic Subgroup Names
```yaml
subGroupRules:
  - match:
      type: pattern
      matchProperty: "resource.metadata.labels.team"
      pattern: ".*"
      matchMode: regex
    parentGroup: "Production Services"
    subGroup: "{{resource.metadata.labels.team}} Team"
    priority: 10
```

## Relationship Rules

### Group Relationships
Define dependencies between groups:

```yaml
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
Define dependencies between individual SLXs:

```yaml
slxRelationshipRules:
  - subject: "frontend-health"
    verb: dependent-on
    matches:
      - type: pattern
        matchProperty: base-name
        pattern: "api-health"
  
  - subject: "api-health"
    verb: dependent-on
    matches:
      - type: pattern
        matchProperty: base-name
        pattern: "database-health"
```

### Relationship Verbs
- `dependent-on` - Subject depends on the matched items
- `depended-on-by` - Subject is depended on by the matched items

## Complete Example

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  # Global defaults
  groupRelationVerbDefault: "dependent-on"
  slxRelationVerbDefault: "dependent-on"
  
  # Group rules (checked in priority order)
  groupRules:
    # Critical systems get highest priority
    - match:
        type: pattern
        matchProperty: "[aws]Critical"
        pattern: "true"
        matchMode: exact
      group: "Critical Infrastructure"
      priority: 1
    
    # Production databases
    - match:
        type: and
        predicates:
          - type: pattern
            matchProperty: "service"
            pattern: "rds"
            matchMode: exact
          - type: pattern
            matchProperty: "[aws]Environment"
            pattern: "Production"
            matchMode: exact
      group: "Production Databases"
      priority: 5
    
    # All other databases
    - match:
        type: pattern
        matchProperty: "service"
        pattern: "rds"
        matchMode: exact
      group: "Database Services"
      priority: 10
    
    # Kubernetes production apps
    - match:
        type: pattern
        matchProperty: "resource.metadata.namespace"
        pattern: ".*-prod"
        matchMode: regex
      group: "Production Applications"
      priority: 15
    
    # Regional grouping (lowest priority - catch-all)
    - match:
        type: pattern
        matchProperty: "region"
        pattern: ".*"
        matchMode: regex
      group: "{{region}} Resources"
      priority: 100
  
  # Subgroup rules
  subGroupRules:
    # Database subgroups by engine type
    - match:
        type: pattern
        matchProperty: "[aws]Engine"
        pattern: "mysql"
        matchMode: exact
      parentGroup: "Database Services"
      subGroup: "MySQL Databases"
      priority: 10
    
    - match:
        type: pattern
        matchProperty: "[aws]Engine"
        pattern: "postgres"
        matchMode: exact
      parentGroup: "Database Services"
      subGroup: "PostgreSQL Databases"
      priority: 10
    
    # Kubernetes subgroups by team
    - match:
        type: pattern
        matchProperty: "resource.metadata.labels.team"
        pattern: ".*"
        matchMode: regex
      parentGroup: "Production Applications"
      subGroup: "{{resource.metadata.labels.team}} Team"
      priority: 10
  
  # Group relationships
  groupRelationshipRules:
    - subject: "Production Applications"
      verb: dependent-on
      matches:
        - type: pattern
          matchProperty: name
          pattern: "Production Databases"
    
    - subject: "Production Applications"
      verb: dependent-on
      matches:
        - type: pattern
          matchProperty: name
          pattern: "Critical Infrastructure"
  
  # SLX relationships
  slxRelationshipRules:
    - subject: "frontend-health"
      verb: dependent-on
      matches:
        - type: pattern
          matchProperty: base-name
          pattern: ".*-api-health"
          matchMode: regex
```

## Best Practices

### Priority Strategy
1. **Start with low numbers (1-10)** for your most specific, high-priority rules
2. **Use increments of 5 or 10** to leave room for future rules
3. **Reserve high numbers (90-100)** for catch-all/default rules
4. **Document your priority scheme** for team members

### Rule Organization
1. **Order rules from most specific to most general**
2. **Use descriptive group names** that make sense to all users
3. **Avoid deep nesting** - limit hierarchy to 2-3 levels
4. **Test your rules** with sample data before deploying

### Performance Considerations
1. **Put frequently matching rules first** (lower priority numbers)
2. **Use exact matches when possible** instead of regex
3. **Minimize complex logical expressions** (AND/OR with many predicates)
4. **Consider rule consolidation** if you have many similar rules

### Maintenance
1. **Use version control** for your customization rules
2. **Document rule purposes** with comments in YAML
3. **Review rules periodically** as your infrastructure evolves
4. **Test rule changes** in a development environment first

## File Loading

Rules are loaded from:
1. Files specified in `MAP_CUSTOMIZATION_RULES_PATH` environment variable
2. Default directory: `map-customization-rules/`
3. All `.yaml` files in the directory are loaded and merged
4. Rules from all files are combined, maintaining priority order across files 
# Group / Map Customizations

When resources are discovered, they are automatically grouped for easier organization:&#x20;

* In RunWhen Local, these groups help with organization and navigation of the troubleshooting tech docs that are rendered in mkdocs
* In the RunWhen Platform, these groups help with moving across the [map](https://docs.runwhen.com/public/runwhen-platform/feature-overview/maps) and provide additional context for the [Digital Assistants](https://docs.runwhen.com/public/runwhen-platform/feature-overview/digital-assistants) to help provide automated troubleshooting

In general, the default grouping often follow a simple pattern, such as:&#x20;

* Kubernetes Namespace
* Azure Resource Group
* GCP Project ID
* Related Resource Types (e.g. Public HTTP Endpoints, K8s Cluster Infrastructure)

In many cases, these default groups may not make sense for your team, and can be overridden by customizing this functionality.&#x20;

### Workspace Builder Customization Files

Workspace builder customization files support more fine-grained customization of the workspace builder operation. Currently, two types of customizations are supported:

* groups of [SLXs](https://docs.runwhen.com/public/runwhen-platform/feature-overview/points-on-the-map-slxs)
* dependency relationships between groups

To add customization files, create a directory named "map-customization-rules" in the shared directory. Then create one or more YAML files in this directory, named whoever you like, that contains the customization content.

The top-level structure of a customization file is:

```yaml
apiVersion: runwhen.com/v1
kind: MapCustomizationRules
spec:
  groupRules:
  - match: # Boolean predicate that matches SLXs to assign to the specified group
    group: # Which group to assign the SLX to
  groupRelationshipRules:
  - subject: # Name of the subject group in the relationship
    verb: # Relationship/dependency direction, either "dependent-on" or "depended-on-by"
    matches: # Boolean predicate that matches other groups that are related to the subject group
```

#### Match Predicates

Both types of customization rules make use of a YAML structured object representing a boolean match predicate expression. All predicates have a common "type" field that indicates the type of the match predicate, i.e. a polymorphic type indicator. The leaf predicates that do the actual matching use regular expression to match against attributes of some target object, either an SLX instance (for SLX groupings) or group name (for group dependency relationships). Those match predicates are discussed in the following sections that discuss the different customizations.

Additionally, there are predicate that combine child predicates in the usual boolean logical operations.

The boolean AND operation is supported with an "and" predicate type. The predicate evaluates to true only if all the child match predicates evaluate to true. The format is:

| Field Name | Description                                |
| ---------- | ------------------------------------------ |
| type       | Value is "and" for a boolean AND operation |
| matches    | List of child match predicates             |

The boolean OR operation is supported with an "or" predicate type. The predicate evaluates to true if any of the child match predicates evaluates to true. The format is:

| Field Name | Description                              |
| ---------- | ---------------------------------------- |
| type       | Value is "or" for a boolean OR operation |
| matches    | List of child match predicates           |

The boolean NOT operation is supported with a "not" predicate type. The predicate evaluates to true if the child predicate evaluates to false. The format is:

| Field Name | Description                                |
| ---------- | ------------------------------------------ |
| type       | Value is "not" for a boolean NOT operation |
| predicate  | Child match predicate                      |

#### SLX Groups

The RunWhen platform workspace/map GUI lets you group together related SLXs. These groupings may be based on the cloud platform scope or some related functionality. The style of grouping is a user preference and, in general, the workspace builder doesn't have the requisite domain knowledge about the target cloud application to know how to group things, so it must be configured by the user in a "groupRules" block in a map customization file containing one or more group rules. The workspace builder does have some simple standard group rules, but it is likely that users will have a different grouping model of their application and will want to override the defaults.

Each group rule contains two fields:

| Field Name | Description                                                                    |
| ---------- | ------------------------------------------------------------------------------ |
| match      | Boolean predicate that matches generated SLXs to assign to the specified group |
| group      | Name of the group to which to assign the matching SLXs                         |

The "match" field is a match predicate described above.

The predicate type that actually matches things is a "pattern" predicate. The fields of a pattern predicate are:

| Field Name | Description                                                                               |
| ---------- | ----------------------------------------------------------------------------------------- |
| type       | value is "pattern" for a pattern predicate                                                |
| matchType  | Which property of a candidate SLX to match on (should probably be named matchProperty?)   |
| pattern    | A regular expression pattern to match against the indicated matchType property of the SLX |
| matchMode  | Type of match operation, either "substring" or "exact"; defaults to "substring"           |

The supported values for the matchType are:

| Type/Property Name | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| name               | Shortened name of the SLX                                                   |
| qualified-name     | Qualified name of the SLX                                                   |
| full-name          | Full (unshortened) name of the SLX                                          |
| base-name          | Base name of the candidate SLX, i.e. minus any resource-specific qualifiers |
|                    | A path in the full data of the discovered resource associated with the SLX  |

The "name" field is the name in the Kubernetes custom resource file. It is typically a shortened, not super human-friendly name including the workspace name, so you will typically not want to match on this.

The "qualified name" is the same as the name field, minus the workspace name. Similarly, it's not super-friendly, so not typically what you want to match on.

The "full-name" is the full name of the SLX, not including the workspace name, and also not doing any shortening/mangling of the qualifier values.

The "base-name" is the base name of the SLX, minus the resource-dependent qualifier values. This is the most common field to match, since it typically contains some indication of the component/purpose associated with the SLX.

If the matchType value doesn't match one of these built-in values, then it is interpreted as a path expression into the raw resource data. The path expression is a slash-separated list of path components in the resource data. If one of the components in the path is a list, then the rest of the path is evaluated against each of the elements in the list and if any of them matches, then it's considered a match.

The raw resource data is very platform and resource type dependent, so consult the documentation for the specific platforms for information about the structure of the data.

The "pattern" field uses the Python regular expression syntax (https://docs.python.org/3/library/re.html)

The values for the "matchMode" field are:

| Value     | Description                                                            |
| --------- | ---------------------------------------------------------------------- |
| substring | Matches if any substring of the matchType property matches the pattern |
| exact     | Matches if the full name of the matchType property matches the pattern |


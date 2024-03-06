# Introduction

The workspace builder makes use of optional **generation rules** contained in code collections
to match which code bundles are relevant based on the resources discovered from indexing the
configured cloud platforms. If a generation rule matches a code bundle it generates one or
more SLXs for inclusion in the generated workspace. This document describes the
format of generation rules and the file structure within the code collection. It is
mostly of interest to code collection authors, although some of the information may be
of interest to users of the workspace builder to understand how it works.

The workspace builder operates in several phases:
1) It scans all the code collections/bundles that are configured/enabled
in the workspace info file and loads the generation rules for the enabled code bundles.
2) It indexes the resources for all the cloud platforms configured in the workspace info file.
The resources are saved in a simple in-memory database. For the most part, this database
doesn't really know anything about the structure or content of the resources, except for
some logic that determines the parent platform-specific scope (e.g. namespace for Kubernetes,
resource group for Azure). The indexing phase uses information from the generation rules
about which cloud resource types are accessed to optimize the indexing process, i.e. it
only indexes a resource type if there's a generation rule that accesses it.
3) The generation rules are evaluated against the discovered resources in the database
and, if a match is found, one or more SLX files are scheduled to be generated.
4) It renders the file structure for the RunWhen workspace including the top-level
workspace.yaml file and all the SLXs that were matching during the generation rule
evaluation.


# Directory Structure

The generation rules are contained within the directory of its associated code bundle.
A generation rule has a YAML file containing the matching logic as well as information
about which SLXs to generate if a match is found. The generation of the SLX files is
done with template files, so there are also one or more template files associated with
the generation rule.

Within the code bundle directory there's a directory named ".runwhen" that's the parent
directory for all the generation rules for the code bundle. Under the ".runwhen" directory
there's a directory named "generation-rules" that contains all the generation rule YAML
files. Also under the ".runwhen" directory is a directory named "templates" that
contains the SLX template files associated with the generation rules.

# Generation Rules

Generation rules files are YAML files that contains one or more generation rules.
Each generation rule has one or more boolean match predicates that match against
properties of the resources that were discovered from indexing the configured
cloud platforms. If a match is found, then the generation rule has information
about which SLXs to generate and which template file to use for each SLX.

The top-level structure of a generation rule file is:
```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: <targeted-cloud-platform>
  generationRules:
  - resourceTypes:
    - <resource-type-name>
    matchRules:
    - # match predicate specification
    slxs:
    - # SLX generation information
```
Each generation rule is targeted at a specific cloud platform. The target platform
can be specified at the top level in the spec (as in the example above) or individually
for each generation rule, which is useful if the generation rule targets multiple cloud platforms,
although that's not a very common case.

The currently supported platforms are:

| Platform | Name/ID in the Generation Rulel |
|----|----|
| Kubernetes | kubernetes |
| Azure | azure |
| Google Cloud Platform | gcp |

The name/id values are case-sensitive, so they must be all lower-case.
The default platform is Kubernetes (mostly for historical, backward-compatibility reasons), so
that's what is used if there's no explicit platform specification in the generation rule.

## Resource Types

Each generation rule is evaluated against a set of resource types for the specified cloud
platform, specified with the resourceType field.
The workspace builder iterates over all the instances of the specified resource
types and evaluates each match rule against each instance looking for matches. There
can be multiple resource types for a generation rule, atlhough more commonly there is just one.
The resource types are platform-specific. For all the CloudQuery-based platforms the
resource type is the CloudQuery table name described in the documentation for each CloudQuery
source plugin, so consult the CloudQuery documentation for the relevant resource types for
those platforms. For some commonly-access resources there may be a more user-friendly
alias for the CQ table name.
TODO: Need more info about the supported aliases as well as info about the Kubernetes resource types

## Match Rules

A match rule is a YAML structured object representing a boolean predicate expression.
It operates primarily by performing text matches against properties of the discovered resources.
Additionally, predicates can be combined using the usual compound boolean operations.

There are two type of leaf match predicates, a "pattern" predicate and an "exists" predicate.
The "pattern" predicate is used to test against various properties of the matched resource.
The pattern predicate has the following fields:

| Field Name | Description |
|-----|------|
| type | value is "pattern" for a pattern expression |
| resourceType | Specification of which resource type to match against |
| properties | List of resource properties to match against |
| pattern | Regular expression pattern to match |
| mode | String match mode, either "exact" or "substring" |

The optional "resourceType" field is used to override the top-level resource type list, so
that you can have compound match rules that match against multiple resource types. Its
values are the same resource type values available for the top-level resourceType field.

The "properties" field is a list of resource properties to match against. The
following values are supported:

| Property Name   | Description                                     | Platform   |
|-----------------|-------------------------------------------------|------------|
| name            | The name of the resource                        | All        |
| <resource-path> | Path resolved against the raw resource data     | All        |
| labels          | All label keys and values for the resource      | Kubernetes |
| label-keys      | All label keys for the resource                 | Kubernetes |
| label-values    | All label values for the resource               | Kubernetes |
| annotations     | All annotation keys and values for the resource | Kubernetes |
| annotation-keys | All annotation keys for the resource            | Kubernetes |
| label-values    | All annotation values for the resource          | Kubernetes |
| namespace       | Parent namespace for the resource               | Kubernetes |
| cluster         | Cluster for the resource                        | Kubernetes |
| tags            | All tag keys and values for the resource        | Azure      |
| tag-keys        | All tag keys for the resource                   | Azure      |
| tag-values      | All tag values for the resource                 | Azure      |
| resource_group  | Parent resource group for the resource          | Azure      |
| project         | Parent project for the resource                 | GCP        |

If a value in the properties list doesn't match one of these built-in values, then it is interpreted as
a path expression into the raw resource data. The path expression is a slash-separated list
of path components in the resource data. If one of the components in the path is a list,
then the rest of the path is evaluated against each of the elements in the list and if
any of them matches, then it's considered a match.

The "pattern" field is a regular expression (Python regular expression syntax) that
is matched against the specified property values.

The "mode" field specified whether to do an exact match check or a substring check.
The default value is "substring".


An "exists" predicate is similar to a pattern predicate except that it just check
for the existence of a property instead of performing a regular expression match
against the value of the property. It has basically the same fields as the pattern
predicate, except that there's no "pattern" or "mode" fields. It's "type" value is "exists".

The supported compound boolean operations are AND, OR, and NOT.

The boolean AND operation is supported with an "and" predicate type. The predicate evaluates
to true only if all the child match predicates evaluate to true. The format is:

| Field Name | Description                                |
|------------|--------------------------------------------|
| type       | Value is "and" for a boolean AND operation |
| matches    | List of child match predicates             |

The boolean OR operation is supported with an "or" predicate type. The predicate evaluates
to true if any of the child match predicates evaluates to true. The format is:

| Field Name | Description                              |
|------------|------------------------------------------|
| type       | Value is "or" for a boolean OR operation |
| matches    | List of child match predicates           |

The boolean NOT operation is supported with a "not" predicate type. The predicate
evaluates to true if the child predicate evaluates to false. The format is:

| Field Name | Description                                |
|------------|--------------------------------------------|
| type       | Value is "not" for a boolean NOT operation |
| predicate  | Child match predicate                      |

## SLX Generations
The list of SLXs to generate is specified in the "slxs" list.

The SLX element has the following fields:

| Field Name          | Description                                                                   |
|---------------------|-------------------------------------------------------------------------------|
| base_name           | The base name for the SLX                                                     |
| qualifiers          | Optional list of attributes from the match resource to qualify the SLX name   |
| shortened_base_name | Optional shortened version of the base name                                   |
| level_of_detail     | The level of detail for the SLX; value should be either "basic" or "detailed" |
| base_template_name  | Base name for the SLX templates                                               |
| output_items        | List of SLX file variants to generate                                         |

There are several different names associated with an SLX. The **full name** is constructed by appending
the base_name field with the values of the specified qualifier values for the matching resource, with
the different components separated by dashes.

The content of the SLX files themselves conform to
the Kubernetes resource format and are treated internally by the platform as Kubernetes custom
resources. The **name** of a Kubernetes custom resource is limited to 64 characters. Also,
in the current implementation of the RunWhen platform these names must be unique across all instances
of that SLX resource type, so the workspace name is included in the SLX resource to avoid name
collisions across workspaces. Due to the 64 character limit and the inclusion of the
workspace name, there are a limited number of characters left to represent the rest of the
SLX name. This is usually shorter than the length of the full name of the SLX described
above, so a name shortening process is performed to reduce the full name of the SLX to fit
in the available length. This basically does some shortening heuristics on the
individual components (i.e. base name and qualifiers) of the full SLX name
(e.g. removing vowels, truncating if necessary) and then recombines them and prepends
the workspace name. The shortening process also operates on the base_name for the SLX,
which eventually must be 15 characters or shorter. If you don't like the way it gets
shortened heuristically and want a more human-readable full base name, you can specify
the shortened_base_name field which is just a custom shortened version of the full
base_name (and should be 15 characters or shorter).

The qualifiers are attributes of the matching resource that are used to ensure unique
SLX names across different resource instances, typically the scoping attributes for the resource.

The supported values are:

| Qualifier Name | Description                   | Platform   |
|----------------|-------------------------------|------------|
| resource       | Name of the matching resource | All        |
| namespace      | Parent namespace              | Kubernetes |
| cluster        | Parent cluster                | Kubernetes |
| resource_group | Parent resource group         | Azure      |
| project        | Parent project ID             | GCP        |

In most cases the SLX name should include at least the qualifier for the platform-specific scoping construct.
The exception would be if there's an SLX that should be a singleton instance across
the entire target application.

The level of detail value (described in more detail in the user reference documentation) indicates
whether the SLX is basic or detailed. If the level of detail for the SLX is "basic" it will be
generated for any platform scope that's configured with a level of detail value of either
"basic" or "detailed". If the SLX level of detail value is "detailed" it will only be generated
for platform scopes whose level of detail value is "detailed".

The output_items list specifies one or more SLX files to be emitted. Each entry in the list is an output item specification object with the following fields:

| Field Name         | Description                                                                          |
|--------------------|--------------------------------------------------------------------------------------|
| type               | Type of SLX file                                                                     |
| path               | Custom path for the emitted SLX file                                                 |
| template_name      | Name of the template file for the SLX file contents                                  |
| template_variables | Dictionary/Object of additional template variables to make available to the template |
| level_of_detail    | Level of detail override for this SLX file                                           |

The only required field is the type field, which specifies which type of SLX file it is.
The supported values are:

| Type | Description |
|------|------|
| slx | Service Level X |
| sli | Service Level Indicator |
| slo | Service Level Objective |
| runbook | Runbook |

The other fields are optional and are typically omitted except for some special cases
where it's necessary to override the default values assigned to them.

The "path" field is the path in the workspace directory structure. It defaults to be a
file in the emitted SLX directory with a YAML file name derived from the type, e.g. slx.yaml,
runbook.yaml, etc.

The template_name is the name of the template file from the template directory to use
to generate the content for the SLX file. It defaults to a name that combines the
base_template_name field from the parent SLX specification with the type field,
separated by a dash: "<base_template_name>-<type>.yaml". As long as you conform to
this naming convention for the template files you don't need to specify this field.

The template_variables field is a dictionary whose keys are the names of the additional
template variables. The value of the template variable is evaluated as jinja2
template text, so it can include any of the template variables listed in the next
section that discusses the SLX template files. It can also access other custom
template variables that are defined before it in the dictionary. Again, this
is supported for a few special cases, but will rarely be needed for typical SLXs.

The "level_of_detail" field lets you override the parent SLX level_of_detail value
for different SLX files. So, for example, if you want to have a runbook file with
a "basic" level of detail and an SLI file with a "detailed" level of detail.

## SLX Template Files

SLX template files use the Python jinja2 format, so consult the jinja2 documentation
(https://jinja.palletsprojects.com/en/3.1.x/) for info about the syntax for variable substitutions, control flow statements, etc.. The templates are rendered with the trim_blocks and lstrip_blocks
flags enabled, which mostly just means that you can put conditional and loop statements on their own
line without affecting the indentation of the text that is actually rendered, which is important to
preserve the correct indentation/structure for the rendered YAML text. You can check some
examples in the RunWhen-authored code collections for examples of what this looks like.

There's a fair bit of boilerplate header content for SLX files, especially with tags and
annotations, some of which is really determined by the specific version of the workspace
builder that's running and not by the generation rule author. To handle this case there
are some standard template files that should be included in the standard header text for
the SLX. The standard SLX header content is:
```yaml
apiVersion: runwhen.com/v1
kind: ServiceLevelX
metadata:
  name: {{slx_name}}
  labels:
    {% include "common-labels.yaml" %}
  annotations:
    {% include "common-annotations.yaml" %}
spec:
  # The rest of the SLX content
```
You should basically always start an SLX template with this content. The only variation would
be to add other SLX-specific labels and/or annotations before or after the inclusion of the
common ones. Again, you can look at the code bundles in one of the standard RunWhen code
collections for examples.

The template will be mostly literal text, but with some variable accesses to
include information specific to the matching resource.
The supported template variables that are available to the template are:

| Variable Name             | Description                                                      | Supported Platforms |
|---------------------------|------------------------------------------------------------------|---------------------|
| workspace                 | Name of the parent workspace                                     | All                 |
| slxs_path                 | Path to the "slxs" directory in the workspace                    | All                 |
| slx_directory_path        | Path to the parent SLX directory in the workspace                | All                 |
| slxs_path                 | Path to the "slxs" directory in the workspace                    | All                 |
| default_location          | Default location value specified in the workspace info           | All                 |
| base_name                 | Base name of the SLX configured in the generation rule           | All                 |
| slx_name                  | Shortened SLX name to fit the 64 character Kubernetes name limit | All                 |
| full_slx_name             | The full, unshortened SLX name                                   | All                 |
| match_resource            | The matching resource instance in the resource database          | All                 |
| custom                    | Object mapped from the "custom" field in the workspace info      | All                 |
| repo_url                  | Repo URL of parent code collection                               | All                 |
| ref                       | Git branch/tag/ref for the code collection                       | All                 |
| generation_rule_file_path | Path to the generation rule that triggered the SLX generation    | All                 |
| is_workflow               | True if a workflow file is being rendered                        | All                 |
| namespace                 | Parent Kubernetes namespace resource instnace                    | Kubernetes only     |
| resource-group            | Parent Azure resource group resource instance                    | Azure only          |
| project                   | Parent GCP project resource instance                             | GCP only            |

These template variables can be used either with template variable expansion (with the {{variable-name}} jinja2 syntax)
or as expressions in jinja2 conditional/loop statements. More information about how template variables are
accessed and used can be found in the jinja2 documentation.

Note that many of these variables are things that are used in the boilerplate header content
(and the included common labels/annotations), but won't commonly be accessed by generation rule authors,
so they're included mainly for reference purposes. The most commonly accessed variables are the
default_location, match_resource, and the platform-specific scope name variables.

The value for the match_resource variable is the resource instance in the resource database. A resource
instance has these fields:

| Field Name     | Description                                     | Platforms  |
|----------------|-------------------------------------------------|------------|
| name           | Simple name. Not guaranteed to be unique        | All        |
| qualified_name | Qualified name. Guaranteed to be unique         | All        |
| resource_type  | Prent resource type instance                    | All        |
| resource       | Raw data for the resource                       | All        |
| labels         | Label dictionary metadata for the resource      | Kubernetes |
| annotations    | Annotation dictionary metadata for the resource | Kubernetes |
| tags           | The tag metadata for the resource               | Azure      |

The simple name is not guaranteed to be unique across all the instances of a particular resource type, but
the qualified name is guaranteed to be unique.

The resource_type field refers to a resource type instance in the resource database. The resource type
instance has a field named "platform", which is a reference to a platform type in the resource
database. That instance has a "name" field, which is the name of the platform.

Again, many of these things are mostly used internally by workspace builder and won't commonly
be used by generation rule authors. The most commonly accessed field will be the "resource"
field with trailing field accesses to resolve to specific field in the raw resource data.
So for example:
```
  some-custom-field: {{match_resource.resource.data.foo}}
```
The structure of the raw resource data is platform and resource type dependent. For
CloudQuery-based indexers you can consult the associated CloudQuery source plugin documentation
for the supported columns for a particular table/resource-type. Each column maps to a top-level
field in the raw resource data.

The workspace builder also dumps the state of the discovered resources to a file named "resource-dump.yaml"
in the shared directory. This dump is useful for learning what the structure of the raw resource
data looks like and then figuring out which fields to use in the match predicates and templates.
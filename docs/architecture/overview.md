# High Level Architecture

## High-Level Architecture

The current design and packaging of RunWhen Local is such that it can be deployed as a single container into any container runtime or Kubernetes environment. This would support users who wish to run this locally on their laptop, or deployed in a self-managed cluster, whichever is easier for the user. All data that RunWhen Local collects is stored locally and does not interact with any other RunWhen Platform API **unless it intentionally uploaded for the purposes of onboarding to RunWhen Platform**.

<figure><img src=".gitbook/assets/high-level.drawio.svg" alt=""><figcaption><p>High Level Architecture</p></figcaption></figure>

In the diagram above, the RunWhen Local container image is centered on the **Workspace Builder**: it performs discovery of Kubernetes and public-cloud resources, scans CodeCollection repositories for troubleshooting commands, and uses generation rules to produce RunWhen configuration data.

The following high-level flow is shown:

1. The user provides the necessary configuration data, which includes:
   * Cloud configuration data (such as a kubeconfig, service account json, tenant app ID details, etc) with the necessary permissions for the resource that is to be discovered
   * a workspaceInfo.yaml file, which provides instruction on how to discover the resources, along with other details that are useful **if** uploading the contents to the RunWhen Platform (which is part of the onboarding experience for the commercial SaaS offering).
2. The Workspace Builder performs a discovery task and stores all discovered resources in memory
3. CodeCollections are then indexed, which include Generation Rules, to match CodeBundles (which contain troubleshooting commands) with the resources discovered in step 2.  Customization Rules are also applied to the discovered resources to determine how to best group the discovered resources.&#x20;
4. Configuration files are generated and stored in the output directory that are specific to RunWhen - these files contain links to the applicable open source troubleshooting code, along with the specific configurations needed to make the commands work for the specific users environment.

## Qualified Name vs. SLX Qualifiers

Workspace-builder always injects `match_resource.qualified_name` into the SLX template variables.  This string comes directly from the *individual* resource that matched the rule (e.g. `sandbox-contoso-rg/listingsdb`).

If your GenerationRule's `qualifiers` list omits `"resource"` (so the SLX is scoped to an entire `resource_group`/`subscription_id`), the generated SLX will still carry the *child* resource's qualified-name in the `additionalContext.qualified_name` field.  This is expected: the value is useful for deep-linking back to the original object, and template authors can override or suppress it if a group-level string is preferred.

To display a group-level name instead, adjust your template:

```jinja
{# Replace the default value with one that reflects the qualifier scope #}
{% if qualifiers.resource is defined %}
qualified_name: "{{ qualifiers.resource_group }}/{{ qualifiers.resource }}"
{% else %}
qualified_name: "{{ qualifiers.resource_group }}"
{% endif %}
```

No changes to the qualifier engine are required — it is purely a template-level decision.

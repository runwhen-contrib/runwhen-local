# Example: Multi-resource runbook

Bundle related resources into a single SLX. This pattern is useful when
the natural unit of troubleshooting spans more than one resource type.

The setup: an Azure App Service web app + its server farm (App Service
plan) + the Application Gateway in front of it. We want one SLX per web
app that pulls all three IDs into the runbook context.

## Matched resource

The "primary" resource for the rule is `azure_appservice_web_apps`. The
related App Service plan and Application Gateway are looked up via
`relatedResources` (resolved at generation time):

```yaml
id: /subscriptions/abc/resourceGroups/rg-prod/providers/Microsoft.Web/sites/checkout-api
name: checkout-api
resource_type: azure_appservice_web_apps
resource_group: rg-prod
subscription_id: abc
properties:
  serverFarmId: /subscriptions/abc/resourceGroups/rg-prod/providers/Microsoft.Web/serverFarms/asp-prod
  hostNames:
    - checkout-api.example.com
tags:
  environment: prod
  appgw: appgw-prod
```

## Generation rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRule
spec:
  match:
    resource_type: azure_appservice_web_apps
    predicates:
      - jsonpath: $.tags.environment
        equals: "prod"

  relatedResources:
    plan:
      resource_type: azure_appservice_plans
      where:
        # Match the plan whose ARM ID equals this web app's serverFarmId.
        idEquals: "{{ resource.properties.serverFarmId }}"
    appGateway:
      resource_type: azure_network_application_gateways
      where:
        # Match the appgw whose name matches the 'appgw' tag on the web app.
        nameEquals: "{{ resource.tags.appgw }}"

  slxName:
    template: "azure-webapp-{{ resource.name }}-end-to-end"

  templates:
    runbook: runbook.robot.j2
    sli:     sli.yaml.j2

  context:
    webAppName:        "{{ resource.name }}"
    webAppId:          "{{ resource.id }}"
    hostName:          "{{ resource.properties.hostNames[0] }}"
    serverFarmId:      "{{ resource.properties.serverFarmId }}"
    serverFarmName:    "{{ related.plan.name }}"
    appGatewayId:      "{{ related.appGateway.id }}"
    appGatewayName:    "{{ related.appGateway.name }}"
    resourceGroup:     "{{ resource.resource_group }}"
    subscription:      "{{ resource.subscription_id }}"
```

## Rendered output

```
output/slx/azure-webapp-checkout-api-end-to-end/
├── runbook.robot
└── sli.yaml
```

The runbook can now perform multi-step diagnosis:

```robot
*** Tasks ***
Check Application Gateway Health
    Run    az network application-gateway show-backend-health
    ...    --ids ${appGatewayId}

Check Web App Availability
    Run    curl -sS https://${hostName}/health

Check Server Farm Capacity
    Run    az appservice plan show --ids ${serverFarmId}
```

## Notes

* `relatedResources` is a separate top-level field from `match`. The
  rule fires once per *matched primary*, with each related resource
  bound under `related.<key>` for the templates.
* If a related resource isn't found (no matching plan, no matching
  appgw), the rule still fires, but the corresponding `related.*`
  values are empty. Templates should defensively handle missing related
  resources or the rule should add a stricter `predicates` block.
* Cross-resource predicates (e.g. "fire only when *both* the web app
  and its appgw have `environment: prod`") are best expressed by
  predicates on the primary plus a `where` clause that filters the
  related lookup.

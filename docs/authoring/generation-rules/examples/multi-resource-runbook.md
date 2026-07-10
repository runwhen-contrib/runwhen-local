# Example: Azure web app with related resource IDs

Pass multiple ARM resource identifiers into one runbook from a **single**
matched resource. This pattern covers the common case where troubleshooting
one resource requires IDs that are already present on its payload (here, the
App Service plan ID embedded in the web app).

For SLX-to-SLX graph relationships across separate generation rules, use
map customization rules in your workspace `workspaceInfo.yaml`.

## Matched resource

The primary resource is `azure_appservice_web_apps`:

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
kind: GenerationRules
spec:
  platform: azure
  generationRules:
    - resourceTypes:
        - azure_appservice_web_apps
      matchRules:
        - type: pattern
          pattern: "prod"
          properties: [tags]
          mode: substring
      slxs:
        - baseName: az-web-e2e
          qualifiers: ["resource", "resource_group", "subscription_id"]
          baseTemplateName: azure-web-e2e
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: sli
            - type: runbook
              templateName: azure-web-e2e-taskset.yaml
```

## Template: expose related IDs from the primary resource

The runbook receives plan and hostname data from `match_resource` — no
separate lookup step is required:

```yaml
# excerpt from azure-web-e2e-taskset.yaml
spec:
  configProvided:
    - name: WEB_APP_NAME
      value: {{ match_resource.name }}
    - name: HOST_NAME
      value: {{ match_resource.resource.properties.hostNames[0] }}
    - name: SERVER_FARM_ID
      value: {{ match_resource.resource.properties.serverFarmId }}
    - name: APPGW_TAG
      value: {{ match_resource.resource.tags.appgw }}
    - name: RESOURCE_GROUP
      value: {{ resource_group.name }}
```

The runbook can then call Azure CLI with `--ids ${SERVER_FARM_ID}`, curl
`${HOST_NAME}`, or look up an Application Gateway by name from
`${APPGW_TAG}`.

## Rendered output

```
output/slx/az-web-e2e--rg-prod--checkout-api--<subscription>/
├── slx.yaml
├── sli.yaml
└── taskset.yaml
```

## Notes

* When you need **separate SLXs per resource type** (web app + plan +
  gateway), write one generation rule per `resourceTypes` entry and link them
  in the workspace map with customization rules.
* Tags like `appgw` are user-supplied; document expected tag shapes in your
  CodeBundle README or `SKILL.md`.

# Example: Kubernetes Deployment SLX

Generate a "diagnose Deployment rollout" SLX for every multi-replica
Deployment outside `kube-system`.

## Matched resource

A `deployment` resource:

```yaml
id: /apis/apps/v1/namespaces/payments/deployments/checkout-api
name: checkout-api
resource_type: deployment
subscription_id: prod-west       # cluster name
metadata:
  namespace: payments
  labels:
    team: payments
    tier: backend
spec:
  replicas: 5
  selector:
    matchLabels:
      app: checkout-api
status:
  availableReplicas: 5
  conditions:
    - type: Available
      status: "True"
```

## CodeBundle layout

```
codebundles/k8s-deployment-rollout/
└── .runwhen/
    ├── generation-rules/
    │   └── k8s-deployment-rollout.yaml
    └── templates/
        ├── k8s-deployment-rollout-slx.yaml
        ├── k8s-deployment-rollout-sli.yaml
        └── k8s-deployment-rollout-taskset.yaml
```

## Generation rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: kubernetes
  generationRules:
    - resourceTypes:
        - deployment
      matchRules:
        - type: pattern
          pattern: "^(?!kube-system$).*"
          properties: [namespace]
          mode: exact
        - type: exists
          properties: ["resource/metadata/labels/team"]
        - type: pattern
          pattern: "^[2-9][0-9]*$"
          properties: ["resource/spec/replicas"]
          mode: exact
      slxs:
        - baseName: k8s-deploy-rollout
          qualifiers: ["cluster", "namespace", "resource"]
          baseTemplateName: k8s-deployment-rollout
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: sli
            - type: runbook
              templateName: k8s-deployment-rollout-taskset.yaml
```

## Rendered output

For `checkout-api` in cluster `prod-west`, namespace `payments`:

```
output/slx/k8s-deploy-rollout--prod-west--payments--checkout-api/
├── slx.yaml
├── sli.yaml
└── taskset.yaml
```

Templates access `match_resource`, `namespace`, and `cluster` directly:

```yaml
spec:
  configProvided:
    - name: DEPLOYMENT
      value: {{ match_resource.name }}
    - name: NAMESPACE
      value: {{ namespace.name }}
    - name: CLUSTER
      value: {{ cluster.name }}
    - name: REPLICAS
      value: {{ match_resource.resource.spec.replicas }}
```

## Notes

* On Kubernetes resources, `subscription_id` is the cluster name; include
  `cluster` in `qualifiers` to avoid collisions across clusters.
* Namespace Level of Detail must be `basic` or `detailed` for Deployments
  to be indexed — configure under
  `cloudConfig.kubernetes.contexts[].namespaceLevelOfDetails`.

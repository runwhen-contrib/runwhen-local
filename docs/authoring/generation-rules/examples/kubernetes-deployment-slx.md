# Example: Kubernetes Deployment SLX

Generate a "diagnose Deployment rollout" SLX for every multi-replica
Deployment in namespaces tagged for production.

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

## Generation rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRule
spec:
  match:
    resource_type: deployment
    predicates:
      - jsonpath: $.spec.replicas
        greater_than: 1
      - jsonpath: $.metadata.labels.team
        exists: true
      - jsonpath: $.metadata.namespace
        not_equals: "kube-system"

  slxName:
    template: >-
      k8s-{{ resource.subscription_id }}-{{ resource.metadata.namespace }}-{{ resource.name }}-rollout

  templates:
    runbook: runbook.robot.j2
    sli:     sli.yaml.j2

  context:
    cluster:    "{{ resource.subscription_id }}"
    namespace:  "{{ resource.metadata.namespace }}"
    deployment: "{{ resource.name }}"
    team:       "{{ resource.metadata.labels.team }}"
    replicas:   "{{ resource.spec.replicas }}"
```

## Rendered output

For `checkout-api` in cluster `prod-west` you get:

```
output/slx/k8s-prod-west-payments-checkout-api-rollout/
├── runbook.robot
└── sli.yaml
```

`runbook.robot.j2` then has access to `${cluster}`, `${namespace}`,
`${deployment}`, `${team}`, `${replicas}` and can shell out to `kubectl`
or call the Kubernetes API directly.

## Notes

* The `subscription_id` field on Kubernetes resources is the cluster
  name; the SLX naming template includes it so you don't get name
  collisions across multiple clusters.
* The `metadata.labels.team` predicate uses `exists`, which is enough
  to require *any* team label without pinning to a specific value.
* A namespace's effective Level of Detail must be `BASIC` or `DETAILED`
  for its Deployments to even arrive at this rule. Configure that under
  `cloudConfig.kubernetes.contexts[].namespaceLevelOfDetails` -
  see [Kubernetes-LOD configuration](../../../architecture/kubernetes-lod/configuration.md).

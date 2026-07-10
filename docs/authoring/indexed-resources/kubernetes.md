# Kubernetes indexed resources

When you write a generation rule, you tell the workspace builder which
resources to match by listing one or more resource types under
`resourceTypes`. This page lists the resource types the Kubernetes indexer
discovers, the names that work, and a working match rule example.

Use the Kubernetes kind name (lowercase) as `resourceTypes` — e.g.
`deployment`, `pod`, `namespace`. Custom CRDs use `plural.group[/version]`
and must be declared in `customResourceTypes`.
[Full catalog →](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/authoring/indexed-resources/kubernetes-resource-catalog.md)

## Built-in resource types

| Resource type | API group |
|---|---|
| `cluster` | — (synthesized) |
| `namespace` | core/v1 |
| `deployment` | apps/v1 |
| `statefulset` | apps/v1 |
| `daemonset` | apps/v1 |
| `pod` | core/v1 |
| `service` | core/v1 |
| `configmap` | core/v1 |
| `secret` | core/v1 |
| `cronjob` | batch/v1 |
| `job` | batch/v1 |
| `ingress` | networking.k8s.io/v1 |
| `gatewayclass` | gateway.networking.k8s.io/v1 |
| `gateway` | gateway.networking.k8s.io/v1 |
| `httproute` | gateway.networking.k8s.io/v1 |
| `custom` | — (CRDs via `customResourceTypes`) |
| `persistentvolumeclaim` | core/v1 |

## Built-in matchable properties

| Property | Value |
|---|---|
| `name` | Object name |
| `namespace` | Parent namespace |
| `cluster` | Cluster name |
| `labels`, `label-keys`, `label-values` | Kubernetes labels |
| `annotations`, `annotation-keys`, `annotation-values` | Kubernetes annotations |

Use `resource/<path>` to reach raw JSON fields from the object manifest —
e.g. `resource/spec/replicas` or `resource/spec/template/spec/containers/0/image`.

## Example match rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: kubernetes
  generationRules:
    - resourceTypes:
        - deployment
      matchRules:
        - type: and
          matches:
            - type: pattern
              properties: [namespace]
              pattern: "^payments$"
              mode: exact
            - type: pattern
              properties: ["resource/spec/replicas"]
              pattern: "^[2-9]|[0-9]{2,}$"
              mode: exact
      slxs:
        - baseName: deployment-health
          qualifiers: [cluster, namespace, name]
          baseTemplateName: k8s-deployment-health
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: runbook
```

> [!NOTE]
> Pods, services, secrets, and configmaps are only discovered in namespaces
> with `detailed` or `basic` LOD. Namespaces set to `none` are skipped by the
> indexer entirely — no resources from those namespaces are visible to
> generation rules. Configure LOD in `workspaceInfo.yaml` per context or per
> namespace; the full scoping mechanics are in the
> [Kubernetes-LOD architecture](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/architecture/kubernetes-lod/README.md).
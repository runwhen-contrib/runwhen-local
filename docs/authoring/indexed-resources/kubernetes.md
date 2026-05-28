# Kubernetes indexer

The Kubernetes indexer talks to a cluster via the official Kubernetes
Python client, using whatever kubeconfig / in-cluster service account the
container has access to.

For credential setup and per-cluster `workspaceInfo.yaml` snippets, see
the user guide's [Kubernetes cloud-discovery
page](../../user-guide/cloud-discovery/kubernetes.md). For the full
namespace-scoping mechanics, see the
[Kubernetes-LOD architecture docs](../../architecture/kubernetes-lod/README.md).

## Discovered resource types

The indexer discovers the standard Kubernetes object kinds that the
contrib CodeBundles target:

* `cluster` - one per workspaceInfo cluster entry.
* `namespace` - via `CoreV1Api.list_namespace()`.
* `deployment`, `statefulset`, `daemonset` (apps/v1).
* `pod`, `service`, `configmap`, `secret` (core/v1) -
  visibility depends on the per-namespace LOD.
* `cronjob`, `job` (batch/v1).
* `ingress` (networking.k8s.io/v1).
* `gatewayclass`, `gateway`, `httproute` (gateway.networking.k8s.io/v1)
  when the CRDs are installed.
* Any custom resource explicitly listed under
  `cloudConfig.kubernetes.customResourceTypes`.

Each object lands in the resource store with its full
`apiVersion`/`kind`/`metadata`/`spec`/`status` payload, plus
`subscription_id` set to the cluster name (the resource store treats the
cluster like a "subscription" so a single workspace can span many).

## Level of detail per namespace

`workspaceInfo.yaml` lets you set discovery scope per namespace. The
classic invocation looks like:

```yaml
cloudConfig:
  kubernetes:
    contexts:
      - name: prod-west
        clusterName: prod-west
        defaultLOD: none
        namespaceLevelOfDetails:
          payments: detailed
          orders:   basic
          kube-system: none
```

Resources whose effective LOD resolves to `NONE` are dropped at indexing
time, exactly like the Azure indexer drops out-of-scope resource groups.
The decision tree (workspace default, per-context default, namespace
override, custom-resource override) is documented in detail in
[`architecture/kubernetes-lod/`](../../architecture/kubernetes-lod/README.md).

## What generation rules can match

Generation rules can match against any of the discovered types by
`resource_type`:

```yaml
match:
  resource_type: deployment
  predicates:
    - jsonpath: $.metadata.namespace
      equals: payments
    - jsonpath: $.spec.replicas
      greater_than: 1
```

`predicates` operate on the original Kubernetes object payload (see
[generation rules](../generation-rules/README.md) for the full predicate
grammar).

## See also

* [User guide: Kubernetes cloud discovery](../../user-guide/cloud-discovery/kubernetes.md)
* [Architecture: Kubernetes-LOD internals](../../architecture/kubernetes-lod/README.md)
* [AKS namespace-LOD addendum](../../architecture/kubernetes-lod/aks-namespace-lods.md)

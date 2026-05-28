# Architecture

Engineering-facing internals of RunWhen Local: how the workspace-builder
service is put together, how each indexer pulls cloud state, how the
resource store works, and how the rendered workspace is assembled.

If you want to *use* RunWhen Local, see the [user guide](../user-guide/README.md).
If you want to *extend* it (CodeBundles, Skills, generation rules), see the
[authoring guide](../authoring/README.md).

## Overall shape

* [High-level architecture (disconnected)](./overview.md)
* [Self-hosted runner architecture (connected)](./high-level-architecture-self-hosted-runner-connected.md)

## Resource store

The intermediate datastore between indexers and renderers.

* [ResourceWriter](./resource-writer.md) - the indexer-facing write API
* [Resource store query API](./resource-store-query-api.md) - the
  enricher / generation-rule-facing read API

## Indexers

Per-platform deep dives.

* [Azure indexer internals](./azure-indexer-internals.md)
* [Kubernetes Level-of-Detail internals](./kubernetes-lod/README.md)
  * [Configuration internals](./kubernetes-lod/configuration.md)
  * [Decision flowchart](./kubernetes-lod/flowchart.md)
  * [Quick reference](./kubernetes-lod/quick-reference.md)
  * [AKS namespace LODs (Azure-specific addendum)](./kubernetes-lod/aks-namespace-lods.md)

## Workspace assembly

* [Workspace generation statistics](./workspace-generation-statistics.md)

## Development

* [Container development guide](./development.md)

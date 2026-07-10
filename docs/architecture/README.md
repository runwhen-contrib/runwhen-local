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
* [GCP indexer internals](./gcp-indexer-internals.md)
* [AWS indexer internals](./aws-indexer-internals.md)
* [Resource-type naming migration](./resource-type-naming-migration.md) -
  alias-aware, registry-driven resource-type matching (the CloudQuery-retirement
  naming contract) and its phased plan
* [Kubernetes Level-of-Detail internals](./kubernetes-lod/README.md)
  * [Configuration internals](./kubernetes-lod/configuration.md)
  * [Decision flowchart](./kubernetes-lod/flowchart.md)
  * [Quick reference](./kubernetes-lod/quick-reference.md)
  * [AKS namespace LODs (Azure-specific addendum)](./kubernetes-lod/aks-namespace-lods.md)

## Workspace assembly

* [Workspace generation statistics](./workspace-generation-statistics.md)

## Agentic surface

* [MCP server design](./mcp-server.md) - the read-only Model Context
  Protocol server that exposes the indexed resources and rendered
  Skills to AI agents

## Development

* [Container development guide](./development.md)

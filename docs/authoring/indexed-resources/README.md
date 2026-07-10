# Indexed resource catalogs

Agent- and author-facing lookup tables for generation-rule `resourceTypes` and
`match_resource.*` properties.

| Platform | Narrative guide | Machine catalog |
|---|---|---|
| Kubernetes | [kubernetes.md](./kubernetes.md) | [kubernetes-resource-catalog.md](./kubernetes-resource-catalog.md) |
| Azure | [azure.md](./azure.md) | [azure-resource-catalog.md](./azure-resource-catalog.md) |
| GCP | [gcp.md](./gcp.md) | [gcp-resource-catalog.md](./gcp-resource-catalog.md) |
| AWS | [aws.md](./aws.md) | [aws-resource-catalog.md](./aws-resource-catalog.md) |
| RunWhen | [runwhen-platform.md](./runwhen-platform.md) | [runwhen-platform-resource-catalog.md](./runwhen-platform-resource-catalog.md) |

Regenerate catalogs with the dump scripts under `scripts/` or via the
`publish-discovery-catalog` GitHub Action.

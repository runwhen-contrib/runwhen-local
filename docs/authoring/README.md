# Authoring Guide

Everything you need to extend RunWhen Local: write CodeBundles, ship Skills,
and teach the workspace builder how to wire them up via generation rules.

**This directory is the canonical reference.** Catalogs are generated from indexer
registries (dump scripts + `publish-discovery-catalog` GHA).

- **MCP (airgap):** `author-generation-rules` skill reads bundled copies in
  `runwhen-platform-mcp/skills/author-generation-rules/references/` (CI-synced from here)
- **docs.runwhen.com:** use `publish-author-docs-from-runwhen-local` skill in the
  docs repo when ready to replace legacy `/authors/generation-rules/` pages

If you only want to *use* RunWhen Local against your own infrastructure, see
the [user guide](../user-guide/README.md) instead.

## Concepts

* [CodeBundle / Skill / SLX / Runbook terminology](./concepts.md)

## Indexed resources

Generation rules match against resources discovered by RunWhen Local's
indexers. Before you write a rule, confirm the resource type exists and
which fields are stable enough to match on.

* [Indexed resources overview](./indexed-resources/README.md)
* [Azure](./indexed-resources/azure.md) — typed vs generic tiers, match properties
* [AWS](./indexed-resources/aws.md)
* [GCP](./indexed-resources/gcp.md)
* [Kubernetes](./indexed-resources/kubernetes.md)
* [RunWhen platform](./indexed-resources/runwhen-platform.md) — `platform: runwhen` for MCP tool-builder output

Machine-readable catalogs (regenerate with `scripts/*/dump_*_resource_catalog.py`
or the `publish-discovery-catalog` GitHub Action — do not hand-edit):

* [Azure catalog](./indexed-resources/azure-resource-catalog.md)
* [AWS catalog](./indexed-resources/aws-resource-catalog.md)
* [GCP catalog](./indexed-resources/gcp-resource-catalog.md)
* [Kubernetes catalog](./indexed-resources/kubernetes-resource-catalog.md)
* [RunWhen catalog](./indexed-resources/runwhen-platform-resource-catalog.md)

## Generation rules

* [Schema reference](./generation-rules/README.md)
* [Syntax reference](../../generation-rules-guide.md) (repo root) — full `matchRules` / `slxs` / `outputItems`
* [Tag-hierarchy contract](./generation-rules/tag-hierarchy-contract.md)
* [Worked examples](./generation-rules/examples/)

## Publishing to docs.runwhen.com (later)

Use the **`publish-author-docs-from-runwhen-local`** skill in the `runwhen/docs`
repo (runs `scripts/publish-author-docs-from-runwhen-local.py` against this tree).
Replace legacy `/authors/generation-rules/*` — do not duplicate.

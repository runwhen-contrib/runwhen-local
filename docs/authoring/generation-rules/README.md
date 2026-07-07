# Generation rules

Generation rules are YAML documents inside a CodeCollection under
`.runwhen/generation-rules/*.yaml`. They tell RunWhen Local which indexed
resources to match and which SLX templates to render for each match.

Each file uses the **`GenerationRules`** kind (note the plural): one platform
per file, with one or more rule blocks under `spec.generationRules`.

For the full reference with match-rule operators, qualifiers, and complete
examples, see [`generation-rules-guide.md`](../../../generation-rules-guide.md)
at the repo root. Worked narratives live under [examples/](./examples/).

## Schema

```yaml
# .runwhen/generation-rules/<rule-name>.yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: azure   # azure | aws | gcp | kubernetes | runwhen
  generationRules:
    - resourceTypes:
        - azure_keyvault_vaults
        - resource_group
      matchRules:
        - type: pattern
          pattern: "prod"
          properties: [name]
          mode: substring
        - type: exists
          path: "resource/tags/environment"
          matchEmpty: false
      slxs:
        - baseName: keyvault-health
          qualifiers: ["resource", "resource_group", "subscription_id"]
          baseTemplateName: azure-keyvault-health
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: sli
            - type: runbook
              templateName: azure-keyvault-health-taskset.yaml
```

### `spec.platform`

Selects which indexer supplies matched resources. Supported values:

| Platform | Indexer | Typical `resourceTypes` values |
| --- | --- | --- |
| `azure` | `azureapi` | CloudQuery table names (`azure_compute_virtual_machines`, aliases like `virtual_machine`) |
| `aws` | `awsapi` | CloudQuery table names (`aws_ec2_instances`, aliases like `ec2_instance`) |
| `gcp` | `gcpapi` | CloudQuery table names (`gcp_compute_instances`, aliases like `compute_instance`) |
| `kubernetes` | `kubeapi` | Built-in kinds (`pod`, `deployment`) or CRD syntax (`buckets.storage.gcp.upbound.io`) |
| `runwhen` | `runwhen` | `workspace` (one instance per workspace-builder run; used by MCP tool-builder output) |

See [indexed-resources/](../indexed-resources/README.md) for per-platform
narrative guides and machine-readable catalogs.

### `resourceTypes`

List of resource type names to match. Names are resolved through each
platform's registry — canonical CloudQuery table names and legacy aliases
both work (for example `virtual_machine` and
`azure_compute_virtual_machines` resolve to the same Azure type).

After discovery, confirm types and field paths in the **Workspace Explorer**
at [http://localhost:8000/explorer/](http://localhost:8000/explorer/) (not
legacy `resource-dump.yaml` on disk).

For Kubernetes CRDs, use `plural.group[/version]` syntax as shown in
[examples/](./examples/).

### `matchRules`

Predicates over matched resources. **All** rules in the list must pass
(logical AND). Supported rule types include:

| Type | Purpose |
| --- | --- |
| `pattern` | Regex match on built-in properties (`name`) or paths (`resource/tags/env`) |
| `exists` | Path resolves to a non-empty value |
| `custom-variable` | Match a workspace custom variable |
| `and` / `or` / `not` | Compound logic |

See [`generation-rules-guide.md`](../../../generation-rules-guide.md#match-rules)
for operators (`exact`, `substring`), path notation, and compound examples.

### `slxs`

Each entry describes one SLX (or SLX family when `qualifiers` expand names)
to render for every resource that passes `matchRules`.

| Field | Required | Description |
| --- | --- | --- |
| `baseName` | yes | Stable prefix for generated SLX names |
| `baseTemplateName` | yes | Template bundle under `.runwhen/templates/` |
| `qualifiers` | no | Extra name segments (`resource`, `namespace`, `region`, …) |
| `levelOfDetail` | no | `basic` or `detailed` (platform-dependent) |
| `outputItems` | no | Which artifacts to render (`slx`, `sli`, `runbook`, …) |

Template files live under `.runwhen/templates/<baseTemplateName>-*.yaml`
(for example `azure-keyvault-health-sli.yaml`,
`azure-keyvault-health-taskset.yaml`). Runbooks historically use the
`*-taskset.yaml` suffix.

If a `SKILL.md` sits at the CodeCollection root, the workspace builder
copies it into each rendered SLX directory automatically.

### `outputItems`

Controls which template artifacts are emitted for an `slxs` entry. Common
types:

```yaml
outputItems:
  - type: slx
  - type: sli
  - type: runbook
    templateName: my-runbook-taskset.yaml   # optional override
```

You can also define top-level `outputItems` on a generation rule block for
direct template rendering without going through `slxs` — see the guide for
advanced cases.

## Lifecycle

1. RunWhen Local runs each configured platform indexer and stores resources.
2. For each CodeCollection, the workspace builder loads every
   `.runwhen/generation-rules/*.yaml` file for the matching `platform`.
3. For each `(rule, resource)` pair where `resourceTypes` and `matchRules`
   pass, it renders templates into the workspace output tree.
4. The explorer UI and platform upload path consume the resulting SLXs.

## Authoring tips

* **Pick types from the catalog.** Use the
  [indexed resource catalogs](../indexed-resources/README.md) instead of
  guessing CloudQuery table names.
* **Match on stable fields.** IDs and type names change less often than
  status properties.
* **One rule per SLX shape.** Prefer separate rules for prod vs. non-prod
  rather than conditional logic inside templates.
* **Dry-run locally.** Run the workspace builder with verbose logging and
  inspect `output/` before publishing the CodeCollection.

## See also

* [`generation-rules-guide.md`](../../../generation-rules-guide.md) — full
  syntax reference
* [Worked examples](./examples/) — end-to-end narratives
* [Tag-hierarchy contract](./tag-hierarchy-contract.md)
* [Indexed resources](../indexed-resources/README.md) — matchable type catalogs
* [Concepts](../concepts.md) — CodeCollection / Skill / SLX terminology

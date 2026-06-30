# Generation rules

Generation rules are the bridge between an indexed resource and a rendered
SLX. Each rule is a YAML document that lives inside a CodeBundle under
`.runwhen/generation-rules/<rule-name>.yaml` and tells RunWhen Local:

1. Which resource type to match (e.g. `azure_keyvault_keyvaults`).
2. Which subset of those resources to match (predicates over their
   attributes / tags / hierarchy).
3. Which template files to render into the SLX (runbook, SLI, SLO, etc.).
4. How to name the resulting SLX.

This page is the reference; for end-to-end examples see
[examples/](./examples/).

## Schema

```yaml
# .runwhen/generation-rules/<rule-name>.yaml
apiVersion: runwhen.com/v1
kind: GenerationRule
spec:
  match:
    resource_type: azure_keyvault_keyvaults    # required
    predicates:                                # optional, ALL must pass
      - jsonpath: $.tags.environment
        in: ["prod", "staging"]
      - jsonpath: $.properties.publicNetworkAccess
        equals: "Disabled"

  slxName:
    template: "azure-keyvault-{{ resource.name }}-rotation"
    # or:
    # tagHierarchy: env/region/{resource.name}
    # see ./tag-hierarchy-contract.md for the full hierarchy contract.

  templates:
    runbook: runbook.robot.j2
    sli:     sli.yaml.j2
    slo:     slo.yaml.j2
    skill:   SKILL.md           # optional, copied verbatim if present

  context:                       # values exposed to the templates as `{{ ... }}`
    keyVaultId:    "{{ resource.id }}"
    keyVaultName:  "{{ resource.name }}"
    resourceGroup: "{{ resource.resource_group }}"
    subscription:  "{{ resource.subscription_id }}"
    rotationDays:  90
```

### `match.resource_type`

Must be the canonical name (or an alias) of an indexed resource type. See
[indexed-resources/](../indexed-resources/README.md) for the per-platform
catalog. Aliases are resolved by the registry, so all of
`virtual_machine`, `azure_compute_virtual_machines`, and
`azure_keyvault_vaults` resolve to the same underlying type.

### `match.predicates`

Each predicate is a `(jsonpath, op, value)` triple. Supported ops:

| Op | Semantics |
| --- | --- |
| `equals` | Exact match (case-sensitive). |
| `not_equals` | Negation of `equals`. |
| `in` | Value is in a list. |
| `not_in` | Value is not in a list. |
| `matches` | Regex match (Python `re.search`). |
| `exists` | The path resolves to a non-`None` value. |
| `greater_than` / `less_than` | Numeric comparison. |
| `present` / `absent` | Tag-shape predicate (`tags.<key>` is/isn't set). |

All predicates must pass for the rule to fire (logical AND). For OR /
NOT logic, write multiple rules or combine with `not_in` etc.

### `slxName`

The SLX name has to be globally unique per workspace. Two strategies:

* `template` - a Jinja-style string referencing the matched
  `resource`. Must produce a stable, DNS-friendly slug.
* `tagHierarchy` - delegate naming to the
  [tag-hierarchy contract](./tag-hierarchy-contract.md). Useful when you
  want SLXs grouped by `env/team/cluster/...`.

### `templates`

Paths are resolved **relative to the CodeBundle root**, not the rule
file. `runbook` is required; `sli`, `slo`, `skill` are optional. Any
template marked here is rendered with the rule's `context` plus the
matched `resource` dict.

If a `SKILL.md` (any case) sits at the CodeBundle root, the workspace
builder copies it next to the rendered SLX even if you don't list it
under `templates`. This is what makes the AI-agent-readable Skill
overlay automatic.

### `context`

A flat dict of values made available to the rendered templates. Values
can reference the matched `resource` via `{{ resource.<field> }}`.
Good practice is to expose every ID / name / region your runbook needs
via `context`, so the runbook itself stays free of resource-store-specific
plumbing.

## Lifecycle

1. The workspace builder runs the indexer for each configured platform.
2. For every `(CodeBundle, generation-rule)` pair it walks the matching
   resources in the resource store.
3. For each match it renders the templates into
   `output/slx/<slxName>/`, copies any `SKILL.md`, and emits an entry
   in the SLX manifest.
4. The explorer UI reads the manifest at runtime; the platform upload
   path can ship the same artifacts to the connected RunWhen Platform.

## Authoring tips

* **Match against stable fields.** ARM IDs and `resource_type` don't
  change; tags and statuses do. Predicates over `properties.*` are fine,
  but expect occasional flakiness if the cloud provider mutates a
  status field unexpectedly.
* **Keep `context` flat.** Templates rendered with deeply nested
  contexts are harder to debug than ones that read a flat keyspace.
* **Test with dry-run.** Run the workspace builder with
  `--verbose` and inspect `output/` before shipping the CodeBundle.
* **One rule per "shape" of SLX.** If an SLX template only makes sense
  for production resources, write a `prod-only` rule rather than a
  `template if env == prod`. It's easier to read and easier to disable.

## See also

* [Worked examples](./examples/) - four end-to-end rules.
* [Tag-hierarchy contract](./tag-hierarchy-contract.md).
* [Indexed resources](../indexed-resources/README.md) - the catalog of
  matchable types.
* [Concepts](../concepts.md) - CodeBundle / Skill / SLX terminology.

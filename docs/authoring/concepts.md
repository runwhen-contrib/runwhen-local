# Concepts: CodeBundle, Skill, SLX, Runbook

RunWhen has a small but specific vocabulary. Knowing exactly what each term
means makes the rest of the authoring guide make sense.

## CodeBundle

A **CodeBundle** is a versioned, distributable bundle of automation. Today
that's a Git repo (or sub-directory of one) inside a [CodeCollection][cc]
such as [`rw-cli-codecollection`][rw-cli] or
[`rw-public-codecollection`][rw-public]. A CodeBundle ships:

* The actual code (Robot Framework files for `rw-cli-codecollection`,
  Bash/Python helpers, etc.).
* Optional **Skill metadata**: a `SKILL.md` file describing what the bundle
  does and what an AI agent can do with it.
* Generation rules in `.runwhen/generation-rules/*.yaml` that tell RunWhen
  Local *when* to render an SLX from this CodeBundle.

[cc]: https://github.com/runwhen-contrib/codecollection-registry
[rw-cli]: https://github.com/runwhen-contrib/rw-cli-codecollection
[rw-public]: https://github.com/runwhen-contrib/rw-public-codecollection

## Skill

A **Skill** (or *Skill template*) is the abstract capability defined by a
CodeBundle: "diagnose a stuck Pod", "rotate an Azure storage account key",
"check whether a database has free disk". When the user says "the CodeBundle
contains a Skill", they mean the CodeBundle exposes runnable code plus the
metadata an agent or human needs to invoke it.

The on-disk marker is a `SKILL.md` file at the root of the CodeBundle (any
casing - RunWhen Local matches case-insensitively). When the workspace
builder renders an SLX from a CodeBundle that has a `SKILL.md`, it copies
that file alongside the rendered artifacts so downstream tools (the explorer
UI, MCP agents) can read it.

## SLX

An **SLX** (Service-Level X-objective) is a *rendered instance* of a Skill,
bound to a specific resource (or set of resources) in your environment.
"Diagnose a stuck Pod" is a Skill; "Diagnose a stuck Pod **in the
`payments-prod` namespace of cluster `west-2`**" is an SLX.

RunWhen Local generates SLXs by walking discovered resources and matching
them against generation rules. Each SLX gets a directory under `output/`
containing:

* The Skill template (`SKILL.md`, copied from the CodeBundle)
* A rendered `runbook.robot` (or equivalent), with placeholders bound to
  the matched resource
* SLI / SLO metadata (`sli.yaml`, `slx.yaml`) for the RunWhen Platform
* Anything else the CodeBundle's templates emit

## Runbook

A **Runbook** is the executable artifact inside an SLX - typically a
Robot Framework `.robot` file. It's what a human (or agent) actually runs
when the SLX fires. The runbook is one output of the rendering pipeline;
the SLX is the wrapper around it.

## Generation rule

A small YAML document inside a CodeBundle that says:

* "Match this resource type" (e.g. `azure_keyvault_keyvaults`)
* "When the resource looks like THIS" (predicates over its attributes)
* "Render an SLX from THIS template" (the path to the runbook template)

See [generation-rules/README.md](./generation-rules/README.md) for the full
schema.

## Putting it together

```text
CodeBundle (in a CodeCollection git repo)
├── SKILL.md                    # describes the Skill
├── runbook.robot.template      # the rendered runbook template
└── .runwhen/generation-rules/
    └── keyvault-rotation.yaml  # generation rule

      ↓  workspace builder runs ↓

Discovered resource: azure_keyvault_keyvaults / kv-prod-001
   matched by keyvault-rotation.yaml
      ↓
output/slx/azure-keyvault-kv-prod-001-rotation/
├── SKILL.md             # copied from the CodeBundle
├── runbook.robot        # rendered with kv-prod-001's id, name, etc.
├── sli.yaml
└── slx.yaml
```

The rest of the authoring guide is about each of those layers in detail.

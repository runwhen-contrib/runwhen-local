# E2E Upload Test Suite — Simulator Design

**Date:** 2026-05-05
**Status:** Draft (post-brainstorming, pre-implementation)

## Purpose

Enable a separate test suite repository to verify platform-side behavior of PAPI workspace uploads without depending on live Kubernetes clusters, cloud APIs, or the workspace builder's discovery components. The simulator is a new code path inside `runwhen-local` that consumes a deterministic SLX-keyed test config and produces an upload archive identical in shape to a real workspace builder run, then uploads it via the existing upload code path.

The simulator does not own workspace lifecycle, runner-secret generation, `uploadInfo.yaml` generation, post-upload polling, or content verification. Those concerns belong to the test suite repository.

## Architecture

A new `simulate` subcommand on `run.py` runs the workspace-builder pipeline with discovery components replaced by a deterministic synthesizer:

```
test config YAML  ──┐
                    ▼
         [test_synth component]              ← NEW (replaces kubeapi/cloudquery)
                    │  emits TestResource[]
                    ▼
         [generation_rules]                  ← existing, unchanged
                    │  matches via NEW _test-passthrough.yaml rule
                    ▼
         [render_output_items]               ← existing, unchanged
                    │  writes /shared/output/workspaces/<ws>/...
                    ▼
         [upload]                            ← existing, unchanged
                    │  POSTs to PAPI per uploadInfo.yaml
                    ▼
         stdout: {"task_id": "...", "workspace_name": "..."}
```

Components used at minimum: `--components test_synth,generation_rules,render_output_items`. `kubeapi`, `cloudquery`, and `azure_devops` are not invoked, so no cluster, kubeconfig, or cloud auth is required. Whether `load_resources` is needed alongside the simulator components is an implementation-time question (see Open Implementation Questions).

## Invocation Contract

The test suite repo shells out to:

```bash
python3 run.py simulate \
  --config test.yaml \
  --upload-info /shared/uploadInfo.yaml \
  --base-directory /shared \
  --upload \
  --upload-merge-mode keep-existing \
  --prune-stale-slxs
```

Standard input: a YAML file at `--config` describing the SLX content for the test scenario.
Standard output (on success): a JSON envelope captured by the test suite:

```json
{"task_id": "<uuid>", "workspace_name": "<name>"}
```

Standard error: existing logging output from the workspace builder.

The `--upload-merge-mode`, `--prune-stale-slxs`, and `--prune-stale-resources` flags reuse the existing argument definitions from the `run` subcommand and pass through unchanged to the upload logic.

## Test Config Schema (v1)

```yaml
slxs:
  my-app-ops:                          # required — dict key becomes SLX baseName/slug
    levelOfDetail: detailed             # optional, default: basic. (none/basic/detailed)
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops      # path within the codeCollection
    runbook:                            # required — passthrough variables to runbook template
      <arbitrary key/value pairs>
    sli:                                # optional — passthrough variables to sli template
      <variables>
    slo:                                # optional — passthrough variables to slo template
      <variables>

  another-slx:
    ...
```

Design choices:

- The dict key becomes the SLX `baseName`. Renames are explicit in test YAML diffs.
- `codeCollection` and `codeBundle` are *strings only* — they become labels on rendered SLX YAMLs. The simulator does not require the named codecollection to exist on disk; the platform stores the labels as references.
- `runbook` / `sli` / `slo` subdicts are passthrough Jinja context. The simulator does not validate their contents; tests that target a specific code bundle pass whatever variables that bundle's template expects.
- An SLI/SLO output item is rendered only if its corresponding key is present in the test config and its value is a non-null, non-empty dict. Missing key, `null`, and `{}` all suppress rendering for that output item.

Excluded from v1 (added when a specific scenario needs them): `tags`, `customLabels`, `qualifiers`, `group`, `relationships`.

## File Layout (New Code in runwhen-local)

```
src/
├── run.py                              # MODIFIED — add SIMULATE_COMMAND, dispatch
├── simulator/
│   ├── __init__.py
│   ├── simulator.py                    # entry point; orchestrates synth → render → upload
│   ├── test_synth.py                   # the test_synth component
│   ├── test_resource.py                # TestResource type definition
│   ├── rules/
│   │   └── _test-passthrough.yaml      # passthrough generation rule
│   └── templates/
│       ├── test-runbook.yaml
│       ├── test-sli.yaml
│       └── test-slo.yaml
```

### Responsibilities

**`run.py`** — Adds `simulate` to the subcommand list. Parses `--config`, `--upload-info`, and the existing upload flags. Reads the test YAML, builds an in-memory `workspaceInfo` dict from `uploadInfo.yaml` fields (`workspaceName`, `papiURL`, `locationId`, `locationName`, `workspaceOwnerEmail`), runs the pipeline with the simulator components, and conditionally executes the existing upload code path. No `workspaceInfo.yaml` file is written to disk — the in-memory dict feeds the existing `coalesce` lookups.

**`simulator/test_synth.py`** — Implements the same component interface as `kubeapi`/`cloudquery`. Reads the test YAML, instantiates one `TestResource` per SLX entry, and registers them into the resource collection. Builds the per-resource `outputItems` list dynamically (only includes `sli` / `slo` entries when those fields are present and resolve to a non-null, non-empty dict).

**`simulator/test_resource.py`** — Defines the `TestResource` type with fields: `slx_slug`, `level_of_detail`, `code_collection`, `code_bundle`, `runbook`, `sli`, `slo`. Registered with the resource type registry so the passthrough rule's `resourceTypes: [test_resource]` matches it.

**`simulator/rules/_test-passthrough.yaml`** — A regular generation rule, but loaded only when the simulator runs (the simulator subcommand injects this directory into the rules-loader search path). Matches all `TestResource` instances; produces one SLX per resource keyed off resource fields.

**`simulator/templates/`** — Minimal Jinja templates that produce schema-valid runbook/sli/slo YAMLs. They include `common-labels.yaml` from `src/templates/` so location info propagates automatically.

## Data Flow Example

Test config:

```yaml
slxs:
  my-app-ops:
    levelOfDetail: detailed
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    runbook: { commands: ["echo hello"] }
    sli: { threshold: 0.99 }
    slo: { target: 99.5 }
```

Becomes (after `test_synth`):

```python
TestResource(
    slx_slug="my-app-ops",
    level_of_detail="detailed",
    code_collection="rw-cli-codecollection",
    code_bundle="k8s-deployment-ops",
    runbook={"commands": ["echo hello"]},
    sli={"threshold": 0.99},
    slo={"target": 99.5},
)
```

Passthrough rule matches → produces SLX → render_output_items writes:

```
/shared/output/workspaces/<ws>/
├── workspace.yaml                      # via existing src/templates/workspace.yaml
└── slxs/
    └── my-app-ops/
        ├── runbook.yaml
        ├── sli.yaml
        └── slo.yaml
```

Each rendered file references `codeCollection: rw-cli-codecollection` and `codeBundle: k8s-deployment-ops` as label strings; the platform validates these as references but does not require local files to exist.

The existing upload code path tar+gzip+base64s the `<ws>` directory and POSTs to PAPI per `uploadInfo.yaml`.

## Out of Scope

Lives in the separate test suite repo:

- Workspace creation on the platform (PAPI calls, runner secret generation, `uploadInfo.yaml` generation)
- Pytest fixtures, test framework, test invocation patterns
- Task status polling after upload (the simulator returns `task_id`; polling is the consumer's job)
- Post-upload content verification (querying PAPI for SLX/runbook/sli/slo state and asserting)
- Workspace teardown / cleanup
- CI integration and credential management
- Pinning a runwhen-local commit or image tag

Excluded from v1 inside the simulator (added when a specific scenario needs them):

- `tags`, `customLabels`, `qualifiers`, `group`, `relationships` per SLX
- Custom variables at workspace level beyond `uploadInfo.yaml` fields
- Multiple test configs in one invocation
- A Python library API (only the CLI subcommand)
- Snapshot tests comparing simulator output to a real workspace builder run

## Risks

1. **Platform validation strictness.** If PAPI validates runbook content beyond schema (e.g., command names must exist in a catalog), stub content fails and tests break for non-platform reasons. Discovered in the first run. Fallback: bundle a tiny synthetic test codecollection.
2. **Schema drift between simulator templates and platform expectations.** The three simulator templates duplicate the structural shape of real codebundle templates. If the platform changes its CRD requirements, simulator templates need parallel updates. Keep simulator templates minimal so drift surface is small.
3. **Rules-loader extensibility.** The plan to put the passthrough rule in `src/simulator/rules/` assumes the existing rules loader either supports multiple directories or can have its search path injected. If it iterates one hardcoded directory, fall back to placing the file in the existing rules dir with a `_`-prefix and adding a filter.
4. **Jinja include path resolution.** Simulator templates do `{% include "common-labels.yaml" %}`. The Jinja `Environment` must search both `src/templates/` and `src/simulator/templates/`. Trivial to configure but needs to be remembered at implementation time.

## Open Implementation Questions (Not Blockers for the Spec)

- Does `OutputItem.template_name` accept paths like `simulator/test-runbook.yaml`, or does it expect flat filenames?
- Does the existing rules loader iterate a single hardcoded directory or support a search path?
- Where exactly is the resource type registry, so `TestResource` registers cleanly?
- Is the `load_resources` component a no-op when there's nothing to load (i.e., empty `codeCollections` and no kubeconfig), or does it need to be omitted from the components list when running the simulator?

All answerable at implementation time by reading code; none change the architecture.

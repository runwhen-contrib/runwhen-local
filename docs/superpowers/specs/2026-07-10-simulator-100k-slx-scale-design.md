# Simulator at Scale — Generating ~100K SLXs for Platform Stress Testing

**Date:** 2026-07-10
**Status:** Design approved, pending spec review
**Area:** `src/indexers/test_synth.py`, `docs/user-guide/features/simulator.md`

## Goal

Reach a steady-state platform holding on the order of 100K SLXs via a single
`simulate` upload, so platform behavior (UI, queries, runners, background jobs)
can be observed at that scale.

The simulator is the *loading mechanism*; the object under test is the
platform's ingestion and steady-state behavior — not the workspace builder.

### Decisions locked during brainstorming

| Question | Decision |
|----------|----------|
| Stress target | Steady-state platform load — get 100K SLXs *registered*, then observe |
| Load strategy | One giant upload — a single `simulate` run → one tar → one POST to PAPI |
| Config expression | Generative `generate:` block expanded in-process by `test_synth` |
| Topology (v1) | Realistic distribution across clusters × namespaces; **no** slxGroups / slxRelationships |
| SLI/SLO | A configurable fraction of SLXs get an SLI/SLO — defaults `sliRatio: 0.25`, `sloRatio: 0.10` |

## Why a generative block (not an external generator)

A standalone script that emits a 100K-entry `test.yaml` moves the scaling
problem to the input side: a 50–150MB YAML that becomes a 50–150MB POST body to
`/run/` and a slow `yaml.safe_load` of that blob. That stress-tests the harness,
not the platform.

The `generate:` block keeps the **input** tiny (~30 lines) while the **output**
— the rendered 100K-SLX tar POSTed to PAPI — is unchanged. It shrinks the
accidental scaling without reducing the intended stress. It also supports "one
giant upload" now (`count: 100000`) and degrades to batching later
(`count: 5000` × 20 with `--upload-merge-mode keep-existing`) with no redesign.

## Architecture

One new block in the test config, expanded inside `test_synth.index()`. Nothing
else in the pipeline changes shape:

```
test_synth (expands generate: → N anchors)
  → generation_rules (passthrough rule matches each anchor → one SLX)
  → test_groups (unchanged; no groups/rels generated in v1)
  → render_output_items (writes per-SLX files)
  → tar → single PAPI upload
```

`generate:` is **additive and opt-in**: it coexists with the existing explicit
`slxs:` / `inventory:` blocks, so small hand-authored tests keep working
unchanged.

## Config schema

```yaml
generate:
  count: 100000                 # REQUIRED. total SLXs to synthesize. > 0
  clusters: 50                  # synthetic clusters to spread across. >= 1
  namespacesPerCluster: 20      # namespaces per cluster. >= 1
                                # 50 × 20 = 1000 namespaces → 100 SLXs each = 100K
  slxTemplate:                  # applied to every synthesized SLX
    codeCollection: rw-cli-codecollection
    repoURL: https://github.com/runwhen-contrib/rw-cli-codecollection.git
    ref: main
    codeBundles:                # cycled round-robin for variety
      - k8s-deployment-ops
      - k8s-statefulset-ops
      - k8s-ingress-healthcheck
    levelOfDetail: basic

    sliRatio: 0.25              # fraction of SLXs that get an SLI. [0,1]
    sloRatio: 0.10             # fraction that also get an SLO (subset of SLI-having). [0,1]
    sli:                        # template merged into each generated SLI
      intervalStrategy: intermezzo
      intervalSeconds: 180
    slo:                        # template merged into each generated SLO
      target: 99.5
```

`sliRatio` / `sloRatio` are the primary lever for upload weight (see file-count
math below). Both configurable; the values above are defaults applied when the
key is absent.

## Expansion semantics

`test_synth` loops `count` times. For each index `i` it deterministically:

- **Cluster/namespace:** computes an even spread. With `perNs = ceil(count / (clusters * namespacesPerCluster))`, resource `i` lands in
  `cluster = (i // perNs) // namespacesPerCluster`,
  `namespace = (i // perNs) % namespacesPerCluster`, yielding names like
  `gen-cluster-03 / gen-ns-07`.
- **Code bundle:** `codeBundles[i % len(codeBundles)]`.
- **SLI/SLO selection (deterministic, not random):** an SLX gets an SLI when
  `i % 100 < round(sliRatio * 100)`; of the SLI-having set, it also gets an SLO
  when the same deterministic test passes for `sloRatio`. Determinism preserves
  the simulator's existing guarantee that identical configs produce identical
  output.
- **Anchor synthesis:** the cluster, namespace, and anchor resource are created
  **directly in the loop** — no intermediate 100K-entry `slxs` dict, no giant
  YAML string. Each anchor reuses the same attribute shape produced today by
  `_resource_attrs_from_slx_entry`, so everything downstream keeps parity.
- **Slug:** deterministic and unique, e.g. `gen-c03-n07-000420`. (The
  platform-side on-disk SLX directory name is shortened regardless, per the
  existing simulator caveat — tests must not hard-code directory names.)

Downstream (`generation_rules`, `render_output_items`, tar, upload) is untouched
and runs over the synthesized anchors exactly as over hand-authored ones.

## Feasibility ramp & instrumentation

The `generate:` block is low-risk. **"One giant upload at 100K" is the genuinely
uncertain part** — and the generative section does not fix it, because the
downstream cost (render ~235K files → tar → POST → PAPI ingest) is inherent to
putting 100K in a single upload. Feasibility is therefore a first-class
deliverable.

**Ramp, don't leap.** Run `count` at **1K → 10K → 50K → 100K**, capturing at each
step:

- wall-time per phase: synth / render / tar / upload
- peak RSS
- output **file count**
- **tar size**
- `/run/` response (status, latency)
- **PAPI upload response + latency**

This finds the breaking layer and sets expectations. If it breaks at
render/tar/PAPI, the documented remedy is **batching into one workspace**
(`count: 5000` × 20, `--upload-merge-mode keep-existing`) — same generator, zero
redesign.

**File-count math** (the real ingestion payload) at `count: 100000` with default
ratios:

| Files | Count |
|-------|-------|
| slx.yaml | 100K |
| runbook.yaml | 100K |
| sli.yaml (25%) | 25K |
| slo.yaml (10%) | 10K |
| **total** | **~235K files in one tar** |

Ratios `1.0/1.0` → ~400K files; `0.0/0.0` → runbook-only ~200K.

**Watch-items to verify during the ramp:**
- `yaml`/registry memory — mitigated since the input config is tiny, but the
  Registry still holds ~100K anchors + ~1K namespaces + clusters in memory.
- generation-rules match cost across 100K anchors.
- `skipped_templates_report.md` growth — every SLX *without* an SLI/SLO still
  evaluates the sli/slo templates, and the deliberate division-by-zero skip adds
  a line to the report per skipped item. At 100K that report may itself become a
  bottleneck.

## Limits & error handling

- **Validate `generate` up front** in `test_synth`: `count > 0`, `clusters >= 1`,
  `namespacesPerCluster >= 1`, `sliRatio`/`sloRatio` in `[0,1]`. Raise a clear
  error (not a stack trace) when `count` cannot distribute sensibly.
- **Cap `skipped_templates_report.md`** (or suppress the deliberate sli/slo skip
  entries) so it does not blow up at 100K. Retain enough to remain informative.
- **Docs:** add a "Generating at scale" section to
  `docs/user-guide/features/simulator.md` covering the `generate:` schema, the
  ramp procedure, the file-count math, and the batching fallback.

## Testing

- **Unit tests** on the pure expansion logic (fast, no upload), alongside the
  existing `src/workspace_builder/tests_simulator*.py`:
  - total synthesized count equals `count`
  - even cluster/namespace distribution
  - round-robin code-bundle assignment
  - deterministic SLI/SLO selection matches the configured ratios (e.g.
    `sliRatio: 0.25` → exactly ~25% over a representative count, deterministic
    across runs)
  - `generate:` coexists additively with explicit `slxs:` entries
  - input validation rejects bad `count`/`clusters`/ratios
- **End-to-end** at `count: 100` through the real pipeline, asserting parity
  with hand-authored configs (files rendered, workspace.yaml well-formed).

## Out of scope (v1)

- slxGroups / slxRelationships generation (opt-in knobs, later).
- Batched multi-upload orchestration as an automated harness (the generator
  *supports* it manually; wrapping it in a driver script is a follow-up).
- Multi-workspace / multi-tenant distribution.

## Open risk

Whether a single 100K-SLX upload survives end-to-end is unproven until the ramp
runs. The design deliberately front-loads that uncertainty (the ramp) and keeps
the batching fallback one config change away, rather than assuming the single
upload works.

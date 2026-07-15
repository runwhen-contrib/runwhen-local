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
| Naming | **Organic** — composed from curated infra vocabularies, no numeric counters. Names unique **per cluster** (may recur across clusters, as in real infra) |

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

The organic-naming requirement reinforces this choice. The vocabulary +
seeded-distribution + per-cluster-uniqueness logic is **real code either way** —
a standalone generator (Option A) would contain exactly the same logic, just
emitting it into a 50–150MB YAML that the builder must then parse. Putting that
logic in an **isolated, additive** function in `test_synth` (Option B) avoids the
huge artifact and the heavy parse on the component we are *not* testing.

**No-regression guarantee:** Option B does not modify the existing per-SLX path.
The expansion is a new pure function that pre-populates the same in-memory entry
shape the current `for slug, entry in slxs.items()` loop already consumes; the
existing loop and `_resource_attrs_from_slx_entry` are untouched. Hand-authored
configs render byte-for-byte as before, which the end-to-end parity test asserts.

## Prerequisite: merged base repaired (Django→FastAPI)

This feature builds on PR #797's merge with `main`, which brought the workspace
builder's Django→FastAPI migration. That migration silently broke the simulator;
it has been repaired (commit `fix(simulator): repair simulator for
Django→FastAPI migration merge`) and all 20 simulator/envelope/CLI tests pass on
the merged base. One repaired behavior matters for this feature:

- Rendered workspace files now default to a **sqlite `workspace_artifacts`
  store** (`writeWorkspaceFilesToDisk=False`). The `/run/` REST response does
  **not** carry `resources.sqlite`, so main's DB-sourced upload path is
  unavailable over REST. The `simulate` subcommand therefore defaults
  `writeWorkspaceFilesToDisk=True`, and the upload archive is sourced from the
  on-disk `workspaces/<ws>` tree.

**Implication for 100K:** the disk-write + tar-from-disk path is the *only*
viable upload path over REST — the DB-efficiency shortcut does not apply. The
feasibility ramp's file-count math (render ~235K files → tar) therefore stands
as the real, unavoidable cost, not a pessimistic upper bound.

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
  namespacesPerCluster: 20      # target namespaces per cluster (avg; skew varies it). >= 1
  seed: 1                       # deterministic PRNG seed; same seed → same inventory
  namespaceSkew: longtail       # longtail | uniform — how resources spread across namespaces
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

## Organic inventory generation

The inventory must read like a real cluster estate, not machine output: no
`resource-00001` counters, names composed from real-infra vocabulary, and a
non-uniform (long-tail) distribution. All of it seeded, so it stays
reproducible.

### Vocabularies (built-in data, curated)

Committed as a small data module (not in the YAML). Illustrative, not
exhaustive:

- **Clusters** (~40–60): `prod-us-east-1`, `prod-eu-west-1`, `staging-us-central`,
  `dev-sandbox`, `gke-platform-prod`, …
- **Namespaces** (~400–800): domain/team words — `payments`, `checkout`,
  `user-profile`, `search`, `recommendations`, `fulfillment`, `billing`,
  `observability`, `platform-ops`, …
- **Resource names**: composed `{service}-{component}[-{variant}]`
  - service bank (~100): `orders`, `payments`, `auth`, `cart`, `catalog`,
    `pricing`, `shipping`, `inventory`, …
  - component bank (~60): `api`, `web`, `worker`, `scheduler`, `cache`, `db`,
    `gateway`, `consumer`, `indexer`, `sync`, `cron`, …
  - variant bank (~10, used only when needed for uniqueness): `canary`, `blue`,
    `green`, `v2`, `edge`, `internal`, `primary`, `replica`, …

Composable resource-name space ≈ 100 × 60 × (1 + 10) ≈ **66K per cluster** —
far above any single cluster's resource count, so uniqueness holds with **zero
numeric suffixes**.

### Uniqueness rule (per cluster)

A resource name is unique **within a cluster**, but may recur across clusters
(`payments-api` in both `prod-us-east-1` and `staging-us-central`) — exactly as
real infra reuses names. Enforcement: a per-cluster `used_names` set; draw
`{service}-{component}`, and only if it collides append an organic `variant`
(never a counter). The space >> demand, so this terminates immediately.

The **SLX slug derives from the qualified path** (`{cluster}/{namespace}/{name}`),
which is globally unique by construction — no counter in any visible name. (The
platform-side on-disk SLX directory name is shortened regardless, per the
existing simulator caveat — tests must not hard-code directory names.)

### Organic skew

`namespaceSkew: longtail` (default) draws namespace sizes from a seeded
long-tail: a few large prod namespaces (500+ resources), many small ones (5–30),
and namespaces distributed unevenly across clusters (big prod, tiny dev).
`namespaceSkew: uniform` restores the flat `count / (clusters × ns)` spread for
predictable tests. Resource **kinds** are weighted realistically (~70%
Deployment; StatefulSet/Service/Ingress/CronJob for the remainder), and **labels**
are coherent per resource (`app.kubernetes.io/part-of: <service>`,
`app.kubernetes.io/component: <component>`, `tier`, `env`).

## Expansion semantics

A single seeded PRNG (`seed`) drives all draws, so identical config → identical
inventory (preserving the simulator's determinism) while output *looks*
hand-built. The generator:

1. picks the cluster set from the cluster vocab (seeded, `clusters` of them);
2. for each cluster, picks its namespaces (seeded, ~`namespacesPerCluster`
   average) and their long-tail sizes so the grand total ≈ `count`;
3. for each resource slot, composes a per-cluster-unique organic name, assigns a
   weighted kind and coherent labels, and picks `codeBundle` round-robin from the
   template;
4. selects SLI/SLO membership deterministically from the seeded stream to hit
   `sliRatio` / `sloRatio` (so `sliRatio: 0.25` yields ~25% over the run,
   reproducibly), with the SLO set a subset of the SLI set;
5. synthesizes the cluster, namespace, and anchor resource **directly in the
   loop** — no intermediate 100K-entry `slxs` dict, no giant YAML string — reusing
   the same anchor attribute shape produced today by
   `_resource_attrs_from_slx_entry`, so everything downstream keeps parity.

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
  - cluster count equals `clusters`; namespaces average ~`namespacesPerCluster`;
    grand total of resources across all namespaces equals `count`
  - round-robin code-bundle assignment
  - deterministic SLI/SLO selection matches the configured ratios (e.g.
    `sliRatio: 0.25` → exactly ~25% over a representative count, deterministic
    across runs)
  - **organic naming:** resource names are unique per cluster; no name matches a
    `-\d+$` counter pattern; names decompose into the `{service}-{component}`
    vocabulary; same `seed` → byte-identical inventory across two runs; changing
    `seed` changes the inventory
  - `namespaceSkew: longtail` produces non-uniform namespace sizes (variance
    above a threshold); `uniform` produces flat sizes
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

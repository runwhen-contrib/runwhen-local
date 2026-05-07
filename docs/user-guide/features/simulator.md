# Simulator (E2E Upload Test Helper)

The `simulate` subcommand on `run.py` produces a workspace upload archive
from a deterministic YAML test config and uploads it to PAPI. It is intended
for use by an external test suite that verifies platform-side ingestion
behavior; it is not for end-user use.

## Invocation

```
python3 run.py simulate \
  --config test.yaml \
  --upload-info uploadInfo.yaml \
  --base-directory /shared \
  --upload \
  [--upload-merge-mode keep-existing | keep-uploaded] \
  [--prune-stale-slxs] \
  [--prune-stale-resources]
```

A complete working example is at [`examples/simulator/test.yaml`](../../../examples/simulator/test.yaml).

## Test config schema

The full schema below; all top-level sections except `slxs` are optional. A
minimal config has only `slxs` (one entry per SLX) and inherits sensible
defaults for everything else.

```yaml
# OPTIONAL. Per-SLX field defaults. Top-level scalars are inherited when the
# SLX entry doesn't supply the field. Output-item subdicts (runbook/sli/slo)
# are deep-merged: per-SLX keys win, missing keys inherit from the default.
# Defaults alone do NOT trigger sli/slo rendering — the SLX must opt in by
# having an `sli:` (or `slo:`) key.
defaults:
  codeCollection: <name>
  repoURL: <git-url>
  ref: <branch-or-tag>
  runbook:
    secretsProvided: [...]
  sli:
    secretsProvided: [...]
    intervalStrategy: intermezzo
    intervalSeconds: 180

# OPTIONAL. Declares clusters, namespaces, and synthetic K8s resources that
# SLX entries can bind to. If omitted, each SLX is backed by a synthetic
# Deployment under simulator-cluster/simulator (current default).
inventory:
  clusters:
    - name: <cluster-name>
      namespaces:
        - name: <namespace-name>
          labels: {}            # optional
          annotations: {}       # optional
  resources:
    - id: <resource-id>          # referenced from slxs[*].resources
      kind: Deployment           # any K8s kind: Deployment, StatefulSet,
                                 # Service, Ingress, Pod, CronJob, ...
      name: <resource-name>
      cluster: <cluster-name>
      namespace: <namespace-name>
      labels:                    # become [k8s]<key> tags on the SLX
        <key>: <value>
      annotations: {}

# OPTIONAL. Workspace-level groupings rendered into workspace.yaml's
# slxGroups. SLX references use the dict keys from slxs (slugs); the
# simulator translates them to workspace-prefixed full names automatically.
slxGroups:
  - name: <group-name>
    slxs: [<slug>, <slug>, ...]
    dependsOn: [<other-group-name>]   # optional

# OPTIONAL. Workspace-level SLX-to-SLX dependencies rendered into
# workspace.yaml's slxRelationships.
slxRelationships:
  - subject: <slug>
    verb: dependent-on | depended-on-by
    object: <slug>

# REQUIRED. One entry per SLX.
slxs:
  <slx-slug>:
    levelOfDetail: basic|detailed|none      # optional, default: basic
    codeCollection: <name>                  # required (label only)
    codeBundle: <path>                      # required (path within codeCollection)
    repoURL: <git-url>                      # rendered into spec.codeBundle.repoUrl
    ref: <branch-or-tag>                    # rendered into spec.codeBundle.ref

    # OPTIONAL list of inventory.resources ids this SLX targets.
    # 1:1 — one entry, one resource. (default behavior when omitted)
    # 1:N — multiple SLX entries reference the same resource.
    # N:1 — list multiple ids; extras become additionalContext.childResources.
    resources: [<resource-id>, ...]

    # OPTIONAL SLX manifest fields (with sensible defaults).
    alias: <human-readable-name>
    statement: <description>
    asMeasuredBy: <description>
    imageURL: <url>
    owners: [<email>, ...]
    configProvided: [{name, value}]
    tags: [{name, value}]                   # overrides auto-derived tags
    additionalContext: {}                   # merged with auto-derived

    # REQUIRED. Renders into runbook.yaml's spec.
    runbook:
      pathToRobot: <path>                   # optional, default: codebundles/<codeBundle>/runbook.robot
      configProvided: [{name, value}]
      secretsProvided: [{name, workspaceKey}]

    # OPTIONAL. Renders into sli.yaml's spec when non-empty.
    sli:
      pathToRobot: <path>                   # optional, default: codebundles/<codeBundle>/sli.robot
      description: <text>
      displayUnitsLong: <text>
      displayUnitsShort: <text>
      intervalStrategy: <strategy>          # default: intermezzo
      intervalSeconds: <int>                # default: 60
      configProvided: [...]
      secretsProvided: [...]
      alertConfig: {}                       # optional

    # OPTIONAL. Renders into slo.yaml's spec when non-empty.
    slo:
      pathToRobot: <path>                   # optional, default: codebundles/<codeBundle>/slo.robot
      target: <number>                      # default: 99.0
      configProvided: [...]
      secretsProvided: [...]
```

### Auto-derived SLX fields (when `resources` is set)

When an SLX has `resources: [<id>]`, the simulator pulls the bound inventory
resource(s) and auto-fills:

- `metadata.annotations.qualifiers` — `{"namespace": "...", "cluster": "..."}`
- `spec.tags`:
  - `platform: kubernetes`
  - `cluster: <cluster-name>`
  - `namespace: <namespace-name>`
  - `kind: <Kind>` (e.g., StatefulSet, Ingress)
  - `resource_name: <resource-name>`
  - `resource_type: <kind-lowercase>`
  - For each k8s label on the resource: `[k8s]<key>: <value>`
- `spec.additionalContext.{hierarchy, qualified_name, resourcePath}`
- For N:1, `spec.additionalContext.childResources` listing the extra resources

Test config can override any auto-derived field by supplying it explicitly
on the SLX entry (e.g., `tags: [...]` overrides the entire derived tag list).

## Output

On a successful upload, the CLI prints a single JSON line on stdout:

```json
{"task_id": "<uuid>", "workspace_name": "<name>"}
```

Callers should capture stdout and use `task_id` to poll PAPI for the upload
task's terminal status.

## How it works (architecture)

1. The CLI subcommand reads the test config + `uploadInfo.yaml` and POSTs to
   the workspace builder REST service at `/run/`.
2. A bundled simulator codecollection at `src/simulator-codecollection/` is
   materialized as a temp git repo at runtime and passed via the
   `codeCollections` request setting.
3. The pipeline runs `test_synth → generation_rules → test_groups → render_output_items`:
   - `test_synth` (INDEXER) parses the test config, materializes the
     inventory topology (clusters, namespaces, resources), and synthesizes
     one anchor deployment per SLX entry under the `kubernetes` platform.
   - `generation_rules` (ENRICHER) matches anchors against the passthrough
     rule in the bundled codecollection and emits one SLX per anchor.
   - `test_groups` (ENRICHER) reads `slxGroups` and `slxRelationships` from
     the test config and populates the workspace-level group / relationship
     state, translating slugs to qualified SLX names.
   - `render_output_items` (RENDERER) writes the workspace.yaml, slx.yaml,
     runbook.yaml, sli.yaml, slo.yaml files using the simulator templates.
4. The CLI then reuses the existing upload code path to POST the resulting
   archive to PAPI.

## What it does NOT do

The following responsibilities live in the calling test suite, not in the
simulator:

- Workspace creation, runner secret generation, `uploadInfo.yaml` generation
- Polling task status, post-upload content verification
- Workspace teardown / cleanup

## Limitations and known caveats

- SLX directory names are derived from the rule's `baseName` + qualifiers
  with internal name-shortening; they do not match the input slug verbatim.
  Tests should not hard-code on-disk SLX directory names — they will look
  like `dm-ap-op-test-de45f97a` for an SLX slug `demo-app-ops`.
- The simulator codecollection's SLI and SLO templates use a deliberate
  exception (`{% if not match_resource.sli %}{% set _x = (1/0) %}{% endif %}`)
  to skip rendering when the corresponding subdict is absent. This produces
  a `division by zero` entry in the workspace's `skipped_templates_report.md`
  per skipped output item; this is expected and does not indicate failure.
- The simulator pretends its inventory is a Kubernetes inventory: anchor
  resources are registered under platform `kubernetes` with type `deployment`,
  regardless of the user-facing `kind` from inventory. The `kind` flows into
  the rendered SLX's tags / additionalContext but does not change the
  underlying synthesized resource type. This lets the simulator reuse the
  existing kubernetes platform handler without registering a new one.
- SSL verification: if the target PAPI presents a self-signed or internal-CA
  cert that the local Python's CA store doesn't trust, set the env var
  `REQUESTS_CA_BUNDLE` to any value (e.g., `REQUESTS_CA_BUNDLE=skip`) before
  running. The workspace builder treats this env var as "skip verification."

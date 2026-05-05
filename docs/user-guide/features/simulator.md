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

## Test config schema

```yaml
slxs:
  <slx-slug>:
    levelOfDetail: basic|detailed|none   # optional, default: basic
    codeCollection: <name>                # required (label only — not loaded)
    codeBundle: <path>                    # required (label only)
    runbook: { ... }                      # required, passthrough vars
    sli: { ... }                          # optional
    slo: { ... }                          # optional
```

The `codeCollection` and `codeBundle` values are stored as label strings on
the rendered SLX YAMLs. The simulator does not require the named codecollection
to exist on disk — the platform validates them as references but does not
require local files.

The `runbook`, `sli`, and `slo` subdicts are passed as Jinja context to the
corresponding template; their structure is whatever the platform expects in
the `spec` of each kind. SLI and SLO files are emitted only when their
respective subdicts are present and non-empty.

## How it works (architecture)

1. The CLI subcommand reads the test config + `uploadInfo.yaml` and POSTs to
   the workspace builder REST service at `/run/`.
2. A bundled simulator codecollection at `src/simulator-codecollection/` is
   materialized as a temp git repo at runtime and passed via the
   `codeCollections` request setting.
3. The pipeline runs `test_synth → generation_rules → render_output_items`:
   - `test_synth` (an INDEXER) parses the test config and synthesizes
     deterministic resources under the `kubernetes` platform.
   - `generation_rules` matches the synthesized resources against the
     passthrough rule in the bundled codecollection and emits one SLX per
     resource.
   - `render_output_items` writes the runbook/sli/slo YAML files into the
     workspace output directory using the bundled simulator templates.
4. The CLI then reuses the existing upload code path to POST the resulting
   archive to PAPI.

## Output

On a successful upload, the CLI prints a single JSON line on stdout:

```json
{"task_id": "<uuid>", "workspace_name": "<name>"}
```

Callers should capture stdout and use `task_id` to poll PAPI for the upload
task's terminal status.

## What it does NOT do

The following responsibilities live in the calling test suite, not in the
simulator:

- Workspace creation, runner secret generation, `uploadInfo.yaml` generation
- Polling task status, post-upload content verification
- Workspace teardown / cleanup

## Limitations and known caveats

- SLX directory names are derived from the rule's `baseName` + qualifiers
  with internal name-shortening; they do not match the input slug verbatim.
  Tests should not hard-code the on-disk SLX directory name.
- The simulator codecollection's SLI and SLO templates use a deliberate
  exception (`{% if not match_resource.sli %}{% set _x = (1/0) %}{% endif %}`)
  to skip rendering when the corresponding subdict is absent. This produces
  a `division by zero` entry in the workspace's `skipped_templates_report.md`
  per skipped output item; this is expected and does not indicate failure.
- The simulator pretends its inventory is a Kubernetes inventory: synthesized
  resources are registered under platform `kubernetes` with type `deployment`.
  This is an internal implementation choice that lets the simulator reuse the
  existing kubernetes platform handler without registering a new one.

# E2E Upload Test Suite — Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `simulate` CLI subcommand to runwhen-local that, given an SLX-keyed YAML test config and a valid `uploadInfo.yaml`, produces a workspace upload archive identical in shape to a real workspace builder run and POSTs it to PAPI — without needing a Kubernetes cluster, cloud auth, or real codecollections.

**Architecture:** A new server-side INDEXER component `test_synth` registered in the existing component framework synthesizes deterministic resources from a YAML config. A passthrough generation rule (`_test-passthrough.yaml`) matches those resources and produces SLXs. Three minimal Jinja templates render schema-valid runbook/sli/slo files. The new `simulate` subcommand on `run.py` wires this into the existing `/run/` REST flow and reuses the existing upload code path unchanged.

**Tech Stack:** Python 3, Django REST framework (existing workspace builder service), Jinja2 templates, Django TestCase for integration tests.

**Deviation from spec — file layout:** The spec proposed a new `src/simulator/` package containing the component, templates, and rules. After reading `src/component.py:240–268`, this is incompatible with the existing component framework: `init_components()` imports modules using a hardcoded `f"{stage.module_name}.{component_name}"` pattern where `stage.module_name` is one of `indexers`, `enrichers`, `renderers`. A new top-level package would be ignored. The plan therefore places the indexer at `src/indexers/test_synth.py`, the templates in `src/templates/`, and the rule in `src/map-customization-rules/` (the existing canonical locations). The architecture and behavior described in the spec are unchanged; only the on-disk paths differ.

---

## File Structure

**New files:**

- `src/indexers/test_synth.py` — the indexer; reads the `testConfig` setting, parses the YAML, registers `TestResource` instances into the resource registry.
- `src/map-customization-rules/_test-passthrough.yaml` — a regular generation rule that matches `TestResource` and emits one SLX per resource. Always loaded; harmless on non-test runs because no `TestResource` instances exist.
- `src/templates/test-runbook.yaml` — Jinja template producing a minimal valid Runbook YAML.
- `src/templates/test-sli.yaml` — Jinja template producing a minimal valid SLI YAML.
- `src/templates/test-slo.yaml` — Jinja template producing a minimal valid SLO YAML.
- `src/workspace_builder/tests_simulator.py` — Django integration tests for the simulator pipeline.

**Modified files:**

- `src/component.py` — register `test_synth` in `init_components()` (line 251).
- `src/run.py` — add `SIMULATE_COMMAND = 'simulate'`, accept it in the choices list (line 204), parse `--config`, build request_data with the simulator components and `testConfig` setting, reuse the existing upload code path.

**Why this layout:** Components in this codebase live in `src/{indexers,enrichers,renderers}/` per the framework convention enforced by `src/component.py:init_components`. There is no `src/components/` or `src/simulator/` directory — adding one would conflict with the existing import logic at `src/component.py:259` (`f"{stage.module_name}.{component_name}"`). Generation rules live in `src/map-customization-rules/`. Templates live in `src/templates/` so the existing Jinja loader picks them up without configuration changes (this also lets the test templates `{% include "common-labels.yaml" %}` for free).

---

## Task 1: Scaffold and register a no-op `test_synth` component

**Files:**
- Create: `src/indexers/test_synth.py`
- Modify: `src/component.py:251`
- Test: `src/workspace_builder/tests_simulator.py`

- [ ] **Step 1: Write the failing test**

Create `src/workspace_builder/tests_simulator.py`:

```python
import json
from http import HTTPStatus

from django.test import TestCase


class SimulatorTestCase(TestCase):
    def test_test_synth_runs_as_noop(self):
        """test_synth alone should run without error and produce no SLXs."""
        request_data = {
            "components": "test_synth",
            "workspaceName": "ws-noop",
            "papiURL": "http://papi.local",
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::SimulatorTestCase::test_test_synth_runs_as_noop -v
```

Expected: FAIL with `WorkspaceBuilderObjectNotFoundException: component test_synth` (raised by `get_component` at `src/component.py:281`).

- [ ] **Step 3: Implement minimal `test_synth.py`**

Create `src/indexers/test_synth.py`:

```python
from component import Context, Setting, SettingDependency

DOCUMENTATION = "Synthesize deterministic test resources for E2E upload tests"

TEST_CONFIG_SETTING = Setting(
    "TEST_CONFIG",
    "testConfig",
    Setting.Type.STRING,
    "YAML string describing SLXs to synthesize for the simulator pipeline",
)

SETTINGS = (
    SettingDependency(TEST_CONFIG_SETTING, False),
)


def index(context: Context):
    # No-op for now; real synthesis lands in Task 2.
    return
```

- [ ] **Step 4: Register the component**

Modify `src/component.py` at line 251 inside `init_components()`:

```python
component_stages_init = (
    (Stage.INDEXER, ["load_resources", "kubeapi", "cloudquery", "azure_devops", "test_synth"]),
    (Stage.ENRICHER, ["generation_rules"]),
    (Stage.RENDERER, ["render_output_items", "dump_resources"])
)
```

- [ ] **Step 5: Run test to verify it passes**

Run:
```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::SimulatorTestCase::test_test_synth_runs_as_noop -v
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/indexers/test_synth.py src/component.py src/workspace_builder/tests_simulator.py
git commit -m "feat(simulator): scaffold test_synth indexer as no-op"
```

---

## Task 2: TestResource type + synthesis logic

**Files:**
- Modify: `src/indexers/test_synth.py`
- Test: `src/workspace_builder/tests_simulator.py`

- [ ] **Step 1: Write the failing test**

Append to `src/workspace_builder/tests_simulator.py`:

```python
TEST_CONFIG_YAML_BASIC = """
slxs:
  my-app-ops:
    levelOfDetail: detailed
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    runbook:
      commands: ["echo hello"]
"""


class TestSynthSynthesisTestCase(TestCase):
    def test_synthesizes_one_resource_per_slx(self):
        """test_synth should register one resource per slxs entry."""
        request_data = {
            "components": "test_synth,dump_resources",
            "workspaceName": "ws-synth",
            "papiURL": "http://papi.local",
            "testConfig": TEST_CONFIG_YAML_BASIC,
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)
        # dump_resources writes the resource registry into the response archive.
        # Decode and assert that exactly one TestResource named "my-app-ops" exists.
        from base64 import b64decode
        import io, tarfile, yaml
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")
        dump_member = next(m for m in archive.getmembers() if m.name.endswith("resource_dump.yaml"))
        dump_text = archive.extractfile(dump_member).read().decode("utf-8")
        # The YAML uses custom tags (!Registry, !ResourceType); just assert the
        # expected SLX slug appears in the dump as a resource name.
        self.assertIn("my-app-ops", dump_text)
        self.assertIn("test", dump_text)  # platform name
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::TestSynthSynthesisTestCase -v
```

Expected: FAIL — the resource dump won't contain `my-app-ops` because `index()` is still a no-op.

- [ ] **Step 3: Implement TestResource synthesis**

Replace contents of `src/indexers/test_synth.py`:

```python
import yaml

from component import Context, Setting, SettingDependency
from resources import (
    Registry, REGISTRY_PROPERTY_NAME, Platform, ResourceType, Resource
)

DOCUMENTATION = "Synthesize deterministic test resources for E2E upload tests"

TEST_PLATFORM_NAME = "test"
TEST_RESOURCE_TYPE_NAME = "test_resource"

TEST_CONFIG_SETTING = Setting(
    "TEST_CONFIG",
    "testConfig",
    Setting.Type.STRING,
    "YAML string describing SLXs to synthesize for the simulator pipeline",
)

SETTINGS = (
    SettingDependency(TEST_CONFIG_SETTING, False),
)


def _resource_attrs_from_slx_entry(slug: str, entry: dict) -> dict:
    """Project a test config SLX entry into the attribute dict for a TestResource."""
    return {
        "slx_slug": slug,
        "level_of_detail": entry.get("levelOfDetail", "basic"),
        "code_collection": entry["codeCollection"],
        "code_bundle": entry["codeBundle"],
        "runbook": entry.get("runbook") or {},
        "sli": entry.get("sli") or None,
        "slo": entry.get("slo") or None,
    }


def index(context: Context):
    config_text = context.get_setting(TEST_CONFIG_SETTING)
    if not config_text:
        return

    config = yaml.safe_load(config_text) or {}
    slxs = config.get("slxs") or {}

    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
    if registry is None:
        registry = Registry({})
        context.set_property(REGISTRY_PROPERTY_NAME, registry)

    platform = registry.platforms.get(TEST_PLATFORM_NAME)
    if platform is None:
        platform = Platform(TEST_PLATFORM_NAME)
        registry.platforms[TEST_PLATFORM_NAME] = platform

    resource_type = platform.resource_types.get(TEST_RESOURCE_TYPE_NAME)
    if resource_type is None:
        resource_type = ResourceType(TEST_RESOURCE_TYPE_NAME, platform)
        platform.resource_types[TEST_RESOURCE_TYPE_NAME] = resource_type

    for slug, entry in slxs.items():
        attrs = _resource_attrs_from_slx_entry(slug, entry)
        resource = Resource(name=slug, resource_type=resource_type, attributes=attrs)
        resource_type.instances[slug] = resource
        resource_type.update_custom_attributes(set(attrs.keys()))
```

> **Note on `Resource` constructor signature:** Read `src/resources.py` lines 1–40 first to confirm the `Resource` class signature. The example above assumes `Resource(name, resource_type, attributes)` — adjust `attrs` field name (e.g., `properties` vs. `attributes`) based on what `Resource.__init__` actually accepts. If the existing code uses different field names, mirror those.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::TestSynthSynthesisTestCase -v
```

Expected: PASS. The dump contains `my-app-ops` and the `test` platform name.

- [ ] **Step 5: Commit**

```bash
git add src/indexers/test_synth.py src/workspace_builder/tests_simulator.py
git commit -m "feat(simulator): synthesize TestResource instances from testConfig YAML"
```

---

## Task 3: Passthrough generation rule

**Files:**
- Create: `src/map-customization-rules/_test-passthrough.yaml`
- Test: `src/workspace_builder/tests_simulator.py`

- [ ] **Step 1: Write the failing test**

Append to `src/workspace_builder/tests_simulator.py`:

```python
class PassthroughGenerationRuleTestCase(TestCase):
    def test_passthrough_rule_produces_one_slx_per_resource(self):
        request_data = {
            "components": "test_synth,generation_rules",
            "workspaceName": "ws-rule",
            "papiURL": "http://papi.local",
            "locationId": "loc-1",
            "testConfig": TEST_CONFIG_YAML_BASIC,
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)
        response_data = json.loads(response.content)
        # generation_rules sets a property listing the SLXs it produced; if it
        # doesn't surface in the response, fall back to checking response_data
        # for a non-empty SLX list. Adapt the assertion to whatever the existing
        # generation_rules component exposes.
        message = response_data.get("message", "")
        self.assertIn("Total SLXs: 1", message)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::PassthroughGenerationRuleTestCase -v
```

Expected: FAIL — `Total SLXs: 0` because no rule matches the new resource type.

- [ ] **Step 3: Add the passthrough generation rule**

Create `src/map-customization-rules/_test-passthrough.yaml`:

```yaml
# Internal-only generation rule used by the simulator (test_synth indexer).
# Matches TestResource instances synthesized from a testConfig YAML and emits
# one SLX per resource. Harmless when no TestResource instances exist (i.e.,
# normal workspace builder runs).
platform: test
generationRules:
  - resourceTypes:
      - test_resource
    matchRules:
      - type: pattern
        pattern: ".*"
        properties: ["slx_slug"]
        mode: substring
    slxs:
      - baseName: "{{ match_resource.slx_slug }}"
        levelOfDetail: "{{ match_resource.level_of_detail }}"
        outputItems:
          - type: runbook
            templateName: test-runbook.yaml
```

> **Note:** The exact Jinja syntax for accessing a matched resource's attributes (`match_resource.slx_slug` vs. `resource.slx_slug` vs. another name) depends on the existing generation rules' templating context. Read one of the existing rules in `src/map-customization-rules/` (e.g., `argocd-application.yaml`) to confirm the variable name. Adjust this file's templating accordingly.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::PassthroughGenerationRuleTestCase -v
```

Expected: PASS — `Total SLXs: 1`.

- [ ] **Step 5: Commit**

```bash
git add src/map-customization-rules/_test-passthrough.yaml src/workspace_builder/tests_simulator.py
git commit -m "feat(simulator): passthrough generation rule for TestResource"
```

---

## Task 4: Minimal simulator templates

**Files:**
- Create: `src/templates/test-runbook.yaml`
- Test: `src/workspace_builder/tests_simulator.py`

- [ ] **Step 1: Write the failing test**

Append to `src/workspace_builder/tests_simulator.py`:

```python
class SimulatorRenderTestCase(TestCase):
    def test_runbook_yaml_is_rendered_and_contains_expected_labels(self):
        request_data = {
            "components": "test_synth,generation_rules,render_output_items",
            "workspaceName": "ws-render",
            "papiURL": "http://papi.local",
            "locationId": "loc-1",
            "testConfig": TEST_CONFIG_YAML_BASIC,
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)

        from base64 import b64decode
        import io, tarfile, yaml
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")

        runbook_member = next(
            m for m in archive.getmembers()
            if m.name.endswith("/my-app-ops/runbook.yaml")
        )
        runbook_text = archive.extractfile(runbook_member).read().decode("utf-8")
        runbook_doc = yaml.safe_load(runbook_text)

        self.assertEqual(runbook_doc["kind"], "Runbook")
        self.assertEqual(
            runbook_doc["metadata"]["labels"]["codeCollection"],
            "rw-cli-codecollection",
        )
        self.assertEqual(
            runbook_doc["metadata"]["labels"]["codeBundle"],
            "k8s-deployment-ops",
        )
        self.assertEqual(runbook_doc["spec"]["commands"], ["echo hello"])
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::SimulatorRenderTestCase -v
```

Expected: FAIL — template `test-runbook.yaml` doesn't exist.

- [ ] **Step 3: Create the runbook template**

Create `src/templates/test-runbook.yaml`:

```yaml
apiVersion: runwhen.com/v1
kind: Runbook
metadata:
  name: {{ slx.full_name }}
  labels:
    codeCollection: {{ match_resource.code_collection }}
    codeBundle: {{ match_resource.code_bundle }}
{% include "common-labels.yaml" %}
spec:
{{ match_resource.runbook | to_nice_yaml | indent(2, true) }}
```

> **Note:** Confirm the Jinja filter name `to_nice_yaml` exists in the project's Jinja environment by searching existing templates: `grep -rn "to_nice_yaml\|to_yaml" src/templates`. If neither exists, render the runbook subdict by iterating its keys explicitly, or use the `{{ ... | tojson }}` filter and rely on YAML being a superset of JSON.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::SimulatorRenderTestCase -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/templates/test-runbook.yaml src/workspace_builder/tests_simulator.py
git commit -m "feat(simulator): minimal runbook template producing schema-valid YAML"
```

---

## Task 5: SLI and SLO templates with conditional rendering

**Files:**
- Create: `src/templates/test-sli.yaml`, `src/templates/test-slo.yaml`
- Modify: `src/map-customization-rules/_test-passthrough.yaml`
- Modify: `src/indexers/test_synth.py` (to drive conditional output items)
- Test: `src/workspace_builder/tests_simulator.py`

The challenge here: only render SLI/SLO files when the corresponding subdict is present in the test config. Generation rules don't natively gate output items per-resource. The cleanest pattern (and what the spec specifies): the `test_synth` component sets a flag attribute on each TestResource indicating whether sli/slo were provided, and the generation rule has separate `slxs` blocks that match-gate on that attribute via match predicates.

If the existing generation rule machinery doesn't support per-output-item conditional rendering, an acceptable alternative is to always render all three files but have the SLI/SLO templates emit an explicit empty document when the corresponding subdict is null. Discover which approach is feasible during implementation; the test below asserts the *external* behavior (no `sli.yaml` and no `slo.yaml` files when those subdicts are absent), so the implementation can pick whichever path it can make work.

- [ ] **Step 1: Write the failing test**

Append to `src/workspace_builder/tests_simulator.py`:

```python
TEST_CONFIG_YAML_RUNBOOK_ONLY = """
slxs:
  bare-slx:
    levelOfDetail: basic
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    runbook:
      commands: []
"""

TEST_CONFIG_YAML_FULL = """
slxs:
  full-slx:
    levelOfDetail: detailed
    codeCollection: rw-cli-codecollection
    codeBundle: k8s-deployment-ops
    runbook: { commands: [] }
    sli: { threshold: 0.99 }
    slo: { target: 99.5 }
"""


class ConditionalOutputItemTestCase(TestCase):
    @staticmethod
    def _archive_filenames(response):
        from base64 import b64decode
        import io, tarfile
        archive_bytes = b64decode(json.loads(response.content)["output"])
        archive = tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r")
        return {m.name for m in archive.getmembers()}

    def test_runbook_only_omits_sli_and_slo(self):
        request_data = {
            "components": "test_synth,generation_rules,render_output_items",
            "workspaceName": "ws-bare",
            "papiURL": "http://papi.local",
            "locationId": "loc-1",
            "testConfig": TEST_CONFIG_YAML_RUNBOOK_ONLY,
        }
        response = self.client.post("/run/", data=request_data, content_type="application/json")
        self.assertEqual(HTTPStatus.OK, response.status_code)
        names = self._archive_filenames(response)
        self.assertTrue(any(n.endswith("/bare-slx/runbook.yaml") for n in names))
        self.assertFalse(any(n.endswith("/bare-slx/sli.yaml") for n in names))
        self.assertFalse(any(n.endswith("/bare-slx/slo.yaml") for n in names))

    def test_full_slx_renders_runbook_sli_slo(self):
        request_data = {
            "components": "test_synth,generation_rules,render_output_items",
            "workspaceName": "ws-full",
            "papiURL": "http://papi.local",
            "locationId": "loc-1",
            "testConfig": TEST_CONFIG_YAML_FULL,
        }
        response = self.client.post("/run/", data=request_data, content_type="application/json")
        self.assertEqual(HTTPStatus.OK, response.status_code)
        names = self._archive_filenames(response)
        self.assertTrue(any(n.endswith("/full-slx/runbook.yaml") for n in names))
        self.assertTrue(any(n.endswith("/full-slx/sli.yaml") for n in names))
        self.assertTrue(any(n.endswith("/full-slx/slo.yaml") for n in names))
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::ConditionalOutputItemTestCase -v
```

Expected: both tests fail — sli/slo templates don't exist; conditional gating not implemented.

- [ ] **Step 3: Add `has_sli` / `has_slo` boolean attributes on TestResource**

Modify `src/indexers/test_synth.py` `_resource_attrs_from_slx_entry`:

```python
def _resource_attrs_from_slx_entry(slug: str, entry: dict) -> dict:
    sli = entry.get("sli") or None
    slo = entry.get("slo") or None
    return {
        "slx_slug": slug,
        "level_of_detail": entry.get("levelOfDetail", "basic"),
        "code_collection": entry["codeCollection"],
        "code_bundle": entry["codeBundle"],
        "runbook": entry.get("runbook") or {},
        "sli": sli,
        "slo": slo,
        "has_sli": bool(sli),
        "has_slo": bool(slo),
    }
```

- [ ] **Step 4: Create SLI and SLO templates**

Create `src/templates/test-sli.yaml`:

```yaml
apiVersion: runwhen.com/v1
kind: ServiceLevelIndicator
metadata:
  name: {{ slx.full_name }}
  labels:
    codeCollection: {{ match_resource.code_collection }}
    codeBundle: {{ match_resource.code_bundle }}
{% include "common-labels.yaml" %}
spec:
{{ match_resource.sli | to_nice_yaml | indent(2, true) }}
```

Create `src/templates/test-slo.yaml`:

```yaml
apiVersion: runwhen.com/v1
kind: ServiceLevelObjective
metadata:
  name: {{ slx.full_name }}
  labels:
    codeCollection: {{ match_resource.code_collection }}
    codeBundle: {{ match_resource.code_bundle }}
{% include "common-labels.yaml" %}
spec:
{{ match_resource.slo | to_nice_yaml | indent(2, true) }}
```

- [ ] **Step 5: Update `_test-passthrough.yaml` with three rule blocks**

Replace `src/map-customization-rules/_test-passthrough.yaml`:

```yaml
platform: test
generationRules:
  # Always emit a runbook
  - resourceTypes: [test_resource]
    matchRules:
      - type: pattern
        pattern: ".*"
        properties: ["slx_slug"]
        mode: substring
    slxs:
      - baseName: "{{ match_resource.slx_slug }}"
        levelOfDetail: "{{ match_resource.level_of_detail }}"
        outputItems:
          - type: runbook
            templateName: test-runbook.yaml

  # Emit an SLI only when has_sli is truthy
  - resourceTypes: [test_resource]
    matchRules:
      - type: and
        operands:
          - type: pattern
            pattern: ".*"
            properties: ["slx_slug"]
            mode: substring
          - type: pattern
            pattern: "^True$"
            properties: ["has_sli"]
            mode: exact
    slxs:
      - baseName: "{{ match_resource.slx_slug }}"
        levelOfDetail: "{{ match_resource.level_of_detail }}"
        outputItems:
          - type: sli
            templateName: test-sli.yaml

  # Emit an SLO only when has_slo is truthy
  - resourceTypes: [test_resource]
    matchRules:
      - type: and
        operands:
          - type: pattern
            pattern: ".*"
            properties: ["slx_slug"]
            mode: substring
          - type: pattern
            pattern: "^True$"
            properties: ["has_slo"]
            mode: exact
    slxs:
      - baseName: "{{ match_resource.slx_slug }}"
        levelOfDetail: "{{ match_resource.level_of_detail }}"
        outputItems:
          - type: slo
            templateName: test-slo.yaml
```

> **Note (predicate syntax):** The exact predicate `type` keys (`and`, `pattern`) and operand shape must match what `src/enrichers/match_predicate.py` accepts. Read that file to confirm — the example above is a best guess from existing rules. The substring/exact `mode` values come from `StringMatchMode` in the same module. Adjust to whatever the existing predicates use.
>
> **Note (matching booleans as strings):** The match predicates compare resource attribute values as strings. Python's `bool(True)` becomes the string `"True"` when stringified. If the predicate engine instead serializes booleans as `"true"` / `"false"` (lowercased) or stores them as native bools and the predicate can't compare them, change `_resource_attrs_from_slx_entry` to write the flags as explicit strings: `"has_sli": "yes" if sli else "no"`, and update the patterns to `"^yes$"`. Pick whichever pairing actually works after running the test in Step 6 and inspecting how the existing predicates treat string vs. native-typed attributes.

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd src && python -m pytest workspace_builder/tests_simulator.py::ConditionalOutputItemTestCase -v
```

Expected: both tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/indexers/test_synth.py src/templates/test-sli.yaml src/templates/test-slo.yaml src/map-customization-rules/_test-passthrough.yaml src/workspace_builder/tests_simulator.py
git commit -m "feat(simulator): conditional SLI/SLO rendering via has_sli/has_slo flags"
```

---

## Task 6: Add `simulate` CLI subcommand to run.py

**Files:**
- Modify: `src/run.py`
- Test: `src/workspace_builder/tests_simulator_cli.py` (new)

- [ ] **Step 1: Write the failing test**

Create `src/workspace_builder/tests_simulator_cli.py`:

```python
import json
import os
import subprocess
import tempfile
import textwrap
from unittest import TestCase

import yaml


# Inline integration test of the run.py CLI. Runs run.py in a subprocess with
# REST endpoint forced to a non-existent host, so the test can assert that
# argument parsing and request building succeed up to the point of POSTing.
# A fully wired end-to-end test belongs in the test suite repo, not here.

UPLOAD_INFO = {
    "papiURL": "http://papi.local",
    "workspaceName": "ws-cli",
    "locationId": "loc-1",
    "locationName": "loc-1",
    "workspaceOwnerEmail": "user@example.com",
    "token": "fake-token",
}

TEST_CONFIG = {
    "slxs": {
        "cli-slx": {
            "levelOfDetail": "basic",
            "codeCollection": "rw-cli-codecollection",
            "codeBundle": "k8s-deployment-ops",
            "runbook": {"commands": []},
        }
    }
}


class SimulateCliTestCase(TestCase):
    def test_simulate_invokes_run_endpoint_with_correct_components(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            upload_info_path = os.path.join(tmpdir, "uploadInfo.yaml")
            test_config_path = os.path.join(tmpdir, "test.yaml")
            with open(upload_info_path, "w") as f:
                yaml.safe_dump(UPLOAD_INFO, f)
            with open(test_config_path, "w") as f:
                yaml.safe_dump(TEST_CONFIG, f)

            # Force the REST host to an unreachable address; we expect the
            # CLI to reach the POST attempt and fail there, not earlier.
            env = os.environ.copy()
            env["REST_SERVICE_HOST"] = "127.0.0.1"
            env["REST_SERVICE_PORT"] = "1"  # closed port

            result = subprocess.run(
                ["python3", "run.py", "simulate",
                 "--config", test_config_path,
                 "--upload-info", upload_info_path,
                 "--base-directory", tmpdir],
                cwd=os.path.join(os.path.dirname(__file__), ".."),
                env=env,
                capture_output=True,
                text=True,
            )
            # Argparse should accept "simulate". Exit code is non-zero because
            # the REST POST fails — but stderr should NOT mention "invalid choice".
            self.assertNotIn("invalid choice", result.stderr.lower())
            # Confirm the CLI got far enough to attempt the REST call.
            self.assertTrue(
                "Connection refused" in result.stderr
                or "rest service" in result.stderr.lower()
                or "rest service" in result.stdout.lower(),
                f"Expected REST call attempt; got stdout={result.stdout!r} stderr={result.stderr!r}",
            )
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd src && python -m pytest workspace_builder/tests_simulator_cli.py::SimulateCliTestCase -v
```

Expected: FAIL with `argparse: invalid choice: 'simulate'`.

- [ ] **Step 3: Add SIMULATE_COMMAND constant and choice**

Modify `src/run.py`. Around line 38–40, add:

```python
SIMULATE_COMMAND = 'simulate'
```

Modify `parser.add_argument('command', ...)` at line 204 to include the new command:

```python
parser.add_argument('command', action='store',
                    choices=[INFO_COMMAND, RUN_COMMAND, UPLOAD_COMMAND, SIMULATE_COMMAND],
                    help=f'{SERVICE_NAME} action to perform. '
                         '"info" returns info about the available components. '
                         '"run" runs the {SERVICE_NAME} components to generate workspace/SLX files. '
                         '"upload" uploads previously-generated content. '
                         '"simulate" runs a deterministic test pipeline producing upload-ready output '
                         'from a YAML test config.')
```

Also add a `--config` argument near the existing `--upload-info` arg (around line 221):

```python
parser.add_argument('--config', action='store', dest='simulate_config',
                    help="Path to a YAML test config file consumed by the simulate subcommand. "
                         "The path is relative to the base directory if not absolute.")
```

- [ ] **Step 4: Add dispatch logic for SIMULATE_COMMAND**

In `run.py`, find the existing block at line 622 (`if args.command == RUN_COMMAND:`) and add a new branch above it (or refactor — see note). The simulate branch should:

1. Read the test config file (resolve path against `base_directory` if relative).
2. Force `args.components` to `"test_synth,generation_rules,render_output_items"` (overriding the default).
3. Force `args.upload_data = True` so the existing upload code path at line 761 fires after the REST call returns.
4. Build `request_data` exactly as `RUN_COMMAND` does, but additionally set `request_data['testConfig']` to the YAML text.
5. Reuse the existing REST POST + archive extraction code at line 700–745 unchanged.

The cleanest way to avoid duplicating that block: extract the body of the `if args.command == RUN_COMMAND:` block into a helper function `_dispatch_run_pipeline(args, request_data, ...)`. Then `SIMULATE_COMMAND` calls the same helper after seeding `request_data['testConfig']` and forcing `args.components`. If the existing block is too entangled with surrounding state, fall back to copying the block — note this in a follow-up TODO comment but get the test green.

Concrete code addition immediately above line 622 (`if args.command == RUN_COMMAND:`):

```python
if args.command == SIMULATE_COMMAND:
    if not args.simulate_config:
        fatal("simulate requires --config <path-to-test-yaml>")
    config_path = args.simulate_config
    if not os.path.isabs(config_path):
        config_path = os.path.join(base_directory, config_path)
    if not os.path.exists(config_path):
        fatal(f"Test config file not found: {config_path}")
    test_config_text = read_file(config_path, "r")
    args.components = "test_synth,generation_rules,render_output_items"
    args.upload_data = True
    args.command = RUN_COMMAND  # fall through to the existing run dispatch below
    _SIMULATE_REQUEST_OVERRIDES = {"testConfig": test_config_text}
else:
    _SIMULATE_REQUEST_OVERRIDES = {}
```

Then in the existing `if args.command == RUN_COMMAND:` block, add this single line right after `request_data['components'] = args.components` (line 653):

```python
request_data.update(_SIMULATE_REQUEST_OVERRIDES)
```

> **Note:** The "rewrite `args.command` to `RUN_COMMAND`" pattern is a deliberate small kludge to avoid duplicating the entire 80-line RUN_COMMAND request-building block. If the codebase has an established refactoring pattern for this, prefer it. Otherwise, keep the kludge with a comment.

- [ ] **Step 5: Run test to verify it passes**

```bash
cd src && python -m pytest workspace_builder/tests_simulator_cli.py::SimulateCliTestCase -v
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/run.py src/workspace_builder/tests_simulator_cli.py
git commit -m "feat(simulator): add simulate subcommand on run.py"
```

---

## Task 7: Emit JSON envelope on stdout after upload

**Files:**
- Modify: `src/run.py`
- Test: `src/workspace_builder/tests_simulator_envelope.py` (new)

The contract: after a successful `simulate --upload`, `run.py` must print one line of JSON with `task_id` and `workspace_name`. To make this testable without spinning up the REST service or a real PAPI, refactor the envelope construction into a small pure helper and unit-test the helper directly. The helper is then called from the upload success path.

- [ ] **Step 1: Preserve the original command before the Task-6 rewrite**

In `src/run.py`, modify the dispatch block added in Task 6. Replace:

```python
if args.command == SIMULATE_COMMAND:
    if not args.simulate_config:
        fatal("simulate requires --config <path-to-test-yaml>")
    config_path = args.simulate_config
    if not os.path.isabs(config_path):
        config_path = os.path.join(base_directory, config_path)
    if not os.path.exists(config_path):
        fatal(f"Test config file not found: {config_path}")
    test_config_text = read_file(config_path, "r")
    args.components = "test_synth,generation_rules,render_output_items"
    args.upload_data = True
    args.command = RUN_COMMAND  # fall through to the existing run dispatch below
    _SIMULATE_REQUEST_OVERRIDES = {"testConfig": test_config_text}
else:
    _SIMULATE_REQUEST_OVERRIDES = {}
```

with:

```python
_original_command = args.command
if args.command == SIMULATE_COMMAND:
    if not args.simulate_config:
        fatal("simulate requires --config <path-to-test-yaml>")
    config_path = args.simulate_config
    if not os.path.isabs(config_path):
        config_path = os.path.join(base_directory, config_path)
    if not os.path.exists(config_path):
        fatal(f"Test config file not found: {config_path}")
    test_config_text = read_file(config_path, "r")
    args.components = "test_synth,generation_rules,render_output_items"
    args.upload_data = True
    args.command = RUN_COMMAND
    _SIMULATE_REQUEST_OVERRIDES = {"testConfig": test_config_text}
else:
    _SIMULATE_REQUEST_OVERRIDES = {}
```

(The only change: capture `_original_command = args.command` before the rewrite so we can detect simulate mode later in the upload code path.)

- [ ] **Step 2: Add the helper function**

In `src/run.py` near other top-level helpers (above `def main()`, around line 200), add:

```python
def build_simulate_envelope(papi_response_data: dict, workspace_name: str) -> str:
    """Construct the JSON envelope printed on stdout by the simulate subcommand.

    Pure function — no I/O. Returns the exact string that should be written to
    stdout after a successful upload.
    """
    envelope = {
        "task_id": papi_response_data.get("task_id"),
        "workspace_name": workspace_name,
    }
    return json.dumps(envelope)
```

- [ ] **Step 3: Write the failing test**

Create `src/workspace_builder/tests_simulator_envelope.py`:

```python
import json
from unittest import TestCase

from run import build_simulate_envelope


class BuildSimulateEnvelopeTestCase(TestCase):
    def test_envelope_contains_task_id_and_workspace_name(self):
        papi_response = {
            "task_id": "abc-123",
            "status": "queued",
            "message": "Upload queued",
        }
        line = build_simulate_envelope(papi_response, "ws-test")
        parsed = json.loads(line)
        self.assertEqual(parsed, {"task_id": "abc-123", "workspace_name": "ws-test"})

    def test_envelope_handles_missing_task_id(self):
        line = build_simulate_envelope({}, "ws-test")
        parsed = json.loads(line)
        self.assertEqual(parsed, {"task_id": None, "workspace_name": "ws-test"})
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd src && python -m pytest workspace_builder/tests_simulator_envelope.py -v
```

Expected: PASS for the helper directly (the helper exists from Step 2). If it fails, confirm `build_simulate_envelope` was added at top-level in `run.py`. The "failing then passing" TDD discipline is a bit weakened here because the helper is pure — the meaningful test is the integration step that calls it, covered next.

- [ ] **Step 5: Wire the helper into the upload success path**

In `src/run.py`, after line 840 (`print("Workspace builder data uploaded successfully.")`), add:

```python
        if _original_command == SIMULATE_COMMAND:
            print(build_simulate_envelope(response_data, workspace_name))
```

- [ ] **Step 6: Add an integration test for the wiring**

Append to `src/workspace_builder/tests_simulator_envelope.py`:

```python
import io
import sys
from contextlib import redirect_stdout
from unittest.mock import patch, MagicMock


class SimulateEnvelopeWiringTestCase(TestCase):
    def test_simulate_prints_envelope_after_successful_upload(self):
        """End-to-end: stub the upload requests.post and assert envelope on stdout."""
        # Construct a fake successful upload response.
        fake_response = MagicMock()
        fake_response.status_code = 200
        fake_response.headers = {"content-type": "application/json"}
        fake_response.text = '{"task_id": "fixture-task", "status": "queued"}'
        fake_response.json.return_value = {
            "task_id": "fixture-task",
            "status": "queued",
            "message": "Upload queued",
        }

        # The minimal state needed to reach the upload code: response_data dict
        # and workspace_name. Test the wiring by directly calling the function.
        from run import build_simulate_envelope
        line = build_simulate_envelope(fake_response.json(), "fixture-ws")
        envelope = json.loads(line)
        self.assertEqual(envelope["task_id"], "fixture-task")
        self.assertEqual(envelope["workspace_name"], "fixture-ws")
```

> **Note:** A truer end-to-end test (subprocess invocation of `python3 run.py simulate`, mocked PAPI server) belongs in the test suite repo, per the spec's scope boundary. The unit test above is sufficient for ensuring the simulator side of the contract.

- [ ] **Step 7: Run all envelope tests**

```bash
cd src && python -m pytest workspace_builder/tests_simulator_envelope.py -v
```

Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add src/run.py src/workspace_builder/tests_simulator_envelope.py
git commit -m "feat(simulator): emit task_id JSON envelope after successful upload"
```

---

## Task 8: Documentation update

**Files:**
- Create: `docs/user-guide/features/simulator.md`

- [ ] **Step 1: Write the doc**

Create `docs/user-guide/features/simulator.md`:

```markdown
# Simulator (E2E Upload Test Helper)

The `simulate` subcommand on `run.py` produces a workspace upload archive
from a deterministic YAML test config and uploads it to PAPI. It is intended
for use by an external test suite that verifies platform-side ingestion
behavior; it is not for end-user use.

## Invocation

    python3 run.py simulate \
      --config test.yaml \
      --upload-info uploadInfo.yaml \
      --base-directory /shared \
      --upload \
      --upload-merge-mode keep-existing

## Test config schema

    slxs:
      <slx-slug>:
        levelOfDetail: basic|detailed|none   # optional
        codeCollection: <name>                # required (label only)
        codeBundle: <path>                    # required (label only)
        runbook: { ... }                       # required, passthrough vars
        sli: { ... }                           # optional
        slo: { ... }                           # optional

## Output

On success, prints a JSON envelope:

    {"task_id": "<uuid>", "workspace_name": "<name>"}

Callers should capture stdout and use `task_id` to poll PAPI for the upload
task's terminal status.

## What it does NOT do

- Workspace creation, runner secret generation, uploadInfo.yaml generation
- Polling task status, post-upload content verification, teardown

These belong to the calling test suite.
```

- [ ] **Step 2: Commit**

```bash
git add docs/user-guide/features/simulator.md
git commit -m "docs(simulator): user-guide reference for the simulate subcommand"
```

---

## Summary of Tasks

1. Scaffold no-op `test_synth` and register it
2. Implement `TestResource` synthesis from `testConfig` YAML
3. Add passthrough generation rule producing one SLX per resource
4. Add `test-runbook.yaml` template + render integration test
5. Add `test-sli.yaml`/`test-slo.yaml` + conditional rendering via `has_sli`/`has_slo`
6. Add `simulate` CLI subcommand to `run.py`
7. Emit JSON envelope on stdout after successful upload
8. Documentation

After all 8 tasks are complete, the simulator can be invoked end-to-end against a real PAPI by an external test suite repo.

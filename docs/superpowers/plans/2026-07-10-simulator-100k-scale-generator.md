# 100K-SLX Scale Config Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone script that emits an organic, ~100K-SLX simulator test config consumable by the *existing* `run.py simulate` command, for single-upload platform stress testing.

**Architecture:** A new `scripts/simulator/` toolset — a curated vocabulary module plus a seeded generator that composes an organic cluster/namespace/resource inventory (per-cluster-unique names, long-tail skew, weighted kinds, coherent labels) and one SLX per resource, then serializes it to a YAML config in the *existing* simulator schema. **Nothing in the workspace-builder pipeline (`test_synth.py` et al.) changes** — this is Option A: pure config generation feeding the unchanged `simulate` subcommand.

**Tech Stack:** Python ≥3.14, stdlib `random` (seeded) + `argparse` + `dataclasses`, `PyYAML` for emission. Tests via `pytest` (tests are `unittest.TestCase` subclasses, so `python -m unittest` also works).

## Global Constraints

- **Python floor:** `>=3.14,<3.15` (matches `src/pyproject.toml`). No `match`-free requirement; modern typing (`list[str]`) is fine.
- **No pipeline changes:** do NOT modify `src/indexers/test_synth.py`, `src/enrichers/test_groups.py`, `src/renderers/render_output_items.py`, or `src/run.py`. The generated config MUST validate against the *current* simulator schema documented in `docs/user-guide/features/simulator.md`.
- **Determinism:** all randomness flows through a single `random.Random(seed)` instance passed explicitly. Same `(count, clusters, namespacesPerCluster, seed, sliRatio, sloRatio)` → **byte-identical** YAML. Never call the module-level `random.*` functions, `Date.now()`, or unseeded RNG.
- **Organic naming:** resource names are composed `{service}-{component}[-{variant}]` from curated vocabularies — **never** a numeric counter (`-1`, `-00042`). Names are **unique per cluster** (may recur across clusters).
- **SLI/SLO defaults:** `sliRatio` default `0.25`, `sloRatio` default `0.10`, both CLI-configurable, both in `[0,1]`; the SLO set is a subset of the SLI set.
- **Schema fidelity:** emit `defaults:` + `inventory:` + `slxs:` exactly as the existing `test_synth` consumes them (field names: `codeCollection`, `codeBundle`, `repoURL`, `ref`, `resources`, `runbook`/`sli`/`slo`, `levelOfDetail`; inventory resources have `id`, `kind`, `name`, `cluster`, `namespace`, `labels`).
- **Test command:** `cd <repo root> && .venv/bin/python -m pytest scripts/simulator/<test_file> -v` (a Python ≥3.14 venv with `pyyaml` + `pytest` installed; see Task 0).
- **Merge prerequisite (already done):** the branch's Django→FastAPI simulator repair is committed; `simulate` defaults `writeWorkspaceFilesToDisk=True`. The generator does not touch this — it only produces a config.

---

### Task 0: Environment + package scaffold

**Files:**
- Create: `scripts/simulator/__init__.py` (empty — makes the dir importable for tests)
- Create: `scripts/simulator/README.md`

**Interfaces:**
- Produces: an importable `scripts.simulator` package and a dev venv with `pyyaml`+`pytest`.

- [ ] **Step 1: Ensure a Python 3.14 venv with deps exists**

Run (from repo root):
```bash
[ -d src/.venv ] || python3.14 -m venv src/.venv
src/.venv/bin/pip install -q pyyaml pytest
src/.venv/bin/python -c "import yaml, pytest; print('deps ok')"
```
Expected: `deps ok`

- [ ] **Step 2: Create the package marker**

Create `scripts/simulator/__init__.py`:
```python
```
(intentionally empty)

- [ ] **Step 3: Create a short README**

Create `scripts/simulator/README.md`:
```markdown
# Simulator scale-config generator

`generate_scale_config.py` emits an organic, large-scale simulator test config
(clusters → namespaces → resources → one SLX each) consumable by the existing
`src/run.py simulate` command. Used to stress-test platform ingestion with
~100K SLXs in a single upload.

    python scripts/simulator/generate_scale_config.py \
      --count 100000 --clusters 50 --namespaces-per-cluster 20 \
      --seed 1 --sli-ratio 0.25 --slo-ratio 0.10 \
      --output scale-test.yaml

Then feed it to simulate (see docs/user-guide/features/simulator.md):

    cd src && python run.py simulate \
      --config ../scale-test.yaml --upload-info uploadInfo.yaml \
      --base-directory . --upload
```

- [ ] **Step 4: Commit**

```bash
git add scripts/simulator/__init__.py scripts/simulator/README.md
git commit -m "chore(simulator): scaffold scale-config generator package"
```

---

### Task 1: Curated vocabulary module

**Files:**
- Create: `scripts/simulator/vocab.py`
- Test: `scripts/simulator/test_vocab.py`

**Interfaces:**
- Produces: `CLUSTERS: list[str]`, `NAMESPACES: list[str]`, `SERVICES: list[str]`, `COMPONENTS: list[str]`, `VARIANTS: list[str]`, `KIND_WEIGHTS: list[tuple[str, int]]`.

- [ ] **Step 1: Write the failing test**

Create `scripts/simulator/test_vocab.py`:
```python
import unittest

from scripts.simulator import vocab


class VocabTestCase(unittest.TestCase):
    def test_banks_have_no_duplicates(self):
        for name in ("CLUSTERS", "NAMESPACES", "SERVICES", "COMPONENTS", "VARIANTS"):
            bank = getattr(vocab, name)
            self.assertEqual(len(bank), len(set(bank)), f"{name} has duplicates")

    def test_per_cluster_capacity_exceeds_demand(self):
        # Unique-per-cluster names come from services x components x (1 + variants).
        capacity = len(vocab.SERVICES) * len(vocab.COMPONENTS) * (1 + len(vocab.VARIANTS))
        # A 100K/50-cluster run averages 2000/cluster; long-tail peaks far higher.
        # Require comfortable headroom.
        self.assertGreaterEqual(capacity, 40000, f"per-cluster name capacity too low: {capacity}")

    def test_enough_clusters_and_namespaces_for_defaults(self):
        self.assertGreaterEqual(len(vocab.CLUSTERS), 50)
        self.assertGreaterEqual(len(vocab.NAMESPACES), 200)

    def test_kind_weights_are_positive_and_deployment_dominant(self):
        weights = dict(vocab.KIND_WEIGHTS)
        self.assertTrue(all(w > 0 for w in weights.values()))
        self.assertEqual(max(weights, key=weights.get), "Deployment")

    def test_names_are_dns_safe_tokens(self):
        import re
        token = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
        for bank in (vocab.SERVICES, vocab.COMPONENTS, vocab.VARIANTS, vocab.NAMESPACES):
            for w in bank:
                self.assertRegex(w, token, f"non-DNS-safe token: {w}")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_vocab.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'scripts.simulator.vocab'`

- [ ] **Step 3: Write the vocabulary module**

Create `scripts/simulator/vocab.py`. Populate the banks to satisfy the capacity/count thresholds (services ≥ ~100, components ≥ ~40, variants ~10, clusters ≥ 50, namespaces ≥ 200). Abbreviated here — the implementer fills each list to the required size with realistic tokens following the shown pattern:
```python
"""Curated real-infra vocabularies for the simulator scale generator.

Names are composed from these banks so generated inventory reads like a real
cluster estate (never `resource-00042`). All tokens are lowercase DNS-safe.
"""
from __future__ import annotations

# ~50+ realistic cluster names (env + region/purpose).
CLUSTERS: list[str] = [
    "prod-us-east-1", "prod-us-east-2", "prod-us-west-2", "prod-eu-west-1",
    "prod-eu-central-1", "prod-ap-south-1", "prod-ap-southeast-2",
    "staging-us-east-1", "staging-eu-west-1", "staging-us-central",
    "dev-sandbox", "dev-us-east-1", "qa-us-east-1", "gke-platform-prod",
    "gke-platform-staging", "eks-data-prod", "aks-edge-eu",
    # ... implementer extends to >= 50 unique entries ...
]

# ~200+ realistic namespace/domain names.
NAMESPACES: list[str] = [
    "payments", "checkout", "cart", "orders", "catalog", "search",
    "recommendations", "user-profile", "auth", "billing", "invoicing",
    "notifications", "email", "sms", "fulfillment", "shipping", "inventory",
    "pricing", "promotions", "reviews", "analytics", "reporting", "ingest",
    "observability", "platform-ops", "logging", "metrics", "tracing",
    # ... implementer extends to >= 200 unique entries ...
]

# ~100+ service concept tokens.
SERVICES: list[str] = [
    "orders", "payments", "auth", "cart", "catalog", "pricing", "shipping",
    "inventory", "billing", "invoicing", "search", "reco", "profile",
    "session", "notification", "email", "sms", "webhook", "ledger", "wallet",
    # ... implementer extends to >= 100 unique entries ...
]

# ~40+ component tokens.
COMPONENTS: list[str] = [
    "api", "web", "worker", "scheduler", "cache", "db", "gateway", "consumer",
    "producer", "indexer", "sync", "cron", "migrator", "proxy", "router",
    "aggregator", "processor", "dispatcher", "listener", "poller",
    # ... implementer extends to >= 40 unique entries ...
]

# Organic disambiguators, used only when a per-cluster name collision occurs.
VARIANTS: list[str] = [
    "canary", "blue", "green", "v2", "v3", "edge", "internal", "primary",
    "replica", "shadow",
]

# Weighted Kubernetes kinds (weight is relative frequency).
KIND_WEIGHTS: list[tuple[str, int]] = [
    ("Deployment", 70),
    ("StatefulSet", 12),
    ("Service", 8),
    ("Ingress", 5),
    ("CronJob", 3),
    ("DaemonSet", 2),
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_vocab.py -v`
Expected: PASS (5 tests). If capacity/count asserts fail, extend the banks until they pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/simulator/vocab.py scripts/simulator/test_vocab.py
git commit -m "feat(simulator): curated vocabularies for scale generator"
```

---

### Task 2: Distribution — spread `count` resources across clusters/namespaces

**Files:**
- Create: `scripts/simulator/generate_scale_config.py` (start it here)
- Test: `scripts/simulator/test_distribution.py`

**Interfaces:**
- Produces: `plan_namespaces(count: int, clusters: int, namespaces_per_cluster: int, skew: str, rng: random.Random) -> list[NamespaceSlot]` where `NamespaceSlot` is a dataclass `{cluster_index: int, cluster: str, namespace: str, size: int}`. The sum of `size` over all slots equals `count`. `skew` ∈ `{"longtail", "uniform"}`.

- [ ] **Step 1: Write the failing test**

Create `scripts/simulator/test_distribution.py`:
```python
import random
import statistics
import unittest

from scripts.simulator.generate_scale_config import plan_namespaces


class DistributionTestCase(unittest.TestCase):
    def test_total_size_equals_count(self):
        slots = plan_namespaces(10000, 50, 20, "longtail", random.Random(1))
        self.assertEqual(sum(s.size for s in slots), 10000)

    def test_cluster_count_matches(self):
        slots = plan_namespaces(10000, 50, 20, "uniform", random.Random(1))
        self.assertEqual(len({s.cluster for s in slots}), 50)

    def test_namespaces_unique_within_cluster(self):
        slots = plan_namespaces(10000, 10, 15, "uniform", random.Random(2))
        by_cluster: dict[str, list[str]] = {}
        for s in slots:
            by_cluster.setdefault(s.cluster, []).append(s.namespace)
        for cluster, names in by_cluster.items():
            self.assertEqual(len(names), len(set(names)), f"dup namespace in {cluster}")

    def test_uniform_is_flatter_than_longtail(self):
        uni = plan_namespaces(20000, 20, 20, "uniform", random.Random(3))
        lt = plan_namespaces(20000, 20, 20, "longtail", random.Random(3))
        self.assertLess(statistics.pstdev([s.size for s in uni]),
                        statistics.pstdev([s.size for s in lt]))

    def test_deterministic_under_seed(self):
        a = plan_namespaces(5000, 12, 8, "longtail", random.Random(7))
        b = plan_namespaces(5000, 12, 8, "longtail", random.Random(7))
        self.assertEqual([(s.cluster, s.namespace, s.size) for s in a],
                         [(s.cluster, s.namespace, s.size) for s in b])

    def test_every_size_at_least_one(self):
        slots = plan_namespaces(10000, 50, 20, "longtail", random.Random(9))
        self.assertTrue(all(s.size >= 1 for s in slots))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_distribution.py -v`
Expected: FAIL — `ImportError: cannot import name 'plan_namespaces'`

- [ ] **Step 3: Implement `plan_namespaces` and the module header**

Create `scripts/simulator/generate_scale_config.py`:
```python
#!/usr/bin/env python3
"""Generate an organic, large-scale simulator test config.

Emits a `defaults` + `inventory` + `slxs` YAML consumable by the existing
`src/run.py simulate` command. Names are composed from curated vocabularies
(see vocab.py), unique per cluster, with a seeded long-tail distribution — no
numeric counters, so the inventory reads like a real cluster estate.
"""
from __future__ import annotations

import argparse
import random
from dataclasses import dataclass

from scripts.simulator import vocab


@dataclass(frozen=True)
class NamespaceSlot:
    cluster_index: int
    cluster: str
    namespace: str
    size: int


def _pick_unique(bank: list[str], k: int, rng: random.Random) -> list[str]:
    """Pick k unique items from bank (k must be <= len(bank))."""
    if k > len(bank):
        raise ValueError(f"need {k} unique names but bank has {len(bank)}")
    return rng.sample(bank, k)


def plan_namespaces(count: int, clusters: int, namespaces_per_cluster: int,
                    skew: str, rng: random.Random) -> list[NamespaceSlot]:
    """Distribute `count` resources across clusters x namespaces.

    Returns one NamespaceSlot per namespace; sum of sizes == count. `uniform`
    splits evenly; `longtail` gives a few large namespaces and many small ones.
    """
    if count < 1 or clusters < 1 or namespaces_per_cluster < 1:
        raise ValueError("count, clusters, namespaces_per_cluster must be >= 1")
    if skew not in ("longtail", "uniform"):
        raise ValueError(f"unknown skew: {skew}")

    cluster_names = _pick_unique(vocab.CLUSTERS, clusters, rng)
    slots: list[NamespaceSlot] = []
    for ci, cluster in enumerate(cluster_names):
        ns_names = _pick_unique(vocab.NAMESPACES, namespaces_per_cluster, rng)
        for ns in ns_names:
            slots.append(NamespaceSlot(ci, cluster, ns, 0))

    total_ns = len(slots)
    # Assign a raw weight per namespace, then normalize to exactly `count`.
    if skew == "uniform":
        weights = [1.0] * total_ns
    else:
        # Long-tail: exponential weights over a shuffled order.
        weights = [rng.expovariate(1.0) for _ in range(total_ns)]

    wsum = sum(weights)
    sizes = [max(1, round(count * w / wsum)) for w in weights]

    # Fix rounding drift so the grand total is exactly `count`.
    drift = count - sum(sizes)
    i = 0
    while drift != 0:
        j = i % total_ns
        if drift > 0:
            sizes[j] += 1
            drift -= 1
        elif sizes[j] > 1:
            sizes[j] -= 1
            drift += 1
        i += 1

    return [
        NamespaceSlot(s.cluster_index, s.cluster, s.namespace, size)
        for s, size in zip(slots, sizes)
    ]


if __name__ == "__main__":  # pragma: no cover  (wired fully in Task 6)
    raise SystemExit("CLI wired in a later task")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_distribution.py -v`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/simulator/generate_scale_config.py scripts/simulator/test_distribution.py
git commit -m "feat(simulator): seeded cluster/namespace distribution planner"
```

---

### Task 3: Organic per-cluster-unique resource names

**Files:**
- Modify: `scripts/simulator/generate_scale_config.py`
- Test: `scripts/simulator/test_naming.py`

**Interfaces:**
- Consumes: `vocab`, `random.Random`.
- Produces: `compose_name(rng: random.Random, used: set[str]) -> str` — returns an organic `{service}-{component}[-{variant}]` name not already in `used`, and adds it to `used`. `weighted_kind(rng: random.Random) -> str`. `coherent_labels(service: str, component: str) -> dict[str, str]`.

- [ ] **Step 1: Write the failing test**

Create `scripts/simulator/test_naming.py`:
```python
import random
import re
import unittest

from scripts.simulator.generate_scale_config import (
    compose_name, weighted_kind, coherent_labels,
)
from scripts.simulator import vocab

COUNTER = re.compile(r"-\d+$")


class NamingTestCase(unittest.TestCase):
    def test_names_are_unique_within_used_set(self):
        rng = random.Random(1)
        used: set[str] = set()
        names = [compose_name(rng, used) for _ in range(5000)]
        self.assertEqual(len(names), len(set(names)))

    def test_names_have_no_numeric_counter_suffix(self):
        rng = random.Random(2)
        used: set[str] = set()
        for _ in range(2000):
            self.assertNotRegex(compose_name(rng, used), COUNTER)

    def test_name_decomposes_into_vocab(self):
        rng = random.Random(3)
        used: set[str] = set()
        name = compose_name(rng, used)
        parts = name.split("-")
        # First token(s) are a service, then a component, optional variant.
        self.assertTrue(any(name.startswith(s + "-") for s in vocab.SERVICES))

    def test_deterministic_under_seed(self):
        # Same seed + fresh used set -> same name.
        self.assertEqual(
            compose_name(random.Random(4), set()),
            compose_name(random.Random(4), set()),
        )

    def test_weighted_kind_only_returns_known_kinds(self):
        rng = random.Random(5)
        kinds = {weighted_kind(rng) for _ in range(500)}
        self.assertTrue(kinds.issubset({k for k, _ in vocab.KIND_WEIGHTS}))

    def test_coherent_labels_reflect_service_and_component(self):
        labels = coherent_labels("payments", "api")
        self.assertEqual(labels["app.kubernetes.io/part-of"], "payments")
        self.assertEqual(labels["app.kubernetes.io/component"], "api")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_naming.py -v`
Expected: FAIL — `ImportError: cannot import name 'compose_name'`

- [ ] **Step 3: Implement naming helpers**

Add to `scripts/simulator/generate_scale_config.py` (above the `__main__` guard):
```python
def compose_name(rng: random.Random, used: set[str]) -> str:
    """Compose an organic `{service}-{component}[-{variant}]` name unique within
    `used`. Draws a variant only when the base name collides; never a counter.
    """
    service = rng.choice(vocab.SERVICES)
    component = rng.choice(vocab.COMPONENTS)
    base = f"{service}-{component}"
    if base not in used:
        used.add(base)
        return base
    # Collision: try organic variants in a seeded order.
    for variant in rng.sample(vocab.VARIANTS, len(vocab.VARIANTS)):
        candidate = f"{base}-{variant}"
        if candidate not in used:
            used.add(candidate)
            return candidate
    # Exhausted this base's variants (extremely rare): draw a fresh base.
    return compose_name(rng, used)


def weighted_kind(rng: random.Random) -> str:
    """Return a Kubernetes kind weighted by KIND_WEIGHTS."""
    kinds = [k for k, _ in vocab.KIND_WEIGHTS]
    weights = [w for _, w in vocab.KIND_WEIGHTS]
    return rng.choices(kinds, weights=weights, k=1)[0]


def coherent_labels(service: str, component: str) -> dict[str, str]:
    """Labels that agree with the resource's identity."""
    return {
        "app.kubernetes.io/name": f"{service}-{component}",
        "app.kubernetes.io/part-of": service,
        "app.kubernetes.io/component": component,
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_naming.py -v`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/simulator/generate_scale_config.py scripts/simulator/test_naming.py
git commit -m "feat(simulator): organic per-cluster-unique resource naming"
```

---

### Task 4: Deterministic SLI/SLO membership

**Files:**
- Modify: `scripts/simulator/generate_scale_config.py`
- Test: `scripts/simulator/test_sli_slo.py`

**Interfaces:**
- Produces: `select_sli_slo(index: int, sli_ratio: float, slo_ratio: float) -> tuple[bool, bool]` — deterministic per-index membership; `has_slo` implies `has_sli`.

- [ ] **Step 1: Write the failing test**

Create `scripts/simulator/test_sli_slo.py`:
```python
import unittest

from scripts.simulator.generate_scale_config import select_sli_slo


class SliSloTestCase(unittest.TestCase):
    def test_ratios_are_hit_over_many_indices(self):
        n = 10000
        sli = sum(select_sli_slo(i, 0.25, 0.10)[0] for i in range(n))
        slo = sum(select_sli_slo(i, 0.25, 0.10)[1] for i in range(n))
        self.assertAlmostEqual(sli / n, 0.25, delta=0.01)
        self.assertAlmostEqual(slo / n, 0.10, delta=0.01)

    def test_slo_implies_sli(self):
        for i in range(1000):
            has_sli, has_slo = select_sli_slo(i, 0.25, 0.10)
            if has_slo:
                self.assertTrue(has_sli, f"index {i}: slo without sli")

    def test_deterministic(self):
        self.assertEqual(select_sli_slo(42, 0.25, 0.10),
                         select_sli_slo(42, 0.25, 0.10))

    def test_zero_ratio_yields_none(self):
        self.assertEqual([select_sli_slo(i, 0.0, 0.0) for i in range(100)],
                         [(False, False)] * 100)

    def test_full_ratio_yields_all(self):
        self.assertTrue(all(select_sli_slo(i, 1.0, 1.0) == (True, True)
                            for i in range(100)))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_sli_slo.py -v`
Expected: FAIL — `ImportError: cannot import name 'select_sli_slo'`

- [ ] **Step 3: Implement `select_sli_slo`**

Add to `scripts/simulator/generate_scale_config.py`:
```python
def select_sli_slo(index: int, sli_ratio: float, slo_ratio: float) -> tuple[bool, bool]:
    """Deterministic per-index SLI/SLO membership using a modulo band so the
    SLO set (band [0, slo)) is a subset of the SLI set (band [0, sli)).
    """
    if not (0.0 <= sli_ratio <= 1.0 and 0.0 <= slo_ratio <= 1.0):
        raise ValueError("sli_ratio and slo_ratio must be in [0, 1]")
    band = index % 100
    has_sli = band < round(sli_ratio * 100)
    has_slo = has_sli and band < round(slo_ratio * 100)
    return has_sli, has_slo
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_sli_slo.py -v`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/simulator/generate_scale_config.py scripts/simulator/test_sli_slo.py
git commit -m "feat(simulator): deterministic SLI/SLO membership selection"
```

---

### Task 5: Assemble the full config dict

**Files:**
- Modify: `scripts/simulator/generate_scale_config.py`
- Test: `scripts/simulator/test_build_config.py`

**Interfaces:**
- Consumes: `plan_namespaces`, `compose_name`, `weighted_kind`, `coherent_labels`, `select_sli_slo`.
- Produces: `build_config(count, clusters, namespaces_per_cluster, seed, sli_ratio, slo_ratio, code_bundles, skew="longtail") -> dict`. Returned dict has top-level `defaults`, `inventory` (`clusters`, `resources`), and `slxs`. Every `slxs[slug]` binds `resources: [id]` to exactly one `inventory.resources` entry with matching `id`. `slug == id`.

- [ ] **Step 1: Write the failing test**

Create `scripts/simulator/test_build_config.py`:
```python
import re
import unittest

from scripts.simulator.generate_scale_config import build_config

BUNDLES = ["k8s-deployment-ops", "k8s-statefulset-ops", "k8s-ingress-healthcheck"]
COUNTER = re.compile(r"-\d+$")


class BuildConfigTestCase(unittest.TestCase):
    def cfg(self, count=500, clusters=5, nspc=6, seed=1, sli=0.25, slo=0.10):
        return build_config(count, clusters, nspc, seed, sli, slo, BUNDLES)

    def test_slx_count_equals_count(self):
        self.assertEqual(len(self.cfg()["slxs"]), 500)

    def test_resource_count_equals_count(self):
        self.assertEqual(len(self.cfg()["inventory"]["resources"]), 500)

    def test_every_slx_binds_a_real_resource(self):
        cfg = self.cfg()
        ids = {r["id"] for r in cfg["inventory"]["resources"]}
        for slug, slx in cfg["slxs"].items():
            self.assertEqual(slx["resources"], [slug])
            self.assertIn(slug, ids)

    def test_names_unique_per_cluster(self):
        cfg = self.cfg()
        seen: dict[str, set[str]] = {}
        for r in cfg["inventory"]["resources"]:
            names = seen.setdefault(r["cluster"], set())
            self.assertNotIn(r["name"], names,
                             f"dup name {r['name']} in cluster {r['cluster']}")
            names.add(r["name"])

    def test_no_counter_style_names(self):
        for r in self.cfg()["inventory"]["resources"]:
            self.assertNotRegex(r["name"], COUNTER)

    def test_sli_slo_fraction_matches_ratio(self):
        cfg = self.cfg(count=2000)
        slxs = list(cfg["slxs"].values())
        sli = sum("sli" in s for s in slxs) / len(slxs)
        slo = sum("slo" in s for s in slxs) / len(slxs)
        self.assertAlmostEqual(sli, 0.25, delta=0.03)
        self.assertAlmostEqual(slo, 0.10, delta=0.03)

    def test_defaults_block_present(self):
        d = self.cfg()["defaults"]
        self.assertIn("repoURL", d)
        self.assertIn("codeCollection", d)

    def test_code_bundles_cycled(self):
        bundles = {s["codeBundle"] for s in self.cfg()["slxs"].values()}
        self.assertEqual(bundles, set(BUNDLES))  # all 3 bundles used at count=500

    def test_deterministic_under_seed(self):
        self.assertEqual(self.cfg(seed=7), self.cfg(seed=7))

    def test_different_seed_changes_output(self):
        self.assertNotEqual(self.cfg(seed=1), self.cfg(seed=2))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_build_config.py -v`
Expected: FAIL — `ImportError: cannot import name 'build_config'`

- [ ] **Step 3: Implement `build_config`**

Add to `scripts/simulator/generate_scale_config.py`:
```python
DEFAULT_CODE_COLLECTION = "rw-cli-codecollection"
DEFAULT_REPO_URL = "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
DEFAULT_REF = "main"


def _slug(cluster: str, namespace: str, name: str) -> str:
    """Globally-unique, DNS-safe slug/id. Components are single-hyphen tokens,
    so a `--` separator can never be produced inside a component -> no collision.
    """
    return f"{cluster}--{namespace}--{name}"


def build_config(count: int, clusters: int, namespaces_per_cluster: int,
                 seed: int, sli_ratio: float, slo_ratio: float,
                 code_bundles: list[str], skew: str = "longtail") -> dict:
    """Assemble a full simulator test config (defaults + inventory + slxs)."""
    if not code_bundles:
        raise ValueError("code_bundles must be non-empty")
    rng = random.Random(seed)
    slots = plan_namespaces(count, clusters, namespaces_per_cluster, skew, rng)

    # inventory.clusters: dedupe cluster -> its namespaces (in slot order).
    clusters_out: dict[str, list[str]] = {}
    for s in slots:
        clusters_out.setdefault(s.cluster, [])
        clusters_out[s.cluster].append(s.namespace)

    resources: list[dict] = []
    slxs: dict[str, dict] = {}
    used_by_cluster: dict[str, set[str]] = {}
    index = 0
    for s in slots:
        used = used_by_cluster.setdefault(s.cluster, set())
        for _ in range(s.size):
            name = compose_name(rng, used)
            service, component = name.split("-")[0], name.split("-")[1]
            kind = weighted_kind(rng)
            slug = _slug(s.cluster, s.namespace, name)
            resources.append({
                "id": slug,
                "kind": kind,
                "name": name,
                "cluster": s.cluster,
                "namespace": s.namespace,
                "labels": coherent_labels(service, component),
            })
            has_sli, has_slo = select_sli_slo(index, sli_ratio, slo_ratio)
            slx: dict = {
                "codeBundle": code_bundles[index % len(code_bundles)],
                "resources": [slug],
                "levelOfDetail": "basic",
                "runbook": {},
            }
            if has_sli:
                slx["sli"] = {"intervalStrategy": "intermezzo", "intervalSeconds": 180}
            if has_slo:
                slx["slo"] = {"target": 99.5}
            slxs[slug] = slx
            index += 1

    return {
        "defaults": {
            "codeCollection": DEFAULT_CODE_COLLECTION,
            "repoURL": DEFAULT_REPO_URL,
            "ref": DEFAULT_REF,
            "runbook": {"secretsProvided": [
                {"name": "kubeconfig", "workspaceKey": "kubeconfig"}]},
            "sli": {"secretsProvided": [
                {"name": "kubeconfig", "workspaceKey": "kubeconfig"}]},
        },
        "inventory": {
            "clusters": [
                {"name": c, "namespaces": [{"name": n} for n in nss]}
                for c, nss in clusters_out.items()
            ],
            "resources": resources,
        },
        "slxs": slxs,
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_build_config.py -v`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/simulator/generate_scale_config.py scripts/simulator/test_build_config.py
git commit -m "feat(simulator): assemble full organic scale config dict"
```

---

### Task 6: CLI + deterministic YAML emission

**Files:**
- Modify: `scripts/simulator/generate_scale_config.py`
- Test: `scripts/simulator/test_cli.py`

**Interfaces:**
- Consumes: `build_config`.
- Produces: `parse_args(argv: list[str]) -> argparse.Namespace`; `main(argv: list[str] | None = None) -> int` writing YAML to `args.output`. Flags: `--count` (default 100000), `--clusters` (50), `--namespaces-per-cluster` (20), `--seed` (1), `--sli-ratio` (0.25), `--slo-ratio` (0.10), `--skew` (`longtail`), `--code-bundles` (comma-sep, default the three k8s bundles), `--output` (required).

- [ ] **Step 1: Write the failing test**

Create `scripts/simulator/test_cli.py`:
```python
import os
import tempfile
import unittest

import yaml

from scripts.simulator.generate_scale_config import main, parse_args


class CliTestCase(unittest.TestCase):
    def _run(self, out, extra=None):
        argv = ["--count", "200", "--clusters", "4", "--namespaces-per-cluster", "5",
                "--seed", "1", "--output", out] + (extra or [])
        return main(argv)

    def test_writes_parseable_yaml_with_expected_counts(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "c.yaml")
            rc = self._run(out)
            self.assertEqual(rc, 0)
            cfg = yaml.safe_load(open(out))
            self.assertEqual(len(cfg["slxs"]), 200)
            self.assertEqual(len(cfg["inventory"]["resources"]), 200)

    def test_same_seed_is_byte_identical(self):
        with tempfile.TemporaryDirectory() as d:
            a, b = os.path.join(d, "a.yaml"), os.path.join(d, "b.yaml")
            self._run(a); self._run(b)
            self.assertEqual(open(a, "rb").read(), open(b, "rb").read())

    def test_defaults_are_sane(self):
        args = parse_args(["--output", "x.yaml"])
        self.assertEqual(args.count, 100000)
        self.assertEqual(args.clusters, 50)
        self.assertEqual(args.sli_ratio, 0.25)
        self.assertEqual(args.slo_ratio, 0.10)

    def test_rejects_bad_ratio(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(SystemExit):
                self._run(os.path.join(d, "c.yaml"), ["--sli-ratio", "1.5"])
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_cli.py -v`
Expected: FAIL — `ImportError: cannot import name 'main'`

- [ ] **Step 3: Implement `parse_args` + `main` and wire `__main__`**

Replace the `__main__` guard at the bottom of `scripts/simulator/generate_scale_config.py`:
```python
def parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--count", type=int, default=100000)
    p.add_argument("--clusters", type=int, default=50)
    p.add_argument("--namespaces-per-cluster", type=int, default=20)
    p.add_argument("--seed", type=int, default=1)
    p.add_argument("--sli-ratio", type=float, default=0.25)
    p.add_argument("--slo-ratio", type=float, default=0.10)
    p.add_argument("--skew", choices=["longtail", "uniform"], default="longtail")
    p.add_argument("--code-bundles",
                   default="k8s-deployment-ops,k8s-statefulset-ops,k8s-ingress-healthcheck")
    p.add_argument("--output", required=True)
    args = p.parse_args(argv)
    if not (0.0 <= args.sli_ratio <= 1.0 and 0.0 <= args.slo_ratio <= 1.0):
        p.error("--sli-ratio and --slo-ratio must be in [0, 1]")
    return args


def main(argv: list[str] | None = None) -> int:
    import yaml
    args = parse_args(argv if argv is not None else None)
    bundles = [b.strip() for b in args.code_bundles.split(",") if b.strip()]
    cfg = build_config(
        args.count, args.clusters, args.namespaces_per_cluster, args.seed,
        args.sli_ratio, args.slo_ratio, bundles, args.skew,
    )
    with open(args.output, "w") as f:
        # sort_keys=True keeps output stable/deterministic across runs.
        yaml.safe_dump(cfg, f, sort_keys=True, default_flow_style=False)
    print(f"Wrote {len(cfg['slxs'])} SLXs across "
          f"{len(cfg['inventory']['clusters'])} clusters to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/test_cli.py -v`
Expected: PASS (4 tests)

- [ ] **Step 5: Run the whole generator suite**

Run: `cd <repo root> && src/.venv/bin/python -m pytest scripts/simulator/ -v`
Expected: PASS (all tests across the 5 test files)

- [ ] **Step 6: Commit**

```bash
git add scripts/simulator/generate_scale_config.py scripts/simulator/test_cli.py
git commit -m "feat(simulator): CLI + deterministic YAML emission for scale generator"
```

---

### Task 7: End-to-end integration — generated config drives the real simulate pipeline

**Files:**
- Test: `scripts/simulator/test_integration_pipeline.py`

**Interfaces:**
- Consumes: `build_config` (small `count`), the real FastAPI `/run/` pipeline via `TestClient`, and the bundled simulator codecollection helper.

- [ ] **Step 1: Write the failing test**

Create `scripts/simulator/test_integration_pipeline.py`:
```python
import io
import os
import sys
import tarfile
import tempfile
import unittest
from base64 import b64decode

import yaml

# Make src/ importable so we can reach the workspace builder + its test helper.
_SRC = os.path.join(os.path.dirname(__file__), "..", "..", "src")
sys.path.insert(0, os.path.abspath(_SRC))

from scripts.simulator.generate_scale_config import build_config

BUNDLES = ["k8s-deployment-ops", "k8s-statefulset-ops", "k8s-ingress-healthcheck"]


class IntegrationPipelineTestCase(unittest.TestCase):
    def test_generated_config_renders_expected_slx_count(self):
        from fastapi.testclient import TestClient
        from workspace_builder.api import app
        from workspace_builder.tests_simulator import (
            _materialize_simulator_codecollection_repo,
        )

        cfg = build_config(20, 3, 4, seed=1, sli_ratio=0.25, slo_ratio=0.10,
                           code_bundles=BUNDLES)
        cc = _materialize_simulator_codecollection_repo(tempfile.mkdtemp())
        req = {
            "components": "test_synth,generation_rules,test_groups,render_output_items",
            "workspaceName": "ws-gen", "workspaceOwnerEmail": "t@e.com",
            "papiURL": "http://papi.local", "locationId": "loc-1",
            "testConfig": yaml.safe_dump(cfg),
            "codeCollections": [{"repoURL": cc, "ref": "main"}],
            "writeWorkspaceFilesToDisk": True,
        }
        resp = TestClient(app).post("/run/", json=req)
        self.assertEqual(resp.status_code, 200, resp.text[:500])
        arch = tarfile.open(fileobj=io.BytesIO(b64decode(resp.json()["output"])), mode="r")
        slx_dirs = {
            m.name.split("/slxs/", 1)[1].split("/", 1)[0]
            for m in arch.getmembers()
            if "/slxs/" in m.name and m.name.endswith("/slx.yaml")
        }
        self.assertEqual(len(slx_dirs), 20)
```

- [ ] **Step 2: Run test to verify it fails (for the right reason)**

Run: `cd <repo root> && WB_GIT_REPO_ROOT="$(mktemp -d)" src/.venv/bin/python -m pytest scripts/simulator/test_integration_pipeline.py -v`
Expected: initially may FAIL if the venv lacks the full workspace-builder deps. If so, install them once: `src/.venv/bin/pip install -q poetry && cd src && POETRY_VIRTUALENVS_CREATE=false ../src/.venv/bin/poetry install --no-root` (or reuse the venv already built during the merge repair). Then it should FAIL only if the generated config is wrong.

- [ ] **Step 3: Fix any schema mismatch surfaced by the integration test**

If the assertion fails on SLX count or a render error, reconcile `build_config`'s emitted fields with what `test_synth` expects (see `docs/user-guide/features/simulator.md` and `src/indexers/test_synth.py`). Adjust `build_config` only — no pipeline changes. Re-run until green.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd <repo root> && WB_GIT_REPO_ROOT="$(mktemp -d)" src/.venv/bin/python -m pytest scripts/simulator/test_integration_pipeline.py -v`
Expected: PASS (1 test) — 20 SLX dirs rendered from the generated config.

- [ ] **Step 5: Commit**

```bash
git add scripts/simulator/test_integration_pipeline.py scripts/simulator/generate_scale_config.py
git commit -m "test(simulator): end-to-end integration of generated config with pipeline"
```

---

### Task 8: Docs — "Generating at scale" + feasibility ramp

**Files:**
- Modify: `docs/user-guide/features/simulator.md`

**Interfaces:** none (documentation).

- [ ] **Step 1: Add the section**

Append a `## Generating at scale` section to `docs/user-guide/features/simulator.md` covering:
- the generator invocation (from Task 0 README), all flags and defaults;
- that it emits the standard `defaults`/`inventory`/`slxs` schema (no pipeline changes);
- the **feasibility ramp**: run `--count` at 1K → 10K → 50K → 100K, and at each step record wall-time per phase (generate / `/run/` render / tar / upload), peak RSS, output file count, tar size, and PAPI upload latency;
- the **file-count math**: at 100K with default ratios ≈ 100K slx + 100K runbook + 25K sli + 10K slo ≈ **235K files** in one tar (both ratios `1.0` → ~400K; `0.0` → ~200K);
- the note that the workspace builder now defaults rendered files to the sqlite store, and that `simulate` forces `writeWorkspaceFilesToDisk=True` so the upload archive is populated (the DB-sourced upload path is unavailable over REST);
- the **batching fallback**: if a single 100K upload stalls at render/tar/PAPI, generate smaller configs (`--count 5000`) and run `simulate --upload --upload-merge-mode keep-existing` ~20× into one workspace.

Use this exact fenced invocation block in the docs:
```
python scripts/simulator/generate_scale_config.py \
  --count 100000 --clusters 50 --namespaces-per-cluster 20 \
  --seed 1 --sli-ratio 0.25 --slo-ratio 0.10 \
  --output scale-test.yaml

cd src && python run.py simulate \
  --config ../scale-test.yaml \
  --upload-info uploadInfo.yaml \
  --base-directory . \
  --upload
```

- [ ] **Step 2: Verify the docs render / links resolve**

Run: `grep -n "Generating at scale" docs/user-guide/features/simulator.md`
Expected: the new heading is present.

- [ ] **Step 3: Commit**

```bash
git add docs/user-guide/features/simulator.md
git commit -m "docs(simulator): generating-at-scale guide + feasibility ramp"
```

---

## Self-Review

**Spec coverage:** Every spec section maps to a task — vocabularies (T1), distribution/skew (T2), organic per-cluster-unique naming (T3), SLI/SLO ratios (T4), full config assembly + schema fidelity (T5), CLI + determinism (T6), pipeline parity (T7), feasibility-ramp + file-count + batching-fallback docs (T8). The spec's "generative block in test_synth" (Option B) is intentionally replaced by the standalone-script home (Option A) per the user's decision; the organic-generation substance is unchanged.

**Divergence from spec, recorded:** the spec recommends Option B and lists Option A as the alternative. This plan implements Option A. The one behavioral consequence the spec flagged — `writeWorkspaceFilesToDisk` — is already handled in the committed merge repair and is only referenced in docs here (T8), not re-implemented.

**Placeholder scan:** The only deliberately-elided content is the *body* of the vocabulary lists in T1, which the implementer extends to hit explicit, test-enforced size/capacity thresholds (the tests fail until the banks are big enough) — not a silent TODO.

**Type consistency:** `NamespaceSlot` fields (`cluster_index`, `cluster`, `namespace`, `size`) are consistent across T2/T5. `compose_name(rng, used)`, `weighted_kind(rng)`, `coherent_labels(service, component)`, `select_sli_slo(index, sli_ratio, slo_ratio)`, and `build_config(...)` signatures are used identically in their tests and in T5's assembly. `slug == id` invariant is asserted in T5 and relied on in T7.

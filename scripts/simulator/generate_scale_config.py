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


if __name__ == "__main__":  # pragma: no cover  (wired fully in Task 6)
    raise SystemExit("CLI wired in a later task")

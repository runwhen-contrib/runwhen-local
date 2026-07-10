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

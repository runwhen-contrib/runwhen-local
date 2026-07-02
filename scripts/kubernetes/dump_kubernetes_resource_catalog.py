#!/usr/bin/env python3
"""Regenerate ``docs/authoring/indexed-resources/kubernetes-resource-catalog.md``."""

from __future__ import annotations

import datetime as _dt
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
_SRC = _REPO_ROOT / "src"
sys.path.insert(0, str(_SRC))

from indexers.kubetypes import KubernetesResourceType  # noqa: E402

_OUTPUT = (
    _REPO_ROOT
    / "docs"
    / "authoring"
    / "indexed-resources"
    / "kubernetes-resource-catalog.md"
)


def main() -> None:
    generated_at = _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d")
    lines = [
        "# Kubernetes resource catalog",
        "",
        "Built-in Kubernetes resource types the kubeapi indexer discovers.",
        "",
        f"_Generated {generated_at} from `indexers/kubetypes.py`._",
        "",
        "Custom CRDs are declared in generation rules (`resourceTypes`) and indexed",
        "selectively — they are not listed here.",
        "",
        "| Resource type | Notes |",
        "|---|---|",
    ]
    for resource_type in KubernetesResourceType:
        lines.append(f"| `{resource_type.value}` | Built-in Kubernetes kind |")
    lines.extend(["",])
    _OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    _OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {_OUTPUT}")


if __name__ == "__main__":
    main()

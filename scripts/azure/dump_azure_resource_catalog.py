#!/usr/bin/env python3
"""Regenerate ``docs/authoring/indexed-resources/azure-resource-catalog.md``.

The catalog is the user-facing companion to ``azure.md``: a single sortable
table of every Azure resource type the ``azureapi`` indexer knows about,
grouped by service. It's derived directly from
``src/indexers/azure_resource_type_registry.yaml`` (which itself is generated
from the CloudQuery Azure plugin's table list and the manual overrides in
``scripts/azure/azure_resource_type_overrides.yaml``).

Run this script after editing ``azure_resource_type_overrides.yaml`` and
re-running ``sync_azure_resource_type_registry.py``. Hand-edits to the
generated catalog get overwritten; touch the registry / overrides instead.

Usage::

    python scripts/azure/dump_azure_resource_catalog.py
"""

from __future__ import annotations

import datetime as _dt
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
_SRC = _REPO_ROOT / "src"
sys.path.insert(0, str(_SRC))

from indexers.azure_resource_type_registry import load_registry  # noqa: E402

_OUTPUT = (
    _REPO_ROOT
    / "docs"
    / "authoring"
    / "indexed-resources"
    / "azure-resource-catalog.md"
)


def main() -> None:
    registry = load_registry()
    rows = sorted(
        registry,
        key=lambda e: ((e.category or "~"), e.cloudquery_table_name),
    )
    typed_count = sum(1 for e in rows if e.typed_collector)
    generated_at = _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d")

    lines: list[str] = []
    lines.append("# Azure resource catalog")
    lines.append("")
    lines.append(
        "Every Azure resource type the native `azureapi` indexer can "
        "discover. This page is the companion catalog for "
        "[`azure.md`](./azure.md); see that page for how to enable the "
        "indexer, what data each row carries, and the typed/generic "
        "distinction."
    )
    lines.append("")
    lines.append(
        f"_{len(rows)} resource types - {typed_count} typed (rich-payload), "
        f"{len(rows) - typed_count} generic (basic envelope). "
        f"Generated {generated_at} from "
        "`src/indexers/azure_resource_type_registry.yaml`._"
    )
    lines.append("")
    lines.append(
        "_Regenerate with `python scripts/azure/dump_azure_resource_catalog.py` "
        "after touching the registry or overrides; do not hand-edit this file._"
    )
    lines.append("")
    lines.append(
        "* `typed` - hand-written `azure-mgmt-*` collector returns the "
        "full SDK payload (rich `properties`)."
    )
    lines.append(
        "* `generic` - covered by the ARM-resources catch-all "
        "(`ResourceManagementClient.resources.list[_by_resource_group]`); "
        "row carries the basic envelope (`id`, `name`, `type`, `location`, "
        "`tags`, `sku`, `kind`, `identity`, `managed_by`) but **no** "
        "`properties` (an ARM API limitation, not a workspace-builder one)."
    )
    lines.append("")
    lines.append("| Service | CloudQuery table name | ARM type | Tier |")
    lines.append("| --- | --- | --- | --- |")
    for e in rows:
        cat = e.category or "-"
        cq = e.cloudquery_table_name
        arm = e.arm_type or "-"
        tier = "typed" if e.typed_collector else "generic"
        lines.append(f"| {cat} | `{cq}` | `{arm}` | {tier} |")
    lines.append("")

    _OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {_OUTPUT.relative_to(_REPO_ROOT)} ({len(rows)} entries)")


if __name__ == "__main__":
    main()

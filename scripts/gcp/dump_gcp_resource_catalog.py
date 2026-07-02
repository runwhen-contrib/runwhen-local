#!/usr/bin/env python3
"""Regenerate ``docs/authoring/indexed-resources/gcp-resource-catalog.md``.

The catalog is the user-facing companion to ``gcp.md``: a single sortable
table of every GCP resource type the ``gcpapi`` indexer knows about,
grouped by service. It's derived directly from
``src/indexers/gcp_resource_type_registry.yaml`` (which itself is generated
from the CloudQuery GCP plugin's table list and the manual overrides in
``scripts/gcp/gcp_resource_type_overrides.yaml``).

Run this script after editing ``gcp_resource_type_overrides.yaml`` and
re-running ``sync_gcp_resource_type_registry.py``. Hand-edits to the
generated catalog get overwritten; touch the registry / overrides instead.

Usage::

    python scripts/gcp/dump_gcp_resource_catalog.py
"""

from __future__ import annotations

import datetime as _dt
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
_SRC = _REPO_ROOT / "src"
sys.path.insert(0, str(_SRC))

from indexers.gcp_resource_type_registry import load_registry  # noqa: E402

_OUTPUT = (
    _REPO_ROOT
    / "docs"
    / "authoring"
    / "indexed-resources"
    / "gcp-resource-catalog.md"
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
    lines.append("# GCP resource catalog")
    lines.append("")
    lines.append(
        "Every GCP resource type the native `gcpapi` indexer can "
        "discover. This page is the companion catalog for "
        "[`gcp.md`](./gcp.md); see that page for how to enable the "
        "indexer, what data each row carries, and the typed/generic "
        "distinction."
    )
    lines.append("")
    lines.append(
        f"_{len(rows)} resource types - {typed_count} typed (SDK collectors), "
        f"{len(rows) - typed_count} generic (Cloud Asset Inventory pass). "
        f"Generated {generated_at} from "
        "`src/indexers/gcp_resource_type_registry.yaml`._"
    )
    lines.append("")
    lines.append(
        "_Regenerate with `python scripts/gcp/dump_gcp_resource_catalog.py` "
        "after touching the registry or overrides; do not hand-edit this file._"
    )
    lines.append("")
    lines.append(
        "* `typed` - hand-written `google-cloud-*` collector; runs without CAI."
    )
    lines.append(
        "* `generic` - discoverable via the optional Cloud Asset Inventory "
        "accelerator when a CAI asset type is mapped."
    )
    lines.append("")
    lines.append("| Service | CloudQuery table name | CAI asset type | Tier |")
    lines.append("| --- | --- | --- | --- |")
    for e in rows:
        cat = e.category or "-"
        cq = e.cloudquery_table_name
        cai = e.cai_asset_type or "-"
        tier = "typed" if e.typed_collector else "generic"
        lines.append(f"| {cat} | `{cq}` | `{cai}` | {tier} |")
    lines.append("")

    _OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {_OUTPUT.relative_to(_REPO_ROOT)} ({len(rows)} entries)")


if __name__ == "__main__":
    main()

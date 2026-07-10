#!/usr/bin/env python3
"""Regenerate ``docs/authoring/indexed-resources/gcp-resource-catalog.md``.

The catalog is the user-facing companion to ``gcp.md``. Rather than dumping
every CloudQuery table as one flat wall, it leads with the resource types
authors actually target — **typed** (SDK) collectors and any mandatory
anchor — and tucks the exhaustive generic list into a collapsible section
grouped by service.

It's derived directly from ``src/indexers/gcp_resource_type_registry.yaml``
(which itself is generated from the CloudQuery GCP plugin's table list and the
manual overrides in ``scripts/gcp/gcp_resource_type_overrides.yaml``).

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


def _aliases(entry) -> str:
    """Render non-canonical accepted names as inline code, or ``-``."""
    names = [n for n in entry.known_names() if n != entry.cloudquery_table_name]
    return ", ".join(f"`{n}`" for n in names) if names else "-"


def main() -> None:
    registry = load_registry()
    rows = sorted(
        registry,
        key=lambda e: ((e.category or "~"), e.cloudquery_table_name),
    )
    typed_count = sum(1 for e in rows if e.typed_collector)
    generated_at = _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d")

    featured = [e for e in rows if e.typed_collector or e.mandatory]
    featured.sort(key=lambda e: (not e.mandatory, not e.typed_collector, e.cloudquery_table_name))

    lines: list[str] = []
    lines.append("# GCP resource catalog")
    lines.append("")
    lines.append(
        "Resource types the native `gcpapi` indexer can discover. Use the "
        "canonical CloudQuery table name (or any listed alias) as the "
        "`resourceTypes` value in a generation rule. This page is the "
        "companion catalog for [`gcp.md`](./gcp.md); see that page for how to "
        "enable the indexer and what data each row carries."
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

    # --- Featured (typed + anchor) -------------------------------------
    lines.append("## Commonly matched types")
    lines.append("")
    lines.append(
        "Typed collectors (rich payloads) and any mandatory anchor — the "
        "resource types most generation rules target."
    )
    lines.append("")
    lines.append("| Service | Resource type | Aliases | CAI asset type | Tier |")
    lines.append("| --- | --- | --- | --- | --- |")
    for e in featured:
        cat = e.category or "-"
        cai = f"`{e.cai_asset_type}`" if e.cai_asset_type else "-"
        tier = "typed" if e.typed_collector else "anchor"
        lines.append(
            f"| {cat} | `{e.cloudquery_table_name}` | {_aliases(e)} | {cai} | {tier} |"
        )
    lines.append("")

    # --- Full list (collapsed) -----------------------------------------
    lines.append("## All resource types")
    lines.append("")
    lines.append(
        f"The complete set of {len(rows)} resource types, grouped by service. "
        "Expand to browse or search (Ctrl/Cmd-F)."
    )
    lines.append("")
    lines.append("<details>")
    lines.append(f"<summary>Show all {len(rows)} GCP resource types</summary>")
    lines.append("")
    lines.append("| Service | CloudQuery table name | CAI asset type | Tier |")
    lines.append("| --- | --- | --- | --- |")
    for e in rows:
        cat = e.category or "-"
        cai = f"`{e.cai_asset_type}`" if e.cai_asset_type else "-"
        tier = "typed" if e.typed_collector else "generic"
        lines.append(f"| {cat} | `{e.cloudquery_table_name}` | {cai} | {tier} |")
    lines.append("")
    lines.append("</details>")
    lines.append("")

    _OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {_OUTPUT.relative_to(_REPO_ROOT)} ({len(rows)} entries)")


if __name__ == "__main__":
    main()

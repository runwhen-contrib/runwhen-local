#!/usr/bin/env python3
"""Regenerate ``docs/authoring/indexed-resources/aws-resource-catalog.md``.

The catalog is the user-facing companion to ``aws.md``. Rather than dumping
all ~1000 CloudQuery tables as one flat wall, it leads with the resource
types authors actually target — **typed** (rich-payload) collectors and the
mandatory account anchor — and tucks the exhaustive generic list into a
collapsible section grouped by service.

It's derived directly from ``src/indexers/aws_resource_type_registry.yaml``
(which itself is generated from the CloudQuery AWS plugin's table list and the
manual overrides in ``scripts/aws/aws_resource_type_overrides.yaml``).

Run this script after editing ``aws_resource_type_overrides.yaml`` and
re-running ``sync_aws_resource_type_registry.py``. Hand-edits to the
generated catalog get overwritten; touch the registry / overrides instead.

Usage::

    python scripts/aws/dump_aws_resource_catalog.py
"""

from __future__ import annotations

import datetime as _dt
import sys
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
_SRC = _REPO_ROOT / "src"
sys.path.insert(0, str(_SRC))

from indexers.aws_resource_type_registry import load_registry  # noqa: E402

_OUTPUT = (
    _REPO_ROOT
    / "docs"
    / "authoring"
    / "indexed-resources"
    / "aws-resource-catalog.md"
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

    # Featured = the types authors most commonly match: hand-written typed
    # collectors plus the mandatory account anchor.
    featured = [e for e in rows if e.typed_collector or e.mandatory]
    featured.sort(key=lambda e: (not e.mandatory, not e.typed_collector, e.cloudquery_table_name))

    lines: list[str] = []
    lines.append("# AWS resource catalog")
    lines.append("")
    lines.append(
        "Resource types the native `awsapi` indexer can discover. Use the "
        "canonical CloudQuery table name (or any listed alias) as the "
        "`resourceTypes` value in a generation rule. This page is the "
        "companion catalog for [`aws.md`](./aws.md); see that page for how to "
        "enable the indexer and what data each row carries."
    )
    lines.append("")
    lines.append(
        f"_{len(rows)} resource types - {typed_count} typed (rich-payload), "
        f"{len(rows) - typed_count} generic (Cloud Control envelope). "
        f"Generated {generated_at} from "
        "`src/indexers/aws_resource_type_registry.yaml`._"
    )
    lines.append("")
    lines.append(
        "_Regenerate with `python scripts/aws/dump_aws_resource_catalog.py` "
        "after touching the registry or overrides; do not hand-edit this file._"
    )
    lines.append("")
    lines.append(
        "* `typed` - hand-written `boto3` collector returns a richer payload."
    )
    lines.append(
        "* `generic` - covered by the Cloud Control API catch-all when a "
        "CloudFormation type exists; rows without a CFN type are registry-only "
        "and skipped by generic discovery."
    )
    lines.append("")

    # --- Featured (typed + anchor) -------------------------------------
    lines.append("## Commonly matched types")
    lines.append("")
    lines.append(
        "Typed collectors (rich payloads) and the mandatory account anchor — "
        "the resource types most generation rules target."
    )
    lines.append("")
    lines.append("| Service | Resource type | Aliases | CFN type | Tier |")
    lines.append("| --- | --- | --- | --- | --- |")
    for e in featured:
        cat = e.category or "-"
        cfn = f"`{e.cfn_type}`" if e.cfn_type else "-"
        tier = "typed" if e.typed_collector else "anchor"
        lines.append(
            f"| {cat} | `{e.cloudquery_table_name}` | {_aliases(e)} | {cfn} | {tier} |"
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
    lines.append(f"<summary>Show all {len(rows)} AWS resource types</summary>")
    lines.append("")
    lines.append("| Service | CloudQuery table name | CFN type | Tier |")
    lines.append("| --- | --- | --- | --- |")
    for e in rows:
        cat = e.category or "-"
        cfn = f"`{e.cfn_type}`" if e.cfn_type else "-"
        tier = "typed" if e.typed_collector else "generic"
        lines.append(f"| {cat} | `{e.cloudquery_table_name}` | {cfn} | {tier} |")
    lines.append("")
    lines.append("</details>")
    lines.append("")

    _OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {_OUTPUT.relative_to(_REPO_ROOT)} ({len(rows)} entries)")


if __name__ == "__main__":
    main()

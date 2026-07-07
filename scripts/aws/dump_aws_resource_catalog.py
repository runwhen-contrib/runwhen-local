#!/usr/bin/env python3
"""Regenerate ``docs/authoring/indexed-resources/aws-resource-catalog.md``.

The catalog is the user-facing companion to ``aws.md``: a single sortable
table of every AWS resource type the ``awsapi`` indexer knows about,
grouped by service. It's derived directly from
``src/indexers/aws_resource_type_registry.yaml`` (which itself is generated
from the CloudQuery AWS plugin's table list and the manual overrides in
``scripts/aws/aws_resource_type_overrides.yaml``).

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


def main() -> None:
    registry = load_registry()
    rows = sorted(
        registry,
        key=lambda e: ((e.category or "~"), e.cloudquery_table_name),
    )
    typed_count = sum(1 for e in rows if e.typed_collector)
    generated_at = _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d")

    lines: list[str] = []
    lines.append("# AWS resource catalog")
    lines.append("")
    lines.append(
        "Every AWS resource type the native `awsapi` indexer can "
        "discover. This page is the companion catalog for "
        "[`aws.md`](./aws.md); see that page for how to enable the "
        "indexer, what data each row carries, and the typed/generic "
        "distinction."
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
    lines.append("| Service | CloudQuery table name | CFN type | Tier |")
    lines.append("| --- | --- | --- | --- |")
    for e in rows:
        cat = e.category or "-"
        cq = e.cloudquery_table_name
        cfn = e.cfn_type or "-"
        tier = "typed" if e.typed_collector else "generic"
        lines.append(f"| {cat} | `{cq}` | `{cfn}` | {tier} |")
    lines.append("")

    _OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {_OUTPUT.relative_to(_REPO_ROOT)} ({len(rows)} entries)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Regenerate ``docs/authoring/indexed-resources/runwhen-platform-resource-catalog.md``."""

from __future__ import annotations

import datetime as _dt
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
_OUTPUT = (
    _REPO_ROOT
    / "docs"
    / "authoring"
    / "indexed-resources"
    / "runwhen-platform-resource-catalog.md"
)


def main() -> None:
    generated_at = _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d")
    lines = [
        "# RunWhen platform resource catalog",
        "",
        "Resource types indexed under `platform: runwhen`.",
        "",
        f"_Generated {generated_at} from `scripts/runwhen/dump_runwhen_resource_catalog.py`._",
        "",
        "| Resource type | Match names | Typed collector | Notes |",
        "|---|---|---|---|",
        "| `workspace` | `workspace` | yes | One instance per workspace-builder run |",
        "",
        "## match_resource properties (workspace)",
        "",
        "| Property | Description |",
        "|---|---|",
        "| `name` | Workspace name |",
        "| `qualified_name` | Same as workspace name |",
        "| `owner_email` | From workspaceInfo `workspaceOwnerEmail` |",
        "| `location_id` | Default location id |",
        "| `location_name` | Default location name |",
        "",
    ]
    _OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    _OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {_OUTPUT}")


if __name__ == "__main__":
    main()

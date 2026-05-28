#!/usr/bin/env python3
"""
Sync ``src/indexers/azure_resource_type_registry.yaml``.

The registry maps every CloudQuery Azure plugin table to its ARM resource
type plus metadata used by the native ``azureapi`` indexer. The data is
materialised from three inputs:

1. **A list of CloudQuery Azure table names.** Source of truth for which
   tables exist. Provided either by re-reading the previous registry
   snapshot (default), reading a local file, or fetching the live list
   from CloudQuery's public hub.

2. **A heuristic** that converts ``azure_<service>_<entity>`` into
   ``Microsoft.<Service>/<entityCamelCase>``. The service segment uses
   the casing in ``service_namespace_casings`` (a hand-curated dictionary
   that handles multi-word service names like ``apimanagement`` ->
   ``ApiManagement``); the entity segment uses snake-case-to-camelCase.

3. **A manual overrides YAML** at
   ``scripts/azure/azure_resource_type_overrides.yaml`` that pins the
   ARM type, aliases, ``typed_collector`` flag, and ``mandatory`` flag
   for any table whose heuristic value is wrong or where extra metadata
   is needed.

Hand-edit the overrides YAML; never hand-edit the registry YAML. After
editing the overrides, re-run this script to regenerate the registry.

Usage:

    # Round-trip the current registry (most common - picks up new
    # overrides without touching the table list):
    python scripts/azure/sync_azure_resource_type_registry.py

    # Use a fresh table list from a file:
    python scripts/azure/sync_azure_resource_type_registry.py \\
        --from-file path/to/azure_tables.txt

    # Fetch the latest list from CloudQuery's public hub:
    python scripts/azure/sync_azure_resource_type_registry.py --from-cloudquery

    # Print summary of changes without writing:
    python scripts/azure/sync_azure_resource_type_registry.py --dry-run
"""

from __future__ import annotations

import argparse
import datetime as _dt
import re
import sys
from pathlib import Path
from typing import Iterable, Optional

try:
    import yaml
except ImportError:  # pragma: no cover - tooling environment must have yaml
    print("PyYAML is required: pip install pyyaml", file=sys.stderr)
    sys.exit(2)


REPO_ROOT = Path(__file__).resolve().parents[2]
REGISTRY_PATH = REPO_ROOT / "src" / "indexers" / "azure_resource_type_registry.yaml"
OVERRIDES_PATH = REPO_ROOT / "scripts" / "azure" / "azure_resource_type_overrides.yaml"
CLOUDQUERY_TABLES_URL = (
    "https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/tables"
)


# ---------------------------------------------------------------------------
# Heuristic
# ---------------------------------------------------------------------------

_AZURE_TABLE_PREFIX = "azure_"


def _snake_to_camel(snake: str) -> str:
    """Convert ``foo_bar_baz`` to ``fooBarBaz``. Empty input -> empty output."""
    if not snake:
        return ""
    parts = [p for p in snake.split("_") if p]
    if not parts:
        return ""
    first, *rest = parts
    return first + "".join(p[:1].upper() + p[1:] for p in rest)


def infer_arm_type(
    cloudquery_table: str,
    service_namespace_casings: dict[str, str],
    service_namespace_remaps: Optional[dict[str, str]] = None,
) -> Optional[str]:
    """Best-effort heuristic mapping CQ table -> Microsoft.X/Y. Returns None
    if the input doesn't follow the ``azure_<service>_<entity>`` shape.

    Resolution order for the service namespace:
      1. ``service_namespace_remaps`` - full namespace substitution
         (e.g. ``frontdoor`` -> ``Network``).
      2. ``service_namespace_casings`` - same service, custom casing
         (e.g. ``apimanagement`` -> ``ApiManagement``).
      3. Title-case fallback (``compute`` -> ``Compute``).
    """
    remaps = service_namespace_remaps or {}
    if not cloudquery_table.startswith(_AZURE_TABLE_PREFIX):
        return None
    rest = cloudquery_table[len(_AZURE_TABLE_PREFIX):]
    if "_" not in rest:
        return None

    service_token, entity_snake = rest.split("_", 1)
    if service_token in remaps:
        namespace = remaps[service_token]
    elif service_token in service_namespace_casings:
        namespace = service_namespace_casings[service_token]
    else:
        namespace = service_token[:1].upper() + service_token[1:]
    entity = _snake_to_camel(entity_snake)
    if not entity:
        return None
    return f"Microsoft.{namespace}/{entity}"


def _category_for(cloudquery_table: str) -> Optional[str]:
    if not cloudquery_table.startswith(_AZURE_TABLE_PREFIX):
        return None
    rest = cloudquery_table[len(_AZURE_TABLE_PREFIX):]
    return rest.split("_", 1)[0] if rest else None


# ---------------------------------------------------------------------------
# Inputs
# ---------------------------------------------------------------------------

def load_overrides(path: Path = OVERRIDES_PATH) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f"Overrides YAML not found at {path}. "
            f"This file holds the hand-curated metadata; do not delete it."
        )
    payload = yaml.safe_load(path.read_text()) or {}
    return {
        "service_namespace_casings": payload.get("service_namespace_casings") or {},
        "service_namespace_remaps": payload.get("service_namespace_remaps") or {},
        "arm_type_overrides": payload.get("arm_type_overrides") or {},
        "aliases": payload.get("aliases") or {},
        "typed_collectors": set(payload.get("typed_collectors") or []),
        "mandatory": set(payload.get("mandatory") or []),
    }


def tables_from_registry(path: Path = REGISTRY_PATH) -> list[str]:
    if not path.exists():
        return []
    payload = yaml.safe_load(path.read_text()) or {}
    types = payload.get("types") or {}
    return sorted(types.keys())


def tables_from_file(path: Path) -> list[str]:
    text = path.read_text()
    if path.suffix.lower() in {".yaml", ".yml"}:
        payload = yaml.safe_load(text) or {}
        if isinstance(payload, dict) and "tables" in payload:
            return sorted(str(t) for t in payload["tables"])
        if isinstance(payload, list):
            return sorted(str(t) for t in payload)
        raise ValueError(
            f"YAML file {path} must be a list of names or a mapping with a 'tables' key"
        )
    # Treat anything else as one-table-name-per-line.
    tables: set[str] = set()
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        tables.add(line)
    return sorted(tables)


def tables_from_cloudquery_hub(url: str = CLOUDQUERY_TABLES_URL) -> list[str]:
    """Fetch and parse the CloudQuery hub tables page. Best-effort: this is
    a public HTML page and the markup may shift; if parsing fails the script
    falls back to whatever tables are encoded in the page text via the
    ``azure_`` prefix.
    """
    try:
        from urllib.request import Request, urlopen
    except ImportError:  # pragma: no cover
        raise RuntimeError("urllib is unavailable in this Python build")

    req = Request(url, headers={"User-Agent": "rwl-sync-script/1.0"})
    with urlopen(req, timeout=30) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    tables = sorted(set(re.findall(r"\bazure_[a-z][a-z0-9_]+\b", html)))
    if not tables:
        raise RuntimeError(
            f"No azure_* table names found at {url}. The page layout may have "
            f"changed; pass --from-file with an explicit table list instead."
        )
    return tables


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def build_registry(
    table_names: Iterable[str],
    overrides: dict,
    snapshot_date: Optional[str] = None,
) -> dict:
    arm_overrides: dict = overrides["arm_type_overrides"]
    aliases: dict = overrides["aliases"]
    typed_collectors: set[str] = overrides["typed_collectors"]
    mandatory: set[str] = overrides["mandatory"]
    service_casings: dict = overrides["service_namespace_casings"]
    service_remaps: dict = overrides["service_namespace_remaps"]

    types: dict[str, dict] = {}
    typed_collector_count = 0
    arm_types_assigned = 0

    for name in sorted(set(table_names)):
        if name in arm_overrides:
            arm_type = arm_overrides[name]
            arm_type_source = "override"
        else:
            arm_type = infer_arm_type(name, service_casings, service_remaps)
            arm_type_source = "heuristic" if arm_type else None

        is_typed = name in typed_collectors
        is_mandatory = name in mandatory

        if is_typed:
            typed_collector_count += 1
        if arm_type:
            arm_types_assigned += 1

        types[name] = {
            "arm_type": arm_type,
            "arm_type_source": arm_type_source,
            "category": _category_for(name),
            "aliases": list(aliases.get(name, [])),
            "typed_collector": is_typed,
            "mandatory": is_mandatory,
        }

    metadata = {
        "source": CLOUDQUERY_TABLES_URL,
        "snapshot_date": snapshot_date or _dt.date.today().isoformat(),
        "total_tables": len(types),
        "typed_collectors": typed_collector_count,
        "arm_types_assigned": arm_types_assigned,
        "generator": "scripts/azure/sync_azure_resource_type_registry.py",
        "notes": (
            "Generated file. To change ARM type for a table, edit "
            "scripts/azure/azure_resource_type_overrides.yaml and re-run "
            "the sync script. Hand-edits to this file will be overwritten."
        ),
    }

    return {"metadata": metadata, "types": types}


def diff_summary(old: dict, new: dict) -> str:
    old_types = (old or {}).get("types") or {}
    new_types = new.get("types") or {}
    added = sorted(set(new_types) - set(old_types))
    removed = sorted(set(old_types) - set(new_types))
    changed = []
    for name in sorted(set(new_types) & set(old_types)):
        if new_types[name] != old_types[name]:
            changed.append(name)

    lines = [
        f"  total tables: {len(new_types)} (was {len(old_types)})",
        f"  added       : {len(added)}",
        f"  removed     : {len(removed)}",
        f"  changed     : {len(changed)}",
    ]
    for label, items in (("added", added), ("removed", removed), ("changed", changed)):
        if not items:
            continue
        sample = items[:10]
        more = f" ... (+{len(items) - len(sample)} more)" if len(items) > len(sample) else ""
        lines.append(f"    {label}: {sample}{more}")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n", 1)[0])
    src = parser.add_mutually_exclusive_group()
    src.add_argument(
        "--from-registry",
        action="store_true",
        help="Read the table list from the existing registry YAML (default).",
    )
    src.add_argument(
        "--from-file",
        type=Path,
        help="Read the table list from a local file (one name per line, or YAML).",
    )
    src.add_argument(
        "--from-cloudquery",
        action="store_true",
        help=f"Fetch the table list from {CLOUDQUERY_TABLES_URL}",
    )
    parser.add_argument(
        "--overrides",
        type=Path,
        default=OVERRIDES_PATH,
        help="Path to the overrides YAML.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=REGISTRY_PATH,
        help="Path to write the registry YAML to.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print a diff summary and exit without writing.",
    )
    parser.add_argument(
        "--snapshot-date",
        help="Override the metadata.snapshot_date value (defaults to today).",
    )
    args = parser.parse_args(argv)

    if args.from_file:
        tables = tables_from_file(args.from_file)
        source_label = f"file:{args.from_file}"
    elif args.from_cloudquery:
        tables = tables_from_cloudquery_hub()
        source_label = "cloudquery hub"
    else:
        tables = tables_from_registry(args.out)
        source_label = "existing registry"

    if not tables:
        print(
            "No tables found in the requested source. "
            "Aborting; at least one input must yield a non-empty list.",
            file=sys.stderr,
        )
        return 2

    overrides = load_overrides(args.overrides)
    new_registry = build_registry(tables, overrides, snapshot_date=args.snapshot_date)

    old_registry: dict = {}
    if args.out.exists():
        old_registry = yaml.safe_load(args.out.read_text()) or {}

    print(f"Source: {source_label}  tables={len(tables)}")
    print(diff_summary(old_registry, new_registry))

    if args.dry_run:
        print("\nDry run; not writing.")
        return 0

    args.out.write_text(
        yaml.safe_dump(new_registry, sort_keys=False, default_flow_style=False, width=200)
    )
    print(f"\nWrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

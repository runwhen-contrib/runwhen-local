#!/usr/bin/env python3
"""
Sync ``src/indexers/gcp_resource_type_registry.yaml``.

The registry maps every CloudQuery GCP plugin table to its Cloud Asset
Inventory (CAI) asset type plus metadata used by the native ``gcpapi``
indexer. CAI asset types (``<service>.googleapis.com/<Entity>``) are the join
key for generic discovery, exactly like ARM types are for the Azure indexer.

The data is materialised from three inputs:

1. **A list of CloudQuery GCP table names.** Source of truth for which tables
   exist. Provided either by re-reading the previous registry snapshot
   (default), reading a local file (e.g. ``scripts/gcp/gcp_cloudquery_tables.txt``),
   or fetching the live list from CloudQuery's public hub.

2. **A heuristic** that converts ``gcp_<service>_<entity_plural>`` into
   ``<host>.googleapis.com/<EntitySingularPascal>``. The host segment uses
   ``service_api_hosts`` (a hand-curated dictionary that handles services whose
   API host differs from the table token, e.g. ``sql`` -> ``sqladmin``); the
   entity segment is singularised and PascalCased.

3. **A manual overrides YAML** at
   ``scripts/gcp/gcp_resource_type_overrides.yaml`` that pins the CAI asset
   type, aliases, ``typed_collector`` flag, and ``mandatory`` flag for any
   table whose heuristic value is wrong or where extra metadata is needed.
   Set a ``cai_type_override`` to ``null`` for tables that have no CAI asset
   type (IAM bindings, recommendations, billing...) so generic discovery skips
   them.

Hand-edit the overrides YAML; never hand-edit the registry YAML. After editing
the overrides, re-run this script to regenerate the registry.

Usage:

    # Round-trip the current registry (most common - picks up new overrides
    # without touching the table list):
    python scripts/gcp/sync_gcp_resource_type_registry.py

    # Use a fresh table list from a file:
    python scripts/gcp/sync_gcp_resource_type_registry.py \\
        --from-file scripts/gcp/gcp_cloudquery_tables.txt

    # Fetch the latest list from CloudQuery's public hub:
    python scripts/gcp/sync_gcp_resource_type_registry.py --from-cloudquery

    # Print summary of changes without writing:
    python scripts/gcp/sync_gcp_resource_type_registry.py --dry-run
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
REGISTRY_PATH = REPO_ROOT / "src" / "indexers" / "gcp_resource_type_registry.yaml"
OVERRIDES_PATH = REPO_ROOT / "scripts" / "gcp" / "gcp_resource_type_overrides.yaml"
DEFAULT_TABLES_FILE = REPO_ROOT / "scripts" / "gcp" / "gcp_cloudquery_tables.txt"
CLOUDQUERY_TABLES_URL = (
    "https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/tables"
)


# ---------------------------------------------------------------------------
# Heuristic
# ---------------------------------------------------------------------------

_GCP_TABLE_PREFIX = "gcp_"

# Irregular plural -> singular forms that the rule-based singulariser gets
# wrong. Keep this small; pin anything fancier via cai_type_overrides.
_IRREGULAR_SINGULARS = {
    "addresses": "address",
    "indices": "index",
    "indexes": "index",
    "policies": "policy",
    "proxies": "proxy",
    "registries": "registry",
    "repositories": "repository",
    "gateways": "gateway",
    "schemas": "schema",
    "metadata": "metadata",
    "settings": "setting",
    "series": "series",
}


def _singularize(word: str) -> str:
    """Best-effort English singularisation of a lowercase noun."""
    if not word:
        return word
    if word in _IRREGULAR_SINGULARS:
        return _IRREGULAR_SINGULARS[word]
    if word.endswith("ies") and len(word) > 3:
        return word[:-3] + "y"
    # buses, statuses, addresses, boxes, watches, dishes -> drop "es"
    if re.search(r"(s|x|z|ch|sh)es$", word):
        return word[:-2]
    if word.endswith("ses") and len(word) > 3:
        return word[:-2]  # databases -> database
    if word.endswith("s") and not word.endswith("ss"):
        return word[:-1]
    return word


def _snake_to_pascal(snake: str) -> str:
    """Convert ``foo_bar_baz`` to ``FooBarBaz``. Empty input -> empty output."""
    parts = [p for p in snake.split("_") if p]
    return "".join(p[:1].upper() + p[1:] for p in parts)


def infer_cai_type(
    cloudquery_table: str,
    service_api_hosts: dict[str, str],
) -> Optional[str]:
    """Best-effort heuristic mapping CQ table -> ``<host>.googleapis.com/<Entity>``.

    Returns None if the input doesn't follow the ``gcp_<service>_<entity>``
    shape. The entity segment is singularised (only the trailing token is
    singularised; e.g. ``node_pools`` -> ``NodePool``) and PascalCased.
    """
    if not cloudquery_table.startswith(_GCP_TABLE_PREFIX):
        return None
    rest = cloudquery_table[len(_GCP_TABLE_PREFIX):]
    if "_" not in rest:
        # e.g. "gcp_projects" - no entity segment; treat token as both.
        token = rest
        host = service_api_hosts.get(token, token)
        entity = _snake_to_pascal(_singularize(token))
        return f"{host}.googleapis.com/{entity}" if entity else None

    service_token, entity_snake = rest.split("_", 1)
    host = service_api_hosts.get(service_token, service_token)

    # Singularise only the final word of the entity, then PascalCase the whole.
    entity_parts = entity_snake.split("_")
    entity_parts[-1] = _singularize(entity_parts[-1])
    entity = _snake_to_pascal("_".join(entity_parts))
    if not entity:
        return None
    return f"{host}.googleapis.com/{entity}"


def _category_for(cloudquery_table: str) -> Optional[str]:
    if not cloudquery_table.startswith(_GCP_TABLE_PREFIX):
        return None
    rest = cloudquery_table[len(_GCP_TABLE_PREFIX):]
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
    # cai_type_overrides may legitimately carry null values (tables with no CAI
    # equivalent), so preserve the key set rather than filtering falsy values.
    return {
        "service_api_hosts": payload.get("service_api_hosts") or {},
        "cai_type_overrides": payload.get("cai_type_overrides") or {},
        "aliases": payload.get("aliases") or {},
        # Optional extra accepted names that are NOT functional aliases but
        # should still match this type (rare; aliases already feed match_names).
        "match_names": payload.get("match_names") or {},
        "typed_collectors": set(payload.get("typed_collectors") or []),
        "mandatory": set(payload.get("mandatory") or []),
    }


def _accepted_match_names(
    table_name: str,
    aliases: list,
    extra_match_names: list,
) -> list:
    """Build the explicit accepted-name set emitted into the registry YAML.

    Canonical CloudQuery table name first, then aliases, then any extra
    ``match_names`` overrides; deduplicated, order-preserving. This is the
    set the alias-aware matcher and selective discovery key off, so it must
    include every name generation rules have historically used for the type.
    """
    names: list = [table_name]
    for candidate in [*(aliases or []), *(extra_match_names or [])]:
        if candidate and candidate not in names:
            names.append(candidate)
    return names


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
    # Treat anything else as one-table-name-per-line (comments with '#' ignored).
    tables: set[str] = set()
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        tables.add(line)
    return sorted(tables)


def tables_from_cloudquery_hub(url: str = CLOUDQUERY_TABLES_URL) -> list[str]:
    """Fetch and parse the CloudQuery hub tables page. Best-effort: this is a
    public HTML page and the markup may shift; if parsing fails the caller
    should fall back to --from-file with an explicit table list.
    """
    try:
        from urllib.request import Request, urlopen
    except ImportError:  # pragma: no cover
        raise RuntimeError("urllib is unavailable in this Python build")

    req = Request(url, headers={"User-Agent": "rwl-sync-script/1.0"})
    with urlopen(req, timeout=45) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    tables = sorted(set(re.findall(r"\bgcp_[a-z][a-z0-9_]+\b", html)))
    if not tables:
        raise RuntimeError(
            f"No gcp_* table names found at {url}. The page layout may have "
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
    cai_overrides: dict = overrides["cai_type_overrides"]
    aliases: dict = overrides["aliases"]
    match_names_overrides: dict = overrides["match_names"]
    typed_collectors: set[str] = overrides["typed_collectors"]
    mandatory: set[str] = overrides["mandatory"]
    service_hosts: dict = overrides["service_api_hosts"]

    types: dict[str, dict] = {}
    typed_collector_count = 0
    cai_types_assigned = 0

    for name in sorted(set(table_names)):
        if name in cai_overrides:
            cai_type = cai_overrides[name]
            cai_type_source = "override"
        else:
            cai_type = infer_cai_type(name, service_hosts)
            cai_type_source = "heuristic" if cai_type else None

        is_typed = name in typed_collectors
        is_mandatory = name in mandatory

        if is_typed:
            typed_collector_count += 1
        if cai_type:
            cai_types_assigned += 1

        entry_aliases = list(aliases.get(name, []))
        types[name] = {
            "cai_asset_type": cai_type,
            "cai_asset_type_source": cai_type_source,
            "category": _category_for(name),
            "aliases": entry_aliases,
            "match_names": _accepted_match_names(
                name, entry_aliases, list(match_names_overrides.get(name, []))
            ),
            "typed_collector": is_typed,
            "mandatory": is_mandatory,
        }

    metadata = {
        "source": CLOUDQUERY_TABLES_URL,
        "snapshot_date": snapshot_date or _dt.date.today().isoformat(),
        "total_tables": len(types),
        "typed_collectors": typed_collector_count,
        "cai_types_assigned": cai_types_assigned,
        "generator": "scripts/gcp/sync_gcp_resource_type_registry.py",
        "notes": (
            "Generated file. To change the CAI asset type for a table, edit "
            "scripts/gcp/gcp_resource_type_overrides.yaml and re-run the sync "
            "script. Hand-edits to this file will be overwritten."
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
        # Default: round-trip the existing registry, but bootstrap from the
        # checked-in table list the first time the registry doesn't exist yet.
        tables = tables_from_registry(args.out)
        if tables:
            source_label = "existing registry"
        elif DEFAULT_TABLES_FILE.exists():
            tables = tables_from_file(DEFAULT_TABLES_FILE)
            source_label = f"file:{DEFAULT_TABLES_FILE}"
        else:
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

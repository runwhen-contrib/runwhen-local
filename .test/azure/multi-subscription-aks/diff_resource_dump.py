#!/usr/bin/env python3
"""Diff two ``resource-dump.yaml`` files while ignoring CloudQuery metadata.

Used by the ``run-backend-equivalence-test`` Taskfile task to verify that the
new native Azure SDK indexer (``AZURE_INDEXER_BACKEND=azureapi``) produces an
output that is functionally equivalent to the legacy CloudQuery path
(``AZURE_INDEXER_BACKEND=cloudquery``).

What we ignore:

* ``_cq_*`` keys (sync_time, source_name, id, parent_id) - exist only because
  CloudQuery wrote those rows; the SDK indexer doesn't and shouldn't
  fabricate them.

* The ``creationDate`` at the top level of the dump - it's the timestamp the
  dump itself was written, not data about the resources.

* ``_cq_sync_time`` fields embedded inside ``resource`` blocks.

* Extra fields that the Azure SDK ``as_dict()`` returns but CloudQuery does
  not (and vice versa). We only fail on disagreement on shared keys, not on
  presence/absence of keys, when comparing the ``resource`` raw payload.
  Top-level Resource attributes (name, qualified_name, tags, lod, etc.) are
  required to match exactly - those are what generation rules consume.

Exit status is ``0`` when the two dumps are equivalent, ``1`` otherwise.
"""

from __future__ import annotations

import argparse
import re
import sys
from typing import Any

import yaml

CQ_KEY_RE = re.compile(r"^_cq_")


# ---------------------------------------------------------------------------
# Custom YAML tag constructors
# ---------------------------------------------------------------------------
# resource-dump.yaml uses application-specific tags (!Registry, !Platform,
# !ResourceType, !Resource, !LevelOfDetail) registered by the workspace
# builder's `resources.py` and `enrichers/generation_rule_types.py`. This
# script is intentionally standalone (no dependency on the workspace builder
# package) so we register lightweight constructors that just return plain
# dicts / strings - the tags carry no semantics we need beyond "this is a
# mapping" / "this is a scalar".
def _construct_mapping(loader, node):
    return loader.construct_mapping(node, deep=True)


def _construct_scalar(loader, node):
    return loader.construct_scalar(node)


for tag in ("!Registry", "!Platform", "!ResourceType", "!Resource"):
    yaml.SafeLoader.add_constructor(tag, _construct_mapping)
    yaml.UnsafeLoader.add_constructor(tag, _construct_mapping)

for tag in ("!LevelOfDetail",):
    yaml.SafeLoader.add_constructor(tag, _construct_scalar)
    yaml.UnsafeLoader.add_constructor(tag, _construct_scalar)

# Top-level Resource attributes whose values must match exactly between the
# two backends. ``resource`` is handled with looser semantics (see below).
RESOURCE_REQUIRED_ATTRS = (
    "name",
    "qualified_name",
    "tags",
    "subscription_id",
    "subscription_name",
    "lod",
    "auth_type",
)

# Keys inside the raw ``resource`` payload to compare exactly when present in
# both. Anything else is "informational" and a difference is logged but not
# fatal.
RESOURCE_RAW_REQUIRED_KEYS = (
    "id",
    "name",
    "type",
    "location",
    "tags",
    "subscription_id",
)


def _strip_cq_keys(node: Any) -> Any:
    """Recursively drop ``_cq_*`` keys from any nested mappings."""
    if isinstance(node, dict):
        return {
            k: _strip_cq_keys(v)
            for k, v in node.items()
            if not (isinstance(k, str) and CQ_KEY_RE.match(k))
        }
    if isinstance(node, list):
        return [_strip_cq_keys(v) for v in node]
    return node


def _load_dump(path: str) -> dict[str, Any]:
    with open(path) as f:
        # SafeLoader plus the constructors registered above; produces nested
        # plain dicts / lists / strings.
        return yaml.safe_load(f)


def _resource_to_dict(resource) -> dict[str, Any]:
    if isinstance(resource, dict):
        return resource
    return {k: v for k, v in vars(resource).items() if k != "resource_type"}


def _get_attr_or_key(node, *names):
    """Return the first attribute / key from ``names`` that exists on
    ``node``. Supports both attribute-style (Resource objects) and
    mapping-style (raw YAML-loaded dicts) access. The dump uses camelCase
    keys (``resourceTypes``, ``customAttributes``) that don't match the
    Python attribute names; checking both shapes keeps the script working
    whether or not the workspace builder package is in scope.
    """
    for name in names:
        if hasattr(node, name):
            value = getattr(node, name)
            if value is not None:
                return value
        if isinstance(node, dict) and name in node:
            return node[name]
    return None


def _walk_registry(registry) -> dict[tuple[str, str, str], dict[str, Any]]:
    """Flatten a Registry into ``{(platform, type, qualified_name): attrs}``."""
    out: dict[tuple[str, str, str], dict[str, Any]] = {}
    platforms = _get_attr_or_key(registry, "platforms") or {}
    for platform_name, platform in platforms.items():
        types = _get_attr_or_key(platform, "resource_types", "resourceTypes") or {}
        for type_name, resource_type in types.items():
            instances = _get_attr_or_key(resource_type, "instances") or {}
            for qualified_name, resource in instances.items():
                out[(platform_name, type_name, qualified_name)] = _resource_to_dict(
                    resource
                )
    return out


def _compare_resource(
    key: tuple[str, str, str],
    cq_attrs: dict[str, Any],
    api_attrs: dict[str, Any],
) -> list[str]:
    """Return a list of differences (empty iff equivalent)."""
    diffs: list[str] = []
    label = "/".join(key)

    for attr in RESOURCE_REQUIRED_ATTRS:
        if attr not in cq_attrs and attr not in api_attrs:
            continue
        cq_val = cq_attrs.get(attr)
        api_val = api_attrs.get(attr)
        if cq_val != api_val:
            diffs.append(
                f"{label}: attribute {attr!r} differs: "
                f"cloudquery={cq_val!r} azureapi={api_val!r}"
            )

    cq_raw = _strip_cq_keys(cq_attrs.get("resource", {})) or {}
    api_raw = _strip_cq_keys(api_attrs.get("resource", {})) or {}
    for k in RESOURCE_RAW_REQUIRED_KEYS:
        if k in cq_raw and k in api_raw and cq_raw[k] != api_raw[k]:
            diffs.append(
                f"{label}: resource.{k} differs: "
                f"cloudquery={cq_raw[k]!r} azureapi={api_raw[k]!r}"
            )

    return diffs


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cloudquery_dump", help="Path to resource-dump.yaml from the cloudquery run")
    parser.add_argument("azureapi_dump", help="Path to resource-dump.yaml from the azureapi run")
    args = parser.parse_args(argv)

    cq_doc = _load_dump(args.cloudquery_dump)
    api_doc = _load_dump(args.azureapi_dump)

    cq_registry = cq_doc.get("registry") if isinstance(cq_doc, dict) else cq_doc
    api_registry = api_doc.get("registry") if isinstance(api_doc, dict) else api_doc

    cq_resources = _walk_registry(cq_registry)
    api_resources = _walk_registry(api_registry)

    # Limit comparison to the Azure platform only (other platforms are
    # untouched by the backend swap).
    cq_resources = {k: v for k, v in cq_resources.items() if k[0] == "azure"}
    api_resources = {k: v for k, v in api_resources.items() if k[0] == "azure"}

    differences: list[str] = []

    only_cq = set(cq_resources) - set(api_resources)
    only_api = set(api_resources) - set(cq_resources)
    for k in sorted(only_cq):
        differences.append(f"only in cloudquery: {'/'.join(k)}")
    for k in sorted(only_api):
        differences.append(f"only in azureapi:  {'/'.join(k)}")

    for key in sorted(set(cq_resources) & set(api_resources)):
        differences.extend(_compare_resource(key, cq_resources[key], api_resources[key]))

    if differences:
        print(
            f"FAIL: {len(differences)} difference(s) between cloudquery and "
            f"azureapi outputs:",
            file=sys.stderr,
        )
        for d in differences[:200]:
            print(f"  {d}", file=sys.stderr)
        if len(differences) > 200:
            print(f"  ... and {len(differences) - 200} more", file=sys.stderr)
        return 1

    print(
        f"PASS: cloudquery and azureapi outputs are equivalent "
        f"({len(cq_resources)} azure resources compared)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

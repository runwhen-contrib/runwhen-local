"""Cloud-agnostic, registry-driven resource-type name resolver.

RunWhen Local matches a resource against a generation rule by comparing the
rule's requested ``resourceTypes`` value with the resource's stored
``resource_type``. Historically the native indexers and the rules could
disagree on the *name* of a type (e.g. the indexer stored ``virtual_machine``
while rules asked for ``azure_compute_virtual_machines``; or rules used the Key
Vault SINGULAR ``azure_keyvault_keyvault`` while the canonical CloudQuery table
is the PLURAL ``azure_keyvault_keyvaults``). Such disagreements silently dropped
SLXs even though the resources were discovered.

This module centralizes the fix: it is the single place that knows, per cloud,
the full *accepted-name set* (``match_names``) for a resource type — the
canonical CloudQuery/native name plus every legacy/alias name rules have ever
used. Both the generation-rule matcher and selective discovery resolve names
through here so they stay consistent.

Design contract:

* ``accepted_resource_type_names(platform, requested)`` returns the accepted
  name set for the registry entry that ``requested`` resolves to, or ``None``
  when no cloud registry knows the name. ``None`` is the signal that the type
  is NOT a cloud type the registries cover — Kubernetes resource types, custom
  resource types, and the ``azure_devops`` platform — in which case the caller
  MUST fall back to plain exact-string matching, preserving existing behavior.

* Lookups are cheap (each registry builds an in-memory name index once and
  caches it) and never raise: any unexpected error degrades to ``None`` (exact
  match), so a registry problem can never break k8s/custom matching.

* Registry modules are imported lazily so importing this module never pulls in
  cloud SDKs.
"""

from __future__ import annotations

from typing import Callable, Optional


# Per-platform finder: takes a requested type name and returns a registry entry
# exposing a ``match_names`` attribute, or None. Imports are deferred to the
# call so this module stays import-light and SDK-free.
def _azure_finder(name: str):
    from indexers.azure_resource_type_registry import find_entry

    return find_entry(name)


def _gcp_finder(name: str):
    from indexers.gcp_resource_type_registry import find_entry

    return find_entry(name)


def _aws_finder(name: str):
    from indexers.aws_resource_type_registry import find_entry

    return find_entry(name)


# Keyed by the platform name used throughout the enrichers/indexers
# (``AZURE_PLATFORM`` etc.). Platforms NOT present here — Kubernetes,
# ``azure_devops``, and any custom platform — intentionally have no registry
# and therefore always fall back to exact-string matching.
_REGISTRY_FINDERS: dict[str, Callable[[str], object]] = {
    "azure": _azure_finder,
    "gcp": _gcp_finder,
    "aws": _aws_finder,
}


def is_registry_backed(platform_name: str) -> bool:
    """True if ``platform_name`` has a cloud resource-type registry."""
    return platform_name in _REGISTRY_FINDERS


def accepted_resource_type_names(
    platform_name: str,
    requested_name: str,
) -> Optional[tuple[str, ...]]:
    """Return the accepted-name set for ``requested_name`` on ``platform_name``.

    The accepted-name set is the canonical CloudQuery/native name plus every
    legacy/alias name registered for the same type (the registry's
    ``match_names``). It is what makes matching alias-aware: a resource matches
    a rule if the rule's requested name is in the resource's accepted-name set,
    regardless of which of those names the resource happens to be stored under.

    Returns ``None`` when:
      * the platform has no cloud registry (Kubernetes, azure_devops, custom), or
      * the registry has no entry for ``requested_name`` (typo, or a type the
        registry doesn't cover yet).

    In both cases the caller should fall back to exact-string equality against
    the requested name — this is what keeps k8s/custom types and not-yet-
    registered names working unchanged.
    """
    if not requested_name:
        return None
    finder = _REGISTRY_FINDERS.get(platform_name)
    if finder is None:
        return None
    try:
        entry = finder(requested_name)
    except Exception:
        # A registry load/parse problem must never break matching; degrade to
        # exact-string matching by signaling "unknown".
        return None
    if entry is None:
        return None
    names = getattr(entry, "match_names", None) or getattr(entry, "known_names", lambda: ())()
    if not names:
        return None
    return tuple(names)


def resolve_lookup_names(
    platform_name: str,
    requested_name: str,
) -> tuple[str, ...]:
    """Names to look up in the resource registry for ``requested_name``.

    Convenience wrapper around :func:`accepted_resource_type_names` that always
    returns a non-empty tuple: the accepted-name set when the type is known to a
    cloud registry, otherwise just ``(requested_name,)`` for exact-string
    fallback (k8s/custom/unknown).
    """
    accepted = accepted_resource_type_names(platform_name, requested_name)
    if accepted:
        return accepted
    return (requested_name,)

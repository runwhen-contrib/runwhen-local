"""
Shared AWS helper functions used by the native AWS SDK indexer (``awsapi.py``).

This is the lowest layer of AWS-specific logic the native indexer relies on:
credential / scope resolution, label-based tag filtering, and region resolution.
Nothing here knows about CloudQuery internals.

Authentication reuses the resolution order the existing AWS code already uses
(``aws_utils.get_aws_credential`` -- explicit keys, K8s secret, IRSA / Pod
Identity, assume-role, or the default credential chain) and returns a
``boto3.Session`` suitable for the Cloud Control client and the typed boto3
service clients, plus the resolved account id / alias / name map and the region
list.

``boto3`` / ``aws_utils`` are imported lazily inside the functions that need
them so this module (and its filter / region helpers) stays importable in
environments without ``boto3`` installed -- the same lazy-import discipline the
GCP and Azure typed collectors follow.
"""

from __future__ import annotations

import logging
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Label / tag filtering helpers
# ---------------------------------------------------------------------------
#
# CloudQuery rows expose user tags under ``tags`` (the indexer copies AWS tags
# into ``tags`` during normalization so the same include/exclude matchers work
# across every cloud). These helpers therefore read ``tags`` and match exactly
# like their Azure / GCP counterparts.

def has_included_tags(resource_data: dict, include_tags: dict[str, str]) -> bool:
    """Return True if any of ``include_tags`` is present in ``resource_data``."""
    tags = resource_data.get("tags", {}) or {}
    return any(tags.get(key) == value for key, value in include_tags.items())


def has_excluded_tags(resource_data: dict, exclude_tags: dict[str, str]) -> bool:
    """Return True if any of ``exclude_tags`` is present in ``resource_data``."""
    tags = resource_data.get("tags", {}) or {}
    for key, value in exclude_tags.items():
        if tags.get(key) == value:
            logger.info(
                f"Excluding resource {resource_data.get('name', 'unknown')} "
                f"due to tag '{key}: {value}'"
            )
            return True
    return False


# ---------------------------------------------------------------------------
# Region resolution
# ---------------------------------------------------------------------------

def resolve_regions(platform_cfg: dict[str, Any], default_region: Optional[str] = None) -> list[str]:
    """Resolve the list of AWS regions to discover.

    Resolution order:
        1. ``regions`` (list, or comma-separated string) in the aws config.
        2. ``region`` / ``defaultRegion`` (single).
        3. ``default_region`` arg (e.g. the credential's region).
        4. ``AWS_REGION`` / ``AWS_DEFAULT_REGION`` env vars.
        5. ``us-east-1`` as a last resort.

    De-dupes while preserving order.
    """
    raw_regions: list[str] = []
    cfg_regions = platform_cfg.get("regions")
    if isinstance(cfg_regions, str):
        raw_regions = [r.strip() for r in cfg_regions.split(",") if r.strip()]
    elif isinstance(cfg_regions, (list, tuple)):
        raw_regions = [str(r).strip() for r in cfg_regions if str(r).strip()]

    if not raw_regions:
        single = platform_cfg.get("region") or platform_cfg.get("defaultRegion")
        if single:
            raw_regions = [str(single).strip()]

    if not raw_regions and default_region:
        raw_regions = [str(default_region).strip()]

    if not raw_regions:
        env_region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
        if env_region:
            raw_regions = [env_region.strip()]

    if not raw_regions:
        raw_regions = ["us-east-1"]

    seen: set[str] = set()
    out: list[str] = []
    for region in raw_regions:
        if region and region not in seen:
            seen.add(region)
            out.append(region)
    return out


# ---------------------------------------------------------------------------
# Credentials + scope (account + regions)
# ---------------------------------------------------------------------------

def aws_has_discovery_config(platform_cfg: dict[str, Any]) -> bool:
    """Return True when the aws config block is present.

    AWS always discovers at least the authenticated account, and credentials
    can come from the ambient credential chain (instance profile / IRSA / Pod
    Identity), so the mere presence of an ``aws`` config section is enough; we
    don't require explicit keys.
    """
    return bool(platform_cfg)


def aws_get_session_and_scope(platform_cfg: dict[str, Any]) -> dict[str, Any]:
    """Resolve an AWS session + the discovery scope (account + regions).

    Returns a dict with:
        session        - a ``boto3.Session`` for the Cloud Control + typed
                         service clients.
        account_id     - the authenticated account id (str or None).
        account_alias  - IAM account alias if set (str or None).
        account_name   - human-readable account name (falls back to id).
        account_names  - {account_id: account_name} map (consumed by the
                         AWSPlatformHandler via ``platform_config_data``).
        regions        - list[str] of regions to discover.
        auth_type      - resolved auth type (e.g. ``aws_explicit``).
        auth_secret    - K8s secret name if secret-based auth was used.
        region         - the primary (credential) region.
    """
    # Lazy import so this module stays importable without boto3.
    from aws_utils import (  # noqa: WPS433
        get_account_alias,
        get_account_id,
        get_account_name,
        get_aws_credential,
    )

    workspace_info = {"cloudConfig": {"aws": platform_cfg}}
    session, region, _akid, _sak, _stkn, auth_type, auth_secret = get_aws_credential(
        workspace_info
    )

    account_id = get_account_id(session)
    account_alias = get_account_alias(session)
    account_name = get_account_name(
        session, account_id=account_id, account_alias=account_alias
    )

    account_names: dict[str, str] = {}
    if account_id:
        account_names[str(account_id)] = account_name

    # Resolve names for any additional configured accounts (multi-account).
    for acct_cfg in platform_cfg.get("accounts", []) or []:
        if not isinstance(acct_cfg, dict):
            continue
        extra_id = str(acct_cfg.get("id") or acct_cfg.get("accountId") or "").strip()
        if extra_id and extra_id not in account_names:
            try:
                account_names[extra_id] = get_account_name(session, account_id=extra_id)
            except Exception:  # pragma: no cover - best-effort cross-account name
                account_names[extra_id] = extra_id

    regions = resolve_regions(platform_cfg, default_region=region)

    return {
        "session": session,
        "account_id": account_id,
        "account_alias": account_alias,
        "account_name": account_name,
        "account_names": account_names,
        "regions": regions,
        "auth_type": auth_type,
        "auth_secret": auth_secret,
        "region": region,
    }

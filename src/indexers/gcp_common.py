"""
Shared GCP helper functions used by both the legacy CloudQuery-based GCP
indexer (``cloudquery.py``) and the native GCP SDK indexer (``gcpapi.py``).

This is the lowest layer of GCP-specific logic that both indexers share:
credential / project resolution, label-based tag filtering, and per-project
level-of-detail resolution. Nothing here knows about CloudQuery internals.

Authentication mirrors the resolution order CloudQuery already uses
(``gcp_get_credentials_and_project_ids`` in ``cloudquery.py``) but returns a
``google.auth`` credentials object suitable for the Cloud Asset Inventory and
typed ``google-cloud-*`` clients instead of shelling out to ``gcloud``:

  1. Kubernetes secret (``saSecretName`` -> ``serviceAccountKey`` base64) .
  2. Inline service-account key (``serviceAccountKey``) or an already-decoded
     credentials file path (``applicationCredentialsFile``).
  3. Application Default Credentials (ADC) - the env the pod/host already has.

Project IDs come from ``projects`` (list or comma-separated string),
``projectId``, or the ``GOOGLE_CLOUD_PROJECT`` / ``GCP_PROJECT`` env vars.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import sys
import tempfile
from typing import Any, Optional

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from k8s_utils import get_secret  # noqa: E402

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Label / tag filtering helpers
# ---------------------------------------------------------------------------
#
# CloudQuery rows expose user labels under ``tags`` (the indexer copies GCP
# ``labels`` into ``tags`` during normalization so the same include/exclude
# matchers work across every cloud). These helpers therefore read ``tags`` and
# match exactly like their Azure counterparts.

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
                f"due to label '{key}: {value}'"
            )
            return True
    return False


# ---------------------------------------------------------------------------
# Credentials + projects
# ---------------------------------------------------------------------------

def _normalize_projects(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [p.strip() for p in value.split(",") if p.strip()]
    if isinstance(value, (list, tuple)):
        out: list[str] = []
        for item in value:
            if isinstance(item, dict):
                pid = item.get("projectId") or item.get("project_id") or item.get("id")
                if pid:
                    out.append(str(pid).strip())
            elif item:
                out.append(str(item).strip())
        return out
    return [str(value).strip()]


def _service_account_key_to_credentials(key_text: str):
    """Build a ``google.oauth2.service_account.Credentials`` from JSON text.

    Imported lazily so the module (and its filter helpers / LOD helpers) stays
    importable in environments without ``google-auth`` installed - the same
    lazy-import discipline the Azure typed collectors follow.
    """
    from google.oauth2 import service_account  # noqa: WPS433 (lazy import)

    info = json.loads(key_text)
    return service_account.Credentials.from_service_account_info(
        info,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )


def gcp_get_credentials_and_projects(platform_config_data: dict[str, Any]) -> dict[str, Any]:
    """Resolve GCP credentials + the project IDs to discover.

    Returns a dict with:
        credentials   - a ``google.auth`` credentials object, or ``None`` when
                        falling back to Application Default Credentials (the
                        Cloud Asset client picks ADC up automatically).
        project_ids   - list[str] of project IDs to index.
        quota_project - the project used for billing/quota (first project).
        env           - dict of env vars to set so other code paths
                        (``enrichers.gcp``, gcloud subprocesses) agree on the
                        active credentials/project.
    """
    credentials = None
    env: dict[str, str] = {}

    sa_secret_name = platform_config_data.get("saSecretName")
    service_account_key = platform_config_data.get("serviceAccountKey")
    project_id_hint = platform_config_data.get("projectId")

    if sa_secret_name:
        secret = get_secret(sa_secret_name)
        if secret:
            if not service_account_key and secret.get("serviceAccountKey"):
                service_account_key = base64.b64decode(
                    secret["serviceAccountKey"]
                ).decode("utf-8")
            if not project_id_hint and secret.get("projectId"):
                project_id_hint = base64.b64decode(secret["projectId"]).decode("utf-8")

    # An already-decoded credentials file (GCPPlatformHandler.transform_cloud_config
    # writes the base64 applicationCredentialsFile out to a temp path).
    app_creds_file = platform_config_data.get("applicationCredentialsFile")

    if service_account_key:
        # ``serviceAccountKey`` may arrive base64-encoded or as raw JSON.
        key_text = service_account_key
        if not key_text.lstrip().startswith("{"):
            try:
                key_text = base64.b64decode(service_account_key).decode("utf-8")
            except Exception:
                key_text = service_account_key
        try:
            credentials = _service_account_key_to_credentials(key_text)
        except Exception as e:  # pragma: no cover - defensive
            logger.warning(f"Failed to build SA credentials from serviceAccountKey: {e}")
        else:
            # Write the key to a temp file so gcloud / ADC consumers agree.
            fd, tmp_path = tempfile.mkstemp(prefix="gcp-sa-", suffix=".json")
            with os.fdopen(fd, "w") as fh:
                fh.write(key_text)
            env["GOOGLE_APPLICATION_CREDENTIALS"] = tmp_path
    elif app_creds_file and os.path.exists(app_creds_file):
        try:
            with open(app_creds_file, "r", encoding="utf-8") as fh:
                credentials = _service_account_key_to_credentials(fh.read())
        except Exception as e:  # pragma: no cover - defensive
            logger.warning(
                f"Failed to load SA credentials from applicationCredentialsFile: {e}"
            )
        env["GOOGLE_APPLICATION_CREDENTIALS"] = app_creds_file

    # Resolve the project list.
    project_ids = _normalize_projects(platform_config_data.get("projects"))
    if not project_ids and project_id_hint:
        project_ids = [str(project_id_hint)]
    if not project_ids:
        for env_var in ("GOOGLE_CLOUD_PROJECT", "GCP_PROJECT"):
            val = os.getenv(env_var)
            if val:
                project_ids = [val]
                break

    # De-dupe, preserve order.
    seen: set[str] = set()
    deduped: list[str] = []
    for pid in project_ids:
        if pid and pid not in seen:
            seen.add(pid)
            deduped.append(pid)
    project_ids = deduped

    quota_project = project_ids[0] if project_ids else project_id_hint
    if quota_project:
        env.setdefault("GOOGLE_CLOUD_PROJECT", quota_project)

    return {
        "credentials": credentials,
        "project_ids": project_ids,
        "quota_project": quota_project,
        "env": env,
    }


def gcp_has_discovery_config(platform_cfg: dict[str, Any]) -> bool:
    """Return True when the gcp config block has enough to discover resources.

    We need at least one project to scope discovery to; credentials may come
    from ADC, so their absence isn't disqualifying.
    """
    if not platform_cfg:
        return False
    if _normalize_projects(platform_cfg.get("projects")):
        return True
    if platform_cfg.get("projectId"):
        return True
    if os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT"):
        return True
    return False


# ---------------------------------------------------------------------------
# Auth-type derivation (for auth templates)
# ---------------------------------------------------------------------------

def get_gcp_auth_type(platform_config_data: dict[str, Any]) -> tuple[Optional[str], Optional[str]]:
    """Determine the auth type + secret for use with the gcp-auth template.

    Returns ``(auth_type, auth_secret)``.
    """
    if platform_config_data.get("saSecretName"):
        return "gcp_service_account_secret", platform_config_data.get("saSecretName")
    if platform_config_data.get("serviceAccountKey") or platform_config_data.get(
        "applicationCredentialsFile"
    ):
        return "gcp_service_account", None
    return "gcp_adc", None

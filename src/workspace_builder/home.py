"""Landing page for the RunWhen Local web UI.

Serves a single-page HTML view at ``/`` that orients operators around what
the workspace builder is doing right now:

* Quick links to the Workspace Explorer (and, in the future, troubleshooting
  tools and other product surfaces).
* The most recent discovery run -- status, duration, SLX count, warnings -- as
  reported by the health tracker.
* A summary of the persisted resource store (platforms, resource counts,
  artifact counts) pulled from the explorer's read-only API.
* A redacted view of ``workspaceInfo.yaml`` so an operator can confirm what
  configuration the running pod is actually using without having to ``kubectl
  exec`` into the container.

The page is intentionally a thin static HTML + vanilla JS shell over JSON
endpoints already exposed by the service, mirroring the explorer module's
pattern so we don't take on a frontend toolchain dependency.
"""

from __future__ import annotations

import logging
import os
import re
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from .resource_store_reader import (
    get_store_summary,
    list_slx_bundles,
    resource_db_connection,
    resolve_resource_db_path,
)
from .health import get_health_tracker

logger = logging.getLogger(__name__)

router = APIRouter(tags=["home"])

_UI_PATH = Path(__file__).with_name("home.html")
_DEFAULT_WORKSPACE_INFO_PATHS = (
    "/shared/workspaceInfo.yaml",
    "workspaceInfo.yaml",
)

# Keys whose values are always masked when we expose a redacted view of
# ``workspaceInfo.yaml``. The match is case-insensitive and substring-based so
# we cover ``clientSecret``, ``authToken``, ``sp_secret_name`` (just in case),
# ``apiKey``, ``GOOGLE_APPLICATION_CREDENTIALS``, etc.
_SENSITIVE_KEY_FRAGMENTS = (
    "secret",
    "token",
    "password",
    "passwd",
    "credential",
    "api_key",
    "apikey",
    "private_key",
    "privatekey",
    "client_secret",
    "clientsecret",
    "ssh_key",
    "sshkey",
)

_REDACTED = "***REDACTED***"


def _is_sensitive_key(key: Any) -> bool:
    if not isinstance(key, str):
        return False
    lowered = key.lower()
    return any(fragment in lowered for fragment in _SENSITIVE_KEY_FRAGMENTS)


def redact_workspace_info(value: Any, *, _depth: int = 0) -> Any:
    """Recursively replace sensitive values in a workspaceInfo.yaml tree.

    A value is masked when its **key** matches any of the sensitive
    fragments (case-insensitive substring match). Non-string leaves under a
    sensitive key are still replaced so we don't accidentally leak a base64
    blob. ``_depth`` bounds recursion against malicious / cyclic input.
    """
    if _depth > 50:
        return value
    if isinstance(value, dict):
        result = {}
        for k, v in value.items():
            if _is_sensitive_key(k) and v not in (None, ""):
                result[k] = _REDACTED
            else:
                result[k] = redact_workspace_info(v, _depth=_depth + 1)
        return result
    if isinstance(value, list):
        return [redact_workspace_info(v, _depth=_depth + 1) for v in value]
    return value


def _resolve_workspace_info_path() -> Optional[Path]:
    explicit = os.getenv("RW_WORKSPACE_INFO_PATH", "").strip()
    candidates: list[str] = []
    if explicit:
        candidates.append(explicit)
    candidates.extend(_DEFAULT_WORKSPACE_INFO_PATHS)
    for candidate in candidates:
        path = Path(candidate)
        if path.is_file():
            return path
    return None


def _load_workspace_info_safely() -> dict[str, Any]:
    """Return a redacted summary of the active workspaceInfo.yaml.

    Always returns a dict — operators can spot missing-file / parse-error
    states from the ``error`` field, but the rest of the landing page still
    renders.
    """
    path = _resolve_workspace_info_path()
    if path is None:
        candidates = []
        explicit = os.getenv("RW_WORKSPACE_INFO_PATH", "").strip()
        if explicit:
            candidates.append(f"{explicit} (from $RW_WORKSPACE_INFO_PATH)")
        candidates.extend(_DEFAULT_WORKSPACE_INFO_PATHS)
        return {
            "path": None,
            "error": (
                "workspaceInfo.yaml not found. Looked at: "
                + ", ".join(candidates)
                + ". Set $RW_WORKSPACE_INFO_PATH to override."
            ),
        }
    try:
        import yaml as _yaml  # local import — keeps the module importable in
                              # environments where PyYAML isn't pulled in
        text = path.read_text(encoding="utf-8")
        parsed = _yaml.safe_load(text) or {}
    except Exception as exc:  # noqa: BLE001 - surface parse errors verbatim
        return {
            "path": str(path),
            "error": f"Could not parse workspaceInfo.yaml: {exc}",
        }
    redacted = redact_workspace_info(parsed)
    summary = _summarize_workspace_info(redacted if isinstance(redacted, dict) else {})
    return {
        "path": str(path),
        "summary": summary,
        "redacted": redacted,
    }


def _summarize_workspace_info(data: dict[str, Any]) -> dict[str, Any]:
    """Extract operator-relevant top-level fields for the dashboard card."""
    cloud_config = data.get("cloudConfig") or {}
    platforms = []
    if isinstance(cloud_config, dict):
        for name in ("azure", "gcp", "aws", "kubernetes"):
            if name in cloud_config and cloud_config.get(name):
                platforms.append(name)
        # Surface any custom cloudConfig key beyond the known ones.
        for name in cloud_config:
            if name not in platforms and name in cloud_config:
                if cloud_config.get(name):
                    platforms.append(name)
    code_collections = data.get("codeCollections")
    cc_summary: list[dict[str, Any]] = []
    if isinstance(code_collections, list):
        for entry in code_collections:
            if isinstance(entry, str):
                cc_summary.append({"repoURL": entry})
            elif isinstance(entry, dict):
                cc_summary.append(
                    {
                        "repoURL": entry.get("repoURL") or entry.get("repo_url"),
                        "branch": entry.get("branch") or entry.get("ref")
                        or entry.get("tag"),
                        "action": entry.get("action", "include"),
                    }
                )
    azure_backend = data.get("azureIndexerBackend")
    gcp_backend = data.get("gcpIndexerBackend")
    aws_backend = data.get("awsIndexerBackend")
    return {
        "workspaceName": data.get("workspaceName"),
        "workspaceOwnerEmail": data.get("workspaceOwnerEmail"),
        "defaultLOD": data.get("defaultLOD") or data.get("defaultLevelOfDetail"),
        "useLocalGit": data.get("useLocalGit"),
        "platforms": platforms,
        "codeCollections": cc_summary,
        "indexerBackends": {
            "azure": azure_backend,
            "gcp": gcp_backend,
            "aws": aws_backend,
        },
    }


def _store_overview() -> dict[str, Any]:
    """Return a tolerant snapshot of the resource store, or an ``error`` field
    when discovery has not yet populated the DB."""
    try:
        with resource_db_connection() as conn:
            summary = get_store_summary(conn)
            bundles = list_slx_bundles(conn, limit=200, offset=0)
            recent = []
            for bundle in bundles.get("items", [])[:5]:
                recent.append(
                    {
                        "display_name": bundle.get("display_name"),
                        "slx_name": bundle.get("slx_name"),
                        "workspace_name": bundle.get("workspace_name"),
                        "kinds": bundle.get("kinds"),
                    }
                )
            return {
                "db_path": str(resolve_resource_db_path()),
                "platform_count": summary.get("platform_count"),
                "resource_type_count": summary.get("resource_type_count"),
                "resource_count": summary.get("resource_count"),
                "artifact_count": summary.get("artifact_count"),
                "platforms": summary.get("platforms", []),
                "slx_bundle_count": bundles.get("total", 0),
                "recent_slx_bundles": recent,
            }
    except FileNotFoundError as exc:
        return {"error": str(exc)}
    except Exception as exc:  # noqa: BLE001 - surface DB errors verbatim
        logger.exception("Failed to load resource store summary")
        return {"error": f"Could not read resource store: {exc}"}


def _last_run_overview() -> dict[str, Any]:
    """Best-effort wrapper around the health tracker."""
    try:
        tracker = get_health_tracker()
        info = tracker.get_health_info()
        last_run = None
        if info.last_run:
            last_run = {
                "status": info.last_run.status,
                "start_time": info.last_run.start_time,
                "end_time": info.last_run.end_time,
                "duration_seconds": info.last_run.duration_seconds,
                "slx_count": info.last_run.slx_count,
                "warnings_count": info.last_run.warnings_count,
                "parsing_errors_count": info.last_run.parsing_errors_count,
                "components_run": info.last_run.components_run,
                "current_stage": info.last_run.current_stage,
                "current_component": info.last_run.current_component,
                "error_message": info.last_run.error_message,
            }
        return {
            "service_status": info.service_status,
            "service_start_time": info.service_start_time,
            "uptime_seconds": info.uptime_seconds,
            "is_healthy": tracker.is_healthy(),
            "is_ready": tracker.is_ready(),
            "last_run": last_run,
        }
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to load health tracker overview")
        return {"error": f"Could not read health tracker: {exc}"}


@router.get("/", response_class=HTMLResponse, include_in_schema=False)
def home_page() -> HTMLResponse:
    return HTMLResponse(_UI_PATH.read_text(encoding="utf-8"))


@router.get("/api/overview")
def overview() -> dict[str, Any]:
    """Aggregated landing-page payload.

    Intentionally lenient: every section returns its own ``error`` field
    rather than failing the whole request, so a partially-broken environment
    (e.g. discovery has never run) still produces a useful dashboard.
    """
    from utils import get_version_info

    return {
        "version": get_version_info(),
        "health": _last_run_overview(),
        "resource_store": _store_overview(),
        "workspace_info": _load_workspace_info_safely(),
    }

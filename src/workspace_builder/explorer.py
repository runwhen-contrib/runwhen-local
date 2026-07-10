"""Basic HTML/JSON explorer for the SQLite resource store."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse

from .resource_store_reader import (
    count_resources,
    get_store_summary,
    json_safe,
    list_slx_bundles,
    resource_db_connection,
    resolve_resource_db_path,
    search_resources,
)
from indexers.sqlite_resource_writer import (
    count_workspace_artifacts,
    get_resource,
    get_workspace_artifact,
    list_resource_types,
    search_workspace_artifacts,
)

router = APIRouter(prefix="/explorer", tags=["resource-explorer"])

_UI_PATH = Path(__file__).with_name("explorer.html")


def _build_tree(conn) -> list[dict[str, Any]]:
    tree: list[dict[str, Any]] = []
    for platform in get_store_summary(conn)["platforms"]:
        types = list_resource_types(conn, platform=platform)
        platform_count = count_resources(conn, platform=platform)
        type_nodes = []
        for resource_type in types:
            type_count = count_resources(
                conn, platform=platform, resource_type=resource_type["name"]
            )
            type_nodes.append(
                {
                    "name": resource_type["name"],
                    "count": type_count,
                    "custom_attributes": resource_type["custom_attributes"],
                }
            )
        tree.append(
            {
                "name": platform,
                "count": platform_count,
                "resource_types": type_nodes,
            }
        )
    return tree


@router.get("/", response_class=HTMLResponse)
def explorer_page() -> HTMLResponse:
    return HTMLResponse(_UI_PATH.read_text(encoding="utf-8"))


@router.get("/api/summary")
def explorer_summary() -> dict[str, Any]:
    try:
        with resource_db_connection() as conn:
            summary = get_store_summary(conn)
            return {
                **summary,
                "db_path": str(resolve_resource_db_path()),
                "tree": _build_tree(conn),
            }
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/api/resources")
def explorer_resources(
    platform: Optional[str] = None,
    resource_type: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    try:
        with resource_db_connection() as conn:
            total = count_resources(conn, platform=platform, resource_type=resource_type, q=q)
            items = search_resources(
                conn,
                platform=platform,
                resource_type=resource_type,
                q=q,
                limit=limit,
                offset=offset,
            )
            return {
                "total": total,
                "limit": limit,
                "offset": offset,
                "items": json_safe(items),
            }
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/api/resource")
def explorer_resource(
    platform: str,
    resource_type: str,
    qualified_name: str,
) -> dict[str, Any]:
    try:
        with resource_db_connection() as conn:
            resource = get_resource(conn, platform, resource_type, qualified_name)
            if resource is None:
                raise HTTPException(status_code=404, detail="Resource not found")
            return json_safe(resource)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/api/artifacts")
def explorer_artifacts(
    workspace_name: Optional[str] = None,
    artifact_kind: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    try:
        with resource_db_connection() as conn:
            total = count_workspace_artifacts(
                conn,
                workspace_name=workspace_name,
                artifact_kind=artifact_kind,
                q=q,
            )
            items = search_workspace_artifacts(
                conn,
                workspace_name=workspace_name,
                artifact_kind=artifact_kind,
                q=q,
                limit=limit,
                offset=offset,
            )
            preview = []
            for item in items:
                row = dict(item)
                content = row.pop("content", "")
                row["content_preview"] = content[:240] + ("..." if len(content) > 240 else "")
                preview.append(row)
            return {
                "total": total,
                "limit": limit,
                "offset": offset,
                "items": json_safe(preview),
            }
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/api/artifact")
def explorer_artifact(
    workspace_name: str,
    relative_path: str,
) -> dict[str, Any]:
    try:
        with resource_db_connection() as conn:
            artifact = get_workspace_artifact(conn, workspace_name, relative_path)
            if artifact is None:
                raise HTTPException(status_code=404, detail="Artifact not found")
            return json_safe(artifact)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/api/slx-bundles")
def explorer_slx_bundles(
    workspace_name: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    """Group rendered artifacts by SLX directory.

    Each bundle includes the SLX, SLI and runbook files that share an
    ``slx_directory``. Useful for browsing the rendered workspace by SLX
    rather than by individual file.
    """
    try:
        with resource_db_connection() as conn:
            data = list_slx_bundles(
                conn,
                workspace_name=workspace_name,
                q=q,
                limit=limit,
                offset=offset,
            )
            return json_safe(data)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

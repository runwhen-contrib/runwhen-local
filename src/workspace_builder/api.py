"""FastAPI application for the workspace-builder REST service."""

from __future__ import annotations

import logging
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from component import Stage, get_all_settings
from utils import get_version_info

from . import startup
from .exceptions import build_error_response
from .explorer import router as explorer_router
from .home import router as home_router
from .mcp.server import build_mcp_lifespan, build_streamable_http_app, is_mcp_enabled
from .models import InfoResult
from .run_handler import execute_run
from .serialization import serialize_info, serialize_run_result

startup.bootstrap()

logger = logging.getLogger("workspace_builder")

# The MCP server's Streamable HTTP transport runs a session manager whose
# lifecycle is exposed as an ASGI lifespan. FastAPI does not propagate
# nested-mount lifespans automatically, so we wire the MCP session
# manager into the parent app's lifespan explicitly. Without this, every
# JSON-RPC call into the mounted ``/mcp`` endpoint would fail with
# "Task group is not initialized". ``is_mcp_enabled()`` lets operators
# opt out via ``RW_MCP_DISABLED=true`` while keeping the rest of the
# server running.
_mcp_lifespan = build_mcp_lifespan() if is_mcp_enabled() else None

app = FastAPI(title="RunWhen Local Workspace Builder", lifespan=_mcp_lifespan)
# ``home_router`` owns ``GET /`` (the landing page) plus ``GET /api/overview``;
# include it before ``explorer_router`` so the root path resolves to the home
# page rather than 404.
app.include_router(home_router)
app.include_router(explorer_router)
app.mount(
    "/static",
    StaticFiles(directory=str(Path(__file__).resolve().parent / "static")),
    name="static",
)

if _mcp_lifespan is not None:
    # JSON-RPC endpoint reachable at ``http://<host>:8000/mcp``. Inside
    # the FastMCP server we configured ``streamable_http_path="/"``, so
    # the mount path is the only thing clients need to point at.
    app.mount("/mcp", build_streamable_http_app())
    logger.info("MCP server mounted at /mcp (set RW_MCP_DISABLED=true to disable)")
else:
    logger.info("MCP server disabled via RW_MCP_DISABLED")

# ---------------------------------------------------------------------------
# /run/ concurrency guard — the health tracker state file, combined kubeconfig
# (~/.kube/gke-kubeconfig), and per-run resources are not designed for
# overlapping discovery runs. A single non-reentrant module-level lock
# serialises /run/ so a second request returns 503 immediately instead of
# racing on shared state.
# ---------------------------------------------------------------------------
_run_lock = threading.Lock()


@app.get("/info/")
def info() -> dict[str, Any]:
    settings = get_all_settings()
    version_info = get_version_info()
    result = InfoResult(
        version_info["version"],
        version_info["name"],
        Stage.INDEXER.components,
        Stage.ENRICHER.components,
        Stage.RENDERER.components,
        settings,
    )
    return serialize_info(result)


@app.post("/run/")
async def run(request: Request) -> dict[str, Any]:
    request_data = await request.json()
    # Serialise /run/ calls — overlapping discovery/rendering races on the
    # health tracker state file, combined kubeconfig (~/.kube/), and
    # per-run resource registry. A second request returns 503.
    if not _run_lock.acquire(blocking=False):
        return JSONResponse(
            status_code=503,
            content={"detail": "A workspace build is already running; try again later."},
        )
    try:
        # execute_run is a long-running synchronous call (discovery +
        # rendering can take minutes). Running it in the event loop would
        # block /health/ and other endpoints, causing the liveness probe
        # to kill the pod. Delegate to a thread so the event loop stays
        # responsive.
        import asyncio
        result = await asyncio.to_thread(execute_run, request_data)
        return serialize_run_result(result)
    finally:
        _run_lock.release()


@app.get("/health/")
def health() -> dict[str, Any]:
    try:
        from .health import get_health_tracker

        health_tracker = get_health_tracker()
        health_info = health_tracker.get_health_info()
        is_healthy = health_tracker.is_healthy()
        is_ready = health_tracker.is_ready()

        response_data: dict[str, Any] = {
            "status": health_info.service_status,
            "service_start_time": health_info.service_start_time,
            "uptime_seconds": health_info.uptime_seconds,
            "is_healthy": is_healthy,
            "is_ready": is_ready,
        }

        if health_info.last_run:
            last_run = health_info.last_run
            response_data["last_run"] = {
                "start_time": last_run.start_time,
                "end_time": last_run.end_time,
                "status": last_run.status,
                "error_message": last_run.error_message,
                "stacktrace": last_run.stacktrace,
                "warnings_count": last_run.warnings_count,
                "parsing_errors_count": last_run.parsing_errors_count,
                "components_run": last_run.components_run,
                "current_stage": last_run.current_stage,
                "current_component": last_run.current_component,
                "slx_count": last_run.slx_count,
                "duration_seconds": last_run.duration_seconds,
            }

        return response_data
    except Exception as exc:
        print(f"Warning: Health tracker failed: {exc}")
        import traceback

        traceback.print_exc()
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_healthy": True,
            "is_ready": True,
            "error": str(exc),
        }


@app.exception_handler(Exception)
async def workspace_builder_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    body: dict[str, Any] | None = None
    try:
        body = await request.json()
    except Exception:
        pass
    payload, status_code = build_error_response(exc, request.url.path, body)
    return JSONResponse(status_code=status_code, content=payload)

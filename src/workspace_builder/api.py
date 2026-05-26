"""FastAPI application for the workspace-builder REST service."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from component import Stage, get_all_settings
from utils import get_version_info

from . import startup
from .exceptions import build_error_response
from .explorer import router as explorer_router
from .models import InfoResult
from .run_handler import execute_run
from .serialization import serialize_info, serialize_run_result

startup.bootstrap()

app = FastAPI(title="RunWhen Local Workspace Builder")
app.include_router(explorer_router)


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
    result = execute_run(request_data)
    return serialize_run_result(result)


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

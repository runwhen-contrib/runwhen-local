"""Error response helpers for the workspace-builder REST service."""

from __future__ import annotations

import json
import logging
import traceback
from typing import Any

from exceptions import WorkspaceBuilderUserException

logger = logging.getLogger(__name__)


def _collect_stack_traces(exc: BaseException) -> str:
    stack_traces: list[str] = []
    next_exc: BaseException | None = exc
    while next_exc:
        stack_traces.append("\n".join(traceback.format_tb(next_exc.__traceback__)))
        next_exc = next_exc.__cause__
    return "\nCaused by:\n\n".join(stack_traces)


def build_error_response(
    exc: Exception,
    path: str,
    request_data: dict[str, Any] | None,
) -> tuple[dict[str, Any], int]:
    """Return JSON payload and HTTP status compatible with run.py error handling."""
    stack_trace = _collect_stack_traces(exc)
    status_code = 400 if isinstance(exc, WorkspaceBuilderUserException) else 500

    redacted_request = dict(request_data) if request_data else {}
    password = redacted_request.get("password")
    if password:
        redacted_request["password"] = "*******"

    payload: dict[str, Any] = {
        "message": f"{exc}",
        "exceptionType": str(type(exc)),
        "stackTrace": stack_trace,
        "originalRequestData": redacted_request,
        "originalRequestPath": path,
    }

    logger.debug(
        "Error handling successful: type %s, returning status %s with data %s, stack trace %s",
        type(exc),
        status_code,
        json.dumps(payload, indent=2),
        stack_trace,
    )
    return payload, status_code

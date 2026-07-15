"""Uvicorn access-log filters for the workspace-builder REST service."""

from __future__ import annotations

import logging

# Paths that kubectl/OpenShift probes hit continuously. Access logs for these
# drown useful discovery output, so they are dropped on ``uvicorn.access``.
PROBE_ACCESS_PATH_MARKERS = (
    "/health/",
    "/healthz",
    "/livez",
    "/readyz",
)


class ProbeAccessLogFilter(logging.Filter):
    """Drop uvicorn access-log lines for probe endpoints."""

    def filter(self, record: logging.LogRecord) -> bool:
        try:
            message = record.getMessage()
        except Exception:
            return True
        return not any(marker in message for marker in PROBE_ACCESS_PATH_MARKERS)

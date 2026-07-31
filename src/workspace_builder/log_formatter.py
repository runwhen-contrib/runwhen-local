"""Structured JSON log formatter for the logging module."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone


class StructuredJsonFormatter(logging.Formatter):
    """Formats log records as single-line JSON objects.

    Output keys: timestamp (ISO8601 UTC), level, message, logger, module.
    """

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
        }
        return json.dumps(payload)
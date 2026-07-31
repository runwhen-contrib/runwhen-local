"""Application bootstrap (replaces Django AppConfig.ready)."""

from __future__ import annotations

import logging
import logging.config
import logging.handlers
import os
import sys
from datetime import datetime, timezone

from component import init_components
from enrichers.code_collection import init_code_collections
from .access_log_filters import ProbeAccessLogFilter
from .log_buffer import get_log_buffer
from .log_formatter import StructuredJsonFormatter

_BOOTSTRAPPED = False


class RingBufferHandler(logging.Handler):
    """Logging handler that pushes every record into the global LogRingBuffer."""

    def emit(self, record: logging.LogRecord) -> None:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "phase": "http",
        }
        get_log_buffer().append(entry)


def configure_logging() -> None:
    debug_logging = os.getenv("DEBUG_LOGGING", "false").lower() in ("true", "1")

    # Per-module log levels, each defaulting to the root level.
    log_level_root = os.getenv("LOG_LEVEL_ROOT", "INFO")
    log_level_indexers = os.getenv("LOG_LEVEL_INDEXERS", log_level_root)
    log_level_enrichers = os.getenv("LOG_LEVEL_ENRICHERS", log_level_root)
    log_level_renderers = os.getenv("LOG_LEVEL_RENDERERS", log_level_root)
    log_level_workspace_builder = os.getenv("LOG_LEVEL_WORKSPACE_BUILDER", log_level_root)
    # LOG_FORMAT: "json" (default — structured, machine-readable) or "simple"
    # (plain-text [LEVEL] logger: message). LOG_JSON_CONSOLE is still accepted
    # as a legacy alias for LOG_FORMAT=json.
    log_format = os.getenv("LOG_FORMAT", "json").lower()
    if os.getenv("LOG_JSON_CONSOLE", "").lower() in ("true", "1"):
        log_format = "json"
    use_json_console = log_format == "json"

    # DEBUG_LOGGING shortcut overrides everything.
    if debug_logging:
        log_level_root = "DEBUG"
        log_level_indexers = "DEBUG"
        log_level_enrichers = "DEBUG"
        log_level_renderers = "DEBUG"
        log_level_workspace_builder = "DEBUG"

    # Console formatter: structured JSON by default; opt-out to simple text.
    console_formatter: dict[str, Any]
    if use_json_console:
        console_formatter = {"()": "workspace_builder.log_formatter.StructuredJsonFormatter"}
    else:
        console_formatter = {"format": "[%(levelname)s] %(name)s: %(message)s"}

    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "simple": console_formatter,
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                    "formatter": "simple",
                },
            },
            "root": {
                "handlers": ["console"],
                "level": log_level_root,
            },
            "loggers": {
                "workspace_builder": {
                    "handlers": ["console"],
                    "level": log_level_workspace_builder,
                    "propagate": False,
                },
            },
        }
    )

    # Ring-buffer handler: always active, captures every log entry.
    ring_handler = RingBufferHandler()
    ring_handler.setLevel(logging.DEBUG)
    logging.getLogger().addHandler(ring_handler)
    logging.getLogger("workspace_builder").addHandler(ring_handler)

    # Per-module log level control.
    logging.getLogger("src.indexers").setLevel(log_level_indexers)
    logging.getLogger("src.enrichers").setLevel(log_level_enrichers)
    logging.getLogger("src.renderers").setLevel(log_level_renderers)

    # Uvicorn attaches its own access handler after import; filtering the logger
    # (not a specific handler) applies regardless of how uvicorn configures it.
    access_logger = logging.getLogger("uvicorn.access")
    if not any(isinstance(f, ProbeAccessLogFilter) for f in access_logger.filters):
        access_logger.addFilter(ProbeAccessLogFilter())


def bootstrap() -> None:
    global _BOOTSTRAPPED
    if _BOOTSTRAPPED:
        return
    configure_logging()
    init_components()
    init_code_collections()
    _BOOTSTRAPPED = True


# Import-time bootstrap so module workers and tests see initialized components.
bootstrap()
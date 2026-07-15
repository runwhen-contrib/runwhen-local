"""Application bootstrap (replaces Django AppConfig.ready)."""

from __future__ import annotations

import logging
import logging.config
import os
import sys

from component import init_components
from enrichers.code_collection import init_code_collections
from .access_log_filters import ProbeAccessLogFilter

_BOOTSTRAPPED = False


def configure_logging() -> None:
    debug_logging = os.getenv("DEBUG_LOGGING", "false").lower() in ("true", "1")
    root_log_level = "DEBUG" if debug_logging else "INFO"
    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "simple": {
                    "format": "[%(levelname)s] %(name)s: %(message)s",
                },
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
                "level": root_log_level,
            },
            "loggers": {
                "workspace_builder": {
                    "handlers": ["console"],
                    "level": root_log_level,
                    "propagate": False,
                },
            },
        }
    )
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

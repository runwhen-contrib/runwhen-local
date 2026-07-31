"""Thread-safe in-memory ring buffer for structured JSON log entries."""

from __future__ import annotations

import threading
from collections import deque
from datetime import datetime, timezone
from typing import Optional

_MAX_ENTRIES = 500
_DEFAULT_PHASE = "http"


class LogRingBuffer:
    """A thread-safe ring buffer that stores the last N structured log entries.

    Each entry is a dict with keys: timestamp, level, logger, message, phase.
    """

    def __init__(self, max_entries: int = _MAX_ENTRIES) -> None:
        self._buffer: deque[dict] = deque(maxlen=max_entries)
        self._lock = threading.Lock()

    def append(self, entry: dict) -> None:
        """Append a log entry to the buffer. Injects default phase if missing."""
        if "phase" not in entry:
            entry["phase"] = _DEFAULT_PHASE
        with self._lock:
            self._buffer.append(entry)

    def get_entries(
        self,
        since: Optional[datetime] = None,
        level: Optional[str] = None,
        phase: Optional[str] = None,
        limit: int = 100,
    ) -> list[dict]:
        """Return matching entries, newest first.

        Args:
            since: Only entries at or after this datetime (UTC-aware).
            level: Filter by log level (case-insensitive).
            phase: Filter by phase.
            limit: Maximum number of entries to return.
        """
        with self._lock:
            entries = list(self._buffer)

        # Filter newest-first
        results: list[dict] = []
        for entry in reversed(entries):
            if since is not None:
                try:
                    ts = datetime.fromisoformat(
                        entry["timestamp"].replace("Z", "+00:00")
                    )
                except (ValueError, KeyError):
                    continue
                if ts < since:
                    continue
            if level is not None and entry.get("level", "").upper() != level.upper():
                continue
            if phase is not None and entry.get("phase") != phase:
                continue
            results.append(entry)
            if len(results) >= limit:
                break

        return results

    def get_recent_errors(self, limit: int = 10) -> list[dict]:
        """Return the last N ERROR or CRITICAL entries, newest first."""
        with self._lock:
            entries = list(self._buffer)

        results: list[dict] = []
        for entry in reversed(entries):
            if entry.get("level", "").upper() in ("ERROR", "CRITICAL"):
                results.append(entry)
                if len(results) >= limit:
                    break

        return results


_log_buffer = LogRingBuffer()


def get_log_buffer() -> LogRingBuffer:
    """Return the global singleton LogRingBuffer instance."""
    return _log_buffer
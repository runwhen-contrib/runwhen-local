"""Thread-safe in-memory ring buffer for structured JSON log entries."""

from __future__ import annotations

import json
import os
import threading
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
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


class FileLogSink:
    """Append-only JSONL file sink for durable, complete log history.

    Every log entry is serialised as a JSON line and flushed immediately
    so data is durable even if the process crashes. The file is opened in
    append mode at init and never rotated — it captures the full log
    history since server start.
    """

    def __init__(self) -> None:
        self.path = Path(os.environ.get("RW_LOG_FILE", "/tmp/runwhen-logs.jsonl"))
        self._file = open(self.path, "a", encoding="utf-8")

    def write(self, entry: dict) -> None:
        """Append *entry* as a JSON line and flush to disk."""
        self._file.write(json.dumps(entry, default=str) + "\n")
        self._file.flush()


_log_sink = FileLogSink()


def get_log_sink() -> FileLogSink:
    """Return the global singleton FileLogSink instance."""
    return _log_sink
"""Tests for workspace-builder health/uptime tracking."""

from __future__ import annotations

import json
import logging
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from workspace_builder.health import HealthTracker


class HealthTrackerTests(unittest.TestCase):
    def setUp(self):
        self._tmpdir = tempfile.MixedTemporaryDirectory() if hasattr(tempfile, "MixedTemporaryDirectory") else tempfile.TemporaryDirectory()
        self._health_path = os.path.join(self._tmpdir.name, "health_status.json")
        self._env_patch = patch.dict(
            os.environ, {"RW_HEALTH_STATUS_FILE": self._health_path}
        )
        self._env_patch.start()

    def tearDown(self):
        self._env_patch.stop()
        self._tmpdir.cleanup()

    def test_uptime_survives_new_tracker_instances(self):
        fixed_start = datetime(2026, 6, 29, 12, 0, 0, tzinfo=timezone.utc)
        with patch("workspace_builder.health.datetime") as mock_dt:
            mock_dt.now.return_value = fixed_start
            mock_dt.fromisoformat = datetime.fromisoformat
            tracker = HealthTracker()
            self.assertEqual(fixed_start, tracker._service_start_time)

        later = fixed_start + timedelta(minutes=5)
        with patch("workspace_builder.health.datetime") as mock_dt:
            mock_dt.now.return_value = later
            mock_dt.fromisoformat = datetime.fromisoformat
            info = HealthTracker().get_health_info()

        self.assertEqual(fixed_start.isoformat(), info.service_start_time)
        self.assertAlmostEqual(300.0, info.uptime_seconds, places=1)

    def test_uptime_uses_persisted_start_time_from_file(self):
        start = datetime(2026, 6, 29, 8, 0, 0, tzinfo=timezone.utc)
        with open(self._health_path, "w", encoding="utf-8") as f:
            json.dump({"service_start_time": start.isoformat()}, f)

        with patch("workspace_builder.health.datetime") as mock_dt:
            mock_dt.now.return_value = start + timedelta(hours=2)
            mock_dt.fromisoformat = datetime.fromisoformat
            info = HealthTracker().get_health_info()

        self.assertAlmostEqual(7200.0, info.uptime_seconds, places=1)


class LivenessProbeTests(unittest.TestCase):
    """Tests for the liveness probe logic — ensuring long but healthy runs
    are NOT killed, while truly stuck runs (no stage progress) ARE killed."""

    def setUp(self):
        self._tmpdir = tempfile.TemporaryDirectory()
        self._health_path = os.path.join(self._tmpdir.name, "health_status.json")
        self._env_patches = []
        self._env_patches.append(patch.dict(os.environ, {
            "RW_HEALTH_STATUS_FILE": self._health_path,
            "RW_STUCK_RUN_TIMEOUT_SECONDS": "3600",
        }))
        for p in self._env_patches:
            p.start()

    def tearDown(self):
        for p in self._env_patches:
            p.stop()
        self._tmpdir.cleanup()

    def _write_run_state(self, start_time, last_progress_time=None, status="running"):
        state = {
            "service_start_time": datetime(2026, 1, 1, tzinfo=timezone.utc).isoformat(),
            "service_status": "running",
            "current_run": {
                "start_time": start_time.isoformat(),
                "status": status,
                "current_stage": "rendering",
                "last_progress_time": (last_progress_time or start_time).isoformat(),
            },
        }
        with open(self._health_path, "w") as f:
            json.dump(state, f)

    def test_long_run_with_recent_progress_is_healthy(self):
        """A run that's been going for 45 minutes but advanced stages 5 minutes
        ago should be healthy (not killed by the liveness probe)."""
        now = datetime.now(timezone.utc)
        start = now - timedelta(minutes=45)
        last_progress = now - timedelta(minutes=5)
        self._write_run_state(start, last_progress)
        tracker = HealthTracker()
        self.assertTrue(tracker.is_healthy())

    def test_stuck_run_no_progress_for_over_timeout_is_unhealthy(self):
        """A run that hasn't advanced stages in over the stuck timeout (1h)
        should be unhealthy."""
        now = datetime.now(timezone.utc)
        start = now - timedelta(hours=2)
        last_progress = now - timedelta(hours=1, minutes=5)
        self._write_run_state(start, last_progress)
        tracker = HealthTracker()
        self.assertFalse(tracker.is_healthy())

    def test_error_status_is_unhealthy(self):
        now = datetime.now(timezone.utc)
        state = {
            "service_start_time": datetime(2026, 1, 1, tzinfo=timezone.utc).isoformat(),
            "service_status": "error",
            "current_run": None,
        }
        with open(self._health_path, "w") as f:
            json.dump(state, f)
        tracker = HealthTracker()
        self.assertFalse(tracker.is_healthy())

    def test_no_current_run_is_healthy(self):
        state = {
            "service_start_time": datetime(2026, 1, 1, tzinfo=timezone.utc).isoformat(),
            "service_status": "healthy",
            "current_run": None,
        }
        with open(self._health_path, "w") as f:
            json.dump(state, f)
        tracker = HealthTracker()
        self.assertTrue(tracker.is_healthy())

    def test_long_run_without_last_progress_uses_start_time(self):
        """If last_progress_time is missing (older runs), fall back to
        start_time for staleness, but the new 1h default timeout is more
        lenient than the old 30 min hard cap."""
        now = datetime.now(timezone.utc)
        start = now - timedelta(minutes=45)
        state = {
            "service_start_time": datetime(2026, 1, 1, tzinfo=timezone.utc).isoformat(),
            "service_status": "running",
            "current_run": {
                "start_time": start.isoformat(),
                "status": "running",
            },
        }
        with open(self._health_path, "w") as f:
            json.dump(state, f)
        tracker = HealthTracker()
        # 45 min < 1h timeout → healthy
        self.assertTrue(tracker.is_healthy())

    def test_update_stage_stamps_progress_time(self):
        """update_stage must write last_progress_time so the liveness probe
        can track real progress, not just run start time."""
        tracker = HealthTracker()
        tracker.start_run([])

        before = datetime.now(timezone.utc)
        tracker.update_stage("rendering", "render_output_items")
        after = datetime.now(timezone.utc)

        with open(self._health_path) as f:
            state = json.load(f)
        progress_str = state["current_run"]["last_progress_time"]
        progress_time = datetime.fromisoformat(progress_str.replace("Z", "+00:00"))
        self.assertGreaterEqual(progress_time, before - timedelta(seconds=1))
        self.assertLessEqual(progress_time, after + timedelta(seconds=1))


class ProbeAccessLogFilterTests(unittest.TestCase):
    def test_drops_health_probe_access_lines(self):
        from workspace_builder.access_log_filters import ProbeAccessLogFilter

        filt = ProbeAccessLogFilter()
        health = logging.LogRecord(
            name="uvicorn.access",
            level=logging.INFO,
            pathname=__file__,
            lineno=1,
            msg='10.128.0.2:55136 - "GET /health/ HTTP/1.1" 200 OK',
            args=(),
            exc_info=None,
        )
        other = logging.LogRecord(
            name="uvicorn.access",
            level=logging.INFO,
            pathname=__file__,
            lineno=1,
            msg='10.128.0.2:12345 - "GET /info/ HTTP/1.1" 200 OK',
            args=(),
            exc_info=None,
        )
        self.assertFalse(filt.filter(health))
        self.assertTrue(filt.filter(other))


if __name__ == "__main__":  # pragma: no cover
    unittest.main()

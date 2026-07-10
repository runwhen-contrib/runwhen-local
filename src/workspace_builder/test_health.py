"""Tests for workspace-builder health/uptime tracking."""

from __future__ import annotations

import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from workspace_builder.health import HealthTracker


class HealthTrackerTests(unittest.TestCase):
    def setUp(self):
        self._tmpdir = tempfile.TemporaryDirectory()
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


if __name__ == "__main__":  # pragma: no cover
    unittest.main()

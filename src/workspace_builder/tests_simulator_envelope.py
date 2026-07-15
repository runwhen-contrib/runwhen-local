import json
from unittest import TestCase

from run import build_simulate_envelope


class BuildSimulateEnvelopeTestCase(TestCase):
    def test_envelope_contains_task_id_and_workspace_name(self):
        papi_response = {
            "task_id": "abc-123",
            "status": "queued",
            "message": "Upload queued",
        }
        line = build_simulate_envelope(papi_response, "ws-test")
        parsed = json.loads(line)
        self.assertEqual(parsed, {"task_id": "abc-123", "workspace_name": "ws-test"})

    def test_envelope_handles_missing_task_id(self):
        line = build_simulate_envelope({}, "ws-test")
        parsed = json.loads(line)
        self.assertEqual(parsed, {"task_id": None, "workspace_name": "ws-test"})

    def test_envelope_is_single_line_json(self):
        line = build_simulate_envelope({"task_id": "abc"}, "ws")
        # Single line — no embedded newlines.
        self.assertNotIn("\n", line)
        # Parseable JSON.
        json.loads(line)


class SimulateEnvelopeWiringTestCase(TestCase):
    """Confirms the helper wiring point in run.py exists and produces the right shape."""

    def test_envelope_helper_is_importable_from_run_module(self):
        # If this import works, the helper is at the right top-level location.
        from run import build_simulate_envelope, SIMULATE_COMMAND
        self.assertEqual(SIMULATE_COMMAND, "simulate")
        # And the helper produces stable shape:
        line = build_simulate_envelope({"task_id": "x"}, "y")
        self.assertEqual(json.loads(line), {"task_id": "x", "workspace_name": "y"})

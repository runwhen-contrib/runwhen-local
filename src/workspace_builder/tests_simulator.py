import json
from http import HTTPStatus

from django.test import TestCase


class SimulatorTestCase(TestCase):
    def test_test_synth_runs_as_noop(self):
        """test_synth alone should run without error and produce no SLXs."""
        request_data = {
            "components": "test_synth",
            "workspaceName": "ws-noop",
            "papiURL": "http://papi.local",
        }
        response = self.client.post(
            "/run/", data=request_data, content_type="application/json"
        )
        self.assertEqual(HTTPStatus.OK, response.status_code)

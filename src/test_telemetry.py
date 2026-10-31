"""Tests for the optional OTLP telemetry module and the run-span wiring.

These tests are hermetic: exporters are patched with in-memory stubs and no
network access is performed. When the OpenTelemetry SDK is not installed the
SDK-dependent tests are skipped rather than failing, so the suite still runs in
minimal environments.
"""

from __future__ import annotations

import logging
import os
import subprocess
import sys
import unittest
from unittest import mock

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

import telemetry  # noqa: E402

try:  # Optional: only needed by the tests that assert real spans.
    from opentelemetry.sdk.trace.export.in_memory_span_exporter import (  # noqa: E402
        InMemorySpanExporter,
    )
    from opentelemetry.trace import StatusCode  # noqa: E402

    _OTEL_SDK_AVAILABLE = True
except Exception:  # pragma: no cover - environment without the OTel SDK
    InMemorySpanExporter = None
    StatusCode = None
    _OTEL_SDK_AVAILABLE = False

try:  # The run-handler wrapper depends on the rest of the package.
    from workspace_builder import run_handler as _run_handler_module

    _RUN_HANDLER_AVAILABLE = True
except Exception:  # pragma: no cover - environment without package deps
    _run_handler_module = None
    _RUN_HANDLER_AVAILABLE = False


class _TelemetryTestCase(unittest.TestCase):
    """Base class that isolates (and restores) the OTEL_* environment."""

    def setUp(self):
        self._saved_otel = {
            key: os.environ.pop(key)
            for key in list(os.environ)
            if key.startswith("OTEL_")
        }
        telemetry._reset_for_tests()

    def tearDown(self):
        for key in list(os.environ):
            if key.startswith("OTEL_"):
                del os.environ[key]
        os.environ.update(self._saved_otel)
        telemetry._reset_for_tests()

    @staticmethod
    def _set_env(**values):
        for key, value in values.items():
            os.environ[key] = value


class DefaultOffTests(_TelemetryTestCase):
    def test_off_by_default_builds_no_exporter_and_is_inert(self):
        with mock.patch.object(
            telemetry, "_make_span_exporter", side_effect=AssertionError("no exporter")
        ) as make_exporter:
            telemetry.init_telemetry()
            self.assertFalse(telemetry.telemetry_enabled())
            self.assertIsNone(telemetry.get_tracer())
            with telemetry.span("runwhen.test", {"a": 1}) as handle:
                self.assertFalse(handle.recording)
                # Every recording call must be a harmless no-op.
                handle.set_attribute("b", 2)
                handle.set_attributes({"c": 3})
                handle.set_status_ok()
                handle.set_status_error("nope")
                handle.record_exception(ValueError("boom"))
            make_exporter.assert_not_called()

    def test_non_otlp_exporter_value_leaves_signal_off(self):
        self._set_env(OTEL_TRACES_EXPORTER="console", OTEL_LOGS_EXPORTER="none")
        self.assertFalse(telemetry.traces_enabled())
        self.assertFalse(telemetry.logs_enabled())
        self.assertFalse(telemetry.telemetry_enabled())

    def test_importing_telemetry_does_not_import_otel(self):
        env = {k: v for k, v in os.environ.items() if not k.startswith("OTEL_")}
        code = (
            "import sys, telemetry;"
            "assert 'opentelemetry' not in sys.modules, 'OTel imported at import time';"
            "assert 'opentelemetry.sdk' not in sys.modules;"
            "print('clean')"
        )
        proc = subprocess.run(
            [sys.executable, "-c", code],
            cwd=_THIS_DIR,
            env=env,
            capture_output=True,
            text=True,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertIn("clean", proc.stdout)


class ConfigurationTests(_TelemetryTestCase):
    def test_run_attributes_maps_request_data(self):
        attributes = telemetry.run_attributes(
            {
                "workspaceName": "ws-a",
                "locationId": "loc-1",
                "locationName": "Loc One",
                "components": "kubeapi,generation_rules",
                "namespaces": ["ns-a", "ns-b"],
            }
        )
        self.assertEqual(attributes["runwhen.workspace_name"], "ws-a")
        self.assertEqual(attributes["runwhen.location_id"], "loc-1")
        self.assertEqual(attributes["runwhen.location_name"], "Loc One")
        self.assertEqual(attributes["runwhen.components"], "kubeapi,generation_rules")
        self.assertEqual(attributes["runwhen.namespaces"], "ns-a,ns-b")

    def test_run_attributes_tolerates_missing_fields(self):
        self.assertEqual(telemetry.run_attributes({}), {})
        self.assertEqual(telemetry.run_attributes(None), {})

    def test_service_name_defaults_and_override(self):
        self.assertEqual(telemetry.service_name(), "runwhen-local")
        self._set_env(OTEL_SERVICE_NAME="my-runner")
        self.assertEqual(telemetry.service_name(), "my-runner")


@unittest.skipUnless(_OTEL_SDK_AVAILABLE, "opentelemetry sdk not installed")
class SpanTests(_TelemetryTestCase):
    def test_traces_enabled_produces_span_with_expected_attributes(self):
        exporter = InMemorySpanExporter()
        self._set_env(OTEL_TRACES_EXPORTER="otlp", OTEL_SERVICE_NAME="runwhen-local-test")
        with mock.patch.object(telemetry, "_make_span_exporter", return_value=exporter):
            telemetry.init_telemetry()
            with telemetry.span(
                telemetry.RUN_SPAN_NAME, {"runwhen.workspace_name": "ws-a"}
            ) as handle:
                self.assertTrue(handle.recording)
                handle.set_attribute("runwhen.status", "ok")
                handle.set_status_ok()
            telemetry.flush_telemetry()

        spans = exporter.get_finished_spans()
        self.assertEqual(len(spans), 1)
        span = spans[0]
        self.assertEqual(span.name, telemetry.RUN_SPAN_NAME)
        self.assertEqual(span.attributes.get("runwhen.workspace_name"), "ws-a")
        self.assertEqual(span.attributes.get("runwhen.status"), "ok")
        self.assertEqual(span.status.status_code, StatusCode.OK)
        self.assertEqual(span.resource.attributes.get("service.name"), "runwhen-local-test")

    def test_broken_exporter_degrades_without_raising(self):
        self._set_env(OTEL_TRACES_EXPORTER="otlp")

        def _boom():
            raise RuntimeError("collector unreachable")

        with mock.patch.object(telemetry, "_make_span_exporter", side_effect=_boom):
            with self.assertLogs("telemetry", level="WARNING") as captured:
                telemetry.init_telemetry()
            self.assertIsNone(telemetry.get_tracer())
            with telemetry.span("runwhen.test") as handle:
                self.assertFalse(handle.recording)
        self.assertTrue(
            any("continuing without telemetry" in line for line in captured.output),
            captured.output,
        )

    def test_logs_enabled_attaches_and_then_detaches_handler(self):
        self._set_env(OTEL_LOGS_EXPORTER="otlp")
        with mock.patch.object(telemetry, "_make_log_exporter", return_value=object()):
            telemetry.init_telemetry()
            handler = telemetry._log_handler
            self.assertIsNotNone(handler)
            self.assertIn(handler, logging.getLogger().handlers)
        telemetry._reset_for_tests()
        self.assertNotIn(handler, logging.getLogger().handlers)


@unittest.skipUnless(_RUN_HANDLER_AVAILABLE, "workspace_builder package not importable")
class RunHandlerWiringTests(_TelemetryTestCase):
    def test_wrapper_is_transparent_when_telemetry_disabled(self):
        fake_result = _run_handler_module.ArchiveRunResult("ok", [], b"data")
        with mock.patch.object(
            _run_handler_module, "_execute_run_pipeline", return_value=fake_result
        ) as pipeline:
            self.assertIs(
                _run_handler_module.execute_run({"workspaceName": "ws-a"}), fake_result
            )
        pipeline.assert_called_once()

        with mock.patch.object(
            _run_handler_module, "_execute_run_pipeline", side_effect=RuntimeError("boom")
        ):
            with self.assertRaises(RuntimeError):
                _run_handler_module.execute_run({})

    @unittest.skipUnless(_OTEL_SDK_AVAILABLE, "opentelemetry sdk not installed")
    def test_successful_run_records_ok_span(self):
        exporter = InMemorySpanExporter()
        self._set_env(OTEL_TRACES_EXPORTER="otlp")
        fake_result = _run_handler_module.ArchiveRunResult("ok", ["w1", "w2"], b"data")
        with mock.patch.object(
            telemetry, "_make_span_exporter", return_value=exporter
        ), mock.patch.object(
            _run_handler_module, "_execute_run_pipeline", return_value=fake_result
        ):
            result = _run_handler_module.execute_run(
                {"workspaceName": "ws-a", "components": "kubeapi,generation_rules"}
            )
            telemetry.flush_telemetry()

        self.assertIs(result, fake_result)
        spans = exporter.get_finished_spans()
        self.assertEqual(len(spans), 1)
        span = spans[0]
        self.assertEqual(span.name, telemetry.RUN_SPAN_NAME)
        self.assertEqual(span.attributes.get("runwhen.workspace_name"), "ws-a")
        self.assertEqual(span.attributes.get("runwhen.components"), "kubeapi,generation_rules")
        self.assertEqual(span.attributes.get("runwhen.status"), "ok")
        self.assertEqual(span.attributes.get("runwhen.warnings_count"), 2)
        self.assertEqual(span.status.status_code, StatusCode.OK)

    @unittest.skipUnless(_OTEL_SDK_AVAILABLE, "opentelemetry sdk not installed")
    def test_failing_run_records_error_span_and_reraises(self):
        exporter = InMemorySpanExporter()
        self._set_env(OTEL_TRACES_EXPORTER="otlp")
        with mock.patch.object(
            telemetry, "_make_span_exporter", return_value=exporter
        ), mock.patch.object(
            _run_handler_module,
            "_execute_run_pipeline",
            side_effect=ValueError("discovery failed"),
        ):
            with self.assertRaises(ValueError):
                _run_handler_module.execute_run({"workspaceName": "ws-a"})
            telemetry.flush_telemetry()

        span = exporter.get_finished_spans()[0]
        self.assertEqual(span.attributes.get("runwhen.status"), "error")
        self.assertEqual(span.status.status_code, StatusCode.ERROR)


if __name__ == "__main__":
    unittest.main()

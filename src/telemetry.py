"""Optional OTLP telemetry for RunWhen Local.

Telemetry is **off by default**. When no OpenTelemetry environment variable is
set, importing this module does not import the OpenTelemetry SDK, no exporter
is constructed, and the run path behaves exactly as it did before. It is
configured purely through the standard ``OTEL_*`` environment variables so the
deployment charts need no bespoke keys:

* ``OTEL_TRACES_EXPORTER=otlp`` -- enable OTLP trace export.
* ``OTEL_LOGS_EXPORTER=otlp`` -- enable OTLP log export.
* ``OTEL_EXPORTER_OTLP_ENDPOINT`` -- collector endpoint (the ``_TRACES_`` /
  ``_LOGS_`` signal-specific variants are honored by the OTLP exporters).
* ``OTEL_EXPORTER_OTLP_PROTOCOL`` -- ``grpc`` (default) or ``http/protobuf``.
* ``OTEL_SERVICE_NAME`` -- service name (default ``runwhen-local``).
* ``OTEL_TRACES_SAMPLER`` / ``OTEL_TRACES_SAMPLER_ARG`` -- sampler; these are
  interpreted by the SDK's ``TracerProvider`` when no sampler is passed here.
* ``OTEL_PROPAGATORS`` -- only affects cross-process context propagation; this
  process is the root of each run, so the SDK default (W3C TraceContext) is used.

The signal switches follow the OpenTelemetry contract: a signal is enabled only
when its exporter is explicitly set to ``otlp``; any other value (including
unset) leaves that signal off.

This pairs with the ``opentelemetry-collector`` subchart that the RunWhen
self-hosted chart deploys when ``runner.enabled`` is true -- see
``deploy/scripts/registry-sync/sample_values.yaml`` and ``updated_values.yaml``
for the collector configuration that receives this telemetry.

Everything here is best-effort: building an exporter happens on a startup path
and any failure is logged as a warning so a run continues without telemetry.
"""

from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from typing import Any, Iterator, Mapping, Optional

logger = logging.getLogger(__name__)

_TRACES_EXPORTER_ENV = "OTEL_TRACES_EXPORTER"
_LOGS_EXPORTER_ENV = "OTEL_LOGS_EXPORTER"
_SERVICE_NAME_ENV = "OTEL_SERVICE_NAME"
_PROTOCOL_ENV = "OTEL_EXPORTER_OTLP_PROTOCOL"

_DEFAULT_SERVICE_NAME = "runwhen-local"
_OTLP = "otlp"

#: Span name for a single workspace-builder run (the unit of work that
#: generates the workspace / SLX files for one request).
RUN_SPAN_NAME = "runwhen.workspace_builder.run"

# --- module state -----------------------------------------------------------
_initialized = False
_provider = None
_tracer = None
_logger_provider = None
_log_handler = None


# --- configuration ----------------------------------------------------------
def _otlp_enabled(env_var: str) -> bool:
    return os.getenv(env_var, "").strip().lower() == _OTLP


def traces_enabled() -> bool:
    """True only when ``OTEL_TRACES_EXPORTER`` is explicitly ``otlp``."""
    return _otlp_enabled(_TRACES_EXPORTER_ENV)


def logs_enabled() -> bool:
    """True only when ``OTEL_LOGS_EXPORTER`` is explicitly ``otlp``."""
    return _otlp_enabled(_LOGS_EXPORTER_ENV)


def telemetry_enabled() -> bool:
    return traces_enabled() or logs_enabled()


def service_name() -> str:
    return os.getenv(_SERVICE_NAME_ENV, "").strip() or _DEFAULT_SERVICE_NAME


def _as_csv(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (list, tuple, set)):
        return ",".join(str(item).strip() for item in value if str(item).strip())
    return str(value).strip()


def run_attributes(request_data: Mapping[str, Any]) -> dict[str, Any]:
    """Build the sensor-style attributes attached to a run span.

    Kept deliberately small and tolerant of missing keys: a malformed or partial
    request must never affect telemetry or the run.
    """
    attributes: dict[str, Any] = {}
    if not request_data:
        return attributes

    workspace = request_data.get("workspaceName")
    if workspace:
        attributes["runwhen.workspace_name"] = str(workspace)

    location_id = request_data.get("locationId")
    if location_id:
        attributes["runwhen.location_id"] = str(location_id)

    location_name = request_data.get("locationName")
    if location_name:
        attributes["runwhen.location_name"] = str(location_name)

    components = _as_csv(request_data.get("components"))
    if components:
        attributes["runwhen.components"] = components

    namespaces = _as_csv(request_data.get("namespaces"))
    if namespaces:
        attributes["runwhen.namespaces"] = namespaces

    return attributes


# --- exporter construction (seams tests can patch) --------------------------
def _make_span_exporter():
    """Construct the OTLP span exporter.

    Isolated so tests can substitute an in-memory exporter / a failing stub
    without any network access.
    """
    protocol = os.getenv(_PROTOCOL_ENV, "grpc").strip().lower()
    if protocol in ("http/protobuf", "http"):
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    else:
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    return OTLPSpanExporter()


def _make_log_exporter():
    """Construct the OTLP log exporter (see :func:`_make_span_exporter`)."""
    protocol = os.getenv(_PROTOCOL_ENV, "grpc").strip().lower()
    if protocol in ("http/protobuf", "http"):
        from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
    else:
        from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
    return OTLPLogExporter()


def _build_resource():
    from opentelemetry.sdk.resources import Resource

    # ``Resource.create`` also folds in OTEL_RESOURCE_ATTRIBUTES.
    return Resource.create({"service.name": service_name()})


# --- initialization ---------------------------------------------------------
def init_telemetry() -> None:
    """Initialize OTLP exporters, best-effort and idempotent.

    Called from the startup path. If nothing is enabled this is a no-op that
    imports nothing from the OpenTelemetry packages. Any failure is logged and
    swallowed so a run always proceeds.
    """
    global _initialized
    if _initialized:
        return
    _initialized = True
    if not telemetry_enabled():
        return
    try:
        resource = _build_resource()
        if traces_enabled():
            _init_traces(resource)
        if logs_enabled():
            _init_logs(resource)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning(
            "OpenTelemetry setup failed; continuing without telemetry: %s", exc
        )


def _init_traces(resource) -> None:
    global _provider, _tracer
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor

    # No sampler passed: the SDK reads OTEL_TRACES_SAMPLER / _ARG (and
    # OTEL_SDK_DISABLED) from the environment itself.
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(BatchSpanProcessor(_make_span_exporter()))
    try:
        trace.set_tracer_provider(provider)
    except Exception:  # pragma: no cover - global provider already set
        pass
    _provider = provider
    _tracer = provider.get_tracer(service_name())
    logger.info("OTLP trace export enabled (service.name=%s)", service_name())


def _init_logs(resource) -> None:
    global _logger_provider, _log_handler
    from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
    from opentelemetry.sdk._logs.export import BatchLogRecordProcessor

    provider = LoggerProvider(resource=resource)
    provider.add_log_record_processor(BatchLogRecordProcessor(_make_log_exporter()))
    handler = LoggingHandler(level=logging.NOTSET, logger_provider=provider)
    logging.getLogger().addHandler(handler)
    _logger_provider = provider
    _log_handler = handler
    logger.info("OTLP log export enabled (service.name=%s)", service_name())


def get_tracer():
    """Return the configured tracer, or ``None`` when telemetry is off."""
    init_telemetry()
    return _tracer


def flush_telemetry(timeout_millis: int = 5000) -> None:
    """Best-effort flush of any buffered spans/logs (used at shutdown/tests)."""
    if _provider is not None:
        try:
            _provider.force_flush(timeout_millis)
        except Exception as exc:  # pragma: no cover - defensive
            logger.debug("Telemetry span flush failed: %s", exc)
    if _logger_provider is not None:
        try:
            _logger_provider.force_flush(timeout_millis)
        except Exception as exc:  # pragma: no cover - defensive
            logger.debug("Telemetry log flush failed: %s", exc)


# --- span API ---------------------------------------------------------------
class SpanHandle:
    """Wrapper so call sites can record unconditionally.

    When telemetry is disabled the handle is inert: every method is a no-op and
    the wrapped operation behaves exactly as before.
    """

    __slots__ = ("_span",)

    def __init__(self, span=None):
        self._span = span

    @property
    def recording(self) -> bool:
        return self._span is not None

    def set_attribute(self, key: str, value: Any) -> None:
        if self._span is None:
            return
        try:
            self._span.set_attribute(key, value)
        except Exception:  # pragma: no cover - defensive
            pass

    def set_attributes(self, attributes: Mapping[str, Any]) -> None:
        for key, value in (attributes or {}).items():
            self.set_attribute(key, value)

    def record_exception(self, exc: BaseException) -> None:
        if self._span is None:
            return
        try:
            self._span.record_exception(exc)
        except Exception:  # pragma: no cover - defensive
            pass

    def set_status_ok(self) -> None:
        self._set_status(error=False)

    def set_status_error(self, description: Optional[str] = None) -> None:
        self._set_status(error=True, description=description)

    def _set_status(self, error: bool, description: Optional[str] = None) -> None:
        if self._span is None:
            return
        try:
            from opentelemetry.trace import Status, StatusCode

            code = StatusCode.ERROR if error else StatusCode.OK
            self._span.set_status(Status(code, description))
        except Exception:  # pragma: no cover - defensive
            pass


@contextmanager
def span(name: str, attributes: Optional[Mapping[str, Any]] = None) -> Iterator[SpanHandle]:
    """Context manager yielding a :class:`SpanHandle`.

    Never raises because of telemetry: if the tracer cannot be built or a span
    cannot be started, it yields an inert handle.
    """
    tracer = get_tracer()
    if tracer is None:
        yield SpanHandle(None)
        return

    try:
        span_cm = tracer.start_as_current_span(name, attributes=dict(attributes or {}))
        active_span = span_cm.__enter__()
    except Exception as exc:
        logger.warning("Could not start telemetry span %r: %s", name, exc)
        yield SpanHandle(None)
        return

    try:
        yield SpanHandle(active_span)
    finally:
        try:
            span_cm.__exit__(None, None, None)
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("Could not finish telemetry span %r: %s", name, exc)


# --- test helper ------------------------------------------------------------
def _reset_for_tests() -> None:
    """Reset module state so tests can re-initialize cleanly."""
    global _initialized, _provider, _tracer, _logger_provider, _log_handler
    if _provider is not None:
        try:
            _provider.shutdown()
        except Exception:  # pragma: no cover - defensive
            pass
    if _logger_provider is not None:
        try:
            _logger_provider.shutdown()
        except Exception:  # pragma: no cover - defensive
            pass
    if _log_handler is not None:
        try:
            logging.getLogger().removeHandler(_log_handler)
        except Exception:  # pragma: no cover - defensive
            pass
    _initialized = False
    _provider = None
    _tracer = None
    _logger_provider = None
    _log_handler = None

"""
Unit tests for the Apigee discovery path (``indexers.gcpapi_resource_types``
and the Apigee branch of ``indexers.gcpapi``).

Coverage:
* ``_apigee_api_get`` resolves Application Default Credentials when handed
  ``credentials=None``. This is the regression test for the ADC crash
  ("'NoneType' object has no attribute 'before_request'"): unlike the
  ``google-cloud-*`` clients, ``AuthorizedSession`` has no ADC fallback, and
  ``gcp_get_credentials_and_projects`` returns ``None`` by design under ADC.
* Explicitly supplied credentials are passed through untouched (no ADC lookup).
* ``_is_permission_denied`` recognises the ``requests``-shaped HTTP error the
  raw-REST Apigee collectors raise, without regressing the gRPC
  ``PermissionDenied`` / REST ``Forbidden`` / numeric-code shapes.
* A 403 on the organizations call takes the informational
  ``apigee_permission_denied`` path rather than the hard-error path.
* A 403 on a single sub-collector does not turn into a context warning.

Everything is driven through stubs, so no GCP SDK call or network access is
needed.
"""

from __future__ import annotations

import logging
import os
import sys
from contextlib import ExitStack
from unittest import TestCase, mock

import requests

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers import gcpapi, gcpapi_resource_types  # noqa: E402
from indexers.gcpapi_resource_types import GcpResourceTypeSpec  # noqa: E402

_AUTHORIZED_SESSION = "google.auth.transport.requests.AuthorizedSession"


def _http_error(status_code: int) -> requests.exceptions.HTTPError:
    """Build the exception ``_apigee_api_get`` actually raises for a non-2xx:
    ``response.raise_for_status()`` on a ``requests`` response."""
    response = requests.Response()
    response.status_code = status_code
    response.reason = "Forbidden" if status_code == 403 else "Error"
    response.url = "https://apigee.googleapis.com/v1/organizations"
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as exc:
        return exc
    raise AssertionError(f"status {status_code} did not raise")


def _fake_session(payload):
    session = mock.MagicMock()
    session.get.return_value.json.return_value = payload
    return session


def _authorized_session_factory(payload):
    """Stand-in for ``AuthorizedSession`` that reproduces its real behaviour on
    ``None`` credentials: the constructor accepts them and the first request
    dereferences them (``credentials.before_request(...)``)."""

    def _factory(credentials):
        if credentials is None:
            session = mock.MagicMock()
            session.get.side_effect = AttributeError(
                "'NoneType' object has no attribute 'before_request'"
            )
            return session
        return _fake_session(payload)

    return _factory


class ApigeeCredentialsTests(TestCase):
    """``_apigee_api_get`` must work under both auth shapes."""

    def setUp(self):
        # The resolved-ADC memo is module state; keep tests independent of each
        # other (and of whatever ran before them).
        gcpapi_resource_types._ADC_CREDENTIALS = None
        self.addCleanup(setattr, gcpapi_resource_types, "_ADC_CREDENTIALS", None)

    def test_none_credentials_resolve_adc(self):
        """Regression test: ADC auth hands the collectors ``credentials=None``
        and ``AuthorizedSession(None)`` crashes on the first request."""
        adc = mock.sentinel.adc_credentials
        session = _fake_session({"organizations": [{"organization": "organizations/o"}]})

        with mock.patch("google.auth.default", return_value=(adc, "proj")) as m_default, \
                mock.patch(_AUTHORIZED_SESSION, return_value=session) as m_session:
            body = gcpapi_resource_types._apigee_api_get(None, "organizations")

        m_default.assert_called_once()
        m_session.assert_called_once_with(adc)
        self.assertEqual(body, {"organizations": [{"organization": "organizations/o"}]})

    def test_explicit_credentials_passed_through(self):
        creds = mock.sentinel.service_account_credentials
        session = _fake_session({"organizations": []})

        with mock.patch("google.auth.default") as m_default, \
                mock.patch(_AUTHORIZED_SESSION, return_value=session) as m_session:
            gcpapi_resource_types._apigee_api_get(creds, "organizations")

        m_default.assert_not_called()
        m_session.assert_called_once_with(creds)

    def test_adc_resolved_once_across_calls(self):
        """One org call plus seven sub-collector calls per org: ADC must not be
        re-resolved on every request."""
        adc = mock.sentinel.adc_credentials
        session = _fake_session({})

        with mock.patch("google.auth.default", return_value=(adc, "proj")) as m_default, \
                mock.patch(_AUTHORIZED_SESSION, return_value=session) as m_session:
            gcpapi_resource_types._apigee_api_get(None, "organizations")
            gcpapi_resource_types._apigee_api_get(None, "organizations/o/environments")
            gcpapi_resource_types._apigee_api_get(None, "organizations/o/apis")

        self.assertEqual(m_default.call_count, 1)
        self.assertEqual(m_session.call_args_list, [mock.call(adc)] * 3)

    def test_collector_under_adc_does_not_crash(self):
        """The reported failure end to end: the organizations collector called
        with the ``credentials=None`` that ADC auth produces."""
        adc = mock.sentinel.adc_credentials
        payload = {"organizations": [{"organization": "organizations/o"}]}

        with mock.patch("google.auth.default", return_value=(adc, "proj")), \
                mock.patch(
                    _AUTHORIZED_SESSION,
                    side_effect=_authorized_session_factory(payload),
                ):
            orgs = gcpapi_resource_types._collect_apigee_organizations(None, "")

        self.assertEqual(orgs, [{"organization": "organizations/o"}])


class IsPermissionDeniedTests(TestCase):
    """``_is_permission_denied`` classifies every 403 shape the GCP indexer can
    see, including the raw-REST one the Apigee collectors raise."""

    def test_requests_http_error_403(self):
        self.assertTrue(gcpapi._is_permission_denied(_http_error(403)))

    def test_requests_http_error_401(self):
        self.assertTrue(gcpapi._is_permission_denied(_http_error(401)))

    def test_requests_http_error_404_is_not_permission_denied(self):
        self.assertFalse(gcpapi._is_permission_denied(_http_error(404)))

    def test_requests_http_error_500_is_not_permission_denied(self):
        self.assertFalse(gcpapi._is_permission_denied(_http_error(500)))

    def test_grpc_permission_denied_by_type_name(self):
        exc = type("PermissionDenied", (Exception,), {})("denied")
        self.assertTrue(gcpapi._is_permission_denied(exc))

    def test_rest_forbidden_by_type_name(self):
        exc = type("Forbidden", (Exception,), {})("forbidden")
        self.assertTrue(gcpapi._is_permission_denied(exc))

    def test_numeric_code_403(self):
        exc = Exception("boom")
        exc.code = 403
        self.assertTrue(gcpapi._is_permission_denied(exc))

    def test_callable_grpc_status_code(self):
        status = type("StatusCode", (), {"name": "PERMISSION_DENIED"})()
        exc = Exception("boom")
        exc.code = lambda: status
        self.assertTrue(gcpapi._is_permission_denied(exc))

    def test_string_fallback(self):
        self.assertTrue(
            gcpapi._is_permission_denied(Exception("403 caller lacks permission"))
        )

    def test_unrelated_exception(self):
        self.assertFalse(gcpapi._is_permission_denied(ValueError("nope")))


class _RecordingContext:
    """Minimal Context stand-in: only ``add_warning`` is exercised here."""

    def __init__(self):
        self.warnings: list[str] = []

    def add_warning(self, message):
        self.warnings.append(message)


def _new_stats() -> dict:
    """The subset of ``gcpapi.index``'s stats dict that ``_discover_apigee``
    touches, initialised the same way."""
    return {
        "added": 0,
        "added_apigee": 0,
        "added_apigee_org": 0,
        "skipped_tag_filter": 0,
        "skipped_parse_error": 0,
        "skipped_collector_error": 0,
        "apigee_permission_denied": 0,
    }


def _spec(name: str) -> GcpResourceTypeSpec:
    return GcpResourceTypeSpec(
        resource_type_name=name,
        cloudquery_table_name=name,
        cai_asset_type=None,
        mandatory=False,
        typed=True,
        collector=None,
    )


class DiscoverApigeePermissionDeniedTests(TestCase):
    def _run(self, *, orgs_side_effect=None, orgs=None, sub_collectors=None,
             context=None, stats=None):
        handler = mock.MagicMock()
        handler.parse_resource_data.return_value = ("org-a", "gcp/org-a", {})
        with ExitStack() as stack:
            stack.enter_context(
                mock.patch.object(gcpapi, "find_spec", side_effect=_spec)
            )
            stack.enter_context(mock.patch.object(
                gcpapi, "_collect_apigee_organizations",
                side_effect=orgs_side_effect or (lambda c, p: list(orgs or [])),
            ))
            if sub_collectors is not None:
                stack.enter_context(mock.patch.object(
                    gcpapi, "_APIGEE_SUB_COLLECTORS", sub_collectors
                ))
            gcpapi._discover_apigee(
                None, handler, mock.MagicMock(), {}, context, "gcp_adc", None,
                None, None, {"proj-a"}, stats,
            )

    def test_organizations_403_is_informational(self):
        stats = _new_stats()
        context = _RecordingContext()
        exc = _http_error(403)

        with self.assertLogs("indexers.gcpapi", level=logging.INFO) as logs:
            self._run(
                orgs_side_effect=mock.Mock(side_effect=exc),
                context=context, stats=stats,
            )

        self.assertEqual(stats["apigee_permission_denied"], 1)
        self.assertEqual(stats["skipped_collector_error"], 0)
        self.assertEqual(context.warnings, [])
        self.assertTrue(
            any(gcpapi.APIGEE_PERMISSION_DENIED_TOKEN in r.getMessage() for r in logs.records),
            f"expected {gcpapi.APIGEE_PERMISSION_DENIED_TOKEN} at INFO, got {logs.output}",
        )
        self.assertEqual([r for r in logs.records if r.levelno >= logging.WARNING], [])

    def test_organizations_non_403_is_still_a_hard_error(self):
        stats = _new_stats()
        context = _RecordingContext()

        self._run(
            orgs_side_effect=mock.Mock(side_effect=RuntimeError("connection reset")),
            context=context, stats=stats,
        )

        self.assertEqual(stats["skipped_collector_error"], 1)
        self.assertEqual(stats["apigee_permission_denied"], 0)
        self.assertEqual(len(context.warnings), 1)

    def test_sub_collector_403_does_not_warn(self):
        """Apigee orgs commonly 403 a subset of sub-resources (developers, apps)
        while the org itself is readable; that must not produce a warning burst."""
        stats = _new_stats()
        context = _RecordingContext()
        exc = _http_error(403)

        def _denied(credentials, org_name):
            raise exc

        self._run(
            orgs=[{"organization": "organizations/org-a", "projectId": "proj-a"}],
            sub_collectors={"gcp_apigee_developers": _denied},
            context=context, stats=stats,
        )

        self.assertEqual(context.warnings, [])
        self.assertEqual(stats["skipped_collector_error"], 0)
        self.assertEqual(stats.get("apigee_sub_permission_denied"), 1)
        # The org itself was readable, so the "Apigee API not accessible"
        # summary flag must stay clear.
        self.assertEqual(stats["apigee_permission_denied"], 0)

    def test_sub_collector_non_403_still_warns(self):
        stats = _new_stats()
        context = _RecordingContext()

        def _boom(credentials, org_name):
            raise RuntimeError("connection reset")

        self._run(
            orgs=[{"organization": "organizations/org-a", "projectId": "proj-a"}],
            sub_collectors={"gcp_apigee_developers": _boom},
            context=context, stats=stats,
        )

        self.assertEqual(stats["skipped_collector_error"], 1)
        self.assertEqual(len(context.warnings), 1)

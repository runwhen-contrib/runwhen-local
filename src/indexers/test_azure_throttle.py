"""Unit tests for ``indexers.azure_throttle``.

Covers throttle detection, Retry-After parsing (header + message body),
exponential-backoff jitter bounds, and the call-with-retry control flow.
The tests do not require any Azure SDK; throttling errors are simulated
with minimal stub exception classes so the suite stays fast.
"""

from __future__ import annotations

import os
import random
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.azure_throttle import (  # noqa: E402
    DEFAULT_INITIAL_BACKOFF,
    DEFAULT_MAX_BACKOFF,
    call_with_throttle_retry,
    compute_wait_seconds,
    is_throttle_error,
)


class _StubResponse:
    def __init__(self, status_code=None, headers=None):
        self.status_code = status_code
        self.headers = headers or {}


class _StubAzureError(Exception):
    """Mimics ``azure.core.exceptions.HttpResponseError`` shape."""

    def __init__(self, message, *, status_code=None, headers=None):
        super().__init__(message)
        self.status_code = status_code
        self.response = _StubResponse(status_code=status_code, headers=headers)


class IsThrottleErrorTests(TestCase):
    def test_429_status_is_throttle(self):
        exc = _StubAzureError("rate limited", status_code=429)
        self.assertTrue(is_throttle_error(exc))

    def test_throttle_code_in_message(self):
        exc = _StubAzureError(
            "(ResourceCollectionRequestsThrottled) too many requests"
        )
        self.assertTrue(is_throttle_error(exc))

    def test_503_is_retryable(self):
        self.assertTrue(is_throttle_error(_StubAzureError("busy", status_code=503)))

    def test_404_is_not_throttle(self):
        self.assertFalse(
            is_throttle_error(_StubAzureError("ResourceGroupNotFound", status_code=404))
        )

    def test_generic_exception_is_not_throttle(self):
        self.assertFalse(is_throttle_error(ValueError("nope")))


class ComputeWaitSecondsTests(TestCase):
    def test_uses_message_hint(self):
        exc = _StubAzureError(
            "Operation failed; Please try after '11' seconds. Tracking Id is x"
        )
        wait = compute_wait_seconds(
            exc,
            attempt=1,
            initial_backoff=DEFAULT_INITIAL_BACKOFF,
            max_backoff=DEFAULT_MAX_BACKOFF,
            rng=random.Random(0),
        )
        # Hint of 11s plus jitter of up to 10% (=1.1s).
        self.assertGreaterEqual(wait, 11.0)
        self.assertLessEqual(wait, 12.1)

    def test_uses_retry_after_header(self):
        exc = _StubAzureError(
            "throttled", status_code=429, headers={"Retry-After": "7"}
        )
        wait = compute_wait_seconds(
            exc,
            attempt=1,
            initial_backoff=DEFAULT_INITIAL_BACKOFF,
            max_backoff=DEFAULT_MAX_BACKOFF,
            rng=random.Random(0),
        )
        self.assertGreaterEqual(wait, 7.0)
        self.assertLessEqual(wait, 7.7 + 0.001)

    def test_caps_hint_at_max_backoff(self):
        exc = _StubAzureError(
            "(ServerBusy) Please try after '600' seconds"
        )
        wait = compute_wait_seconds(
            exc,
            attempt=1,
            initial_backoff=DEFAULT_INITIAL_BACKOFF,
            max_backoff=30.0,
            rng=random.Random(0),
        )
        self.assertLessEqual(wait, 30.0)

    def test_exponential_backoff_without_hint(self):
        exc = _StubAzureError("(TooManyRequests)")
        rng = random.Random(0)
        waits = [
            compute_wait_seconds(
                exc,
                attempt=attempt,
                initial_backoff=1.0,
                max_backoff=10.0,
                rng=rng,
            )
            for attempt in range(1, 5)
        ]
        # Backoff caps are 1, 2, 4, 8 seconds (full jitter -> 0..cap).
        self.assertLessEqual(waits[0], 1.0)
        self.assertLessEqual(waits[1], 2.0)
        self.assertLessEqual(waits[2], 4.0)
        self.assertLessEqual(waits[3], 8.0)


class CallWithThrottleRetryTests(TestCase):
    def test_returns_on_first_success(self):
        calls = {"n": 0}

        def fn():
            calls["n"] += 1
            return "ok"

        result = call_with_throttle_retry(
            fn,
            label="test",
            sleep=lambda _: None,
        )
        self.assertEqual(result, "ok")
        self.assertEqual(calls["n"], 1)

    def test_retries_then_succeeds(self):
        attempts = {"n": 0}
        sleeps: list[float] = []

        def fn():
            attempts["n"] += 1
            if attempts["n"] < 3:
                raise _StubAzureError(
                    "(ResourceCollectionRequestsThrottled) please try after '1' seconds",
                    status_code=429,
                )
            return ["resource-1", "resource-2"]

        result = call_with_throttle_retry(
            fn,
            label="test",
            max_attempts=5,
            initial_backoff=0.1,
            max_backoff=2.0,
            max_total_wait=60.0,
            sleep=sleeps.append,
            rng=random.Random(0),
        )
        self.assertEqual(result, ["resource-1", "resource-2"])
        self.assertEqual(attempts["n"], 3)
        self.assertEqual(len(sleeps), 2)

    def test_non_throttle_error_propagates_immediately(self):
        attempts = {"n": 0}

        def fn():
            attempts["n"] += 1
            raise ValueError("boom")

        with self.assertRaises(ValueError):
            call_with_throttle_retry(fn, label="test", sleep=lambda _: None)
        self.assertEqual(attempts["n"], 1)

    def test_gives_up_after_max_attempts(self):
        attempts = {"n": 0}

        def fn():
            attempts["n"] += 1
            raise _StubAzureError(
                "(TooManyRequests)",
                status_code=429,
            )

        with self.assertRaises(_StubAzureError):
            call_with_throttle_retry(
                fn,
                label="test",
                max_attempts=3,
                initial_backoff=0.01,
                max_backoff=0.01,
                max_total_wait=10.0,
                sleep=lambda _: None,
                rng=random.Random(0),
            )
        self.assertEqual(attempts["n"], 3)

    def test_gives_up_when_total_wait_would_exceed_cap(self):
        attempts = {"n": 0}

        def fn():
            attempts["n"] += 1
            raise _StubAzureError(
                "(ServerBusy) Please try after '60' seconds"
            )

        with self.assertRaises(_StubAzureError):
            call_with_throttle_retry(
                fn,
                label="test",
                max_attempts=10,
                initial_backoff=1.0,
                max_backoff=120.0,
                max_total_wait=30.0,
                sleep=lambda _: None,
                rng=random.Random(0),
            )
        # 60s hint vs 30s cap -> bail after the first attempt.
        self.assertEqual(attempts["n"], 1)

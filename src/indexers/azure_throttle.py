"""Throttle-aware retry helper for Azure SDK list operations.

The Azure Resource Manager surface (and several individual RPs such as
``Microsoft.Storage/storageAccounts/read``) returns ``429`` with a
``ResourceCollectionRequestsThrottled`` body when discovery hits per-subscription
read limits. ``azure-mgmt-*`` clients do not retry these by default — they
surface an ``HttpResponseError`` that previously aborted the affected list call
entirely. That dropped the resource type for that subscription / RG for the
whole discovery run.

This helper wraps a single SDK call (typically ``list(...)`` materialised from
a paged iterable) and retries on:

* HTTP 429 (`Too Many Requests`)
* Azure throttle error codes (``ResourceCollectionRequestsThrottled``,
  ``TooManyRequests``, ``SubscriptionRequestsThrottled``,
  ``ServerBusy``, ``ServerTimeout``) regardless of status, since the ARM
  envelope sometimes returns 5xx with these codes during throttling).
* HTTP 503 and 504 (transient ARM unavailability).

When Azure includes a wait hint — either a ``Retry-After`` header or the
"Please try after 'N' seconds" sentence in the message body — that value is
respected. Otherwise an exponential backoff with jitter is used, capped at
``max_backoff_seconds``. Total retries are bounded by ``max_attempts``.

The retried callable must be **idempotent**. Azure list operations are.
"""

from __future__ import annotations

import logging
import random
import re
import time
from typing import Any, Callable, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Defaults (also exposed as Setting defaults in azureapi.py)
# ---------------------------------------------------------------------------

DEFAULT_MAX_ATTEMPTS = 6
DEFAULT_INITIAL_BACKOFF = 2.0
DEFAULT_MAX_BACKOFF = 60.0
DEFAULT_MAX_TOTAL_WAIT = 180.0

# Throttle/error-code substrings we treat as retryable.
_THROTTLE_CODES = (
    "ResourceCollectionRequestsThrottled",
    "SubscriptionRequestsThrottled",
    "ResourceRequestsThrottled",
    "TooManyRequests",
    "ServerBusy",
    "ServerTimeout",
    "RequestThrottled",
)

_RETRYABLE_STATUS = {408, 429, 500, 502, 503, 504}

# "Please try after '11' seconds" / "Please try after 11 seconds".
_RETRY_AFTER_RE = re.compile(
    r"try\s+after\s+['\"]?(\d+)['\"]?\s+seconds", re.IGNORECASE
)


def _extract_status_code(exc: BaseException) -> Optional[int]:
    """Best-effort extraction of an HTTP status code from azure-core exceptions."""
    status = getattr(exc, "status_code", None)
    if isinstance(status, int):
        return status
    response = getattr(exc, "response", None)
    if response is not None:
        rs = getattr(response, "status_code", None)
        if isinstance(rs, int):
            return rs
    return None


def _extract_retry_after_header(exc: BaseException) -> Optional[float]:
    response = getattr(exc, "response", None)
    if response is None:
        return None
    headers = getattr(response, "headers", None)
    if not headers:
        return None
    try:
        raw = headers.get("Retry-After") or headers.get("retry-after")
    except (AttributeError, TypeError):
        return None
    if raw is None:
        return None
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None


def _extract_retry_after_message(exc: BaseException) -> Optional[float]:
    message = str(exc) or ""
    match = _RETRY_AFTER_RE.search(message)
    if match is None:
        return None
    try:
        return float(match.group(1))
    except (TypeError, ValueError):
        return None


def is_throttle_error(exc: BaseException) -> bool:
    status = _extract_status_code(exc)
    if status in _RETRYABLE_STATUS:
        return True
    message = str(exc) or ""
    return any(code in message for code in _THROTTLE_CODES)


def compute_wait_seconds(
    exc: BaseException,
    *,
    attempt: int,
    initial_backoff: float,
    max_backoff: float,
    rng: Optional[random.Random] = None,
) -> float:
    """Decide how long to wait before the next retry.

    Honors ``Retry-After`` header and "Please try after 'N' seconds" hints
    when present; otherwise exponential backoff with full jitter, capped at
    ``max_backoff``.
    """
    hinted = _extract_retry_after_header(exc) or _extract_retry_after_message(exc)
    if hinted is not None and hinted > 0:
        # Add a small jitter on top of the server hint so concurrent
        # callers don't retry in lockstep.
        jitter = (rng or random).uniform(0.0, min(1.0, hinted * 0.1))
        return min(max_backoff, hinted + jitter)

    backoff = initial_backoff * (2 ** max(0, attempt - 1))
    backoff = min(max_backoff, backoff)
    # Full jitter (AWS architecture blog pattern) avoids retry storms.
    return (rng or random).uniform(0.0, backoff)


def call_with_throttle_retry(
    func: Callable[[], Any],
    *,
    label: str,
    max_attempts: int = DEFAULT_MAX_ATTEMPTS,
    initial_backoff: float = DEFAULT_INITIAL_BACKOFF,
    max_backoff: float = DEFAULT_MAX_BACKOFF,
    max_total_wait: float = DEFAULT_MAX_TOTAL_WAIT,
    sleep: Callable[[float], None] = time.sleep,
    rng: Optional[random.Random] = None,
) -> Any:
    """Run ``func`` with retry on Azure throttle/transient errors.

    ``label`` is included in log messages so operators can correlate retries
    with the resource type / scope that triggered them.
    Raises the last exception when ``max_attempts`` or ``max_total_wait`` is
    exhausted, or immediately if the exception is not classified as a throttle.
    """
    total_wait = 0.0
    for attempt in range(1, max_attempts + 1):
        try:
            return func()
        except Exception as exc:  # noqa: BLE001 - SDK raises many concrete types
            if not is_throttle_error(exc):
                raise
            if attempt >= max_attempts:
                logger.warning(
                    "Azure throttled %s; exhausted %d attempts, giving up: %s",
                    label,
                    max_attempts,
                    exc,
                )
                raise
            wait = compute_wait_seconds(
                exc,
                attempt=attempt,
                initial_backoff=initial_backoff,
                max_backoff=max_backoff,
                rng=rng,
            )
            if total_wait + wait > max_total_wait:
                logger.warning(
                    "Azure throttled %s; would exceed max_total_wait=%.1fs "
                    "after %d attempts, giving up: %s",
                    label,
                    max_total_wait,
                    attempt,
                    exc,
                )
                raise
            total_wait += wait
            logger.info(
                "Azure throttled %s (attempt %d/%d); sleeping %.1fs before retry: %s",
                label,
                attempt,
                max_attempts,
                wait,
                _short_error(exc),
            )
            sleep(wait)
    # Unreachable: loop either returns or raises.
    raise RuntimeError(f"call_with_throttle_retry({label}) exited loop unexpectedly")


def _short_error(exc: BaseException) -> str:
    """One-line summary of the SDK error for log breadcrumbs."""
    message = str(exc) or exc.__class__.__name__
    first_line = message.splitlines()[0].strip()
    if len(first_line) > 240:
        first_line = first_line[:237] + "..."
    return first_line

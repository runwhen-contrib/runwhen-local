"""
Normalize Azure SDK model objects into the flat dict shape that
``AzurePlatformHandler.parse_resource_data`` already understands.

Goal: produce a ``resource_data`` dict that is *behaviourally* equivalent to a
row from the legacy CloudQuery SQLite intermediate. ``parse_resource_data``
relies on a small handful of fields:

* ``id``                - ARM path; used to extract subscription_id and the parent RG.
* ``name``              - top-level resource name.
* ``type``              - ARM type string.
* ``location``          - region.
* ``tags``              - dict, defaults to ``{}``.
* ``subscription_id``   - column-level; the parser prefers the value parsed
                          out of ``id`` but warns if this column disagrees, so
                          we always set it explicitly.

Everything else (``properties``, ``sku``, ``identity``, etc.) is passed
through to ``resource_data["resource"]`` for generation-rule path matching.
We intentionally **do not** mirror the CloudQuery ``_cq_*`` metadata columns;
they exist only because CloudQuery wrote those rows. Tests diff
``resource-dump.yaml`` ignoring ``_cq_*`` keys.
"""

from __future__ import annotations

import datetime
import enum
import logging
import re
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Top-level keys the CloudQuery sync emits in snake_case. The Azure SDK
# returns them in camelCase via ``as_dict()``; we rename so existing rules
# that path-match on these keys still work.
_TOP_LEVEL_SNAKE_KEYS = {
    "extendedLocation": "extended_location",
    "managedBy": "managed_by",
    "managedByExtended": "managed_by_extended",
    "subscriptionId": "subscription_id",
}

_CAMEL_RE = re.compile(r"(?<!^)(?=[A-Z])")


def _camel_to_snake(name: str) -> str:
    return _CAMEL_RE.sub("_", name).lower()


def _sanitize(value: Any) -> Any:
    """Recursively convert SDK-returned values into YAML-friendly primitives.

    The Azure SDK occasionally returns ``datetime`` instances and Enum values
    inside ``properties``; both serialize awkwardly via PyYAML's safe dumper
    that the registry uses. CloudQuery already serializes these as strings, so
    matching that behaviour keeps the output stable.
    """
    if isinstance(value, datetime.datetime):
        return value.isoformat()
    if isinstance(value, datetime.date):
        return value.isoformat()
    if isinstance(value, enum.Enum):
        return value.value if isinstance(value.value, (str, int, float, bool)) else str(value)
    if isinstance(value, dict):
        return {k: _sanitize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_sanitize(v) for v in value]
    if isinstance(value, tuple):
        return [_sanitize(v) for v in value]
    return value


def _model_to_dict(model: Any) -> dict[str, Any]:
    """Convert an Azure SDK model into a plain dict.

    Most Azure SDK models expose ``.as_dict(keep_readonly=True)``. We fall back
    to ``__dict__`` for the rare objects (or test doubles) that don't.
    """
    if isinstance(model, dict):
        return dict(model)

    as_dict_fn = getattr(model, "as_dict", None)
    if callable(as_dict_fn):
        try:
            return as_dict_fn(keep_readonly=True)
        except TypeError:
            return as_dict_fn()

    if hasattr(model, "__dict__"):
        return {k: v for k, v in vars(model).items() if not k.startswith("_")}

    raise TypeError(f"Cannot convert Azure SDK model of type {type(model).__name__} to dict")


def _rename_top_level_keys(data: dict[str, Any]) -> dict[str, Any]:
    """Rename the small set of well-known Azure top-level fields from camelCase
    to snake_case so generation rules that already path-match these keys (the
    CloudQuery shape) keep working unchanged.

    Anything we don't explicitly know about is left in its native key form.
    """
    out: dict[str, Any] = {}
    for key, value in data.items():
        new_key = _TOP_LEVEL_SNAKE_KEYS.get(key, key)
        out[new_key] = value
    return out


def normalize_azure_resource(
    model: Any,
    *,
    subscription_id: str,
    resource_type_name: str,
) -> dict[str, Any]:
    """Convert an Azure SDK model into the ``resource_data`` dict shape that
    :class:`enrichers.azure.AzurePlatformHandler.parse_resource_data` accepts.

    Parameters
    ----------
    model:
        An Azure SDK model object (e.g. ``ResourceGroup``,
        ``VirtualMachine``, ``StorageAccount``).
    subscription_id:
        The subscription this resource was discovered in. We always inject
        this so the parser doesn't have to guess.
    resource_type_name:
        The runwhen-local registry resource type name (e.g. ``"resource_group"``,
        ``"azure_storage_accounts"``). Used for diagnostic logging only.
    """
    raw = _model_to_dict(model)
    raw = _rename_top_level_keys(raw)
    raw = _sanitize(raw)

    # ``id``/``name``/``type``/``location`` come straight off the SDK model.
    # Most Azure SDK models include them, but a small number of older models
    # don't expose ``type`` even though the REST payload does. We don't
    # synthesize anything we can't read from the SDK - that's a normalizer
    # bug, not something to paper over.

    # ``tags`` is the one field generation rules rely on existing as a dict
    # at the top level of the raw payload. SDKs return ``None`` when no tags
    # are set; normalize to an empty dict so the parser's
    # ``resource_data.get("tags", {})`` and gen-rule tag matchers behave the
    # same way they did under CloudQuery.
    if raw.get("tags") is None:
        raw["tags"] = {}

    # Always stamp the subscription. The parser prefers the value parsed from
    # ``id`` and warns on mismatch, but we want to provide a value here for
    # any code path that reads the column directly.
    raw["subscription_id"] = str(subscription_id)

    if not raw.get("id"):
        logger.warning(
            f"Azure SDK model for resource_type_name={resource_type_name!r} "
            f"in subscription {subscription_id} has no 'id' field; "
            f"parse_resource_data will likely fail to link this resource."
        )

    return raw

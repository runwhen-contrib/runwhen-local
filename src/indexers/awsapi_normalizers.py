"""
Normalize AWS Cloud Control API resources and typed boto3 service payloads into
the flat dict shape that ``AWSPlatformHandler.parse_resource_data`` already
understands.

Goal: produce a ``resource_data`` dict behaviourally equivalent to a row from
the legacy CloudQuery SQLite intermediate. ``parse_resource_data`` relies on a
small handful of fields:

* ``arn``         - REQUIRED. The handler parses it for account/region/service
                    and uses ``arn.resource_id`` as a name fallback.
* ``name``        - short resource name (falls back to the ARN resource id).
* ``account_id``  - owning account (falls back to the ARN account segment).
* ``region``      - placement (falls back to the ARN region segment).
* ``tags``        - dict, defaults to ``{}``. AWS tags (a list of
                    ``{"Key","Value"}`` pairs, or a dict) are normalized here so
                    cross-cloud include/exclude tag matchers work unchanged.

Everything else (the full API representation) is passed through at the top level
of the dict so generation-rule path matching keeps working.

This module must not import ``boto3``: it operates on plain dicts and duck-typed
objects so the test suite runs without the AWS SDK.
"""

from __future__ import annotations

import datetime
import enum
import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


def _sanitize(value: Any) -> Any:
    """Recursively convert SDK values into YAML-friendly primitives.

    Mirrors ``gcpapi_normalizers._sanitize`` / ``azureapi_normalizers._sanitize``:
    datetimes / enums become strings so PyYAML's safe dumper (used by the
    resource store) is happy and the output matches what CloudQuery serialized.
    """
    if isinstance(value, datetime.datetime):
        return value.isoformat()
    if isinstance(value, datetime.date):
        return value.isoformat()
    if isinstance(value, enum.Enum):
        return value.value if isinstance(value.value, (str, int, float, bool)) else str(value)
    if isinstance(value, dict):
        return {k: _sanitize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_sanitize(v) for v in value]
    return value


def normalize_tags(raw: Any) -> dict[str, str]:
    """Normalize AWS tags into a ``{key: value}`` dict.

    AWS APIs express tags either as a list of ``{"Key": ..., "Value": ...}``
    pairs (most services) or as an already-flat dict (a few). Both collapse to
    the canonical dict the cross-cloud tag matchers expect.
    """
    if isinstance(raw, dict):
        return {str(k): ("" if v is None else str(v)) for k, v in raw.items()}
    out: dict[str, str] = {}
    if isinstance(raw, (list, tuple)):
        for item in raw:
            if not isinstance(item, dict):
                continue
            key = item.get("Key", item.get("key"))
            value = item.get("Value", item.get("value"))
            if key is not None:
                out[str(key)] = "" if value is None else str(value)
    return out


_ARN_KEYS = ("Arn", "ARN", "arn", "ResourceArn", "resource_arn")


def _find_arn(payload: dict[str, Any]) -> Optional[str]:
    """Find an ARN anywhere obvious in a payload.

    Prefers well-known keys, then falls back to any top-level key whose name
    ends in ``Arn``/``ARN`` and whose value looks like an ARN string.
    """
    for key in _ARN_KEYS:
        val = payload.get(key)
        if isinstance(val, str) and val.startswith("arn:"):
            return val
    for key, val in payload.items():
        if (
            isinstance(key, str)
            and (key.endswith("Arn") or key.endswith("ARN"))
            and isinstance(val, str)
            and val.startswith("arn:")
        ):
            return val
    return None


def _service_from_cfn(cfn_type: Optional[str]) -> str:
    """Lowercase service token from a CFN type (``AWS::EC2::Instance`` -> ``ec2``)."""
    if not cfn_type:
        return "cloudcontrol"
    parts = cfn_type.split("::")
    if len(parts) >= 2 and parts[1]:
        return parts[1].lower()
    return "cloudcontrol"


def _entity_from_cfn(cfn_type: Optional[str]) -> str:
    """Lowercase entity token from a CFN type (``AWS::EC2::Instance`` -> ``instance``)."""
    if not cfn_type:
        return "resource"
    parts = cfn_type.split("::")
    if len(parts) >= 3 and parts[2]:
        return parts[2].lower()
    return "resource"


def _synthesize_arn(
    *,
    cfn_type: Optional[str],
    region: Optional[str],
    account_id: Optional[str],
    identifier: Optional[str],
) -> str:
    """Build a best-effort ARN when the payload carries none.

    Many Cloud Control resource types expose an ``Arn`` property, but some only
    expose a primary identifier. The AWSPlatformHandler requires an ARN, so we
    synthesize a structurally-valid one (6 colon-separated segments) from the
    CFN type + scope. The handler parses it back into account/region/service.
    """
    service = _service_from_cfn(cfn_type)
    entity = _entity_from_cfn(cfn_type)
    region = region or ""
    account_id = str(account_id or "")
    ident = identifier or "unknown"
    return f"arn:aws:{service}:{region}:{account_id}:{entity}/{ident}"


_NAME_KEYS = (
    "Name",
    "name",
    "BucketName",
    "FunctionName",
    "ClusterName",
    "DBInstanceIdentifier",
    "DBClusterIdentifier",
    "TableName",
    "QueueName",
    "TopicName",
    "RoleName",
    "UserName",
    "GroupName",
    "KeyId",
    "InstanceId",
    "LoadBalancerName",
    "RepositoryName",
)


def _derive_name(payload: dict[str, Any], identifier: Optional[str]) -> Optional[str]:
    for key in _NAME_KEYS:
        val = payload.get(key)
        if isinstance(val, str) and val:
            return val
    if identifier:
        # Cloud Control identifiers can be composite (``a|b``); keep the leaf.
        return str(identifier).split("|")[-1]
    return None


def normalize_aws_resource(
    raw: Any,
    *,
    account_id: Optional[str],
    region: Optional[str],
    resource_type_name: str = "",
    cfn_type: Optional[str] = None,
    identifier: Optional[str] = None,
) -> dict[str, Any]:
    """Convert a plain AWS payload dict into a ``resource_data`` dict.

    Used by both the Cloud Control generic pass (after the JSON ``Properties``
    blob is parsed) and the typed boto3 collectors. The output shape is
    identical for both so the two passes are interchangeable, exactly mirroring
    the GCP CAI / typed split.
    """
    if not isinstance(raw, dict):
        raw = {}
    out: dict[str, Any] = _sanitize(dict(raw))

    out["tags"] = normalize_tags(raw.get("Tags") if "Tags" in raw else raw.get("tags"))

    if account_id:
        out["account_id"] = str(account_id)
    if region:
        out["region"] = region

    name = _derive_name(out, identifier)
    if name:
        out["name"] = name

    arn = _find_arn(out)
    if not arn:
        arn = _synthesize_arn(
            cfn_type=cfn_type,
            region=region,
            account_id=account_id,
            identifier=identifier or name,
        )
    out["arn"] = arn

    if not out.get("id"):
        out["id"] = identifier or arn or name

    if cfn_type:
        out.setdefault("cfn_type", cfn_type)

    return out


def normalize_cloudcontrol_resource(
    resource_description: Any,
    *,
    account_id: Optional[str],
    region: Optional[str],
    resource_type_name: str = "",
    cfn_type: Optional[str] = None,
) -> dict[str, Any]:
    """Convert a Cloud Control ``ResourceDescription`` into a ``resource_data`` dict.

    A Cloud Control ``list_resources`` / ``get_resource`` item looks like::

        {"Identifier": "i-0abc...", "Properties": "{\"InstanceId\": ...}"}

    ``Properties`` is a JSON-encoded string of the resource's CFN schema
    properties. We parse it, hoist it to the top level, and stamp the
    handler-read fields.
    """
    if isinstance(resource_description, dict):
        identifier = resource_description.get("Identifier") or resource_description.get(
            "identifier"
        )
        props_raw = resource_description.get("Properties") or resource_description.get(
            "properties"
        )
    else:
        identifier = getattr(resource_description, "identifier", None) or getattr(
            resource_description, "Identifier", None
        )
        props_raw = getattr(resource_description, "properties", None) or getattr(
            resource_description, "Properties", None
        )

    props: dict[str, Any]
    if isinstance(props_raw, str):
        try:
            parsed = json.loads(props_raw)
            props = parsed if isinstance(parsed, dict) else {}
        except (ValueError, TypeError):
            props = {}
    elif isinstance(props_raw, dict):
        props = dict(props_raw)
    else:
        props = {}

    return normalize_aws_resource(
        props,
        account_id=account_id,
        region=region,
        resource_type_name=resource_type_name,
        cfn_type=cfn_type,
        identifier=identifier,
    )


def make_account_resource_data(
    account_id: str,
    account_name: Optional[str] = None,
    account_alias: Optional[str] = None,
) -> dict[str, Any]:
    """Build the ``resource_data`` dict for a synthesized account anchor.

    ``aws_iam_accounts`` is the mandatory anchor every other AWS resource is
    scoped under (account_id / account_name). We materialize it from the
    resolved credentials alone (no Cloud Control call): the handler needs an
    ARN, a name, an account id and a region, all of which we can supply for the
    account root.
    """
    aid = str(account_id)
    data: dict[str, Any] = {
        "account_id": aid,
        "name": account_name or aid,
        "id": aid,
        "arn": f"arn:aws:iam::{aid}:root",
        "region": "global",
        "cfn_type": None,
        "tags": {},
    }
    if account_alias:
        data["account_alias"] = account_alias
    if account_name:
        data["account_name"] = account_name
    return data

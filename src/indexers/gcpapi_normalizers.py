"""
Normalize Cloud Asset Inventory (CAI) assets and ``google-cloud-*`` SDK models
into the flat dict shape that ``GCPPlatformHandler.parse_resource_data`` already
understands.

Goal: produce a ``resource_data`` dict behaviourally equivalent to a row from
the legacy CloudQuery SQLite intermediate. ``parse_resource_data`` relies on a
small handful of fields:

* ``project_id``        - the owning project; the parser links every resource
                          to its parent ``project`` resource via this.
* ``name``              - short resource name (last path segment).
* ``id``                - full resource path; used as a name fallback.
* ``zone`` / ``region`` / ``location`` - placement; the parser derives region
                          from zone when needed.
* ``tags``              - dict, defaults to ``{}``. GCP user ``labels`` are
                          copied here so cross-cloud include/exclude tag
                          matchers work unchanged.

Everything else (the full API representation) is passed through at the top
level of the dict so generation-rule path matching keeps working, and the
original ``labels`` map is preserved for the ``gcp-tags.yaml`` template which
matches ``match_resource.labels``.

This module must not import any ``google-*`` packages: it operates on plain
dicts and duck-typed objects so the test suite runs without the GCP SDK.
"""

from __future__ import annotations

import datetime
import enum
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


def _sanitize(value: Any) -> Any:
    """Recursively convert SDK values into YAML-friendly primitives.

    Mirrors ``azureapi_normalizers._sanitize``: datetimes / enums become
    strings so PyYAML's safe dumper (used by the resource store) is happy and
    the output matches what CloudQuery serialized.
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


def _to_plain_dict(obj: Any) -> dict[str, Any]:
    """Best-effort conversion of an SDK message / asset into a plain dict.

    Handles, in order: an already-plain dict; proto-plus messages
    (``type(msg).to_dict(msg)``); objects exposing ``as_dict()`` /
    ``to_dict()``; finally a shallow ``vars()`` fallback.
    """
    if isinstance(obj, dict):
        return dict(obj)

    # proto-plus message: the message *class* exposes a static to_dict.
    to_dict_cls = getattr(type(obj), "to_dict", None)
    if callable(to_dict_cls):
        try:
            return to_dict_cls(obj)
        except Exception:  # pragma: no cover - defensive
            pass

    for attr in ("as_dict", "to_dict"):
        fn = getattr(obj, attr, None)
        if callable(fn):
            try:
                return fn()
            except Exception:  # pragma: no cover - defensive
                continue

    if hasattr(obj, "__dict__"):
        return {k: v for k, v in vars(obj).items() if not k.startswith("_")}

    raise TypeError(f"Cannot convert GCP object of type {type(obj).__name__} to dict")


def _short_name(full_name: Optional[str]) -> Optional[str]:
    """Return the last path segment of a GCP resource name/self-link."""
    if not full_name:
        return None
    # CAI names look like //compute.googleapis.com/projects/p/zones/z/instances/i
    return full_name.rstrip("/").split("/")[-1] or None


def _project_from_name(full_name: Optional[str]) -> Optional[str]:
    """Extract the project id from a ``.../projects/<id>/...`` path."""
    if not full_name:
        return None
    parts = full_name.split("/")
    for i, part in enumerate(parts):
        if part == "projects" and i + 1 < len(parts):
            return parts[i + 1]
    return None


def _region_from_location(location: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """Split a CAI ``location`` into ``(zone, region)`` heuristically.

    GCP locations are zones (``us-central1-a``), regions (``us-central1``),
    multi-regions (``us``/``eu``), or ``global``. We treat a 3-segment value as
    a zone and a 2-segment value as a region; everything else is left as a
    bare location for the handler to place.
    """
    if not location:
        return None, None
    segments = location.split("-")
    if len(segments) >= 3:
        return location, "-".join(segments[:-1])
    if len(segments) == 2:
        return None, location
    return None, None


def normalize_gcp_asset(
    asset: Any,
    *,
    project_id: Optional[str] = None,
    resource_type_name: str = "",
) -> dict[str, Any]:
    """Convert a Cloud Asset Inventory asset into a ``resource_data`` dict.

    ``asset`` is a ``google.cloud.asset_v1.Asset`` (or an equivalent dict in
    tests). With ``content_type=RESOURCE`` the asset carries the full API
    representation under ``resource.data``; we hoist that to the top level so
    generation-rule path matching sees the same fields CloudQuery exposed.
    """
    raw = _to_plain_dict(asset)
    raw = _sanitize(raw)

    asset_name = raw.get("name")  # //service.googleapis.com/projects/.../<id>
    asset_type = raw.get("asset_type") or raw.get("assetType")

    resource_blob = raw.get("resource") or {}
    if isinstance(resource_blob, dict):
        data = resource_blob.get("data") or {}
        location = resource_blob.get("location")
        self_link = resource_blob.get("discovery_name") and None  # placeholder, ignored
        self_link = resource_blob.get("self_link") or resource_blob.get("selfLink")
    else:
        data = {}
        location = None
        self_link = None

    if not isinstance(data, dict):
        data = {}

    # Start from the full API payload so path-matching rules work, then stamp
    # the well-known fields the handler reads.
    out: dict[str, Any] = dict(data)

    out["asset_type"] = asset_type
    if self_link or data.get("selfLink"):
        out["self_link"] = self_link or data.get("selfLink")

    # name: prefer the API payload's name, else the last segment of the asset name.
    name = data.get("name") or _short_name(asset_name)
    # Some GCP API payloads put a full path in ``name``; collapse to the leaf.
    if isinstance(name, str) and "/" in name:
        name = _short_name(name)
    if name:
        out["name"] = name

    # id: the full asset path is the most stable identifier.
    out["id"] = asset_name or data.get("id") or data.get("selfLink")

    # project_id: caller-supplied wins; else parse from the asset path.
    pid = project_id or _project_from_name(asset_name) or data.get("project")
    if pid:
        out["project_id"] = pid

    # placement: zone/region from the payload, else derived from CAI location.
    zone = data.get("zone")
    region = data.get("region")
    if isinstance(zone, str) and "/" in zone:
        zone = _short_name(zone)
    if isinstance(region, str) and "/" in region:
        region = _short_name(region)
    if not zone and not region:
        zone, region = _region_from_location(location)
    if zone:
        out["zone"] = zone
    if region:
        out["region"] = region
    elif location:
        out["location"] = location

    # labels -> tags so cross-cloud include/exclude matchers work; keep labels
    # too for the gcp-tags.yaml template.
    labels = data.get("labels")
    if not isinstance(labels, dict):
        labels = {}
    out["labels"] = labels
    out["tags"] = dict(labels)

    if not out.get("id") and not out.get("name"):
        logger.warning(
            f"CAI asset for resource_type_name={resource_type_name!r} "
            f"(asset_type={asset_type!r}) has neither id nor name; "
            f"parse_resource_data will likely fail to link it."
        )
    return out


def normalize_gcp_sdk_model(
    model: Any,
    *,
    project_id: str,
    resource_type_name: str = "",
    location: Optional[str] = None,
) -> dict[str, Any]:
    """Convert a typed ``google-cloud-*`` SDK model into a ``resource_data`` dict.

    Used by the typed-collector pass for rich-payload resources (compute
    instances, GKE clusters, ...). The model is flattened to a dict and the
    handler-read fields are stamped, keeping the output shape identical to the
    CAI path so both passes are interchangeable.
    """
    raw = _to_plain_dict(model)
    raw = _sanitize(raw)

    out: dict[str, Any] = dict(raw)
    out["project_id"] = project_id

    name = raw.get("name") or raw.get("display_name") or raw.get("displayName")
    if isinstance(name, str) and "/" in name:
        name = _short_name(name)
    if name:
        out["name"] = name

    if not out.get("id"):
        out["id"] = raw.get("self_link") or raw.get("selfLink") or raw.get("id") or name

    zone = raw.get("zone")
    region = raw.get("region")
    loc = location or raw.get("location")
    if isinstance(zone, str) and "/" in zone:
        zone = _short_name(zone)
    if isinstance(region, str) and "/" in region:
        region = _short_name(region)
    if not zone and not region:
        zone, region = _region_from_location(loc)
    if zone:
        out["zone"] = zone
    if region:
        out["region"] = region
    elif loc:
        out["location"] = loc

    labels = raw.get("labels")
    if not isinstance(labels, dict):
        labels = {}
    out["labels"] = labels
    out["tags"] = dict(labels)

    return out


def make_project_resource_data(project_id: str, display_name: Optional[str] = None) -> dict[str, Any]:
    """Build the ``resource_data`` dict for a synthesized ``project`` resource.

    ``gcp_projects`` is the mandatory anchor every other GCP resource links to.
    We can materialize it from the configured project id alone (no API call):
    ``parse_resource_data`` only requires ``project_id`` for the ``project``
    type and uses it as both the name and qualified name.
    """
    data: dict[str, Any] = {
        "project_id": project_id,
        "name": project_id,
        "id": f"//cloudresourcemanager.googleapis.com/projects/{project_id}",
        "asset_type": "cloudresourcemanager.googleapis.com/Project",
        "tags": {},
        "labels": {},
    }
    if display_name:
        data["display_name"] = display_name
    return data

"""
AWS resource-type specs for the native AWS SDK indexer.

Like GCP's Cloud Asset Inventory, AWS's **Cloud Control API**
(``cloudcontrol`` boto3 client, ``list_resources`` / ``get_resource``) is a
single broad API that can enumerate hundreds of resource types by their
CloudFormation type name (``AWS::<Service>::<Entity>``). It is therefore the
parity workhorse: one ``list_resources`` call per (account, region, CFN type)
covers every registry type that has a CFN type. Typed boto3 service collectors
are a thin enrichment layer for a handful of high-value resources (and the
synthesized account anchor).

Each :class:`AwsResourceTypeSpec` describes one collectable type. Specs are
materialized from the registry in ``aws_resource_type_registry.yaml`` (see
:mod:`aws_resource_type_registry`). To enable a richer typed collector for a
type:

* Make sure the table is in the registry (regenerate via
  ``scripts/aws/sync_aws_resource_type_registry.py`` if needed, and flag it as
  a ``typed_collector`` in the overrides YAML).
* Implement ``_collect_<type>`` below and register it in
  :data:`_TYPED_COLLECTORS` keyed by canonical CloudQuery table name.

The public surface (``AWS_RESOURCE_TYPE_SPECS``, ``AwsResourceTypeSpec``,
``find_spec``, ``find_spec_by_cfn_type``) is what ``indexers.awsapi`` consumes.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Iterable, Optional

from .aws_resource_type_registry import AwsResourceTypeEntry, load_registry

# A typed collector takes (session, account_id, region) and yields raw payload
# dicts (later run through ``normalize_aws_resource``).
AwsCollector = Callable[[Any, Optional[str], Optional[str]], Iterable[dict]]

# The canonical table name for the synthesized account anchor.
ACCOUNTS_TABLE = "aws_iam_accounts"


@dataclass(frozen=True)
class AwsResourceTypeSpec:
    resource_type_name: str
    cloudquery_table_name: str
    cfn_type: Optional[str]
    mandatory: bool
    # ``True`` when a hand-written boto3 collector ships for this type (rich/
    # extra payload, or the synthesized account anchor). ``False`` means the
    # type is materialized from the Cloud Control generic pass.
    typed: bool = False
    # Hand-written collector callable; ``None`` for generic specs and for the
    # synthesized account anchor (handled directly by the orchestrator).
    collector: Optional[AwsCollector] = None
    # ``True`` for region-scoped typed collectors (run once per region);
    # ``False`` for global services (e.g. S3, IAM) run once per account.
    regional: bool = True


# ---------------------------------------------------------------------------
# Typed collectors (rich-payload enrichment tier)
# ---------------------------------------------------------------------------
#
# All boto3 client construction is lazy (via the passed-in ``session``) so this
# module stays importable - and the test suite stays runnable - without the AWS
# SDK installed.

def _name_from_aws_tags(tags: Any) -> Optional[str]:
    """Return the value of the ``Name`` tag from an AWS tag list, if present."""
    if isinstance(tags, (list, tuple)):
        for item in tags:
            if isinstance(item, dict) and item.get("Key") == "Name":
                return item.get("Value")
    return None


def _collect_ec2_instances(session, account_id, region):
    """Typed collector for EC2 instances (regional)."""
    client = session.client("ec2", region_name=region)
    paginator = client.get_paginator("describe_instances")
    for page in paginator.paginate():
        for reservation in page.get("Reservations", []):
            for instance in reservation.get("Instances", []):
                inst = dict(instance)
                instance_id = inst.get("InstanceId")
                # describe_instances doesn't return an ARN; synthesize one so
                # the handler has the account/region/service it needs.
                inst.setdefault(
                    "Arn",
                    f"arn:aws:ec2:{region or ''}:{account_id or ''}:instance/{instance_id}",
                )
                inst["name"] = _name_from_aws_tags(inst.get("Tags")) or instance_id
                yield inst


def _collect_s3_buckets(session, account_id, region):
    """Typed collector for S3 buckets (global; region resolved per bucket)."""
    client = session.client("s3")
    resp = client.list_buckets()
    for bucket in resp.get("Buckets", []):
        name = bucket.get("Name")
        out = dict(bucket)
        out["name"] = name
        out["Arn"] = f"arn:aws:s3:::{name}"
        # Resolve the bucket's home region (best-effort).
        try:
            loc = client.get_bucket_location(Bucket=name)
            out["region"] = loc.get("LocationConstraint") or "us-east-1"
        except Exception:  # pragma: no cover - permission / network dependent
            pass
        # Resolve bucket tags (best-effort; untagged buckets raise).
        try:
            tagging = client.get_bucket_tagging(Bucket=name)
            out["Tags"] = tagging.get("TagSet", [])
        except Exception:  # pragma: no cover - NoSuchTagSet etc.
            out["Tags"] = []
        yield out


# Maps canonical CQ table name -> (collector callable, regional flag).
_TYPED_COLLECTORS: dict[str, tuple[AwsCollector, bool]] = {
    "aws_ec2_instances": (_collect_ec2_instances, True),
    "aws_s3_buckets": (_collect_s3_buckets, False),
}


# ---------------------------------------------------------------------------
# Cloud Control generic collector (the catch-all parity pass)
# ---------------------------------------------------------------------------

def collect_cloudcontrol_resources(session, region: str, cfn_type: str):
    """List Cloud Control resources of one CFN type in one region.

    Yields ``ResourceDescription`` dicts (each with ``Identifier`` +
    ``Properties``) for ``cfn_type`` (e.g. ``AWS::S3::Bucket``). The
    ``cloudcontrol`` client + paginator are constructed lazily from the passed
    ``session`` so importing this module never requires boto3.
    """
    client = session.client("cloudcontrol", region_name=region)
    paginator = client.get_paginator("list_resources")
    for page in paginator.paginate(TypeName=cfn_type):
        for desc in page.get("ResourceDescriptions", []):
            yield desc


# ---------------------------------------------------------------------------
# Spec materialization
# ---------------------------------------------------------------------------

def _legacy_resource_type_name(entry: AwsResourceTypeEntry) -> str:
    """Pick the ``resource_type_name`` surfaced to generation rules.

    Historically a few AWS types were referenced by short legacy names
    (``account``, ``ec2_instance``) and everything else by the CloudQuery table
    name. The registry encodes both via ``cloudquery_table_name`` + ``aliases``;
    prefer the first alias (legacy short name) when present.
    """
    if entry.aliases:
        return entry.aliases[0]
    return entry.cloudquery_table_name


def _make_spec(entry: AwsResourceTypeEntry) -> AwsResourceTypeSpec:
    collector_info = _TYPED_COLLECTORS.get(entry.cloudquery_table_name)
    collector = collector_info[0] if collector_info else None
    regional = collector_info[1] if collector_info else True
    return AwsResourceTypeSpec(
        resource_type_name=_legacy_resource_type_name(entry),
        cloudquery_table_name=entry.cloudquery_table_name,
        cfn_type=entry.cfn_type,
        mandatory=entry.mandatory,
        typed=bool(entry.typed_collector or collector is not None),
        collector=collector,
        regional=regional,
    )


def _build_specs() -> tuple[AwsResourceTypeSpec, ...]:
    """Materialize one ``AwsResourceTypeSpec`` per registry entry."""
    registry = load_registry()
    specs: list[AwsResourceTypeSpec] = []

    # Account anchor first (mandatory bootstrap everything is scoped under).
    accounts_entry = registry.find(ACCOUNTS_TABLE)
    if accounts_entry is not None:
        specs.append(_make_spec(accounts_entry))

    for entry in registry:
        if entry.cloudquery_table_name == ACCOUNTS_TABLE:
            continue
        specs.append(_make_spec(entry))

    return tuple(specs)


AWS_RESOURCE_TYPE_SPECS: tuple[AwsResourceTypeSpec, ...] = _build_specs()

# Convenience subset for callers that only want the typed (rich/SDK) tier.
AWS_TYPED_RESOURCE_TYPE_SPECS: tuple[AwsResourceTypeSpec, ...] = tuple(
    s for s in AWS_RESOURCE_TYPE_SPECS if s.collector is not None
)


# ---------------------------------------------------------------------------
# Lookup
# ---------------------------------------------------------------------------

def find_spec(name_or_table: str) -> Optional[AwsResourceTypeSpec]:
    """Look up an AWS resource type spec by registry name, alias, or CQ table.

    Returns a spec for any name the registry knows about. Returning ``None``
    means "this name is not a registered AWS resource type at all".
    """
    if not name_or_table:
        return None
    for spec in AWS_RESOURCE_TYPE_SPECS:
        if name_or_table in (spec.resource_type_name, spec.cloudquery_table_name):
            return spec
    entry = load_registry().find(name_or_table)
    if entry is None:
        return None
    for spec in AWS_RESOURCE_TYPE_SPECS:
        if spec.cloudquery_table_name == entry.cloudquery_table_name:
            return spec
    return None


def find_spec_by_cfn_type(cfn_type: Optional[str]) -> Optional[AwsResourceTypeSpec]:
    """Look up the spec whose ``cfn_type`` matches this string.

    Used by the Cloud Control generic pass in ``awsapi.index`` to route each
    returned resource back to the spec that owns its ``resource_type_name``.
    Case-insensitive.
    """
    if not cfn_type:
        return None
    entry = load_registry().find_by_cfn_type(cfn_type)
    if entry is None:
        return None
    for spec in AWS_RESOURCE_TYPE_SPECS:
        if spec.cloudquery_table_name == entry.cloudquery_table_name:
            return spec
    return None

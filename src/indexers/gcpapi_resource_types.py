"""
GCP resource-type specs for the native GCP SDK indexer.

Unlike Azure - where the generic ``resources.list()`` pass returns only a
sparse envelope - GCP's Cloud Asset Inventory (CAI) ``list_assets`` /
``search_all_resources`` with ``content_type=RESOURCE`` returns the **full**
API representation of each asset. CAI is therefore the parity workhorse: a
single call per project covers every registry type that has a CAI asset type,
with rich payloads. Typed ``google-cloud-*`` collectors are a thin enrichment
layer for a handful of high-value resources (and the synthesized ``project``
anchor).

Each :class:`GcpResourceTypeSpec` describes one collectable type. Specs are
materialized from the registry in ``gcp_resource_type_registry.yaml`` (see
:mod:`gcp_resource_type_registry`). To enable a richer typed collector for a
type:

* Make sure the table is in the registry (regenerate via
  ``scripts/gcp/sync_gcp_resource_type_registry.py`` if needed, and flag it as
  a ``typed_collector`` in the overrides YAML).
* Implement ``_collect_<type>`` below and register it in
  :data:`_TYPED_COLLECTORS` keyed by canonical CloudQuery table name.

The public surface (``GCP_RESOURCE_TYPE_SPECS``, ``GcpResourceTypeSpec``,
``find_spec``, ``find_spec_by_cai_type``) is what ``indexers.gcpapi`` consumes.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Iterable, Optional

from .gcp_resource_type_registry import GcpResourceTypeEntry, load_registry

# A typed collector takes (credentials, project_id) and yields SDK models.
GcpCollector = Callable[[Any, str], Iterable[Any]]

# The canonical table name for the synthesized project anchor.
PROJECTS_TABLE = "gcp_projects"


@dataclass(frozen=True)
class GcpResourceTypeSpec:
    resource_type_name: str
    cloudquery_table_name: str
    cai_asset_type: Optional[str]
    mandatory: bool
    # ``True`` when a hand-written google-cloud-* collector ships for this type
    # (rich/extra payload, or the synthesized project anchor). ``False`` means
    # the type is materialized from the Cloud Asset Inventory generic pass.
    typed: bool = False
    # Hand-written collector callable; ``None`` for generic specs and for the
    # synthesized ``project`` anchor (handled directly by the orchestrator).
    collector: Optional[GcpCollector] = None


# ---------------------------------------------------------------------------
# Typed collectors (rich-payload enrichment tier)
# ---------------------------------------------------------------------------
#
# All google-cloud-* imports are lazy so this module stays importable - and the
# test suite stays runnable - without the GCP SDK installed.

def _collect_compute_instances(credentials, project_id):
    from google.cloud import compute_v1  # noqa: WPS433

    client = compute_v1.InstancesClient(credentials=credentials)
    # aggregated_list returns (zone, scoped_list) pairs across all zones.
    for _zone, scoped in client.aggregated_list(project=project_id):
        for instance in getattr(scoped, "instances", None) or []:
            yield instance


def _collect_storage_buckets(credentials, project_id):
    from google.cloud import storage  # noqa: WPS433

    client = storage.Client(project=project_id, credentials=credentials)
    return client.list_buckets()


def _collect_container_clusters(credentials, project_id):
    from google.cloud import container_v1  # noqa: WPS433

    client = container_v1.ClusterManagerClient(credentials=credentials)
    parent = f"projects/{project_id}/locations/-"
    response = client.list_clusters(parent=parent)
    return getattr(response, "clusters", None) or []


# ---- Tier 1 compute fallbacks (no new dependency; google-cloud-compute) -----
#
# These mirror ``_collect_compute_instances``: aggregated_list yields
# ``(scope, scoped_list)`` pairs across every zone/region, where each
# ``scoped_list`` carries either a per-scope resource list or a ``warning``
# entry (for scopes with nothing / no permission). We defensively read the
# resource attribute and skip warning-only scopes. The plain ``list`` calls
# cover global resources. Each call returns a pager that transparently handles
# pagination, so materializing it (``list(...)`` in the orchestrator) walks
# every page.

def _collect_compute_disks(credentials, project_id):
    from google.cloud import compute_v1  # noqa: WPS433

    client = compute_v1.DisksClient(credentials=credentials)
    for _zone, scoped in client.aggregated_list(project=project_id):
        for disk in getattr(scoped, "disks", None) or []:
            yield disk


def _collect_compute_snapshots(credentials, project_id):
    from google.cloud import compute_v1  # noqa: WPS433

    # Snapshots are a global resource: a flat list, no aggregation.
    client = compute_v1.SnapshotsClient(credentials=credentials)
    return client.list(project=project_id)


def _collect_compute_networks(credentials, project_id):
    from google.cloud import compute_v1  # noqa: WPS433

    # Networks (VPCs) are global.
    client = compute_v1.NetworksClient(credentials=credentials)
    return client.list(project=project_id)


def _collect_compute_subnetworks(credentials, project_id):
    from google.cloud import compute_v1  # noqa: WPS433

    client = compute_v1.SubnetworksClient(credentials=credentials)
    for _region, scoped in client.aggregated_list(project=project_id):
        for subnet in getattr(scoped, "subnetworks", None) or []:
            yield subnet


def _collect_compute_firewalls(credentials, project_id):
    from google.cloud import compute_v1  # noqa: WPS433

    # Firewall rules are global.
    client = compute_v1.FirewallsClient(credentials=credentials)
    return client.list(project=project_id)


def _collect_compute_addresses(credentials, project_id):
    from google.cloud import compute_v1  # noqa: WPS433

    # Regional addresses; aggregated_list spans all regions. (Global/static
    # IPs are a separate table, gcp_compute_global_addresses.)
    client = compute_v1.AddressesClient(credentials=credentials)
    for _region, scoped in client.aggregated_list(project=project_id):
        for address in getattr(scoped, "addresses", None) or []:
            yield address


# ---- Tier 2 service fallbacks (each adds one idiomatic google-cloud-* dep) ---

def _collect_pubsub_topics(credentials, project_id):
    from google.cloud import pubsub_v1  # noqa: WPS433

    client = pubsub_v1.PublisherClient(credentials=credentials)
    # list_topics returns a pager yielding Topic messages whose ``name`` is the
    # full path projects/<p>/topics/<t>; the normalizer collapses it to the leaf.
    return client.list_topics(request={"project": f"projects/{project_id}"})


def _collect_pubsub_subscriptions(credentials, project_id):
    from google.cloud import pubsub_v1  # noqa: WPS433

    client = pubsub_v1.SubscriberClient(credentials=credentials)
    return client.list_subscriptions(
        request={"project": f"projects/{project_id}"}
    )


def _collect_iam_service_accounts(credentials, project_id):
    from google.cloud import iam_admin_v1  # noqa: WPS433

    client = iam_admin_v1.IAMClient(credentials=credentials)
    # The pager is iterable, yielding ServiceAccount messages (name is the full
    # path projects/<p>/serviceAccounts/<email>); pagination is transparent.
    request = iam_admin_v1.types.ListServiceAccountsRequest(
        name=f"projects/{project_id}"
    )
    return client.list_service_accounts(request=request)


# Maps canonical CQ table name -> typed collector callable. Adding an entry here
# automatically (a) flips the spec's ``typed`` flag and (b) excludes the type's
# CAI asset type from the Cloud Asset Inventory generic filter in
# ``gcpapi.index`` (write-once) - so each type below is discovered via its SDK
# collector whether or not CAI is available.
_TYPED_COLLECTORS: dict[str, GcpCollector] = {
    # Pre-existing rich-payload tier.
    "gcp_compute_instances": _collect_compute_instances,
    "gcp_storage_buckets": _collect_storage_buckets,
    "gcp_container_clusters": _collect_container_clusters,
    # Tier 1 - high-value compute types (no new dependency).
    "gcp_compute_disks": _collect_compute_disks,
    "gcp_compute_snapshots": _collect_compute_snapshots,
    "gcp_compute_networks": _collect_compute_networks,
    "gcp_compute_subnetworks": _collect_compute_subnetworks,
    "gcp_compute_firewalls": _collect_compute_firewalls,
    "gcp_compute_addresses": _collect_compute_addresses,
    # Tier 2 - idiomatic single-call service clients.
    "gcp_pubsub_topics": _collect_pubsub_topics,
    "gcp_pubsub_subscriptions": _collect_pubsub_subscriptions,
    "gcp_iam_service_accounts": _collect_iam_service_accounts,
}


# ---------------------------------------------------------------------------
# Cloud Asset Inventory generic collector (the catch-all parity pass)
# ---------------------------------------------------------------------------

def collect_assets_for_project(
    credentials,
    project_id: str,
    asset_types: Optional[list[str]] = None,
):
    """List Cloud Asset Inventory assets for one project.

    Returns ``google.cloud.asset_v1.Asset`` objects with ``content_type=RESOURCE``
    so each asset carries the full API representation under ``resource.data``.
    ``asset_types`` (CAI type strings, e.g. ``compute.googleapis.com/Instance``)
    scopes the call to exactly what generation rules referenced; passing
    ``None`` lists everything CAI tracks for the project.
    """
    from google.cloud import asset_v1  # noqa: WPS433

    client = asset_v1.AssetServiceClient(credentials=credentials)
    request = {
        "parent": f"projects/{project_id}",
        "content_type": asset_v1.ContentType.RESOURCE,
    }
    if asset_types:
        request["asset_types"] = list(asset_types)
    return client.list_assets(request=request)


# ---------------------------------------------------------------------------
# Spec materialization
# ---------------------------------------------------------------------------

def _legacy_resource_type_name(entry: GcpResourceTypeEntry) -> str:
    """Pick the ``resource_type_name`` surfaced to generation rules.

    Historically RWL gen rules referenced a few GCP types by short legacy
    names (``project``, ``compute_instance``) and others by the CloudQuery
    table name. The registry encodes both via ``cloudquery_table_name`` +
    ``aliases``; prefer the first alias (legacy short name) when present.

    NOTE (resource-type naming migration): matching is alias-aware via the
    registry's ``match_names`` accepted-name set, so this stored name need not
    equal what gen rules request. Flipping to the canonical/native name is
    staged as Phase 2 (the ``project`` anchor name is coupled into linking);
    see ``docs/architecture/resource-type-naming-migration.md``.
    """
    if entry.aliases:
        return entry.aliases[0]
    return entry.cloudquery_table_name


def _make_spec(entry: GcpResourceTypeEntry) -> GcpResourceTypeSpec:
    collector = _TYPED_COLLECTORS.get(entry.cloudquery_table_name)
    return GcpResourceTypeSpec(
        resource_type_name=_legacy_resource_type_name(entry),
        cloudquery_table_name=entry.cloudquery_table_name,
        cai_asset_type=entry.cai_asset_type,
        mandatory=entry.mandatory,
        typed=bool(entry.typed_collector or collector is not None),
        collector=collector,
    )


def _build_specs() -> tuple[GcpResourceTypeSpec, ...]:
    """Materialize one ``GcpResourceTypeSpec`` per registry entry."""
    registry = load_registry()
    specs: list[GcpResourceTypeSpec] = []

    # Project anchor first (mandatory bootstrap every other resource links to).
    projects_entry = registry.find(PROJECTS_TABLE)
    if projects_entry is not None:
        specs.append(_make_spec(projects_entry))

    for entry in registry:
        if entry.cloudquery_table_name == PROJECTS_TABLE:
            continue
        specs.append(_make_spec(entry))

    return tuple(specs)


GCP_RESOURCE_TYPE_SPECS: tuple[GcpResourceTypeSpec, ...] = _build_specs()

# Convenience subset for callers that only want the typed (rich/SDK) tier.
GCP_TYPED_RESOURCE_TYPE_SPECS: tuple[GcpResourceTypeSpec, ...] = tuple(
    s for s in GCP_RESOURCE_TYPE_SPECS if s.collector is not None
)


# ---------------------------------------------------------------------------
# Lookup
# ---------------------------------------------------------------------------

def find_spec(name_or_table: str) -> Optional[GcpResourceTypeSpec]:
    """Look up a GCP resource type spec by registry name, alias, or CQ table.

    Returns a spec for any name the registry knows about. Returning ``None``
    means "this name is not a registered GCP resource type at all".
    """
    if not name_or_table:
        return None
    for spec in GCP_RESOURCE_TYPE_SPECS:
        if name_or_table in (spec.resource_type_name, spec.cloudquery_table_name):
            return spec
    entry = load_registry().find(name_or_table)
    if entry is None:
        return None
    for spec in GCP_RESOURCE_TYPE_SPECS:
        if spec.cloudquery_table_name == entry.cloudquery_table_name:
            return spec
    return None


def find_spec_by_cai_type(cai_asset_type: Optional[str]) -> Optional[GcpResourceTypeSpec]:
    """Look up the spec whose ``cai_asset_type`` matches this string.

    Used by the Cloud Asset Inventory generic pass in ``gcpapi.index`` to route
    each ``asset.asset_type`` back to the spec that owns its
    ``resource_type_name``. Case-insensitive.
    """
    if not cai_asset_type:
        return None
    entry = load_registry().find_by_cai_type(cai_asset_type)
    if entry is None:
        return None
    for spec in GCP_RESOURCE_TYPE_SPECS:
        if spec.cloudquery_table_name == entry.cloudquery_table_name:
            return spec
    return None

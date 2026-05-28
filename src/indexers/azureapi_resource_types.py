"""
Azure resource-type specs for the native Azure SDK indexer.

Each :class:`AzureResourceTypeSpec` describes one collectable Azure resource
type and ships *two* collector callables:

* ``collector_all(credential, subscription_id)`` - subscription-wide listing,
  used when the workspace permits unbounded discovery (any non-NONE wildcard
  / global default).

* ``collector_in_rg(credential, subscription_id, rg_name)`` - resource-group
  scoped listing, used when the workspace declares a finite scope (e.g.
  ``defaultLOD: none`` + an explicit per-RG whitelist). Setting this to
  ``None`` opts a type out of selective discovery; it'll fall back to
  ``collector_all`` even in scoped mode.

Specs are derived from the registry in
``azure_resource_type_registry.yaml``; see
:mod:`azure_resource_type_registry`. The registry holds the metadata for
all 600+ CloudQuery Azure tables; this module only owns the small set of
hand-written ``azure-mgmt-*`` collectors. To enable a new type:

* Make sure the table is in the registry (regenerate via
  ``scripts/azure/sync_azure_resource_type_registry.py`` if needed).
* Implement ``_collect_<type>_all`` (and optionally ``_collect_<type>_in_rg``)
  below and register them in :data:`_TYPED_COLLECTORS` keyed by canonical
  CloudQuery table name.

The public surface (``AZURE_RESOURCE_TYPE_SPECS``, ``AzureResourceTypeSpec``,
``find_spec``) is preserved so existing callers (notably ``indexers.azureapi``)
keep working.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Iterable, Optional

from .azure_resource_type_registry import (
    AzureResourceTypeEntry,
    load_registry,
)

AzureCollectorAll = Callable[[Any, str], Iterable[Any]]
AzureCollectorInRg = Callable[[Any, str, str], Iterable[Any]]


@dataclass(frozen=True)
class AzureResourceTypeSpec:
    resource_type_name: str
    cloudquery_table_name: str
    mandatory: bool
    collector_all: AzureCollectorAll
    collector_in_rg: Optional[AzureCollectorInRg] = None

    @property
    def supports_in_rg(self) -> bool:
        return self.collector_in_rg is not None

    # Back-compat alias for callers that hadn't migrated to the two-method
    # split yet. ``collector(...)`` keeps the original (credential, sub_id)
    # signature.
    @property
    def collector(self) -> AzureCollectorAll:  # pragma: no cover - trivial
        return self.collector_all


# ---------------------------------------------------------------------------
# Subscription-wide collectors (used in unbounded-discovery mode)
# ---------------------------------------------------------------------------

def _collect_resource_groups_all(credential, subscription_id):
    from azure.mgmt.resource import ResourceManagementClient

    client = ResourceManagementClient(credential, subscription_id)
    return client.resource_groups.list()


def _collect_virtual_machines_all(credential, subscription_id):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.virtual_machines.list_all()


def _collect_storage_accounts_all(credential, subscription_id):
    from azure.mgmt.storage import StorageManagementClient

    client = StorageManagementClient(credential, subscription_id)
    return client.storage_accounts.list()


def _collect_virtual_networks_all(credential, subscription_id):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.virtual_networks.list_all()


def _collect_network_security_groups_all(credential, subscription_id):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.network_security_groups.list_all()


def _collect_keyvault_vaults_all(credential, subscription_id):
    from azure.mgmt.keyvault import KeyVaultManagementClient

    client = KeyVaultManagementClient(credential, subscription_id)
    return client.vaults.list_by_subscription()


def _collect_managed_clusters_all(credential, subscription_id):
    from azure.mgmt.containerservice import ContainerServiceClient

    client = ContainerServiceClient(credential, subscription_id)
    return client.managed_clusters.list()


# ---------------------------------------------------------------------------
# Per-RG collectors (used in selective-discovery mode)
# ---------------------------------------------------------------------------
#
# Resource groups themselves only have a subscription-wide list endpoint;
# we keep them on the ``collector_all`` path. Every other typed resource
# in this module exposes ``list(resource_group_name=...)`` (or its SDK-
# specific equivalent) so we can scope discovery to exactly the RGs the
# workspace asked about.

def _collect_virtual_machines_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.virtual_machines.list(resource_group_name=rg_name)


def _collect_storage_accounts_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.storage import StorageManagementClient

    client = StorageManagementClient(credential, subscription_id)
    return client.storage_accounts.list_by_resource_group(resource_group_name=rg_name)


def _collect_virtual_networks_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.virtual_networks.list(resource_group_name=rg_name)


def _collect_network_security_groups_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.network_security_groups.list(resource_group_name=rg_name)


def _collect_keyvault_vaults_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.keyvault import KeyVaultManagementClient

    client = KeyVaultManagementClient(credential, subscription_id)
    return client.vaults.list_by_resource_group(resource_group_name=rg_name)


def _collect_managed_clusters_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.containerservice import ContainerServiceClient

    client = ContainerServiceClient(credential, subscription_id)
    return client.managed_clusters.list_by_resource_group(resource_group_name=rg_name)


# ---------------------------------------------------------------------------
# Typed-collector binding
# ---------------------------------------------------------------------------

# Maps canonical CQ table name -> (collector_all, collector_in_rg).
# ``collector_in_rg`` is None for resource groups (no per-RG endpoint exists).
_TYPED_COLLECTORS: dict[
    str,
    tuple[AzureCollectorAll, Optional[AzureCollectorInRg]],
] = {
    "azure_resources_resource_groups": (
        _collect_resource_groups_all,
        None,
    ),
    "azure_compute_virtual_machines": (
        _collect_virtual_machines_all,
        _collect_virtual_machines_in_rg,
    ),
    "azure_storage_accounts": (
        _collect_storage_accounts_all,
        _collect_storage_accounts_in_rg,
    ),
    "azure_network_virtual_networks": (
        _collect_virtual_networks_all,
        _collect_virtual_networks_in_rg,
    ),
    "azure_network_security_groups": (
        _collect_network_security_groups_all,
        _collect_network_security_groups_in_rg,
    ),
    "azure_keyvault_keyvaults": (
        _collect_keyvault_vaults_all,
        _collect_keyvault_vaults_in_rg,
    ),
    "azure_containerservice_managed_clusters": (
        _collect_managed_clusters_all,
        _collect_managed_clusters_in_rg,
    ),
}


# ---------------------------------------------------------------------------
# Spec materialization
# ---------------------------------------------------------------------------

def _legacy_resource_type_name(entry: AzureResourceTypeEntry) -> str:
    """Pick the ``resource_type_name`` we surface to generation rules.

    Historically RWL generation rules referenced Azure types by short legacy
    names (``resource_group``, ``virtual_machine``) for a few core types and
    by the CloudQuery table name otherwise. The registry encodes both via
    ``cloudquery_table_name`` + ``aliases``; we prefer the first alias if
    one exists (the legacy short name) and fall back to the canonical CQ
    name otherwise.
    """
    if entry.aliases:
        return entry.aliases[0]
    return entry.cloudquery_table_name


def _build_specs() -> tuple[AzureResourceTypeSpec, ...]:
    registry = load_registry()
    specs: list[AzureResourceTypeSpec] = []

    rg_table = "azure_resources_resource_groups"
    if rg_table in _TYPED_COLLECTORS:
        rg_entry = registry.find(rg_table)
        if rg_entry is not None:
            collector_all, collector_in_rg = _TYPED_COLLECTORS[rg_table]
            specs.append(
                AzureResourceTypeSpec(
                    resource_type_name=_legacy_resource_type_name(rg_entry),
                    cloudquery_table_name=rg_entry.cloudquery_table_name,
                    mandatory=True,
                    collector_all=collector_all,
                    collector_in_rg=collector_in_rg,
                )
            )

    for table_name, (collector_all, collector_in_rg) in _TYPED_COLLECTORS.items():
        if table_name == rg_table:
            continue
        entry = registry.find(table_name)
        if entry is None:
            continue
        specs.append(
            AzureResourceTypeSpec(
                resource_type_name=_legacy_resource_type_name(entry),
                cloudquery_table_name=entry.cloudquery_table_name,
                mandatory=entry.mandatory,
                collector_all=collector_all,
                collector_in_rg=collector_in_rg,
            )
        )

    return tuple(specs)


AZURE_RESOURCE_TYPE_SPECS: tuple[AzureResourceTypeSpec, ...] = _build_specs()


# ---------------------------------------------------------------------------
# Lookup
# ---------------------------------------------------------------------------

def find_spec(name_or_table: str) -> Optional[AzureResourceTypeSpec]:
    """Look up an Azure resource type spec by registry name, alias, or CQ table.

    Lets generation rules continue to use any of the historical naming
    conventions: legacy short name (``resource_group``), CloudQuery table
    name (``azure_resources_resource_groups``), or any alias the registry
    knows about.
    """
    if not name_or_table:
        return None

    for spec in AZURE_RESOURCE_TYPE_SPECS:
        if name_or_table in (spec.resource_type_name, spec.cloudquery_table_name):
            return spec

    entry = load_registry().find(name_or_table)
    if entry is None:
        return None
    for spec in AZURE_RESOURCE_TYPE_SPECS:
        if spec.cloudquery_table_name == entry.cloudquery_table_name:
            return spec
    return None

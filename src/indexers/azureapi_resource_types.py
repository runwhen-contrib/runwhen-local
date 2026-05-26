"""
Azure resource-type registry for the native Azure SDK indexer.

Each :class:`AzureResourceTypeSpec` describes one logical Azure resource type
that the new ``azureapi`` indexer can discover, including:

* ``resource_type_name`` - the registry name generation rules reference,
  matching what the legacy CloudQuery indexer used (``"resource_group"``,
  ``"virtual_machine"``, etc.).

* ``cloudquery_table_name`` - the CloudQuery table name we keep in lockstep
  so existing generation rules that reference Azure types via the CQ table
  name (e.g. ``"azure_storage_accounts"``) keep working.

* ``mandatory`` - if True, the indexer always lists this type; otherwise
  it lists only when a generation rule asks for it (via
  ``RESOURCE_TYPE_SPECS_PROPERTY``).

* ``collector`` - a callable ``(credential, subscription_id) -> Iterable``
  that yields raw Azure SDK models. The callable performs the SDK import
  lazily so we don't have to depend on every ``azure-mgmt-*`` package up
  front.

Adding a new Azure resource type means adding one entry here plus, if its
shape isn't already covered, a normalizer in
:mod:`indexers.azureapi_normalizers`.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Iterable, Optional

# Type alias: collectors take (credential, subscription_id) and return SDK models.
AzureCollector = Callable[[Any, str], Iterable[Any]]


@dataclass(frozen=True)
class AzureResourceTypeSpec:
    resource_type_name: str
    cloudquery_table_name: str
    mandatory: bool
    collector: AzureCollector


# ---------------------------------------------------------------------------
# Collector functions - one per resource type. SDK imports are deliberately
# inside each function so optional dependencies (e.g. ``azure-mgmt-network``)
# are only required when the corresponding resource type is actually used.
# ---------------------------------------------------------------------------

def _collect_resource_groups(credential, subscription_id):
    from azure.mgmt.resource import ResourceManagementClient

    client = ResourceManagementClient(credential, subscription_id)
    return client.resource_groups.list()


def _collect_virtual_machines(credential, subscription_id):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.virtual_machines.list_all()


def _collect_storage_accounts(credential, subscription_id):
    from azure.mgmt.storage import StorageManagementClient

    client = StorageManagementClient(credential, subscription_id)
    return client.storage_accounts.list()


def _collect_virtual_networks(credential, subscription_id):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.virtual_networks.list_all()


def _collect_network_security_groups(credential, subscription_id):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.network_security_groups.list_all()


def _collect_keyvault_vaults(credential, subscription_id):
    from azure.mgmt.keyvault import KeyVaultManagementClient

    client = KeyVaultManagementClient(credential, subscription_id)
    return client.vaults.list_by_subscription()


def _collect_managed_clusters(credential, subscription_id):
    from azure.mgmt.containerservice import ContainerServiceClient

    client = ContainerServiceClient(credential, subscription_id)
    return client.managed_clusters.list()


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

# Order matters: ``resource_group`` MUST be first so non-RG resources can find
# their parent RG in the registry while we iterate.
AZURE_RESOURCE_TYPE_SPECS: tuple[AzureResourceTypeSpec, ...] = (
    AzureResourceTypeSpec(
        resource_type_name="resource_group",
        cloudquery_table_name="azure_resources_resource_groups",
        mandatory=True,
        collector=_collect_resource_groups,
    ),
    AzureResourceTypeSpec(
        resource_type_name="virtual_machine",
        cloudquery_table_name="azure_compute_virtual_machines",
        mandatory=False,
        collector=_collect_virtual_machines,
    ),
    AzureResourceTypeSpec(
        resource_type_name="azure_storage_accounts",
        cloudquery_table_name="azure_storage_accounts",
        mandatory=False,
        collector=_collect_storage_accounts,
    ),
    AzureResourceTypeSpec(
        resource_type_name="azure_network_virtual_networks",
        cloudquery_table_name="azure_network_virtual_networks",
        mandatory=False,
        collector=_collect_virtual_networks,
    ),
    AzureResourceTypeSpec(
        resource_type_name="azure_network_security_groups",
        cloudquery_table_name="azure_network_security_groups",
        mandatory=False,
        collector=_collect_network_security_groups,
    ),
    AzureResourceTypeSpec(
        resource_type_name="azure_keyvault_vaults",
        cloudquery_table_name="azure_keyvault_vaults",
        mandatory=False,
        collector=_collect_keyvault_vaults,
    ),
    AzureResourceTypeSpec(
        resource_type_name="azure_containerservice_managed_clusters",
        cloudquery_table_name="azure_containerservice_managed_clusters",
        mandatory=False,
        collector=_collect_managed_clusters,
    ),
)


def find_spec(name_or_table: str) -> Optional[AzureResourceTypeSpec]:
    """Look up an Azure resource type spec by either its registry name or its
    CloudQuery table name. This lets generation rules continue to use either
    naming style (e.g. ``"resource_group"`` or ``"azure_resources_resource_groups"``).
    """
    for spec in AZURE_RESOURCE_TYPE_SPECS:
        if name_or_table == spec.resource_type_name:
            return spec
        if name_or_table == spec.cloudquery_table_name:
            return spec
    return None

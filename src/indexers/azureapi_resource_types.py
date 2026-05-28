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


def _rg_from_arm_id(arm_id: str) -> Optional[str]:
    """Pull the resource-group name out of an Azure ARM resource ID.

    ARM IDs are of the form
    ``/subscriptions/<sub>/resourceGroups/<rg>/providers/...`` with case
    variations (some emit lower-case ``resourcegroups``). Used by
    child-resource collectors that walk parent → child (e.g. Postgres
    databases under their parent server).
    """
    if not arm_id:
        return None
    parts = arm_id.split("/")
    for needle in ("resourceGroups", "resourcegroups"):
        if needle in parts:
            idx = parts.index(needle)
            if idx + 1 < len(parts):
                return parts[idx + 1]
    return None


@dataclass(frozen=True)
class AzureResourceTypeSpec:
    resource_type_name: str
    cloudquery_table_name: str
    mandatory: bool
    collector_all: AzureCollectorAll
    collector_in_rg: Optional[AzureCollectorInRg] = None
    # ``True`` for hand-written azure-mgmt-* collectors that produce a rich
    # payload (full ``properties``, sku, identity, etc.). ``False`` means the
    # spec is materialized from the generic ARM-resources catch-all, which
    # gives us the basic envelope (id / name / type / tags / location / sku /
    # kind / identity) but **no** ``properties``. Used by the indexer's
    # dispatch loop to decide which pass owns the row.
    typed: bool = True
    # The ARM type string this spec corresponds to. Set for both typed and
    # generic specs; the generic-pass dispatcher uses this to route each
    # ``GenericResource.type`` back to a spec.
    arm_type: Optional[str] = None

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


# --- Compute (disks / snapshots / VMSS) ---

def _collect_compute_disks_all(credential, subscription_id):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.disks.list()


def _collect_compute_snapshots_all(credential, subscription_id):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.snapshots.list()


def _collect_compute_vmss_all(credential, subscription_id):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.virtual_machine_scale_sets.list_all()


# --- Network (load balancers / application gateways) ---

def _collect_network_load_balancers_all(credential, subscription_id):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.load_balancers.list_all()


def _collect_network_application_gateways_all(credential, subscription_id):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.application_gateways.list_all()


# --- Subscription as a resource ---

def _collect_subscriptions_all(credential, subscription_id):
    """Emit the configured subscription as a discovered resource.

    Uses ``SubscriptionClient.subscriptions.get(...)`` to fetch metadata
    for the *single* subscription that the indexer is currently iterating
    over (rather than ``subscriptions.list()`` which would return every
    subscription the credential can see). The indexer wraps each call in
    a per-subscription loop, so returning a one-element iterable here is
    correct and yields exactly one ``azure_subscription_subscriptions``
    resource per workspaceInfo subscription.
    """
    from azure.mgmt.resource import SubscriptionClient

    client = SubscriptionClient(credential)
    return [client.subscriptions.get(subscription_id)]


# --- App Service (web apps + plans) ---

def _collect_appservice_plans_all(credential, subscription_id):
    from azure.mgmt.web import WebSiteManagementClient

    client = WebSiteManagementClient(credential, subscription_id)
    return client.app_service_plans.list()


def _collect_appservice_web_apps_all(credential, subscription_id):
    from azure.mgmt.web import WebSiteManagementClient

    client = WebSiteManagementClient(credential, subscription_id)
    return client.web_apps.list()


# --- MySQL (single + flexible) ---

def _collect_mysql_servers_all(credential, subscription_id):
    from azure.mgmt.rdbms.mysql import MySQLManagementClient

    client = MySQLManagementClient(credential, subscription_id)
    return client.servers.list()


def _collect_mysql_flexible_servers_all(credential, subscription_id):
    from azure.mgmt.rdbms.mysql_flexibleservers import MySQLManagementClient

    client = MySQLManagementClient(credential, subscription_id)
    return client.servers.list()


# --- PostgreSQL databases (child of Microsoft.DBforPostgreSQL/servers) ---

def _collect_postgresql_databases_all(credential, subscription_id):
    """Walk Postgres servers (subscription-wide) and yield each database.

    ``azure_postgresql_databases`` is a child resource type
    (``Microsoft.DBforPostgreSQL/servers/databases``); there's no
    subscription-wide list endpoint, so we have to iterate parent
    servers first and call ``list_by_server`` for each.
    """
    from azure.mgmt.rdbms.postgresql import PostgreSQLManagementClient

    client = PostgreSQLManagementClient(credential, subscription_id)
    for server in client.servers.list():
        rg = _rg_from_arm_id(getattr(server, "id", "") or "")
        if not rg or not getattr(server, "name", None):
            continue
        try:
            yield from client.databases.list_by_server(rg, server.name)
        except Exception:
            # Per-server failure (auth scoping, transient outage, no DBs
            # visible to this SP) shouldn't abort the whole subscription.
            continue


# --- Redis ---

def _collect_redis_caches_all(credential, subscription_id):
    from azure.mgmt.redis import RedisManagementClient

    client = RedisManagementClient(credential, subscription_id)
    # azure-mgmt-redis renamed the subscription-wide pager to list_by_subscription;
    # there is no plain .list() on RedisOperations.
    return client.redis.list_by_subscription()


# --- Service Bus ---

def _collect_servicebus_namespaces_all(credential, subscription_id):
    from azure.mgmt.servicebus import ServiceBusManagementClient

    client = ServiceBusManagementClient(credential, subscription_id)
    return client.namespaces.list()


# --- Data Factory ---

def _collect_datafactory_factories_all(credential, subscription_id):
    from azure.mgmt.datafactory import DataFactoryManagementClient

    client = DataFactoryManagementClient(credential, subscription_id)
    return client.factories.list()


# --- Container Registry (ACR) ---

def _collect_containerregistry_registries_all(credential, subscription_id):
    from azure.mgmt.containerregistry import ContainerRegistryManagementClient

    client = ContainerRegistryManagementClient(credential, subscription_id)
    return client.registries.list()


# --- API Management ---

def _collect_apimanagement_service_all(credential, subscription_id):
    from azure.mgmt.apimanagement import ApiManagementClient

    client = ApiManagementClient(credential, subscription_id)
    return client.api_management_service.list()


# --- Cosmos SQL databases (child of Microsoft.DocumentDB/databaseAccounts) ---

def _collect_cosmos_sql_databases_all(credential, subscription_id):
    """Walk Cosmos accounts and yield each SQL database.

    ``azure_cosmos_sql_databases`` is a child resource type
    (``Microsoft.DocumentDB/databaseAccounts/sqlDatabases``); we iterate
    parent accounts first, mirroring ``_collect_postgresql_databases_all``.
    """
    from azure.mgmt.cosmosdb import CosmosDBManagementClient

    client = CosmosDBManagementClient(credential, subscription_id)
    for account in client.database_accounts.list():
        rg = _rg_from_arm_id(getattr(account, "id", "") or "")
        if not rg or not getattr(account, "name", None):
            continue
        try:
            yield from client.sql_resources.list_sql_databases(rg, account.name)
        except Exception:
            continue


# --- Azure Arc-enabled SQL Server instances ---

def _collect_arc_sql_server_instances_all(credential, subscription_id):
    from azure.mgmt.azurearcdata import AzureArcDataManagementClient

    client = AzureArcDataManagementClient(credential, subscription_id)
    return client.sql_server_instances.list()


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


# --- Compute (disks / snapshots / VMSS) ---

def _collect_compute_disks_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.disks.list_by_resource_group(resource_group_name=rg_name)


def _collect_compute_snapshots_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.snapshots.list_by_resource_group(resource_group_name=rg_name)


def _collect_compute_vmss_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.compute import ComputeManagementClient

    client = ComputeManagementClient(credential, subscription_id)
    return client.virtual_machine_scale_sets.list(resource_group_name=rg_name)


# --- Network (load balancers / application gateways) ---

def _collect_network_load_balancers_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.load_balancers.list(resource_group_name=rg_name)


def _collect_network_application_gateways_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.network import NetworkManagementClient

    client = NetworkManagementClient(credential, subscription_id)
    return client.application_gateways.list(resource_group_name=rg_name)


# --- App Service (web apps + plans) ---

def _collect_appservice_plans_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.web import WebSiteManagementClient

    client = WebSiteManagementClient(credential, subscription_id)
    return client.app_service_plans.list_by_resource_group(resource_group_name=rg_name)


def _collect_appservice_web_apps_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.web import WebSiteManagementClient

    client = WebSiteManagementClient(credential, subscription_id)
    return client.web_apps.list_by_resource_group(resource_group_name=rg_name)


# --- MySQL (single + flexible) ---

def _collect_mysql_servers_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.rdbms.mysql import MySQLManagementClient

    client = MySQLManagementClient(credential, subscription_id)
    return client.servers.list_by_resource_group(resource_group_name=rg_name)


def _collect_mysql_flexible_servers_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.rdbms.mysql_flexibleservers import MySQLManagementClient

    client = MySQLManagementClient(credential, subscription_id)
    return client.servers.list_by_resource_group(resource_group_name=rg_name)


# --- PostgreSQL databases (child of Microsoft.DBforPostgreSQL/servers) ---

def _collect_postgresql_databases_in_rg(credential, subscription_id, rg_name):
    """Walk Postgres servers in ``rg_name`` and yield each database."""
    from azure.mgmt.rdbms.postgresql import PostgreSQLManagementClient

    client = PostgreSQLManagementClient(credential, subscription_id)
    for server in client.servers.list_by_resource_group(rg_name):
        if not getattr(server, "name", None):
            continue
        try:
            yield from client.databases.list_by_server(rg_name, server.name)
        except Exception:
            continue


# --- Redis ---

def _collect_redis_caches_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.redis import RedisManagementClient

    client = RedisManagementClient(credential, subscription_id)
    return client.redis.list_by_resource_group(resource_group_name=rg_name)


# --- Service Bus ---

def _collect_servicebus_namespaces_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.servicebus import ServiceBusManagementClient

    client = ServiceBusManagementClient(credential, subscription_id)
    return client.namespaces.list_by_resource_group(resource_group_name=rg_name)


# --- Data Factory ---

def _collect_datafactory_factories_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.datafactory import DataFactoryManagementClient

    client = DataFactoryManagementClient(credential, subscription_id)
    return client.factories.list_by_resource_group(resource_group_name=rg_name)


# --- Container Registry (ACR) ---

def _collect_containerregistry_registries_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.containerregistry import ContainerRegistryManagementClient

    client = ContainerRegistryManagementClient(credential, subscription_id)
    return client.registries.list_by_resource_group(resource_group_name=rg_name)


# --- API Management ---

def _collect_apimanagement_service_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.apimanagement import ApiManagementClient

    client = ApiManagementClient(credential, subscription_id)
    return client.api_management_service.list_by_resource_group(resource_group_name=rg_name)


# --- Cosmos SQL databases (child of Microsoft.DocumentDB/databaseAccounts) ---

def _collect_cosmos_sql_databases_in_rg(credential, subscription_id, rg_name):
    """Walk Cosmos accounts in ``rg_name`` and yield each SQL database."""
    from azure.mgmt.cosmosdb import CosmosDBManagementClient

    client = CosmosDBManagementClient(credential, subscription_id)
    for account in client.database_accounts.list_by_resource_group(rg_name):
        if not getattr(account, "name", None):
            continue
        try:
            yield from client.sql_resources.list_sql_databases(rg_name, account.name)
        except Exception:
            continue


# --- Azure Arc-enabled SQL Server instances ---

def _collect_arc_sql_server_instances_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.azurearcdata import AzureArcDataManagementClient

    client = AzureArcDataManagementClient(credential, subscription_id)
    return client.sql_server_instances.list_by_resource_group(resource_group_name=rg_name)


# ---------------------------------------------------------------------------
# Generic ARM-resources collector (the catch-all)
# ---------------------------------------------------------------------------
#
# Calls ``ResourceManagementClient.resources.list[_by_resource_group]()``,
# which returns ``GenericResource`` rows for *every* top-level ARM resource
# type the credential can see. The native indexer dispatches a single
# generic pass per subscription / RG and routes each row through the
# registry (``find_by_arm_type``) to the correct ``resource_type_name``.
#
# Generic rows carry the basic envelope (``id``, ``name``, ``type``,
# ``location``, ``tags``, ``sku``, ``kind``, ``identity``, ``managed_by``,
# ``plan``) but **not** ``properties`` - the ARM resources API doesn't
# expand them. For richer payloads on a specific type, add a typed
# collector and the typed pass will run alongside the generic pass with
# the typed result winning.

def _collect_generic_resources_all(credential, subscription_id):
    from azure.mgmt.resource import ResourceManagementClient

    client = ResourceManagementClient(credential, subscription_id)
    return client.resources.list()


def _collect_generic_resources_in_rg(credential, subscription_id, rg_name):
    from azure.mgmt.resource import ResourceManagementClient

    client = ResourceManagementClient(credential, subscription_id)
    return client.resources.list_by_resource_group(rg_name)


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
    # Compute (disks / snapshots / VMSS) - reuse azure-mgmt-compute.
    "azure_compute_disks": (
        _collect_compute_disks_all,
        _collect_compute_disks_in_rg,
    ),
    "azure_compute_snapshots": (
        _collect_compute_snapshots_all,
        _collect_compute_snapshots_in_rg,
    ),
    "azure_compute_virtual_machine_scale_sets": (
        _collect_compute_vmss_all,
        _collect_compute_vmss_in_rg,
    ),
    # Network (load balancers / app gateways) - reuse azure-mgmt-network.
    "azure_network_load_balancers": (
        _collect_network_load_balancers_all,
        _collect_network_load_balancers_in_rg,
    ),
    "azure_network_application_gateways": (
        _collect_network_application_gateways_all,
        _collect_network_application_gateways_in_rg,
    ),
    # Subscription as a top-level resource (no per-RG variant: subscriptions
    # don't live in resource groups). Selective mode falls back to
    # ``collector_all`` which yields a single resource per configured sub.
    "azure_subscription_subscriptions": (
        _collect_subscriptions_all,
        None,
    ),
    # App Service (azure-mgmt-web).
    "azure_appservice_plans": (
        _collect_appservice_plans_all,
        _collect_appservice_plans_in_rg,
    ),
    "azure_appservice_web_apps": (
        _collect_appservice_web_apps_all,
        _collect_appservice_web_apps_in_rg,
    ),
    # RDBMS (azure-mgmt-rdbms covers MySQL, Postgres, MariaDB).
    "azure_mysql_servers": (
        _collect_mysql_servers_all,
        _collect_mysql_servers_in_rg,
    ),
    "azure_mysqlflexibleservers_servers": (
        _collect_mysql_flexible_servers_all,
        _collect_mysql_flexible_servers_in_rg,
    ),
    "azure_postgresql_databases": (
        _collect_postgresql_databases_all,
        _collect_postgresql_databases_in_rg,
    ),
    # One-off SDKs (azure-mgmt-redis, -servicebus, -datafactory,
    # -containerregistry, -apimanagement, -cosmosdb, -azurearcdata).
    "azure_redis_caches": (
        _collect_redis_caches_all,
        _collect_redis_caches_in_rg,
    ),
    "azure_servicebus_namespaces": (
        _collect_servicebus_namespaces_all,
        _collect_servicebus_namespaces_in_rg,
    ),
    "azure_datafactory_factories": (
        _collect_datafactory_factories_all,
        _collect_datafactory_factories_in_rg,
    ),
    "azure_containerregistry_registries": (
        _collect_containerregistry_registries_all,
        _collect_containerregistry_registries_in_rg,
    ),
    "azure_apimanagement_service": (
        _collect_apimanagement_service_all,
        _collect_apimanagement_service_in_rg,
    ),
    "azure_cosmos_sql_databases": (
        _collect_cosmos_sql_databases_all,
        _collect_cosmos_sql_databases_in_rg,
    ),
    "azure_azurearcdata_sql_server_instances": (
        _collect_arc_sql_server_instances_all,
        _collect_arc_sql_server_instances_in_rg,
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


def _make_typed_spec(
    entry: AzureResourceTypeEntry,
    collector_all: AzureCollectorAll,
    collector_in_rg: Optional[AzureCollectorInRg],
) -> AzureResourceTypeSpec:
    return AzureResourceTypeSpec(
        resource_type_name=_legacy_resource_type_name(entry),
        cloudquery_table_name=entry.cloudquery_table_name,
        mandatory=entry.mandatory,
        collector_all=collector_all,
        collector_in_rg=collector_in_rg,
        typed=True,
        arm_type=entry.arm_type,
    )


def _make_generic_spec(entry: AzureResourceTypeEntry) -> AzureResourceTypeSpec:
    """Build a generic-collector spec for a registry entry that has no
    hand-written azure-mgmt-* collector.

    The generic spec uses the catch-all ARM-resources collector pair; it's
    addressable via ``find_spec`` so generation rules can reference any
    registered Azure type, but the indexer's main loop doesn't iterate
    these specs directly - the generic pass routes ``GenericResource``
    rows to them in bulk. Setting ``collector_all`` / ``collector_in_rg``
    to the generic functions keeps the spec usable as a one-off if a
    caller really wants to invoke it.
    """
    return AzureResourceTypeSpec(
        resource_type_name=_legacy_resource_type_name(entry),
        cloudquery_table_name=entry.cloudquery_table_name,
        mandatory=entry.mandatory,
        collector_all=_collect_generic_resources_all,
        collector_in_rg=_collect_generic_resources_in_rg,
        typed=False,
        arm_type=entry.arm_type,
    )


def _build_specs() -> tuple[AzureResourceTypeSpec, ...]:
    """Materialize one ``AzureResourceTypeSpec`` per registry entry.

    Order:
    1. Resource groups first (always mandatory, RG enumeration is the
       bootstrap step every other phase depends on).
    2. Remaining typed collectors next (the rich-payload tier).
    3. Every other registry entry as a generic-collector spec (the
       basic-envelope tier).

    The result is what ``find_spec`` searches and what gen-rule reference
    checks use to decide whether a given resource-type name is
    discoverable. Indexer dispatch (``azureapi.index``) iterates the
    typed slice for its rich-pass and runs the generic pass once globally
    rather than once per generic spec.
    """
    registry = load_registry()
    specs: list[AzureResourceTypeSpec] = []
    seen_tables: set[str] = set()

    rg_table = "azure_resources_resource_groups"
    if rg_table in _TYPED_COLLECTORS:
        rg_entry = registry.find(rg_table)
        if rg_entry is not None:
            collector_all, collector_in_rg = _TYPED_COLLECTORS[rg_table]
            specs.append(_make_typed_spec(rg_entry, collector_all, collector_in_rg))
            seen_tables.add(rg_table)

    for table_name, (collector_all, collector_in_rg) in _TYPED_COLLECTORS.items():
        if table_name in seen_tables:
            continue
        entry = registry.find(table_name)
        if entry is None:
            continue
        specs.append(_make_typed_spec(entry, collector_all, collector_in_rg))
        seen_tables.add(table_name)

    for entry in registry:
        if entry.cloudquery_table_name in seen_tables:
            continue
        specs.append(_make_generic_spec(entry))
        seen_tables.add(entry.cloudquery_table_name)

    return tuple(specs)


AZURE_RESOURCE_TYPE_SPECS: tuple[AzureResourceTypeSpec, ...] = _build_specs()

# Convenience subset for callers that only care about the rich-payload
# tier (e.g. the indexer's typed-collector dispatch loop). Keeps callers
# from having to filter ``AZURE_RESOURCE_TYPE_SPECS`` themselves.
AZURE_TYPED_RESOURCE_TYPE_SPECS: tuple[AzureResourceTypeSpec, ...] = tuple(
    s for s in AZURE_RESOURCE_TYPE_SPECS if s.typed
)


# ---------------------------------------------------------------------------
# Lookup
# ---------------------------------------------------------------------------

def find_spec(name_or_table: str) -> Optional[AzureResourceTypeSpec]:
    """Look up an Azure resource type spec by registry name, alias, or CQ table.

    Returns a spec for any name the registry knows about - typed when a
    hand-written collector exists, otherwise a generic-collector spec
    backed by the ARM-resources catch-all. Returning ``None`` now means
    "this name is not a registered Azure resource type at all" rather
    than "we don't have a collector for it".
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


def find_spec_by_arm_type(arm_type: Optional[str]) -> Optional[AzureResourceTypeSpec]:
    """Look up the spec whose ``arm_type`` matches this string.

    Used by the generic-resources pass in ``azureapi.index`` to route
    each ``GenericResource.type`` back to the spec that owns its
    ``resource_type_name``. Case-insensitive on the ARM-type string.
    """
    if not arm_type:
        return None
    entry = load_registry().find_by_arm_type(arm_type)
    if entry is None:
        return None
    for spec in AZURE_RESOURCE_TYPE_SPECS:
        if spec.cloudquery_table_name == entry.cloudquery_table_name:
            return spec
    return None

"""
Native Azure SDK indexer.

Replaces the CloudQuery-based Azure path with direct ``azure-mgmt-*`` calls
while keeping the registry output byte-compatible: each resource is normalized
into the same flat dict shape ``AzurePlatformHandler.parse_resource_data``
already accepts, and writes flow through the :class:`ResourceWriter` seam so
the future local-DB / REST substrate is a drop-in swap.

Coexists with the CloudQuery indexer behind the ``AZURE_INDEXER_BACKEND``
setting:

* ``"cloudquery"`` (default): this indexer is a no-op; CloudQuery handles
  Azure as it does today.
* ``"azureapi"``:              this indexer discovers Azure resources and the
                               CloudQuery indexer skips the Azure block.

Component name: ``azureapi``. Stage: ``INDEXER``.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from component import Context, Setting, SettingDependency
from enrichers.generation_rule_types import (
    PLATFORM_HANDLERS_PROPERTY_NAME,
    PlatformHandler,
)
from enrichers.generation_rules import RESOURCE_TYPE_SPECS_PROPERTY
from exceptions import WorkspaceBuilderException
from resources import ResourceTypeSpec

from .azure_common import (
    _azure_has_only_devops_config,
    az_get_credentials_and_subscription_id,
    get_auth_type,
    has_excluded_tags,
    has_included_tags,
)
from .azureapi_normalizers import normalize_azure_resource
from .azureapi_resource_types import AZURE_RESOURCE_TYPE_SPECS, find_spec
from .common import CLOUD_CONFIG_SETTING
from .resource_writer import (
    RESOURCE_STORE_BACKEND_SETTING,
    RESOURCE_STORE_PATH_SETTING,
    get_resource_writer,
)

logger = logging.getLogger(__name__)

AZURE_PLATFORM = "azure"

DOCUMENTATION = "Index Azure resources using the Azure management SDK"

# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

AZURE_INDEXER_BACKEND_SETTING = Setting(
    "AZURE_INDEXER_BACKEND",
    "azureIndexerBackend",
    Setting.Type.STRING,
    "Selects the backend used to discover Azure resources. "
    "'cloudquery' (default) uses the legacy CloudQuery-based path; "
    "'azureapi' uses the native azure-mgmt-* SDK indexer.",
    "cloudquery",
)

SETTINGS = (
    SettingDependency(CLOUD_CONFIG_SETTING, False),
    SettingDependency(AZURE_INDEXER_BACKEND_SETTING, False),
    # Expose the ResourceWriter backend selection on the azureapi component
    # (currently the only indexer that funnels through the writer seam) so
    # the settings appear in the active schema and can be set via
    # workspaceInfo.yaml.
    SettingDependency(RESOURCE_STORE_BACKEND_SETTING, False),
    SettingDependency(RESOURCE_STORE_PATH_SETTING, False),
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_subscription_rg_lod_map(platform_cfg: dict[str, Any]) -> None:
    """Populate ``platform_cfg["subscriptionResourceGroupLevelOfDetails"]``.

    This is a lift of the LOD-map construction in ``cloudquery.init_cloudquery_config``
    so ``AzurePlatformHandler.parse_resource_data`` (which reads this nested map
    to compute per-resource LOD) keeps producing the same values regardless of
    which indexer ran.
    """
    rg_lod_map: dict[str, dict[str, str]] = {}
    global_default = (
        platform_cfg.get("defaultLOD") or platform_cfg.get("defaultLevelOfDetail")
    )

    for item in platform_cfg.get("subscriptions", []):
        if not isinstance(item, dict):
            continue
        sid = str(item.get("subscriptionId", "")).strip()
        if not sid:
            continue
        sub_default = (
            item.get("defaultLOD")
            or item.get("defaultLevelOfDetail")
            or global_default
        )
        lod_dict: dict[str, str] = {}
        if sub_default:
            lod_dict["*"] = sub_default
        lod_dict.update(item.get("resourceGroupLevelOfDetails", {}))
        if lod_dict:
            rg_lod_map[sid] = lod_dict

    if not platform_cfg.get("subscriptions"):
        sid = platform_cfg.get("subscriptionId")
        if sid:
            lod_dict = platform_cfg.get("resourceGroupLevelOfDetails", {})
            if not lod_dict and global_default:
                lod_dict = {"*": global_default}
            if lod_dict:
                rg_lod_map[str(sid)] = lod_dict

    platform_cfg["subscriptionResourceGroupLevelOfDetails"] = rg_lod_map


def _accessed_azure_type_names(context: Context) -> set[str]:
    """Return the set of Azure resource-type names referenced by loaded
    generation rules. Both the registry name and the CloudQuery table name are
    accepted as valid spec values; the result mixes them.
    """
    all_specs: Optional[dict[str, dict[ResourceTypeSpec, Any]]] = context.get_property(
        RESOURCE_TYPE_SPECS_PROPERTY
    )
    if not all_specs:
        return set()
    azure_specs = all_specs.get(AZURE_PLATFORM, {})
    return {spec.resource_type_name for spec in azure_specs.keys()}


def _resolve_platform_handler(context: Context) -> PlatformHandler:
    handlers: Optional[dict[str, PlatformHandler]] = context.get_property(
        PLATFORM_HANDLERS_PROPERTY_NAME
    )
    if handlers and AZURE_PLATFORM in handlers:
        return handlers[AZURE_PLATFORM]
    # Bootstrap a default handler if generation_rules.load wasn't run (e.g. test setups).
    from enrichers.azure import AzurePlatformHandler

    return AzurePlatformHandler()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def index(context: Context) -> None:
    backend = context.get_setting(AZURE_INDEXER_BACKEND_SETTING)
    if backend != "azureapi":
        logger.debug(
            f"AZURE_INDEXER_BACKEND={backend!r}; azureapi indexer is a no-op "
            f"(legacy CloudQuery path is responsible for Azure)."
        )
        return

    cloud_config = context.get_setting(CLOUD_CONFIG_SETTING) or {}
    platform_cfg = cloud_config.get(AZURE_PLATFORM)
    if not platform_cfg:
        logger.info("No 'azure' section in cloudConfig; azureapi indexer skipping.")
        return

    if _azure_has_only_devops_config(platform_cfg):
        logger.info(
            "Azure config contains only DevOps settings (no subscriptionId or cloud "
            "credentials). Skipping azureapi discovery; Azure DevOps indexer will "
            "handle ADO resources."
        )
        return

    logger.info("Starting Azure SDK indexing")

    az = az_get_credentials_and_subscription_id(platform_cfg)
    credential = az["credential"]
    subscription_ids: list[str] = az["subscription_ids"]

    # Mirror what cloudquery.py does so AzurePlatformHandler.parse_resource_data,
    # get_subscription_name, and any other downstream code that reads global
    # Azure credentials sees the same values we resolved here.
    try:
        from enrichers.azure import set_azure_credentials

        set_azure_credentials(
            tenant_id=az.get("AZURE_TENANT_ID"),
            client_id=az.get("AZURE_CLIENT_ID"),
            client_secret=az.get("AZURE_CLIENT_SECRET"),
            credential=credential,
        )
    except Exception as e:
        logger.warning(f"Could not update enrichers.azure credentials: {e}")

    _build_subscription_rg_lod_map(platform_cfg)

    accessed_names = _accessed_azure_type_names(context)
    logger.info(
        f"Azure resource types referenced by generation rules: "
        f"{sorted(accessed_names) if accessed_names else '(none)'}"
    )

    specs_to_collect = []
    for spec in AZURE_RESOURCE_TYPE_SPECS:
        if (spec.mandatory
                or spec.resource_type_name in accessed_names
                or spec.cloudquery_table_name in accessed_names):
            specs_to_collect.append(spec)

    # Surface gen-rule references with no collector so the user gets a clean
    # warning rather than a silent miss. Today, ad-hoc CQ table names referenced
    # by generation rules used to "just work" because CloudQuery had a generic
    # sync path; with the SDK indexer, every supported type needs an entry in
    # AZURE_RESOURCE_TYPE_SPECS.
    for accessed in accessed_names:
        if find_spec(accessed) is None:
            warning = (
                f'Azure SDK indexer has no collector for resource type '
                f'"{accessed}"; resources of this type will not be indexed. '
                f'Add a collector to indexers/azureapi_resource_types.py.'
            )
            logger.warning(warning)
            context.add_warning(warning)

    platform_handler = _resolve_platform_handler(context)

    include_tags = platform_cfg.get("includeTags", {})
    exclude_tags = platform_cfg.get("excludeTags", {})

    auth_type, auth_secret = get_auth_type(AZURE_PLATFORM, platform_cfg)

    writer = get_resource_writer(context)

    stats = {
        "discovered": 0,
        "added": 0,
        "skipped_tag_filter": 0,
        "skipped_parse_error": 0,
        "skipped_collector_error": 0,
    }

    # Iterate spec-major then subscription so all resource_groups land in the
    # registry before non-RG types are written. parse_resource_data uses the
    # registry to link children to their RG; a child whose RG isn't in the
    # registry yet is recorded with ``_deferred_rg_lookup`` and resolved by
    # the writer's ``finalize()``.
    for spec in specs_to_collect:
        for subscription_id in subscription_ids:
            try:
                models = list(spec.collector(credential, subscription_id))
            except Exception as e:
                stats["skipped_collector_error"] += 1
                logger.error(
                    f"Failed to list {spec.resource_type_name} in subscription "
                    f"{subscription_id}: {e}"
                )
                context.add_warning(
                    f"Failed to list Azure {spec.resource_type_name} in "
                    f"subscription {subscription_id}: {e}"
                )
                continue

            logger.info(
                f"Collected {len(models)} {spec.resource_type_name} "
                f"from subscription {subscription_id}"
            )

            for model in models:
                stats["discovered"] += 1
                try:
                    resource_data = normalize_azure_resource(
                        model,
                        subscription_id=subscription_id,
                        resource_type_name=spec.resource_type_name,
                    )
                except Exception as e:
                    stats["skipped_parse_error"] += 1
                    logger.warning(
                        f"Failed to normalize Azure {spec.resource_type_name} "
                        f"model in subscription {subscription_id}: {e}"
                    )
                    continue

                if exclude_tags and has_excluded_tags(resource_data, exclude_tags):
                    stats["skipped_tag_filter"] += 1
                    continue
                if include_tags and not has_included_tags(resource_data, include_tags):
                    stats["skipped_tag_filter"] += 1
                    continue

                try:
                    resource_name, qualified_name, resource_attributes = (
                        platform_handler.parse_resource_data(
                            resource_data,
                            spec.resource_type_name,
                            platform_cfg,
                            context,
                        )
                    )
                except WorkspaceBuilderException as e:
                    stats["skipped_parse_error"] += 1
                    logger.warning(
                        f"parse_resource_data rejected {spec.resource_type_name} "
                        f"resource in subscription {subscription_id}: {e}"
                    )
                    continue
                except (KeyError, ValueError, TypeError, AttributeError) as e:
                    stats["skipped_parse_error"] += 1
                    logger.warning(
                        f"parse_resource_data raised {type(e).__name__} for "
                        f"{spec.resource_type_name} resource in subscription "
                        f"{subscription_id}: {e}"
                    )
                    continue

                resource_attributes["resource"] = resource_data
                resource_attributes["auth_type"] = auth_type
                resource_attributes["auth_secret"] = auth_secret

                writer.add_resource(
                    AZURE_PLATFORM,
                    spec.resource_type_name,
                    resource_name,
                    qualified_name,
                    resource_attributes,
                )
                stats["added"] += 1

    writer.finalize()

    logger.info(
        f"Azure SDK indexing complete: "
        f"discovered={stats['discovered']}, added={stats['added']}, "
        f"skipped_tag_filter={stats['skipped_tag_filter']}, "
        f"skipped_parse_error={stats['skipped_parse_error']}, "
        f"skipped_collector_error={stats['skipped_collector_error']}"
    )

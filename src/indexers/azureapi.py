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
    LevelOfDetail,
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
from .azureapi_resource_types import (
    AZURE_RESOURCE_TYPE_SPECS,
    AzureResourceTypeSpec,
    find_spec,
    find_spec_by_arm_type,
)
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


# ---------------------------------------------------------------------------
# Selective indexing
# ---------------------------------------------------------------------------
#
# The cloudquery-era pipeline indexed every Azure resource the SP could see
# and let render-time LOD checks decide what to emit. The native indexer is
# stricter: resources whose effective LOD is NONE are dropped before the
# resource writer ever sees them. This keeps the resource store focused on
# what generation rules actually need, makes the SQLite store dramatically
# smaller, and turns the workspaceInfo Azure block into the single source of
# truth for "what should be discovered".
#
# The per-resource decision mirrors the lookup chain that
# ``AzurePlatformHandler.parse_resource_data`` uses (sub-specific RG override
# -> per-subscription default -> legacy global RG override -> legacy global
# wildcard -> workspace DEFAULT_LOD), keeping selective-indexing decisions
# byte-compatible with what render-time enforcement would have done.

_RG_MARKER = "resourcegroups/"
_SUB_MARKER = "/subscriptions/"


def _extract_rg_name_from_arm_id(arm_id: Optional[str]) -> Optional[str]:
    """Extract the resource-group name from an ARM ID. Case-insensitive
    marker match, but value casing is preserved so it round-trips against
    the resource-group registry."""
    if not arm_id:
        return None
    lowered = arm_id.lower()
    start = lowered.find(_RG_MARKER)
    if start < 0:
        return None
    start += len(_RG_MARKER)
    end = arm_id.find("/", start)
    if end < 0:
        end = len(arm_id)
    rg = arm_id[start:end]
    return rg or None


def _extract_subscription_id_from_arm_id(arm_id: Optional[str]) -> Optional[str]:
    """Extract the subscription ID from an ARM ID, e.g.
    ``/subscriptions/<sub>/resourceGroups/...``."""
    if not arm_id:
        return None
    lowered = arm_id.lower()
    start = lowered.find(_SUB_MARKER)
    if start < 0:
        return None
    start += len(_SUB_MARKER)
    end = arm_id.find("/", start)
    if end < 0:
        end = len(arm_id)
    sub = arm_id[start:end]
    return sub or None


def _compute_effective_lod(
    platform_cfg: dict[str, Any],
    subscription_id: Optional[str],
    rg_name: Optional[str],
    default_lod: LevelOfDetail,
) -> LevelOfDetail:
    """Resolve the effective LOD for a resource living in ``rg_name`` under
    ``subscription_id``. Mirrors the resolution chain in
    ``AzurePlatformHandler.parse_resource_data``."""
    sub_map: dict[str, Any] = (
        platform_cfg.get("subscriptionResourceGroupLevelOfDetails", {}) or {}
    ).get(subscription_id or "", {}) or {}
    global_rg_map: dict[str, Any] = platform_cfg.get("resourceGroupLevelOfDetails", {}) or {}

    candidate = (
        (sub_map.get(rg_name) if rg_name else None)
        or sub_map.get("*")
        or (global_rg_map.get(rg_name) if rg_name else None)
        or global_rg_map.get("*")
    )
    if candidate is None:
        return default_lod
    try:
        return LevelOfDetail.construct_from_config(candidate)
    except Exception:
        return default_lod


def _resource_is_in_scope(
    platform_cfg: dict[str, Any],
    resource_data: dict[str, Any],
    resource_type_name: str,
    subscription_id: Optional[str],
    default_lod: LevelOfDetail,
) -> tuple[bool, Optional[LevelOfDetail]]:
    """Return ``(in_scope, effective_lod)`` for a resource.

    ``in_scope`` is False iff the effective LOD is ``NONE`` - the indexer
    drops these before they reach the writer. The effective LOD is also
    returned so callers can log a reason or stash it for later.
    """
    if resource_type_name == "azure_subscription_subscriptions":
        # Subscription resources are indexed unconditionally so downstream
        # code can attach metadata / qualified names. Their LOD is the
        # workspace default.
        return True, default_lod

    if resource_type_name == "resource_group":
        rg_name = resource_data.get("name")
    else:
        rg_name = _extract_rg_name_from_arm_id(resource_data.get("id"))

    sub_id = subscription_id or _extract_subscription_id_from_arm_id(resource_data.get("id"))
    effective = _compute_effective_lod(platform_cfg, sub_id, rg_name, default_lod)
    return effective is not LevelOfDetail.NONE, effective


def _resolve_default_lod(context: Context, platform_cfg: dict[str, Any]) -> LevelOfDetail:
    """Resolve the workspace default LOD. Order of precedence:
    platform_cfg.defaultLOD -> context DEFAULT_LOD setting -> BASIC."""
    raw = (
        platform_cfg.get("defaultLOD")
        or platform_cfg.get("defaultLevelOfDetail")
        or context.get_setting("DEFAULT_LOD")
    )
    if raw is None:
        return LevelOfDetail.BASIC
    try:
        return LevelOfDetail.construct_from_config(raw)
    except Exception:
        return LevelOfDetail.BASIC


def _safe_lod(value: Any) -> Optional[LevelOfDetail]:
    if value is None:
        return None
    try:
        return LevelOfDetail.construct_from_config(value)
    except Exception:
        return None


def _rgs_in_scope_from_config(
    platform_cfg: dict[str, Any],
    subscription_id: str,
    default_lod: LevelOfDetail,
) -> Optional[list[str]]:
    """Return the explicit set of in-scope RG names for ``subscription_id``,
    or ``None`` if the configuration permits unbounded discovery for that
    subscription.

    Selective discovery mode (returns a finite list) is triggered when:

    * the per-subscription wildcard (``sub_map["*"]``) resolves to NONE
      *or* is unset, **and**
    * the legacy global wildcard (``resourceGroupLevelOfDetails["*"]``)
      resolves to NONE *or* is unset, **and**
    * the workspace ``defaultLOD`` resolves to NONE.

    When all three escape hatches yield NONE, the only resources in scope
    are those with explicit non-NONE per-RG overrides; we return the list
    of those RG names (call ``list_by_resource_group`` for each).

    Returning ``None`` means "use the subscription-wide list endpoint and
    rely on post-filtering" - the workspace's defaultLOD or wildcard says
    discovery should not be artificially scoped.
    """
    sub_map: dict[str, Any] = (
        platform_cfg.get("subscriptionResourceGroupLevelOfDetails", {}) or {}
    ).get(subscription_id, {}) or {}
    global_rg_map: dict[str, Any] = platform_cfg.get("resourceGroupLevelOfDetails", {}) or {}

    sub_wildcard = _safe_lod(sub_map.get("*"))
    if sub_wildcard is not None and sub_wildcard is not LevelOfDetail.NONE:
        return None
    global_wildcard = _safe_lod(global_rg_map.get("*"))
    if global_wildcard is not None and global_wildcard is not LevelOfDetail.NONE:
        return None
    if default_lod is not LevelOfDetail.NONE:
        return None

    in_scope: list[str] = []
    seen: set[str] = set()
    for name, raw_lod in sub_map.items():
        if name == "*":
            continue
        lod = _safe_lod(raw_lod)
        if lod is None or lod is LevelOfDetail.NONE:
            continue
        if name not in seen:
            seen.add(name)
            in_scope.append(name)
    for name, raw_lod in global_rg_map.items():
        if name == "*":
            continue
        lod = _safe_lod(raw_lod)
        if lod is None or lod is LevelOfDetail.NONE:
            continue
        if name not in seen:
            seen.add(name)
            in_scope.append(name)
    return in_scope


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
        # Bumped from debug to info so a default-verbosity log makes it
        # obvious which Azure backend will own discovery on this run.
        logger.info(
            f"Azure indexer backend: '{backend}' (azureIndexerBackend in "
            f"workspaceInfo.yaml). Native azureapi indexer is a no-op; the "
            f"CloudQuery indexer will handle Azure."
        )
        return

    cloud_config = context.get_setting(CLOUD_CONFIG_SETTING) or {}
    platform_cfg = cloud_config.get(AZURE_PLATFORM)
    if not platform_cfg:
        logger.info(
            "Azure indexer backend: 'azureapi' selected, but no 'azure' section "
            "in cloudConfig; nothing to discover."
        )
        return

    if _azure_has_only_devops_config(platform_cfg):
        logger.info(
            "Azure indexer backend: 'azureapi' selected, but cloudConfig.azure "
            "contains only DevOps settings (no subscriptionId / cloud "
            "credentials). Skipping resource discovery; Azure DevOps indexer "
            "will handle ADO resources."
        )
        return

    logger.info(
        "Azure indexer backend: 'azureapi' (native azure-mgmt-* SDK). "
        "Starting Azure resource discovery."
    )

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

    # Resolve "what does the workspace want indexed" up-front. We keep
    # two collections:
    #
    #   * ``typed_specs_to_collect`` - typed (rich-payload) specs whose
    #     CQ table name or alias is referenced by a gen rule, OR which
    #     are mandatory (today: just resource_groups).
    #   * ``generic_arm_types_wanted`` - lower-cased ARM type strings of
    #     non-typed registry entries referenced by a gen rule. These are
    #     fed by the generic-resources pass below.
    # Derive the typed slice at runtime so test mocks that override
    # ``AZURE_RESOURCE_TYPE_SPECS`` don't have to also override a
    # pre-filtered constant.
    typed_specs_to_collect: list[AzureResourceTypeSpec] = []
    for spec in AZURE_RESOURCE_TYPE_SPECS:
        if not getattr(spec, "typed", True):
            continue
        if (spec.mandatory
                or spec.resource_type_name in accessed_names
                or spec.cloudquery_table_name in accessed_names):
            typed_specs_to_collect.append(spec)

    generic_specs_by_arm_type: dict[str, AzureResourceTypeSpec] = {}
    for accessed in accessed_names:
        spec = find_spec(accessed)
        if spec is None:
            # ``find_spec`` returns None only for names that are not in
            # the Azure resource-type registry at all. The gen rule has
            # a typo or the registry needs a new entry.
            warning = (
                f'Azure SDK indexer: gen-rule references unknown Azure resource '
                f'type "{accessed}". Verify the name or add it to '
                f'scripts/azure/azure_resource_type_overrides.yaml and rerun the '
                f'sync script.'
            )
            logger.warning(warning)
            context.add_warning(warning)
            continue
        if not spec.typed and spec.arm_type:
            generic_specs_by_arm_type[spec.arm_type.lower()] = spec

    platform_handler = _resolve_platform_handler(context)

    include_tags = platform_cfg.get("includeTags", {})
    exclude_tags = platform_cfg.get("excludeTags", {})

    auth_type, auth_secret = get_auth_type(AZURE_PLATFORM, platform_cfg)

    writer = get_resource_writer(context)

    default_lod = _resolve_default_lod(context, platform_cfg)

    # Resolve discovery scope per subscription. Each entry is either a
    # finite list of in-scope RG names (selective discovery; we'll call
    # ``list_by_resource_group`` for each) or ``None`` (subscription-wide
    # discovery; we'll call ``list_all`` and post-filter LOD).
    discovery_scope: dict[str, Optional[list[str]]] = {
        sub_id: _rgs_in_scope_from_config(platform_cfg, sub_id, default_lod)
        for sub_id in subscription_ids
    }
    for sub_id, scope in discovery_scope.items():
        if scope is None:
            logger.info(
                f"Azure subscription {sub_id}: subscription-wide discovery "
                f"(workspace default LOD={default_lod}, no NONE-only wildcard)."
            )
        else:
            logger.info(
                f"Azure subscription {sub_id}: selective discovery, "
                f"in-scope RGs={sorted(scope) if scope else '(none)'}."
            )

    stats = {
        "discovered": 0,
        "added": 0,
        "added_typed": 0,
        "added_generic": 0,
        "generic_unmatched_arm_type": 0,
        "generic_already_typed": 0,
        "skipped_tag_filter": 0,
        "skipped_lod_filter": 0,
        "skipped_parse_error": 0,
        "skipped_collector_error": 0,
        "skipped_rg_not_found": 0,
    }
    # Track ARM IDs the typed pass already emitted so the generic pass
    # doesn't double-write the same resource with a sparser payload.
    typed_arm_ids: set[str] = set()

    def _process_models(spec, subscription_id, models, *, lod_filter: bool, source: str = "typed") -> None:
        """Normalize -> tag filter -> (optional) LOD filter -> parse -> write.

        ``source`` is either ``"typed"`` (the rich-payload pass) or
        ``"generic"`` (the ARM-resources catch-all pass). It controls
        per-source bookkeeping (``typed_arm_ids`` write set, generic-pass
        skip-if-already-typed check, per-source stats).
        """
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

            if lod_filter:
                in_scope, effective_lod = _resource_is_in_scope(
                    platform_cfg,
                    resource_data,
                    spec.resource_type_name,
                    subscription_id,
                    default_lod,
                )
                if not in_scope:
                    stats["skipped_lod_filter"] += 1
                    logger.debug(
                        f"Skipping {spec.resource_type_name} "
                        f"'{resource_data.get('name')}' in subscription "
                        f"{subscription_id}: effective LOD is {effective_lod}"
                    )
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

            arm_id = resource_data.get("id")
            if source == "generic" and arm_id and arm_id in typed_arm_ids:
                # The typed pass already wrote a richer copy of this
                # resource; don't overwrite with the basic generic payload.
                stats["generic_already_typed"] += 1
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
            stats["added_typed" if source == "typed" else "added_generic"] += 1
            if source == "typed" and arm_id:
                typed_arm_ids.add(arm_id)

    def _list_subscription_wide(spec, subscription_id):
        try:
            return list(spec.collector_all(credential, subscription_id))
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
            return None

    def _list_in_rg(spec, subscription_id, rg_name):
        try:
            return list(spec.collector_in_rg(credential, subscription_id, rg_name))
        except Exception as e:
            # 404 / RG-not-found is the most likely failure here: the
            # workspace declared an RG in scope that doesn't (yet) exist.
            # Demote to a warning + dedicated counter rather than aborting.
            err_text = str(e)
            if "ResourceGroupNotFound" in err_text or "ResourceNotFound" in err_text:
                stats["skipped_rg_not_found"] += 1
                logger.warning(
                    f"Resource group '{rg_name}' not found in subscription "
                    f"{subscription_id} while listing {spec.resource_type_name}; "
                    f"skipping."
                )
                return None
            stats["skipped_collector_error"] += 1
            logger.error(
                f"Failed to list {spec.resource_type_name} in RG '{rg_name}' "
                f"under subscription {subscription_id}: {e}"
            )
            context.add_warning(
                f"Failed to list Azure {spec.resource_type_name} in RG "
                f"'{rg_name}' under subscription {subscription_id}: {e}"
            )
            return None

    # Phase 1: enumerate resource groups subscription-wide and post-filter.
    # RGs themselves only have a subscription-wide list endpoint, so this
    # is the one mandatory ``list_all`` call. Out-of-scope RGs are dropped
    # via ``_resource_is_in_scope`` and never reach the writer.
    rg_specs = [s for s in typed_specs_to_collect if s.resource_type_name == "resource_group"]
    non_rg_specs = [s for s in typed_specs_to_collect if s.resource_type_name != "resource_group"]

    for spec in rg_specs:
        for subscription_id in subscription_ids:
            models = _list_subscription_wide(spec, subscription_id)
            if models is None:
                continue
            logger.info(
                f"Collected {len(models)} {spec.resource_type_name} "
                f"from subscription {subscription_id}"
            )
            _process_models(spec, subscription_id, models, lod_filter=True)

    # Phase 2: non-RG specs. Per subscription, decide between selective
    # (per-RG) and subscription-wide enumeration.
    for spec in non_rg_specs:
        for subscription_id in subscription_ids:
            scope = discovery_scope.get(subscription_id)
            if scope is not None and spec.supports_in_rg:
                logger.info(
                    f"Selective discovery: listing {spec.resource_type_name} "
                    f"per-RG in subscription {subscription_id} "
                    f"(in-scope RGs={sorted(scope) if scope else '(none)'})"
                )
                for rg_name in scope:
                    models = _list_in_rg(spec, subscription_id, rg_name)
                    if models is None:
                        continue
                    logger.info(
                        f"Collected {len(models)} {spec.resource_type_name} "
                        f"from {subscription_id}/{rg_name}"
                    )
                    # Per-RG enumeration already restricts to in-scope RGs,
                    # so the LOD post-filter is a no-op; keeping it on as a
                    # belt-and-suspenders check is cheap and protects against
                    # SDK quirks (e.g. a child resource pointing to a
                    # different RG via its ARM id).
                    _process_models(spec, subscription_id, models, lod_filter=True)
                continue

            # Subscription-wide path: workspace declared unbounded discovery
            # (defaultLOD non-NONE, or wildcard non-NONE), or the spec lacks
            # a per-RG collector. Either way, list_all + LOD post-filter.
            if scope is not None and not spec.supports_in_rg:
                logger.warning(
                    f"Spec {spec.resource_type_name} has no per-RG collector; "
                    f"falling back to subscription-wide listing in "
                    f"{subscription_id}. Out-of-scope rows will be dropped "
                    f"via skipped_lod_filter."
                )
            models = _list_subscription_wide(spec, subscription_id)
            if models is None:
                continue
            logger.info(
                f"Collected {len(models)} {spec.resource_type_name} "
                f"from subscription {subscription_id}"
            )
            _process_models(spec, subscription_id, models, lod_filter=True)

    # Phase 3: generic ARM-resources pass.
    #
    # One ``ResourceManagementClient.resources.list[_by_resource_group]``
    # call per subscription (or per in-scope RG) returns *every*
    # top-level ARM resource the credential can see. We route each
    # ``GenericResource`` by its ``type`` field through the registry,
    # and emit it under the registry-mapped ``resource_type_name``
    # **only if** that type was referenced by an accessed gen rule and
    # **only if** the typed pass didn't already write the same ARM ID
    # (richer-typed-payload wins).
    #
    # This is what gives us coverage parity with the CloudQuery indexer:
    # any ARM resource type a gen rule cares about is discoverable, even
    # if we don't ship a hand-written collector for it. Types in
    # ``generic_specs_by_arm_type`` get the basic envelope (``id``,
    # ``name``, ``type``, ``location``, ``tags``, ``sku``, ``kind``,
    # ``identity``, ``managed_by``); ``properties`` is empty (that's an
    # ARM API limitation, not a workspace-builder one).
    if generic_specs_by_arm_type:
        from .azureapi_resource_types import (
            _collect_generic_resources_all,
            _collect_generic_resources_in_rg,
        )

        # ARM types the typed pass already owns. We never emit a generic
        # copy for these; the typed pass either already wrote them or was
        # gated off (mandatory/accessed) by intent.
        typed_arm_types = {
            (s.arm_type or "").lower()
            for s in typed_specs_to_collect
            if s.arm_type
        }

        def _route_generic(model) -> Optional[AzureResourceTypeSpec]:
            """Return the spec to emit a ``GenericResource`` under, or
            None if it should be dropped."""
            arm_type = getattr(model, "type", None) or (
                model.get("type") if isinstance(model, dict) else None
            )
            if not arm_type:
                return None
            arm_lower = arm_type.lower()
            if arm_lower in typed_arm_types:
                # Owned by the typed pass; skip silently.
                return None
            spec = generic_specs_by_arm_type.get(arm_lower)
            if spec is None:
                # ARM type is real but no gen rule referenced it. Drop
                # (the indexer is gen-rule-driven; we don't balloon the
                # resource store with unused rows).
                stats["generic_unmatched_arm_type"] += 1
                return None
            return spec

        def _generic_pass_for_rg(subscription_id: str, rg_name: str) -> None:
            try:
                resources_iter = list(
                    _collect_generic_resources_in_rg(
                        credential, subscription_id, rg_name
                    )
                )
            except Exception as e:
                err_text = str(e)
                if (
                    "ResourceGroupNotFound" in err_text
                    or "ResourceNotFound" in err_text
                ):
                    stats["skipped_rg_not_found"] += 1
                    logger.warning(
                        f"Resource group '{rg_name}' not found in subscription "
                        f"{subscription_id} during generic discovery; skipping."
                    )
                    return
                stats["skipped_collector_error"] += 1
                logger.error(
                    f"Generic ARM resources list failed for "
                    f"{subscription_id}/{rg_name}: {e}"
                )
                context.add_warning(
                    f"Failed to list generic Azure resources in RG "
                    f"'{rg_name}' under subscription {subscription_id}: {e}"
                )
                return
            _emit_generic_models(subscription_id, resources_iter, scope_label=f"{subscription_id}/{rg_name}")

        def _generic_pass_subscription_wide(subscription_id: str) -> None:
            try:
                resources_iter = list(
                    _collect_generic_resources_all(credential, subscription_id)
                )
            except Exception as e:
                stats["skipped_collector_error"] += 1
                logger.error(
                    f"Generic ARM resources list failed for "
                    f"subscription {subscription_id}: {e}"
                )
                context.add_warning(
                    f"Failed to list generic Azure resources in "
                    f"subscription {subscription_id}: {e}"
                )
                return
            _emit_generic_models(subscription_id, resources_iter, scope_label=f"subscription {subscription_id}")

        def _emit_generic_models(
            subscription_id: str, models: list, *, scope_label: str
        ) -> None:
            routed: dict[str, list] = {}
            for model in models:
                spec = _route_generic(model)
                if spec is None:
                    continue
                routed.setdefault(spec.cloudquery_table_name, []).append(model)
            for table_name, batch in routed.items():
                spec = find_spec(table_name)
                if spec is None:
                    continue
                logger.info(
                    f"Collected {len(batch)} {spec.resource_type_name} "
                    f"(generic) from {scope_label}"
                )
                _process_models(
                    spec, subscription_id, batch,
                    lod_filter=True, source="generic",
                )

        for subscription_id in subscription_ids:
            scope = discovery_scope.get(subscription_id)
            if scope is not None:
                logger.info(
                    f"Generic discovery (selective): listing ARM resources "
                    f"per-RG in subscription {subscription_id} "
                    f"(in-scope RGs={sorted(scope) if scope else '(none)'})"
                )
                for rg_name in scope:
                    _generic_pass_for_rg(subscription_id, rg_name)
            else:
                logger.info(
                    f"Generic discovery (subscription-wide): listing ARM "
                    f"resources in subscription {subscription_id}"
                )
                _generic_pass_subscription_wide(subscription_id)

    writer.finalize()

    logger.info(
        f"Azure SDK indexing complete: "
        f"discovered={stats['discovered']}, added={stats['added']} "
        f"(typed={stats['added_typed']}, generic={stats['added_generic']}), "
        f"generic_already_typed={stats['generic_already_typed']}, "
        f"generic_unmatched_arm_type={stats['generic_unmatched_arm_type']}, "
        f"skipped_tag_filter={stats['skipped_tag_filter']}, "
        f"skipped_lod_filter={stats['skipped_lod_filter']}, "
        f"skipped_rg_not_found={stats['skipped_rg_not_found']}, "
        f"skipped_parse_error={stats['skipped_parse_error']}, "
        f"skipped_collector_error={stats['skipped_collector_error']}"
    )

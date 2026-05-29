"""
Native GCP SDK indexer.

Replaces the CloudQuery-based GCP path with direct Cloud Asset Inventory (CAI)
and ``google-cloud-*`` calls while keeping the registry output compatible: each
resource is normalized into the same flat dict shape
``GCPPlatformHandler.parse_resource_data`` already accepts, and writes flow
through the :class:`ResourceWriter` seam.

Discovery model (simpler than Azure - GCP level-of-detail is per-project, with
no resource-group dimension):

* The configured ``projects`` are the discovery scope. Each project's LOD comes
  from ``projectLevelOfDetails[<id>]`` (falling back to the workspace default);
  projects whose effective LOD is ``NONE`` are skipped entirely (selective
  discovery), keeping the resource store focused on what gen rules need.
* The ``project`` resource is the mandatory anchor every other GCP resource
  links to; it is synthesized directly from config and written first.
* The per-service typed SDK collectors are the supported FUNCTIONAL baseline:
  a typed tier (compute instances/disks/snapshots/networks/subnetworks/
  firewalls/addresses, storage buckets, GKE clusters, Pub/Sub topics &
  subscriptions, IAM service accounts) uses ``google-cloud-*`` SDKs for rich
  payloads and needs only the relevant per-service viewer roles. These run
  whether or not Cloud Asset Inventory is available.
* Cloud Asset Inventory is an OPTIONAL accelerator that broadens coverage to
  resource types lacking a typed collector: a single ``list_assets`` call per
  project (scoped to the CAI asset types referenced by generation rules)
  returns full-payload assets, which we route by ``asset_type`` back to the
  registry-mapped ``resource_type_name``. The typed asset types are excluded
  from the CAI pass so a resource is never written twice. CAI is NOT required;
  if it is not enabled / not permitted, discovery proceeds on the typed
  collectors and the absence is logged informationally (never as an error).

Coexists with the CloudQuery indexer behind the ``GCP_INDEXER_BACKEND`` setting:

* ``"cloudquery"`` (default): this indexer is a no-op; CloudQuery handles GCP.
* ``"gcpapi"``:               this indexer discovers GCP resources and the
                              CloudQuery indexer skips the GCP block.

Component name: ``gcpapi``. Stage: ``INDEXER``.
"""

from __future__ import annotations

import logging
import os
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

from .common import CLOUD_CONFIG_SETTING
from .gcp_common import (
    gcp_get_credentials_and_projects,
    gcp_has_discovery_config,
    get_gcp_auth_type,
    has_excluded_tags,
    has_included_tags,
)
from .gcpapi_normalizers import (
    make_project_resource_data,
    normalize_gcp_asset,
    normalize_gcp_sdk_model,
)
from .gcpapi_resource_types import (
    PROJECTS_TABLE,
    collect_assets_for_project,
    find_spec,
    find_spec_by_cai_type,
)
from .resource_writer import (
    RESOURCE_STORE_BACKEND_SETTING,
    RESOURCE_STORE_PATH_SETTING,
    get_resource_writer,
)

logger = logging.getLogger(__name__)

GCP_PLATFORM = "gcp"

# Stable, grep-able marker emitted (at INFO) when the OPTIONAL Cloud Asset
# Inventory generic pass is not accessible (e.g. the API is not enabled or the
# service account lacks the CAI viewer role). It is purely informational: CAI is
# an accelerator that broadens coverage, NOT a requirement, so its absence must
# never fail discovery or CI. Operators can still grep for the token to confirm
# whether the CAI pass ran.
CAI_PERMISSION_DENIED_TOKEN = "GCP_CAI_PERMISSION_DENIED"

DOCUMENTATION = "Index GCP resources using Cloud Asset Inventory and the google-cloud SDKs"

# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

GCP_INDEXER_BACKEND_SETTING = Setting(
    "GCP_INDEXER_BACKEND",
    "gcpIndexerBackend",
    Setting.Type.STRING,
    "Selects the backend used to discover GCP resources. "
    "'cloudquery' (default) uses the legacy CloudQuery-based path; "
    "'gcpapi' uses the native Cloud Asset Inventory + google-cloud-* indexer.",
    "cloudquery",
)

SETTINGS = (
    SettingDependency(CLOUD_CONFIG_SETTING, False),
    SettingDependency(GCP_INDEXER_BACKEND_SETTING, False),
    SettingDependency(RESOURCE_STORE_BACKEND_SETTING, False),
    SettingDependency(RESOURCE_STORE_PATH_SETTING, False),
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _resolve_default_lod(context: Context, platform_cfg: dict[str, Any]) -> LevelOfDetail:
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


def _project_lod(
    platform_cfg: dict[str, Any],
    project_id: str,
    default_lod: LevelOfDetail,
) -> LevelOfDetail:
    """Effective LOD for ``project_id``. Mirrors the resolution chain in
    ``GCPPlatformHandler.parse_resource_data`` (per-project override ->
    workspace default)."""
    cfg = platform_cfg.get("projectLevelOfDetails", {}) or {}
    raw = cfg.get(project_id)
    if raw is None:
        return default_lod
    try:
        return LevelOfDetail.construct_from_config(raw)
    except Exception:
        return default_lod


def _accessed_gcp_type_names(context: Context) -> set[str]:
    """Return the set of GCP resource-type names referenced by loaded
    generation rules. Both the registry name and the CloudQuery table name are
    accepted as valid spec values; the result mixes them."""
    all_specs: Optional[dict[str, dict[ResourceTypeSpec, Any]]] = context.get_property(
        RESOURCE_TYPE_SPECS_PROPERTY
    )
    if not all_specs:
        return set()
    gcp_specs = all_specs.get(GCP_PLATFORM, {})
    return {spec.resource_type_name for spec in gcp_specs.keys()}


def _resolve_platform_handler(context: Context) -> PlatformHandler:
    handlers: Optional[dict[str, PlatformHandler]] = context.get_property(
        PLATFORM_HANDLERS_PROPERTY_NAME
    )
    if handlers and GCP_PLATFORM in handlers:
        return handlers[GCP_PLATFORM]
    from enrichers.gcp import GCPPlatformHandler

    return GCPPlatformHandler()


def _is_permission_denied(exc: Exception) -> bool:
    """Best-effort detection of a GCP 403 / PermissionDenied without importing
    the google SDK exception types at module scope (keeps this module importable
    where the SDK is absent). Covers both the gRPC ``PermissionDenied`` and the
    REST ``Forbidden`` shapes, plus a string fallback."""
    if type(exc).__name__ in ("PermissionDenied", "Forbidden"):
        return True
    code = getattr(exc, "code", None)
    # google.api_core PermissionDenied exposes code==403; grpc status objects
    # expose a callable .code(). Handle both without hard-depending on either.
    try:
        if callable(code):
            code = code()
    except Exception:  # pragma: no cover - defensive
        code = None
    if code == 403 or getattr(code, "value", None) == 403:
        return True
    if str(getattr(code, "name", "")).upper() == "PERMISSION_DENIED":
        return True
    text = str(exc).lower()
    return "403" in text and "permission" in text


def _note_cai_unavailable(context: Context, project_id: str, exc: Exception) -> None:
    """Note, informationally, that the OPTIONAL Cloud Asset Inventory generic
    pass was not accessible for this project.

    CAI is an accelerator that broadens coverage to resource types without a
    typed collector; it is NOT required for native GCP discovery. The per-service
    typed SDK collectors are the supported functional path and run independently
    of CAI, so a 403 / disabled-API here is normal and non-fatal. This is logged
    at INFO (no error, no banner, no warning) so CAI's absence never reads as a
    failure or fails CI."""
    message = (
        f"{CAI_PERMISSION_DENIED_TOKEN}: Cloud Asset Inventory was not accessible "
        f"for GCP project '{project_id}' ({exc}). This is informational, not an "
        f"error: CAI is an OPTIONAL accelerator that broadens coverage to resource "
        f"types lacking a typed collector. The per-service typed SDK collectors "
        f"(compute, storage, GKE, Pub/Sub, IAM, ...) are the functional discovery "
        f"path and continue to run normally. Enabling the Cloud Asset Inventory API "
        f"with a CAI viewer role is optional and only increases coverage breadth; "
        f"it is not required, so no action is needed."
    )
    logger.info(message)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def index(context: Context) -> None:
    backend = context.get_setting(GCP_INDEXER_BACKEND_SETTING)
    if backend != "gcpapi":
        logger.info(
            f"GCP indexer backend: '{backend}' (gcpIndexerBackend in "
            f"workspaceInfo.yaml). Native gcpapi indexer is a no-op; the "
            f"CloudQuery indexer will handle GCP."
        )
        return

    cloud_config = context.get_setting(CLOUD_CONFIG_SETTING) or {}
    platform_cfg = cloud_config.get(GCP_PLATFORM)
    if not platform_cfg:
        logger.info(
            "GCP indexer backend: 'gcpapi' selected, but no 'gcp' section in "
            "cloudConfig; nothing to discover."
        )
        return

    if not gcp_has_discovery_config(platform_cfg):
        logger.info(
            "GCP indexer backend: 'gcpapi' selected, but cloudConfig.gcp has no "
            "projects to discover (set 'projects' or 'projectId'). Skipping."
        )
        return

    logger.info(
        "GCP indexer backend: 'gcpapi' (Cloud Asset Inventory + google-cloud-* "
        "SDK). Starting GCP resource discovery."
    )

    creds_info = gcp_get_credentials_and_projects(platform_cfg)
    credentials = creds_info["credentials"]
    project_ids: list[str] = creds_info["project_ids"]
    for key, value in (creds_info.get("env") or {}).items():
        os.environ[key] = value

    if not project_ids:
        logger.warning("GCP indexer: no project IDs resolved; nothing to discover.")
        return

    # Mirror cloudquery.py so enrichers.gcp (get_project_name etc.) and any other
    # downstream code sees the same active project/auth we resolved here.
    auth_type, auth_secret = get_gcp_auth_type(platform_cfg)
    try:
        from enrichers.gcp import set_gcp_credentials

        set_gcp_credentials(
            project_id=creds_info.get("quota_project"),
            service_account_key=platform_cfg.get("serviceAccountKey"),
            auth_type=auth_type,
            auth_secret=auth_secret,
        )
    except Exception as e:
        logger.warning(f"Could not update enrichers.gcp credentials: {e}")

    accessed_names = _accessed_gcp_type_names(context)
    logger.info(
        f"GCP resource types referenced by generation rules: "
        f"{sorted(accessed_names) if accessed_names else '(none)'}"
    )

    # Resolve accessed gen-rule names -> specs. Split into the typed (SDK)
    # tier and the CAI generic tier. Typed asset types are excluded from the
    # CAI filter so each resource is written exactly once.
    typed_specs_to_collect = []
    seen_typed: set[str] = set()
    generic_cai_types: dict[str, Any] = {}  # lower(cai_type) -> spec
    typed_cai_types: set[str] = set()

    for accessed in accessed_names:
        spec = find_spec(accessed)
        if spec is None:
            warning = (
                f'GCP indexer: gen-rule references unknown GCP resource type '
                f'"{accessed}". Verify the name or add it to '
                f'scripts/gcp/gcp_resource_type_overrides.yaml and rerun the '
                f'sync script.'
            )
            logger.warning(warning)
            context.add_warning(warning)
            continue
        if spec.cloudquery_table_name == PROJECTS_TABLE:
            # The project anchor is always emitted below; no extra pass needed.
            continue
        if spec.collector is not None:
            if spec.cloudquery_table_name not in seen_typed:
                typed_specs_to_collect.append(spec)
                seen_typed.add(spec.cloudquery_table_name)
            if spec.cai_asset_type:
                typed_cai_types.add(spec.cai_asset_type.lower())
        elif spec.cai_asset_type:
            generic_cai_types[spec.cai_asset_type.lower()] = spec

    platform_handler = _resolve_platform_handler(context)
    include_tags = platform_cfg.get("includeTags", {})
    exclude_tags = platform_cfg.get("excludeTags", {})
    writer = get_resource_writer(context)
    default_lod = _resolve_default_lod(context, platform_cfg)

    # Determine which projects are in scope (LOD != NONE).
    in_scope_projects: list[str] = []
    for pid in project_ids:
        lod = _project_lod(platform_cfg, pid, default_lod)
        if lod is LevelOfDetail.NONE:
            logger.info(f"GCP project '{pid}': effective LOD is NONE; skipping.")
            continue
        in_scope_projects.append(pid)
        logger.info(f"GCP project '{pid}': in scope (LOD={lod}).")

    stats = {
        "discovered": 0,
        "added": 0,
        "added_projects": 0,
        "added_typed": 0,
        "added_generic": 0,
        "generic_unmatched_cai_type": 0,
        "skipped_tag_filter": 0,
        "skipped_parse_error": 0,
        "skipped_collector_error": 0,
        "cai_permission_denied": 0,
    }

    def _process(spec, project_id, resource_data, *, source: str) -> None:
        stats["discovered"] += 1
        if exclude_tags and has_excluded_tags(resource_data, exclude_tags):
            stats["skipped_tag_filter"] += 1
            return
        if include_tags and not has_included_tags(resource_data, include_tags):
            stats["skipped_tag_filter"] += 1
            return
        try:
            resource_name, qualified_name, resource_attributes = (
                platform_handler.parse_resource_data(
                    resource_data, spec.resource_type_name, platform_cfg, context
                )
            )
        except WorkspaceBuilderException as e:
            stats["skipped_parse_error"] += 1
            logger.warning(
                f"parse_resource_data rejected {spec.resource_type_name} in "
                f"project {project_id}: {e}"
            )
            return
        except (KeyError, ValueError, TypeError, AttributeError) as e:
            stats["skipped_parse_error"] += 1
            logger.warning(
                f"parse_resource_data raised {type(e).__name__} for "
                f"{spec.resource_type_name} in project {project_id}: {e}"
            )
            return

        resource_attributes["resource"] = resource_data
        resource_attributes["auth_type"] = auth_type
        resource_attributes["auth_secret"] = auth_secret

        writer.add_resource(
            GCP_PLATFORM,
            spec.resource_type_name,
            resource_name,
            qualified_name,
            resource_attributes,
        )
        stats["added"] += 1
        if source == "project":
            stats["added_projects"] += 1
        elif source == "typed":
            stats["added_typed"] += 1
        else:
            stats["added_generic"] += 1

    # Phase 0: emit the project anchors first so child resources can link to
    # their parent project at parse time (the handler does an immediate
    # registry lookup).
    project_spec = find_spec(PROJECTS_TABLE)
    for pid in in_scope_projects:
        _process(
            project_spec,
            pid,
            make_project_resource_data(pid),
            source="project",
        )

    if not accessed_names:
        writer.finalize()
        logger.info(
            f"GCP indexing complete (anchors only): "
            f"added_projects={stats['added_projects']}."
        )
        return

    # Phase 1: typed (SDK) collectors per project.
    for pid in in_scope_projects:
        for spec in typed_specs_to_collect:
            try:
                models = list(spec.collector(credentials, pid))
            except Exception as e:
                stats["skipped_collector_error"] += 1
                logger.error(
                    f"Failed to collect {spec.resource_type_name} in project "
                    f"{pid}: {e}"
                )
                context.add_warning(
                    f"Failed to collect GCP {spec.resource_type_name} in "
                    f"project {pid}: {e}"
                )
                continue
            logger.info(
                f"Collected {len(models)} {spec.resource_type_name} (typed) "
                f"from project {pid}"
            )
            for model in models:
                try:
                    resource_data = normalize_gcp_sdk_model(
                        model, project_id=pid, resource_type_name=spec.resource_type_name
                    )
                except Exception as e:
                    stats["skipped_parse_error"] += 1
                    logger.warning(
                        f"Failed to normalize GCP {spec.resource_type_name} "
                        f"model in project {pid}: {e}"
                    )
                    continue
                _process(spec, pid, resource_data, source="typed")

    # Phase 2: Cloud Asset Inventory generic pass per project, scoped to the
    # CAI asset types referenced by gen rules (minus the typed ones).
    if generic_cai_types:
        cai_filter = sorted(
            {
                spec.cai_asset_type
                for spec in generic_cai_types.values()
                if spec.cai_asset_type
            }
        )
        for pid in in_scope_projects:
            try:
                assets = list(collect_assets_for_project(credentials, pid, cai_filter))
            except Exception as e:
                if _is_permission_denied(e):
                    # Optional accelerator unavailable: informational, not an error.
                    stats["cai_permission_denied"] += 1
                    _note_cai_unavailable(context, pid, e)
                else:
                    stats["skipped_collector_error"] += 1
                    logger.error(
                        f"Cloud Asset Inventory list_assets failed for project "
                        f"{pid}: {e}"
                    )
                    context.add_warning(
                        f"Failed to list GCP assets in project {pid}: {e}"
                    )
                continue
            logger.info(
                f"Collected {len(assets)} assets (Cloud Asset Inventory) from "
                f"project {pid}"
            )
            for asset in assets:
                asset_type = (
                    getattr(asset, "asset_type", None)
                    or (asset.get("asset_type") if isinstance(asset, dict) else None)
                )
                spec = find_spec_by_cai_type(asset_type)
                if spec is None or (
                    spec.cai_asset_type
                    and spec.cai_asset_type.lower() not in generic_cai_types
                ):
                    stats["generic_unmatched_cai_type"] += 1
                    continue
                try:
                    resource_data = normalize_gcp_asset(
                        asset, project_id=pid, resource_type_name=spec.resource_type_name
                    )
                except Exception as e:
                    stats["skipped_parse_error"] += 1
                    logger.warning(
                        f"Failed to normalize CAI asset (type={asset_type}) in "
                        f"project {pid}: {e}"
                    )
                    continue
                _process(spec, pid, resource_data, source="generic")

    writer.finalize()

    logger.info(
        f"GCP indexing complete: "
        f"discovered={stats['discovered']}, added={stats['added']} "
        f"(projects={stats['added_projects']}, typed={stats['added_typed']}, "
        f"generic={stats['added_generic']}), "
        f"generic_unmatched_cai_type={stats['generic_unmatched_cai_type']}, "
        f"skipped_tag_filter={stats['skipped_tag_filter']}, "
        f"skipped_parse_error={stats['skipped_parse_error']}, "
        f"skipped_collector_error={stats['skipped_collector_error']}, "
        f"cai_permission_denied={stats['cai_permission_denied']}"
    )

    if stats["cai_permission_denied"]:
        logger.info(
            "GCP discovery completed via the typed SDK collectors; the OPTIONAL "
            "Cloud Asset Inventory accelerator was not accessible this run (see %s "
            "above). This is expected when CAI is not enabled and does not indicate "
            "a failure -- the typed collectors are the functional discovery path.",
            CAI_PERMISSION_DENIED_TOKEN,
        )

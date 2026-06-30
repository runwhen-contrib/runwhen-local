"""
Native AWS SDK indexer.

Replaces the CloudQuery-based AWS path with direct AWS Cloud Control API and
boto3 service calls while keeping the registry output compatible: each resource
is normalized into the same flat dict shape ``AWSPlatformHandler.parse_resource_data``
already accepts, and writes flow through the :class:`ResourceWriter` seam.

Discovery model (the AWS scope dimension is account + region(s)):

* The authenticated account is the discovery scope. Its LOD comes from
  ``accountLevelOfDetails[<account_id>]`` (falling back to the workspace
  default); an account whose effective LOD is ``NONE`` is skipped entirely
  (selective discovery), keeping the resource store focused on what gen rules
  need.
* The account (``aws_iam_accounts``) is the mandatory anchor every other AWS
  resource is scoped under; it is synthesized directly from the resolved
  credentials and written first.
* The Cloud Control API is the parity workhorse: one ``list_resources`` call
  per (region, CFN type) referenced by generation rules returns full-payload
  resources, routed by their CloudFormation type back to the registry-mapped
  ``resource_type_name``.
* A thin typed tier (EC2 instances, S3 buckets) uses native boto3 service
  clients for richer payloads; those CFN types are excluded from the Cloud
  Control pass so a resource is never written twice.

Coexists with the CloudQuery indexer behind the ``AWS_INDEXER_BACKEND`` setting:

* ``"awsapi"`` (default):     this indexer discovers AWS resources and the
                              CloudQuery indexer skips the AWS block.
* ``"cloudquery"``:           this indexer is a no-op; CloudQuery handles AWS
                              (legacy/fallback opt-in).

Component name: ``awsapi``. Stage: ``INDEXER``.
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

from .common import CLOUD_CONFIG_SETTING
from .aws_common import (
    aws_get_session_and_scope,
    aws_has_discovery_config,
    has_excluded_tags,
    has_included_tags,
)
from .awsapi_normalizers import (
    make_account_resource_data,
    normalize_aws_resource,
    normalize_cloudcontrol_resource,
)
from .awsapi_resource_types import (
    ACCOUNTS_TABLE,
    collect_cloudcontrol_resources,
    find_spec,
    find_spec_by_cfn_type,
)
from .resource_writer import (
    RESOURCE_STORE_BACKEND_SETTING,
    RESOURCE_STORE_PATH_SETTING,
    get_resource_writer,
)

logger = logging.getLogger(__name__)

AWS_PLATFORM = "aws"

DOCUMENTATION = "Index AWS resources using the Cloud Control API and boto3 SDKs"

# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

AWS_INDEXER_BACKEND_SETTING = Setting(
    "AWS_INDEXER_BACKEND",
    "awsIndexerBackend",
    Setting.Type.STRING,
    "Selects the backend used to discover AWS resources. "
    "'awsapi' (default) uses the native Cloud Control API + boto3 indexer; "
    "'cloudquery' opts back into the legacy CloudQuery-based path.",
    "awsapi",
)

SETTINGS = (
    SettingDependency(CLOUD_CONFIG_SETTING, False),
    SettingDependency(AWS_INDEXER_BACKEND_SETTING, False),
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


def _account_lod(
    platform_cfg: dict[str, Any],
    account_id: str,
    default_lod: LevelOfDetail,
) -> LevelOfDetail:
    """Effective LOD for ``account_id`` (per-account override -> default)."""
    cfg = platform_cfg.get("accountLevelOfDetails", {}) or {}
    raw = cfg.get(account_id)
    if raw is None:
        return default_lod
    try:
        return LevelOfDetail.construct_from_config(raw)
    except Exception:
        return default_lod


def _accessed_aws_type_names(context: Context) -> set[str]:
    """Return the set of AWS resource-type names referenced by loaded
    generation rules. Both the registry name and the CloudQuery table name are
    accepted as valid spec values; the result mixes them."""
    all_specs: Optional[dict[str, dict[ResourceTypeSpec, Any]]] = context.get_property(
        RESOURCE_TYPE_SPECS_PROPERTY
    )
    if not all_specs:
        return set()
    aws_specs = all_specs.get(AWS_PLATFORM, {})
    return {spec.resource_type_name for spec in aws_specs.keys()}


def _resolve_platform_handler(context: Context) -> PlatformHandler:
    handlers: Optional[dict[str, PlatformHandler]] = context.get_property(
        PLATFORM_HANDLERS_PROPERTY_NAME
    )
    if handlers and AWS_PLATFORM in handlers:
        return handlers[AWS_PLATFORM]
    from enrichers.aws import AWSPlatformHandler

    return AWSPlatformHandler()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def index(context: Context) -> None:
    backend = context.get_setting(AWS_INDEXER_BACKEND_SETTING)
    if backend != "awsapi":
        logger.info(
            f"AWS indexer backend: '{backend}' (awsIndexerBackend in "
            f"workspaceInfo.yaml). Native awsapi indexer is a no-op; the "
            f"CloudQuery indexer will handle AWS."
        )
        return

    cloud_config = context.get_setting(CLOUD_CONFIG_SETTING) or {}
    platform_cfg = cloud_config.get(AWS_PLATFORM)
    if not platform_cfg:
        logger.info(
            "AWS indexer backend: 'awsapi' selected, but no 'aws' section in "
            "cloudConfig; nothing to discover."
        )
        return

    if not aws_has_discovery_config(platform_cfg):
        logger.info(
            "AWS indexer backend: 'awsapi' selected, but cloudConfig.aws is "
            "empty. Skipping."
        )
        return

    logger.info(
        "AWS indexer backend: 'awsapi' (Cloud Control API + boto3 SDK). "
        "Starting AWS resource discovery."
    )

    scope = aws_get_session_and_scope(platform_cfg)
    session = scope["session"]
    account_id = scope["account_id"]
    regions: list[str] = scope["regions"]
    auth_type = scope["auth_type"]
    auth_secret = scope["auth_secret"]

    if not account_id:
        logger.warning("AWS indexer: no account id resolved; nothing to discover.")
        return

    # The handler resolves account_name from this map; persist it on the config
    # the same way the CloudQuery path does.
    platform_cfg["_account_names"] = scope["account_names"]

    # Mirror cloudquery.py so enrichers.aws (cached auth/account) and any other
    # downstream code sees the same active credentials we resolved here.
    try:
        from enrichers.aws import set_aws_credentials

        set_aws_credentials(
            session=session,
            auth_type=auth_type,
            account_id=account_id,
            account_alias=scope.get("account_alias"),
            assume_role_arn=platform_cfg.get("assumeRoleArn"),
            auth_secret=auth_secret,
        )
    except Exception as e:
        logger.warning(f"Could not update enrichers.aws credentials: {e}")

    accessed_names = _accessed_aws_type_names(context)
    logger.info(
        f"AWS resource types referenced by generation rules: "
        f"{sorted(accessed_names) if accessed_names else '(none)'}"
    )

    # Resolve accessed gen-rule names -> specs. Split into the typed (boto3)
    # tier and the Cloud Control generic tier. Typed CFN types are excluded
    # from the generic filter so each resource is written exactly once.
    typed_specs_to_collect = []
    seen_typed: set[str] = set()
    generic_specs: list = []  # specs served by the Cloud Control pass
    seen_generic: set[str] = set()

    for accessed in accessed_names:
        spec = find_spec(accessed)
        if spec is None:
            warning = (
                f'AWS indexer: gen-rule references unknown AWS resource type '
                f'"{accessed}". Verify the name or add it to '
                f'scripts/aws/aws_resource_type_overrides.yaml and rerun the '
                f'sync script.'
            )
            logger.warning(warning)
            context.add_warning(warning)
            continue
        if spec.cloudquery_table_name == ACCOUNTS_TABLE:
            # The account anchor is always emitted below; no extra pass needed.
            continue
        if spec.collector is not None:
            if spec.cloudquery_table_name not in seen_typed:
                typed_specs_to_collect.append(spec)
                seen_typed.add(spec.cloudquery_table_name)
        elif spec.cfn_type:
            if spec.cloudquery_table_name not in seen_generic:
                generic_specs.append(spec)
                seen_generic.add(spec.cloudquery_table_name)

    platform_handler = _resolve_platform_handler(context)
    include_tags = platform_cfg.get("includeTags", {})
    exclude_tags = platform_cfg.get("excludeTags", {})
    writer = get_resource_writer(context)
    default_lod = _resolve_default_lod(context, platform_cfg)

    # Determine whether the account is in scope (LOD != NONE).
    account_lod = _account_lod(platform_cfg, str(account_id), default_lod)
    if account_lod is LevelOfDetail.NONE:
        logger.info(
            f"AWS account '{account_id}': effective LOD is NONE; skipping."
        )
        return
    logger.info(
        f"AWS account '{account_id}': in scope (LOD={account_lod}, "
        f"regions={regions})."
    )

    stats = {
        "discovered": 0,
        "added": 0,
        "added_accounts": 0,
        "added_typed": 0,
        "added_generic": 0,
        "skipped_dedup": 0,
        "skipped_tag_filter": 0,
        "skipped_parse_error": 0,
        "skipped_collector_error": 0,
    }
    # Dedup across regions so a global resource (S3 bucket, IAM role) listed
    # from multiple regional endpoints is written once.
    seen_arns: set[tuple[str, str]] = set()

    def _process(spec, region, resource_data, *, source: str) -> None:
        stats["discovered"] += 1
        if exclude_tags and has_excluded_tags(resource_data, exclude_tags):
            stats["skipped_tag_filter"] += 1
            return
        if include_tags and not has_included_tags(resource_data, include_tags):
            stats["skipped_tag_filter"] += 1
            return

        arn = resource_data.get("arn")
        dedup_key = (spec.resource_type_name, str(arn))
        if arn and dedup_key in seen_arns:
            stats["skipped_dedup"] += 1
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
                f"region {region}: {e}"
            )
            return
        except (KeyError, ValueError, TypeError, AttributeError) as e:
            stats["skipped_parse_error"] += 1
            logger.warning(
                f"parse_resource_data raised {type(e).__name__} for "
                f"{spec.resource_type_name} in region {region}: {e}"
            )
            return

        if arn:
            seen_arns.add(dedup_key)

        resource_attributes["resource"] = resource_data
        resource_attributes.setdefault("auth_type", auth_type)
        resource_attributes.setdefault("auth_secret", auth_secret)

        writer.add_resource(
            AWS_PLATFORM,
            spec.resource_type_name,
            resource_name,
            qualified_name,
            resource_attributes,
        )
        stats["added"] += 1
        if source == "account":
            stats["added_accounts"] += 1
        elif source == "typed":
            stats["added_typed"] += 1
        else:
            stats["added_generic"] += 1

    primary_region = regions[0] if regions else None

    # Phase 0: emit the account anchor first so it is present before children.
    account_spec = find_spec(ACCOUNTS_TABLE)
    _process(
        account_spec,
        "global",
        make_account_resource_data(
            account_id,
            account_name=scope.get("account_name"),
            account_alias=scope.get("account_alias"),
        ),
        source="account",
    )

    if not accessed_names:
        writer.finalize()
        logger.info(
            f"AWS indexing complete (anchor only): "
            f"added_accounts={stats['added_accounts']}."
        )
        return

    # Phase 1: typed (boto3) collectors. Regional collectors run per region;
    # global collectors (S3, ...) run once.
    for spec in typed_specs_to_collect:
        collect_regions = regions if spec.regional else [primary_region]
        for region in collect_regions:
            try:
                payloads = list(spec.collector(session, account_id, region))
            except Exception as e:
                stats["skipped_collector_error"] += 1
                logger.error(
                    f"Failed to collect {spec.resource_type_name} in region "
                    f"{region}: {e}"
                )
                context.add_warning(
                    f"Failed to collect AWS {spec.resource_type_name} in "
                    f"region {region}: {e}"
                )
                continue
            logger.info(
                f"Collected {len(payloads)} {spec.resource_type_name} (typed) "
                f"from region {region}"
            )
            # For global collectors the payload carries its own region; pass
            # None so the normalizer keeps it.
            norm_region = region if spec.regional else None
            for payload in payloads:
                try:
                    resource_data = normalize_aws_resource(
                        payload,
                        account_id=account_id,
                        region=norm_region,
                        resource_type_name=spec.resource_type_name,
                        cfn_type=spec.cfn_type,
                        identifier=(payload.get("id") or payload.get("Arn")),
                    )
                except Exception as e:
                    stats["skipped_parse_error"] += 1
                    logger.warning(
                        f"Failed to normalize AWS {spec.resource_type_name} "
                        f"payload in region {region}: {e}"
                    )
                    continue
                _process(spec, region, resource_data, source="typed")

    # Phase 2: Cloud Control generic pass, one list_resources call per
    # (region, CFN type) referenced by gen rules (minus the typed ones).
    for region in regions:
        for spec in generic_specs:
            cfn_type = spec.cfn_type
            try:
                descriptions = list(
                    collect_cloudcontrol_resources(session, region, cfn_type)
                )
            except Exception as e:
                stats["skipped_collector_error"] += 1
                logger.error(
                    f"Cloud Control list_resources failed for {cfn_type} in "
                    f"region {region}: {e}"
                )
                context.add_warning(
                    f"Failed to list AWS {cfn_type} in region {region}: {e}"
                )
                continue
            logger.info(
                f"Collected {len(descriptions)} {cfn_type} (Cloud Control) "
                f"from region {region}"
            )
            for desc in descriptions:
                # Route by CFN type for robustness, mirroring GCP's CAI dispatch.
                routed = find_spec_by_cfn_type(cfn_type) or spec
                try:
                    resource_data = normalize_cloudcontrol_resource(
                        desc,
                        account_id=account_id,
                        region=region,
                        resource_type_name=routed.resource_type_name,
                        cfn_type=cfn_type,
                    )
                except Exception as e:
                    stats["skipped_parse_error"] += 1
                    logger.warning(
                        f"Failed to normalize Cloud Control resource "
                        f"(type={cfn_type}) in region {region}: {e}"
                    )
                    continue
                _process(routed, region, resource_data, source="generic")

    writer.finalize()

    logger.info(
        f"AWS indexing complete: "
        f"discovered={stats['discovered']}, added={stats['added']} "
        f"(accounts={stats['added_accounts']}, typed={stats['added_typed']}, "
        f"generic={stats['added_generic']}), "
        f"skipped_dedup={stats['skipped_dedup']}, "
        f"skipped_tag_filter={stats['skipped_tag_filter']}, "
        f"skipped_parse_error={stats['skipped_parse_error']}, "
        f"skipped_collector_error={stats['skipped_collector_error']}"
    )

"""
Shared Azure helper functions used by both the legacy CloudQuery-based Azure
indexer (``cloudquery.py``) and the native Azure SDK indexer (``azureapi.py``).

These were originally defined inline in ``cloudquery.py``. They have been
relocated here verbatim so both indexers can call them while the CloudQuery
Azure path remains live behind the ``AZURE_INDEXER_BACKEND`` feature flag.

Nothing in this module is supposed to know about CloudQuery internals -- it is
the lowest layer of Azure-specific logic that both indexers share.
"""

import base64
import logging
import os
import sys
from typing import Any

import requests
from azure.identity import ClientSecretCredential, DefaultAzureCredential
from azure.mgmt.resource import ResourceManagementClient, SubscriptionClient

from exceptions import WorkspaceBuilderException
from utils import mask_string

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from k8s_utils import get_secret  # noqa: E402

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tag filtering helpers
# ---------------------------------------------------------------------------

def has_included_tags(resource_data: dict, include_tags: dict[str, str]) -> bool:
    """Returns True if any of the tags in ``include_tags`` are found in ``resource_data``."""
    tags = resource_data.get("tags", {})
    return any(tags.get(key) == value for key, value in include_tags.items())


def has_excluded_tags(resource_data: dict, exclude_tags: dict[str, str]) -> bool:
    """Returns True if any of the tags in ``exclude_tags`` are found in ``resource_data``."""
    tags = resource_data.get("tags", {})
    for key, value in exclude_tags.items():
        if tags.get(key) == value:
            logger.info(
                f"Excluding resource {resource_data.get('name', 'unknown')} "
                f"due to tag '{key}: {value}'"
            )
            return True
    return False


# ---------------------------------------------------------------------------
# Authentication helpers
# ---------------------------------------------------------------------------

def get_managed_identity_details() -> dict[str, Any]:
    """Resolve subscription / tenant / client info from the IMDS endpoint."""
    credential = DefaultAzureCredential()

    subscription_client = SubscriptionClient(credential)
    subscription = next(subscription_client.subscriptions.list())
    subscription_id = subscription.subscription_id
    tenant_id = subscription.tenant_id

    imds_url = "http://169.254.169.254/metadata/identity/oauth2/token"
    headers = {"Metadata": "true"}
    params = {
        "api-version": "2019-08-01",
        "resource": "https://management.azure.com/",
    }

    response = requests.get(imds_url, headers=headers, params=params)
    response.raise_for_status()

    token_data = response.json()
    client_id = token_data.get("client_id")

    return {
        "AZURE_TENANT_ID": tenant_id,
        "AZURE_CLIENT_ID": client_id,
        "AZURE_SUBSCRIPTION_ID": subscription_id,
        "credential": credential,
    }


def az_get_credentials_and_subscription_id(platform_config_data: dict[str, Any]) -> dict[str, Any]:
    """
    Resolve Azure authentication and return:
        credential             - azure-identity credential object
        subscription_ids       - list[str]   (final list for downstream use)
        AZURE_* keys           - env-var values for SP / MI auth
    """

    sp_secret_name = platform_config_data.get("spSecretName")
    client_id = client_secret = tenant_id = None
    if sp_secret_name:
        secret = get_secret(sp_secret_name)
        tenant_id = base64.b64decode(secret.get("tenantId")).decode()
        client_id = base64.b64decode(secret.get("clientId")).decode()
        client_secret = base64.b64decode(secret.get("clientSecret")).decode()

    if not all([client_id, client_secret, tenant_id]):
        client_id = platform_config_data.get("clientId")
        client_secret = platform_config_data.get("clientSecret")
        tenant_id = platform_config_data.get("tenantId")

    # Detect the common foot-gun where the user supplies a Service Principal
    # but one of the three SP fields renders as an empty string (e.g. an
    # un-substituted ``"${AZ_CLIENT_SECRET}"`` or a redacted ``tf.secret``).
    # Without this guard we silently fall through to Managed Identity /
    # DefaultAzureCredential and the user is left chasing a 30-line
    # ChainedTokenCredential traceback.
    sp_fields = {
        "clientId": client_id,
        "clientSecret": client_secret,
        "tenantId": tenant_id,
    }
    populated = {k: v for k, v in sp_fields.items() if v}
    empty = [k for k, v in sp_fields.items() if v == ""]
    if populated and empty:
        raise WorkspaceBuilderException(
            "Azure Service Principal configuration is incomplete: "
            f"{', '.join(sorted(populated))} provided but "
            f"{', '.join(sorted(empty))} is empty. "
            "Verify that all of cloudConfig.azure.{clientId,clientSecret,tenantId} "
            "are set in workspaceInfo.yaml (or that the env vars referenced from "
            "your secret file are populated before the YAML is rendered)."
        )

    explicit_sub_ids = [
        str(e["subscriptionId"])
        for e in platform_config_data.get("subscriptions", [])
        if e.get("subscriptionId")
    ]

    if explicit_sub_ids:
        subscription_ids = explicit_sub_ids
    else:
        subscription_ids: list[str] = []
        legacy_sid = platform_config_data.get("subscriptionId")
        if legacy_sid:
            subscription_ids.append(str(legacy_sid))
        env_sid = os.getenv("AZURE_SUBSCRIPTION_ID")
        if env_sid and env_sid not in subscription_ids:
            subscription_ids.append(str(env_sid))

    if not subscription_ids:
        raise ValueError("No Azure subscriptionId supplied.")

    if all([client_id, client_secret, tenant_id]):
        credential = ClientSecretCredential(tenant_id, client_id, client_secret)
    else:
        mi = get_managed_identity_details()
        credential = mi["credential"]
        client_id = client_id or mi.get("AZURE_CLIENT_ID")
        tenant_id = tenant_id or mi.get("AZURE_TENANT_ID")

    result = {
        "credential": credential,
        "subscription_ids": subscription_ids,
        "AZURE_SUBSCRIPTION_ID": subscription_ids[0],
    }
    if client_id:
        result["AZURE_CLIENT_ID"] = client_id
    if client_secret:
        result["AZURE_CLIENT_SECRET"] = client_secret
    if tenant_id:
        result["AZURE_TENANT_ID"] = tenant_id
    return result


def _azure_has_only_devops_config(platform_cfg: dict) -> bool:
    """Return True when the azure config block has no cloud discovery credentials.

    This happens when the user only configures ``azure.devops`` (for the ADO
    indexer) without providing a subscriptionId or service-principal /
    managed-identity credentials needed for Azure resource discovery.
    """
    has_sub = bool(
        platform_cfg.get("subscriptionId")
        or platform_cfg.get("subscriptions")
        or os.getenv("AZURE_SUBSCRIPTION_ID")
    )
    has_sp = bool(
        platform_cfg.get("spSecretName")
        or (platform_cfg.get("clientId") and platform_cfg.get("clientSecret"))
    )
    has_devops = bool(platform_cfg.get("devops"))
    return has_devops and not has_sub and not has_sp


def az_discover_resource_groups(credential, subscription_id) -> list[str]:
    if not subscription_id:
        raise ValueError("subscription_id cannot be None in az_discover_resource_groups.")

    logger.debug(f"Discovering resource groups for subscription_id: {mask_string(subscription_id)}")

    resource_groups = []
    try:
        resource_client = ResourceManagementClient(credential, subscription_id)
        for rg in resource_client.resource_groups.list():
            resource_groups.append(rg.name)
            logger.info(f"Discovered resource group: {rg.name}")
    except Exception as e:
        logger.error(f"Failed to discover resource groups: {str(e)}")
        raise WorkspaceBuilderException(f"Error discovering resource groups: {str(e)}")

    if not resource_groups:
        logger.warning("No resource groups were discovered.")
    else:
        logger.info(f"Total resource groups discovered: {len(resource_groups)}")

    return resource_groups


def az_validate_credential_access(credential, subscription_id):
    try:
        resource_client = ResourceManagementClient(credential, subscription_id)
        resource_groups = list(resource_client.resource_groups.list())
        if resource_groups:
            logger.info(f"Successfully accessed {len(resource_groups)} resource groups.")
        else:
            logger.warning("No resource groups found.")
    except Exception as e:
        logger.error(f"Failed to validate credential access: {str(e)}")
        raise WorkspaceBuilderException("Credential validation failed.")


# ---------------------------------------------------------------------------
# Deferred RG resolution (post-index pass)
# ---------------------------------------------------------------------------

def resolve_deferred_azure_relationships(registry, platform_handlers):
    """
    Resolve deferred resource group relationships for Azure resources.
    This handles cases where storage accounts (or any non-RG resource) were
    processed before their resource groups.

    ``registry`` is a ``resources.Registry``; ``platform_handlers`` is a dict
    keyed by platform name (we only look up ``"azure"``).
    """
    logger.info("Starting deferred Azure relationship resolution...")

    azure_handler = platform_handlers.get("azure")
    if not azure_handler:
        logger.debug("No Azure platform handler found, skipping deferred relationship resolution")
        return

    azure_platform = registry.platforms.get("azure")
    if not azure_platform:
        logger.debug("No Azure platform in registry, skipping deferred relationship resolution")
        return

    rg_type = azure_platform.resource_types.get("resource_group")
    if not rg_type:
        logger.debug("No resource groups in registry, skipping deferred relationship resolution")
        return

    resolved_count = 0
    failed_count = 0

    for resource_type_name, resource_type in azure_platform.resource_types.items():
        if resource_type_name == "resource_group":
            continue

        for resource_qualified_name, resource in list(resource_type.instances.items()):
            deferred_info = getattr(resource, '_deferred_rg_lookup', None)
            if not deferred_info:
                continue

            rg_name = deferred_info.get('rg_name')
            subscription_id = deferred_info.get('subscription_id')

            logger.debug(
                f"Resolving deferred relationship for {resource.name}: "
                f"looking for RG '{rg_name}' in subscription '{subscription_id}'"
            )

            rg_resource = None
            for rg in rg_type.instances.values():
                if (rg.name.upper() == rg_name.upper()
                        and getattr(rg, 'subscription_id', None) == subscription_id):
                    rg_resource = rg
                    break

            if rg_resource:
                setattr(resource, 'resource_group', rg_resource)
                new_qualified_name = f"{rg_resource.name}/{resource.name}"

                old_qualified_name = resource.qualified_name
                resource.qualified_name = new_qualified_name

                if old_qualified_name in resource_type.instances:
                    del resource_type.instances[old_qualified_name]
                resource_type.instances[new_qualified_name] = resource

                delattr(resource, '_deferred_rg_lookup')

                resolved_count += 1
                logger.info(
                    f"SUCCESS: Resolved deferred relationship for '{resource.name}' -> "
                    f"resource group '{rg_resource.name}' "
                    f"(qualified name: {old_qualified_name} -> {new_qualified_name})"
                )
            else:
                failed_count += 1
                logger.warning(
                    f"FAILED: Could not resolve deferred relationship for '{resource.name}' - "
                    f"resource group '{rg_name}' in subscription '{subscription_id}' still not found"
                )

    logger.info(
        f"Deferred relationship resolution completed: "
        f"{resolved_count} resolved, {failed_count} failed"
    )


# ---------------------------------------------------------------------------
# Auth-type derivation (Azure + AWS branches)
# ---------------------------------------------------------------------------

def get_auth_type(platform_name, platform_config_data: dict[str, Any]):
    """
    Determine auth type from platform_config_data for use with auth templates.

    For Azure: azure-auth.yaml template
    For AWS: aws-auth.yaml template

    Returns:
        Tuple of (auth_type, auth_secret)
    """
    auth_secret = None
    auth_type = None

    if platform_name == "azure":
        auth_secret = platform_config_data.get("clientId")
        if auth_secret:
            auth_type = "azure_explicit"
            auth_secret = None
        else:
            auth_secret = platform_config_data.get("spSecretName")
            if auth_secret:
                auth_type = "azure_service_principal_secret"
            else:
                auth_type = "azure_identity"
                auth_secret = None

    elif platform_name == "aws":
        if platform_config_data.get("_auth_type"):
            auth_type = platform_config_data.get("_auth_type")
            auth_secret = platform_config_data.get("_auth_secret")
        elif platform_config_data.get("awsAccessKeyId"):
            auth_type = "aws_explicit"
        elif platform_config_data.get("awsSecretName"):
            auth_secret = platform_config_data.get("awsSecretName")
            auth_type = "aws_secret"
        elif (platform_config_data.get("useWorkloadIdentity")
              or os.environ.get('AWS_WEB_IDENTITY_TOKEN_FILE')
              or os.environ.get('AWS_CONTAINER_CREDENTIALS_FULL_URI')):
            if os.environ.get('AWS_CONTAINER_CREDENTIALS_FULL_URI'):
                auth_type = "aws_pod_identity"
            else:
                auth_type = "aws_workload_identity"
        elif platform_config_data.get("assumeRoleArn"):
            auth_type = "aws_assume_role"
        else:
            auth_type = "aws_default_chain"

        if (platform_config_data.get("assumeRoleArn")
                and auth_type not in (
                    "aws_assume_role",
                    "aws_explicit_assume_role",
                    "aws_secret_assume_role",
                    "aws_workload_identity_assume_role",
                    "aws_pod_identity_assume_role",
                )):
            auth_type = auth_type + "_assume_role"

    return auth_type, auth_secret

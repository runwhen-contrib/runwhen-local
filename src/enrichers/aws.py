import logging
import os
from typing import Any, Dict, Optional

import boto3

from component import Context
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import PlatformHandler, LevelOfDetail
from exceptions import WorkspaceBuilderException

AWS_PLATFORM = "aws"
logger = logging.getLogger(__name__)

# Cache for AWS credentials (set by cloudquery indexer)
_aws_credentials = {
    "session": None,
    "auth_type": None,
    "account_id": None,
    "account_alias": None,
    "assume_role_arn": None,
    "auth_secret": None,
}

# Cache account names keyed by account_id to support multi-account discovery.
# Similar to Azure's subscription_names_cache pattern.
account_names_cache: Dict[str, str] = {}


def set_aws_credentials(
    session: boto3.Session = None,
    auth_type: str = None,
    account_id: str = None,
    account_alias: str = None,
    account_name: str = None,
    assume_role_arn: str = None,
    auth_secret: str = None
):
    """
    Set AWS credentials for reuse in enricher operations.
    Called by cloudquery indexer after authentication.
    
    Args:
        session: Pre-configured boto3 session
        auth_type: Type of authentication used (aws_explicit, aws_secret, etc.)
        account_id: AWS account ID
        account_alias: AWS account alias
        account_name: Human-readable account name for the authenticated account
        assume_role_arn: ARN of assumed role (if using assume role)
        auth_secret: Name of Kubernetes secret containing credentials (if applicable)
    """
    global _aws_credentials
    if session:
        _aws_credentials["session"] = session
    if auth_type:
        _aws_credentials["auth_type"] = auth_type
    if account_id:
        _aws_credentials["account_id"] = account_id
    if account_alias:
        _aws_credentials["account_alias"] = account_alias
    if assume_role_arn:
        _aws_credentials["assume_role_arn"] = assume_role_arn
    if auth_secret:
        _aws_credentials["auth_secret"] = auth_secret
    
    # Seed the account names cache with the authenticated account
    if account_id and account_name:
        account_names_cache[account_id] = account_name
        logger.info(f"[account_name] Seeded account names cache: {account_id} -> {account_name}")
    elif account_id:
        logger.warning(f"[account_name] No account_name provided for account_id {account_id}, cache not seeded")
    
    logger.info(f"Set AWS enricher credentials: auth_type={auth_type}, account_id={account_id}, account_name={account_name}, account_alias={account_alias}")


def get_aws_session() -> boto3.Session:
    """
    Get the cached AWS session or create a new one using default credentials.
    
    Returns:
        boto3 Session
    """
    global _aws_credentials
    if _aws_credentials["session"]:
        return _aws_credentials["session"]
    # Fallback to default session
    return boto3.Session()


def get_aws_auth_type() -> Optional[str]:
    """Get the cached AWS authentication type."""
    return _aws_credentials.get("auth_type")


def get_cached_account_id() -> Optional[str]:
    """Get the cached AWS account ID."""
    return _aws_credentials.get("account_id")


def get_cached_account_alias() -> Optional[str]:
    """Get the cached AWS account alias."""
    return _aws_credentials.get("account_alias")


def get_cached_assume_role_arn() -> Optional[str]:
    """Get the cached AWS assume role ARN."""
    return _aws_credentials.get("assume_role_arn")


def get_cached_auth_secret() -> Optional[str]:
    """Get the cached AWS auth secret name."""
    return _aws_credentials.get("auth_secret")


def get_account_name(account_id: str) -> str:
    """
    Get the display name of an AWS account by ID.
    Uses a cache to avoid repeated API calls, similar to Azure's get_subscription_name().
    
    For the authenticated account, the cache is seeded during init via
    account:GetAccountInformation. For other accounts (multi-account discovery),
    falls back to organizations:DescribeAccount, then to account_id.
    """
    if not account_id:
        logger.warning("[account_name] get_account_name called with empty account_id")
        return "Unknown Account"
    
    # Return cached name if available
    if account_id in account_names_cache:
        cached = account_names_cache[account_id]
        logger.debug(f"[account_name] Cache hit: {account_id} -> {cached}")
        return cached
    
    logger.info(f"[account_name] Cache miss for account_id {account_id}, attempting Organizations API lookup")
    
    # Cache miss — this account differs from the authenticated one.
    # Try Organizations API (requires organizations:DescribeAccount permission).
    session = get_aws_session()
    try:
        org_client = session.client('organizations')
        response = org_client.describe_account(AccountId=account_id)
        org_name = response.get('Account', {}).get('Name')
        if org_name:
            logger.info(f"Resolved account name from Organizations API: {account_id} -> {org_name}")
            account_names_cache[account_id] = org_name
            return org_name
    except Exception as e:
        logger.warning(
            f"Could not resolve account name for {account_id} via Organizations API: {e}. "
            f"Using account_id as fallback. Grant organizations:DescribeAccount for cross-account name resolution."
        )
    
    # Fall back to account_id
    account_names_cache[account_id] = account_id
    return account_id

class ARN:
    def __init__(self, arn_string: str):
        parts = arn_string.split(':', 5)
        self.partition = parts[1]
        self.service = parts[2]
        self.region = parts[3]
        self.account = parts[4]
        resource_info = parts[5]
        resource_parts = resource_info.split(':', 1) if ':' in resource_info else resource_info.split('/', 1)
        self.resource_type = resource_parts[0] if resource_parts else self.service
        self.resource_id = resource_parts[1] if len(resource_parts) > 1 else resource_parts[0]


class AWSPlatformHandler(PlatformHandler):
    def __init__(self):
        super().__init__(AWS_PLATFORM)

    def parse_resource_data(
        self,
        resource_data: dict[str, Any],
        resource_type_name: str,
        platform_config_data: dict[str, Any],
        context: Context
    ) -> tuple[str, str, dict[str, Any]]:
        # Extract ARN and validate
        arn_string = resource_data.get("arn")
        if not arn_string:
            raise ValueError(f"ARN is required for AWS resource data. Available fields: {list(resource_data.keys())}")

        try:
            arn = ARN(arn_string)
        except Exception as e:
            raise ValueError(f"Invalid ARN format '{arn_string}': {e}") from e
            
        name = resource_data.get("name", arn.resource_id)  # Fallback to ARN resource_id
        if not name:
            raise ValueError(f"Resource missing both 'name' field and valid ARN resource_id. ARN: {arn_string}")
        tags = resource_data.get("tags", {})

        # Populate qualifiers
        policy_status = resource_data.get('policy_status') or {}
        resource_attributes = {
            'tags': tags,
            'account_id': resource_data.get('account_id', arn.account),
            'region': resource_data.get('region', arn.region),
            'service': arn.service,
            'arn': arn_string,
            'is_public': policy_status.get('IsPublic', False),
        }
        
        # Add auth type from cached credentials (set by cloudquery indexer)
        auth_type = get_aws_auth_type()
        if auth_type:
            resource_attributes['auth_type'] = auth_type
        
        # Add account alias if available
        account_alias = get_cached_account_alias()
        if account_alias:
            resource_attributes['account_alias'] = account_alias
        
        # Add account_name per resource account_id (supports multi-account discovery)
        resource_account_id = resource_attributes.get('account_id', '')
        resolved_account_name = get_account_name(resource_account_id)
        resource_attributes['account_name'] = resolved_account_name
        logger.info(f"[account_name] Resource '{name}' in account {resource_account_id} -> account_name='{resolved_account_name}'")
        
        # Add assume role ARN if available (for assume role auth types)
        assume_role_arn = get_cached_assume_role_arn()
        if assume_role_arn:
            resource_attributes['assume_role_arn'] = assume_role_arn
        
        # Add auth secret if available (for K8s secret-based auth)
        auth_secret = get_cached_auth_secret()
        if auth_secret:
            resource_attributes['auth_secret'] = auth_secret

        # Handle level of detail (LOD) if specified in tags
        for tag_key, tag_value in tags.items():
            if tag_key.lower() in ('lod', 'levelofdetail', 'level-of-detail'):
                try:
                    lod = LevelOfDetail.construct_from_config(tag_value)
                    break
                except WorkspaceBuilderException:
                    logger.warning(f"Invalid LOD value in tag: {tag_value}")
        else:
            lod = context.get_setting("DEFAULT_LOD")
        resource_attributes['lod'] = lod

        qualified_name = f"{resource_attributes['account_id']}:{resource_attributes['region']}:{name}"

        return name, qualified_name, resource_attributes


    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        """Fetch AWS-specific qualifier values as strings."""
        if qualifier_name == "account_id":
            value = getattr(resource, "account_id", None)
        elif qualifier_name == "region":
            value = getattr(resource, "region", None)
        elif qualifier_name == "service":
            value = getattr(resource, "service", None)
        elif qualifier_name == "is_public":
            value = getattr(resource, "is_public", None)
        elif qualifier_name == "arn":
            value = getattr(resource, "arn", None)
        elif qualifier_name == "auth_type":
            value = getattr(resource, "auth_type", None)
        elif qualifier_name == "account_alias":
            value = getattr(resource, "account_alias", None)
        elif qualifier_name == "account_name":
            value = getattr(resource, "account_name", None)
        elif qualifier_name == "assume_role_arn":
            value = getattr(resource, "assume_role_arn", None)
        elif qualifier_name == "auth_secret":
            value = getattr(resource, "auth_secret", None)
        else:
            logger.warning(f"Unknown qualifier requested: {qualifier_name}")
            return None

        # Convert to string
        return str(value) if value is not None else None


    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        property_name = property_name.lower()
        tags = getattr(resource, "tags", {})
        if property_name == "tags":
            return list(tags.keys()) + list(tags.values())
        elif property_name == "tag-keys":
            return list(tags.keys())
        elif property_name == "tag-values":
            return list(tags.values())
        elif property_name in ("account_id", "region", "service", "arn", "is_public", "auth_type", "account_alias", "account_name", "assume_role_arn", "auth_secret"):
            return [self.get_resource_qualifier_value(resource, property_name)]
        else:
            logger.warning(f"Unknown property requested: {property_name}")
            return None

    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        """Include all relevant AWS-specific qualifiers as template variables."""
        template_variables = {
            'account_id': str(self.get_resource_qualifier_value(resource, "account_id") or ""),
            'region': str(self.get_resource_qualifier_value(resource, "region") or ""),
            'service': str(self.get_resource_qualifier_value(resource, "service") or ""),
            'is_public': str(self.get_resource_qualifier_value(resource, "is_public") or ""),
            'arn': str(self.get_resource_qualifier_value(resource, "arn") or ""),
            'auth_type': str(self.get_resource_qualifier_value(resource, "auth_type") or ""),
            'account_alias': str(self.get_resource_qualifier_value(resource, "account_alias") or ""),
            'account_name': str(self.get_resource_qualifier_value(resource, "account_name") or ""),
            'assume_role_arn': str(self.get_resource_qualifier_value(resource, "assume_role_arn") or ""),
            'auth_secret': str(self.get_resource_qualifier_value(resource, "auth_secret") or ""),
        }
        
        # Add tags as template variables
        tags = getattr(resource, "tags", {})
        template_variables.update({f"tag_{key}": value for key, value in tags.items()})
        
        logger.debug(f"Template variables before render: {template_variables}")
        return template_variables


    # def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
    #     return self.get_resource_qualifier_value(resource, variable_name)

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[str]:
        # Ensure the return value is always a string
        value = self.get_resource_qualifier_value(resource, variable_name)
        return str(value) if value else None

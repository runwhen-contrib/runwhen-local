from typing import Any, Optional, Dict
from dataclasses import dataclass
from azure.identity import DefaultAzureCredential, ClientSecretCredential
from azure.mgmt.resource import SubscriptionClient
import os

from component import Context
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import PlatformHandler, LevelOfDetail
import logging
logger = logging.getLogger(__name__)


AZURE_PLATFORM = "azure"

# Azure resource type naming field mappings
# This maps CloudQuery table names to the field that should be used as the resource name
AZURE_RESOURCE_NAME_MAPPINGS = {
    # Subscription resources
    "azure_subscription_subscriptions": ["display_name", "subscription_id"],
    
    # Azure AD resources
    "azure_ad_users": ["display_name", "user_principal_name", "mail"],
    "azure_ad_groups": ["display_name", "mail_nickname"],
    "azure_ad_applications": ["display_name", "app_display_name"],
    "azure_ad_service_principals": ["display_name", "app_display_name"],
    
    # Management resources
    "azure_resources_resource_groups": ["name"],  # Resource groups do have 'name'
    "azure_resources_subscriptions": ["display_name", "subscription_id"],
    
    # Storage resources
    "azure_storage_accounts": ["name", "account_name"],
    "azure_storage_containers": ["name", "container_name"],
    
    # Key Vault resources
    "azure_keyvault_vaults": ["name", "vault_name"],
    "azure_keyvault_keys": ["name", "key_name"],
    "azure_keyvault_secrets": ["name", "secret_name"],
    
    # Compute resources
    "azure_compute_virtual_machines": ["name", "vm_name"],
    "azure_compute_disks": ["name", "disk_name"],
    
    # Network resources
    "azure_network_virtual_networks": ["name", "vnet_name"],
    "azure_network_subnets": ["name", "subnet_name"],
    "azure_network_security_groups": ["name", "nsg_name"],
    
    # Default fallback for any resource type not explicitly mapped
    "_default": ["name", "display_name", "resource_name", "title", "friendly_name"]
}

# Cache subscription names to avoid repeated API calls
subscription_names_cache: Dict[str, str] = {}
# Cache for Azure credentials
_azure_credentials = {
    "tenant_id": None,
    "client_id": None,
    "client_secret": None,
    "credential": None
}

def set_azure_credentials(tenant_id: str = None, client_id: str = None, client_secret: str = None, credential = None):
    """
    Explicitly set Azure credentials to use for all Azure operations in this module.
    This allows another part of the code to pass in credentials that it has already obtained.
    
    Args:
        tenant_id: The Azure tenant ID
        client_id: The Azure client ID
        client_secret: The Azure client secret
        credential: An already-constructed credential object
    """
    global _azure_credentials
    if tenant_id:
        _azure_credentials["tenant_id"] = tenant_id
    if client_id:
        _azure_credentials["client_id"] = client_id
    if client_secret:
        _azure_credentials["client_secret"] = client_secret
    if credential:
        _azure_credentials["credential"] = credential
    
    # If we got new credentials but not a credential object, create one
    if all([_azure_credentials["tenant_id"], _azure_credentials["client_id"], _azure_credentials["client_secret"]]) and not _azure_credentials["credential"]:
        _azure_credentials["credential"] = ClientSecretCredential(
            _azure_credentials["tenant_id"], 
            _azure_credentials["client_id"], 
            _azure_credentials["client_secret"]
        )
        logger.info("Created new ClientSecretCredential from provided credentials")

def get_azure_credential():
    """
    Get Azure credentials using the same approach as CloudQuery.
    Returns a credential object that can be used with Azure SDK.
    """
    global _azure_credentials
    
    # First check if we already have a credential object
    if _azure_credentials["credential"]:
        return _azure_credentials["credential"]
    
    # Try to use service principal credentials from environment variables
    tenant_id = os.environ.get("AZURE_TENANT_ID")
    client_id = os.environ.get("AZURE_CLIENT_ID") 
    client_secret = os.environ.get("AZURE_CLIENT_SECRET")
    
    if tenant_id and client_id and client_secret:
        logger.info("Using service principal credentials from environment variables")
        credential = ClientSecretCredential(tenant_id, client_id, client_secret)
        # Cache the credentials for future use
        set_azure_credentials(tenant_id, client_id, client_secret, credential)
        return credential
    
    # Fallback to DefaultAzureCredential with clear warning
    logger.warning("Missing Azure service principal credentials. Falling back to DefaultAzureCredential")
    logger.warning("This may fail if not running in an environment with Azure CLI, managed identity, or other credential source")
    credential = DefaultAzureCredential(logging_enable=True)
    _azure_credentials["credential"] = credential
    return credential

def get_subscription_name(subscription_id: str) -> str:
    """
    Get the display name of a subscription by ID.
    Uses a cache to avoid repeated API calls.
    """
    if not subscription_id:
        return "Unknown Subscription"
        
    # Return cached name if available
    if subscription_id in subscription_names_cache:
        return subscription_names_cache[subscription_id]
    
    try:
        # Try to get the subscription name using Azure SDK
        logger.info(f"Attempting to retrieve display name for subscription ID: {subscription_id}")
        
        # Get credential using the function that checks our cached credentials
        credential = get_azure_credential()
        subscription_client = SubscriptionClient(credential)
        
        # List all subscriptions and log them to verify what's available
        subscriptions = list(subscription_client.subscriptions.list())
        logger.info(f"Found {len(subscriptions)} subscriptions with current credentials")
        
        for subscription in subscriptions:
            logger.debug(f"Checking subscription: {subscription.subscription_id} - {subscription.display_name}")
            if subscription.subscription_id == subscription_id:
                logger.info(f"Found matching subscription: {subscription_id} -> {subscription.display_name}")
                subscription_names_cache[subscription_id] = subscription.display_name
                return subscription.display_name
        
        # If we got here, we couldn't find the subscription
        logger.warning(f"Could not find display name for subscription ID: {subscription_id}")
        subscription_ids = [s.subscription_id for s in subscriptions]
        logger.warning(f"Available subscription IDs: {subscription_ids}")
        
        # Use just the ID as fallback
        subscription_names_cache[subscription_id] = subscription_id
        return subscription_id
    except Exception as e:
        logger.warning(f"Error fetching subscription display name for {subscription_id}: {e}")
        # Use just the ID as fallback
        subscription_names_cache[subscription_id] = subscription_id
        return subscription_id


def get_resource_group(resource: Resource) -> Optional[Resource]:
    # If resource itself is of type "resource_group", return it
    if resource.resource_type.name == "resource_group":
        return resource

    # Try accessing the resource_group attribute directly
    resource_group = getattr(resource, "resource_group", None)
    if resource_group is not None:
        return resource_group
    
    # Check for nested attributes or other ways to resolve the resource group
    # This might be specific to certain resource types; customize as needed
    if hasattr(resource, "parent"):
        parent = resource.parent
        if parent and parent.resource_type.name == "resource_group":
            return parent
    
    # Log a warning if resource group cannot be resolved
    logger.warning(f"Resource group not found for resource: {resource.resource_type.name}")
    return None


class AzurePlatformHandler(PlatformHandler):

    def __init__(self):
        super().__init__(AZURE_PLATFORM)

    #     return name, qualified_name, resource_attributes
    def parse_resource_data(
        self,
        resource_data: dict[str, Any],
        resource_type_name: str,
        platform_config_data: dict[str, Any],
        context: Context,
    ) -> tuple[str, str, dict[str, Any]]:

        # Handle different naming conventions for different Azure resource types
        # Use the mapping to determine which fields to try for this resource type
        name: str = None
        
        # Get the field priority list for this resource type
        # First check if we have a specific mapping for this CloudQuery table
        table_name = None
        # Try to infer table name from resource_type_name if not provided
        if resource_type_name.startswith("azure_"):
            table_name = resource_type_name
        else:
            # Convert resource type to likely table name (best guess)
            table_name = f"azure_{resource_type_name.replace('_', '_')}"
        
        # Get the field priority list
        field_priority = AZURE_RESOURCE_NAME_MAPPINGS.get(table_name, AZURE_RESOURCE_NAME_MAPPINGS["_default"])
        
        # Try each field in priority order
        for field_name in field_priority:
            name = resource_data.get(field_name)
            if name:
                logger.debug(f"Found name '{name}' for resource type '{resource_type_name}' using field '{field_name}'")
                break
        
        # Last resort: extract from ID field
        if not name and resource_data.get("id"):
            id_parts = resource_data["id"].split("/")
            name = id_parts[-1] if id_parts else None
            if name:
                logger.debug(f"Extracted name '{name}' from ID field for resource type '{resource_type_name}'")
        
        # If still no name, raise an informative error
        if not name:
            available_fields = list(resource_data.keys())
            tried_fields = field_priority + ["id (extraction)"]
            raise ValueError(f"Resource of type '{resource_type_name}' missing identifiable name field. "
                           f"Tried fields in order: {tried_fields}. "
                           f"Available fields: {available_fields}")
        qualified_name = name
        tags = resource_data.get("tags", {})
        resource_attributes = {"tags": tags}

        # Get subscription_id - either from direct field or extract from resource ID
        subscription_id = resource_data.get("subscription_id")
        resource_id = resource_data.get("id", "")
        
        # Extract subscription_id from resource ID path for comparison
        extracted_subscription_id = None
        if "/subscriptions/" in resource_id:
            parts = resource_id.split("/subscriptions/")
            if len(parts) > 1:
                subscription_part = parts[1].split("/")[0]
                extracted_subscription_id = subscription_part
        
        # BUG FIX: Always use the subscription ID from the resource ID if available
        # The direct subscription_id field from CloudQuery might be incorrect
        if extracted_subscription_id:
            if subscription_id and subscription_id != extracted_subscription_id:
                logger.warning(f"Subscription ID mismatch for resource {name}: "
                             f"direct field='{subscription_id}' vs ID field='{extracted_subscription_id}'. "
                             f"Using ID field value.")
            subscription_id = extracted_subscription_id
        elif not subscription_id:
            logger.warning(f"Could not determine subscription_id for resource {name}")
            subscription_id = None
        
        if subscription_id:
            resource_attributes["subscription_id"] = subscription_id
            
            # Add subscription name to the resource attributes
            subscription_name = get_subscription_name(subscription_id)
            resource_attributes["subscription_name"] = subscription_name

        if resource_type_name == "azure_subscription_subscriptions":
            # Subscription resources are top-level and don't have resource groups
            # They get a default LOD unless specifically configured
            resource_attributes["lod"] = context.get_setting("DEFAULT_LOD")
            logger.debug(f"Set default LOD for subscription resource {name}")
        elif resource_type_name == "resource_group":
                    # nested map built in init_cloudquery_config
                    # BUG FIX: Check if subscription_id is None before using as dict key
                    if subscription_id:
                        sub_map = (
                            platform_config_data
                            .get("subscriptionResourceGroupLevelOfDetails", {})
                            .get(subscription_id, {})
                        )
                    else:
                        sub_map = {}
                        logger.debug(f"No subscription_id for resource group {name}, skipping subscription-specific LOD lookup")
                    global_rg_map = platform_config_data.get("resourceGroupLevelOfDetails", {})

                    lod_value = (
                        sub_map.get(name)      # 1. explicit RG override
                        or sub_map.get("*")    # 2. per-subscription default
                        or global_rg_map.get(name)     # (3) legacy top-level RG
                        or global_rg_map.get("*")      # (4) legacy wildcard
                    )

                    resource_attributes["lod"] = (
                        LevelOfDetail.construct_from_config(lod_value)
                        if lod_value is not None
                        else context.get_setting("DEFAULT_LOD")   # 3. workspace default
                    )
        else:
            # ------------- resolve parent RG and inherit LOD ----------------
            id_val = resource_data.get("id", "")
            rg_marker = "resourcegroups/"
            start = id_val.lower().find(rg_marker)
            if start >= 0:
                start += len(rg_marker)
                end = id_val.find("/", start)
                if end > start:
                    rg_name = id_val[start:end]
                    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
                    rg_type = registry.lookup_resource_type(AZURE_PLATFORM, "resource_group")
                    
                    # Try to find existing resource group
                    rg_resource = None
                    if rg_type:
                        for rg in rg_type.instances.values():
                            if rg.name.upper() == rg_name.upper():
                                rg_resource = rg
                                resource_attributes["resource_group"] = rg
                                qualified_name = f"{rg.name}/{name}"
                                break
                    
                    # If resource group not found in registry, look up LOD directly from config
                    if not rg_resource:
                        logger.debug(f"Resource group {rg_name} not found in registry for resource {name}, looking up LOD directly")
                        
                        # Look up LOD for this resource group from the configuration
                        # BUG FIX: Check if subscription_id is None before using as dict key
                        if subscription_id:
                            sub_map = (
                                platform_config_data
                                .get("subscriptionResourceGroupLevelOfDetails", {})
                                .get(subscription_id, {})
                            )
                        else:
                            sub_map = {}
                            logger.debug(f"No subscription_id available for resource {name}, skipping subscription-specific LOD lookup")
                        global_rg_map = platform_config_data.get("resourceGroupLevelOfDetails", {})
                        
                        lod_value = (
                            sub_map.get(rg_name)      # 1. explicit RG override
                            or sub_map.get("*")       # 2. per-subscription default
                            or global_rg_map.get(rg_name)     # (3) legacy top-level RG
                            or global_rg_map.get("*")         # (4) legacy wildcard
                        )
                        
                        if lod_value is not None:
                            resource_attributes["lod"] = LevelOfDetail.construct_from_config(lod_value)
                            logger.debug(f"Set LOD for resource {name} to {lod_value} (inherited from RG {rg_name})")
                        else:
                            resource_attributes["lod"] = context.get_setting("DEFAULT_LOD")
                            logger.debug(f"No LOD config found for RG {rg_name}, using default for resource {name}")
                        
                        qualified_name = f"{rg_name}/{name}"

        return name, qualified_name, resource_attributes


    def get_level_of_detail(self, resource: Resource) -> LevelOfDetail:
        # First, check if the resource itself has an LOD (for resource groups and subscriptions)
        if hasattr(resource, 'lod') and resource.lod is not None:
            logger.debug(f"Using direct LOD for resource {resource.name}: {resource.lod}")
            return resource.lod
        
        # Handle subscription resources - they don't have resource groups
        if resource.resource_type.name == "azure_subscription_subscriptions":
            logger.debug(f"Subscription resource {resource.name} has no LOD set, using BASIC as default")
            return LevelOfDetail.BASIC
        
        # For non-resource-group resources, find the parent resource group
        resource_group = get_resource_group(resource)
        if resource_group and hasattr(resource_group, 'lod') and resource_group.lod is not None:
            logger.debug(f"Using resource group LOD for resource {resource.name}: {resource_group.lod} (from RG: {resource_group.name})")
            return resource_group.lod
        
        # If no resource group found or no LOD set, try to extract RG name and look up LOD manually
        if not resource_group:
            # Extract resource group name from resource ID
            resource_id = getattr(resource, 'resource', {}).get('id', '') if hasattr(resource, 'resource') else ''
            if not resource_id:
                resource_id = getattr(resource, 'id', '')
            
            if resource_id and "/resourceGroups/" in resource_id:
                try:
                    rg_name = resource_id.split("/resourceGroups/")[1].split("/")[0]
                    subscription_id = resource_id.split("/subscriptions/")[1].split("/")[0] if "/subscriptions/" in resource_id else None
                    
                    if subscription_id and rg_name:
                        # Try to look up LOD configuration directly
                        # This is a fallback when resource group relationship isn't properly established
                        logger.warning(f"Resource group relationship not found for {resource.name}, attempting direct LOD lookup for RG: {rg_name} in subscription: {subscription_id}")
                        
                        # We need access to the platform config data to do the lookup
                        # For now, log the issue and return a default
                        logger.warning(f"Cannot perform direct LOD lookup without platform config access. Resource: {resource.name}, RG: {rg_name}")
                        
                except (IndexError, AttributeError) as e:
                    logger.warning(f"Failed to extract resource group info from resource ID: {e}")
            else:
                # Resource has no resource group in its ID (might be a top-level resource)
                logger.debug(f"Resource {resource.name} has no resource group in ID, using BASIC LOD as default")
                return LevelOfDetail.BASIC
        
        # Fallback to BASIC LOD instead of crashing
        logger.warning(f"No LOD found for resource {resource.name}, using BASIC as fallback")
        return LevelOfDetail.BASIC


    @staticmethod
    def get_common_resource_property_values(resource: Resource, qualifier_name: str) -> Optional[str]:
        if qualifier_name == "resource_group":
            resource_group = get_resource_group(resource)
            if resource_group is not None:
                return resource_group.name
            else:
                # Handle case when resource_group is None
                return None
        elif qualifier_name == "subscription_id":
            return getattr(resource, 'subscription_id', None)
        elif qualifier_name == "subscription_name":
            return getattr(resource, 'subscription_name', None)
        else:
            # Log or raise an error if qualifier is unknown, or simply return None
            return None


    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        return self.get_common_resource_property_values(resource, qualifier_name)

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        property_name = property_name.lower()
        tags = getattr(resource, "tags")
        if property_name == "tags":
            return list(tags.keys()) + list(tags.values())
        elif property_name == "tag-keys":
            return list(tags.keys())
        elif property_name == "tag-values":
            return list(tags.values())
        else:
            # Note, the property value may be a path within the
            return None

    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        template_variables = dict()
        resource_group = get_resource_group(resource)
        if resource_group:
            template_variables['resource_group'] = resource_group
        
        # Always add subscription information as top-level template variables
        # Access subscription info using the same methods as qualifiers
        subscription_id = self.get_common_resource_property_values(resource, "subscription_id")
        if subscription_id:
            template_variables['subscription_id'] = subscription_id
            
            # Always add subscription name - get_subscription_name() handles fallbacks
            subscription_name = self.get_common_resource_property_values(resource, "subscription_name")
            if subscription_name:
                template_variables['subscription_name'] = subscription_name
            else:
                # Fallback: if somehow subscription_name wasn't set during parsing, get it now
                template_variables['subscription_name'] = get_subscription_name(subscription_id)
        
        # Generate resourcePath for Azure resources
        resource_path_parts = ["azure"]
        if subscription_id:
            resource_path_parts.append(subscription_id)
        if resource_group and resource_group.name:
            resource_path_parts.append(resource_group.name)
        # Only add resource name if it's not already represented as resource_group
        if resource.name and resource != resource_group:
            resource_path_parts.append(resource.name)
        template_variables['resource_path'] = "/".join(resource_path_parts)
        
        return template_variables

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        return self.get_common_resource_property_values(resource, variable_name)



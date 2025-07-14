import subprocess
from azure.identity import DefaultAzureCredential, ClientSecretCredential
from azure.mgmt.containerservice import ContainerServiceClient
from azure.mgmt.resource import SubscriptionClient
from azure.core.exceptions import AzureError
import os
import yaml
import sys
import base64
import logging
from kubernetes import client, config
from k8s_utils import get_secret
from utils import mask_string
from collections import defaultdict

logger = logging.getLogger(__name__)


def get_subscription_id(credential):
    try:
        subscription_client = SubscriptionClient(credential)
        subscription = next(subscription_client.subscriptions.list())
        print(f"Successfully retrieved subscription ID: {mask_string(subscription.subscription_id)}")
        return subscription.subscription_id
    except StopIteration:
        print("Error: No subscriptions found for the provided credentials.")
        sys.exit(1)
    except AzureError as e:
        print(f"Azure error occurred while retrieving subscription ID: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error occurred while retrieving subscription ID: {e}")
        sys.exit(1)


def get_subscription_name(credential, subscription_id):
    """
    Get the display name of a subscription by ID.
    """
    if not subscription_id:
        return "Unknown Subscription"
        
    try:
        logger.info(f"Attempting to retrieve display name for subscription ID: {mask_string(subscription_id)}")
        
        subscription_client = SubscriptionClient(credential)
        
        # List all subscriptions and find the matching one
        subscriptions = list(subscription_client.subscriptions.list())
        logger.info(f"Found {len(subscriptions)} subscriptions with current credentials")
        
        for subscription in subscriptions:
            logger.debug(f"Checking subscription: {subscription.subscription_id} - {subscription.display_name}")
            if subscription.subscription_id == subscription_id:
                logger.info(f"Found matching subscription: {mask_string(subscription_id)} -> {subscription.display_name}")
                return subscription.display_name
        
        # If we got here, we couldn't find the subscription
        logger.warning(f"Could not find display name for subscription ID: {mask_string(subscription_id)}")
        subscription_ids = [s.subscription_id for s in subscriptions]
        logger.warning(f"Available subscription IDs: {[mask_string(sid) for sid in subscription_ids]}")
        
        # Use just the ID as fallback
        return subscription_id
    except Exception as e:
        logger.warning(f"Error fetching subscription display name for {mask_string(subscription_id)}: {e}")
        # Use just the ID as fallback
        return subscription_id

## TODO harmonize these functions with duplicate azure auth code in ../azure_utils.py

def get_azure_credential(workspace_info):
    auth_type = None
    auth_secret = None
    azure_config = workspace_info.get('cloudConfig', {}).get('azure', {})
    
    tenant_id = azure_config.get('tenantId')
    client_id = azure_config.get('clientId')
    client_secret = azure_config.get('clientSecret')
    sp_secret_name = azure_config.get('spSecretName')

    if tenant_id and client_id and client_secret:
        print("Using explicit tenant client configuration from workspaceInfo.yaml")
        subscription_id = azure_config.get('subscriptionId')
        auth_type = "azure_explicit"
        if not subscription_id:
            print("Warning: subscriptionId not found in workspaceInfo.yaml. Attempting to retrieve it using service principal credentials.")
            credential = ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret)
            subscription_id = get_subscription_id(credential)
        return ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret), subscription_id, client_id, client_secret, auth_type, auth_secret

    if sp_secret_name:
        logger.info(f"Using Kubernetes secret named {mask_string(sp_secret_name)} from workspaceInfo.yaml")
        secret_data = get_secret(sp_secret_name)
        tenant_id = base64.b64decode(secret_data.get('tenantId')).decode('utf-8')
        client_id = base64.b64decode(secret_data.get('clientId')).decode('utf-8')
        client_secret = base64.b64decode(secret_data.get('clientSecret')).decode('utf-8')
        subscription_id = base64.b64decode(secret_data.get('subscriptionId')).decode('utf-8') if secret_data.get('subscriptionId') else None
        auth_type = "azure_service_principal_secret"
        auth_secret = sp_secret_name

        if not subscription_id:
            logger.info("Warning: subscriptionId not found in Kubernetes secret. Attempting to retrieve it using service principal credentials.")
            credential = ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret)
            subscription_id = get_subscription_id(credential)
            if not subscription_id:
                logger.error("Error: subscriptionId not found in either Kubernetes secret or workspaceInfo.yaml.")
                sys.exit(1)

        return ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret), subscription_id, client_id, client_secret, auth_type, auth_secret

    print("Using managed service identity for authentication")
    try:
        credential = DefaultAzureCredential()
        subscription_id = azure_config.get('subscriptionId')
        auth_type = "azure_managed_identity"
        if not subscription_id:
            print("Subscription ID not provided in workspaceInfo.yaml. Retrieving using managed identity.")
            subscription_id = get_subscription_id(credential)
        logger.info(f"Found Azure Subscription ID: {mask_string(subscription_id)}")
        return credential, subscription_id, None, None, auth_type, auth_secret
    except Exception as e:
        print(f"Failed to authenticate using managed identity: {e}")
        sys.exit(1)

def enumerate_subscriptions(credential):
    """
    Enumerate all subscriptions that the service principal has access to.
    """
    subscription_client = SubscriptionClient(credential)
    accessible_subscriptions = []
    try:
        for subscription in subscription_client.subscriptions.list():
            accessible_subscriptions.append(subscription.subscription_id)
            logger.info(f"Discovered accessible subscription ID: {subscription.subscription_id}")

    except AzureError as e:
        logger.error(f"Failed to enumerate subscriptions: {e}")

    return accessible_subscriptions


def discover_aks_clusters(credential, discovery_config=None):
    """
    Discover AKS clusters in specified subscription/resource group pairs or all accessible subscriptions.
    
    Args:
        credential: Azure credential object
        discovery_config: Optional dict with 'subscriptions' list containing subscription_id and resource_groups
    
    Returns:
        List of discovered cluster configurations
    """
    discovered_clusters = []
    
    # Get global default LOD for discovered clusters
    global_default_lod = discovery_config.get('discoveredClustersDefaultLOD', 'basic') if discovery_config else 'basic'
    
    if discovery_config and discovery_config.get('subscriptions'):
        # Use explicit discovery configuration
        logger.info("Using explicit discovery configuration")
        for sub_config in discovery_config['subscriptions']:
            subscription_id = sub_config.get('subscriptionId')
            resource_groups = sub_config.get('resourceGroups', [])
            subscription_default_lod = sub_config.get('defaultNamespaceLOD', global_default_lod)
            
            if not subscription_id:
                logger.warning("Skipping subscription config without subscriptionId")
                continue
                
            logger.info(f"Discovering AKS clusters in subscription {mask_string(subscription_id)} with default LOD: {subscription_default_lod}")
            
            try:
                aks_client = ContainerServiceClient(credential, subscription_id=subscription_id)
                
                if resource_groups:
                    # Discover clusters in specific resource groups
                    for resource_group in resource_groups:
                        # Handle both string and dict formats for resource groups
                        if isinstance(resource_group, dict):
                            rg_name = resource_group.get('name')
                            rg_lod = resource_group.get('defaultNamespaceLOD', subscription_default_lod)
                        else:
                            rg_name = resource_group
                            rg_lod = subscription_default_lod
                        
                        if not rg_name:
                            logger.warning("Skipping resource group config without name")
                            continue
                            
                        logger.info(f"Discovering AKS clusters in resource group: {rg_name} with LOD: {rg_lod}")
                        try:
                            clusters = aks_client.managed_clusters.list_by_resource_group(rg_name)
                            for cluster in clusters:
                                discovered_clusters.append({
                                    'name': cluster.name,
                                    'resource_group': rg_name,
                                    'subscriptionId': subscription_id,
                                    'server': None,  # Will be retrieved during kubeconfig generation
                                    'defaultNamespaceLOD': rg_lod
                                })
                                logger.info(f"Discovered AKS cluster: {cluster.name} in {rg_name} with LOD: {rg_lod}")
                        except AzureError as e:
                            logger.warning(f"Error discovering clusters in resource group {rg_name}: {e}")
                else:
                    # Discover clusters in all resource groups in this subscription
                    logger.info(f"Discovering AKS clusters in all resource groups in subscription {mask_string(subscription_id)} with LOD: {subscription_default_lod}")
                    try:
                        clusters = aks_client.managed_clusters.list()
                        for cluster in clusters:
                            discovered_clusters.append({
                                'name': cluster.name,
                                'resource_group': cluster.id.split('/')[4],  # Extract resource group from cluster ID
                                'subscriptionId': subscription_id,
                                'server': None,  # Will be retrieved during kubeconfig generation
                                'defaultNamespaceLOD': subscription_default_lod
                            })
                            logger.info(f"Discovered AKS cluster: {cluster.name} in {cluster.id.split('/')[4]} with LOD: {subscription_default_lod}")
                    except AzureError as e:
                        logger.warning(f"Error discovering clusters in subscription {mask_string(subscription_id)}: {e}")
                        
            except AzureError as e:
                logger.warning(f"Error accessing subscription {mask_string(subscription_id)}: {e}")
    else:
        # Discover clusters in all accessible subscriptions
        logger.info(f"Discovering AKS clusters in all accessible subscriptions with default LOD: {global_default_lod}")
        accessible_subscriptions = enumerate_subscriptions(credential)
        
        for subscription_id in accessible_subscriptions:
            logger.info(f"Discovering AKS clusters in subscription {mask_string(subscription_id)} with LOD: {global_default_lod}")
            try:
                aks_client = ContainerServiceClient(credential, subscription_id=subscription_id)
                clusters = aks_client.managed_clusters.list()
                
                for cluster in clusters:
                    discovered_clusters.append({
                        'name': cluster.name,
                        'resource_group': cluster.id.split('/')[4],  # Extract resource group from cluster ID
                        'subscriptionId': subscription_id,
                        'server': None,  # Will be retrieved during kubeconfig generation
                        'defaultNamespaceLOD': global_default_lod
                    })
                    logger.info(f"Discovered AKS cluster: {cluster.name} in {cluster.id.split('/')[4]} with LOD: {global_default_lod}")
                    
            except AzureError as e:
                logger.warning(f"Error discovering clusters in subscription {mask_string(subscription_id)}: {e}")
    
    logger.info(f"Total AKS clusters discovered: {len(discovered_clusters)}")
    return discovered_clusters


def generate_kubeconfig_for_aks(clusters, workspace_info):
    credential, default_subscription_id, client_id, client_secret, auth_type, auth_secret = get_azure_credential(workspace_info)
    combined_kubeconfig = {
        'apiVersion': 'v1',
        'kind': 'Config',
        'clusters': [],
        'contexts': [],
        'current-context': '',
        'users': []
    }

    # Check if auto-discovery is enabled
    aks_config = workspace_info.get('cloudConfig', {}).get('azure', {}).get('aksClusters', {})
    auto_discover = aks_config.get('autoDiscover', False)
    
    if auto_discover:
        logger.info("Auto-discovery enabled for AKS clusters")
        discovery_config = aks_config.get('discoveryConfig')
        discovered_clusters = discover_aks_clusters(credential, discovery_config)
        
        # Merge discovered clusters with explicitly configured clusters
        explicit_clusters = clusters if clusters else []
        all_clusters = explicit_clusters + discovered_clusters
        
        logger.info(f"Using {len(explicit_clusters)} explicit clusters + {len(discovered_clusters)} discovered clusters = {len(all_clusters)} total")
    else:
        logger.info("Auto-discovery disabled, using only explicitly configured clusters")
        all_clusters = clusters if clusters else []

    # Get list of subscriptions to check
    accessible_subscriptions = enumerate_subscriptions(credential)
    logger.info(f"Subscriptions to iterate over: {accessible_subscriptions}")

    for cluster in all_clusters:
        cluster_name = cluster.get('name')
        resource_group_name = cluster.get('resource_group')
        server_url = cluster.get('server')
        specified_subscription_id = cluster.get('subscriptionId')
        found_cluster = False

        # Determine subscriptions to check for this cluster
        subscription_ids_to_check = [specified_subscription_id] if specified_subscription_id else accessible_subscriptions
        for sub_id in subscription_ids_to_check:
            logger.info(f"Checking subscription {sub_id} for cluster {cluster_name} in resource group {resource_group_name}")
            try:
                aks_client = ContainerServiceClient(credential, subscription_id=sub_id)
                
                # Attempt to retrieve the cluster kubeconfig
                kubeconfig = aks_client.managed_clusters.list_cluster_user_credentials(resource_group_name, cluster_name)
                kubeconfig_content = kubeconfig.kubeconfigs[0].value.decode('utf-8')
                kubeconfig_yaml = yaml.safe_load(kubeconfig_content)
                found_cluster = True

                # Override server URL if provided
                if server_url:
                    for cluster_entry in kubeconfig_yaml['clusters']:
                        cluster_entry['cluster']['server'] = server_url

                # Add resource_group to the "workspace-builder" extension
                logger.info(f"Adding resource_group to workspace-builder extension for cluster: {cluster_name}")
                for cluster_entry in kubeconfig_yaml['clusters']:
                    if 'extensions' not in cluster_entry['cluster']:
                        cluster_entry['cluster']['extensions'] = []

                    subscription_name = get_subscription_name(credential, sub_id)
                    extension_data = {
                        'resource_group': resource_group_name,
                        'cluster_type': 'aks',
                        'cluster_name': cluster_name,
                        'auth_type': auth_type,
                        'auth_secret': auth_secret,
                        'subscription_id': sub_id,
                        'subscription_name': subscription_name
                    }
                    
                    # Add defaultNamespaceLOD if it exists in the cluster config
                    if 'defaultNamespaceLOD' in cluster:
                        extension_data['defaultNamespaceLOD'] = cluster['defaultNamespaceLOD']
                        logger.info(f"Adding defaultNamespaceLOD to extension for cluster '{cluster_name}': {cluster['defaultNamespaceLOD']}")
                    
                    cluster_entry['cluster']['extensions'].append({
                        'name': 'workspace-builder',
                        'extension': extension_data
                    })

                # Append to combined kubeconfig
                combined_kubeconfig['clusters'].extend(kubeconfig_yaml['clusters'])
                combined_kubeconfig['contexts'].extend(kubeconfig_yaml['contexts'])
                combined_kubeconfig['users'].extend(kubeconfig_yaml['users'])

                if not combined_kubeconfig['current-context']:
                    combined_kubeconfig['current-context'] = kubeconfig_yaml['contexts'][0]['name']
                    logger.info(f"Setting current context to: {combined_kubeconfig['current-context']}")

                logger.info(f"Successfully retrieved kubeconfig for cluster {cluster_name} in subscription {sub_id}")
                break  # Exit the loop once the cluster is found in a subscription

            except AzureError as e:
                logger.info(f"Cluster {cluster_name} not found in subscription {sub_id} or error occurred: {e}")

        if not found_cluster:
            logger.error(f"Cluster {cluster_name} in resource group {resource_group_name} not found in any accessible subscriptions.")
    
    # Save combined kubeconfig to file
    kubeconfig_dir = os.path.expanduser("~/.kube")
    if not os.path.exists(kubeconfig_dir):
        os.makedirs(kubeconfig_dir)
    
    kubeconfig_path = os.path.join(kubeconfig_dir, "azure-kubeconfig")
    try:
        with open(kubeconfig_path, "w") as kubeconfig_file:
            yaml.dump(combined_kubeconfig, kubeconfig_file)
        logger.info(f"Combined kubeconfig saved to {kubeconfig_path}")
    except IOError as e:
        logger.error(f"Failed to write kubeconfig file: {e}")
        sys.exit(1)

    # Kubelogin conversion as needed
    if client_id and client_secret:
        try:
            subprocess.run(["kubelogin", "convert-kubeconfig", "-l", "spn", "--client-id", client_id, "--client-secret", client_secret, "--kubeconfig", kubeconfig_path], check=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"kubelogin conversion failed: {e}")
            sys.exit(1)
    else:
        try:
            subprocess.run(["kubelogin", "convert-kubeconfig", "-l", "msi", "--kubeconfig", kubeconfig_path], check=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"kubelogin MSI conversion failed: {e}")
            sys.exit(1)

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

    # Get list of subscriptions to check
    accessible_subscriptions = enumerate_subscriptions(credential)
    logger.info(f"Subscriptions to iterate over: {accessible_subscriptions}")

    for cluster in clusters:
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

                    cluster_entry['cluster']['extensions'].append({
                        'name': 'workspace-builder',
                        'extension': {
                            'resource_group': resource_group_name,
                            'cluster_type': 'aks',
                            'cluster_name': cluster_name,
                            'auth_type': auth_type,
                            'auth_secret': auth_secret,
                            'subscription_id': sub_id
                        }
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

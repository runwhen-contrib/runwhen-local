import subprocess
from azure.identity import DefaultAzureCredential, ClientSecretCredential
from azure.mgmt.containerservice import ContainerServiceClient
from azure.mgmt.resource import SubscriptionClient
from azure.core.exceptions import AzureError
import os
import yaml
import sys
import base64
from kubernetes import client, config
from k8s_utils import get_secret
from utils import mask_string

def get_subscription_id(credential):
    try:
        subscription_client = SubscriptionClient(credential)
        subscription = next(subscription_client.subscriptions.list())
        print(f"Successfully retrieved subscription ID: {mask_string(subscription.subscription_id)}")
        return subscription.subscription_id
    except StopIteration:
        print("Error: No subscriptions found for the provided credentials.", file=sys.stderr)
        sys.exit(1)
    except AzureError as e:
        print(f"Azure error occurred while retrieving subscription ID: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error occurred while retrieving subscription ID: {e}", file=sys.stderr)
        sys.exit(1)

## TODO harmonize these functions with duplicate azure auth code in ../azure_utils.py

def get_azure_credential(workspace_info):
    azure_config = workspace_info.get('cloudConfig', {}).get('azure', {})
    
    tenant_id = azure_config.get('tenantId')
    client_id = azure_config.get('clientId')
    client_secret = azure_config.get('clientSecret')
    sp_secret_name = azure_config.get('spSecretName')

    if tenant_id and client_id and client_secret:
        print("Using explicit tenant client configuration from workspaceInfo.yaml")
        subscription_id = azure_config.get('subscriptionId')
        if not subscription_id:
            print("Warning: subscriptionId not found in workspaceInfo.yaml. Attempting to retrieve it using service principal credentials.")
            credential = ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret)
            subscription_id = get_subscription_id(credential)
        return ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret), subscription_id, client_id, client_secret

    if sp_secret_name:
        print(f"Using Kubernetes secret named {mask_string(sp_secret_name)} from workspaceInfo.yaml")
        secret_data = get_secret(sp_secret_name)
        tenant_id = base64.b64decode(secret_data.get('tenantId')).decode('utf-8')
        client_id = base64.b64decode(secret_data.get('clientId')).decode('utf-8')
        client_secret = base64.b64decode(secret_data.get('clientSecret')).decode('utf-8')
        subscription_id = base64.b64decode(secret_data.get('subscriptionId')).decode('utf-8') if secret_data.get('subscriptionId') else None

        if not subscription_id:
            print("Warning: subscriptionId not found in Kubernetes secret. Attempting to retrieve it using service principal credentials.")
            credential = ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret)
            subscription_id = get_subscription_id(credential)
            if not subscription_id:
                print("Error: subscriptionId not found in either Kubernetes secret or workspaceInfo.yaml.", file=sys.stderr)
                sys.exit(1)

        return ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret), subscription_id, client_id, client_secret

    print("Using managed service identity for authentication")
    try:
        credential = DefaultAzureCredential()
        subscription_id = azure_config.get('subscriptionId')
        if not subscription_id:
            print("Subscription ID not provided in workspaceInfo.yaml. Retrieving using managed identity.")
            subscription_id = get_subscription_id(credential)
        print(f"Found Azure Subscription ID: {mask_string(subscription_id)}")
        return credential, subscription_id, None, None
    except Exception as e:
        print(f"Failed to authenticate using managed identity: {e}", file=sys.stderr)
        sys.exit(1)

def generate_kubeconfig_for_aks(clusters, workspace_info):
    credential, subscription_id, client_id, client_secret = get_azure_credential(workspace_info)
    
    aks_client = ContainerServiceClient(credential, subscription_id=subscription_id)

    combined_kubeconfig = {
        'apiVersion': 'v1',
        'kind': 'Config',
        'clusters': [],
        'contexts': [],
        'current-context': '',
        'users': []
    }

    for cluster in clusters:
        try:
            cluster_name = cluster['name']
            resource_group_name = cluster['resource_group']
            server_url = cluster.get('server')

            print(f"Processing cluster: {cluster_name} in resource group: {resource_group_name}")

            # Fetch AKS cluster kubeconfig
            print(f"Fetching kubeconfig for cluster: {cluster_name}")
            kubeconfig = aks_client.managed_clusters.list_cluster_user_credentials(resource_group_name, cluster_name)
            kubeconfig_content = kubeconfig.kubeconfigs[0].value.decode('utf-8')  # Decode bytearray to string

            # Load kubeconfig as YAML
            print(f"Loading kubeconfig YAML for cluster: {cluster_name}")
            kubeconfig_yaml = yaml.safe_load(kubeconfig_content)

            # Override server URL if provided
            if server_url:
                print(f"Overriding server URL for cluster: {cluster_name} with {server_url}")
                for cluster_entry in kubeconfig_yaml['clusters']:
                    cluster_entry['cluster']['server'] = server_url

            # Add cluster, context, and user to combined kubeconfig
            print(f"Adding cluster, context, and user to combined kubeconfig for cluster: {cluster_name}")
            combined_kubeconfig['clusters'].extend(kubeconfig_yaml['clusters'])
            combined_kubeconfig['contexts'].extend(kubeconfig_yaml['contexts'])
            combined_kubeconfig['users'].extend(kubeconfig_yaml['users'])

            # Optionally, set the current context to the first cluster's context
            if not combined_kubeconfig['current-context']:
                combined_kubeconfig['current-context'] = kubeconfig_yaml['contexts'][0]['name']
                print(f"Setting current context to: {kubeconfig_yaml['contexts'][0]['name']}")

        except AzureError as e:
            print(f"Azure error occurred while processing cluster {cluster_name}: {e}", file=sys.stderr)
        except Exception as e:
            print(f"Unexpected error occurred while processing cluster {cluster_name}: {e}", file=sys.stderr)

    # Ensure the .kube directory exists
    kubeconfig_dir = os.path.expanduser("~/.kube")
    if not os.path.exists(kubeconfig_dir):
        print(f"Creating directory: {kubeconfig_dir}")
        os.makedirs(kubeconfig_dir)

    # Save the combined kubeconfig to file
    kubeconfig_path = os.path.join(kubeconfig_dir, "config")
    try:
        print(f"Saving combined kubeconfig to: {kubeconfig_path}")
        with open(kubeconfig_path, "w") as kubeconfig_file:
            yaml.dump(combined_kubeconfig, kubeconfig_file)
        print(f"Successfully generated combined kubeconfig for clusters: {[cluster['name'] for cluster in clusters]} at {kubeconfig_path}")
    except IOError as e:
        print(f"Failed to write kubeconfig file: {e}", file=sys.stderr)
        sys.exit(1)

    # Convert the kubeconfig using kubelogin for MSI, if client_id and client_secret are not provided
    if client_id and client_secret:
        try:
            print("Converting kubeconfig using kubelogin...")
            subprocess.run(["kubelogin", "convert-kubeconfig", "-l", "spn", "--client-id", client_id, "--client-secret", client_secret], check=True)
            print("Successfully converted kubeconfig with kubelogin for service principal.")
        except subprocess.CalledProcessError as e:
            print(f"Failed to convert kubeconfig using kubelogin: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        try:
            print("Converting kubeconfig using kubelogin with Managed Service Identity (MSI)...")
            subprocess.run(["kubelogin", "convert-kubeconfig", "-l", "msi"], check=True)
            print("Successfully converted kubeconfig with kubelogin for MSI.")
        except subprocess.CalledProcessError as e:
            print(f"Failed to convert kubeconfig using kubelogin: {e}", file=sys.stderr)
            sys.exit(1)

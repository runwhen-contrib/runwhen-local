# AKS helpers
from azure.identity import DefaultAzureCredential
from azure.mgmt.containerservice import ContainerServiceClient
from azure.mgmt.resource import SubscriptionClient
from azure.core.exceptions import AzureError
import os
import base64
import yaml
import sys

def get_subscription_id(credential):
    try:
        subscription_client = SubscriptionClient(credential)
        subscription = next(subscription_client.subscriptions.list())
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

def generate_kubeconfig_for_aks(clusters):
    try:
        credential = DefaultAzureCredential()
        subscription_id = get_subscription_id(credential)
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

                # Fetch AKS cluster kubeconfig
                kubeconfig = aks_client.managed_clusters.list_cluster_user_credentials(resource_group_name, cluster_name)
                kubeconfig_content = base64.b64decode(kubeconfig.kubeconfigs[0].value).decode()

                # Load kubeconfig as YAML
                kubeconfig_yaml = yaml.safe_load(kubeconfig_content)

                # Override server URL if provided
                if server_url:
                    for cluster_entry in kubeconfig_yaml['clusters']:
                        cluster_entry['cluster']['server'] = server_url

                # Add cluster, context, and user to combined kubeconfig
                combined_kubeconfig['clusters'].extend(kubeconfig_yaml['clusters'])
                combined_kubeconfig['contexts'].extend(kubeconfig_yaml['contexts'])
                combined_kubeconfig['users'].extend(kubeconfig_yaml['users'])

                # Optionally, set the current context to the first cluster's context
                if not combined_kubeconfig['current-context']:
                    combined_kubeconfig['current-context'] = kubeconfig_yaml['contexts'][0]['name']

            except AzureError as e:
                print(f"Azure error occurred while processing cluster {cluster_name}: {e}", file=sys.stderr)
            except Exception as e:
                print(f"Unexpected error occurred while processing cluster {cluster_name}: {e}", file=sys.stderr)

        # Save the combined kubeconfig to file
        kubeconfig_path = os.path.expanduser("~/.kube/config")
        try:
            with open(kubeconfig_path, "w") as kubeconfig_file:
                yaml.dump(combined_kubeconfig, kubeconfig_file)
            print(f"Successfully generated combined kubeconfig for clusters: {[cluster['name'] for cluster in clusters]} at {kubeconfig_path}")
        except IOError as e:
            print(f"Failed to write kubeconfig file: {e}", file=sys.stderr)
            sys.exit(1)

    except AzureError as e:
        print(f"Azure error occurred: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)

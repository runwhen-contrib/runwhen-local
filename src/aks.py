# AKS helpers
from azure.identity import DefaultAzureCredential
from azure.mgmt.containerservice import ContainerServiceClient
import os
import base64
import yaml

def generate_combined_kubeconfig(clusters):
    credential = DefaultAzureCredential()
    aks_client = ContainerServiceClient(credential, subscription_id=os.getenv("AZURE_SUBSCRIPTION_ID"))

    combined_kubeconfig = {
        'apiVersion': 'v1',
        'kind': 'Config',
        'clusters': [],
        'contexts': [],
        'current-context': '',
        'users': []
    }

    for cluster in clusters:
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

    # Save the combined kubeconfig to file
    kubeconfig_path = os.path.expanduser("~/.kube/config")
    with open(kubeconfig_path, "w") as kubeconfig_file:
        yaml.dump(combined_kubeconfig, kubeconfig_file)

    print(f"Successfully generated combined kubeconfig for clusters: {[cluster['name'] for cluster in clusters]} at {kubeconfig_path}")




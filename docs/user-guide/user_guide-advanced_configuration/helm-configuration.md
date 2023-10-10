# Helm Configuration

## Default Values
The followint tables outline all available helm chart values and their defaults.  

### General Deployment Configuration
<table><thead><tr><th width="213">Configuration Option</th><th>Type</th><th>Default Value</th><th>Description</th></tr></thead><tbody><tr><td>replicaCount</td><td>Integer</td><td>1</td><td>The number of replicas for the deployment.</td></tr><tr><td>image.repository</td><td>String</td><td>ghcr.io/runwhen-contrib/runwhen-local</td><td>The Docker image repository.</td></tr><tr><td>image.pullPolicy</td><td>String</td><td>Always</td><td>The image pull policy. Common values are 'Always', 'IfNotPresent', or 'Never'.</td></tr><tr><td>image.tag</td><td>String</td><td>latest</td><td>The Docker image tag.</td></tr><tr><td>imagePullSecrets</td><td>List</td><td>[]</td><td>A list of secret names for pulling Docker images from private repositories.</td></tr><tr><td>nameOverride</td><td>String</td><td></td><td>Override the name of the chart.</td></tr><tr><td>fullnameOverride</td><td>String</td><td></td><td>Override the full name of the chart.</td></tr>
</tbody></table>

### Network Configuration
<table><thead><tr><th width="213">Configuration Option</th><th>Type</th><th>Default Value</th><th>Description</th></tr></thead>
<tbody>
<tr><td>service.type</td><td>String</td><td>ClusterIP</td><td></td></tr><tr><td>service.port</td><td>Integer</td><td>8081</td><td></td></tr><tr><td>ingress.enabled</td><td>Boolean</td><td>False</td><td>Expose the application througn an ingress object</td></tr><tr><td>ingress.className</td><td>String</td><td></td><td></td></tr><tr><td>ingress.hosts</td><td>List</td><td>[{'host': 'chart-example.local', 'paths': [{'path': '/', 'pathType': 'Prefix'}]}]</td><td></td></tr><tr><td>ingress.tls</td><td>List</td><td>[]</td><td></td></tr>
</tbody></table>

### Resource and Scheduling Configurations
<table><thead><tr><th width="213">Configuration Option</th><th>Type</th><th>Default Value</th><th>Description</th></tr></thead>
<tbody>
<tr><td>resources.requests.memory</td><td>String</td><td>256Mi</td><td></td></tr><tr><td>resources.requests.cpu</td><td>String</td><td>250m</td><td></td></tr><tr><td>resources.limits.memory</td><td>String</td><td>1024Mi</td><td></td></tr><tr><td>resources.limits.cpu</td><td>String</td><td>1</td><td></td></tr><tr><td>tolerations</td><td>List</td><td>[]</td><td></td></tr>
</tbody></table>

### Roles Based Access Control Configuration
<table><thead><tr><th width="213">Configuration Option</th><th>Type</th><th>Default Value</th><th>Description</th></tr></thead>
<tbody>
<tr><td>serviceAccount.create</td><td>Boolean</td><td>True</td><td>Specifies whether a service account should be created.</td></tr><tr><td>serviceAccount.name</td><td>String</td><td></td><td>The name of the service account to use or create.</td></tr><tr><td>serviceAccountRoles.namespaceRole.enabled</td><td>Boolean</td><td>False</td><td>Used to specify the namespaces that RunWhen Local services account can discover. Has no effect if <code>serviceAccountRole.ClusterView.enabled</code> is <code>True</code></td></tr><tr><td>serviceAccountRoles.namespaceRole.namespaces</td><td>List</td><td>[]</td><td>List of namespaces that RunWhen Local service account can discover. Always includes it's own namespace. </td></tr><tr><td>serviceAccountRoles.namespaceRole.rules</td><td>List</td><td>[{'apiGroups': [''], 'resources': ['*'], 'verbs': ['get', 'watch', 'list']}]</td><td>List of actions that the RunWhen Local service account will have on the list of namespaces specified in <code>serviceAccountRoles.namespaceRole.namespaces</code></td></tr><tr><td>serviceAccountRoles.clusterRoleView.enabled</td><td>Boolean</td><td>True</td><td>By default, RunWhen Local service account is bound to the cluster scoped <code>View</code> role. </td></tr><tr><td>serviceAccountRoles.advancedClusterRole.enabled</td><td>Boolean</td><td>False</td><td>Creates a customized role for the RunWhen Local service account with the actions specified in <code>serviceAccountRoles.advancedClusterRole.rules</code></td></tr><tr><td>serviceAccountRoles.advancedClusterRole.rules</td><td>List</td><td>[]</td><td>List of actions that the RunWhen Local service account can perform cluster-wide. </td></tr>
</tbody></table>

### Application Configuration
<table><thead><tr><th width="213">Configuration Option</th><th>Type</th><th>Default Value</th><th>Description</th></tr></thead>
<tbody>
<tr><td>discoveryKubeconfig.inClusterAuth.enabled</td><td>Boolean</td><td>True</td><td></td></tr><tr><td>discoveryKubeconfig.secretProvided.enabled</td><td>Boolean</td><td>False</td><td></td></tr><tr><td>autoRun.discoveryInterval</td><td>Integer</td><td>14400</td><td></td></tr><tr><td>terminal.disabled</td><td>Boolean</td><td>True</td><td></td></tr><tr><td>uploadInfo</td><td>List</td><td>[]</td><td></td></tr><tr><td>workspaceInfo.defaultLocation</td><td>String</td><td>undefined</td><td></td></tr><tr><td>workspaceInfo.workspaceName</td><td>String</td><td>undefined</td><td></td></tr><tr><td>workspaceInfo.workspaceOwnerEmail</td><td>String</td><td>tester@my-company.com</td><td></td></tr><tr><td>workspaceInfo.defaultLOD</td><td>Integer</td><td>2</td><td></td></tr><tr><td>workspaceInfo.namespaceLODs.kube-system</td><td>Integer</td><td>0</td><td></td></tr><tr><td>workspaceInfo.namespaceLODs.kube-public</td><td>Integer</td><td>0</td><td></td></tr><tr><td>workspaceInfo.namespaceLODs.kube-node-lease</td><td>Integer</td><td>0</td><td></td></tr><tr><td>workspaceInfo.custom.kubernetes_distribution</td><td>String</td><td>Kubernetes</td><td></td></tr><tr><td>workspaceInfo.custom.kubernetes_distribution_binary</td><td>String</td><td>kubectl</td><td></td></tr><tr><td>workspaceInfo.custom.kubeconfig_secret_name</td><td>String</td><td>kubeconfig</td><td></td></tr>
</tbody></table>
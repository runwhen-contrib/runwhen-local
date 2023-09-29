# Helm Configuration

## Default Values

| Configuration Option | Type | Default Value | Other Available Options | Description |
|----------------------|------|---------------|-------------------------|-------------|
| replicaCount | Integer | 1 |  | The number of replicas for the deployment. |
| image.repository | String | ghcr.io/runwhen-contrib/runwhen-local |  | The Docker image repository. |
| image.pullPolicy | String | Always |  | The image pull policy. Common values are 'Always', 'IfNotPresent', or 'Never'. |
| image.tag | String | latest |  | The Docker image tag. |
| imagePullSecrets | List | [] |  | A list of secret names for pulling Docker images from private repositories. |
| nameOverride | String |  |  | Override the name of the chart. |
| fullnameOverride | String |  |  | Override the full name of the chart. |
| serviceAccount.create | Boolean | True |  | Specifies whether a service account should be created. |
| serviceAccount.name | String |  |  | The name of the service account to use or create. |
| serviceAccountRoles.namespaceRole.enabled | Boolean | False |  |  |
| serviceAccountRoles.namespaceRole.namespaces | List | [] |  |  |
| serviceAccountRoles.namespaceRole.rules | List | [{'apiGroups': [''], 'resources': ['*'], 'verbs': ['get', 'watch', 'list']}] |  |  |
| serviceAccountRoles.clusterRoleView.enabled | Boolean | True |  |  |
| serviceAccountRoles.advancedClusterRole.enabled | Boolean | False |  |  |
| serviceAccountRoles.advancedClusterRole.rules | List | [] |  |  |
| service.type | String | ClusterIP |  |  |
| service.port | Integer | 8081 |  |  |
| ingress.enabled | Boolean | False |  |  |
| ingress.className | String |  |  |  |
| ingress.hosts | List | [{'host': 'chart-example.local', 'paths': [{'path': '/', 'pathType': 'Prefix'}]}] |  |  |
| ingress.tls | List | [] |  |  |
| resources.requests.memory | String | 256Mi |  |  |
| resources.requests.cpu | String | 250m |  |  |
| resources.limits.memory | String | 1024Mi |  |  |
| resources.limits.cpu | String | 1 |  |  |
| tolerations | List | [] |  |  |
| discoveryKubeconfig.inClusterAuth.enabled | Boolean | True |  |  |
| discoveryKubeconfig.secretProvided.enabled | Boolean | False |  |  |
| autoRun.discoveryInterval | Integer | 14400 |  |  |
| terminal.disabled | Boolean | True |  |  |
| uploadInfo | List | [] |  |  |
| workspaceInfo.defaultLocation | String | undefined |  |  |
| workspaceInfo.workspaceName | String | undefined |  |  |
| workspaceInfo.workspaceOwnerEmail | String | tester@my-company.com |  |  |
| workspaceInfo.defaultLOD | Integer | 2 |  |  |
| workspaceInfo.namespaceLODs.kube-system | Integer | 0 |  |  |
| workspaceInfo.namespaceLODs.kube-public | Integer | 0 |  |  |
| workspaceInfo.namespaceLODs.kube-node-lease | Integer | 0 |  |  |
| workspaceInfo.custom.kubernetes_distribution | String | Kubernetes |  |  |
| workspaceInfo.custom.kubernetes_distribution_binary | String | kubectl |  |  |
| workspaceInfo.custom.kubeconfig_secret_name | String | kubeconfig |  |  |
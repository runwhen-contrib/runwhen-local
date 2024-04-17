# Helm Configuration

## Helm Chart Details

RunWhen Contrib Repository URL: [https://runwhen-contrib.github.io/helm-charts](https://runwhen-contrib.github.io/helm-charts)

Source URL: [https://github.com/runwhen-contrib/helm-charts/tree/main/charts/runwhen-local](https://github.com/runwhen-contrib/helm-charts/tree/main/charts/runwhen-local)

Values File: [https://github.com/runwhen-contrib/helm-charts/blob/main/charts/runwhen-local/values.yaml](https://github.com/runwhen-contrib/helm-charts/blob/main/charts/runwhen-local/values.yaml)

## Default Values

The following tables outline all available helm chart values and their defaults.

### Global/Shared Settings

| Setting            | Type    | Default            | Description                                  |
|--------------------|---------|--------------------|----------------------------------------------|
| `workspaceName`    | String  | [workspace-name]   | Name of the workspace                        |
| `imagePullSecrets` | List    | []                 | List of secret names for pulling images      |
| `nameOverride`     | String  | ""                 | Overrides the default name of the chart      |
| `fullnameOverride` | String  | ""                 | Overrides the full name of the chart         |
| `podAnnotations`   | Map     | {}                 | Annotations to add to pods                   |
| `nodeSelector`     | Map     | {}                 | Node labels for pod assignment               |
| `tolerations`      | List    | []                 | Tolerations for pod assignment               |
| `affinity`         | Map     | {}                 | Affinity rules for pod placement             |

### RunWhen Local Configuration

#### General Settings

| Setting              | Type    | Default   | Description                                 |
|----------------------|---------|-----------|---------------------------------------------|
| `enabled`            | Boolean | true      | Toggle RunWhen Local component              |
| `image.repository`   | String  | "ghcr.io/runwhen-contrib/runwhen-local" | Docker image repository |
| `image.pullPolicy`   | String  | "Always"  | Image pull policy                           |
| `image.tag`          | String  | "latest"  | Specific image tag to use                   |


#### Service Account Settings

| Setting               | Type    | Default   | Description                                  |
|-----------------------|---------|-----------|----------------------------------------------|
| `create`              | Boolean | true      | Whether to create a service account          |
| `annotations`         | Map     | {}        | Annotations for the service account          |
| `name`                | String  | "runwhen-local" | Name of the service account               |


#### Roles and Permissions

| Setting                      | Type    | Default | Description                                 |
|------------------------------|---------|---------|---------------------------------------------|
| `namespaceRole.enabled`      | Boolean | false   | Toggle role that applies to specific namespaces |
| `clusterRoleView.enabled`    | Boolean | true    | Toggle cluster-wide read-only access       |
| `advancedClusterRole.enabled`| Boolean | false   | Toggle customizable role with specified rules |


#### Service and Ingress

| Setting           | Type    | Default           | Description                                 |
|-------------------|---------|-------------------|---------------------------------------------|
| `type`            | String  | "ClusterIP"       | Type of service, e.g., `ClusterIP`          |
| `port`            | Integer | 8081              | Port on which the service is exposed        |
| `ingress.enabled` | Boolean | false             | Toggle ingress resource creation            |

#### Resource Management

| Setting           | Type    | Default   | Description                                 |
|-------------------|---------|-----------|---------------------------------------------|
| `requests.memory` | String  | "256Mi"   | Requested memory                            |
| `requests.cpu`    | String  | "250m"    | Requested CPU                               |
| `limits.memory`   | String  | "1024Mi"  | Memory limit                                |
| `limits.cpu`      | String  | "1"       | CPU limit                                   |


#### Discovery and Automation
| Setting                             | Type    | Default   | Description                              |
|-------------------------------------|---------|-----------|------------------------------------------|
| `discoveryKubeconfig.inClusterAuth.enabled` | Boolean | true | Use in-cluster authentication            |
| `autoRun.discoveryInterval`         | Integer | 14400     | Time interval for running discovery      |
| `autoRun.uploadEnabled`             | Boolean | false     | Enable uploading data to the RunWhen Platform |
| `autoRun.uploadMergeMode`           | String  | "keep-uploaded" | Strategy to merge data during uploads |

### Runner Configuration

| Setting       | Type    | Default                            | Description                              |
|---------------|---------|------------------------------------|------------------------------------------|
| `enabled`     | Boolean | false                              | Toggle Runner component                  |
| `image`       | String  | "us-docker.pkg.dev/runwhen-nonprod-shared/public-images/runner:latest" | Docker image of the Runner               |
| `controlAddr` | String  | "https://runner.beta.runwhen.com"  | Control address for managing the runner  |
| `metrics.url` | String  | "https://runner-cortex-tenant.beta.runwhen.com/push" | Endpoint for pushing metrics            |

#### Grafana Agent Configuration
These settings are applied to the grafana-agent subchart. They are tuned for runner execution, please do not adjust.

| Setting              | Type    | Default    | Description                              |
|----------------------|---------|------------|------------------------------------------|
| `agent.mode`         | String  | 'flow'     | Operation mode of the Grafana Agent      |
| `configMap.create`   | Boolean | false      | Whether to create a configMap for the agent |
| `volumes.extra.name` | String  | "tls-secret-volume" | Name of extra volumes                 |
| `rbac.create`        | Boolean | false      | Whether to create RBAC settings          |
| `serviceAccount.create` | Boolean | false   | Whether to create a service account for Grafana Agent |


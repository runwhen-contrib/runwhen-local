# multi-subscription-aks
This test infrastructure builds 2 AKS clusters and expects to also index a secondary (existing) kubernetes cluster, testing the mixture of AKS cluster configurations and authentication scenarios along with kubernetes configurations / auth from the cloudConfig stanza in workspaceInfo.yaml.

## Cluster Setup
- **Cluster 1**: Standard AKS cluster with Azure RBAC enabled - service account has full access
- **Cluster 2**: AKS cluster with mixed authentication (Azure AD + local accounts) - service account access varies
- **Fake Cluster**: Invalid cluster configuration with non-existent resource group and invalid subscription - guaranteed to cause permission denied errors
- **Additional K8s Cluster**: From kubeconfig.secret file for mixed authentication testing

## Test Purpose
This setup is designed to reproduce and test the core issue where RunWhen Local stops indexing remaining clusters in the kubeconfig when it encounters a permission denied error on one cluster. The fake cluster entry is intentionally configured with invalid credentials to guarantee permission denied errors and test the continuation behavior.

## Tasks
- `task build-infra` - aks infra / clusters are deployed (both clusters)
- `task generate-rwl-config` - build out the needed workspaceInfo.yaml (includes both AKS clusters)
- `task run-rwl-discovery` - build and run the container image from source, indexing both aks clusters and any clusters in the kubeconfig.

### Auth Login 
Login to azure to generate some of the env vars needed. 

```
az login --use-device-code

```

### Expected Env Variables
The following can/should be stored in a `tf.secret` file in the terraform folder. This file is gitignored. 

```
export TF_VAR_subscription_id=[]
export TF_VAR_subscription_id=$TF_VAR_subscription_id
export AZ_TENANT_ID=[]
export TF_VAR_tenant_id=$AZ_TENANT_ID
export AZ_CLIENT_SECRET=[]
export AZ_CLIENT_ID=[]
export TF_VAR_sp_principal_id=$(az ad sp show --id $AZ_CLIENT_ID --query id -o tsv)
export AZ_SECRET_ID=[]
```

### Building Infra

```
source terraform/tf.secret
task build-infra

```

## Kubeconfig 
A file called `kubeconfig.secret` should exist in this directory, it will be git ignored, but is configured in the workspaceInfo.yaml 
to test the indexing of a vanilla kubernetes configuration AND the AKS Clusters. This testing requires RunWhen Local to combine the user 
provided kubeconfig file with the AKS generated kubeconfig. 

## Expected Behavior
When running the discovery, you should see:
1. Successful indexing of Cluster 1 (has permissions)
2. Variable results for Cluster 2 (depends on actual permissions)
3. **Guaranteed permission denied errors** for the fake cluster (invalid configuration)
4. **Critical Test**: Discovery should continue and successfully index any remaining clusters (including kubeconfig.secret clusters) despite the permission denied error on the fake cluster

## Running Test
By default, running `task` will run the following tasks: 
- generate-rwl-config
- run-rwl-discovery (which builds and then runs the container)
```
task 
```

## Cleanup
```
task clean
```
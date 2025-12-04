# multi-subscription-aks
This test infrastructure builds 2 aks clusters across two separate subscriptions. The subscriptions must exist ahead of time. RunWhen Local is built from source and then configured to index the remote clusters. 

## Test Resources Created
- **2 AKS Clusters**: One in each subscription for Kubernetes testing (currently commented out for other testing)
- **2 Identical Resource Groups**: Both named `test-collision-rg` in different subscriptions
- **2 Storage Accounts**: One in each test resource group for SLX collision testing

## Tasks

### Standard Tasks
- `task build-infra` - Deploy AKS infra / clusters and test resources
- `task generate-rwl-config` - Build out the standard workspaceInfo.yaml
- `task run-rwl-discovery` - Build and run the container image from source, indexing the remote clusters

### SLX Collision Testing Tasks
- `task generate-collision-test-config` - Generate workspaceInfo-collision-test.yaml focused on collision testing
- `task run-collision-test` - Run complete collision test (generates config + runs discovery)
- `task clean` - Clean up all outputs and infrastructure

## SLX Collision Testing
The identical resource groups (`test-collision-rg`) in different subscriptions are designed to test:
1. **Resource Discovery**: Both resource groups should be discovered
2. **LOD Assignment**: Both should get correct LOD settings
3. **SLX Generation**: Storage accounts should generate unique SLXs (not collide)
4. **Qualifier Testing**: Tests whether `qualifiers: [resource, resource_group]` vs `qualifiers: [resource, resource_group, subscription_id]` affects SLX generation


### Auth Login 
Login to azure to generate some of the env vars needed. 

```
az login --use-device-code

```

### Expected Env Variables
The following can/should be stored in a `tf.local` file in the terraform folder. This file is gitignored. 

```
export TF_VAR_subscription_id_1=[]
export TF_VAR_subscription_id=$TF_VAR_subscription_id_1
export TF_VAR_subscription_id_2=[]
export AZ_TENANT_ID=[]
export TF_VAR_tenant_id=$AZ_TENANT_ID
export AZ_CLIENT_SECRET=[]
export AZ_CLIENT_ID=[]
export TF_VAR_sp_principal_id=$(az ad sp show --id $AZ_CLIENT_ID --query id -o tsv)
export AZ_SECRET_ID=[]
```
# Auth Login 
Login to azure to generate some of the env vars needed. 

```
az login --use-device-code

```

# Expected Env Variables
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

## Building Infra

```
source terraform/tf.secret
task build-infra

```

## Kubeconfig 
A file called `kubeconfig.secret` should exist in this directory, it will be git ignored, but is configured in the workspaceInfo.yaml 
to test the indexing of a vanilla kubernetes configuration AND an AKS Cluster. This testing requires RunWhen Local to combine the user 
provided kubeconfig file with the AKS generated kubeconfig. 


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
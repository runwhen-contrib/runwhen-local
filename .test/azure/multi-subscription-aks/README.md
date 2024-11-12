# Auth Login 
Login to azure to generate some of the env vars needed. 

```
az login --use-device-code

```

# Expected Env Variables
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
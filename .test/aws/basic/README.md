# basic
This test infrastructure performs basic discovery with a user provided workspaceInfo.yaml. 
- `task run-rwl-discovery` - build and run the container image from source, indexing the aks cluster and any clusters in the kubeconfig.

### workspaceInfo.yaml
Provide a specific workspaceInfo.yaml
```
workspaceName: "my-workspace"
workspaceOwnerEmail: authors@runwhen.com
defaultLocation: location-01-us-west1
defaultLOD: detailed
cloudConfig:
  aws: 
    awsAccessKeyId: ""
    awsSecretAccessKey: ""
codeCollections:
- repoURL: "https://github.com/runwhen-contrib/aws-c7n-codecollection"
  branch: "rds_test"
  codeBundles: ["aws-c7n-rds-health"]
custom:
  aws_access_key_id: AWS_ACCESS_KEY_ID
  aws_secret_access_key: AWS_SECRET_ACCESS_KEY

```


## Running Test
By default, running `task` will run the following tasks: 
- run-rwl-discovery (which builds and then runs the container)
```
task 
```


## Cleanup
```
task clean
```
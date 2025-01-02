# basic
This test infrastructure performs basic k8s discovery with a user provided kubeconfig.secret/
- `task generate-rwl-config` - build the basic rwl config
- `task run-rwl-discovery` - build and run the container image from source, indexing the aks cluster and any clusters in the kubeconfig.

### workspaceInfo.yaml
Provide a specific workspaceInfo.yaml
```


```

## Kubeconfig 
A file called `kubeconfig.secret` should exist in this directory, it will be git ignored, but is configured in the workspaceInfo.yaml 
to test the indexing of a vanilla kubernetes configuration. 

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
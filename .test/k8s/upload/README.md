# Upload
This test infrastructure performs basic k8s discovery with a user provided kubeconfig.secret, and focuses on testing the upload and reconciliation of user changes
within a RunWhen Platform workspace

- `task build-rwl` - Build the container image (if changes are made)
- `task ci-test-1` - build and run the container image from source, indexing the aks cluster and any clusters in the kubeconfig.
- `task reset-workspace` - Reset the test workspace 

## Kubeconfig 
A file called `kubeconfig.secret` should exist in this directory, it will be git ignored, but is configured in the workspaceInfo.yaml 
to test the indexing of a vanilla kubernetes configuration. 


## uploadInfo.yaml
An uploadInfo.yaml is required for the workspace you want to upload into - this file provides the necessary access for rwl to upload, 
as well as for the scripts to parse out workspace configuration details. 

## Env Vars
Additional env vars are required to complete these tests

```
export RW_PAT=""
export GITLAB_URL=""
export GITLAB_TOKEN=""
```

The rest of this Taskfile is still a WIP and has not yet been hooked up to GitHub Actions. 
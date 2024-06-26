# Ad-hoc registry sync scripts
Some environments will require that container images are replicated into local/private registries. These scripts may provide inspiration. 

## Required Images from the Beta Platform

- RunWhen Local 
- Runner
- Runner Runtime/Execution Images
- 3rd Party
    - Grafana
    - Prometheus PushGateway

## Scripts
### sync_with_skopeo.sh
This script requires: 
- jq
- yq
- skopeo

**Registry Update**  
Update your destination registry in the top of the script: 
```
private_registry="myacrregistry.azurecr.io"
```

**Image List**  
The list of images to copy is provided in a dict at the top of the script.
- If the list of images includes a specific tag, the script will only try to copy that tag from the upstream registry into the destination
- If no tag is supplied, the script will fetch all tags, determine the latest image by Creation Date, and copy that image and tag into the destination
- If the tag specified is "latest", it will be re-tagged with a unique date/time (as to avoid issues where the latest tag cannot be reassigned) 

Images are split into two categories, `runwhen_local_images` which are for core functionality, and `codecollection_images` which represent the codecolleciton images that run tasks in a workspace. The defaults in the script are appropriate for most POC use cases, while this list would grow ot change when subscribing to a specific tag of a codecollection, or additional private or public codecollections. 

```
runwhen_local_images=$(cat <<EOF
{
    "ghcr.io/runwhen-contrib/runwhen-local": {
        "destination": "runwhen/runwhen-local",
        "yaml_path": "runwhenLocal.image",
        "tag": "0.5.20"
    },
    "us-docker.pkg.dev/runwhen-nonprod-shared/public-images/runner": {
        "destination": "runwhen/runner",
        "yaml_path": "runner.image",
        "tag":"latest"
    },
    "docker.io/prom/pushgateway": {
        "destination": "prom/pushgateway",
        "yaml_path": "runner.pushgateway.image",
        "tag": "0.1.9"
    }
}
EOF
)

codecollection_images=$(cat <<EOF
{
    "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-cli-codecollection-main": {
        "destination": "runwhen/runwhen-contrib-rw-cli-codecollection-main",
        "yaml_path": "runner.runEnvironment.image"
    },
    "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-public-codecollection-main": {
        "destination": "runwhen/runwhen-contrib-rw-public-codecollection-main",
        "yaml_path": "runner.runEnvironment.image"
    }
}
EOF
)
```

**Helm Updates**  
This script supports adding in a helm values file and will output an updated version of the helm values file with the updated registry, repository, and tag values. It does not apply the helm changes, but could be easily extended to do so. 

Most customizations occur at the top of the script, updating the registry, repo, and helm paths for each image. 

#### Usage
Ensure that wherever this script runs, the registry access has already been authenticated. 

```
az acr login --name myContainerRegistry
chmod +x sync_with_skopeo.sh

```


## TODO
- allow repo override per image
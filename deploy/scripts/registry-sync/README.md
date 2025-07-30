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

### sync_with_az_import.sh
This script requires: 
- jq
- yq
- az
- cURL

Please login to the azure registry prior to running the script: 
```
az acr login -n myacrregistry.azurecr.io
```


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
        "tag": "v0.1.9"
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
chmod +x sync_with_az_import.sh

```

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
        "tag": "v0.1.9"
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

## sync_with_aws_ecr.sh

**Purpose**: Docker-free AWS ECR registry synchronization using `docker buildx imagetools create`

**Requirements**:
- `jq` - JSON processing
- `yq` - YAML processing  
- `aws` - AWS CLI
- `docker` - Docker CLI with buildx plugin
- `curl` - HTTP requests
- AWS credentials configured

**Configuration**:
- `private_registry` - AWS ECR registry URL (e.g., `123456789012.dkr.ecr.us-west-2.amazonaws.com`)
- `aws_region` - AWS region for ECR
- `desired_architecture` - Target architecture (default: `amd64`)
- `values_file` - Path to Helm values file
- `new_values_file` - Path to output Helm values file
- `tag_exclusion_list` - Comma-separated list of tags to exclude
- `runwhen_local_images` - JSON array of RunWhen Local images
- `codecollection_images` - JSON array of CodeCollection images

**Included Images**:
The script is pre-configured with all required RunWhen Local and CodeCollection images:

**RunWhen Local Images**:
- `ghcr.io/runwhen-contrib/runwhen-local` → `runwhen/runwhen-local`
- `us-docker.pkg.dev/runwhen-nonprod-shared/public-images/runner` → `runwhen/runner`
- `docker.io/otel/opentelemetry-collector` → `otel/opentelemetry-collector`
- `docker.io/prom/pushgateway` → `prom/pushgateway`

**CodeCollection Images**:
- `us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-cli-codecollection-main`
- `us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-public-codecollection-main`
- `us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-generic-codecollection-main`
- `us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-workspace-utils-main`

**Image List Structure**:
```json
[
  {
    "repository_image": "ghcr.io/runwhen-contrib/runwhen-local",
    "destination": "runwhen/runwhen-local", 
    "helm_key": "runwhenLocal"
  }
]
```

**Helm Updates**: Updates `.images.{helm_key}.tag` in the values file

**Usage**:
```bash
source aws_ecr_example_config.sh
./sync_with_aws_ecr.sh
```

**Why No Docker Daemon?**: Uses `docker buildx imagetools create` for daemonless registry-to-registry copying, eliminating the need for a running Docker daemon while leveraging Docker's native tooling.

## TODO
- allow repo override per image
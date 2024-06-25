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

It supports adding in a helm values file and will output an updated version of the helm values file with the updated registry, repository, and tag values. It does not apply the helm changes, but could be easily extended to do so. 

Most customizations occur at the top of the script, updating the registry, repo, and helm paths for each image. 

#!/bin/bash

# Ensure all required tools are installed
if ! command -v skopeo &> /dev/null
then
    echo "skopeo could not be found, please install it."
    exit
fi

if ! command -v yq &> /dev/null
then
    echo "yq could not be found, please install it."
    exit
fi

if ! command -v docker &> /dev/null
then
    echo "docker could not be found, please install it."
    exit
fi

# Create a unique date tag
unique_date_tag=$(date +%Y%m%d%H%M%S)

# Set Private Registry 
private_registry="ymyazureregistry.azurecr.io"
private_repo="runwhen"


# Set registry details
runwhen_local_images=(
    "ghcr.io/runwhen-contrib/runwhen-local|runwhen/runwhen-local"
    "us-docker.pkg.dev/runwhen-nonprod-shared/public-images/runner|runwhen/runwhen-local"
    "docker.io/grafana/agent|grafana/agent"
    "docker.io/prom/pushgateway|prom/pushgateway"
)

codecollection_repositories_images=(
    "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-cli-codecollection-main|runwhen/runwhen-contrib-rw-cli-codecollection-main"
    "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-public-codecollection-main|runwhen/runwhen-contrib-rw-public-codecollection-main"
)

values_file="sample_values.yaml"

# Function to get the latest tags from Google Artifact Registry using skopeo
get_latest_tags() {
    repository_image=$1
    tag_count=$2

    tags=$(skopeo list-tags docker://$repository_image | jq -r '.Tags | sort | reverse | .[:'${tag_count}'] | .[]')
    echo $tags
}

# Function to copyimage using skopeo
copy_image() {
    repository_image=$1
    tag=$2
    destination=$3

    src_image="docker://${repository_image}:${tag}"
    image_name=$(echo $repository_image | awk -F'/' '{print $NF}')
    dest_image="docker://${private_registry}/${destination}:${tag}"

    echo "skopeo copy $src_image $dest_image"
}

# Function to update image tags in values.yaml
update_values_yaml() {
    local repository_image=$1
    local tag=$2
    local custom_repo_destination=$3

    if [ -f "values.yaml" ]; then
        image_name=$(echo $repository_image | awk -F'/' '{print $NF}')
        yq eval ".images.${image_name}.repository = \"$private_registry/$custom_repo_destination\"" -i values.yaml
        yq eval ".images.${image_name}.tag = \"$tag\"" -i values.yaml
    fi
}

# Main script
main() {

    # Process CodeCollection Images (dynamic images that are rebuilt when CodeCollections Update)
    tag_count=5

    for image_with_dest in "${codecollection_repositories_images[@]}"; do
        # Extract the original image and custom destination
        IFS='|' read -r repository_image custom_repo_destination <<< "$image_with_dest"
        echo "----"
        echo "Processing RunWhen component image: $repository_image"
        tags=$(get_latest_tags $repository_image $tag_count)
        for tag in $tags; do
            echo "Copying image: $repository_image:$tag to $private_registry/$custom_repo_destination:$tag"
            copy_image $repository_image $tag $custom_repo_destination 
            echo "Image $private_registry/$custom_repo_destination:$tag pushed successfully"
        done
    done


    # Define RunWhen component images and their custom destinations
    tag_count=1

    for image_with_dest in "${runwhen_local_images[@]}"; do
        # Extract the original image and custom destination
        IFS='|' read -r repository_image custom_repo_destination <<< "$image_with_dest"
        echo "----"
        echo "Processing RunWhen component image: $repository_image"
        tags=$(get_latest_tags $repository_image $tag_count)
        for tag in $tags; do
            echo "Copying image: $repository_image:$tag to $private_registry/$custom_repo_destination:$tag"
            copy_image $repository_image $tag $custom_repo_destination 
            echo "Image $private_registry/$custom_repo_destination:$tag pushed successfully"
            update_values_yaml $repository_image $tag $custom_repo_destination

        done
    done

    # Display updated values.yaml content if it exists
    if [ -f "$values_file" ]; then
        echo "Updated $values_file"
        cat $values_file
    else
        echo "No values file found."
    fi

}

# Execute the main script
main
#!/bin/bash

# Set Private Registry
private_registry="ymyazureregistry.azurecr.io"
private_repo="runwhen"

# Specify values file
values_file="sample_values.yaml"
new_values_file="updated_values.yaml"

# JSON configuration
runwhen_local_images=$(cat <<EOF
{
    "ghcr.io/runwhen-contrib/runwhen-local": {
        "destination": "runwhen/runwhen-local",
        "yaml_path": "runwhenLocal.image"
    },
    "us-docker.pkg.dev/runwhen-nonprod-shared/public-images/runner": {
        "destination": "runwhen/runner",
        "yaml_path": "runner.image"
    },
    "docker.io/grafana/agent": {
        "destination": "grafana/agent",
        "yaml_path": "grafana-agent.image"
    },
    "docker.io/prom/pushgateway": {
        "destination": "prom/pushgateway",
        "yaml_path": "runner.pushgateway.image"
    }
}
EOF
)

codecollection_repositories_images=$(cat <<EOF
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

if ! command -v jq &> /dev/null
then
    echo "jq could not be found, please install it."
    exit
fi


# Function to get the latest tags from Google Artifact Registry using skopeo
get_latest_tags() {
    repository_image=$1
    tag_count=$2

    tags=$(skopeo list-tags docker://$repository_image | jq -r '.Tags | sort | reverse | .[:'${tag_count}'] | .[]')
    echo $tags
}

# Function to copy image using skopeo
copy_image() {
    repository_image=$1
    tag=$2
    destination=$3

    src_image="docker://${repository_image}:${tag}"
    dest_image="docker://${private_registry}/${destination}:${tag}"

    echo "skopeo copy $src_image $dest_image"
}

# Function to update image registry and repository in values file
update_values_yaml_no_tag() {
    local registry=$1
    local repository=$2
    local yaml_path=$3

    yq eval ".${yaml_path}.registry = \"$registry\"" -i $new_values_file
    yq eval ".${yaml_path}.repository = \"$repository\"" -i $new_values_file
}

# Function to update image registry, repository, and tag in values file
update_values_yaml() {
    local registry=$1
    local repository=$2
    local tag=$3
    local yaml_path=$4

    yq eval ".${yaml_path}.registry = \"$registry\"" -i $new_values_file
    yq eval ".${yaml_path}.repository = \"$repository\"" -i $new_values_file
    yq eval ".${yaml_path}.tag = \"$tag\"" -i $new_values_file
}

# Main script
main() {

    # Create a backup of the original values file
    cp $values_file $new_values_file

    # Process CodeCollection Images (dynamic images that are rebuilt when CodeCollections Update)
    tag_count=5

    for repository_image in $(echo $codecollection_repositories_images | jq -r 'keys[]'); do
        # Extract the custom destination and yaml path
        custom_repo_destination=$(echo $codecollection_repositories_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].destination')
        yaml_path=$(echo $codecollection_repositories_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].yaml_path')
        echo "----"
        echo "Processing CodeCollection repository image: $repository_image"
        tags=$(get_latest_tags $repository_image $tag_count)
        for tag in $tags; do
            echo "Copying image: $repository_image:$tag to $private_registry/$custom_repo_destination:$tag"
            copy_image $repository_image $tag $custom_repo_destination 
            echo "Image $private_registry/$custom_repo_destination:$tag pushed successfully"
            update_values_yaml_no_tag $private_registry $custom_repo_destination $yaml_path
        done
    done

    # Process RunWhen component images
    tag_count=1

    for repository_image in $(echo $runwhen_local_images | jq -r 'keys[]'); do
        # Extract the custom destination and yaml path
        custom_repo_destination=$(echo $runwhen_local_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].destination')
        yaml_path=$(echo $runwhen_local_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].yaml_path')
        echo "----"
        echo "Processing RunWhen component image: $repository_image"
        tags=$(get_latest_tags $repository_image $tag_count)
        for tag in $tags; do
            echo "Copying image: $repository_image:$tag to $private_registry/$custom_repo_destination:$tag"
            copy_image $repository_image $tag $custom_repo_destination 
            echo "Image $private_registry/$custom_repo_destination:$tag pushed successfully"
            update_values_yaml $private_registry $custom_repo_destination $tag $yaml_path
        done
    done

    # Display updated new_values.yaml content if it exists
    if [ -f "$new_values_file" ]; then
        echo "Updated $new_values_file:"
        cat $new_values_file
    else
        echo "No $new_values_file file found."
    fi
}

# Execute the main script
main

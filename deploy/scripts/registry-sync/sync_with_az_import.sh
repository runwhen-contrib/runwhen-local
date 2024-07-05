#!/bin/bash

# Set Private Registry
private_registry="myacrrepo.azurecr.io"

# Set Architecture
desired_architecture="amd64"

# Specify values file
values_file="sample_values.yaml"
new_values_file="updated_values.yaml"

# Tag exclusion list
tag_exclusion_list=("tester")

# Generate a unique date-based tag
date_based_tag=$(date +%Y%m%d%H%M%S)

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
    "docker.io/grafana/agent": {
        "destination": "grafana/grafana-agent",
        "yaml_path": "grafana-agent.image",
        "tag": "v0.41.1"
    },
    "docker.io/prom/pushgateway": {
        "destination": "prom/pushgateway",
        "yaml_path": "runner.pushgateway.image",
        "tag": "v1.9.0"
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
    },
    "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/ runwhen-contrib-rw-generic-codecollection-main": {
        "destination": "runwhen/ runwhen-contrib-rw-generic-codecollection-main",
        "yaml_path": "runner.runEnvironment.image"
    }
}
EOF
)

# Ensure all required tools are installed
if ! command -v curl &> /dev/null; then
    echo "curl could not be found, please install it."
    exit
fi

if ! command -v yq &> /dev/null; then
    echo "yq could not be found, please install it."
    exit
fi

if ! command -v jq &> /dev/null; then
    echo "jq could not be found, please install it."
    exit
fi

# Function to get tags sorted by creation date from a repository image
get_sorted_tags_by_date() {
    repository_image=$1
    echo "Fetching tags for repository image: $repository_image with architecture: $desired_architecture" >&2

    # Check if the repository image is from Google Artifact Registry
    ## TODO Add additional checks for other repo types if necessary; 
    ## which at this time is not, as all other tags are explicitly defined.
    if [[ $repository_image == *.pkg.dev/* ]]; then
        REPO_URL="https://us-west1-docker.pkg.dev/v2/${repository_image#*pkg.dev/}/tags/list"
        TAGS=$(curl -s "$REPO_URL" | jq -r '.tags[]')
    else
        echo "Unsupported repository type: $repository_image" >&2
        return
    fi

    if [ -z "$TAGS" ]; then
        echo "No tags found for $repository_image" >&2
        return
    fi

    tag_dates=()
    for TAG in $TAGS; do
        echo "Processing tag: $TAG" >&2
        if is_excluded_tag "$TAG" || [[ $TAG == "latest" ]]; then
            echo "Skipping $TAG" >&2
            continue
        fi

        if [[ $repository_image == *.pkg.dev/* ]]; then
            MANIFEST=$(curl -s "https://us-west1-docker.pkg.dev/v2/${repository_image#*pkg.dev/}/manifests/$TAG")

            # Check if the manifest is multi-arch
            media_type=$(echo "$MANIFEST" | jq -r '.mediaType')
            if [ "$media_type" == "application/vnd.docker.distribution.manifest.list.v2+json" ]; then
                # Multi-arch manifest
                MANIFESTS=$(echo "$MANIFEST" | jq -c --arg arch "$desired_architecture" '.manifests[] | select(.platform.architecture == $arch)')
                for MANIFEST_ITEM in $MANIFESTS; do
                    ARCH_MANIFEST_DIGEST=$(echo "$MANIFEST_ITEM" | jq -r '.digest')
                    ARCH_MANIFEST=$(curl -s "https://us-west1-docker.pkg.dev/v2/${repository_image#*pkg.dev/}/manifests/$ARCH_MANIFEST_DIGEST")
                    CONFIG_DIGEST=$(echo "$ARCH_MANIFEST" | jq -r '.config.digest')
                    CONFIG=$(curl -L -s "https://us-west1-docker.pkg.dev/v2/${repository_image#*pkg.dev/}/blobs/$CONFIG_DIGEST")
                    CREATION_DATE=$(echo "$CONFIG" | jq -r '.created')

                    if [ -n "$CREATION_DATE" ]; then
                        tag_dates+=("$CREATION_DATE $TAG")
                        break
                    fi
                done
            else
                # Single-arch manifest
                CONFIG_DIGEST=$(echo "$MANIFEST" | jq -r '.config.digest')
                CONFIG=$(curl -L -s "https://us-west1-docker.pkg.dev/v2/${repository_image#*pkg.dev/}/blobs/$CONFIG_DIGEST")
                CREATION_DATE=$(echo "$CONFIG" | jq -r '.created')
                
                if [ -n "$CREATION_DATE" ]; then
                    tag_dates+=("$CREATION_DATE $TAG")
                fi
            fi
        else
            echo "Unsupported repository type: $repository_image" >&2
            return
        fi
    done

    if [ ${#tag_dates[@]} -eq 0 ]; then
        return
    fi

    # Sort tags by creation date
    sorted_tags=$(printf "%s\n" "${tag_dates[@]}" | sort -r | awk '{print $2}')
    echo $sorted_tags
}

# Function to copy image using az import
copy_image() {
    repository_image=$1
    src_tag=$2
    destination=$3
    dest_tag=$4

    # Remove echo when ready 
    az acr import -n ${private_registry} --source ${repository_image}:${src_tag} --image ${destination}:${dest_tag}
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

# Check if a tag is in the exclusion list
is_excluded_tag() {
    local tag=$1
    for excluded_tag in "${tag_exclusion_list[@]}"; do
        if [ "$tag" == "$excluded_tag" ]; then
            return 0
        fi
    done
    return 1
}

# Check if the repository image has a tag already specified
has_tag() {
    local repository_image=$1
    local images_json=$2
    jq -e --arg repository_image "$repository_image" '.[($repository_image)].tag != null' <<< "$images_json" > /dev/null 2>&1
}

# Main script
main() {

    # Create a backup of the original values file
    cp $values_file $new_values_file

    # Process CodeCollection images
    for repository_image in $(echo $codecollection_images | jq -r 'keys[]'); do
        # Extract the custom destination and yaml path
        custom_repo_destination=$(echo $codecollection_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].destination')
        custom_destination_repo=$(echo $custom_repo_destination | awk -F '/' '{print $1}')
        yaml_path=$(echo $codecollection_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].yaml_path')

        if has_tag "$repository_image" "$codecollection_images"; then
            tag=$(echo $codecollection_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].tag')
            echo "Skipping fetching tags for $repository_image and using specified tag $tag"
            selected_tag=$tag
        else
            echo "----"
            echo "Processing CodeCollection image: $repository_image"
            sorted_tags=$(get_sorted_tags_by_date $repository_image)
            selected_tag=""
            for tag in $sorted_tags; do
                if is_excluded_tag $tag; then
                    echo "Skipping excluded tag: $tag"
                    continue
                fi
                selected_tag=$tag
                break
            done
        fi
        echo "Copying image: $repository_image:$selected_tag to $private_registry/$custom_repo_destination:$selected_tag"
        copy_image $repository_image $selected_tag $custom_repo_destination $selected_tag
        echo "Image $private_registry/$custom_repo_destination:$selected_tag pushed successfully"
        update_values_yaml $private_registry $custom_destination_repo $selected_tag $yaml_path
    done

    # Process RunWhen component images
    for repository_image in $(echo $runwhen_local_images | jq -r 'keys[]'); do
        # Extract the custom destination and yaml path
        custom_repo_destination=$(echo $runwhen_local_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].destination')
        yaml_path=$(echo $runwhen_local_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].yaml_path')

        if has_tag "$repository_image" "$runwhen_local_images"; then
            tag=$(echo $runwhen_local_images | jq -r --arg repository_image "$repository_image" '.[$repository_image].tag')
            echo "Skipping fetching tags for $repository_image and using specified tag $tag"
            selected_tag=$tag
        else
            echo "----"
            echo "Processing RunWhen component image: $repository_image"
            sorted_tags=$(get_sorted_tags_by_date $repository_image)
            selected_tag=""
            for tag in $sorted_tags; do
                if is_excluded_tag $tag; then
                    echo "Skipping excluded tag: $tag"
                    continue
                fi
                selected_tag=$tag
                break
            done
        fi
        if [ "$selected_tag" == "latest" ]; then
            selected_tag=$date_based_tag
            echo "Copying image: $repository_image:latest to $private_registry/$custom_repo_destination:$selected_tag"
            copy_image $repository_image latest $custom_repo_destination $selected_tag           
        else
            echo "Copying image: $repository_image:$selected_tag to $private_registry/$custom_repo_destination:$selected_tag"
            copy_image $repository_image $selected_tag $custom_repo_destination $selected_tag
        fi
        update_values_yaml $private_registry $custom_repo_destination $selected_tag $yaml_path
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

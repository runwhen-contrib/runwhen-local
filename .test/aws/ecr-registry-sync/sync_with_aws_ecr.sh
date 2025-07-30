#!/bin/bash

# AWS ECR Registry Sync Script
# Syncs container images from various registries to AWS ECR
# Uses docker buildx imagetools create for daemonless image copying

set -euo pipefail

# Set Private Registry (AWS ECR)
private_registry="982534371594.dkr.ecr.us-west-2.amazonaws.com"

# Set AWS Region
aws_region="us-west-2"

# Set Architecture
desired_architecture="amd64"

# Specify values file
values_file="sample_values.yaml"
new_values_file="updated_values.yaml"

# Tag exclusion list
tag_exclusion_list=("tester")

# Generate a unique date-based tag
date_based_tag=$(date +%Y%m%d%H%M%S)

# RunWhen Local Images - Core functionality images
runwhen_local_images='[
  {
    "repository_image": "ghcr.io/runwhen-contrib/runwhen-local",
    "destination": "test-rwl-runwhen/runwhen-local",
    "helm_key": "runwhenLocal"
  },
  {
    "repository_image": "us-docker.pkg.dev/runwhen-nonprod-shared/public-images/runner",
    "destination": "test-rwl-runwhen/runner",
    "helm_key": "runner"
  },
  {
    "repository_image": "docker.io/otel/opentelemetry-collector",
    "destination": "test-rwl-runwhen/opentelemetry-collector",
    "helm_key": "opentelemetry-collector"
  },
  {
    "repository_image": "docker.io/prom/pushgateway",
    "destination": "test-rwl-runwhen/pushgateway",
    "helm_key": "runner.pushgateway"
  }
]'

# CodeCollection Images - Runtime/execution images
codecollection_images='[
  {
    "repository_image": "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-cli-codecollection-main",
    "destination": "test-rwl-runwhen/runwhen-contrib-rw-cli-codecollection-main",
    "helm_key": "runner.runEnvironment"
  },
  {
    "repository_image": "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-public-codecollection-main",
    "destination": "test-rwl-runwhen/runwhen-contrib-rw-public-codecollection-main",
    "helm_key": "runner.runEnvironment"
  },
  {
    "repository_image": "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-generic-codecollection-main",
    "destination": "test-rwl-runwhen/runwhen-contrib-rw-generic-codecollection-main",
    "helm_key": "runner.runEnvironment"
  },
  {
    "repository_image": "us-west1-docker.pkg.dev/runwhen-nonprod-beta/public-images/runwhen-contrib-rw-workspace-utils-main",
    "destination": "test-rwl-runwhen/runwhen-contrib-rw-workspace-utils-main",
    "helm_key": "runner.runEnvironment"
  }
]'

# Required tools
required_tools=("jq" "yq" "aws" "docker" "curl")

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    for tool in "${required_tools[@]}"; do
        if ! command_exists "$tool"; then
            echo "❌ Required tool '$tool' not found"
            exit 1
        fi
    done
    
    # Check if docker buildx is available
    if ! docker buildx version >/dev/null 2>&1; then
        echo "❌ Docker buildx not available. Please install Docker buildx plugin."
        exit 1
    fi
    
    echo "✅ All prerequisites met"
}

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

AWS ECR Registry Sync Script

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose output

CONFIGURATION:
    Edit the variables at the top of this script:
    - private_registry: AWS ECR registry URL
    - aws_region: AWS region for ECR
    - values_file: Path to Helm values file
    - new_values_file: Path to output Helm values file

EXAMPLE:
    ./sync_with_aws_ecr.sh

EOF
}

# Function to create ECR repository if it doesn't exist
create_ecr_repository() {
    local repository_name=$1
    
    echo "🔍 Checking if ECR repository '$repository_name' exists..."
    
    if aws ecr describe-repositories --repository-names "$repository_name" --region "$aws_region" >/dev/null 2>&1; then
        echo "✅ Repository '$repository_name' already exists"
    else
        echo "📦 Creating ECR repository '$repository_name'..."
        aws ecr create-repository \
            --repository-name "$repository_name" \
            --region "$aws_region" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        
        echo "✅ Repository '$repository_name' created successfully"
    fi
}

# Function to copy image using docker buildx imagetools create (daemonless)
copy_image() {
    repository_image=$1
    src_tag=$2
    destination=$3
    dest_tag=$4

    echo "Copying image: $repository_image:$src_tag to $private_registry/$destination:$dest_tag"
    
    # Create ECR repository if it doesn't exist
    create_ecr_repository "$destination"
    
    # Get ECR authentication token
    echo "Authenticating with ECR..."
    local auth_token=$(aws ecr get-login-password --region "$aws_region")
    if [ -z "$auth_token" ]; then
        echo "❌ Failed to get ECR authentication token"
        return 1
    fi
    
    # Login to ECR using docker
    echo "Logging into ECR..."
    echo "$auth_token" | docker login "$private_registry" --username AWS --password-stdin >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "❌ Failed to login to ECR"
        return 1
    fi
    
    # Use docker buildx with a simple Dockerfile to copy the image
    echo "Copying image using docker buildx..."
    
    # Create a temporary Dockerfile
    local temp_dockerfile=$(mktemp)
    cat > "$temp_dockerfile" << EOF
FROM $repository_image:$src_tag
EOF
    
    # Build and push using docker buildx
    if docker buildx build \
        --platform linux/amd64 \
        --file "$temp_dockerfile" \
        --tag "$private_registry/$destination:$dest_tag" \
        --push \
        . 2>/dev/null; then
        echo "✅ Successfully copied image using docker buildx"
        rm -f "$temp_dockerfile"
        return 0
    else
        echo "❌ Failed to copy image using docker buildx"
        echo "   Source: $repository_image:$src_tag"
        echo "   Destination: $private_registry/$destination:$dest_tag"
        echo "   This may be due to:"
        echo "   - Network connectivity issues"
        echo "   - Source image not found or inaccessible"
        echo "   - Insufficient AWS ECR permissions"
        echo "   - Architecture mismatch"
        rm -f "$temp_dockerfile"
        return 1
    fi

    local repository_image=$1
    local max_tags=${2:-10}
    
    # For now, just return "latest" to avoid authentication issues
    # and prevent SHA256 digests from being used
    echo "latest"
}

# Function to update Helm values file
update_helm_values() {
    local values_file=$1
    local new_values_file=$2
    local image_name=$3
    local new_tag=$4
    
    echo "📝 Updating Helm values: $image_name -> $new_tag"
    
    # Create backup of original file
    cp "$values_file" "${values_file}.backup"
    
    # Update the image tag using yq
    yq eval ".images.$image_name.tag = \"$new_tag\"" "$values_file" > "$new_values_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ Updated Helm values file: $new_values_file"
    else
        echo "❌ Failed to update Helm values file"
        return 1
    fi
}

# Function to sync images
sync_images() {
    local images_json=$1
    local image_type=$2
    
    echo "🔄 Starting sync for $image_type images..."
    
    # Parse JSON array
    local images=$(echo "$images_json" | jq -r '.[] | @base64')
    
    for image_base64 in $images; do
        local image_data=$(echo "$image_base64" | base64 -d)
        local repository_image=$(echo "$image_data" | jq -r '.repository_image')
        local destination=$(echo "$image_data" | jq -r '.destination')
        local helm_key=$(echo "$image_data" | jq -r '.helm_key')
        
        echo "📦 Processing: $repository_image -> $destination"
        
        # Get available tags
        local available_tags=$(get_available_tags "$repository_image")
        if [ $? -ne 0 ]; then
            echo "⚠️  Skipping $repository_image due to tag fetch failure"
            continue
        fi
        
        # Filter out excluded tags and SHA256 digests
        local filtered_tags=""
        for tag in "${tags_array[@]}"; do
            # Skip SHA256 digests and excluded tags
            if [[ "$tag" =~ ^sha256: ]] || [[ " ${tag_exclusion_list[@]} " =~ " ${tag} " ]]; then
                continue
            fi
            filtered_tags="$filtered_tags$tag"$'\n'
        done
        
        # Get the latest tag (first in the list) or use "latest" as fallback
        local latest_tag=$(echo "$filtered_tags" | head -n1 | tr -d '[:space:]')
        if [ -z "$latest_tag" ]; then
            latest_tag="latest"
        fi
        
        echo "🏷️  Using tag: $latest_tag"
        
        # Copy the image
        if copy_image "$repository_image" "$latest_tag" "$destination" "$latest_tag"; then
            # Update Helm values
            update_helm_values "$values_file" "$new_values_file" "$helm_key" "$latest_tag"
        else
            echo "❌ Failed to copy image: $repository_image:$latest_tag"
        fi
        
        echo "---"
    done
}

# Main execution
main() {
    local verbose=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            *)
                echo "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Set verbose mode
    if [ "$verbose" = true ]; then
        set -x
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Convert tag_exclusion_list to array if it's a string
    if [ -n "${tag_exclusion_list:-}" ] && [[ "$tag_exclusion_list" != *" "* ]]; then
        IFS=',' read -ra tag_exclusion_list <<< "$tag_exclusion_list"
    fi
    
    echo "🚀 Starting AWS ECR Registry Sync"
    echo "Registry: $private_registry"
    echo "Region: $aws_region"
    echo "Values file: $values_file"
    echo "Output file: $new_values_file"
    echo "Architecture: ${desired_architecture:-amd64}"
    echo "---"
    
    # Sync RunWhen Local images
    if [ -n "${runwhen_local_images:-}" ]; then
        sync_images "$runwhen_local_images" "RunWhen Local"
    else
        echo "⚠️  No RunWhen Local images configured"
    fi
    
    # Sync CodeCollection images
    if [ -n "${codecollection_images:-}" ]; then
        sync_images "$codecollection_images" "CodeCollection"
    else
        echo "⚠️  No CodeCollection images configured"
    fi
    
    echo "✅ AWS ECR Registry Sync completed"
    echo "📄 Updated Helm values saved to: $new_values_file"
}

# Run main function
main "$@" 
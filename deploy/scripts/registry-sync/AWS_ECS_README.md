# AWS ECS Registry Sync Quick Start

This guide helps you quickly set up and use the AWS ECR registry sync functionality.

## Prerequisites

- AWS CLI installed and configured with appropriate credentials
- Docker CLI with buildx plugin
- `jq`, `yq`, and `curl` utilities
- AWS ECR permissions (create repositories, push/pull images)

## Quick Setup

1. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

2. **Set up your configuration**:
   ```bash
   # Copy the example configuration
   cp aws_ecr_example_config.sh my_config.sh
   
   # Edit the configuration with your settings
   nano my_config.sh
   ```

3. **Run the sync**:
   ```bash
   source my_config.sh
   ./sync_with_aws_ecr.sh
   ```

## Configuration

Edit `my_config.sh` with your specific settings:

```bash
# AWS ECR Registry URL
private_registry="123456789012.dkr.ecr.us-west-2.amazonaws.com"

# AWS Region
aws_region="us-west-2"

# Helm values files
values_file="sample_values.yaml"
new_values_file="updated_values.yaml"

# Images to sync
runwhen_local_images='[
  {
    "repository_image": "ghcr.io/runwhen-contrib/runwhen-local",
    "destination": "runwhen/runwhen-local",
    "helm_key": "runwhenLocal"
  }
]'
```

## Key Features

- **Daemonless operation**: Uses `docker buildx imagetools create` for direct registry-to-registry copying
- **Automatic ECR repository creation**: Creates repositories if they don't exist
- **Multi-registry support**: Works with Google Artifact Registry, GitHub Container Registry, and Docker Hub
- **Helm integration**: Updates your Helm values files with new image tags
- **Tag filtering**: Exclude specific tags from being synced

## Testing

For comprehensive testing, see the test infrastructure in `.test/aws/ecr-registry-sync/`.

## Troubleshooting

- **Authentication issues**: Ensure AWS credentials are properly configured
- **Permission errors**: Verify ECR permissions (create repositories, push/pull images)
- **Buildx not found**: Install Docker buildx plugin: `docker buildx install`
- **Network issues**: Check connectivity to source registries

## Why Docker Buildx?

This implementation uses `docker buildx imagetools create` instead of external tools like `crane` or `skopeo` because:

- **Native Docker tooling**: Leverages existing Docker CLI infrastructure
- **Daemonless operation**: No Docker daemon required for registry operations
- **Consistent authentication**: Uses standard Docker login mechanisms
- **Wide availability**: Docker buildx is commonly available in most environments 
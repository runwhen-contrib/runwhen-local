# RunWhen Local

[![Join Slack](https://img.shields.io/badge/Join%20Slack-%23E01563.svg?&style=for-the-badge&logo=slack&logoColor=white)](https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)

RunWhen Local is an open-source workspace builder and troubleshooting companion that automatically discovers resources from your Kubernetes clusters and cloud environments. It generates personalized troubleshooting commands, runbooks, and automation tasks tailored specifically to your infrastructure.

**RunWhen Local** is like your personal troubleshooter's toolbox - it scans your environment, identifies the perfect troubleshooting commands for your resources, and provides them as easy copy-and-paste CLI commands through a web interface.

## Table of Contents

- [Features](#features)
- [What is RunWhen?](#what-is-runwhen)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Features

- **Multi-Cloud Discovery**: Automatically discover and index resources from Kubernetes, Azure, AWS, and GCP
- **Code Collections**: Leverage community-maintained runbooks and SLIs from external repositories
- **Template-Based Generation**: Generate workspace configurations using flexible Jinja2 templates
- **Level of Detail Control**: Configure different levels of detail for resource discovery and SLX generation
- **ConfigProvided Overrides**: Override template variables in runbooks and SLIs without modifying original templates
- **Map Customization**: Apply custom grouping and relationship rules to organize your workspace
- **Multiple Output Formats**: Generate runbooks, SLIs, workflows, and workspace configurations
- **Azure DevOps Integration**: Support for Azure DevOps resource discovery and automation
- **Web Interface**: Searchable web interface for copy-and-paste troubleshooting commands
- **Docker Support**: Run in containerized environments for consistent deployments

## What is RunWhen?

RunWhen provides **AI Engineering Assistants** that help with troubleshooting and automation:

- **RunWhen Platform**: SaaS service that orchestrates AI assistants for alert response, developer self-service, and automated troubleshooting
- **RunWhen Local**: Open-source agent that provides personalized troubleshooting commands and can connect to the RunWhen Platform
- **Code Collections**: Community-maintained libraries of troubleshooting automation and runbooks

**RunWhen Local** works standalone as a troubleshooting companion, or can be connected to the RunWhen Platform for advanced AI-powered automation and workflows.

## Prerequisites

- **Python**: 3.10 or higher (for local installation)
- **Docker**: Latest version (for containerized deployment)
- **Cloud Access**: Appropriate credentials for your target cloud platforms:
  - **Kubernetes**: Valid kubeconfig file
  - **Azure**: Azure CLI or service principal credentials
  - **AWS**: AWS CLI credentials or IAM roles
  - **GCP**: Service account key or gcloud credentials

## Installation

### Docker (Recommended)

```bash
# Pull the latest image
docker pull ghcr.io/runwhen-contrib/runwhen-local:latest

# Run with volume mounts for configuration and output
docker run -it --rm \
  -v $(pwd)/workspaceInfo.yaml:/shared/workspaceInfo.yaml \
  -v $(pwd)/kubeconfig:/shared/kubeconfig \
  -v $(pwd)/output:/shared/output \
  ghcr.io/runwhen-contrib/runwhen-local:latest
```

### Local Python Installation

```bash
# Clone the repository
git clone https://github.com/runwhen-contrib/runwhen-local.git
cd runwhen-local/src

# Install dependencies using Poetry
pip install poetry
poetry install

# Make the run script executable
chmod +x run.sh

# Run the workspace builder
./run.sh
```

## Quick Start

1. **Create a workspace configuration file** (`workspaceInfo.yaml`):

```yaml
# Basic workspaceInfo.yaml structure
workspaceName: "my-workspace"
workspaceOwnerEmail: "admin@company.com"
defaultLocation: "location-01"
defaultLOD: "detailed"  # Level of detail: "none", "basic", or "detailed"

# Cloud configuration
cloudConfig:
  kubernetes:
    kubeconfigFile: "/shared/kubeconfig"
    namespaceLODs:
      kube-system: "none"
      kube-public: "none"
      kube-node-lease: "none"
  
  # Optional: Azure configuration
  azure:
    subscriptionId: "your-subscription-id"
    tenantId: "your-tenant-id"
    clientId: "your-client-id"
    clientSecret: "your-client-secret"

# Code collections - external repositories with runbooks/SLIs
codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
    branch: "main"

# Custom variables for generation rules
custom:
  kubernetes_distribution_binary: "kubectl"
  cloud_provider: "none"
```

2. **Prepare your kubeconfig** (if using Kubernetes discovery):

```bash
# Copy your kubeconfig to the workspace
cp ~/.kube/config ./kubeconfig
```

3. **Run the workspace builder**:

```bash
# Using Docker
docker run -it --rm \
  -v $(pwd)/workspaceInfo.yaml:/shared/workspaceInfo.yaml \
  -v $(pwd)/kubeconfig:/shared/kubeconfig \
  -v $(pwd)/output:/shared/output \
  ghcr.io/runwhen-contrib/runwhen-local:latest

# Using local installation
cd src && ./run.sh
```

4. **Check the generated output**:

```bash
ls output/
# You'll find generated runbooks, SLIs, and workspace configurations
```

## Configuration

### workspaceInfo.yaml Structure

The main configuration file is a simple YAML file with these top-level sections:

```yaml
# Basic workspace configuration
workspaceName: "workspace-name"
workspaceOwnerEmail: "admin@company.com"
defaultLocation: "location-01"
defaultLOD: "detailed"  # Level of detail

# Cloud platform configuration
cloudConfig:
  kubernetes: # Kubernetes cluster configuration
  azure:      # Azure subscription configuration  
  aws:        # AWS account configuration
  gcp:        # GCP project configuration

# External code collections  
codeCollections:
  - repoURL: "https://github.com/..."
    branch: "main"

# Custom variables for generation rules
custom:
  kubernetes_distribution_binary: "kubectl"
```

### Command Line Options

```bash
./run.sh [OPTIONS]

Options:
  -w, --workspace-info FILE    Workspace info file (default: workspaceInfo.yaml)
  -k, --kubeconfig FILE        Kubeconfig file (default: kubeconfig)
  -r, --customization-rules FILE  Customization rules file
  -o, --output DIRECTORY       Output directory (default: output)
  --upload                     Upload to RunWhen platform
  -v, --verbose                Verbose output
  --disable-cloudquery         Disable cloudquery component
  -h, --help                   Show help message
```

## Usage Examples

### Example 1: Kubernetes-Only Discovery

```yaml
workspaceName: "kubernetes-prod"
workspaceOwnerEmail: "admin@company.com"
defaultLocation: "location-01"
defaultLOD: "detailed"

cloudConfig:
  kubernetes:
    kubeconfigFile: "/shared/kubeconfig"
    namespaceLODs:
      production: "detailed"
      staging: "basic"
      kube-system: "none"
      kube-public: "none"
      kube-node-lease: "none"

codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
    branch: "main"

custom:
  kubernetes_distribution_binary: "kubectl"
  cloud_provider: "none"
```

### Example 2: Multi-Cloud with Azure

```yaml
workspaceName: "multi-cloud-ops"
workspaceOwnerEmail: "admin@company.com"
defaultLocation: "location-01"
defaultLOD: "basic"

cloudConfig:
  kubernetes:
    kubeconfigFile: "/shared/kubeconfig"
    namespaceLODs:
      production: "basic"
      kube-system: "none"
  
  azure:
    subscriptionId: "your-subscription-id"
    tenantId: "your-tenant-id"
    clientId: "your-client-id"
    clientSecret: "your-client-secret"

codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
    branch: "main"

custom:
  kubernetes_distribution_binary: "kubectl"
  cloud_provider: "azure"
```

### Example 3: Azure DevOps Integration

```yaml
workspaceName: "azure-devops-workspace"
workspaceOwnerEmail: "admin@company.com"
defaultLocation: "location-01"
defaultLOD: "basic"

cloudConfig:
  azure:
    subscriptionId: "your-subscription-id"
    tenantId: "your-tenant-id"
    clientId: "your-client-id"
    clientSecret: "your-client-secret"
    
    devops:
      organizationUrl: "https://dev.azure.com/your-organization"
      # Use Kubernetes secret for PAT (recommended)
      patSecretName: "azure-devops-pat"
      
      codeCollections:
        - repositoryUrl: "https://dev.azure.com/your-org/your-project/_git/your-repo"
          branch: "main"

codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
    branch: "main"

custom:
  azure_devops:
    environment: "production"
    organization: "your-organization"
    critical_project: "your-main-project"
    repository_size_threshold: "1000"
    pipeline_type: "infrastructure"
    monitoring_level: "detailed"
    team: "platform-engineering"
```

More examples are available in the [examples directory](examples/).

## Documentation

### ConfigProvided Overrides

The configProvided overrides feature allows you to customize template variables in runbooks and SLIs without modifying the original templates. This is particularly useful for:

- Environment-specific configurations
- Testing different parameter values  
- Customizing default values for your organization

**Quick Example:**

```yaml
# workspaceInfo.yaml
overrides:
  codebundles:
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "azure-aks-triage"
      type: "runbook"
      configProvided:
        TIME_PERIOD_MINUTES: "120"
        DEBUG_MODE: "true"
```

For comprehensive documentation, see: [ConfigProvided Overrides Guide](docs/configProvided-overrides.md)

### Additional Resources

- 📖 **[Full Documentation](https://docs.runwhen.com/public/v/runwhen-local/)**: Complete user guide and API reference
- 🎯 **[Generation Rules Guide](generation-rules-guide.md)**: How to create custom generation rules
- 💡 **[Examples](examples/)**: Sample configurations for different scenarios
- 🏗️ **[Architecture Overview](docs/Architecture.md)**: Technical architecture and design
- 🛠️ **[Development Guide](docs/Development.md)**: Development setup and contribution guidelines
- 📚 **[Complete Documentation](docs/)**: All documentation in the docs directory

## Getting Started

1. Configure your `workspaceInfo.yaml` with cloud credentials and discovery settings
2. (Optional) Add configProvided overrides for custom template variables
3. Run the workspace builder to generate your workspace configuration
4. Deploy the generated runbooks and SLIs to your RunWhen platform

## Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- How to submit bug reports and feature requests
- Development setup and coding standards  
- Pull request process
- Code of conduct

### Quick Development Setup

#### Option 1: Using Dev Container (Recommended)

The easiest way to get started with development is using the provided dev container:

```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/runwhen-local.git
cd runwhen-local

# Open in VS Code with dev container
code .
# VS Code will prompt to "Reopen in Container"
```

The dev container includes:
- Python 3.12 with all dependencies
- Pre-configured VS Code extensions (Robot Framework, Python, Pylint, Black formatter)
- CLI tools: kubectl, aws, gcloud, terraform, helm, yq
- Docker-in-Docker for building and testing
- All necessary development tools pre-installed

#### Option 2: Local Development

```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/runwhen-local.git
cd runwhen-local

# Set up development environment
cd src
pip install poetry
poetry install
poetry shell

# Run tests
python tests.py

# Start developing!
```

### Community Contributions

- 🐛 **[Report bugs or share feedback](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local&projects=&template=runwhen-local-feedback.md&title=%5Brunwhen-local-feedback%5D+)**
- 💡 **[Contribute an awesome troubleshooting command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local%2Cawesome-command-contribution&projects=&template=awesome-command-contribution.yaml&title=%5Bawesome-command-contribution%5D+)**
- 🙋 **[Request a new command](https://github.com/runwhen-contrib/runwhen-local/issues/new?assignees=stewartshea&labels=runwhen-local%2Cnew-command-request&projects=&template=commands-wanted.yaml&title=%5Bnew-command-request%5D+)**
- 💬 **[GitHub Discussions](https://github.com/orgs/runwhen-contrib/discussions)**

## Support

- 📚 **[Documentation](https://docs.runwhen.com/public/v/runwhen-local/)**: Complete user guide and API reference
- 🐛 **[GitHub Issues](https://github.com/runwhen-contrib/runwhen-local/issues)**: Bug reports and feature requests
- 💬 **[Slack Community](https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A)**: Join our community discussions
- 🎮 **[Discord](https://discord.com/invite/Ut7Ws4rm8Q)**: Alternative community chat
- 🎥 **[YouTube Channel](https://www.youtube.com/@whatdoirunwhen)**: Demo videos and tutorials
- 🌐 **[Live Demo](https://runwhen-local.sandbox.runwhen.com/)**: Try it out in our sandbox environment

When reporting issues, please include:
- RunWhen Local version
- Operating system and version
- Cloud platform details (Kubernetes version, cloud provider, etc.)
- Complete error messages and logs
- Steps to reproduce the issue

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by the RunWhen community** 
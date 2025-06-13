# Azure DevOps Integration Examples

This directory contains examples for integrating RunWhen Local with Azure DevOps, including configuration examples and generation rules for creating SLXs (Service Level eXpectations) and runbooks.

## Files Overview

- **`workspaceInfo-example.yaml`** - Complete workspace configuration example showing all authentication methods
- **`azure-devops-examples.yaml`** - Comprehensive generation rules examples for Azure DevOps resources
- **`create-pat-secret.sh`** - Helper script to create Kubernetes secret for PAT authentication
- **`README.md`** - This documentation file

## Key Features

- **Hierarchical Resource Organization**: Resources are organized in a clear hierarchy: `organization/project/resource`
- **Organization-Aware**: All resources include organization context for multi-org environments
- **Multiple Authentication Methods**: Support for PAT, Service Principal, and DefaultAzureCredential
- **Comprehensive Resource Discovery**: Indexes projects, repositories, pipelines, and releases
- **Flexible Generation Rules**: Create SLXs and runbooks based on naming patterns, resource properties, and custom variables

## Authentication Methods

The Azure DevOps indexer supports four authentication methods, tried in order of preference:

### 1. Personal Access Token (PAT) - Recommended for Development

**Best for:** Local development, testing, individual developer use

#### Option 1a: Kubernetes Secret (Recommended for Production PAT Usage)

```yaml
cloudConfig:
  azure:
    devops:
      organizationUrl: "https://dev.azure.com/your-organization"
      patSecretName: "azure-devops-pat"
```

**Create the Kubernetes secret:**
```bash
kubectl create secret generic azure-devops-pat \
  --from-literal=personalAccessToken=your-personal-access-token \
  --namespace=your-namespace
```

**Or use the helper script:**
```bash
./create-pat-secret.sh your-personal-access-token azure-devops-pat your-namespace
```

**Supported secret keys:** `personalAccessToken`, `pat`, `token`, or `access_token`

#### Option 1b: Direct Configuration (Development Only)

```yaml
cloudConfig:
  azure:
    devops:
      organizationUrl: "https://dev.azure.com/your-organization"
      personalAccessToken: "your-personal-access-token"
```

#### Option 1c: Environment Variable

```bash
export AZURE_DEVOPS_PAT="your-personal-access-token"
```

**How to create a PAT:**
1. Go to Azure DevOps → User Settings → Personal Access Tokens
2. Create a new token with appropriate scopes:
   - **Project and team**: Read
   - **Code**: Read
   - **Build**: Read
   - **Release**: Read

### 2. Service Principal - Recommended for Production

**Best for:** Production environments, CI/CD pipelines, enterprise deployments

```yaml
cloudConfig:
  azure:
    tenantId: "your-tenant-id"
    clientId: "your-client-id"
    clientSecret: "your-client-secret"
    devops:
      organizationUrl: "https://dev.azure.com/your-organization"
```

**Environment Variables Alternative:**
```bash
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

**Service Principal Setup:**
1. Register an application in Azure AD
2. Grant the service principal appropriate permissions in Azure DevOps
3. Add the service principal to your Azure DevOps organization

### 3. DefaultAzureCredential - Automatic Fallback

**Best for:** Azure-hosted environments, Azure CLI users

No additional configuration needed. Uses:
- Azure CLI login (`az login`)
- Managed Identity (when running in Azure)
- Environment variables
- Visual Studio authentication
- Azure PowerShell authentication

## Indexed Resources and Hierarchical Structure

The Azure DevOps indexer discovers and indexes resources with a clear hierarchical structure:

### Resource Hierarchy

All resources follow the pattern: `{organization}/{project}/{resource}` (or `{organization}/{project}` for projects, or `{organization}` for organizations)

**Examples:**
- Organization: `your-organization`
- Project: `your-organization/your-project`
- Repository: `your-organization/your-project/your-repository`
- Pipeline: `your-organization/your-project/your-pipeline`
- Release: `your-organization/your-project/your-release`

### Organizations
- **Properties:** name, url, **organization**
- **Qualified Name:** `{organization_name}`
- **Relationships:** Contains projects
- **Use Case:** Organization-level health monitoring and governance

### Projects
- **Properties:** id, name, description, state, revision, url, visibility, **organization**
- **Qualified Name:** `{organization}/{project_name}`
- **Relationships:** Contains repositories, pipelines, and releases

### Repositories
- **Properties:** id, name, url, default_branch, size, remote_url, **organization**
- **Qualified Name:** `{organization}/{project_name}/{repository_name}`
- **Relationships:** Belongs to a project

### Pipelines
- **Properties:** id, name, url, revision, **organization**
- **Qualified Name:** `{organization}/{project_name}/{pipeline_name}`
- **Relationships:** Belongs to a project

### Releases
- **Properties:** id, name, url, revision, **organization**
- **Qualified Name:** `{organization}/{project_name}/{release_name}`
- **Relationships:** Belongs to a project

### Organization Attribute

All resources now include an `organization` attribute that contains the organization name extracted from the `organizationUrl`. This enables:

- **Multi-Organization Support**: Distinguish resources across different Azure DevOps organizations
- **Organization-Specific Rules**: Create generation rules that target specific organizations
- **Enhanced Templates**: Templates can reference the organization context

**Example Resource with Organization:**
```yaml
your-organization/your-project/your-repository: !Resource
  id: abc123ef-1234-5678-9abc-def123456789
  name: your-repository
  organization: your-organization
  project: !Resource { ... }
  qualified_name: your-organization/your-project/your-repository
  remote_url: https://your-organization@dev.azure.com/your-organization/your-project/_git/your-repository
  size: 188
  url: https://dev.azure.com/your-organization/12345678-1234-5678-9abc-def123456789/_apis/git/repositories/abc123ef-1234-5678-9abc-def123456789
```

## Generation Rules Examples

The `azure-devops-examples.yaml` file contains 13 comprehensive examples organized by category:

### Organization-Based Rules
- Organization-level health monitoring
- Multi-organization governance

### Project-Based Rules
- Production projects (name contains "prod")
- Private projects (visibility = "private")
- Projects using custom variables

### Repository-Based Rules
- Repositories with main branch protection
- Large repositories (using size thresholds)
- Service repositories (specific naming patterns)

### Pipeline-Based Rules
- Production deployment pipelines
- Infrastructure pipelines
- CI/CD pipelines

### Release-Based Rules
- Production release definitions
- Multi-stage releases

### Complex Matching Examples
- Critical resources using multiple conditions
- All resources in specific projects
- Organization-specific rules

## Custom Variables

You can use custom variables in your `workspaceInfo.yaml` to create flexible generation rules. It's recommended to organize them under a resource-specific namespace:

```yaml
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

These variables can then be referenced in generation rules:

```yaml
matchRules:
  - type: custom-variable
    path: custom.azure_devops.environment
    pattern: "production"
    mode: exact
```

## Match Rule Types

### Pattern Matching
```yaml
matchRules:
  - type: pattern
    pattern: "prod"
    properties: ["name"]
    mode: substring  # or "exact"
```

### Organization-Based Matching
```yaml
matchRules:
  - type: pattern
    pattern: "your-organization"
    properties: ["organization"]
    mode: exact
```
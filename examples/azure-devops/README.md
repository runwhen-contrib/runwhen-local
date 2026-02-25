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

## Runtime Secrets (Generated SLX/Runbook Authentication)

The sections above describe how the **indexer** authenticates to Azure DevOps during discovery. This section describes how the **generated SLXs and runbooks** reference credentials at runtime via `secretsProvided`.

The `azure-devops-auth.yaml` template resolves secrets in the following priority order. The first matching condition wins.

### Auto-Detected Auth (from indexer)

When the indexer authenticates, it stamps an `auth_type` on every discovered resource. Generated templates use this to automatically select the right secret reference — no manual configuration needed.

| `auth_type` | Indexer used | Generated `secretsProvided` |
|---|---|---|
| `ado_pat_secret` | `patSecretName` in config | `k8s:file@secret/<secret-name>:token` |
| `ado_service_principal` | Service principal credentials | `azure:sp@cli` |
| `ado_managed_identity` | DefaultAzureCredential / managed identity | `azure:identity@cli` |
| `ado_pat` | Direct PAT or env var | Falls through to `custom`/`secrets` options below |

### Custom Variables (passthrough)

When auto-detection doesn't apply (e.g., PAT was provided directly in config), use `custom` variables to tell generated runbooks where to find credentials at runtime. Values are passed through as-is to `workspaceKey`.

#### `custom.ado_pat_secret_name`

Reference a PAT stored in a Kubernetes secret:

```yaml
custom:
  ado_pat_secret_name: "k8s:file@secret/ado-pat:token"
```

Generates:
```yaml
secretsProvided:
  - name: ADO_PAT
    workspaceKey: k8s:file@secret/ado-pat:token
```

#### `custom.azure_devops_credentials_key`

Generic ADO credential reference (any workspace key format):

```yaml
custom:
  azure_devops_credentials_key: "azure:sp@cli"
```

Generates:
```yaml
secretsProvided:
  - name: azure_credentials
    workspaceKey: azure:sp@cli
```

#### `custom.azure_credentials_key`

Fallback to the generic Azure credentials key (shared with other Azure code bundles):

```yaml
custom:
  azure_credentials_key: "azure:sp@cli"
```

### Secrets Config (passthrough)

Alternatively, define secrets in the `secrets` section of `workspaceInfo.yaml`. These are also passed through as-is.

#### `secrets.azure_devops_pat`

```yaml
secrets:
  azure_devops_pat: "k8s:file@secret/ado-pat:token"
```

#### `secrets.azure_service_principal`

```yaml
secrets:
  azure_service_principal: "azure:sp@cli"
```

### Fallback

If none of the above are configured, the generated output will contain:

```yaml
secretsProvided:
  - name: azure_credentials
    workspaceKey: AUTH DETAILS NOT FOUND
```

### Common Workspace Key Patterns

| Pattern | Description |
|---|---|
| `k8s:file@secret/<secret-name>:<key>` | Read a key from a Kubernetes secret |
| `azure:sp@cli` | Azure service principal via CLI |
| `azure:identity@cli` | Azure managed identity via CLI |

### Examples

**PAT in a Kubernetes secret (most common):**
```yaml
# Create the secret
# kubectl create secret generic ado-pat --from-literal=token=your-pat -n your-namespace

custom:
  ado_pat_secret_name: "k8s:file@secret/ado-pat:token"
```

**Service principal (shared with Azure cloud resources):**
```yaml
custom:
  azure_devops_credentials_key: "azure:sp@cli"
```

**Separate PAT for ADO, SP for Azure cloud:**
```yaml
custom:
  ado_pat_secret_name: "k8s:file@secret/ado-pat:token"
  azure_credentials_key: "azure:sp@cli"
```

## Discovery Scope

By default the indexer discovers **every project** in the organization and **all resource types** (repositories, pipelines, releases) inside each project. Use the `scope` block under `azure.devops` to narrow discovery so only the projects and resource types you care about are indexed.

Omit the `scope` block entirely for full org-wide discovery.

### Project Filtering

Use `includeProjects` (allowlist) and `excludeProjects` (denylist). Both accept exact names **and** regex patterns (matched with `re.fullmatch`). When both are set, the include list is applied first, then excludes are removed from the result.

```yaml
cloudConfig:
  azure:
    devops:
      organizationUrl: "https://dev.azure.com/your-organization"
      scope:
        includeProjects:
          - "my-team-project"         # exact name
          - "platform-.*"             # regex: anything starting with "platform-"
        excludeProjects:
          - "platform-sandbox"        # remove this one even though it matched the include pattern
```

### Resource Type Toggles

Control which child resource types are discovered inside each project. All default to `true`.

```yaml
scope:
  resourceTypes:
    repositories: true
    pipelines: true
    releases: false               # skip release definitions entirely
```

### Per-Project Overrides

Override the global `resourceTypes` setting for specific projects. For example, discover only pipelines in an infrastructure project:

```yaml
scope:
  includeProjects:
    - "app-project"
    - "infra-project"
  resourceTypes:
    repositories: true
    pipelines: true
    releases: true
  projectOverrides:
    - projects: ["infra-project"]
      resourceTypes:
        repositories: false
        pipelines: true
        releases: false
```

### Full Scope Example

```yaml
cloudConfig:
  azure:
    devops:
      organizationUrl: "https://dev.azure.com/your-organization"
      patSecretName: "azure-devops-pat"
      scope:
        includeProjects:
          - "team-alpha-.*"
          - "shared-services"
        excludeProjects:
          - ".*-sandbox"
        resourceTypes:
          repositories: true
          pipelines: true
          releases: false
        projectOverrides:
          - projects: ["shared-services"]
            resourceTypes:
              repositories: true
              pipelines: false
              releases: false
```

In this example:
- Only projects whose name fully matches `team-alpha-.*` or equals `shared-services` are discovered.
- Any matching project whose name ends in `-sandbox` is excluded.
- Repositories and pipelines are indexed for most projects; releases are skipped globally.
- For `shared-services`, only repositories are indexed (pipelines and releases are both disabled by the override).

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
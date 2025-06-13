# Azure DevOps Integration Examples

This directory contains examples for integrating RunWhen Local with Azure DevOps, including configuration examples and generation rules for creating SLXs (Service Level eXpectations) and runbooks.

## Files Overview

- **`workspaceInfo-example.yaml`** - Complete workspace configuration example showing all authentication methods
- **`azure-devops-examples.yaml`** - Comprehensive generation rules examples for Azure DevOps resources
- **`create-pat-secret.sh`** - Helper script to create Kubernetes secret for PAT authentication
- **`README.md`** - This documentation file

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

### 4. DefaultAzureCredential - Automatic Fallback

**Best for:** Azure-hosted environments, Azure CLI users

No additional configuration needed. Uses:
- Azure CLI login (`az login`)
- Managed Identity (when running in Azure)
- Environment variables
- Visual Studio authentication
- Azure PowerShell authentication

## Indexed Resources

The Azure DevOps indexer discovers and indexes the following resource types:

### Projects
- **Properties:** id, name, description, state, revision, url, visibility
- **Relationships:** Contains repositories, pipelines, and releases

### Repositories
- **Properties:** id, name, url, default_branch, size, remote_url
- **Relationships:** Belongs to a project

### Pipelines
- **Properties:** id, name, url, revision
- **Relationships:** Belongs to a project

### Releases
- **Properties:** id, name, url, revision
- **Relationships:** Belongs to a project

## Generation Rules Examples

The `azure-devops-examples.yaml` file contains 13 comprehensive examples organized by category:

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

### Custom Variable Matching
```yaml
matchRules:
  - type: custom-variable
    path: custom.azure_devops.environment
    pattern: "production"
    mode: exact
```

### Logical Operators
```yaml
# AND - All conditions must match
matchRules:
  - type: and
    matches:
      - type: pattern
        pattern: "prod"
        properties: ["name"]
        mode: substring
      - type: pattern
        pattern: "deploy"
        properties: ["name"]
        mode: substring

# OR - At least one condition must match
matchRules:
  - type: or
    matches:
      - type: pattern
        pattern: "ci"
        properties: ["name"]
        mode: substring
      - type: pattern
        pattern: "build"
        properties: ["name"]
        mode: substring
```

## Qualifiers

Qualifiers determine how resources are named in the generated SLXs:

- **`["name"]`** - Use the resource name
- **`["project.name", "name"]`** - Use project name and resource name
- **`["resource"]`** - Use a generic resource identifier

## Level of Detail

- **`basic`** - Minimal information for lightweight monitoring
- **`detailed`** - Comprehensive information for thorough analysis

## Output Items

- **`slx`** - Service Level eXpectation for monitoring
- **`runbook`** - Troubleshooting procedures and automation
- **`sli`** - Service Level Indicator (if supported by templates)

## Getting Started

1. **Copy the example configuration:**
   ```bash
   cp examples/azure-devops/workspaceInfo-example.yaml workspaceInfo.yaml
   ```

2. **Update the configuration:**
   - Replace placeholder values with your actual Azure DevOps organization details
   - Choose your preferred authentication method
   - Customize the custom variables section

3. **Copy the generation rules:**
   ```bash
   cp examples/azure-devops/azure-devops-examples.yaml generation-rules.yaml
   ```

4. **Customize the generation rules:**
   - Modify match patterns to fit your naming conventions
   - Adjust qualifiers and level of detail as needed
   - Add or remove rules based on your requirements

5. **Run RunWhen Local:**
   ```bash
   runwhen-local build --workspace-info workspaceInfo.yaml
   ```

## Troubleshooting

### Authentication Issues

**Problem:** "Failed to authenticate to Azure DevOps"
**Solutions:**
1. Verify your PAT has the correct scopes and is not expired
2. If using Kubernetes secret for PAT, ensure the secret exists and has the correct key name
3. Check that service principal has access to Azure DevOps organization
4. Ensure Azure CLI is logged in for DefaultAzureCredential

### No Resources Found

**Problem:** "No Azure DevOps resources indexed"
**Solutions:**
1. Verify the organization URL is correct
2. Check that the authenticated user/service principal has access to projects
3. Ensure the Azure DevOps organization exists and is accessible

### Generation Rules Not Matching

**Problem:** "No SLXs generated despite having resources"
**Solutions:**
1. Check that resource properties match your patterns
2. Verify custom variables are correctly defined
3. Test with simpler match rules first

## Best Practices

1. **Use Service Principal for Production:** More secure and auditable than PATs
2. **Use Kubernetes Secrets for PATs:** If using PATs in production, store them in Kubernetes secrets rather than config files
3. **Scope PATs Appropriately:** Only grant necessary permissions
4. **Use Custom Variables:** Make generation rules flexible and reusable
5. **Start Simple:** Begin with basic match rules and add complexity gradually
6. **Test Thoroughly:** Validate generation rules in development before production
7. **Monitor Resource Changes:** Update generation rules when Azure DevOps structure changes

## Support

For additional help:
- Check the main RunWhen Local documentation
- Review Azure DevOps API documentation
- Consult Azure AD authentication guides
- Open issues in the RunWhen Local repository 
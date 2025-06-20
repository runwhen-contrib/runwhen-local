# RunWhen Local - Workspace Builder

## Features

- **Multi-Cloud Discovery**: Automatically discover and index resources from Kubernetes, Azure, AWS, and GCP
- **Code Collections**: Leverage community-maintained runbooks and SLIs from external repositories
- **Template-Based Generation**: Generate workspace configurations using flexible Jinja2 templates
- **Level of Detail Control**: Configure different levels of detail for resource discovery and SLX generation
- **ConfigProvided Overrides**: Override template variables in runbooks and SLIs without modifying original templates
- **Map Customization**: Apply custom grouping and relationship rules to organize your workspace
- **Multiple Output Formats**: Generate runbooks, SLIs, workflows, and workspace configurations

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

## Getting Started

1. Configure your `workspaceInfo.yaml` with cloud credentials and discovery settings
2. (Optional) Add configProvided overrides for custom template variables
3. Run the workspace builder to generate your workspace configuration
4. Deploy the generated runbooks and SLIs to your RunWhen platform

## Support

For questions and support, please refer to the RunWhen documentation or community resources. 
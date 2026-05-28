# ConfigProvided Overrides

The configProvided overrides feature allows you to broadly override template variables in runbooks or SLI codebundles without modifying the original templates. This is useful for customizing default values, environment-specific configurations, or testing different parameter values.

## Overview

The override system works by matching codebundles based on repository URL, codebundle directory name, and type (sli/runbook), then applying the specified variable overrides to the generated YAML files.

## Configuration Structure

Add the `overrides` section to your `workspaceInfo.yaml` file:

```yaml
overrides:
  codebundles:
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "azure-aks-triage"
      type: "sli"
      configProvided:
        TIME_PERIOD_MINUTES: "custom-sli-value"
        AZURE_RESOURCE_SUBSCRIPTION_ID: "custom-subscription-id"
    
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "azure-aks-triage"
      type: "runbook"
      configProvided:
        TIME_PERIOD_MINUTES: "custom-runbook-value"
        AZURE_SUBSCRIPTION_NAME: "custom-subscription-name"
```

## Field Descriptions

### `overrides.codebundles[]`

Each override entry contains the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repoURL` | string | Yes | The exact repository URL where the codebundle is located |
| `codebundleDirectory` | string | Yes | The directory name of the specific codebundle (e.g., "azure-aks-triage") |
| `type` | string | Yes | The type of output to override. Valid values: "sli", "runbook" |
| `configProvided` | object | Yes | Key-value pairs of template variables to override |

### `configProvided`

This is a key-value map where:
- **Key**: The name of the template variable to override (must match the `name` field in the generated `configProvided` section)
- **Value**: The new value to use (will be converted to string in the final YAML)

## How It Works

The override system uses a two-phase approach:

1. **Template-time processing**: During template variable resolution, override values are made available to templates
2. **Post-render processing**: After YAML generation, the system modifies the final `configProvided` section to apply overrides

This dual approach ensures compatibility with existing templates that may have hardcoded values.

## Matching Logic

An override is applied when ALL of the following conditions match:

1. `repoURL` exactly matches the repository URL of the codebundle
2. `codebundleDirectory` exactly matches the codebundle directory name
3. `type` matches the output type being generated (case-insensitive)

## Examples

### Example 1: Basic SLI Override

```yaml
overrides:
  codebundles:
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "azure-aks-triage"
      type: "sli"
      configProvided:
        TIME_PERIOD_MINUTES: "30"
        THRESHOLD_VALUE: "0.95"
```

This will override the `TIME_PERIOD_MINUTES` and `THRESHOLD_VALUE` variables for SLI outputs from the `azure-aks-triage` codebundle.

### Example 2: Multiple Codebundle Overrides

```yaml
overrides:
  codebundles:
    # Azure AKS overrides
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "azure-aks-triage"
      type: "runbook"
      configProvided:
        TIME_PERIOD_MINUTES: "120"
        DEBUG_MODE: "true"
    
    # Kubernetes deployment overrides
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "k8s-deployment-healthcheck"
      type: "sli"
      configProvided:
        CHECK_INTERVAL: "60"
        NAMESPACE: "production"
```

### Example 3: Environment-Specific Configuration

```yaml
overrides:
  codebundles:
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "azure-aks-triage"
      type: "runbook"
      configProvided:
        ENVIRONMENT: "production"
        MAX_RETRIES: "5"
        TIMEOUT_SECONDS: "300"
        ALERT_WEBHOOK: "https://alerts.company.com/webhook"
```

## Generated Output

When overrides are applied, the generated YAML will show the overridden values in the `configProvided` section:

**Before override:**
```yaml
configProvided:
- name: TIME_PERIOD_MINUTES
  value: "60"
- name: AZURE_SUBSCRIPTION_NAME
  value: "default-subscription"
```

**After override:**
```yaml
configProvided:
- name: TIME_PERIOD_MINUTES
  value: "custom-runbook-value"
- name: AZURE_SUBSCRIPTION_NAME
  value: "custom-subscription-name"
```

## Logging

When overrides are applied, you'll see log messages indicating the matches and applications:

```
[INFO] enrichers.generation_rules: MATCH FOUND! Applying overrides for azure-aks-triage/sli
[INFO] enrichers.generation_rules: Applied configProvided override: TIME_PERIOD_MINUTES = custom-sli-value
[INFO] renderers.render_output_items: POST-RENDER MATCH FOUND! Applying overrides for azure-aks-triage/runbook
[INFO] renderers.render_output_items: POST-RENDER Applied configProvided override: TIME_PERIOD_MINUTES = custom-runbook-value (was: 60)
```

## Best Practices

1. **Use descriptive values**: Make override values clearly identifiable for debugging
2. **Document your overrides**: Add comments in your `workspaceInfo.yaml` to explain why overrides are needed
3. **Test thoroughly**: Verify that overridden values work correctly in your environment
4. **Version control**: Keep your `workspaceInfo.yaml` in version control to track override changes

## Troubleshooting

### Override Not Applied

If your override isn't being applied, check:

1. **Exact matching**: Ensure `repoURL`, `codebundleDirectory`, and `type` match exactly (case-sensitive for repo and directory)
2. **Variable names**: Verify the variable name in `configProvided` matches the `name` field in the generated output
3. **Logs**: Look for "MATCH FOUND" messages in the workspace builder logs
4. **YAML syntax**: Ensure your `workspaceInfo.yaml` is valid YAML

### Debug Logging

Enable debug logging to see detailed override processing:

```bash
DEBUG_LOGGING=true ./run.sh
```

Look for log messages containing:
- "Checking overrides for"
- "Comparing with override"
- "MATCH FOUND"
- "Applied configProvided override"

## Limitations

1. **Supported types**: Currently supports "sli" and "runbook" types only
2. **String values**: All override values are converted to strings in the final YAML
3. **Existing variables**: Can only override variables that already exist in the template's `configProvided` section
4. **Template compatibility**: Works best with templates that use the standard `configProvided` structure

## Future Enhancements

Planned improvements include:
- Support for additional output types (taskset, workflow)
- Global overrides that apply to all codebundles
- Conditional overrides based on resource properties
- Override validation and schema checking 
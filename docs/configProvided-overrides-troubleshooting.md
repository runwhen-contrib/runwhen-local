# ConfigProvided Overrides - Troubleshooting Guide

This guide helps you troubleshoot common issues with the configProvided overrides feature.

## Common Issues and Solutions

### 1. Override Not Being Applied

**Symptoms:**
- Generated YAML still shows original values
- No "MATCH FOUND" messages in logs

**Solutions:**

#### Check Exact Matching
Ensure all matching fields are exactly correct:

```yaml
# ❌ Wrong - case mismatch
- repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
  codebundleDirectory: "Azure-AKS-Triage"  # Wrong case
  type: "SLI"  # Wrong case

# ✅ Correct - exact match
- repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
  codebundleDirectory: "azure-aks-triage"  # Exact match
  type: "sli"  # Lowercase
```

#### Verify Repository URL
Check the exact repository URL in the logs:

```bash
# Look for this in logs:
[INFO] enrichers.generation_rules: Checking overrides for: repo_url='https://github.com/runwhen-contrib/rw-cli-codecollection.git'
```

#### Verify Codebundle Directory
Check the exact codebundle directory name in the logs:

```bash
# Look for this in logs:
[INFO] enrichers.generation_rules: Checking overrides for: codebundle_dir='azure-aks-triage'
```

### 2. Variable Name Mismatch

**Symptoms:**
- Override matches but specific variables aren't changed
- "Applied configProvided override" messages missing for some variables

**Solutions:**

#### Check Generated Template First
Look at the generated YAML to see the exact variable names:

```yaml
# Generated YAML shows:
configProvided:
- name: TIME_PERIOD_MINUTES  # This is the exact name to use
  value: "60"
- name: AZURE_SUBSCRIPTION_ID  # Not AZURE_RESOURCE_SUBSCRIPTION_ID
  value: "default"
```

#### Use Exact Variable Names
```yaml
# ❌ Wrong - variable name doesn't exist in template
configProvided:
  TIMEOUT: "30"  # Template uses TIMEOUT_SECONDS

# ✅ Correct - matches template exactly
configProvided:
  TIMEOUT_SECONDS: "30"
```

### 3. YAML Syntax Errors

**Symptoms:**
- Workspace builder fails to start
- YAML parsing errors in logs

**Solutions:**

#### Validate YAML Syntax
```bash
# Test your workspaceInfo.yaml
python3 -c "import yaml; yaml.safe_load(open('workspaceInfo.yaml'))"
```

#### Common YAML Issues
```yaml
# ❌ Wrong - missing quotes for special characters
configProvided:
  MESSAGE: Hello: World  # Colon breaks YAML

# ✅ Correct - quoted values
configProvided:
  MESSAGE: "Hello: World"

# ❌ Wrong - inconsistent indentation
overrides:
  codebundles:
    - repoURL: "..."
     type: "sli"  # Wrong indentation

# ✅ Correct - consistent indentation
overrides:
  codebundles:
    - repoURL: "..."
      type: "sli"  # Proper indentation
```

### 4. Type Mismatch

**Symptoms:**
- Override not applied to expected output type
- Logs show different type than expected

**Solutions:**

#### Check Supported Types
Currently supported types:
- `sli` - ServiceLevelIndicator
- `runbook` - Runbook (including TaskSet templates)

```yaml
# ❌ Wrong - unsupported type
type: "taskset"  # Not supported yet

# ✅ Correct - use runbook for TaskSet templates  
type: "runbook"  # TaskSet templates use runbook type
```

#### Verify Generated File Type
Check the `kind` field in generated YAML:

```yaml
# Generated file shows:
apiVersion: runwhen.com/v1
kind: Runbook  # Use type: "runbook" in override
```

## Debug Logging

Enable debug logging to see detailed override processing:

```bash
# Enable debug logging
DEBUG_LOGGING=true task run-rwl-discovery

# Or with direct docker run
DEBUG_LOGGING=true docker run ... runwhen-local:test
```

### Key Log Messages to Look For

#### 1. Override Processing Start
```
[INFO] enrichers.generation_rules: Checking overrides for: repo_url='...', codebundle_dir='...', type='...'
```

#### 2. Override Comparison
```
[DEBUG] enrichers.generation_rules: Comparing with override: repo_url='...', codebundle_dir='...', type='...'
```

#### 3. Successful Match
```
[INFO] enrichers.generation_rules: MATCH FOUND! Applying overrides for azure-aks-triage/sli
```

#### 4. Variable Application
```
[INFO] enrichers.generation_rules: Applied configProvided override: TIME_PERIOD_MINUTES = custom-value
```

#### 5. Post-Render Processing
```
[INFO] renderers.render_output_items: POST-RENDER MATCH FOUND! Applying overrides for azure-aks-triage/runbook
[INFO] renderers.render_output_items: POST-RENDER Applied configProvided override: TIME_PERIOD_MINUTES = custom-value (was: 60)
```

## Validation Checklist

Before troubleshooting, verify:

- [ ] YAML syntax is valid
- [ ] `repoURL` exactly matches the repository URL
- [ ] `codebundleDirectory` exactly matches the directory name
- [ ] `type` is lowercase and supported ("sli" or "runbook")
- [ ] Variable names in `configProvided` match the generated template exactly
- [ ] Values are properly quoted if they contain special characters
- [ ] Indentation is consistent throughout the YAML

## Getting Help

If you're still having issues:

1. **Enable debug logging** and capture the full output
2. **Check the generated YAML** to see what variables are available
3. **Verify your workspaceInfo.yaml** syntax with a YAML validator
4. **Compare with working examples** in the documentation

## Common Working Examples

### Basic SLI Override
```yaml
overrides:
  codebundles:
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "azure-aks-triage"
      type: "sli"
      configProvided:
        TIME_PERIOD_MINUTES: "30"
```

### Basic Runbook Override
```yaml
overrides:
  codebundles:
    - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
      codebundleDirectory: "azure-aks-triage"
      type: "runbook"
      configProvided:
        TIME_PERIOD_MINUTES: "120"
        AZURE_SUBSCRIPTION_NAME: "Production"
```

These examples are known to work with the azure-aks-triage codebundle and can be used as a starting point for your own overrides. 
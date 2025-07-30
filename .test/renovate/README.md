# Renovate Testing Tools

This directory contains tools for testing and validating Renovate configurations before deploying them to production.

## Available Tools

### Taskfile Commands

The `.test/Taskfile.yml` provides several commands for testing Renovate configurations:

```bash
# Run all validation tests
task all

# Individual validation tasks
task validate        # Validate JSON syntax and structure
task test-regex      # Test regex patterns in configuration
task validate-schema # Validate against JSON schema

# Dry run testing (requires GitHub token)
export GITHUB_TOKEN=your_token_here
task dry-run

# Print resolved configuration
task print-config

# Show help
task help
```

### Installed Tools in DevContainer

The devcontainer includes the following testing tools:

- **Renovate CLI**: `renovate` - Full Renovate CLI for dry-run testing
- **AJV CLI**: `ajv` - JSON Schema validator
- **Python regex**: `regex` module for testing regex patterns
- **Task**: `task` - Task runner for automation

## Testing Workflow

### 1. Basic Validation
```bash
# Validate JSON syntax
task validate

# Test regex patterns
task test-regex
```

### 2. Schema Validation
```bash
# Validate against Renovate JSON schema
task validate-schema
```

### 3. Dry Run Testing
```bash
# Set GitHub token (required for dry-run)
export GITHUB_TOKEN=your_github_token_here

# Run dry-run
task dry-run
```

### 4. Full Test Suite
```bash
# Run all tests
task all
```

## Configuration Files

- `renovate.json` - Main Renovate configuration
- `.test/Taskfile.yml` - Testing automation tasks

## Regex Pattern Testing

The testing tools validate the following Dockerfile patterns:

- `ENV TERRAFORM_VERSION=1.5.0`
- `FROM node:18-alpine`
- `FROM python:3.11-slim`
- `POETRY_VERSION=2.1.1`
- `ENV GCLOUD_CLI_VERSION="400.0.0"`

## Troubleshooting

### GitHub Token Issues
If you get authentication errors during dry-run:
```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_your_token_here

# Verify token is set
echo $GITHUB_TOKEN
```

### Schema Validation Warnings
Schema validation may show warnings for newer Renovate features. This is normal and doesn't indicate a configuration error.

### Regex Pattern Issues
If regex patterns fail validation:
1. Check the pattern syntax in `renovate.json`
2. Verify named capture groups are properly formatted
3. Test patterns manually with the Python regex module

## Best Practices

1. **Always test locally** before pushing to production
2. **Use dry-run mode** to see what changes Renovate would make
3. **Validate regex patterns** to ensure they match expected formats
4. **Check JSON syntax** to avoid configuration errors
5. **Test with real data** when possible

## Integration with CI/CD

You can integrate these tests into your CI/CD pipeline:

```yaml
- name: Validate Renovate Config
  run: |
    cd .test
    task validate
    task test-regex
    task validate-schema
```

## Contributing

When adding new regex patterns or configuration options:

1. Update the test cases in `Taskfile.yml`
2. Add validation for new patterns
3. Test with real Dockerfile examples
4. Update this documentation 
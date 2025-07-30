# Testing Tools

This directory contains testing tools for various components of the runwhen-local project.

## Available Testing Suites

### [Renovate Testing](./renovate/)
Testing tools for Renovate configuration validation and dry-run testing.

**Quick Start:**
```bash
cd .test/renovate
task help
task validate
```

**Features:**
- JSON syntax validation
- Regex pattern testing
- Schema validation
- Dry-run testing (with GitHub token)

See [renovate/README.md](./renovate/README.md) for detailed documentation.

## Directory Structure

```
.test/
├── README.md           # This file
├── renovate/           # Renovate testing tools
│   ├── README.md       # Renovate testing documentation
│   └── Taskfile.yml    # Renovate testing tasks
├── aws/                # AWS testing tools
├── azure/              # Azure testing tools
├── gcp/                # GCP testing tools
└── k8s/                # Kubernetes testing tools
```

## Contributing

When adding new testing tools:

1. Create a new subdirectory for your testing suite
2. Include a `Taskfile.yml` for automation
3. Add a `README.md` with documentation
4. Update this main README to reference your new testing suite 
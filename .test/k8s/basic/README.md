# Basic K8s Tests

This directory contains basic Kubernetes tests for RunWhen Local.

## Test Overview

- **ci-test-1**: Basic K8s test with basic LOD (Level of Detail)
- **ci-test-2**: K8s test with detailed LOD for specific namespaces  
- **ci-test-local-git**: Validates local git functionality with pre-cached repositories

## Local Git Test (`ci-test-local-git`)

The `ci-test-local-git` test specifically validates that RunWhen Local can successfully use pre-cached git repositories when `useLocalGit: true` is configured.

### What it tests:
- Verifies that local git cache directories are properly configured as "safe directories"
- Ensures no "dubious ownership" git errors occur
- Validates that the workspace builder can access pre-cached codecollection repositories
- Confirms that SLX generation works with local git repositories

### How to run locally:
```bash
cd .test/k8s/basic
task ci-test-local-git
```

### Troubleshooting:

If you encounter git ownership errors like:
```
SHA is empty, possible dubious ownership in the repository at /home/runwhen/codecollection-cache/rw-public-codecollection.git
```

This indicates that Git considers the repository to have "dubious ownership". The fix is automatically applied in the entrypoint script by adding the repository as a safe directory:
```bash
git config --global --add safe.directory /path/to/repo
```

### Configuration:

The test uses `workspaceInfo.yaml` with:
```yaml
useLocalGit: true
```

This tells RunWhen Local to use pre-cached git repositories from the container's `CODE_COLLECTION_CACHE_ROOT` directory instead of cloning from remote repositories.

## Running All Tests

To run all tests:
```bash
task ci-test-1
task ci-test-2  
task ci-test-local-git
```

## Cleanup
```
task clean
```
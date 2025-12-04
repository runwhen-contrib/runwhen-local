# File Watching Configuration

When RunWhen Local is configured with `AUTORUN_WORKSPACE_BUILDER_INTERVAL`, it automatically watches for changes to configuration files in the `/shared` directory and triggers workspace discovery when changes are detected. This feature allows for dynamic updates without manual intervention.

## Overview

The file watcher monitors specific files for changes and immediately triggers a new discovery run when modifications are detected, rather than waiting for the next scheduled interval. This provides faster response times to configuration changes while preventing race conditions with script-generated files.

## Configuration Methods

You can configure which files to watch using three methods (in priority order):

### 1. Config File (Recommended)

Create a `/shared/watch-files.conf` file in your working directory:

```bash
# Watch files configuration
# Lines starting with # are ignored (comments)
# Empty lines are ignored

/shared/workspaceInfo.yaml
/shared/uploadInfo.yaml

# Add ConfigMaps or Secrets that should trigger reloads
/shared/my-configmap.yaml
/shared/my-secret.yaml
```

**Example:**
```bash
# In your working directory
cat > shared/watch-files.conf << 'EOF'
# Core configuration files
/shared/workspaceInfo.yaml
/shared/uploadInfo.yaml

# Custom ConfigMaps/Secrets
/shared/database-config.yaml
/shared/api-keys-secret.yaml
EOF
```

### 2. Environment Variable

Set the `RW_WATCH_FILES` environment variable with a colon-separated list of files:

```bash
export RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/uploadInfo.yaml:/shared/my-secret.yaml"
```

**Docker Example:**
```bash
docker run -e RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/my-config.yaml" \
  -v $workdir/shared:/shared \
  runwhen-local:latest
```

**Kubernetes Example:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: runwhen-local
spec:
  template:
    spec:
      containers:
      - name: runwhen-local
        image: runwhen-local:latest
        env:
        - name: RW_WATCH_FILES
          value: "/shared/workspaceInfo.yaml:/shared/uploadInfo.yaml:/shared/my-configmap.yaml"
```

### 3. Default Configuration

If no configuration is provided, the following files are watched by default:

- `/shared/workspaceInfo.yaml`
- `/shared/uploadInfo.yaml`

## Race Condition Prevention

The file watcher is designed to prevent race conditions by **excluding** files that are created or modified by the RunWhen Local script itself. The following files are automatically excluded from watching:

- `kubeconfig` - Created by in-cluster authentication
- `in_cluster_kubeconfig.yaml` - Temporary kubeconfig file
- `db.sqlite3` - Database file

This prevents infinite loops where script-generated files trigger new discovery runs that generate the same files again.

## Best Practices

### Files to Include
✅ **Configuration files** that should trigger reloads:
- `workspaceInfo.yaml` - Main workspace configuration
- `uploadInfo.yaml` - Upload configuration
- ConfigMaps mounted from Kubernetes
- Secrets mounted from Kubernetes
- Custom configuration files

### Files to Exclude
❌ **Script-generated files** that should NOT trigger reloads:
- `kubeconfig` files created by in-cluster auth
- Database files (`db.sqlite3`)
- Output files in `/shared/output/`
- Temporary files

### Example Configurations

**Basic Setup (Default):**
```bash
# No configuration needed - uses defaults
# Watches: workspaceInfo.yaml, uploadInfo.yaml
```

**Kubernetes with ConfigMaps:**
```bash
# shared/watch-files.conf
/shared/workspaceInfo.yaml
/shared/uploadInfo.yaml
/shared/database-config      # ConfigMap
/shared/api-credentials      # Secret
```

**Multi-Environment Setup:**
```bash
# Environment variable approach
export RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/env-config.yaml:/shared/feature-flags.yaml"
```

## Troubleshooting

### Check What Files Are Being Watched

When RunWhen Local starts, it logs which files are being watched:

```
File watcher enabled with inclusive watch list...
  ✓ /shared/workspaceInfo.yaml (found)
  ✓ /shared/uploadInfo.yaml (found)
  ✗ /shared/my-config.yaml (not found)
Monitoring 2 file(s) from watch list for changes
```

### Common Issues

**Race Condition with kubeconfig:**
```
# Problem: Including kubeconfig in watch list
RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/kubeconfig"  # ❌ Don't do this

# Solution: Exclude script-generated files
RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/uploadInfo.yaml"  # ✅ Correct
```

**Files Not Being Watched:**
1. Check file paths are absolute (start with `/shared/`)
2. Verify files exist and are readable
3. Check for typos in file names
4. Review the startup logs for watch list confirmation

**Configuration Not Loading:**
1. Config file takes precedence over environment variable
2. Check `/shared/watch-files.conf` syntax (no trailing spaces, proper line endings)
3. Verify environment variable format (colon-separated, no spaces)

## Integration Examples

### Docker Compose
```yaml
version: '3.8'
services:
  runwhen-local:
    image: runwhen-local:latest
    environment:
      - AUTORUN_WORKSPACE_BUILDER_INTERVAL=300
      - RW_WATCH_FILES=/shared/workspaceInfo.yaml:/shared/secrets.yaml
    volumes:
      - ./shared:/shared
```

### Kubernetes Deployment
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: watch-config
data:
  watch-files.conf: |
    /shared/workspaceInfo.yaml
    /shared/uploadInfo.yaml
    /shared/database-config
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: runwhen-local
spec:
  template:
    spec:
      containers:
      - name: runwhen-local
        image: runwhen-local:latest
        env:
        - name: AUTORUN_WORKSPACE_BUILDER_INTERVAL
          value: "300"
        volumeMounts:
        - name: shared
          mountPath: /shared
        - name: watch-config
          mountPath: /shared/watch-files.conf
          subPath: watch-files.conf
      volumes:
      - name: shared
        persistentVolumeClaim:
          claimName: runwhen-shared
      - name: watch-config
        configMap:
          name: watch-config
```

## Related Configuration

- [AUTORUN_WORKSPACE_BUILDER_INTERVAL](./workspaceinfo-customization.md) - Controls the base polling interval
- [Kubernetes Configuration](../cloud-discovery-configuration/kubernetes-configuration.md) - For in-cluster authentication setup
- [WorkspaceInfo Customization](./workspaceinfo-customization.md) - Main configuration file format

# File Watching Configuration

When RunWhen Local is configured with `AUTORUN_WORKSPACE_BUILDER_INTERVAL`, it
automatically reacts to configuration changes:

- **Kubernetes (Helm / in-cluster):** restarts the pod when mounted ConfigMaps or
  Secrets change. See [Kubernetes config reload](./config-reload.md) for full
  details — this is the path used by default in Helm deployments.
- **Docker / bind mounts:** re-runs discovery immediately when watched files
  under `/shared` change (content hash, not mtime).

## Overview

| Environment | Mechanism | On change |
| ----------- | --------- | --------- |
| Kubernetes | [Config reloader](./config-reload.md) watches ConfigMap/Secret objects via the API | Pod restart |
| Docker / Podman | File watcher hashes files listed in `watch-files.conf` or `RW_WATCH_FILES` | Immediate discovery run |

The file watcher described below applies to **Docker and bind-mount**
deployments. It does **not** detect changes to Kubernetes subPath mounts; use
the [config reloader](./config-reload.md) for that.

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

# Add credential files that should trigger reloads
/shared/gcp.secret
/shared/aws.secret
```

**Example:**

```bash
# In your working directory
cat > shared/watch-files.conf << 'EOF'
# Core configuration files
/shared/workspaceInfo.yaml
/shared/uploadInfo.yaml

# Cloud credential files
/shared/gcp.secret
EOF
```

### 2. Environment Variable

Set the `RW_WATCH_FILES` environment variable with a colon-separated list of
files:

```bash
export RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/uploadInfo.yaml:/shared/gcp.secret"
```

**Docker Example:**

```bash
docker run -e AUTORUN_WORKSPACE_BUILDER_INTERVAL=300 \
  -e RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/gcp.secret" \
  -v $workdir/shared:/shared \
  runwhen-local:latest
```

### 3. Default Configuration

If no configuration is provided, the following files are watched by default:

- `/shared/workspaceInfo.yaml`
- `/shared/uploadInfo.yaml`

## How detection works

The entrypoint computes a SHA-256 hash of each watched file's contents after
every discovery run. If the combined checksum changes, discovery runs again
immediately instead of waiting for `AUTORUN_WORKSPACE_BUILDER_INTERVAL`.

Modification time (`mtime`) is **not** used — it is unreliable for
Kubernetes projected volumes and some network filesystems.

## Race Condition Prevention

The file watcher is designed to prevent race conditions by **excluding** files
that are created or modified by the RunWhen Local script itself. Do not add
these to the watch list:

- `kubeconfig` — created by in-cluster authentication
- `in_cluster_kubeconfig.yaml` — temporary kubeconfig file
- `db.sqlite3` — resource store database
- Files under `/shared/output/`

This prevents infinite loops where script-generated files trigger new discovery
runs that regenerate the same files.

## Best Practices

### Files to include

- `workspaceInfo.yaml` — main workspace configuration
- `uploadInfo.yaml` — upload configuration
- Cloud credential files (`gcp.secret`, `aws.secret`, …)
- Custom configuration files bind-mounted into `/shared`

### Files to exclude

- Kubeconfig files created at runtime
- Database files (`db.sqlite3`)
- Output artefacts in `/shared/output/`
- Temporary files

### Example configurations

**Basic setup (defaults):**

No configuration needed — watches `workspaceInfo.yaml` and `uploadInfo.yaml`.

**Multi-environment Docker setup:**

```bash
export RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/env-config.yaml:/shared/feature-flags.yaml"
```

## Troubleshooting

### Check what files are being watched

When RunWhen Local starts, it logs which files are in the watch list:

```
File watcher enabled with inclusive watch list...
  ✓ /shared/workspaceInfo.yaml (found)
  ✓ /shared/uploadInfo.yaml (found)
  ✗ /shared/my-config.yaml (not found)
Monitoring 2 file(s) from watch list for changes
```

For Kubernetes deployments, also look for config reloader lines — see
[config reload troubleshooting](./config-reload.md#troubleshooting).

### Common issues

**Race condition with kubeconfig:**

```
# Problem: including kubeconfig in watch list
RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/kubeconfig"  # don't do this

# Solution: exclude script-generated files
RW_WATCH_FILES="/shared/workspaceInfo.yaml:/shared/uploadInfo.yaml"
```

**Files not being watched:**

1. Check file paths are absolute (start with `/shared/`)
2. Verify files exist and are readable inside the container
3. Check for typos in file names
4. Review startup logs for watch list confirmation

**Configuration not loading:**

1. `/shared/watch-files.conf` takes precedence over `RW_WATCH_FILES`
2. Check config file syntax (no trailing spaces, Unix line endings)
3. Verify environment variable format (colon-separated, no spaces)

**Kubernetes ConfigMap updated but discovery unchanged:**

subPath mounts do not update in-place. The file watcher cannot help here — see
[Kubernetes config reload](./config-reload.md).

## Integration Examples

### Docker Compose

```yaml
version: '3.8'
services:
  runwhen-local:
    image: runwhen-local:latest
    environment:
      - AUTORUN_WORKSPACE_BUILDER_INTERVAL=300
      - RW_WATCH_FILES=/shared/workspaceInfo.yaml:/shared/gcp.secret
    volumes:
      - ./shared:/shared
```

### Kubernetes (Helm)

For Helm deployments, use the built-in [config reloader](./config-reload.md)
instead of `RW_WATCH_FILES`. ConfigMap and Secret changes trigger a pod
restart automatically when `autoRun.discoveryInterval` is set.

To add extra watch targets or tune behaviour:

```yaml
runwhenLocal:
  autoRun:
    discoveryInterval: 14400
  extraEnv:
    RW_CONFIG_RELOAD_EXCLUDE: "proxy-ca-tls"
```

## Related Configuration

- [Kubernetes config reload](./config-reload.md) — pod restart on ConfigMap/Secret changes
- [Helm configuration](./helm.md)
- [`workspaceInfo.yaml` reference](./workspace-info.md)
- [Kubernetes installation (standalone)](../installation/kubernetes-standalone.md)

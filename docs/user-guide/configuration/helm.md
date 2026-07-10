# Helm Configuration

## Helm Chart Details

RunWhen Contrib Repository URL: [https://runwhen-contrib.github.io/helm-charts](https://runwhen-contrib.github.io/helm-charts)

Source URL: [https://github.com/runwhen-contrib/helm-charts/tree/main/charts/runwhen-local](https://github.com/runwhen-contrib/helm-charts/tree/main/charts/runwhen-local)

Values File: [https://github.com/runwhen-contrib/helm-charts/blob/main/charts/runwhen-local/values.yaml](https://github.com/runwhen-contrib/helm-charts/blob/main/charts/runwhen-local/values.yaml)

## Automatic config reload

When `runwhenLocal.autoRun.discoveryInterval` is set (Helm sets
`AUTORUN_WORKSPACE_BUILDER_INTERVAL` in the container), RunWhen Local
automatically watches mounted ConfigMaps and Secrets and **restarts the pod**
when their data changes.

This is required because the chart mounts `workspaceInfo.yaml`, credential
secrets, and similar files with **subPath** — Kubernetes never updates those
files inside a running pod.

No external reloader is needed. See [Kubernetes config reload](./config-reload.md)
for behaviour, environment variables, RBAC, and troubleshooting.

### Common values

```yaml
runwhenLocal:
  autoRun:
    discoveryInterval: 14400   # enables continuous discovery + config reload
  workspaceInfo:
    useExistingConfigMap: true
    existingConfigMapName: workspaceinfo
  # Mount cloud credentials as extra volumes — auto-discovered by the reloader
  volumes:
    gcp-credentials:
      secret:
        secretName: gcp-credentials
  volumeMounts:
    gcp-credentials:
      mountPath: /shared/gcp.secret
      subPath: gcp.secret
      readOnly: true
  extraEnv:
    # Optional: exclude volumes that should not trigger restart
    RW_CONFIG_RELOAD_EXCLUDE: "proxy-ca-tls"
```

After updating a ConfigMap or Secret, the pod restarts on its own within a few
seconds. You do not need to run `kubectl delete pod` manually.

## Discovery resiliency

When `runwhenLocal.autoRun.discoveryInterval` is set, RunWhen Local also runs
a continuous discovery + upload loop. The loop is hardened against two common
failure modes:

- **Azure API throttling** — list calls automatically retry with `Retry-After`
  and exponential-backoff handling.
- **Code-collection clone failures** — if every git clone fails and
  `useLocalGit` is `false`, the run is aborted (so no empty pack is uploaded)
  and the loop backs off for `RW_RUN_RETRY_INTERVAL_SECONDS` (default 5 minutes)
  before retrying.

Common Helm overrides:

```yaml
runwhenLocal:
  extraEnv:
    # Wait 5 minutes between retries after a failed discovery run (default).
    RW_RUN_RETRY_INTERVAL_SECONDS: "300"
    # Tune Azure throttle handling (defaults are usually fine).
    AZURE_THROTTLE_MAX_ATTEMPTS: "6"
    AZURE_THROTTLE_MAX_TOTAL_WAIT: "180"
```

See [Discovery resiliency](./discovery-resiliency.md) for the full reference,
including the per-mode behavior table and tuning guidance.

### Updating workspaceInfo

```bash
# Edit the source ConfigMap
kubectl edit configmap workspaceinfo -n runwhen-local

# Or replace from a local file
kubectl create configmap workspaceinfo \
  --from-file=workspaceInfo.yaml=./workspaceInfo.yaml \
  -n runwhen-local \
  --dry-run=client -o yaml | kubectl apply -f -
```

Watch the pod restart:

```bash
kubectl get pods -n runwhen-local -l app.kubernetes.io/name=runwhen-local -w
```

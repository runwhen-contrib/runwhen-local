# Discovery resiliency

RunWhen Local talks to two classes of external systems on every discovery cycle:

1. **Cloud provider APIs** (Azure ARM, GCP, AWS) to list resources.
2. **Git remotes** to clone the configured code collections so the workspace
   builder knows which generation rules to apply.

Both can return transient errors — throttling, DNS hiccups, brief outages — and
both can also stay broken for long enough to produce a thin or empty workspace
pack. This page documents the safety nets RunWhen Local applies so those
failures do not result in:

- Bad data being uploaded to RunWhen Platform.
- Resource types silently going missing from the resource store.
- Tight retry loops that hammer a struggling provider.

## Azure API throttling

Azure Resource Manager applies per-subscription read limits and returns
HTTP `429` with bodies like:

```
(ResourceCollectionRequestsThrottled) Operation 'Microsoft.Storage/storageAccounts/read'
failed as server encountered too many requests. Please try after '11' seconds.
```

The native `azureapi` indexer automatically retries throttled list calls. The
retry helper:

- Detects throttles by HTTP status (`408`, `429`, `500`, `502`, `503`, `504`)
  and by ARM throttle codes in the message body
  (`ResourceCollectionRequestsThrottled`, `SubscriptionRequestsThrottled`,
  `ResourceRequestsThrottled`, `TooManyRequests`, `ServerBusy`, `ServerTimeout`,
  `RequestThrottled`).
- Honors the `Retry-After` header when present.
- Parses the `Please try after 'N' seconds` hint from the ARM message body when
  no header is present.
- Falls back to exponential backoff with full jitter, capped at a per-sleep
  maximum.
- Bounds the total time spent waiting on any single list call, so a sustained
  throttle never wedges the build.
- Logs each retry at `INFO` with the resource type and scope (RG / subscription).
- Reports a `skipped_throttled` counter in the per-run discovery summary.

### What you will see in the logs

```
INFO indexers.azure_throttle: Azure throttled azure_storage_accounts in subscription 7ed8... (attempt 1/6); sleeping 11.4s before retry: (ResourceCollectionRequestsThrottled) Operation 'Microsoft.Storage/storageAccounts/read' failed...
INFO indexers.azureapi: Discovery summary: ... skipped_throttled=0
```

If retries exhausted the budget, the existing per-type warning is emitted **and**
`skipped_throttled` is non-zero in the summary.

### Tunable settings

Defaults (`6` attempts, `2s` initial backoff, `60s` per-sleep cap, `180s` total per
call) work well for typical tenants. For very large subscriptions or sustained
throttling, dial them up in `workspaceInfo.yaml`:

| `workspaceInfo.yaml` key | Env var | Default | Purpose |
| --- | --- | --- | --- |
| `azureThrottleMaxAttempts` | `AZURE_THROTTLE_MAX_ATTEMPTS` | `6` | Max attempts per list call. |
| `azureThrottleInitialBackoff` | `AZURE_THROTTLE_INITIAL_BACKOFF` | `2.0` | Backoff (seconds) used when ARM gives no `Retry-After` hint. |
| `azureThrottleMaxBackoff` | `AZURE_THROTTLE_MAX_BACKOFF` | `60.0` | Per-sleep cap (seconds). |
| `azureThrottleMaxTotalWait` | `AZURE_THROTTLE_MAX_TOTAL_WAIT` | `180.0` | Total time the indexer is allowed to spend sleeping for any one list call. |

```yaml
azureThrottleMaxAttempts: 10
azureThrottleInitialBackoff: 2.0
azureThrottleMaxBackoff: 120.0
azureThrottleMaxTotalWait: 600.0
```

### When tuning isn't enough

If you continue to see `Failed to list Azure …` errors with throttle codes in
the message after raising the caps, the most likely cause is that one or more
subscriptions has so many resources of a given type that even with backoff the
read budget is exhausted within a single discovery cycle. Narrow the discovery
scope in `workspaceInfo.yaml` so the indexer makes fewer list calls per run:

- Set per-RG `levelOfDetails` to `none` for resource groups that don't need
  indexing (see [Level of detail](./level-of-detail.md)).
- Use `includeTags` / `excludeTags` to drop the noisy resources.
- Lengthen `runwhenLocal.autoRun.discoveryInterval` so the cycle runs less often.

Set `LOG_LEVEL=DEBUG` to also see the per-page Azure SDK request logs; combined
with the `Azure throttled …` INFO lines this gives a complete picture of which
resource provider is rate-limiting the build.

## Code-collection clone failures

The workspace builder clones each configured code collection at the start of
every discovery run to read the latest generation rules. If a clone fails — DNS
outage, GitHub unreachable from the cluster, expired auth token — the run could
previously produce a thin or empty workspace pack that the `--upload` step
would happily ship to RunWhen Platform.

The current behavior:

| Scenario | Outcome |
| --- | --- |
| `useLocalGit: true` (bundled local git mirror) | Per-collection warnings, run continues. No remote retry is possible from this process. |
| `useLocalGit: false`, all collections cloned successfully | Normal run + upload. |
| `useLocalGit: false`, **some** collections failed initial clone | Loud warning listing the failed collections; the run continues with whatever loaded. The upload happens with the known subset. |
| `useLocalGit: false`, **every** collection failed initial clone | `/run/` returns an error, `./run.sh` exits non-zero, **no upload is attempted**. The auto-run loop retries after the failure interval (see below). |
| Subsequent **fetch** failure on an already-cloned collection | Warning, run continues using the last good snapshot. |

The distinction between "initial clone" and "fetch" matters: once a collection
has been cloned once, an outage during a later fetch is not catastrophic — we
still have the previous snapshot of the generation rules. Only the first-clone
case can produce a literally empty rule set.

### What you will see in the logs on a hard failure

```
WARNING enrichers.generation_rules: Skipping code collection 'https://github.com/runwhen-contrib/rw-cli-codecollection.git' (ref=main): <git error>
ERROR  workspace_builder.api: WorkspaceBuilderException: Refusing to continue: every code-collection clone failed and useLocalGit is false, which would produce an empty workspace pack. No upload will be attempted; the entrypoint will retry. Failures: ...
Workspace builder discovery+upload (keep-existing) failed (exit=1); retrying in 300s.
```

## Failure-retry interval

When the auto-run loop is enabled (`AUTORUN_WORKSPACE_BUILDER_INTERVAL` is set,
which Helm does via `runwhenLocal.autoRun.discoveryInterval`), `entrypoint.sh`
captures the exit code of each `./run.sh` invocation and picks the next sleep
interval accordingly:

| `./run.sh` exit | Next sleep |
| --- | --- |
| `0` (success) | `AUTORUN_WORKSPACE_BUILDER_INTERVAL` — your normal discovery cadence. |
| non-zero (any failure) | `RW_RUN_RETRY_INTERVAL_SECONDS` — default **300 s (5 minutes)**. |

This applies to all run modes (no-upload, `--upload-merge-mode keep-existing`,
`--upload-merge-mode keep-uploaded`). The intent is twofold:

1. Don't spin at the discovery cadence (which is typically minutes-to-hours)
   when something is clearly broken.
2. Don't make operators wait the full discovery cadence after a transient
   failure resolves — 5 minutes is usually enough for GitHub / DNS / a cloud
   provider to recover.

### Tuning

| Variable | Default | When to change |
| --- | --- | --- |
| `RW_RUN_RETRY_INTERVAL_SECONDS` | `300` | Lower for impatient environments (e.g. `60` while debugging); raise for long outages where you don't want to spam retries. |

```yaml
runwhenLocal:
  extraEnv:
    RW_RUN_RETRY_INTERVAL_SECONDS: "120"
```

### Config reload during the retry backoff

The retry sleep is not a blind `sleep 300`. The entrypoint loops in
`RW_CONFIG_RELOAD_CHECK_INTERVAL`-second slices (default `5 s`) and continues
to poll the [Kubernetes config reloader](./config-reload.md) on every slice. So
if you fix the underlying problem by `kubectl apply`-ing an updated
`workspaceInfo.yaml` (or rotating a secret), the pod still restarts within a
few seconds — you don't have to wait out the remainder of the 5-minute window.

## Quick reference

```yaml
# workspaceInfo.yaml
azureThrottleMaxAttempts: 6
azureThrottleInitialBackoff: 2.0
azureThrottleMaxBackoff: 60.0
azureThrottleMaxTotalWait: 180.0

# Helm values
runwhenLocal:
  autoRun:
    discoveryInterval: 14400
  extraEnv:
    RW_RUN_RETRY_INTERVAL_SECONDS: "300"
    RW_CONFIG_RELOAD_CHECK_INTERVAL: "5"
```

## Related

- [Microsoft Azure cloud discovery](../cloud-discovery/azure.md) — full Azure
  setup, including the resource-throttling subsection.
- [Kubernetes config reload](./config-reload.md) — how pod restarts are
  triggered when `workspaceInfo.yaml` or secrets change.
- [CodeCollection configuration](./codecollection.md) — how the list of code
  collections is resolved per run.
- [Upload to RunWhen Platform](../features/upload-to-runwhen-platform.md) —
  end-to-end view of the upload step, including why a failed run skips it.
- [Stuck? Read this](../troubleshooting/stuck.md) — symptom-first
  troubleshooting entries.

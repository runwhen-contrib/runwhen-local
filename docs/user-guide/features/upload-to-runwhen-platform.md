# Upload to RunWhen Platform

RunWhen Local generates workspace configuration files (see [workspace-builder.md](workspace-builder.md "mention")) that can be uploaded to the RunWhen Platform, automatically constructing a fully configured map of your resources and associated troubleshooting tasks.&#x20;

{% hint style="info" %}
If uploading your configuration for the first time, and using the Runner, please see [kubernetes\_self\_hosted\_runner](../../installation/kubernetes\_self\_hosted\_runner/ "mention") before performing this step.&#x20;
{% endhint %}

### Uploading to the RunWhen Platform

#### Upload from the UI

RunWhen Local hosts a page titled **RunWhen Platform Upload** - it is accessible from the left hand navigation, or by selecting the **Upload to RunWhen Platform** icon in the main page. This page should outline all necessary steps required to:&#x20;

* Create a new RunWhen Platform Workspace
* Prepare for Upload (by fetchting and attaching the `uploadInfo.yaml`)
* Upload all configuration
* Create secrets (for communication with your cluster(s))

<figure><img src="../../.gitbook/assets/upload_1 (3).gif" alt=""><figcaption><p>Manually Uploading Content to the RunWhen Platform</p></figcaption></figure>



#### Upload from the CLI

RunWhen Local will look for the file called `uploadInfo.yaml` in the `/shared` directory of the container image. This file is obtained from the RunWhen Platform interface from **Configuration --> Workspace --> Automated Workspace Builder Config File**

<figure><img src="../../.gitbook/assets/image (5).png" alt=""><figcaption><p>Obtaining the uploadInfo.yaml file from RunWhen Platform</p></figcaption></figure>

With this file in place, re-run the discovery process with the `--upload` flag:&#x20;

```
docker exec -w /workspace-builder -- RunWhenLocal  ./run.sh --upload
```

#### Additional Upload Options for Merge Conflicts

Additional upload options are available to handle certain cases where the same SLX already exists on the platform and RunWhen Local has generated new configuration under the same name:&#x20;

```
--upload-merge-mode keep-uploaded
    - Favor the current configuration and overwrite what is in RunWhen Platform
--upload-merge-mode keep-existing 
    (default) - Preserve any configuration already in place in RunWhen Platform
```

### Resiliency: clone failures block the upload

The upload step is only allowed to run after a successful workspace-builder run. If `git clone` of every requested code collection fails (for example: a transient DNS outage, GitHub being unreachable from the cluster, or an auth token expiring), the workspace builder now **aborts the run** instead of producing a thin or empty pack that would then be uploaded.

The behavior depends on whether the deployment is using the bundled local git mirror (`useLocalGit: true`) or talking to a remote:

| Scenario | Behavior |
| --- | --- |
| `useLocalGit: true` (default for air-gapped / pre-built images) | Existing behavior — per-collection warnings, no abort. No remote retry is possible from this process. |
| `useLocalGit: false` AND **all** code collections fail to clone | The `/run/` REST call returns an error, `./run.sh` exits non-zero, **no upload is attempted**. |
| `useLocalGit: false` AND **some** code collections fail | Warning is logged listing the failed collections; the run continues using whatever loaded. The upload will still happen but the pack will be a known subset. |

When the auto-run loop (`AUTORUN_WORKSPACE_BUILDER_INTERVAL` set) sees a non-zero exit from `./run.sh`, it backs off for `RW_RUN_RETRY_INTERVAL_SECONDS` (default `300` = 5 minutes) before trying again, instead of waiting the normal `AUTORUN_WORKSPACE_BUILDER_INTERVAL`. This gives transient network / DNS / GitHub outages time to resolve without spamming retries and without uploading an empty pack in the meantime. Tune `RW_RUN_RETRY_INTERVAL_SECONDS` (or `runRetryIntervalSeconds` in your Helm values) if you want a shorter or longer retry cadence.

The pod retry loop also keeps polling the Kubernetes config reloader during the backoff window, so a `workspaceInfo.yaml` change still triggers an immediate pod restart even mid-retry.


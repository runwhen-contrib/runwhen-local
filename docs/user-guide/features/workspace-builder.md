# Workspace Builder

Workspace Builder is the engine within RunWhen Local that:&#x20;

* Performs discovery on Kubernetes & Cloud (AWS, Azure, GCP) resources
* Matches resources with relevant open source [CodeBundles](https://docs.runwhen.com/public/runwhen-platform/terms-and-concepts#codebundle) (health, troubleshooting, and automation tasks and scripts)
* &#x20; Generates the RunWhen configuration necessary to:&#x20;
  * Display tailored troubleshooting commands in generated output (see [Discovery Output](user\_guide-feature\_overview.md "mention"))
  * Create a[ RunWhen Platform Workspace](https://docs.runwhen.com/public/runwhen-platform/feature-overview/workspaces), where Engineering Assistants can suggest, run, and investigate the output of these [open source CodeBundles](https://registry.runwhen.com)&#x20;

## Web UI

Workspace Builder ships with a small web UI served by the same FastAPI process that handles discovery and uploads. Two pages exist today, with more (troubleshooting tools, per-cycle discovery activity) planned:

| Path | Description |
| --- | --- |
| `/` | **Control center / home page.** Cards for service status, the most recent discovery run (status, duration, SLX count, warnings), the current resource-store summary (resource and SLX bundle counts, platforms), recent SLX bundles by display name, and a redacted view of `workspaceInfo.yaml` (client secrets / tokens / passwords are masked before being shown). Also hosts placeholder cards for upcoming troubleshooting tools and a discovery activity timeline. |
| `/explorer/` | **Workspace Explorer.** Browse every discovered resource and rendered SLX/SLI/runbook/skill artifact. SLX bundles are titled by their `spec.alias` (display name) rather than the on-disk short hash, with the internal name shown as secondary metadata. The search box matches the display name, the SLX directory, and the rendered file contents. |

Both pages run on port `8000` by default (`http://<pod-or-container>:8000/`) and share a JSON API surface (`/health/`, `/explorer/api/*`, `/api/overview`) that any external dashboard can hit.

### Redacted configuration view

The home page's **Discovery configuration** card reads the active `workspaceInfo.yaml` (default `/shared/workspaceInfo.yaml`, override with `RW_WORKSPACE_INFO_PATH`) and renders a summary plus a "View full" expander. Before either is shown, values under any key whose name contains `secret`, `token`, `password`, `credential`, `apiKey`, `private_key`, etc. are replaced with `***REDACTED***` so it's safe to leave the UI open during demos and screen-shares.

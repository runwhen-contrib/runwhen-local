# Discovery Output

RunWhen Local performs discovery on your Kubernetes and cloud resources, matches them with troubleshooting commands from open-source CodeCollection libraries (such as [this](https://github.com/runwhen-contrib/rw-cli-codecollection)), and writes the results to `/shared/output`. See [workspace-builder.md](workspace-builder.md) for how the pipeline works.

## Running discovery

From a running container:

```
docker exec -w /workspace-builder RunWhenLocal ./run.sh
```

When discovery completes, generated configuration and resource data are available under `$workdir/shared/output` on the host (or `/shared/output` inside the container).

## REST API

The workspace-builder service exposes a FastAPI server on port **8000**:

* `GET /info/` — version, available indexers/enrichers/renderers, and settings catalog
* `POST /run/` — run the discovery pipeline (used internally by `./run.sh`)
* `GET /health/` — service health and last-run status

Example:

```
curl http://localhost:8000/health/
```

Browse indexed resources in the Workspace Explorer at [http://localhost:8000/explorer/](http://localhost:8000/explorer/) after running discovery with `resourceStoreBackend: sqlite`. The explorer has three tabs: **SLX Bundles** (each card groups the rendered SLX, SLI, runbook, and overlaid `Skill.md` for one SLX directory), **Discovered Resources** (the indexer graph), and **All Artifacts**. For HTTP and SQL examples, see [Resource store query API](../architecture/resource-store-query-api.md).

### Terminology

In the Skills Registry vocabulary used by the explorer:

- A **CodeBundle** is a directory under `codebundles/` in a CodeCollection git repo. It defines a **Skill** (or "Skill Template") that an agent can invoke.
- A **Skill** is documented by an optional Skill markdown file at the CodeBundle root (case-insensitive — commonly `SKILL.md` or `Skill.md`).
- An **SLX** is an *instance* of a Skill, bound to a specific resource. RunWhen Local renders an SLX directory (`output/workspaces/<ws>/slxs/<slx>/`) containing `slx.yaml`, `sli.yaml`, `runbook.yaml`, and a verbatim copy of the source CodeBundle's Skill markdown file (when present), preserving the upstream filename casing.

## Upload to RunWhen Platform

To push discovery results to the RunWhen Platform instead of only writing local output files, see [upload-to-runwhen-platform.md](upload-to-runwhen-platform.md).

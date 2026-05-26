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

Browse indexed resources in the basic explorer UI at [http://localhost:8000/explorer/](http://localhost:8000/explorer/) after running discovery with `resourceStoreBackend: sqlite`.

## Upload to RunWhen Platform

To push discovery results to the RunWhen Platform instead of only writing local output files, see [upload-to-runwhen-platform.md](upload-to-runwhen-platform.md).

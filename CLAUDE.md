# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is RunWhen Local

RunWhen Local is an open-source workspace builder that discovers resources across Kubernetes, Azure, AWS, GCP, and Azure DevOps, then matches them to community-maintained "code collections" to generate personalized troubleshooting commands. It produces a web-based cheat sheet (served via MkDocs) and optionally uploads workspace configuration to the RunWhen Platform.

## Build & Run Commands

### Dependencies (Poetry, from `src/`)
```bash
cd src && poetry install
```

### Run the workspace builder
```bash
cd src && bash run.sh -w workspaceInfo.yaml -k kubeconfig -o output/
# or directly:
cd src && python3 run.py run --components load_resources,kubeapi,cloudquery,azure_devops,generation_rules,render_output_items,dump_resources
```

### Run tests
```bash
cd src && python tests.py
```

### Django REST API (development server)
```bash
cd src && python manage.py runserver 0.0.0.0:8000
```
Django settings module: `config.settings`

### Docker build
```bash
docker build -f src/Dockerfile -t runwhen-local .
```

### Code style
- **Formatter**: Black (line length not explicitly configured, use default 88)
- **Linter**: Pylint with `--max-line-length=120 --enable=W0614`
- Tab size: 4 spaces

## Architecture

### Pipeline / Component System

The application uses a three-stage plugin pipeline defined in `src/component.py`:

1. **INDEXER** stage — Resource discovery (populates the Registry)
2. **ENRICHER** stage — Pattern matching (matches resources to code bundles, generates SLX definitions)
3. **RENDERER** stage — Output generation (renders templates, writes files)

Components are registered by name and executed in stage order. Each receives a `Context` object providing settings access and inter-component communication via properties.

**Default component pipeline** (in order): `load_resources` → `kubeapi` → `cloudquery` → `azure_devops` → `generation_rules` → `render_output_items` → `dump_resources`

### Key Source Files

| File | Purpose |
|------|---------|
| `src/run.py` | Main CLI entry point — argument parsing, config loading, pipeline orchestration |
| `src/run.sh` | Shell wrapper with file locking to prevent concurrent runs |
| `src/component.py` | Component framework: `Component`, `Context`, `Stage`, `Setting`, `SettingDependency` |
| `src/resources.py` | Resource model: `Resource`, `ResourceType`, `Platform`, `Registry` |
| `src/outputter.py` | Output abstraction: `FileSystemOutputter`, `TarFileOutputter`, `FileItemOutputter` |
| `src/exceptions.py` | Custom exception hierarchy (`WorkspaceBuilderException`, etc.) |

### Resource Model (`src/resources.py`)

Hierarchical: **Registry** → **Platform** (kubernetes, azure, gcp, aws) → **ResourceType** (pod, deployment, etc.) → **Resource** (individual instances with dynamic attributes).

Indexers populate the Registry. Enrichers query it via `Registry.lookup_resource()` / `lookup_resource_type()`. Resources have a `qualified_name` (globally unique, includes namespace/region scoping) and arbitrary dynamic attributes set by indexers.

### Indexers (`src/indexers/`)

| Indexer | File | What it discovers |
|---------|------|-------------------|
| `kubeapi` | `indexers/kubeapi.py` | Kubernetes resources via Python kubernetes client. Supports annotations like `config.runwhen.com/ignore`, `config.runwhen.com/lod` |
| `cloudquery` | `indexers/cloudquery.py` | Azure, GCP, AWS resources via CloudQuery CLI + SQLite |
| `azure_devops` | `indexers/azure_devops.py` | Azure DevOps projects, pipelines, test results |
| `load_resources` | `indexers/load_resources.py` | Loads cached resource dump from previous runs |

### Generation Rules Engine (`src/enrichers/`)

The core matching logic lives in `enrichers/generation_rules.py`. It:
1. Clones/caches code collection Git repos (`enrichers/code_collection.py`)
2. Scans for `generation-rules.yaml` files in each code bundle
3. Matches resources using composable predicates (`enrichers/match_predicate.py`): `And`, `Or`, `Not`, `ResourcePropertyMatch`, `ResourcePathExists`, `CustomVariableMatch`
4. Generates SLX/runbook/SLI output items with Jinja2 template variables

**Platform handlers** (`enrichers/generation_rule_types.py` + `enrichers/{kubernetes,azure,gcp,aws,azure_devops}.py`) encapsulate platform-specific qualifier resolution, template variable generation, and resource property access.

**LevelOfDetail** enum (`NONE`, `BASIC`, `DETAILED`) controls the granularity of generated output per resource.

Schema for generation rules: `src/generation-rule-schema.json`. Guide: `generation-rules-guide.md` (root).

### Renderers (`src/renderers/`)

`render_output_items.py` takes output items produced by the enricher, renders Jinja2 templates with resolved variables, applies `configProvided` overrides, and writes via the `Outputter` abstraction.

`dump_resources.py` serializes the Registry to YAML for caching/debugging.

### Django REST API (`src/workspace_builder/`)

Standard Django app at `src/workspace_builder/` with DRF views. Two main endpoints:
- `GET /info/` — Version and available components
- `POST /run/` — Execute workspace builder pipeline

### Cheat Sheet (`src/cheat-sheet-docs/`)

MkDocs with Material theme serves generated troubleshooting commands as a searchable web interface on port 8081 (container).

## Configuration

- **workspaceInfo.yaml**: Primary configuration file — workspace name, owner, cloud credentials, code collections
- **uploadInfo.yaml**: Optional RunWhen Platform upload credentials
- **customizationRules.yaml**: Map customization rules for workspace visualization
- **src/default-code-collections.yaml**: Pre-configured external code collection repos
- **src/VERSION** (JSON): Version tracking `{"name": "runwhen-local", "version": "X.Y.Z"}`

## CI/CD

- `pr_open.yaml`: Multi-arch Docker build on PR, pushes to GCP Artifact Registry
- `merge_to_main.yaml`: Triggered by VERSION file changes on main, builds and pushes to both GCP AR and GHCR, deploys to sandbox
- Version is extracted from `src/VERSION`

## Dev Container

Configured in `.devcontainer.json` — uses pre-built image `ghcr.io/runwhen-contrib/runwhen-local-devcontainer:latest` with Docker-in-Docker, kubectl, cloud CLIs, and Python tooling.

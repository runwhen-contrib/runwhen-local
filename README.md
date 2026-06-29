# RunWhen Local

[![Join Slack](https://img.shields.io/badge/Join%20Slack-%23E01563.svg?&style=for-the-badge&logo=slack&logoColor=white)](https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python 3.14](https://img.shields.io/badge/python-3.14-blue.svg)](https://www.python.org/downloads/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)

RunWhen Local is a **discovery tool** for cloud and Kubernetes
infrastructure that turns the resources you already have into a tailored
set of agentic **Skills** — small, AI-agent-readable runbooks bound to
the specific things in *your* environment.

Pair it with the [RunWhen Platform](https://www.runwhen.com) to manage
and run those Skills safely in production: scheduled execution, audit,
secrets, and team-level governance.

> Heads up: RunWhen Local is evolving quickly. The **discovery →
> tailored Skills** workflow described below is the current core
> feature. Additional functionality is on the way and will be folded
> into this README and the docs as it lands.

## Table of Contents

- [What it does](#what-it-does)
- [How the pieces fit together](#how-the-pieces-fit-together)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [What gets discovered](#what-gets-discovered)
- [Going to production with the RunWhen Platform](#going-to-production-with-the-runwhen-platform)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Community and support](#community-and-support)
- [License](#license)

## What it does

1. **Discovery.** RunWhen Local connects to your Kubernetes clusters and
   cloud accounts and indexes the resources you point it at — selectively
   (per-namespace, per-resource-group) or broadly. The Azure indexer is
   native (no CloudQuery dependency) and indexes the full Azure resource
   catalog; AWS, GCP, and Kubernetes are supported.

2. **Skill tailoring.** A library of CodeBundles (in [contrib
   CodeCollections](https://github.com/runwhen-contrib)) ships
   generation rules that match against discovered resources. The
   workspace builder renders one **SLX** (a tailored Skill instance)
   per match: a runbook bound to a specific resource, with its own
   `SKILL.md` so an MCP-aware AI agent can read what it does and how to
   invoke it.

3. **Local explorer UI.** A FastAPI-backed UI at
   `http://localhost:8000/explorer/` lets you browse the discovered
   resources, the rendered SLXs, and their Skill descriptions side by
   side.

4. **Built-in MCP server.** A read-only [Model Context Protocol](https://modelcontextprotocol.io)
   server is mounted at `http://localhost:8000/mcp/` so AI agents
   (Claude Code, Cursor, Claude Desktop, ...) can search, browse, and
   read your generated Skills directly. v1 is read-only — search and
   suggestion; execution is the natural follow-on. See the
   [MCP server guide](docs/user-guide/features/mcp-server.md).

5. **Optional Platform pairing.** Push the same SLXs to the RunWhen
   Platform to gate execution behind RBAC, schedule them, and route
   results into alerts or developer self-service flows. Local is fully
   useful standalone; the Platform turns it into a production runtime.

## How the pieces fit together

A short glossary; the [authoring/concepts
guide](docs/authoring/concepts.md) covers it in more depth.

- **CodeBundle** — a versioned, distributable unit of automation in a
  CodeCollection git repo. Ships code, optional `SKILL.md`, and one or
  more generation rules.
- **Skill** — the abstract capability the CodeBundle implements
  (e.g. "diagnose a stuck Pod", "rotate a Key Vault secret").
- **SLX** — a *rendered instance* of a Skill, bound to a specific
  resource you discovered (e.g. "diagnose a stuck Pod *in the
  `payments-prod` namespace*"). One SLX = one directory of artifacts.
- **Runbook** — the executable artifact inside an SLX (typically a
  Robot Framework `.robot`). What a human or agent actually runs.
- **Generation rule** — the YAML in a CodeBundle that tells the
  workspace builder: "match this resource type, render this Skill
  template into an SLX with this name."

```text
Discovered resources                Generated SLXs
(Kubernetes pods, Azure Key         (one per match — runbook + SKILL.md
 Vaults, AWS RDS instances, ...)     bound to a specific resource)

       │                                       │
       └──────── generation rules ─────────────┘
              (live in CodeBundles)
```

## Quick start

The fastest path is the published image. You'll need a
`workspaceInfo.yaml` (sample below) and credentials for whatever
platform(s) you want to discover.

```bash
docker pull ghcr.io/runwhen-contrib/runwhen-local:latest

docker run --rm -it \
  -p 8000:8000 \
  -v "$(pwd):/shared" \
  ghcr.io/runwhen-contrib/runwhen-local:latest
```

Once discovery finishes, the explorer UI is at
`http://localhost:8000/explorer/`. Generated SLXs land in `./output/`.

A minimal `workspaceInfo.yaml` to get started against a single
Kubernetes cluster:

```yaml
workspaceName: "my-workspace"
workspaceOwnerEmail: "you@example.com"
defaultLocation: "location-01"
defaultLOD: "detailed"   # discover everything by default

cloudConfig:
  kubernetes:
    kubeconfigFile: "/shared/kubeconfig"
    namespaceLODs:
      kube-system:    "none"
      kube-public:    "none"
      kube-node-lease: "none"

codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/rw-cli-codecollection.git"
    branch: "main"
```

For Azure, AWS, and GCP setup, see the per-platform pages in
[`docs/user-guide/cloud-discovery/`](docs/user-guide/cloud-discovery/).

## Configuration

`workspaceInfo.yaml` is the single source of truth. Top-level shape:

```yaml
workspaceName: "..."
workspaceOwnerEmail: "..."
defaultLocation: "location-01"
defaultLOD: "detailed"            # "none" | "basic" | "detailed"

cloudConfig:
  kubernetes: { ... }
  azure:      { ... }
  aws:        { ... }
  gcp:        { ... }

codeCollections:
  - repoURL: "https://github.com/..."
    branch:  "main"

custom: { ... }                   # values exposed to generation rule templates
```

Full reference and examples:

- [`workspaceInfo.yaml` reference](docs/user-guide/configuration/workspace-info.md)
- [Discovery level of detail](docs/user-guide/configuration/level-of-detail.md)
- [Helm / proxy / private-registry / config reload](docs/user-guide/configuration/)
- [`workspaceinfo-overrides-example.yaml`](docs/user-guide/configuration/workspaceinfo-overrides-example.yaml)

CLI invocation lives in [`src/run.sh`](src/run.sh); run with `--help`
for the current flag list.

## What gets discovered

| Platform     | Indexer        | Coverage |
| ------------ | -------------- | -------- |
| Azure        | native `azureapi` (`azure-mgmt-*` SDKs) | 619 resource types — full parity with the legacy CloudQuery plugin. 25 with rich (typed) payloads, the rest via the ARM-resources catch-all. [Catalog](docs/authoring/indexed-resources/azure-resource-catalog.md). |
| Kubernetes   | native (`kubernetes` Python client) | Standard kinds (Deployment, StatefulSet, Service, Pod, Ingress, etc.) plus user-listed CRDs, with per-namespace LOD. |
| AWS          | native `awsapi` (Cloud Control API + `boto3`) | Parity with the CloudQuery AWS plugin; gen rules match by CloudQuery table name. |
| GCP          | native `gcpapi` (Cloud Asset Inventory + `google-cloud-*`) | Parity with the CloudQuery GCP plugin; gen rules match by CloudQuery table name. |

Per-indexer authoring reference:
[`docs/authoring/indexed-resources/`](docs/authoring/indexed-resources/).

The native SDK indexers (`azureapi` / `gcpapi` / `awsapi`) are the **default**
backend for every cloud, and the discovered resource graph is persisted to a
local SQLite store by default (`resourceStoreBackend: sqlite`). The legacy
CloudQuery backend still exists behind `*IndexerBackend: cloudquery` for
compatibility but is being phased out; set it explicitly to opt back in. Both
backends emit a single grep-able info-level log line on every run so it's
obvious which one ran.

## Going to production with the RunWhen Platform

Local gives you discovered resources and tailored SLXs on disk. The
[RunWhen Platform](https://www.runwhen.com) is the optional companion
that turns those SLXs into a *managed* production runtime:

- **Privately host** the Skills your team can run, with RBAC controls
  on who can invoke what.
- **Schedule** SLX runs and ingest the results into alerts /
  developer-self-service flows.
- **Manage secrets** centrally so credentials never live next to the
  CodeBundle.
- **Audit** every SLX execution for compliance.

To upload the workspace generated by RunWhen Local to the Platform,
pass `--upload` to `run.sh` (or the equivalent setting in
`workspaceInfo.yaml`); see
[`docs/user-guide/features/upload-to-runwhen-platform.md`](docs/user-guide/features/upload-to-runwhen-platform.md).

## Documentation

The full doc tree is in [`docs/`](docs/) and is split into three
buckets:

```
docs/
├── user-guide/      I want to deploy and operate RunWhen Local
├── authoring/       I want to write CodeBundles, Skills, or generation rules
└── architecture/    I want to understand how RunWhen Local works internally
```

Highlights:

- [Getting started](docs/user-guide/getting-started.md)
- [Local Docker / Podman install](docs/user-guide/installation/local-docker.md) ·
  [Kubernetes standalone](docs/user-guide/installation/kubernetes-standalone.md) ·
  [Self-hosted runner (Platform-connected)](docs/user-guide/installation/kubernetes-self-hosted/README.md)
- [Cloud discovery: Azure](docs/user-guide/cloud-discovery/azure.md) ·
  [AWS](docs/user-guide/cloud-discovery/aws.md) ·
  [GCP](docs/user-guide/cloud-discovery/gcp.md) ·
  [Kubernetes](docs/user-guide/cloud-discovery/kubernetes.md)
- [CodeBundle / Skill / SLX concepts](docs/authoring/concepts.md)
- [Indexed resources reference](docs/authoring/indexed-resources/README.md)
- [Generation rules: schema, lifecycle, and examples](docs/authoring/generation-rules/README.md)
- [Agentic access: built-in MCP server](docs/user-guide/features/mcp-server.md)
- [Architecture overview](docs/architecture/README.md)

Hosted docs mirror is at
[docs.runwhen.com/public/v/runwhen-local/](https://docs.runwhen.com/public/v/runwhen-local/).

## Contributing

We welcome contributions. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for
the bug / feature / PR workflow and code of conduct.

### Dev container (recommended)

```bash
git clone https://github.com/runwhen-contrib/runwhen-local.git
cd runwhen-local
code .   # VS Code will prompt: "Reopen in Container"
```

The dev container ships Python 3.14, Poetry, kubectl, az, gcloud,
helm, terraform, yq, Docker-in-Docker, and the recommended editor
extensions.

### Local dev

```bash
git clone https://github.com/runwhen-contrib/runwhen-local.git
cd runwhen-local/src
pip install poetry && poetry install
poetry shell

cd .. && python src/tests.py   # run the test suite
```

For deeper dives, see
[`docs/architecture/development.md`](docs/architecture/development.md).

## Community and support

- [Slack](https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A)
- [GitHub issues](https://github.com/runwhen-contrib/runwhen-local/issues)
- [GitHub discussions](https://github.com/orgs/runwhen-contrib/discussions)
- [YouTube channel (demos)](https://www.youtube.com/@whatdoirunwhen)
- [Live sandbox](https://runwhen-local.sandbox.runwhen.com/)

When opening an issue, please include the RunWhen Local version,
target platform (Kubernetes version, cloud provider, etc.), and a
sanitized log excerpt.

## License

Apache License 2.0 — see [`LICENSE`](LICENSE).

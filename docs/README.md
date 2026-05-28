# RunWhen Local Documentation

RunWhen Local is a self-hosted container that scans the cloud and Kubernetes
resources you care about and turns them into a curated list of copy-paste
runbooks (called **SLXs**) that draw from RunWhen's open-source CodeCollections.

This `docs/` tree is split into three top-level buckets so you can find the
right kind of help quickly:

```
docs/
├── user-guide/      # I want to deploy and operate RunWhen Local
├── authoring/       # I want to write CodeBundles, Skills, or generation rules
└── architecture/    # I want to understand how RunWhen Local works internally
```

## Quick links

### Run RunWhen Local

* [Getting started](./user-guide/getting-started.md) - 5-minute quickstart
* [Local Docker / Podman install](./user-guide/installation/local-docker.md)
* [Kubernetes standalone install](./user-guide/installation/kubernetes-standalone.md)
* [`workspaceInfo.yaml` reference](./user-guide/configuration/workspace-info.md)
* [Cloud discovery: Azure](./user-guide/cloud-discovery/azure.md) /
  [AWS](./user-guide/cloud-discovery/aws.md) /
  [GCP](./user-guide/cloud-discovery/gcp.md) /
  [Kubernetes](./user-guide/cloud-discovery/kubernetes.md)
* [Troubleshooting](./user-guide/troubleshooting/stuck.md)

### Author CodeBundles, Skills, and generation rules

* [Concepts: CodeBundle / Skill / SLX / Runbook](./authoring/concepts.md)
* [Indexed resources reference](./authoring/indexed-resources/README.md) -
  what RunWhen Local can discover, and the shape of the data your generation
  rules will see
* [Generation rules: schema, lifecycle, and examples](./authoring/generation-rules/README.md)

### Internals

* [High-level architecture](./architecture/overview.md)
* [Self-hosted runner architecture](./architecture/high-level-architecture-self-hosted-runner-connected.md)
* [Resource store query API](./architecture/resource-store-query-api.md)
* [ResourceWriter](./architecture/resource-writer.md)
* [Kubernetes Level-of-Detail internals](./architecture/kubernetes-lod/README.md)
* [Workspace generation statistics](./architecture/workspace-generation-statistics.md)
* [Container development guide](./architecture/development.md)

## Project links

* GitHub: [runwhen-contrib/runwhen-local](https://github.com/runwhen-contrib/runwhen-local)
* Slack: [join the RunWhen workspace](https://runwhen.slack.com/join/shared_invite/zt-1l7t3tdzl-IzB8gXDsWtHkT8C5nufm2A)
* Hosted platform docs: [docs.runwhen.com](https://docs.runwhen.com)

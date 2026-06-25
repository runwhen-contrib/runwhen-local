# User Guide

How to deploy and operate RunWhen Local against your own cloud and Kubernetes
estate. Start with [getting-started](./getting-started.md) if you've never run
it before.

## Install

* [Local Docker / Podman](./installation/local-docker.md)
* [Kubernetes (standalone)](./installation/kubernetes-standalone.md)
* [Kubernetes self-hosted runner (connected to the platform)](./installation/kubernetes-self-hosted/README.md)

## Configure

The single source of truth is `workspaceInfo.yaml`. Start with the reference
and dip into the specific guides as needed.

* [`workspaceInfo.yaml` reference](./configuration/workspace-info.md)
* [Discovery level of detail](./configuration/level-of-detail.md)
* [Group / map customizations](./configuration/group-and-map-customizations.md)
* [CodeCollection configuration](./configuration/codecollection.md)
* [Kubernetes config reload](./configuration/config-reload.md) — automatic pod restart on ConfigMap/Secret changes
* [Helm configuration](./configuration/helm.md)
* [Proxy & outbound connections](./configuration/proxy-and-outbound.md)
* [Private container registry](./configuration/private-registry.md)

Examples:

* [`workspaceinfo-overrides-example.yaml`](./configuration/workspaceinfo-overrides-example.yaml)
* [`workspaceinfo-multi-context-example.yaml`](./configuration/workspaceinfo-multi-context-example.yaml)

## Connect cloud / Kubernetes platforms

RunWhen Local discovers resources from each platform you point it at.
Per-platform setup (credentials, scope, supported resource types):

* [Microsoft Azure](./cloud-discovery/azure.md)
* [Amazon Web Services](./cloud-discovery/aws.md) -
  [IAM key reference](./cloud-discovery/aws-iam-keys.md)
* [Google Cloud Platform](./cloud-discovery/gcp.md) -
  extras: [extras-1](./cloud-discovery/gcp-extras-1.md),
  [extras-2](./cloud-discovery/gcp-extras-2.md)
* [Kubernetes](./cloud-discovery/kubernetes.md)

## Use the generated workspace

* [Feature overview](./features/README.md)
* [Workspace builder](./features/workspace-builder.md)
* [Upload to RunWhen Platform](./features/upload-to-runwhen-platform.md)

## Operate

* [Privacy and security](./privacy-and-security.md)
* [Release notes](./release-notes.md)

## Troubleshoot

* [Stuck? Read this](./troubleshooting/stuck.md)
* [`configProvided` overrides](./troubleshooting/config-overrides.md) -
  [troubleshooting them](./troubleshooting/config-overrides-troubleshooting.md)
* [CloudQuery debug logging](./troubleshooting/cloudquery-debug-logging.md)

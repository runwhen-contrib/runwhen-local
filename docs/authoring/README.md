# Authoring Guide

Everything you need to extend RunWhen Local: write CodeBundles, ship Skills,
and teach the workspace builder how to wire them up via generation rules.

If you only want to *use* RunWhen Local against your own infrastructure, see
the [user guide](../user-guide/README.md) instead.

## Concepts

* [CodeBundle / Skill / SLX / Runbook terminology](./concepts.md) - read this
  first; the rest of the authoring docs assume you know what these mean.

## Indexed resources

Generation rules match against resources discovered by RunWhen Local's
indexers. Before you can write a rule that targets, say, an Azure App Service
or a Kubernetes Deployment, you need to know:

* Whether the indexer actually discovers that resource type today.
* What the data looks like once it's been normalized.
* Which fields are stable enough to match against.

Reference docs per platform:

* [Indexed resources overview](./indexed-resources/README.md)
* [Azure indexer](./indexed-resources/azure.md) - 25 typed resource types,
  with the data shape your generation rules will see for each.
* [Kubernetes indexer](./indexed-resources/kubernetes.md)
* [AWS indexer](./indexed-resources/aws.md)
* [GCP indexer](./indexed-resources/gcp.md)

## Generation rules

Generation rules are the bridge between an indexed resource and a rendered
SLX. They live in CodeBundles under `.runwhen/generation-rules/`.

* [Generation rules: schema, lifecycle, and how-to](./generation-rules/README.md)
* [Tag-hierarchy contract](./generation-rules/tag-hierarchy-contract.md) -
  how SLX names are composed from the resource graph.
* Worked examples:
  * [Azure VM + disk runbook](./generation-rules/examples/azure-vm-disk-runbook.md)
  * [Azure Key Vault SLX](./generation-rules/examples/azure-keyvault-slx.md)
  * [Kubernetes Deployment SLX](./generation-rules/examples/kubernetes-deployment-slx.md)
  * [Multi-resource runbook](./generation-rules/examples/multi-resource-runbook.md)

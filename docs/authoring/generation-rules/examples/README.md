# Generation rule examples

Four end-to-end examples that exercise different patterns. Each example
shows the matching resource, the rule YAML, and a sketch of the rendered
output. Use them as starting points for your own CodeBundles.

| Example | Pattern |
| --- | --- |
| [Azure VM + disk runbook](./azure-vm-disk-runbook.md) | Single resource type, predicate over tags. |
| [Azure Key Vault SLX](./azure-keyvault-slx.md) | Single resource type with a `SKILL.md` overlay. |
| [Kubernetes Deployment SLX](./kubernetes-deployment-slx.md) | Predicates over `metadata` + `spec`, namespace-scoped. |
| [Multi-resource runbook](./multi-resource-runbook.md) | A rule that bundles several related resources into one SLX. |

For the schema reference, see [../README.md](../README.md).

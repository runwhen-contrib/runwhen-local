# Indexed resources

Generation rules can only match against resources that an indexer has
actually written to the resource store. This section is the authoritative
reference for what each indexer discovers and the data shape that arrives
in your generation rules.

## Per-platform reference

* [Azure](./azure.md) - native `azure-mgmt-*` SDK indexer (`azureapi`).
  Full parity with the legacy CloudQuery Azure plugin: 619 indexable
  resource types, 25 typed (rich-payload) plus 594 generic (basic
  envelope). Sortable catalog at
  [azure-resource-catalog.md](./azure-resource-catalog.md).
* [Kubernetes](./kubernetes.md) - in-cluster scan via the Kubernetes Python
  client, plus per-namespace LOD support.
* [AWS](./aws.md) - CloudQuery-backed indexer.
* [GCP](./gcp.md) - CloudQuery-backed indexer.

## Common resource shape

Every discovered resource lands in the resource store as a normalized dict
with at least:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | The platform's canonical resource ID (ARM ID for Azure, ARN for AWS, `/api/v1/.../<name>` for Kubernetes, etc.). |
| `name` | string | Human-friendly name. |
| `resource_type` | string | RunWhen Local's canonical type name. Use this in generation rule `match.resource_type`. |
| `subscription_id` / `account_id` / `project_id` | string | Cloud account scope. Always set for cloud platforms. |
| `tags` | dict | Always a dict, may be empty. Cloud-platform user tags. |
| `properties` | dict | Platform-specific payload (preserved verbatim). |

Indexer-specific fields layer on top of those common ones; per-platform
docs spell out the extras and give example payloads.

## Selective vs unbounded discovery

All indexers honor the `defaultLOD` / `resourceGroupLevelOfDetails`
contract from `workspaceInfo.yaml`:

* `defaultLOD: detailed` (and any non-`none` value) means **unbounded
  discovery** - the indexer enumerates the whole subscription / account /
  cluster.
* `defaultLOD: none` plus a finite list of "keep this" entries means
  **selective discovery** - the indexer scopes its API calls to exactly
  those resource groups / namespaces.

When you're authoring generation rules in a CodeBundle, you don't usually
have to think about this; you just match resources. But it does affect
*which* resources show up at runtime. See the user-facing
[level-of-detail guide](../../user-guide/configuration/level-of-detail.md)
and the architecture-level
[Kubernetes-LOD internals](../../architecture/kubernetes-lod/README.md) for
the full mechanics.

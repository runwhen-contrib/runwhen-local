# AWS indexer internals

Engineering-level reference for the native AWS SDK indexer (`awsapi`). For the
user-facing list of supported types and data shapes, see
[indexed-resources/aws.md](../authoring/indexed-resources/aws.md).

## Why a second indexer?

Historically RunWhen Local discovered AWS resources via the CloudQuery AWS
plugin (`indexers/cloudquery.py`). That works, but it pulls a heavy Go binary,
writes to an intermediate SQLite, and bundles its own AWS API coverage. The
native indexer (`indexers/awsapi.py`) was added so RunWhen Local can:

* Discover only what `workspaceInfo.yaml` actually asks for (per-account scope
  + generation-rule-driven type selection).
* Use first-party AWS Cloud Control API + `boto3` SDKs and skip the CloudQuery
  intermediate.
* Add new resource types incrementally without bumping a separate CloudQuery
  plugin version.

The end goal is to remove CloudQuery entirely once Azure, GCP, and AWS all have
native indexers at parity (AWS is the last of the three). Both indexers live
in-tree and share the same downstream pipeline; the toggle is
`awsIndexerBackend: cloudquery|awsapi` in `workspaceInfo.yaml` (or
`WB_AWS_INDEXER_BACKEND`).

## Cloud Control is the parity workhorse

Like GCP's Cloud Asset Inventory, AWS's **Cloud Control API** (`cloudcontrol`
boto3 client, `list_resources` / `get_resource`) is a single broad API that
enumerates hundreds of resource types by their CloudFormation type name. A
`list_resources` call returns each resource's full CFN-schema `Properties`
(a JSON blob), so one call per (account, region, CFN type) covers every
registry type that has a CFN type, with rich payloads. Typed `boto3` service
collectors are a thin enrichment layer for a handful of high-value resources
plus the synthesized `account` anchor.

The join key is the **CloudFormation resource type name**
(`AWS::<Service>::<Entity>`, e.g. `AWS::EC2::Instance`, `AWS::S3::Bucket`) — the
AWS analogue of Azure's ARM type and GCP's CAI asset type.

> **Coverage note.** Cloud Control does not cover every CloudQuery table. Tables
> with no Cloud Control type (cost/usage reports, metric rollups, inventory
> sub-resources, the synthesized account anchor) are pinned to `null` in the
> overrides; the generic pass skips them, exactly like GCP's `null` CAI types.
> They still resolve via `find_spec` for gen-rule parity and would need a
> dedicated typed collector if ever referenced.

## Pieces

```
src/indexers/
├── awsapi.py                         # the orchestration loop
├── awsapi_resource_types.py          # Cloud Control generic collector + typed SDK collectors + specs
├── awsapi_normalizers.py             # Cloud Control resource / SDK payload -> CQ-shaped dict
├── aws_common.py                     # credential + account/region resolution, tag filters
├── aws_resource_type_registry.py     # registry loader (data class)
├── aws_resource_type_registry.yaml   # GENERATED catalog of all CQ tables
└── test_aws*.py / test_awsapi*.py    # unit tests

scripts/aws/
├── sync_aws_resource_type_registry.py    # registry generator
├── aws_resource_type_overrides.yaml      # hand-edited overrides
└── aws_cloudquery_tables.txt             # parity source (CloudQuery hub table list)
```

### `awsapi.py` - the orchestration loop

`index(ctx)` runs in phases:

1. **Bootstrap**: resolves a `boto3.Session` + scope (account + regions) via
   `aws_common.aws_get_session_and_scope` (explicit keys, K8s secret, IRSA / Pod
   Identity, assume-role, or the default credential chain), mirrors the
   credentials into `enrichers.aws`, and publishes the `{account_id:
   account_name}` map the handler reads. The account's effective LOD
   (`accountLevelOfDetails[<account_id>]` -> workspace default) gates discovery:
   an account whose LOD is `NONE` is skipped entirely. AWS LOD is
   **per-account**; the region list is the second scope dimension.
2. **Phase 0 - Account anchor**: the `account` resource (`aws_iam_accounts`) is
   synthesized from the resolved credentials (no API call needed; it gets an
   `arn:aws:iam::<account_id>:root` ARN and `global` region) and written *first*
   so child resources are scoped under it.
3. **Phase 1 - Typed pass**: for each accessed type that has a hand-written
   `boto3` collector (EC2 instances, S3 buckets), call
   `spec.collector(session, account_id, region)`. Regional collectors run once
   per region; global collectors (S3) run once. Rich SDK payloads land in the
   resource store.
4. **Phase 2 - Cloud Control generic pass**: one `list_resources` call per
   (region, CFN type) referenced by accessed *generic* types (typed types are
   excluded so nothing is written twice). Each returned resource is routed by
   its CFN type through `find_spec_by_cfn_type` back to the registry-mapped
   `resource_type_name`.

Every resource flows through: normalize -> tag filter -> handler
`parse_resource_data` -> `writer.add_resource`. A global resource listed from
multiple regional endpoints is de-duplicated by `(resource_type_name, arn)`. The
indexer is generation-rule-driven: only types referenced by loaded gen rules are
collected, plus the mandatory `aws_iam_accounts` anchor.

### Normalization (CloudQuery shape parity)

`AWSPlatformHandler.parse_resource_data` (in `enrichers/aws.py`, shared with the
CloudQuery path) requires an **ARN** and reads `name`, `account_id`, `region`,
and `tags`. `awsapi_normalizers` produces exactly that shape from either source:

* `normalize_cloudcontrol_resource` parses the JSON `Properties` blob of a
  Cloud Control `ResourceDescription`, hoists it to the top level, and stamps
  the handler-read fields.
* `normalize_aws_resource` does the same for a typed boto3 payload.
* AWS tags (a list of `{"Key","Value"}` pairs, or a dict) collapse to a flat
  `{key: value}` dict so cross-cloud include/exclude tag matchers work
  unchanged.
* When a payload carries no ARN, a structurally-valid one is synthesized from
  the CFN type + scope (`arn:aws:<service>:<region>:<account>:<entity>/<id>`)
  because the handler parses the ARN for account/region/service.

Because both backends normalize into the same dict, generation rules reference
the **CloudQuery table name** as `resource_type` and don't change when the
backend flips.

### The registry (`aws_resource_type_registry.yaml`)

Generated by `scripts/aws/sync_aws_resource_type_registry.py` from three inputs:

1. The CloudQuery AWS table list (`scripts/aws/aws_cloudquery_tables.txt`,
   currently the v33.26.0 hub snapshot, 1119 tables) — the parity source.
2. A heuristic mapping `aws_<service>_<entity_plural>` ->
   `AWS::<Service>::<EntitySingularPascal>` (singularises + PascalCases the
   entity; maps service tokens to CFN service segments, e.g. `ec2` -> `EC2`,
   `s3` -> `S3`).
3. Hand-curated overrides in `scripts/aws/aws_resource_type_overrides.yaml`
   (service-segment remaps, pinned CFN types for irregular tables — e.g.
   `aws_rds_instances` -> `AWS::RDS::DBInstance` — aliases, typed-collector
   flags, the mandatory `aws_iam_accounts` anchor, and `null` CFN types for
   tables with no Cloud Control equivalent so the generic pass skips them).

Never hand-edit the YAML; edit the overrides and re-run the sync script.
`python scripts/aws/sync_aws_resource_type_registry.py --dry-run` reports drift.

### Coverage parity vs. CloudQuery

Every one of the 1119 CloudQuery tables resolves via `find_spec` (by canonical
table name or alias). Tables with a CFN type are discoverable via the Cloud
Control pass the moment a generation rule references them; the typed tables get
richer SDK payloads. Tables with no Cloud Control equivalent map to `null` and
would need a dedicated typed collector if ever referenced — the same
incremental model the Azure and GCP indexers use.

## Authentication

`aws_common.aws_get_session_and_scope` reuses `aws_utils.get_aws_credential`,
which resolves, in order: explicit access keys in `workspaceInfo.yaml`,
credentials from a Kubernetes secret, IRSA / Pod Identity, an assumed role, or
the default credential chain (instance profile / environment). It returns a
`boto3.Session` for the Cloud Control + typed service clients, the resolved
account id / alias / human-readable name, and the region list (from `regions`,
`region`/`defaultRegion`, the credential's region, `AWS_REGION` /
`AWS_DEFAULT_REGION`, or `us-east-1` as a last resort).

## Adding a typed collector

1. Ensure the table is in the registry (regenerate if needed) and flag it as a
   `typed_collector` in the overrides YAML.
2. Implement `_collect_<type>(session, account_id, region)` in
   `awsapi_resource_types.py` (lazy-construct the `boto3` service client from
   the passed-in `session`) and register it in `_TYPED_COLLECTORS` keyed by
   canonical table name, with its regional/global flag.
3. Its CFN type is automatically excluded from the generic pass so the resource
   is written once, from the richer SDK payload.

## Tests

* `test_aws_resource_type_registry.py` — loader contract + spec materialization.
* `test_awsapi_normalizers.py` — Cloud Control / SDK normalization + handler
  round-trip.
* `test_awsapi_selective.py` — per-account selective discovery + Cloud Control
  filter dispatch.

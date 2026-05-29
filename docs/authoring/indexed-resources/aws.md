# AWS indexer

RunWhen Local can discover AWS resources two ways, selected by
`awsIndexerBackend` in `workspaceInfo.yaml`:

* **`cloudquery`** (default): invokes the
  [CloudQuery AWS plugin](https://hub.cloudquery.io/plugins/source/cloudquery/aws)
  against the account(s) you've configured and reads the resulting SQLite
  intermediate.
* **`awsapi`**: the native indexer — uses the AWS Cloud Control API plus
  first-party `boto3` SDKs, no CloudQuery binary. It discovers only the resource
  types your generation rules reference, per account/region, and respects
  per-account `accountLevelOfDetails` (an account with LOD `none` is skipped).
  See [AWS indexer internals](../../architecture/aws-indexer-internals.md) for
  the design.

```yaml
# workspaceInfo.yaml
awsIndexerBackend: awsapi
```

Either way the CodeBundle-facing contract is the same: generation rules
reference the **CloudQuery table name** as `resource_type` (e.g.
`aws_ec2_instances`), and field shapes follow the CloudQuery AWS plugin output.
The native backend normalizes Cloud Control payloads into that same shape, so
rules don't change when you flip the backend. Per-table schemas live in the
[plugin's table reference](https://hub.cloudquery.io/plugins/source/cloudquery/aws/latest/tables).

For credential setup, IAM permissions, and `workspaceInfo.yaml` snippets, see
the user guide's [AWS cloud-discovery page](../../user-guide/cloud-discovery/aws.md)
and the [IAM key reference](../../user-guide/cloud-discovery/aws-iam-keys.md).

## Common matchable types

Generation rules in the contrib CodeBundles most often target:

* `aws_ec2_instances` (`AWS::EC2::Instance`)
* `aws_ec2_volumes`, `aws_ec2_snapshots`
* `aws_s3_buckets` (`AWS::S3::Bucket`)
* `aws_rds_instances` (`AWS::RDS::DBInstance`), `aws_rds_clusters`
* `aws_eks_clusters` (`AWS::EKS::Cluster`)
* `aws_lambda_functions`
* `aws_elbv2_load_balancers`
* `aws_ecs_clusters`, `aws_ecs_services`
* `aws_iam_users`, `aws_iam_roles`

Use the CloudQuery table name as `resource_type` in your generation rule. Field
shapes follow the CloudQuery AWS plugin output, so the easiest reference is the
plugin's per-table schema page.

### Typed vs. generic types

The native `awsapi` backend ships hand-written `boto3` collectors for
`aws_ec2_instances` and `aws_s3_buckets` (richer payloads); every other table
with a CloudFormation type is served by the Cloud Control API generic pass. The
mandatory `aws_iam_accounts` anchor (alias `account`) is synthesized from your
credentials and emitted first so every other resource is scoped under its
account. The full mapping of CloudQuery table -> CloudFormation type lives in
the generated registry (`src/indexers/aws_resource_type_registry.yaml`).

Some CloudQuery tables (cost/usage reports, metric rollups, certain inventory
sub-resources) have no Cloud Control type; they map to `null` in the registry
and are skipped by the generic pass. They still resolve by name for gen-rule
compatibility, and could get a dedicated typed collector if a rule needs them.

## Running native AWS discovery locally

1. Set the toggle in `workspaceInfo.yaml`:

```yaml
awsIndexerBackend: awsapi
cloudConfig:
  aws:
    # credentials resolve via aws_utils: explicit keys, a K8s secret,
    # IRSA / Pod Identity, an assumed role, or the default credential chain
    regions:
      - us-east-1
      - us-west-2
```

   (Or export `WB_AWS_INDEXER_BACKEND=awsapi`.)

2. Run discovery the usual way (e.g. `./run.sh` / the documented CLI). When
   `awsapi` is selected, the CloudQuery indexer skips the AWS block and the
   native indexer handles it; the two are mutually exclusive per platform.

## Roadmap

The native `awsapi` indexer is the path toward removing the CloudQuery
dependency entirely (alongside `azureapi` and `gcpapi`). `cloudquery` remains
the default backend until the native path has been validated across the contrib
CodeBundles.

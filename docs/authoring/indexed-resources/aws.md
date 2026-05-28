# AWS indexer

The AWS indexer is currently CloudQuery-backed: RunWhen Local invokes the
[CloudQuery AWS plugin](https://hub.cloudquery.io/plugins/source/cloudquery/aws),
runs it against your account(s), and reads the resulting SQLite
intermediate. For supported tables, see the [CloudQuery AWS plugin
tables reference](https://hub.cloudquery.io/plugins/source/cloudquery/aws/v32.0.0/tables).

For credential setup, IAM permissions, and `workspaceInfo.yaml` snippets,
see the user guide's [AWS cloud-discovery page](../../user-guide/cloud-discovery/aws.md)
and the [IAM key reference](../../user-guide/cloud-discovery/aws-iam-keys.md).

## Common matchable types

Generation rules in the contrib CodeBundles most often target:

* `aws_ec2_instances` (`AWS::EC2::Instance`)
* `aws_ec2_volumes`, `aws_ec2_snapshots`
* `aws_s3_buckets` (`AWS::S3::Bucket`)
* `aws_rds_instances`, `aws_rds_clusters`
* `aws_eks_clusters` (`AWS::EKS::Cluster`)
* `aws_lambda_functions`
* `aws_elbv2_load_balancers`
* `aws_ecs_clusters`, `aws_ecs_services`
* `aws_iam_users`, `aws_iam_roles`

Use the CloudQuery table name as `resource_type` in your generation
rule. The shape of the data is exactly what the CloudQuery AWS plugin
emits (no further normalization), so the easiest reference is the
plugin's per-table schema page.

## Roadmap

A future native `awsapi` indexer (analogous to `azureapi`) is on the
roadmap and will be documented here when it lands; the CodeBundle-facing
contract (resource type names, top-level fields) is intended to remain
the same to avoid breaking generation rules.

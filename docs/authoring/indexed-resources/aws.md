# AWS indexed resources

When you write a generation rule, you tell the workspace builder which cloud
resources to match by listing one or more resource types under
`resourceTypes`. This page lists the resource types the AWS indexer
discovers, the names that work, and a working match rule example.

A transition from CloudQuery resource names to the native `awsapi` indexer
names is underway — the alias column lists the legacy CloudQuery names which
will be deprecated. **1,119 resource types total** — 3 typed (rich payload),
1,116 generic (Cloud Control envelope). [Full catalog →](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/authoring/indexed-resources/aws-resource-catalog.md)

## Commonly used resource types

| Resource type | Aliases | Notes |
|---|---|---|
| `aws_iam_accounts` | `account`, `aws_account` | anchor, always indexed |
| `aws_ec2_instances` | `ec2_instance` | typed — rich payload |
| `aws_ec2_volumes` | — | |
| `aws_ec2_snapshots` | — | |
| `aws_s3_buckets` | — | typed — rich payload |
| `aws_rds_instances` | — | |
| `aws_rds_clusters` | — | |
| `aws_eks_clusters` | — | |
| `aws_lambda_functions` | — | |
| `aws_elbv2_load_balancers` | — | |
| `aws_ecs_clusters` | — | |
| `aws_ecs_services` | — | |
| `aws_iam_users` | — | |
| `aws_iam_roles` | — | |

## Built-in matchable properties

| Property | Value |
|---|---|
| `name` | Resource name |
| `tags` | AWS tags |
| `region` | AWS region |
| `account_id` | AWS account ID |

Use `resource/<path>` to reach raw JSON fields — e.g.
`resource/spec/instanceType` or `resource/status/state/name`.

Typed resources (`aws_ec2_instances`, `aws_s3_buckets`, `aws_iam_accounts`)
carry a rich payload with all SDK fields. The other 1,116 types are generic
(Cloud Control envelope) — they carry a standard shape but may miss some
per-service fields.

## Example match rule

```yaml
apiVersion: runwhen.com/v1
kind: GenerationRules
spec:
  platform: aws
  generationRules:
    - resourceTypes:
        - aws_ec2_instances
      matchRules:
        - type: and
          matches:
            - type: pattern
              properties: [tags]
              pattern: "production"
              mode: substring
            - type: pattern
              properties: ["resource/spec/instanceType"]
              pattern: "t3\\."
              mode: substring
      slxs:
        - baseName: ec2-health
          qualifiers: [account_id, region, name]
          baseTemplateName: aws-ec2-health
          levelOfDetail: detailed
          outputItems:
            - type: slx
            - type: runbook
```

> [!NOTE]
> Only 3 types carry a rich SDK payload. The other 1,116 use a Cloud Control API
> envelope — standard fields are available but some per-service fields may be
> absent. Check the [full catalog](https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/authoring/indexed-resources/aws-resource-catalog.md)
> for tier status. For credential setup and IAM permissions, see the
> [cloud discovery user guide](../../user-guide/cloud-discovery/aws.md).
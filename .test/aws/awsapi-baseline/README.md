# awsapi-baseline

Smoke-test for the **native `awsapi` indexer** (AWS Cloud Control API + boto3),
the AWS counterpart of `.test/gcp/gcp-and-k8s` (gcpapi baseline) and
`.test/azure/no-aks-resources` (azureapi baseline).

It selects `awsIndexerBackend: awsapi` + `resourceStoreBackend: sqlite`, runs
discovery against a static AWS sandbox account, then asserts directly against
`output/resources.sqlite` (resilient presence/threshold checks, not SLX count).

## Credentials

Provide an `aws.secret` file in shell-export format (same shape as
`.test/aws/basic/aws.secret`):

```
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-west-2
```

`aws.secret` is git-ignored. Only the `AWS_*` credential lines are consumed and
forwarded into the container env; the keys never land in `workspaceInfo.yaml`.
The native indexer resolves them through the boto3 default credential chain.

## Running locally

```bash
cd .test/aws/awsapi-baseline
# create aws.secret (see above)
task ci-test-awsapi-baseline
```

This runs: `generate-awsapi-baseline-config` -> `build-rwl` -> `run-rwl-discovery`
-> `assert-awsapi-baseline`. Because `src/**` changes ship a new indexer, the
test image is rebuilt as part of the flow.

## Assertions (`assert-awsapi-baseline`)

1. The **native `awsapi`** backend ran (not CloudQuery) -- grepped from the
   container logs.
2. The **account anchor** (`aws_iam_accounts`, surfaced as `account`) is present
   in the resource store. It is synthesized from the resolved credentials, so it
   is always present on a successful run.
3. **>= 1** AWS resource overall.
4. The default networking the Cloud Control pass always finds is present
   (`aws_ec2_vpcs` and `aws_ec2_security_groups`, >= 1 each). Every AWS
   account/region ships a default VPC + default security group, and the bundled
   generation rules reference both.

The sandbox is intentionally minimal and its real resources come and go, so the
assertions are presence/threshold only -- no exact counts and no required typed
collectors (S3 / EC2 instances may legitimately be empty).

## Cleanup

```bash
task clean
```

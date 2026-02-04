output "account_roles" {
  description = "Map of simulated account names to role ARNs"
  value = {
    for k, v in aws_iam_role.account_roles : k => v.arn
  }
}

output "production_role_arn" {
  description = "ARN of the production role"
  value       = aws_iam_role.account_roles["production"].arn
}

output "staging_role_arn" {
  description = "ARN of the staging role"
  value       = aws_iam_role.account_roles["staging"].arn
}

output "development_role_arn" {
  description = "ARN of the development role"
  value       = aws_iam_role.account_roles["development"].arn
}

output "test_buckets" {
  description = "Map of simulated account names to bucket names"
  value = {
    for k, v in aws_s3_bucket.test_buckets : k => v.id
  }
}

output "account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "region" {
  description = "AWS region"
  value       = data.aws_region.current.name
}

output "assume_role_arn" {
  description = "ARN of the IAM role to assume"
  value       = aws_iam_role.assume_role_test.arn
}

output "external_id" {
  description = "External ID required for assume role"
  value       = var.external_id
}

output "role_name" {
  description = "Name of the IAM role"
  value       = aws_iam_role.assume_role_test.name
}

output "test_bucket_name" {
  description = "Name of the test S3 bucket"
  value       = aws_s3_bucket.test_bucket.id
}

output "test_bucket_arn" {
  description = "ARN of the test S3 bucket"
  value       = aws_s3_bucket.test_bucket.arn
}

output "account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "region" {
  description = "AWS region"
  value       = data.aws_region.current.name
}

output "caller_arn" {
  description = "ARN of the current caller (who can assume the role)"
  value       = data.aws_caller_identity.current.arn
}

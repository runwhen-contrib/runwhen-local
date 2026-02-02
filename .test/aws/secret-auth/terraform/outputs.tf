output "aws_access_key_id" {
  description = "AWS access key ID for test user"
  value       = aws_iam_access_key.test_user.id
  sensitive   = true
}

output "aws_secret_access_key" {
  description = "AWS secret access key for test user"
  value       = aws_iam_access_key.test_user.secret
  sensitive   = true
}

output "iam_user_name" {
  description = "Name of the IAM user created"
  value       = aws_iam_user.test_user.name
}

output "iam_user_arn" {
  description = "ARN of the IAM user created"
  value       = aws_iam_user.test_user.arn
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

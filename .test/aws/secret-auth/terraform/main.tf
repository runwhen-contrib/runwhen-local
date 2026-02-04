terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  common_tags = {
    Project     = "runwhen-local"
    Environment = "test"
    Purpose     = "secret-auth-testing"
    Lifecycle   = "deleteme"
  }
}

# IAM user with limited permissions for testing
resource "aws_iam_user" "test_user" {
  name = "runwhen-secret-test-user-${var.resource_suffix}"
  tags = local.common_tags
}

resource "aws_iam_access_key" "test_user" {
  user = aws_iam_user.test_user.name
}

resource "aws_iam_user_policy" "test_user_policy" {
  name = "runwhen-secret-test-policy"
  user = aws_iam_user.test_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadOnlyDiscovery"
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "s3:List*",
          "s3:GetBucket*",
          "s3:GetObject",
          "iam:GetUser",
          "iam:ListUsers",
          "iam:ListAccountAliases",
          "sts:GetCallerIdentity"
        ]
        Resource = "*"
      }
    ]
  })
}

# Create a test S3 bucket for discovery
resource "aws_s3_bucket" "test_bucket" {
  bucket = "runwhen-secret-test-${var.resource_suffix}-${data.aws_caller_identity.current.account_id}"
  tags   = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "test_bucket" {
  bucket = aws_s3_bucket.test_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

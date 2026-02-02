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
    Purpose     = "assume-role-testing"
    Lifecycle   = "deleteme"
  }
}

# IAM Role that can be assumed
resource "aws_iam_role" "assume_role_test" {
  name = "runwhen-assume-role-test-${var.resource_suffix}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowAssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = data.aws_caller_identity.current.arn
        }
        Action = "sts:AssumeRole"
        Condition = {
          StringEquals = {
            "sts:ExternalId" = var.external_id
          }
        }
      },
      # Also allow assuming without external ID for simpler testing
      {
        Sid    = "AllowAssumeRoleNoExternalId"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "assume_role_test_policy" {
  name = "runwhen-assume-role-test-policy"
  role = aws_iam_role.assume_role_test.id

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
          "iam:GetRole",
          "iam:ListUsers",
          "iam:ListRoles",
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
  bucket = "runwhen-assume-role-test-${var.resource_suffix}-${data.aws_caller_identity.current.account_id}"
  
  tags = merge(local.common_tags, {
    lod = "detailed"
  })
}

resource "aws_s3_bucket_public_access_block" "test_bucket" {
  bucket = aws_s3_bucket.test_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

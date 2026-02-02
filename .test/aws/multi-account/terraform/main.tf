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
    Purpose     = "multi-account-testing"
    Lifecycle   = "deleteme"
  }
  
  # Simulate multiple accounts with different roles
  simulated_accounts = {
    "production" = {
      role_name = "runwhen-prod-role-${var.resource_suffix}"
      permissions = [
        "ec2:Describe*",
        "s3:List*",
        "s3:GetBucket*",
        "rds:Describe*",
        "sts:GetCallerIdentity"
      ]
    }
    "staging" = {
      role_name = "runwhen-staging-role-${var.resource_suffix}"
      permissions = [
        "ec2:Describe*",
        "s3:List*",
        "s3:GetBucket*",
        "lambda:List*",
        "lambda:GetFunction",
        "sts:GetCallerIdentity"
      ]
    }
    "development" = {
      role_name = "runwhen-dev-role-${var.resource_suffix}"
      permissions = [
        "ec2:Describe*",
        "s3:List*",
        "s3:GetBucket*",
        "sts:GetCallerIdentity"
      ]
    }
  }
}

#------------------------------------------------------------------------------
# IAM Roles (simulating cross-account roles)
#------------------------------------------------------------------------------
resource "aws_iam_role" "account_roles" {
  for_each = local.simulated_accounts

  name = each.value.role_name

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
      },
      {
        Sid    = "AllowAssumeRoleFromAccount"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, {
    SimulatedAccount = each.key
  })
}

resource "aws_iam_role_policy" "account_policies" {
  for_each = local.simulated_accounts

  name = "${each.key}-discovery-policy"
  role = aws_iam_role.account_roles[each.key].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "DiscoveryPermissions"
        Effect   = "Allow"
        Action   = each.value.permissions
        Resource = "*"
      }
    ]
  })
}

#------------------------------------------------------------------------------
# Test S3 Buckets (one per "account")
#------------------------------------------------------------------------------
resource "aws_s3_bucket" "test_buckets" {
  for_each = local.simulated_accounts

  bucket = "runwhen-${each.key}-test-${var.resource_suffix}-${data.aws_caller_identity.current.account_id}"
  
  tags = merge(local.common_tags, {
    SimulatedAccount = each.key
    lod              = "detailed"
  })
}

resource "aws_s3_bucket_public_access_block" "test_buckets" {
  for_each = local.simulated_accounts

  bucket = aws_s3_bucket.test_buckets[each.key].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

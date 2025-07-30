# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local values
locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name
  
  # Test repository names
  test_repositories = [
    "runwhen/runwhen-local",
    "runwhen/runner", 
    "otel/opentelemetry-collector",
    "prom/pushgateway",
    "runwhen/runwhen-contrib-rw-cli-codecollection-main",
    "runwhen/runwhen-contrib-rw-public-codecollection-main",
    "runwhen/runwhen-contrib-rw-generic-codecollection-main",
    "runwhen/runwhen-contrib-rw-workspace-utils-main"
  ]
  
  # Tags for all resources
  common_tags = {
    Project     = "runwhen-local"
    Environment = "test"
    Purpose     = "ecr-registry-sync-testing"
    Lifecycle   = "deleteme"
    CreatedBy   = "terraform"
  }
}

# ECR Repositories for testing
resource "aws_ecr_repository" "test_repositories" {
  for_each = toset(local.test_repositories)
  
  name                 = "${var.repository_prefix}${each.value}"
  image_tag_mutability = "MUTABLE"
  
  encryption_configuration {
    encryption_type = "AES256"
  }
  
  image_scanning_configuration {
    scan_on_push = false
  }
  
  tags = merge(local.common_tags, {
    Repository = each.value
  })
}

# ECR Repository Policy - Allow pull/push for testing
resource "aws_ecr_repository_policy" "test_repository_policy" {
  for_each   = aws_ecr_repository.test_repositories
  repository = each.value.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPullPush"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${local.account_id}:root"
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:GetAuthorizationToken"
        ]
      }
    ]
  })
}

# ECR Lifecycle Policy to clean up old images
resource "aws_ecr_lifecycle_policy" "test_lifecycle_policy" {
  for_each   = aws_ecr_repository.test_repositories
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["test-"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete untagged images after 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
} 
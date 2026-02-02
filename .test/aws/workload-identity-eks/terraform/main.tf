terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {}

locals {
  common_tags = {
    Project     = "runwhen-local"
    Environment = "test"
    Purpose     = "workload-identity-testing"
    Lifecycle   = "deleteme"
  }
  cluster_name = "runwhen-irsa-test-${var.resource_suffix}"
  
  # Use first 2 AZs
  azs = slice(data.aws_availability_zones.available.names, 0, 2)
}

#------------------------------------------------------------------------------
# VPC
#------------------------------------------------------------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.cluster_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = local.azs
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }

  tags = local.common_tags
}

#------------------------------------------------------------------------------
# EKS Cluster
#------------------------------------------------------------------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = local.cluster_name
  cluster_version = var.eks_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  # Enable IRSA
  enable_irsa = true

  eks_managed_node_groups = {
    default = {
      name = "default"

      min_size     = 1
      max_size     = 2
      desired_size = 1

      instance_types = ["t3.medium"]
      
      labels = {
        Environment = "test"
      }
    }
  }

  tags = local.common_tags
}

#------------------------------------------------------------------------------
# IAM Role for Service Account (IRSA)
#------------------------------------------------------------------------------
resource "aws_iam_role" "runwhen_irsa" {
  name = "runwhen-irsa-${var.resource_suffix}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = module.eks.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${module.eks.oidc_provider}:aud" = "sts.amazonaws.com"
            "${module.eks.oidc_provider}:sub" = "system:serviceaccount:${var.k8s_namespace}:${var.k8s_service_account}"
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "runwhen_irsa_policy" {
  name = "runwhen-discovery-policy"
  role = aws_iam_role.runwhen_irsa.id

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
          "eks:Describe*",
          "eks:List*",
          "sts:GetCallerIdentity"
        ]
        Resource = "*"
      }
    ]
  })
}

#------------------------------------------------------------------------------
# Test S3 Bucket
#------------------------------------------------------------------------------
resource "aws_s3_bucket" "test_bucket" {
  bucket = "runwhen-irsa-test-${var.resource_suffix}-${data.aws_caller_identity.current.account_id}"
  tags   = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "test_bucket" {
  bucket = aws_s3_bucket.test_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

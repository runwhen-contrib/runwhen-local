#------------------------------------------------------------------------------
# EKS Pod Identity Test Infrastructure
# This creates an EKS cluster with Pod Identity enabled for RunWhen Local
#------------------------------------------------------------------------------

locals {
  cluster_name = "runwhen-podid-${var.resource_suffix}"
  common_tags = {
    Environment = "test"
    Project     = "runwhen-local"
    Purpose     = "pod-identity-testing"
    Lifecycle   = "ephemeral"
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {}

#------------------------------------------------------------------------------
# VPC
#------------------------------------------------------------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = local.cluster_name
  cidr = "10.0.0.0/16"

  azs             = slice(data.aws_availability_zones.available.names, 0, 2)
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
# EKS Cluster with Pod Identity
#------------------------------------------------------------------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = local.cluster_name
  cluster_version = var.eks_version

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  # Enable public endpoint access for external connectivity (Codespaces, CI/CD, etc.)
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Allow current IAM user/role to access the cluster
  enable_cluster_creator_admin_permissions = true

  # Enable Pod Identity addon (required for EKS Pod Identity)
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    eks-pod-identity-agent = {
      most_recent = true
    }
  }

  # Note: No OIDC provider needed for Pod Identity!
  enable_irsa = false

  eks_managed_node_groups = {
    default = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"

      tags = merge(local.common_tags, {
        NodeGroup = "default"
      })
    }
  }

  tags = local.common_tags
}

#------------------------------------------------------------------------------
# IAM Role for Pod Identity
#------------------------------------------------------------------------------
resource "aws_iam_role" "runwhen_pod_identity" {
  name = "runwhen-podid-${var.resource_suffix}"

  # Pod Identity trust policy - different from IRSA!
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "pods.eks.amazonaws.com"
        }
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "runwhen_pod_identity_policy" {
  name = "runwhen-discovery-policy"
  role = aws_iam_role.runwhen_pod_identity.id

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
# EKS Pod Identity Association
# This links the IAM role to the Kubernetes service account
#------------------------------------------------------------------------------
resource "aws_eks_pod_identity_association" "runwhen_local" {
  cluster_name    = module.eks.cluster_name
  namespace       = var.k8s_namespace
  service_account = var.k8s_service_account
  role_arn        = aws_iam_role.runwhen_pod_identity.arn

  tags = local.common_tags
}

#------------------------------------------------------------------------------
# EKS Access Entry for Pod Identity IAM Role
# Grants the Pod Identity IAM role read-only access to the EKS cluster
# This allows pods using this role to discover and scan Kubernetes resources
#------------------------------------------------------------------------------
resource "aws_eks_access_entry" "pod_identity_role" {
  cluster_name  = module.eks.cluster_name
  principal_arn = aws_iam_role.runwhen_pod_identity.arn
  type          = "STANDARD"

  tags = merge(local.common_tags, {
    Purpose = "pod-identity-cluster-access"
  })
}

resource "aws_eks_access_policy_association" "pod_identity_role_view" {
  cluster_name  = module.eks.cluster_name
  principal_arn = aws_iam_role.runwhen_pod_identity.arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy"

  access_scope {
    type = "cluster"
  }

  depends_on = [aws_eks_access_entry.pod_identity_role]
}

#------------------------------------------------------------------------------
# Test S3 Bucket
#------------------------------------------------------------------------------
resource "aws_s3_bucket" "test_bucket" {
  bucket = "${local.cluster_name}-${data.aws_caller_identity.current.account_id}"

  tags = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "test_bucket" {
  bucket = aws_s3_bucket.test_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Note: Kubernetes RBAC is created via kubectl in the Taskfile after Helm install
# This avoids Terraform dependency issues with Helm-managed resources

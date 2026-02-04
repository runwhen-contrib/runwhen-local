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

#------------------------------------------------------------------------------
# Kubernetes Provider Configuration
#------------------------------------------------------------------------------
data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_name

  depends_on = [module.eks]
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

#------------------------------------------------------------------------------
# Kubernetes RBAC for RunWhen Local Service Account
# Grants cluster-wide read access for discovery
#------------------------------------------------------------------------------
resource "kubernetes_cluster_role" "runwhen_local_discovery" {
  metadata {
    name = "runwhen-local-discovery"
  }

  rule {
    api_groups = [""]
    resources  = ["nodes", "pods", "services", "endpoints", "namespaces", "events", "configmaps", "secrets", "persistentvolumes", "persistentvolumeclaims"]
    verbs      = ["get", "list", "watch"]
  }

  rule {
    api_groups = ["apps"]
    resources  = ["deployments", "statefulsets", "daemonsets", "replicasets"]
    verbs      = ["get", "list", "watch"]
  }

  rule {
    api_groups = ["batch"]
    resources  = ["jobs", "cronjobs"]
    verbs      = ["get", "list", "watch"]
  }

  rule {
    api_groups = ["networking.k8s.io"]
    resources  = ["ingresses", "networkpolicies"]
    verbs      = ["get", "list", "watch"]
  }

  depends_on = [module.eks]
}

resource "kubernetes_cluster_role_binding" "runwhen_local_discovery" {
  metadata {
    name = "runwhen-local-discovery"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.runwhen_local_discovery.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = var.k8s_service_account
    namespace = var.k8s_namespace
  }

  depends_on = [module.eks]
}

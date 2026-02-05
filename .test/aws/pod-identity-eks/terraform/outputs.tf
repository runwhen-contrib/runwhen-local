output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "region" {
  description = "AWS region"
  value       = data.aws_region.current.name
}

output "account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "pod_identity_role_arn" {
  description = "ARN of the IAM role for Pod Identity"
  value       = aws_iam_role.runwhen_pod_identity.arn
}

output "pod_identity_association_id" {
  description = "ID of the Pod Identity Association"
  value       = aws_eks_pod_identity_association.runwhen_local.id
}

output "k8s_namespace" {
  description = "Kubernetes namespace for RunWhen Local"
  value       = var.k8s_namespace
}

output "k8s_service_account" {
  description = "Kubernetes service account name"
  value       = var.k8s_service_account
}

output "test_bucket_name" {
  description = "Name of the test S3 bucket"
  value       = aws_s3_bucket.test_bucket.id
}

output "test_bucket_arn" {
  description = "ARN of the test S3 bucket"
  value       = aws_s3_bucket.test_bucket.arn
}

output "update_kubeconfig_command" {
  description = "Command to update local kubeconfig"
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${data.aws_region.current.name}"
}

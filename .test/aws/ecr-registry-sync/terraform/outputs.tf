output "registry_url" {
  description = "ECR registry URL"
  value       = "${local.account_id}.dkr.ecr.${local.region}.amazonaws.com"
}

output "account_id" {
  description = "AWS account ID"
  value       = local.account_id
}

output "region" {
  description = "AWS region"
  value       = local.region
}

output "repository_urls" {
  description = "Map of repository names to their URLs"
  value = {
    for repo_name, repo in aws_ecr_repository.test_repositories :
    repo_name => repo.repository_url
  }
}

output "repository_names" {
  description = "List of created repository names"
  value       = [for repo in aws_ecr_repository.test_repositories : repo.name]
}

output "repository_arns" {
  description = "Map of repository names to their ARNs"
  value = {
    for repo_name, repo in aws_ecr_repository.test_repositories :
    repo_name => repo.arn
  }
}

output "test_config" {
  description = "Configuration for registry sync testing"
  value = {
    private_registry    = "${local.account_id}.dkr.ecr.${local.region}.amazonaws.com"
    aws_region         = local.region
    repository_prefix  = var.repository_prefix
    repositories = {
      for repo_name, repo in aws_ecr_repository.test_repositories :
      repo_name => {
        name = repo.name
        url  = repo.repository_url
        arn  = repo.arn
      }
    }
  }
  sensitive = false
} 
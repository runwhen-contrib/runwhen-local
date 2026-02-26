output "project_names" {
  description = "Names of the created ADO test projects"
  value       = { for k, v in azuredevops_project.test : k => v.name }
}

output "project_ids" {
  description = "IDs of the created ADO test projects"
  value       = { for k, v in azuredevops_project.test : k => v.id }
}

output "repository_urls" {
  description = "Clone URLs for the sample-app repos"
  value       = { for k, v in azuredevops_git_repository.app : k => v.remote_url }
}

output "pipeline_ids" {
  description = "Build definition IDs"
  value       = { for k, v in azuredevops_build_definition.ci : k => v.id }
}

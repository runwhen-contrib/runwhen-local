variable "ado_token" {
  description = "Azure DevOps Personal Access Token"
  type        = string
  sensitive   = true
}

variable "ado_org_url" {
  description = "Azure DevOps organization URL"
  type        = string
  default     = "https://dev.azure.com/runwhen-sandbox"
}

variable "project_prefix" {
  description = "Prefix for test project names"
  type        = string
  default     = "rwl-test"
}

variable "projects" {
  description = "Map of test projects to create with their descriptions"
  type = map(object({
    description = string
  }))
  default = {
    "alpha" = { description = "Test project Alpha for RunWhen Local ADO indexer validation" }
    "beta"  = { description = "Test project Beta for RunWhen Local ADO indexer validation" }
  }
}

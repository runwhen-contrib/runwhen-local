variable "subscription_id" {
  type        = string
  description = "Target Azure subscription for the fixture."
}

variable "tenant_id" {
  type        = string
  description = "Azure AD tenant for the service principal."
}

variable "sp_principal_id" {
  type        = string
  description = "Object ID of the SP that runs Terraform / RWL discovery. Granted Key Vault data-plane access."
  default     = ""
}

variable "location" {
  type        = string
  default     = "East US"
  description = "Azure region for all resources."
}

variable "name_prefix" {
  type        = string
  default     = "rwl-azapi"
  description = "Prefix applied to all resource names so they're easy to identify and delete."
}

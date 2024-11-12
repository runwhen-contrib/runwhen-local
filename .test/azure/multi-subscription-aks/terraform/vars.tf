variable "resource_group" {
  type = string
}

variable "location" {
  type    = string
  default = "East US"
}

variable "cluster_name" {
  type    = string
  default = "East US"
}

variable "tags" {
  type = map(string)
}

# Define variables for each cluster
variable "subscription_id_1" { type = string }
variable "subscription_id_2" { type = string }
variable "tenant_id" { type = string }
variable "sp_principal_id" { type = string }

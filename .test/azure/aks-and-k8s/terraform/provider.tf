terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.7.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      # Allow RG delete during CI cleanup even if AKS/cluster is still deleting;
      # Azure API will cascade-delete nested resources.
      prevent_deletion_if_contains_resources = false
    }
  }
  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id
}


provider "azuread" {}
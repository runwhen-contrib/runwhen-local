terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.7.0"
    }
  }
}

provider "azurerm" {
  features {}
  alias           = "cluster_1"
  subscription_id = var.subscription_id_1
  tenant_id       = var.tenant_id
}

provider "azurerm" {
  features {}
  alias           = "cluster_2"
  subscription_id = var.subscription_id_2
  tenant_id       = var.tenant_id
}


provider "azuread" {}
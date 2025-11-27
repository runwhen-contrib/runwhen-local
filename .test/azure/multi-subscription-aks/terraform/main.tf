# Cluster 1 Resources

# # Resource Group
# resource "azurerm_resource_group" "cluster_1_rg" {
#   provider = azurerm.cluster_1
#   name     = "azure-aks-1"
#   location = "East US"
#   tags = {
#     "env"       = "test"
#     "lifecycle" = "deleteme"
#     "product"   = "runwhen"
#   }
# }

# # Managed Identity
# resource "azurerm_user_assigned_identity" "cluster_1_identity" {
#   provider            = azurerm.cluster_1
#   name                = "aks-cl-1-identity"
#   location            = azurerm_resource_group.cluster_1_rg.location
#   resource_group_name = azurerm_resource_group.cluster_1_rg.name
# }

# # Role Assignment for Service Principal
# resource "azurerm_role_assignment" "cluster_1_sp_owner" {
#   provider             = azurerm.cluster_1
#   scope                = azurerm_resource_group.cluster_1_rg.id
#   role_definition_name = "Owner"
#   principal_id         = var.sp_principal_id
# }
# # AKS Cluster
# resource "azurerm_kubernetes_cluster" "cluster_1_aks" {
#   provider            = azurerm.cluster_1
#   name                = "aks-cl-1"
#   location            = azurerm_resource_group.cluster_1_rg.location
#   resource_group_name = azurerm_resource_group.cluster_1_rg.name
#   dns_prefix          = "aks-cl-1"

#   default_node_pool {
#     name       = "default"
#     node_count = 1
#     vm_size    = "Standard_DC2s_v2"
#   }

#   identity {
#     type         = "UserAssigned"
#     identity_ids = [azurerm_user_assigned_identity.cluster_1_identity.id]
#   }

#   azure_active_directory_role_based_access_control {
#     azure_rbac_enabled = true
#     tenant_id          = var.tenant_id
#   }

#   tags = {
#     "env"       = "test"
#     "lifecycle" = "deleteme"
#     "product"   = "runwhen"
#   }
# }

# Cluster 2 Resources

# # Resource Group
# resource "azurerm_resource_group" "cluster_2_rg" {
#   provider = azurerm.cluster_2
#   name     = "azure-aks-2"
#   location = "West US"
#   tags = {
#     "env"       = "test"
#     "lifecycle" = "deleteme"
#     "product"   = "runwhen"
#   }
# }

# # Managed Identity
# resource "azurerm_user_assigned_identity" "cluster_2_identity" {
#   provider            = azurerm.cluster_2
#   name                = "aks-cl-2-identity"
#   location            = azurerm_resource_group.cluster_2_rg.location
#   resource_group_name = azurerm_resource_group.cluster_2_rg.name
# }

# # Role Assignment for Service Principal
# resource "azurerm_role_assignment" "cluster_2_sp_owner" {
#   provider             = azurerm.cluster_2
#   scope                = azurerm_resource_group.cluster_2_rg.id
#   role_definition_name = "Owner"
#   principal_id         = var.sp_principal_id
# }


# # AKS Cluster
# resource "azurerm_kubernetes_cluster" "cluster_2_aks" {
#   provider            = azurerm.cluster_2
#   name                = "aks-cl-2"
#   location            = azurerm_resource_group.cluster_2_rg.location
#   resource_group_name = azurerm_resource_group.cluster_2_rg.name
#   dns_prefix          = "aks-cl-2"

#   default_node_pool {
#     name       = "default"
#     node_count = 1
#     vm_size    = "Standard_DC2s_v2"
#   }

#   identity {
#     type         = "UserAssigned"
#     identity_ids = [azurerm_user_assigned_identity.cluster_2_identity.id]
#   }

#   azure_active_directory_role_based_access_control {
#     azure_rbac_enabled = true
#     tenant_id          = var.tenant_id
#   }

#   tags = {
#     "env"       = "test"
#     "lifecycle" = "deleteme"
#     "product"   = "runwhen"
#   }
# }

# Test Resource Groups with Same Name in Different Subscriptions
# This tests the SLX generation collision scenario

# Identical Resource Group 1 (Subscription 1)
resource "azurerm_resource_group" "test_collision_rg_1" {
  provider = azurerm.cluster_1
  name     = "test-collision-rg" # Same name as RG 2
  location = "East US"
  tags = {
    "env"          = "test"
    "lifecycle"    = "deleteme"
    "product"      = "runwhen"
    "purpose"      = "slx-collision-test"
    "subscription" = "1"
  }
}

# Storage Account in RG 1
resource "azurerm_storage_account" "test_storage_1" {
  provider                 = azurerm.cluster_1
  name                     = "teststorage1${random_string.storage_suffix_1.result}"
  resource_group_name      = azurerm_resource_group.test_collision_rg_1.name
  location                 = azurerm_resource_group.test_collision_rg_1.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    "env"          = "test"
    "lifecycle"    = "deleteme"
    "product"      = "runwhen"
    "purpose"      = "slx-collision-test"
    "subscription" = "1"
  }
}

# Random suffix for storage account 1 (must be globally unique)
resource "random_string" "storage_suffix_1" {
  length  = 8
  special = false
  upper   = false
}

# Identical Resource Group 2 (Subscription 2) 
resource "azurerm_resource_group" "test_collision_rg_2" {
  provider = azurerm.cluster_2
  name     = "test-collision-rg" # Same name as RG 1
  location = "West US"
  tags = {
    "env"          = "test"
    "lifecycle"    = "deleteme"
    "product"      = "runwhen"
    "purpose"      = "slx-collision-test"
    "subscription" = "2"
  }
}

# Storage Account in RG 2
resource "azurerm_storage_account" "test_storage_2" {
  provider                 = azurerm.cluster_2
  name                     = "teststorage2${random_string.storage_suffix_2.result}"
  resource_group_name      = azurerm_resource_group.test_collision_rg_2.name
  location                 = azurerm_resource_group.test_collision_rg_2.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    "env"          = "test"
    "lifecycle"    = "deleteme"
    "product"      = "runwhen"
    "purpose"      = "slx-collision-test"
    "subscription" = "2"
  }
}

# Random suffix for storage account 2 (must be globally unique)
resource "random_string" "storage_suffix_2" {
  length  = 8
  special = false
  upper   = false
}

# # Outputs for Cluster FQDNs
# output "cluster_1_fqdn" {
#   value = azurerm_kubernetes_cluster.cluster_1_aks.fqdn
# }
# output "cluster_1_name" {
#   value = azurerm_kubernetes_cluster.cluster_1_aks.name
# }
# output "cluster_1_sub" {
#   value = var.subscription_id_1
# }
# output "cluster_1_rg" {
#   value = azurerm_kubernetes_cluster.cluster_1_aks.resource_group_name
# }

# output "cluster_2_fqdn" {
#   value = azurerm_kubernetes_cluster.cluster_2_aks.fqdn
# }
# output "cluster_2_name" {
#   value = azurerm_kubernetes_cluster.cluster_2_aks.name
# }
# output "cluster_2_sub" {
#   value = var.subscription_id_2
# }
# output "cluster_2_rg" {
#   value = azurerm_kubernetes_cluster.cluster_2_aks.resource_group_name
# }

# Test Resource Group and Storage Account Outputs
output "test_rg_1_name" {
  value       = azurerm_resource_group.test_collision_rg_1.name
  description = "Name of test resource group in subscription 1"
}
output "test_rg_1_id" {
  value       = azurerm_resource_group.test_collision_rg_1.id
  description = "Full resource ID of test resource group in subscription 1"
}
output "test_storage_1_name" {
  value       = azurerm_storage_account.test_storage_1.name
  description = "Name of test storage account in subscription 1"
}
output "test_storage_1_id" {
  value       = azurerm_storage_account.test_storage_1.id
  description = "Full resource ID of test storage account in subscription 1"
}

output "test_rg_2_name" {
  value       = azurerm_resource_group.test_collision_rg_2.name
  description = "Name of test resource group in subscription 2"
}
output "test_rg_2_id" {
  value       = azurerm_resource_group.test_collision_rg_2.id
  description = "Full resource ID of test resource group in subscription 2"
}
output "test_storage_2_name" {
  value       = azurerm_storage_account.test_storage_2.name
  description = "Name of test storage account in subscription 2"
}
output "test_storage_2_id" {
  value       = azurerm_storage_account.test_storage_2.id
  description = "Full resource ID of test storage account in subscription 2"
}
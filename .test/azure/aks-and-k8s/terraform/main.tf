# Current sub (assumed from CLI login)
data "azurerm_subscription" "current" {}

# Get tenant and user details of the current CLI session
data "azurerm_client_config" "current" {}


# Assign the current logged-in user as a Kubernetes RBAC Cluster Admin
resource "azurerm_role_assignment" "current_user_k8s_admin" {
  principal_id         = data.azurerm_client_config.current.object_id
  role_definition_name = "Azure Kubernetes Service RBAC Cluster Admin"
  scope                = azurerm_kubernetes_cluster.cluster_aks.id
}

# Cluster 1 Resources

# Resource Group
resource "azurerm_resource_group" "cluster_rg" {
  name     = "azure-aks-k8s-1"
  location = "East US"
  tags = {
    "env"       = "test"
    "lifecycle" = "deleteme"
    "product"   = "runwhen"
  }
}

# Managed Identity
resource "azurerm_user_assigned_identity" "cluster_identity" {
  name                = "aks-cl-1-identity"
  location            = azurerm_resource_group.cluster_rg.location
  resource_group_name = azurerm_resource_group.cluster_rg.name
}
resource "azurerm_role_assignment" "sp_owner_rg" {
  scope                = azurerm_resource_group.cluster_rg.id
  role_definition_name = "Owner"
  principal_id         = var.sp_principal_id
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "cluster_aks" {
  name                = "aks-cl-1"
  location            = azurerm_resource_group.cluster_rg.location
  resource_group_name = azurerm_resource_group.cluster_rg.name
  dns_prefix          = "aks-cl-1"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_DC2s_v2"
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.cluster_identity.id]
  }

  azure_active_directory_role_based_access_control {
    azure_rbac_enabled = true
    tenant_id          = var.tenant_id
  }

  tags = {
    "env"       = "test"
    "lifecycle" = "deleteme"
    "product"   = "runwhen"
  }
}



# Outputs for Cluster FQDNs
output "cluster_fqdn" {
  value = azurerm_kubernetes_cluster.cluster_aks.fqdn
}
output "cluster_name" {
  value = azurerm_kubernetes_cluster.cluster_aks.name
}
output "cluster_sub" {
  value = var.subscription_id
}
output "cluster_rg" {
  value = azurerm_kubernetes_cluster.cluster_aks.resource_group_name
}

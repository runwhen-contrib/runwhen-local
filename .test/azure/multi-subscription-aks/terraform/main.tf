# Cluster 1 Resources

# Resource Group
resource "azurerm_resource_group" "cluster_1_rg" {
  provider = azurerm.cluster_1
  name     = "azure-aks-1"
  location = "East US"
  tags = {
    "env"       = "test"
    "lifecycle" = "deleteme"
    "product"   = "runwhen"
  }
}

# Managed Identity
resource "azurerm_user_assigned_identity" "cluster_1_identity" {
  provider            = azurerm.cluster_1
  name                = "aks-cl-1-identity"
  location            = azurerm_resource_group.cluster_1_rg.location
  resource_group_name = azurerm_resource_group.cluster_1_rg.name
}

# Role Assignment for Service Principal
resource "azurerm_role_assignment" "cluster_1_sp_owner" {
  provider             = azurerm.cluster_1
  scope                = "/subscriptions/${var.subscription_id_1}"
  role_definition_name = "Azure Kubernetes Service RBAC Cluster Admin"
  principal_id         = var.sp_principal_id
  principal_type       = "ServicePrincipal"
}
# Role Assignment for Service Principal
resource "azurerm_role_assignment" "cluster_1_sp_reader" {
  provider             = azurerm.cluster_1
  scope                = "/subscriptions/${var.subscription_id_1}"
  role_definition_name = "Reader"
  principal_id         = var.sp_principal_id
  principal_type       = "ServicePrincipal"
}
# AKS Cluster
resource "azurerm_kubernetes_cluster" "cluster_1_aks" {
  provider            = azurerm.cluster_1
  name                = "aks-cl-1"
  location            = azurerm_resource_group.cluster_1_rg.location
  resource_group_name = azurerm_resource_group.cluster_1_rg.name
  dns_prefix          = "aks-cl-1"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_DC2s_v2"
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.cluster_1_identity.id]
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

# Cluster 2 Resources

# Resource Group
resource "azurerm_resource_group" "cluster_2_rg" {
  provider = azurerm.cluster_2
  name     = "azure-aks-2"
  location = "West US"
  tags = {
    "env"       = "test"
    "lifecycle" = "deleteme"
    "product"   = "runwhen"
  }
}

# Managed Identity
resource "azurerm_user_assigned_identity" "cluster_2_identity" {
  provider            = azurerm.cluster_2
  name                = "aks-cl-2-identity"
  location            = azurerm_resource_group.cluster_2_rg.location
  resource_group_name = azurerm_resource_group.cluster_2_rg.name
}

# Role Assignment for Service Principal
resource "azurerm_role_assignment" "cluster_2_sp_owner" {
  provider             = azurerm.cluster_2
  scope                = "/subscriptions/${var.subscription_id_2}"
  role_definition_name = "Azure Kubernetes Service RBAC Cluster Admin"
  principal_id         = var.sp_principal_id
  principal_type       = "ServicePrincipal"
}

# Role Assignment for Service Principal
# resource "azurerm_role_assignment" "cluster_2_sp_reader" {
#  provider            = azurerm.cluster_1
#  scope               = "/subscriptions/${var.subscription_id_2}"
#  role_definition_name = "Reader"
#  principal_id        = var.sp_principal_id
#  principal_type      = "ServicePrincipal"
# }

# AKS Cluster
resource "azurerm_kubernetes_cluster" "cluster_2_aks" {
  provider            = azurerm.cluster_2
  name                = "aks-cl-2"
  location            = azurerm_resource_group.cluster_2_rg.location
  resource_group_name = azurerm_resource_group.cluster_2_rg.name
  dns_prefix          = "aks-cl-2"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_DC2s_v2"
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.cluster_2_identity.id]
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
output "cluster_1_fqdn" {
  value = azurerm_kubernetes_cluster.cluster_1_aks.fqdn
}
output "cluster_1_name" {
  value = azurerm_kubernetes_cluster.cluster_1_aks.name
}
output "cluster_1_sub" {
  value = var.subscription_id_1
}
output "cluster_1_rg" {
  value = azurerm_kubernetes_cluster.cluster_1_aks.resource_group_name
}

output "cluster_2_fqdn" {
  value = azurerm_kubernetes_cluster.cluster_2_aks.fqdn
}
output "cluster_2_name" {
  value = azurerm_kubernetes_cluster.cluster_2_aks.name
}
output "cluster_2_sub" {
  value = var.subscription_id_2
}
output "cluster_2_rg" {
  value = azurerm_kubernetes_cluster.cluster_2_aks.resource_group_name
}
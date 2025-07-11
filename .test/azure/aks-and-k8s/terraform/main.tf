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
  name     = "azure-aks-k8s-1-${var.resource_suffix}"
  location = "East US"
  tags = {
    "env"       = "test"
    "lifecycle" = "deleteme"
    "product"   = "runwhen"
  }
}

# Managed Identity
resource "azurerm_user_assigned_identity" "cluster_identity" {
  name                = "aks-cl-1-identity-${var.resource_suffix}"
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
  name                = "aks-cl-1-${var.resource_suffix}"
  location            = azurerm_resource_group.cluster_rg.location
  resource_group_name = azurerm_resource_group.cluster_rg.name
  dns_prefix          = "aks-cl-1-${var.resource_suffix}"

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

# Cluster 2 Resources - Mixed Authentication Cluster (No Service Account Access)

# Resource Group for Cluster 2
resource "azurerm_resource_group" "cluster_rg_2" {
  name     = "azure-aks-k8s-2-${var.resource_suffix}"
  location = "East US"
  tags = {
    "env"       = "test"
    "lifecycle" = "deleteme"
    "product"   = "runwhen"
  }
}

# Managed Identity for Cluster 2
resource "azurerm_user_assigned_identity" "cluster_identity_2" {
  name                = "aks-cl-2-identity-${var.resource_suffix}"
  location            = azurerm_resource_group.cluster_rg_2.location
  resource_group_name = azurerm_resource_group.cluster_rg_2.name
}

# AKS Cluster 2 - Mixed Authentication (Azure AD + Local Accounts)
resource "azurerm_kubernetes_cluster" "cluster_aks_2" {
  name                = "aks-cl-2-${var.resource_suffix}"
  location            = azurerm_resource_group.cluster_rg_2.location
  resource_group_name = azurerm_resource_group.cluster_rg_2.name
  dns_prefix          = "aks-cl-2-${var.resource_suffix}"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_DC2s_v2"
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.cluster_identity_2.id]
  }

  # Mixed authentication - Azure AD + Local accounts
  azure_active_directory_role_based_access_control {
    azure_rbac_enabled = false # This enables mixed authentication
    tenant_id          = var.tenant_id
  }

  # Enable local accounts for mixed authentication
  local_account_disabled = false

  tags = {
    "env"       = "test"
    "lifecycle" = "deleteme"
    "product"   = "runwhen"
  }
}

# Note: We intentionally do NOT assign the service principal to Cluster 2
# This will cause permission denied errors when trying to access this cluster

# The key is that the service principal used in workspaceInfo.yaml will have
# access to cluster 1 but not cluster 2, causing permission denied on cluster 2

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

# Outputs for Cluster 2
output "cluster_2_fqdn" {
  value = azurerm_kubernetes_cluster.cluster_aks_2.fqdn
}
output "cluster_2_name" {
  value = azurerm_kubernetes_cluster.cluster_aks_2.name
}
output "cluster_2_sub" {
  value = var.subscription_id
}
output "cluster_2_rg" {
  value = azurerm_kubernetes_cluster.cluster_aks_2.resource_group_name
}

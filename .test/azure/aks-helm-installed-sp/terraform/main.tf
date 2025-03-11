# Cluster 1 Resources

# Resource Group
resource "azurerm_resource_group" "cluster_rg" {
  name     = var.resource_group
  location = "East US"
  tags = {
    "env"       = "test"
    "lifecycle" = "deleteme"
    "product"   = "runwhen"
  }
}

# Managed Identity
resource "azurerm_user_assigned_identity" "cluster_identity" {
  name                = "${var.cluster_name}-identity"
  location            = azurerm_resource_group.cluster_rg.location
  resource_group_name = azurerm_resource_group.cluster_rg.name
}

# Role Assignment for Service Principal
#resource "azurerm_role_assignment" "cluster_sp_owner" {
#  scope                = "/subscriptions/${var.subscription_id}"
#  role_definition_name = "Azure Kubernetes Service RBAC Cluster Admin"
#  principal_id         = var.sp_principal_id
#  principal_type       = "ServicePrincipal"
#}
# Role Assignment for Service Principal
#resource "azurerm_role_assignment" "cluster_sp_reader" {
#  scope                = "/subscriptions/${var.subscription_id}"
#  role_definition_name = "Reader"
#  principal_id         = var.sp_principal_id
#  principal_type       = "ServicePrincipal"
#}

# Add Logged-In User as RBAC Admin
data "azurerm_client_config" "current" {}

resource "azurerm_role_assignment" "current_user_rbac_admin" {
  scope                = azurerm_kubernetes_cluster.cluster_aks.id
  role_definition_name = "Azure Kubernetes Service RBAC Cluster Admin"
  principal_id         = data.azurerm_client_config.current.object_id
  principal_type       = "User"
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "cluster_aks" {
  name                = var.cluster_name
  location            = azurerm_resource_group.cluster_rg.location
  resource_group_name = azurerm_resource_group.cluster_rg.name
  dns_prefix          = var.cluster_name

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

# Separate Resource for Kubeconfig Retrieval
resource "null_resource" "fetch_kubeconfig" {

  # Triggers to ensure it runs every time
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOT
az aks get-credentials --resource-group ${azurerm_resource_group.cluster_rg.name} --name ${azurerm_kubernetes_cluster.cluster_aks.name} --overwrite-existing --admin
EOT
  }

  # Ensure dependency on AKS creation and role assignment
  depends_on = [
    azurerm_kubernetes_cluster.cluster_aks,
    azurerm_role_assignment.current_user_rbac_admin
    # azurerm_role_assignment.cluster_admin
  ]
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

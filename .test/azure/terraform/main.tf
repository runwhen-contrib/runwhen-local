# Current sub (assumed from CLI login)
data "azurerm_subscription" "current" {}


# Define local clusters with necessary variables
locals {
  clusters = {
    cluster_1 = {
      resource_group  = "azure-aks-1"
      location        = "East US"
      cluster_name    = "aks-cl-1"
      subscription_id = var.subscription_id_1
      sp_principal_id = var.sp_principal_id
      tenant_id       = var.tenant_id
      tags = {
        "env"       = "test"
        "lifecycle" = "deleteme"
        "product"   = "runwhen"
      }
    }
    cluster_2 = {
      resource_group  = "azure-aks-2"
      location        = "West US"
      cluster_name    = "aks-cl-2"
      subscription_id = var.subscription_id_2
      sp_principal_id = var.sp_principal_id
      tenant_id       = var.tenant_id
      tags = {
        "env"       = "test"
        "lifecycle" = "deleteme"
        "product"   = "runwhen"
      }
    }
  }
}

# Resource Groups for each cluster
resource "azurerm_resource_group" "aks_rg" {
  for_each = local.clusters
  name     = each.value.resource_group
  location = each.value.location
  tags     = each.value.tags
}

# Managed Identity for each cluster
resource "azurerm_user_assigned_identity" "aks_identity" {
  for_each            = local.clusters
  name                = "${each.value.cluster_name}-identity"
  location            = each.value.location
  resource_group_name = azurerm_resource_group.aks_rg[each.key].name
}

# Role Assignments for Service Principal and Managed Identity
resource "azurerm_role_assignment" "sp_owner_subscription" {
  for_each            = local.clusters
  scope               = "/subscriptions/${each.value.subscription_id}"
  role_definition_name = "Owner"
  principal_id        = each.value.sp_principal_id
}

resource "azurerm_role_assignment" "aks_identity_owner_rg" {
  for_each            = local.clusters
  principal_id        = azurerm_user_assigned_identity.aks_identity[each.key].principal_id
  role_definition_name = "Owner"
  scope               = azurerm_resource_group.aks_rg[each.key].id
}

# Virtual Network and Subnet for Azure CNI
resource "azurerm_virtual_network" "aks_vnet" {
  for_each            = local.clusters
  name                = "${each.value.cluster_name}-vnet"
  location            = each.value.location
  resource_group_name = azurerm_resource_group.aks_rg[each.key].name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "aks_subnet" {
  for_each             = local.clusters
  name                 = "${each.value.cluster_name}-subnet"
  resource_group_name  = azurerm_resource_group.aks_rg[each.key].name
  virtual_network_name = azurerm_virtual_network.aks_vnet[each.key].name
  address_prefixes     = ["10.0.1.0/24"]
}

# Network Security Group and Subnet Association
resource "azurerm_network_security_group" "aks_nsg" {
  for_each            = local.clusters
  name                = "${each.value.cluster_name}-nsg"
  location            = each.value.location
  resource_group_name = azurerm_resource_group.aks_rg[each.key].name
}

resource "azurerm_subnet_network_security_group_association" "aks_subnet_nsg" {
  for_each                  = local.clusters
  subnet_id                 = azurerm_subnet.aks_subnet[each.key].id
  network_security_group_id = azurerm_network_security_group.aks_nsg[each.key].id
}

# AKS Cluster Configuration
resource "azurerm_kubernetes_cluster" "aks_cluster" {
  for_each            = local.clusters
  depends_on          = [azurerm_user_assigned_identity.aks_identity]
  name                = each.value.cluster_name
  location            = each.value.location
  resource_group_name = azurerm_resource_group.aks_rg[each.key].name
  dns_prefix          = "aks-${each.value.cluster_name}"

  default_node_pool {
    name           = "default"
    node_count     = 1
    vm_size        = "Standard_DC2s_v2"
    vnet_subnet_id = azurerm_subnet.aks_subnet[each.key].id
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.aks_identity[each.key].id]
  }

  azure_active_directory_role_based_access_control {
    azure_rbac_enabled = true
    tenant_id          = each.value.tenant_id
  }

  tags = each.value.tags
}

# Outputs for each cluster
output "cluster_1_fqdn" {
  value = azurerm_kubernetes_cluster.aks_cluster["cluster_1"].fqdn
}

output "cluster_2_fqdn" {
  value = azurerm_kubernetes_cluster.aks_cluster["cluster_2"].fqdn
}

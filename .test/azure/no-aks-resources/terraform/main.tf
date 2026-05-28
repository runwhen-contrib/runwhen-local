# =============================================================================
# RunWhen Local - "no AKS" Azure indexer fixture
#
# Deploys two resource groups so the azureapi indexer's per-RG selective
# indexing can be exercised end-to-end:
#
#   * keep-rg : in-scope. Contains a storage account, a virtual network,
#               a network security group, and a key vault. Tagged with
#               purpose=in-scope.
#   * drop-rg : intended to be excluded from discovery (via LOD=none or
#               excludeTags). Contains a storage account tagged with
#               purpose=out-of-scope so the tag-filter assertion has
#               something concrete to drop.
#
# Everything is intentionally cheap (no VMs, no clusters) - this fixture
# exists to exercise the indexer's filter logic, not to evaluate any
# specific service.
# =============================================================================

resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

locals {
  suffix = random_string.suffix.result

  keep_tags = {
    project = "rwl-azureapi-fixture"
    purpose = "in-scope"
  }
  drop_tags = {
    project = "rwl-azureapi-fixture"
    purpose = "out-of-scope"
  }
}

# -- Resource groups ----------------------------------------------------------

resource "azurerm_resource_group" "keep" {
  name     = "${var.name_prefix}-keep-rg-${local.suffix}"
  location = var.location
  tags     = local.keep_tags
}

resource "azurerm_resource_group" "drop" {
  name     = "${var.name_prefix}-drop-rg-${local.suffix}"
  location = var.location
  tags     = local.drop_tags
}

# -- Storage (one per RG, both ARM-spec compliant 3-24 lowercase alnum) -------

resource "azurerm_storage_account" "keep" {
  name                     = "rwlkeepst${local.suffix}"
  resource_group_name      = azurerm_resource_group.keep.name
  location                 = azurerm_resource_group.keep.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = local.keep_tags
}

resource "azurerm_storage_account" "drop" {
  name                     = "rwldropst${local.suffix}"
  resource_group_name      = azurerm_resource_group.drop.name
  location                 = azurerm_resource_group.drop.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = local.drop_tags
}

# -- Networking (keep-rg only) -----------------------------------------------

resource "azurerm_virtual_network" "keep" {
  name                = "${var.name_prefix}-vnet-${local.suffix}"
  resource_group_name = azurerm_resource_group.keep.name
  location            = azurerm_resource_group.keep.location
  address_space       = ["10.10.0.0/16"]
  tags                = local.keep_tags
}

resource "azurerm_subnet" "keep" {
  name                 = "default"
  resource_group_name  = azurerm_resource_group.keep.name
  virtual_network_name = azurerm_virtual_network.keep.name
  address_prefixes     = ["10.10.0.0/24"]
}

resource "azurerm_network_security_group" "keep" {
  name                = "${var.name_prefix}-nsg-${local.suffix}"
  resource_group_name = azurerm_resource_group.keep.name
  location            = azurerm_resource_group.keep.location
  tags                = local.keep_tags
}

# -- Key Vault (keep-rg only) ------------------------------------------------

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "keep" {
  name                       = "rwl-kv-${local.suffix}"
  location                   = azurerm_resource_group.keep.location
  resource_group_name        = azurerm_resource_group.keep.name
  tenant_id                  = var.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  tags                       = local.keep_tags

  dynamic "access_policy" {
    for_each = var.sp_principal_id == "" ? [] : [1]
    content {
      tenant_id = var.tenant_id
      object_id = var.sp_principal_id
      key_permissions = [
        "Get", "List",
      ]
      secret_permissions = [
        "Get", "List",
      ]
    }
  }
}

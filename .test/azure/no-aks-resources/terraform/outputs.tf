output "subscription_id" {
  value       = var.subscription_id
  description = "Subscription containing the fixture infrastructure."
}

output "keep_rg_name" {
  value       = azurerm_resource_group.keep.name
  description = "Resource group that should appear in RWL discovery output."
}

output "drop_rg_name" {
  value       = azurerm_resource_group.drop.name
  description = "Resource group that selective-indexing tests expect to drop."
}

output "keep_storage_name" {
  value = azurerm_storage_account.keep.name
}

output "drop_storage_name" {
  value = azurerm_storage_account.drop.name
}

output "vnet_name" {
  value = azurerm_virtual_network.keep.name
}

output "nsg_name" {
  value = azurerm_network_security_group.keep.name
}

output "key_vault_name" {
  value = azurerm_key_vault.keep.name
}

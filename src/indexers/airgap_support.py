#!/usr/bin/env python3
"""
CloudQuery Airgap Support for RunWhen Local

This module provides functionality to pre-package CloudQuery plugins and tables
for offline/airgap installations where internet access is not available.
"""

import os
import json
import logging
import subprocess
import tempfile
import shutil
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from utils import read_file, write_file

logger = logging.getLogger(__name__)

# Load CloudQuery plugin versions from centralized config
def _load_plugin_config() -> Dict:
    """Load CloudQuery plugin configuration from YAML file"""
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cloudquery-plugins.yaml")
    try:
        config_content = read_file(config_path, "r")
        return yaml.safe_load(config_content)
    except Exception as e:
        logger.warning(f"Failed to load cloudquery-plugins.yaml: {e}. Using fallback versions.")
        # Fallback to hardcoded versions if config file is missing
        return {
            "plugins": {
                "azure": {"version": "v11.4.3", "type": "source"},
                "aws": {"version": "v25.1.0", "type": "source"},
                "gcp": {"version": "v13.1.0", "type": "source"},
                "k8s": {"version": "v8.0.2", "type": "source"},
                "sqlite": {"version": "v2.5.1", "type": "destination"}
            }
        }

PLUGIN_CONFIG = _load_plugin_config()
CLOUDQUERY_PLUGINS = {name: info["version"] for name, info in PLUGIN_CONFIG.get("plugins", {}).items()}

# Default airgap directory structure
AIRGAP_BASE_DIR = "/opt/runwhen/airgap"
AIRGAP_PLUGINS_DIR = os.path.join(AIRGAP_BASE_DIR, "plugins")
AIRGAP_TABLES_DIR = os.path.join(AIRGAP_BASE_DIR, "tables")

# Docker pre-installed plugins directory
DOCKER_PLUGINS_DIR = "/opt/cloudquery/plugins"

class AirgapManager:
    """Manages CloudQuery airgap functionality"""
    
    def __init__(self, airgap_dir: Optional[str] = None):
        self.airgap_dir = airgap_dir or os.getenv("CLOUDQUERY_AIRGAP_DIR", AIRGAP_BASE_DIR)
        self.plugins_dir = os.path.join(self.airgap_dir, "plugins")
        self.tables_dir = os.path.join(self.airgap_dir, "tables")
        self.is_airgap_mode = self._check_airgap_mode()
        
        if self.is_airgap_mode:
            logger.info(f"CloudQuery airgap mode enabled. Using directory: {self.airgap_dir}")
    
    def _check_airgap_mode(self) -> bool:
        """Check if airgap mode should be enabled"""
        # Check environment variable
        if os.getenv("CLOUDQUERY_AIRGAP_MODE", "").lower() == "true":
            return True
        
        # Check if Docker pre-installed plugins exist
        if os.path.exists(DOCKER_PLUGINS_DIR) and os.listdir(DOCKER_PLUGINS_DIR):
            logger.debug("Found Docker pre-installed CloudQuery plugins")
            return True
        
        # Check if airgap directory exists with plugins
        if os.path.exists(self.plugins_dir) and os.listdir(self.plugins_dir):
            return True
            
        return False
    
    def is_enabled(self) -> bool:
        """Check if airgap mode is enabled"""
        return self.is_airgap_mode
    
    def get_plugin_path(self, plugin_name: str, version: str) -> Optional[str]:
        """Get the path to a pre-packaged plugin"""
        if not self.is_airgap_mode:
            return None
        
        # First, check Docker pre-installed plugins (simple naming)
        docker_plugin_path = os.path.join(DOCKER_PLUGINS_DIR, plugin_name)
        if os.path.exists(docker_plugin_path):
            logger.debug(f"Found Docker pre-installed plugin: {docker_plugin_path}")
            return docker_plugin_path
        
        # Fall back to airgap directory with versioned naming
        arch = self._get_architecture()
        plugin_filename = f"{plugin_name}_{version}_{arch}"
        plugin_path = os.path.join(self.plugins_dir, plugin_filename)
        
        if os.path.exists(plugin_path):
            logger.debug(f"Found airgap plugin: {plugin_path}")
            return plugin_path
        
        # Try alternative naming patterns
        alternatives = [
            f"{plugin_name}-{version}-{arch}",
            f"cloudquery-{plugin_name}-{version}",
            f"{plugin_name}_{version}",
            plugin_name
        ]
        
        for alt_name in alternatives:
            alt_path = os.path.join(self.plugins_dir, alt_name)
            if os.path.exists(alt_path):
                logger.debug(f"Found airgap plugin (alternative naming): {alt_path}")
                return alt_path
        
        logger.warning(f"Plugin not found in Docker or airgap directories: {plugin_name} {version}")
        return None
    
    def get_tables_info(self, plugin_name: str) -> Optional[Dict]:
        """Get pre-packaged table information for a plugin"""
        if not self.is_airgap_mode:
            return None
            
        tables_file = os.path.join(self.tables_dir, f"{plugin_name}_tables.json")
        if os.path.exists(tables_file):
            try:
                tables_data = json.loads(read_file(tables_file))
                logger.debug(f"Loaded airgap tables info for {plugin_name}")
                return tables_data
            except Exception as e:
                logger.warning(f"Failed to load tables info for {plugin_name}: {e}")
        
        return None
    
    def setup_airgap_environment(self, plugin_dir: str) -> Dict[str, str]:
        """Setup environment variables for airgap CloudQuery execution"""
        env_vars = {}
        
        if self.is_airgap_mode:
            # Disable plugin downloads
            env_vars["CQ_NO_TELEMETRY"] = "true"
            env_vars["CQ_OFFLINE_MODE"] = "true"
            
            # Point to local plugin directory
            env_vars["CQ_PLUGIN_DIR"] = plugin_dir
            
            # Copy plugins to execution directory
            self._copy_plugins_to_execution_dir(plugin_dir)
            
            logger.info("CloudQuery configured for airgap execution")
        
        return env_vars
    
    def _copy_plugins_to_execution_dir(self, target_dir: str):
        """Copy pre-packaged plugins to CloudQuery execution directory with proper naming"""
        os.makedirs(target_dir, exist_ok=True)
        
        arch = self._get_architecture()
        
        # First, try to copy Docker pre-installed plugins
        if os.path.exists(DOCKER_PLUGINS_DIR):
            logger.debug("Copying Docker pre-installed plugins with proper naming")
            for plugin_file in os.listdir(DOCKER_PLUGINS_DIR):
                src_path = os.path.join(DOCKER_PLUGINS_DIR, plugin_file)
                
                if os.path.isfile(src_path):
                    try:
                        # Get plugin info from config
                        plugin_info = PLUGIN_CONFIG.get("plugins", {}).get(plugin_file, {})
                        plugin_type = plugin_info.get("type", "source")
                        version = plugin_info.get("version", "unknown")
                        
                        # Create proper CloudQuery plugin naming
                        # Format: cloudquery_{type}_{name}_{version}_linux_{arch}
                        proper_name = f"cloudquery_{plugin_type}_{plugin_file}_{version}_linux_{arch}"
                        dst_path = os.path.join(target_dir, proper_name)
                        
                        shutil.copy2(src_path, dst_path)
                        # Ensure executable permissions
                        os.chmod(dst_path, 0o755)
                        logger.debug(f"Copied Docker plugin: {plugin_file} -> {proper_name}")
                    except Exception as e:
                        logger.warning(f"Failed to copy Docker plugin {plugin_file}: {e}")
        
        # Also copy from airgap directory if it exists
        if os.path.exists(self.plugins_dir):
            logger.debug("Copying airgap plugins")
            for plugin_file in os.listdir(self.plugins_dir):
                src_path = os.path.join(self.plugins_dir, plugin_file)
                dst_path = os.path.join(target_dir, plugin_file)
                
                # Don't overwrite Docker plugins
                if os.path.exists(dst_path):
                    continue
                
                if os.path.isfile(src_path):
                    try:
                        shutil.copy2(src_path, dst_path)
                        # Ensure executable permissions
                        os.chmod(dst_path, 0o755)
                        logger.debug(f"Copied airgap plugin: {plugin_file}")
                    except Exception as e:
                        logger.warning(f"Failed to copy plugin {plugin_file}: {e}")
        
        if not os.path.exists(DOCKER_PLUGINS_DIR) and not os.path.exists(self.plugins_dir):
            logger.warning("No plugin directories found (Docker or airgap)")
    
    def _get_architecture(self) -> str:
        """Get the system architecture for plugin selection"""
        import platform
        arch_map = {
            "x86_64": "amd64",
            "aarch64": "arm64",
            "arm64": "arm64"
        }
        return arch_map.get(platform.machine(), "amd64")
    
    def generate_offline_config(self, plugin_name: str, version: str, config_template: str) -> str:
        """Generate CloudQuery config for offline/airgap mode"""
        if not self.is_airgap_mode:
            return config_template
        
        # In airgap mode, keep the config as-is but verify plugins are available
        # CloudQuery will find plugins via CQ_PLUGIN_DIR environment variable
        plugin_path = self.get_plugin_path(plugin_name, version)
        if plugin_path:
            logger.debug(f"Airgap mode: Plugin available at {plugin_path}, keeping standard config format")
        else:
            logger.warning(f"Airgap mode: Plugin {plugin_name} {version} not found in airgap directories")
        
        # Return the original config - CloudQuery will use CQ_PLUGIN_DIR to find plugins
        return config_template

def create_airgap_package(output_dir: str, platforms: List[str] = None) -> bool:
    """
    Create an airgap package with all necessary CloudQuery plugins and table info.
    
    This function should be run in an environment with internet access to download
    and package everything needed for offline operation.
    
    Args:
        output_dir: Directory to create the airgap package
        platforms: List of platforms to package (default: all supported)
    
    Returns:
        True if successful, False otherwise
    """
    if platforms is None:
        platforms = list(CLOUDQUERY_PLUGINS.keys())
    
    logger.info(f"Creating airgap package in: {output_dir}")
    
    # Create directory structure
    plugins_dir = os.path.join(output_dir, "plugins")
    tables_dir = os.path.join(output_dir, "tables")
    os.makedirs(plugins_dir, exist_ok=True)
    os.makedirs(tables_dir, exist_ok=True)
    
    success = True
    
    with tempfile.TemporaryDirectory() as temp_dir:
        for platform in platforms:
            if platform not in CLOUDQUERY_PLUGINS:
                logger.warning(f"Unknown platform: {platform}")
                continue
                
            version = CLOUDQUERY_PLUGINS[platform]
            logger.info(f"Packaging {platform} plugin version {version}")
            
            try:
                # Download plugin
                if not _download_plugin(platform, version, plugins_dir, temp_dir):
                    logger.error(f"Failed to download {platform} plugin")
                    success = False
                    continue
                
                # Get table information
                if not _extract_table_info(platform, version, tables_dir, temp_dir):
                    logger.warning(f"Failed to extract table info for {platform}")
                    # Don't fail the whole process for missing table info
                
            except Exception as e:
                logger.error(f"Error packaging {platform}: {e}")
                success = False
    
    if success:
        # Create airgap package metadata
        metadata = {
            "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "plugins": {platform: CLOUDQUERY_PLUGINS[platform] for platform in platforms},
            "architecture": AirgapManager()._get_architecture(),
            "runwhen_local_version": "latest"
        }
        
        metadata_file = os.path.join(output_dir, "airgap_metadata.json")
        write_file(metadata_file, json.dumps(metadata, indent=2))
        
        # Create installation script
        install_script = _generate_install_script(output_dir)
        script_file = os.path.join(output_dir, "install_airgap.sh")
        write_file(script_file, install_script)
        os.chmod(script_file, 0o755)
        
        logger.info(f"Airgap package created successfully in: {output_dir}")
        logger.info(f"To install: sudo {script_file}")
    
    return success

def _download_plugin(plugin_name: str, version: str, output_dir: str, temp_dir: str) -> bool:
    """Download a CloudQuery plugin binary"""
    arch = AirgapManager()._get_architecture()
    
    # CloudQuery plugin download URL pattern
    if plugin_name == "sqlite":
        # Destination plugins have different URL pattern
        url = f"https://github.com/cloudquery/cloudquery/releases/download/plugins-destination-{plugin_name}-{version}/cloudquery_destination_{plugin_name}_{version}_linux_{arch}"
    else:
        # Source plugins
        url = f"https://github.com/cloudquery/cloudquery/releases/download/plugins-source-{plugin_name}-{version}/cloudquery_source_{plugin_name}_{version}_linux_{arch}"
    
    output_file = os.path.join(output_dir, f"{plugin_name}_{version}_{arch}")
    
    try:
        logger.info(f"Downloading {plugin_name} plugin from: {url}")
        result = subprocess.run([
            "curl", "-L", "-o", output_file, url
        ], check=True, capture_output=True, text=True)
        
        # Make executable
        os.chmod(output_file, 0o755)
        
        # Verify download
        if os.path.getsize(output_file) < 1000:  # Less than 1KB probably means error
            logger.error(f"Downloaded file too small, probably an error: {output_file}")
            return False
        
        logger.info(f"Successfully downloaded {plugin_name} plugin")
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to download {plugin_name} plugin: {e}")
        logger.error(f"curl stderr: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Error downloading {plugin_name} plugin: {e}")
        return False

def _extract_table_info(plugin_name: str, version: str, output_dir: str, temp_dir: str) -> bool:
    """Extract table information for a plugin"""
    # This would require running CloudQuery to get table info
    # For now, we'll create a placeholder structure
    
    # Common tables for each platform (this could be expanded)
    table_info = {
        "azure": {
            "tables": [
                "azure_resources_resource_groups",
                "azure_compute_virtual_machines",
                "azure_storage_accounts",
                "azure_network_virtual_networks"
            ]
        },
        "aws": {
            "tables": [
                "aws_ec2_instances", 
                "aws_s3_buckets",
                "aws_iam_users",
                "aws_vpc_vpcs"
            ]
        },
        "gcp": {
            "tables": [
                "gcp_compute_instances",
                "gcp_storage_buckets", 
                "gcp_iam_service_accounts"
            ]
        }
    }
    
    if plugin_name in table_info:
        tables_file = os.path.join(output_dir, f"{plugin_name}_tables.json")
        write_file(tables_file, json.dumps(table_info[plugin_name], indent=2))
        logger.debug(f"Created table info for {plugin_name}")
        return True
    
    return False

def _generate_install_script(package_dir: str) -> str:
    """Generate installation script for the airgap package"""
    return f"""#!/bin/bash
# RunWhen Local CloudQuery Airgap Installation Script

set -e

AIRGAP_DIR="{AIRGAP_BASE_DIR}"
PACKAGE_DIR="$(dirname "$0")"

echo "Installing RunWhen Local CloudQuery airgap package..."

# Create airgap directory
sudo mkdir -p "$AIRGAP_DIR"
sudo mkdir -p "$AIRGAP_DIR/plugins"
sudo mkdir -p "$AIRGAP_DIR/tables"

# Copy plugins
echo "Installing CloudQuery plugins..."
sudo cp -r "$PACKAGE_DIR/plugins/"* "$AIRGAP_DIR/plugins/"
sudo chmod -R 755 "$AIRGAP_DIR/plugins"

# Copy table information
echo "Installing table information..."
sudo cp -r "$PACKAGE_DIR/tables/"* "$AIRGAP_DIR/tables/"

# Copy metadata
sudo cp "$PACKAGE_DIR/airgap_metadata.json" "$AIRGAP_DIR/"

echo "Airgap installation complete!"
echo "Set CLOUDQUERY_AIRGAP_MODE=true to enable airgap mode"
echo "Airgap directory: $AIRGAP_DIR"
"""

# Global airgap manager instance
airgap_manager = AirgapManager()

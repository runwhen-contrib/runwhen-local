"""Indexer that discovers MCP tools by:
  1. Reading the workspace's MCP server list from the MCP_CONFIG setting
     (populated from Helm `mcpConfig:` values via the runner's existing
     workspaceInfo plumbing — Approach D2).
  2. For each configured server, calling its `tools/list` MCP endpoint
     (in-VPC, outbound from the runner).
  3. Emitting one `mcp_tool` resource per tool to the Registry, with the
     server's URL/secret-ref/display-name and the tool's input schema.

A subsequent generation-rule run (enrichers/generation_rules) matches these
resources and renders one SLX + Runbook per tool via the mcp-tool-proxy
templates in rw-generic-codecollection.
"""

import logging
from typing import Any

import requests

from component import Setting, SettingDependency, Context
from resources import Registry, REGISTRY_PROPERTY_NAME

logger = logging.getLogger(__name__)

DOCUMENTATION = "Discovers MCP tools from Helm-configured MCP servers (Approach D2)."

# Same pattern as CLOUD_CONFIG_SETTING in src/indexers/common.py — a DICT
# setting populated from the workspaceInfo YAML's `mcpConfig:` key, which the
# runner Helm chart writes from its values.yaml `mcpConfig:` block:
#
#   mcpConfig:
#     servers:
#       - display_name: jira
#         url: https://jira-mcp.internal:443/mcp
#         secret_ref: jira-mcp-token
#       - display_name: linear
#         url: https://linear-mcp.internal:443/mcp
#         secret_ref: linear-mcp-token
MCP_CONFIG_SETTING = Setting(
    "MCP_CONFIG",
    "mcpConfig",
    Setting.Type.DICT,
    "Configuration for MCP servers to introspect for tool discovery.",
    dict(),
)

SETTINGS = (
    SettingDependency(MCP_CONFIG_SETTING, False),
)

PLATFORM_NAME = "mcp"
RESOURCE_TYPE = "mcp_tool"
TOOLS_LIST_TIMEOUT = 15


def index(context: Context) -> None:
    config = context.get_setting(MCP_CONFIG_SETTING) or {}
    servers = _load_servers_from_setting(config, on_warning=context.add_warning)
    if not servers:
        logger.info("mcp_tools: no MCP servers configured; skipping.")
        return

    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)

    for server in servers:
        try:
            tools = _list_tools(server)
        except Exception as exc:
            # Preserve previous SLXs on failure (per design §7.9). We simply
            # don't emit fresh resources for this server; the existing SLXs
            # from the previous successful cycle stay in place upstream.
            logger.warning("mcp_tools: tools/list failed for %s: %s",
                           server.get("display_name"), exc)
            context.add_warning(
                f"MCP tools/list failed for {server.get('display_name')}: {exc}")
            continue
        for tool in tools:
            _emit_tool_resource(registry, server, tool)

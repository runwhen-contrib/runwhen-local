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


REQUIRED_SERVER_FIELDS = ("display_name", "url", "secret_ref")


def _load_servers_from_setting(config, on_warning=None) -> list[dict[str, Any]]:
    """Parse the MCP_CONFIG setting (a DICT mirroring the Helm values block)
    into a list of validated server entries. Skips malformed entries with a
    warning so a single bad config row doesn't prevent the rest from working.
    """
    if not config:
        return []
    raw = config.get("servers") or []
    valid: list[dict[str, Any]] = []
    for entry in raw:
        if not isinstance(entry, dict):
            if on_warning:
                on_warning(f"mcpConfig.servers entry is not a dict: {entry!r}")
            continue
        missing = [f for f in REQUIRED_SERVER_FIELDS if not entry.get(f)]
        if missing:
            label = entry.get("display_name") or entry.get("url") or "<unnamed>"
            if on_warning:
                on_warning(
                    f"mcpConfig.servers[{label}] missing required field(s) "
                    f"{missing}; skipping")
            continue
        valid.append(entry)
    return valid


def _resolve_secret(secret_ref: str) -> str:
    """Read a workspace secret and return the token value. Resolved here so
    tests can monkey-patch this single function rather than threading a
    fetcher parameter through every call site."""
    from k8s_utils import get_secret
    data = get_secret(secret_ref)
    # Secret convention: stored under key "token"; fall back to single-key shape.
    return data.get("token") or next(iter(data.values()))


def _list_tools(server: dict[str, Any],
                fetch_secret=None) -> list[dict[str, Any]]:
    """Calls the MCP server's initialize/notifications/tools/list handshake
    and returns the `tools` array from the result.

    `fetch_secret` is injected for testability. Defaults to _resolve_secret
    which talks to the k8s secret store at runtime.
    """
    if fetch_secret is None:
        fetch_secret = _resolve_secret
    token = fetch_secret(server["secret_ref"])

    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Accept": "application/json, text/event-stream",
    })
    init = s.post(server["url"],
                  json={"jsonrpc": "2.0", "id": 1, "method": "initialize",
                        "params": {"protocolVersion": "2025-03-26",
                                   "capabilities": {},
                                   "clientInfo": {"name": "runwhen-builder", "version": "1.0.0"}}},
                  timeout=TOOLS_LIST_TIMEOUT)
    init.raise_for_status()
    sid = init.headers.get("Mcp-Session-Id")
    if sid:
        s.headers["Mcp-Session-Id"] = sid
    s.post(server["url"],
           json={"jsonrpc": "2.0", "method": "notifications/initialized"},
           timeout=TOOLS_LIST_TIMEOUT)
    resp = s.post(server["url"],
                  json={"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
                  timeout=TOOLS_LIST_TIMEOUT)
    resp.raise_for_status()
    parsed = resp.json()
    if "error" in parsed:
        raise RuntimeError(f"tools/list error: {parsed['error']}")
    return parsed.get("result", {}).get("tools", [])


def _emit_tool_resource(registry: Registry,
                        server: dict[str, Any],
                        tool: dict[str, Any]) -> None:
    """Add one `mcp_tool` resource to the registry under platform=mcp."""
    server_name = server["display_name"]
    tool_name = tool["name"]
    qualified = f"{server_name}__{tool_name}"
    spec = {
        "server_id": server.get("server_id"),
        "server_display_name": server_name,
        "server_url": server["url"],
        "secret_ref": server["secret_ref"],
        "tool_name": tool_name,
        "description": tool.get("description", ""),
        "input_schema": tool.get("inputSchema") or tool.get("input_schema") or {
            "type": "object", "properties": {}, "required": [],
        },
    }
    registry.add_resource(
        platform_name=PLATFORM_NAME,
        resource_type_name=RESOURCE_TYPE,
        resource_name=qualified,
        resource_qualified_name=qualified,
        resource_attributes={"spec": spec},
    )

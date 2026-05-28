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

# Verbs that strongly suggest a tool only reads state. Used as a fallback when
# the MCP server doesn't set `annotations.readOnlyHint=true` — most servers
# don't bother to set the hint, so we fall back on the tool name's leading
# verb to avoid defaulting every tool to read-write.
READ_ONLY_VERBS = (
    "get", "list", "search", "read", "fetch",
    "describe", "find", "query", "show", "view",
)


def _name_suggests_read_only(name: str) -> bool:
    """True if the tool name's leading token (split on `_` or `-`) is one of
    READ_ONLY_VERBS. Examples that match: `list_teams`, `get-project`,
    `search_documentation`. Examples that don't: `create_issue`,
    `update_project`, `delete_attachment`."""
    if not name:
        return False
    lower = name.lower()
    for verb in READ_ONLY_VERBS:
        if lower == verb or lower.startswith(verb + "_") or lower.startswith(verb + "-"):
            return True
    return False


def _compute_access(tool: dict[str, Any]) -> str:
    """Determine the SLX `access` tag for an MCP tool.

    - `annotations.readOnlyHint=true` is authoritative → "read-only".
    - Otherwise (hint is false, missing, or annotations absent) fall back on
      the tool name's leading verb. Many MCP servers leave readOnlyHint unset
      or default it to false even for clearly read-only tools, so we'd flag
      half the catalog as read-write without the heuristic.
    - Default is "read-write" — safer to over-mark write capability than to
      silently let a write tool through as read-only.
    """
    annotations = tool.get("annotations") or {}
    if annotations.get("readOnlyHint") is True:
        return "read-only"
    if _name_suggests_read_only(tool.get("name", "")):
        return "read-only"
    return "read-write"


def index(context: Context) -> None:
    logger.info("mcp_tools: indexer starting")
    config = context.get_setting(MCP_CONFIG_SETTING) or {}
    raw_count = len((config or {}).get("servers") or [])
    logger.info("mcp_tools: MCP_CONFIG has %d raw server entries", raw_count)
    servers = _load_servers_from_setting(config, on_warning=context.add_warning)
    logger.info("mcp_tools: %d server entries passed validation", len(servers))
    if not servers:
        logger.info("mcp_tools: no MCP servers configured; skipping.")
        return

    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)

    total_tools = 0
    for server in servers:
        name = server.get("display_name")
        url = server.get("url")
        logger.info("mcp_tools: calling tools/list on %s (url=%s, secret_ref=%s)",
                    name, url, server.get("secret_ref"))
        try:
            tools = _list_tools(server)
        except Exception as exc:
            # Preserve previous SLXs on failure (per design §7.9). We simply
            # don't emit fresh resources for this server; the existing SLXs
            # from the previous successful cycle stay in place upstream.
            logger.warning("mcp_tools: tools/list failed for %s: %s", name, exc)
            context.add_warning(
                f"MCP tools/list failed for {name}: {exc}")
            continue
        logger.info("mcp_tools: %s returned %d tools", name, len(tools))
        for tool in tools:
            logger.debug("mcp_tools: emitting resource for %s/%s", name, tool.get("name"))
            _emit_tool_resource(registry, server, tool)
            total_tools += 1
    logger.info("mcp_tools: indexer complete; emitted %d mcp_tool resources across %d servers",
                total_tools, len(servers))


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
    fetcher parameter through every call site.

    k8s_utils.get_secret returns secret.data from the Kubernetes Python
    client unchanged — values are still base64-encoded. Must be decoded
    before use as a bearer token (see azure_utils.py:95 for prior art).
    """
    import base64
    from k8s_utils import get_secret
    data = get_secret(secret_ref)
    # Secret convention: stored under key "token"; fall back to single-key shape.
    encoded = data.get("token") or next(iter(data.values()))
    return base64.b64decode(encoded).decode("utf-8")


def _list_tools(server: dict[str, Any],
                fetch_secret=None) -> list[dict[str, Any]]:
    """Calls the MCP server's initialize/notifications/tools/list handshake
    and returns the `tools` array from the result.

    `fetch_secret` is injected for testability. Defaults to _resolve_secret
    which talks to the k8s secret store at runtime.

    The `verify_tls` field on a server entry (default True) is forwarded to
    the underlying `requests` call. Set it to False for a server whose cert
    can't be validated by the pod's CA bundle (temporary escape hatch — the
    proper fix is to add the issuer to the bundle).
    """
    if fetch_secret is None:
        fetch_secret = _resolve_secret
    token = fetch_secret(server["secret_ref"])

    verify_tls = server.get("verify_tls", True)
    if verify_tls is False:
        logger.warning(
            "mcp_tools: TLS verification DISABLED for %s — temporary debug "
            "mode. The proper fix is to trust the server's CA in the pod's "
            "CA bundle. Do not leave verify_tls=false in production.",
            server.get("display_name"),
        )
        # Silence requests' per-call InsecureRequestWarning so the warning
        # above is the only noise per server (logged once at start).
        try:
            from urllib3 import disable_warnings
            from urllib3.exceptions import InsecureRequestWarning
            disable_warnings(InsecureRequestWarning)
        except Exception:
            pass

    s = requests.Session()
    # Note: setting s.verify alone isn't enough when REQUESTS_CA_BUNDLE is set
    # in the environment — requests.Session.merge_environment_settings reads
    # the env path into the per-request verify (when the request-level value
    # is None/True) and then merge_setting returns the per-request value over
    # the session-level one. We pass verify=verify_tls to each post() call so
    # the env override is skipped when verify_tls is False.
    s.verify = verify_tls
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
                  timeout=TOOLS_LIST_TIMEOUT,
                  verify=verify_tls)
    init.raise_for_status()
    sid = init.headers.get("Mcp-Session-Id")
    if sid:
        s.headers["Mcp-Session-Id"] = sid
    s.post(server["url"],
           json={"jsonrpc": "2.0", "method": "notifications/initialized"},
           timeout=TOOLS_LIST_TIMEOUT,
           verify=verify_tls)
    resp = s.post(server["url"],
                  json={"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
                  timeout=TOOLS_LIST_TIMEOUT,
                  verify=verify_tls)
    resp.raise_for_status()
    parsed = _parse_jsonrpc_response(resp)
    if parsed is None:
        raise RuntimeError("tools/list returned no parseable JSON-RPC envelope")
    if "error" in parsed:
        raise RuntimeError(f"tools/list error: {parsed['error']}")
    return parsed.get("result", {}).get("tools", [])


def _parse_jsonrpc_response(resp) -> dict[str, Any] | None:
    """Parse a JSON or SSE (text/event-stream) MCP response body. Mirrors
    `_parse_response` in the rw-generic-codecollection mcp-tool-proxy client:
    streamable HTTP MCP servers may answer in either content type, and the
    SSE form is `event: message\\ndata: <json>\\n\\n` per RPC envelope.
    """
    import json as _json
    ct = resp.headers.get("Content-Type", "")
    if "text/event-stream" in ct:
        for line in resp.text.split("\n"):
            if line.startswith("data: "):
                try:
                    msg = _json.loads(line[len("data: "):])
                    if "id" in msg or "result" in msg or "error" in msg:
                        return msg
                except _json.JSONDecodeError:
                    continue
        return None
    try:
        return resp.json()
    except Exception:
        return None


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
        "verify_tls": server.get("verify_tls", True),
        "tool_name": tool_name,
        "description": tool.get("description", ""),
        "input_schema": tool.get("inputSchema") or tool.get("input_schema") or {
            "type": "object", "properties": {}, "required": [],
        },
        "access": _compute_access(tool),
    }
    registry.add_resource(
        platform_name=PLATFORM_NAME,
        resource_type_name=RESOURCE_TYPE,
        resource_name=qualified,
        resource_qualified_name=qualified,
        resource_attributes={"spec": spec},
    )

from typing import Any, Optional

from resources import Resource

from .generation_rule_types import PlatformHandler

# Source of truth for the platform name lives with the indexer; mirror it
# here for the enricher's registration without forcing a cross-package
# dependency at the top level.
from indexers.mcp_tools import PLATFORM_NAME as MCP_PLATFORM


class McpPlatformHandler(PlatformHandler):
    """Platform handler for MCP-discovered tool resources.

    Resources are emitted by `indexers.mcp_tools._emit_tool_resource` with a
    nested `spec` dict carrying the server/tool fields. This handler surfaces
    those fields as qualifier values and resource property values so the
    generic generation-rules engine can match and name SLXs against them.
    """

    def __init__(self):
        super().__init__(MCP_PLATFORM)

    def _spec_value(self, resource: Resource, key: str) -> Optional[str]:
        spec = getattr(resource, "spec", None) or {}
        value = spec.get(key)
        return value if value is not None else None

    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        return self._spec_value(resource, qualifier_name)

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        value = self._spec_value(resource, property_name)
        return [value] if value is not None else None

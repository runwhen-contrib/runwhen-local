"""MCP (Model Context Protocol) server for RunWhen Local.

This package exposes a tiny, read-only MCP server that lets agentic clients
(Claude Code, Cursor, Claude Desktop, custom agents...) discover and reason
about the Skills and resources that the workspace-builder has indexed.

It is intentionally **read-only** in v1: search/list/get over the SQLite
resource store and rendered SLX bundles. A future iteration will layer
execution on top via a sandboxed micro-runtime.

The server is mounted into the existing FastAPI app as a Streamable HTTP
ASGI sub-app at ``/mcp``. See ``server.py`` for wiring details and
``tools.py`` for the tool surface itself.
"""

"""MCP server registration for RunWhen Local.

Builds a :class:`mcp.server.fastmcp.FastMCP` instance with the read-only
tool surface defined in :mod:`workspace_builder.mcp.tools` and exposes a
Streamable HTTP ASGI app that the FastAPI parent mounts at ``/mcp``.

The server is intentionally tiny: every tool delegates straight to the
same :mod:`workspace_builder.resource_store_reader` accessors that power
the explorer UI, so the MCP view is consistent with the human-facing
explorer at all times.
"""

from __future__ import annotations

import logging
import os
from typing import Any, Optional

from mcp.server.fastmcp import FastMCP

from . import tools as _tools

logger = logging.getLogger(__name__)

# Singleton FastMCP instance. We instantiate at import time so the ASGI
# app's lifespan is available to FastAPI before any request is routed.
_MCP_SERVER_NAME = "runwhen-local"
_MCP_SERVER_INSTRUCTIONS = (
    "RunWhen Local exposes resources and Skills indexed from the user's "
    "Kubernetes / Azure / AWS / GCP environment. Use these tools to "
    "search the resource graph, browse generated agentic Skills (each "
    "is a small SLX bundle of YAML + a SKILL.md), and pull the full "
    "bundle when the agent decides to reason about or describe a "
    "specific Skill. v1 is read-only; execution is a future iteration."
)


def _build_mcp_server() -> FastMCP:
    """Construct the FastMCP server and register tools.

    The MCP HTTP path is configurable so the Streamable HTTP path under
    the ``/mcp`` mount can be ``/mcp`` (the conventional default), giving
    final URLs of ``/mcp/mcp`` for the JSON-RPC endpoint. Setting it to
    ``/`` here means the JSON-RPC endpoint is served at exactly ``/mcp``,
    which is what most clients expect.
    """
    mcp = FastMCP(
        name=_MCP_SERVER_NAME,
        instructions=_MCP_SERVER_INSTRUCTIONS,
        # Serve the JSON-RPC endpoint at the mount root. The parent
        # FastAPI app mounts this under ``/mcp``, so clients reach it at
        # ``http://<host>:8000/mcp``.
        streamable_http_path="/",
    )

    # ---- Workspace summary -------------------------------------------------

    @mcp.tool(
        name="get_workspace_summary",
        description=(
            "Return top-line stats about the indexed RunWhen Local "
            "workspace: counts of resources by platform/type, number of "
            "generated Skills, and whether discovery has been run. Call "
            "this first to ground the agent in what the user actually "
            "has indexed before searching for Skills or resources."
        ),
    )
    def get_workspace_summary() -> dict[str, Any]:
        return _tools.get_workspace_summary()

    # ---- Skill (SLX bundle) tools -----------------------------------------

    @mcp.tool(
        name="search_skills",
        description=(
            "Search the generated agentic Skills (SLX bundles) by a "
            "natural-language query. Each Skill bundles together an SLX "
            "definition, an SLI, a runbook, and a SKILL.md describing "
            "what it does. Returns ranked matches with a short snippet "
            "around the first match - use get_skill to retrieve the "
            "full bundle once the agent has chosen one."
        ),
    )
    def search_skills(
        query: str,
        platform: Optional[str] = None,
        resource_type: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> dict[str, Any]:
        return _tools.search_skills(
            query=query,
            platform=platform,
            resource_type=resource_type,
            limit=limit,
        )

    @mcp.tool(
        name="list_skills",
        description=(
            "Browse all generated Skill bundles with pagination. Optional "
            "platform / resource_type filters are applied as keyword "
            "matches against the SLX path and contents. Use this when "
            "the agent wants to enumerate what is available rather than "
            "search for something specific."
        ),
    )
    def list_skills(
        platform: Optional[str] = None,
        resource_type: Optional[str] = None,
        limit: Optional[int] = None,
        offset: int = 0,
    ) -> dict[str, Any]:
        return _tools.list_skills(
            platform=platform,
            resource_type=resource_type,
            limit=limit,
            offset=offset,
        )

    @mcp.tool(
        name="get_skill",
        description=(
            "Retrieve the full content of one Skill bundle by SLX name "
            "(as returned by list_skills / search_skills). Includes the "
            "SLX yaml, SLI yaml, runbook yaml, and SKILL.md markdown so "
            "the agent can reason about what the Skill does and how to "
            "describe or invoke it."
        ),
    )
    def get_skill(slx_name: str) -> dict[str, Any]:
        return _tools.get_skill(slx_name)

    # ---- Resource tools ---------------------------------------------------

    @mcp.tool(
        name="search_resources",
        description=(
            "Search the indexed resource graph (Kubernetes, Azure, AWS, "
            "GCP) discovered by the workspace-builder. Filter by "
            "platform, resource_type, or a free-text query against "
            "resource name / qualified name. Use this to ground answers "
            "about what infrastructure the user actually has."
        ),
    )
    def search_resources(
        query: Optional[str] = None,
        platform: Optional[str] = None,
        resource_type: Optional[str] = None,
        limit: Optional[int] = None,
        offset: int = 0,
    ) -> dict[str, Any]:
        return _tools.search_resources_tool(
            query=query,
            platform=platform,
            resource_type=resource_type,
            limit=limit,
            offset=offset,
        )

    @mcp.tool(
        name="get_resource",
        description=(
            "Retrieve one indexed resource by its (platform, "
            "resource_type, qualified_name) triple, with the full set "
            "of attributes the indexer captured. Use after "
            "search_resources to drill into a specific item."
        ),
    )
    def get_resource(
        platform: str,
        resource_type: str,
        qualified_name: str,
    ) -> dict[str, Any]:
        return _tools.get_resource_tool(
            platform=platform,
            resource_type=resource_type,
            qualified_name=qualified_name,
        )

    # ---- Resource <-> Skill join -----------------------------------------

    @mcp.tool(
        name="get_skills_for_resource",
        description=(
            "Return Skill bundles bound to a specific resource - the "
            "agent's natural \"I'm looking at this Pod / Key Vault / "
            "Deployment, what runbooks apply?\" entry point. Matches "
            "are best-effort against SLX directory names and rendered "
            "content; future iterations will use an explicit binding "
            "stored at render time."
        ),
    )
    def get_skills_for_resource(
        platform: str,
        resource_type: str,
        qualified_name: str,
        limit: Optional[int] = None,
    ) -> dict[str, Any]:
        return _tools.get_skills_for_resource(
            platform=platform,
            resource_type=resource_type,
            qualified_name=qualified_name,
            limit=limit,
        )

    # ---- Workspace introspection -----------------------------------------

    @mcp.tool(
        name="get_workspace_health",
        description=(
            "Return the discovery-run health state: whether the service "
            "is healthy, when it last ran, how long the run took, how "
            "many warnings or parsing errors it produced, and which "
            "components ran. Use this when an agent needs to answer "
            "\"did the last discovery succeed?\" or \"why is the "
            "workspace empty?\"."
        ),
    )
    def get_workspace_health() -> dict[str, Any]:
        return _tools.get_workspace_health()

    @mcp.tool(
        name="list_codebundles",
        description=(
            "List the CodeCollections currently loaded by the workspace "
            "builder, plus where each was cloned from. Lets the agent "
            "explain *which repo* a Skill came from and helps the user "
            "trust the provenance of the runbooks it's seeing."
        ),
    )
    def list_codebundles() -> dict[str, Any]:
        return _tools.list_codebundles()

    # ---- Resource graph navigation ---------------------------------------

    @mcp.tool(
        name="get_resource_neighbors",
        description=(
            "Walk one hop in the indexed resource graph. Returns "
            "forward references (resources this one points at, e.g. a "
            "Deployment -> its Service / Pods / ReplicaSet) and reverse "
            "references (resources that point at it, e.g. a Namespace's "
            "members). Useful for grounding a multi-resource "
            "investigation."
        ),
    )
    def get_resource_neighbors(
        platform: str,
        resource_type: str,
        qualified_name: str,
        limit: Optional[int] = None,
    ) -> dict[str, Any]:
        return _tools.get_resource_neighbors(
            platform=platform,
            resource_type=resource_type,
            qualified_name=qualified_name,
            limit=limit,
        )

    # ---- Smarter Skill recommendation ------------------------------------

    @mcp.tool(
        name="recommend_skills",
        description=(
            "Recommend Skills given free-text context (a user message, "
            "an error trace, a log line). Token-overlap scoring runs "
            "against every Skill bundle, not just LIKE-prefiltered "
            "matches, so longer/looser context still surfaces the "
            "right runbook. Use when search_skills's curated query "
            "form feels too narrow."
        ),
    )
    def recommend_skills(
        context_text: str,
        max_results: int = 5,
    ) -> dict[str, Any]:
        return _tools.recommend_skills(
            context_text=context_text,
            max_results=max_results,
        )

    # ---- Skill invocation preview (read-only) ----------------------------

    @mcp.tool(
        name="preview_skill_invocation",
        description=(
            "Return what *would* run for a given Skill - SLX directory, "
            "runbook content, and an illustrative runwhen-cli command - "
            "without executing anything. v1 of the MCP server is "
            "read-only; the agent should describe or hand the command "
            "to the user. The future micro-runtime tool will replace "
            "this with sandboxed execution."
        ),
    )
    def preview_skill_invocation(slx_name: str) -> dict[str, Any]:
        return _tools.preview_skill_invocation(slx_name)

    # ---- Prompts (canned investigation flows) ----------------------------
    #
    # Prompts are pre-built starter templates that show up in slash-menus
    # of MCP-aware clients (Cursor, Claude Code, ...). They let an OSS
    # user pick "/triage-namespace payments-prod" and get a curated
    # investigation flow without having to learn how to phrase the
    # request to the agent. Each prompt orchestrates calls to the
    # existing tools above.

    @mcp.prompt(
        name="kickoff_investigation",
        description=(
            "Get oriented in a freshly-indexed RunWhen Local workspace. "
            "Tells the agent to call get_workspace_summary, list a few "
            "Skills and resources, and propose 2-3 next investigation "
            "directions. Good first prompt after wiring runwhen-local "
            "up to your client."
        ),
    )
    def kickoff_investigation_prompt() -> str:
        return (
            "I've connected to a RunWhen Local instance via MCP. Please "
            "help me get oriented:\n\n"
            "1. Call `get_workspace_summary` to see what platforms and "
            "resources are indexed.\n"
            "2. Call `get_workspace_health` to confirm the last "
            "discovery run succeeded and surface any warnings.\n"
            "3. Call `list_codebundles` so I can see which Skill "
            "libraries are loaded.\n"
            "4. Call `list_skills` (limit ~10) to sample what Skills "
            "are available.\n\n"
            "Then summarise (a) what kind of environment is indexed, "
            "(b) whether discovery looks healthy, and (c) 2-3 concrete "
            "investigation directions I could pursue next, each as a "
            "single-sentence pitch."
        )

    @mcp.prompt(
        name="triage_kubernetes_namespace",
        description=(
            "Triage a Kubernetes namespace: enumerate its resources, "
            "find Skills bound to those resources, and propose an "
            "investigation order. Best when something feels off in a "
            "namespace and you want a starter checklist."
        ),
    )
    def triage_kubernetes_namespace_prompt(namespace: str) -> str:
        return (
            f"I want to triage the Kubernetes namespace `{namespace}`. "
            "Please:\n\n"
            f"1. Call `search_resources(platform='kubernetes', "
            f"query='{namespace}')` to enumerate the resources in this "
            "namespace.\n"
            "2. For each Deployment / StatefulSet / DaemonSet you find, "
            "call `get_skills_for_resource(platform='kubernetes', "
            "resource_type=<type>, qualified_name=<qn>)` to find "
            "matching Skills.\n"
            "3. If any of those Skills look directly relevant, call "
            "`get_skill(slx_name=...)` to read the runbook.\n\n"
            "Output: a concise triage plan with the top 3-5 things to "
            "investigate, each linked to a specific Skill (by name) "
            "where one exists. Flag any resources that have no matching "
            "Skill - those are gaps worth raising."
        )

    @mcp.prompt(
        name="diagnose_failing_deployment",
        description=(
            "Diagnose a specific failing Kubernetes Deployment. The "
            "agent will pull the Deployment's resource attributes, "
            "find Skills that match it, walk one hop of the resource "
            "graph (Pods, Services, ReplicaSets), and propose the "
            "single most-likely-relevant Skill to run."
        ),
    )
    def diagnose_failing_deployment_prompt(
        namespace: str,
        deployment: str,
    ) -> str:
        qn = f"{namespace}/{deployment}"
        return (
            f"The Kubernetes Deployment `{deployment}` in namespace "
            f"`{namespace}` (qualified_name `{qn}`) is misbehaving. "
            "Please:\n\n"
            f"1. Call `get_resource(platform='kubernetes', "
            f"resource_type='Deployment', qualified_name='{qn}')` and "
            "summarise its replicas, image, and key attributes.\n"
            f"2. Call `get_resource_neighbors(platform='kubernetes', "
            f"resource_type='Deployment', qualified_name='{qn}')` to "
            "list its Pods / ReplicaSet / Services.\n"
            f"3. Call `get_skills_for_resource(platform='kubernetes', "
            f"resource_type='Deployment', qualified_name='{qn}')` to "
            "find matching Skills.\n"
            "4. Pick the single Skill you think is most likely to "
            "diagnose the issue and call `preview_skill_invocation` on "
            "it so I can see the exact command.\n\n"
            "Be explicit about uncertainty: if the matching Skills "
            "look generic, call `recommend_skills` with the "
            "Deployment's image + a one-line description as context "
            "to broaden the suggestion."
        )

    @mcp.prompt(
        name="audit_azure_keyvaults",
        description=(
            "Audit indexed Azure Key Vaults for rotation, expiry, and "
            "access-policy concerns. Returns a per-vault checklist "
            "linked to the Skills that can investigate each concern."
        ),
    )
    def audit_azure_keyvaults_prompt() -> str:
        return (
            "I want a security audit of the Azure Key Vaults RunWhen "
            "Local has indexed. Please:\n\n"
            "1. Call `search_resources(platform='azure', "
            "resource_type='azure_keyvault_vaults')` to list every "
            "indexed vault.\n"
            "2. Call `search_skills(query='key vault rotation expiry "
            "access policy')` to surface relevant Skills.\n"
            "3. For each vault, call `get_skills_for_resource` so we "
            "know which Skills are bound to which vault.\n"
            "4. Produce a per-vault report: vault name, location, "
            "the Skills that apply, and any obvious concerns from "
            "the resource attributes (network ACLs, soft-delete, "
            "purge protection).\n\n"
            "Where Skills are missing for a vault, call this out as "
            "a gap rather than fabricating an investigation."
        )

    return mcp


_mcp_server: Optional[FastMCP] = None


def get_mcp_server() -> FastMCP:
    """Lazy singleton accessor.

    Used by tests so they can build a fresh server instance per case
    without paying the registration cost at import time.
    """
    global _mcp_server
    if _mcp_server is None:
        _mcp_server = _build_mcp_server()
    return _mcp_server


def is_mcp_enabled() -> bool:
    """Return whether the MCP HTTP route should be mounted.

    Defaults to enabled. Set ``RW_MCP_DISABLED=true`` to opt out (e.g.
    in environments where the operator wants to keep the server
    process tightly scoped to discovery only).
    """
    flag = os.getenv("RW_MCP_DISABLED", "").strip().lower()
    return flag not in ("1", "true", "yes", "on")


def build_streamable_http_app():
    """Return the Streamable HTTP ASGI app for FastAPI to mount.

    The FastMCP session manager has a lifespan that the parent ASGI app
    *must* run, otherwise tool calls fail with "Task group is not
    initialized". The caller is responsible for wiring this into the
    parent's lifespan via :func:`build_mcp_lifespan`.
    """
    server = get_mcp_server()
    return server.streamable_http_app()


def build_mcp_lifespan():
    """Return an async context manager FastAPI can use as ``lifespan=``.

    Internally this drives the FastMCP server's session manager, which
    is what initialises the streamable-HTTP task group. Without it,
    every JSON-RPC call to the mounted ``/mcp`` endpoint fails with
    "FastMCP's StreamableHTTPSessionManager task group was not
    initialized."
    """
    from contextlib import asynccontextmanager

    server = get_mcp_server()

    @asynccontextmanager
    async def lifespan(app):  # noqa: ANN001 - FastAPI passes the app instance
        async with server.session_manager.run():
            yield

    return lifespan

"""Tool implementations for the RunWhen Local MCP server.

Each public function here corresponds 1:1 with a tool registered on the
MCP server in :mod:`workspace_builder.mcp.server`. The split lets us:

* unit-test the behaviour without needing the MCP transport, and
* keep the tool registration file thin and focused on schemas/docstrings.

All functions are read-only and side-effect-free; they query the SQLite
resource store via the same accessors as the ``/explorer/*`` REST API,
so anything an agent learns through MCP is consistent with what a human
sees in the explorer UI.
"""

from __future__ import annotations

import os
from typing import Any, Optional

from indexers.sqlite_resource_writer import (
    get_resource as _get_resource,
    get_workspace_artifact,
    list_resource_types,
    search_workspace_artifacts,
)
from utils import get_version_info

from ..resource_store_reader import (
    count_resources,
    get_store_summary,
    json_safe,
    list_slx_bundles,
    resource_db_connection,
    resolve_resource_db_path,
    search_resources,
)
from .search import make_snippet, score_candidate, tokenize

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

# Maximum content size we hand back per skill artifact (slx / sli / runbook /
# skill markdown). Agents have hard context limits; runbooks are rarely
# above this and capping prevents one giant SLX from blowing up a request.
MAX_CONTENT_CHARS = 32_000

# Pool of bundle candidates we re-rank inside ``search_skills``. Big enough
# that LIKE matches anywhere in a runbook can still surface a precise hit,
# small enough that ranking stays O(few-hundred) per query.
_SEARCH_CANDIDATE_POOL = 100


# ---------------------------------------------------------------------------
# Errors
# ---------------------------------------------------------------------------


class StoreUnavailable(RuntimeError):
    """Raised when the SQLite resource store has not been built yet.

    The MCP layer surfaces this as an explicit, actionable error so the
    calling agent can tell the user "run discovery first" rather than
    silently returning empty results.
    """


def _clip_limit(limit: Optional[int], default: int = DEFAULT_LIMIT) -> int:
    if limit is None:
        return default
    if limit <= 0:
        return default
    return min(limit, MAX_LIMIT)


def _clip_content(content: str | None) -> str:
    if not content:
        return ""
    if len(content) <= MAX_CONTENT_CHARS:
        return content
    return content[:MAX_CONTENT_CHARS] + "\n\n[... truncated; fetch via the explorer API for full content ...]"


# ---------------------------------------------------------------------------
# Workspace summary
# ---------------------------------------------------------------------------


def get_workspace_summary() -> dict[str, Any]:
    """Top-line stats about the indexed workspace.

    Useful as a first call from an agent to ground itself: how many
    resources are indexed, across which platforms, and how many Skills
    have been generated. Returns an empty-but-valid summary when no
    discovery run has happened yet (so agents can still call this before
    the user has done anything).
    """
    version = get_version_info().get("version")
    db_path = str(resolve_resource_db_path())

    if not os.path.isfile(db_path):
        return {
            "version": version,
            "db_path": db_path,
            "discovery_complete": False,
            "message": (
                "No discovery has been run yet. Ask the user to run the "
                "workspace-builder against their environment, then call this "
                "tool again."
            ),
        }

    with resource_db_connection() as conn:
        summary = get_store_summary(conn)
        bundles = list_slx_bundles(conn, limit=1, offset=0)

        type_breakdown: list[dict[str, Any]] = []
        for platform in summary["platforms"]:
            for resource_type in list_resource_types(conn, platform=platform):
                type_breakdown.append(
                    {
                        "platform": platform,
                        "resource_type": resource_type["name"],
                        "count": count_resources(
                            conn,
                            platform=platform,
                            resource_type=resource_type["name"],
                        ),
                    }
                )

        return {
            "version": version,
            "db_path": db_path,
            "discovery_complete": True,
            "schema_version": summary["schema_version"],
            "resource_count": summary["resource_count"],
            "resource_type_count": summary["resource_type_count"],
            "platform_count": summary["platform_count"],
            "platforms": summary["platforms"],
            "skill_bundle_count": bundles["total"],
            "artifact_kinds": summary["artifact_kinds"],
            "resources_by_type": sorted(
                type_breakdown,
                key=lambda r: r["count"],
                reverse=True,
            ),
        }


# ---------------------------------------------------------------------------
# Skill (SLX bundle) tools
# ---------------------------------------------------------------------------


def list_skills(
    platform: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: Optional[int] = None,
    offset: int = 0,
) -> dict[str, Any]:
    """List rendered SLX bundles, optionally narrowed by ``platform`` /
    ``resource_type`` keyword.

    The resource_type filter is applied as a substring match against
    the SLX directory + name + the contents of skill/runbook artifacts;
    SLX bundles aren't directly tagged with a resource type, so this
    keeps the tool useful without a schema migration.
    """
    limit = _clip_limit(limit)
    offset = max(0, int(offset))

    query_terms = [t for t in (platform, resource_type) if t]
    q = " ".join(query_terms) if query_terms else None

    with resource_db_connection() as conn:
        data = list_slx_bundles(conn, q=q, limit=limit, offset=offset)
        items = [
            _summarize_bundle(bundle)
            for bundle in data["items"]
        ]
        return {
            "total": data["total"],
            "limit": limit,
            "offset": offset,
            "items": items,
        }


def search_skills(
    query: str,
    platform: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: Optional[int] = None,
) -> dict[str, Any]:
    """Rank-search rendered Skill bundles by ``query``.

    Combines an SQL ``LIKE`` filter against the SLX directory / file path
    / content (cheap, narrows to a candidate pool) with token-overlap
    re-ranking against the SLX name + skill markdown body. Returns at
    most ``limit`` bundles ordered by score, each with a short snippet
    around the first query match.
    """
    limit = _clip_limit(limit)
    if not query or not query.strip():
        return {"total": 0, "limit": limit, "items": []}

    # Only the explicit platform / resource_type filters get used as a LIKE
    # narrowing of the candidate pool. Using the free-text query as a LIKE
    # forces all words to appear contiguously, which is wrong for natural-
    # language queries ("rotate key vault secrets" rarely appears verbatim).
    # Token-overlap ranking below does the real relevance work; the pool
    # cap (_SEARCH_CANDIDATE_POOL) keeps this O(few-hundred) per query.
    extra_terms = [t for t in (platform, resource_type) if t]
    pool_query = " ".join(extra_terms) if extra_terms else None

    with resource_db_connection() as conn:
        pool = list_slx_bundles(
            conn,
            q=pool_query,
            limit=_SEARCH_CANDIDATE_POOL,
            offset=0,
        )
        query_tokens = tokenize(query)
        ranked: list[tuple[float, dict[str, Any]]] = []
        for bundle in pool["items"]:
            content = _bundle_content_for_ranking(conn, bundle)
            score = score_candidate(
                query_tokens,
                name=bundle.get("slx_name"),
                path=bundle.get("slx_directory"),
                kinds=bundle.get("kinds"),
                content=content,
            )
            if score <= 0.0:
                continue
            summary = _summarize_bundle(bundle)
            summary["score"] = score
            summary["snippet"] = make_snippet(content, query)
            ranked.append((score, summary))

        ranked.sort(key=lambda pair: pair[0], reverse=True)
        items = [item for _, item in ranked[:limit]]

    return {
        "total": len(ranked),
        "candidate_pool": pool["total"],
        "limit": limit,
        "items": items,
    }


def get_skill(slx_name: str) -> dict[str, Any]:
    """Return the full contents of a Skill bundle by SLX name.

    The name is matched against the basename of ``slx_directory`` (i.e.
    what ``list_skills`` reports as ``slx_name``). Content is clipped
    per artifact at :data:`MAX_CONTENT_CHARS` to stay within agent
    context budgets; the explorer REST API is the escape hatch for full
    content.
    """
    if not slx_name:
        raise ValueError("slx_name is required")

    with resource_db_connection() as conn:
        candidates = list_slx_bundles(conn, q=slx_name, limit=50, offset=0)
        match = None
        for bundle in candidates["items"]:
            if bundle.get("slx_name") == slx_name:
                match = bundle
                break
        if match is None:
            for bundle in candidates["items"]:
                if (bundle.get("slx_directory") or "").endswith("/" + slx_name):
                    match = bundle
                    break
        if match is None:
            raise LookupError(f"No Skill bundle found with name: {slx_name}")

        files: list[dict[str, Any]] = []
        for file_meta in match["files"]:
            full = get_workspace_artifact(
                conn,
                match["workspace_name"],
                file_meta["relative_path"],
            )
            if full is None:
                continue
            files.append(
                {
                    "relative_path": file_meta["relative_path"],
                    "artifact_kind": full["artifact_kind"],
                    "media_type": full["media_type"],
                    "content": _clip_content(full.get("content", "")),
                }
            )

        return {
            "workspace_name": match["workspace_name"],
            "slx_name": match["slx_name"],
            "slx_directory": match["slx_directory"],
            "kinds": match["kinds"],
            "has_skill": match["has_skill"],
            "has_sli": match["has_sli"],
            "has_runbook": match["has_runbook"],
            "files": files,
        }


# ---------------------------------------------------------------------------
# Resource tools
# ---------------------------------------------------------------------------


def search_resources_tool(
    query: Optional[str] = None,
    platform: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: Optional[int] = None,
    offset: int = 0,
) -> dict[str, Any]:
    """Search the indexed resource graph.

    Mirrors :func:`workspace_builder.resource_store_reader.search_resources`
    but returns a JSON-safe payload suitable for direct return from an
    MCP tool.
    """
    limit = _clip_limit(limit)
    offset = max(0, int(offset))

    with resource_db_connection() as conn:
        total = count_resources(
            conn,
            platform=platform,
            resource_type=resource_type,
            q=query,
        )
        items = search_resources(
            conn,
            platform=platform,
            resource_type=resource_type,
            q=query,
            limit=limit,
            offset=offset,
        )
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": json_safe(items),
    }


def get_resource_tool(
    platform: str,
    resource_type: str,
    qualified_name: str,
) -> dict[str, Any]:
    """Return one indexed resource with its full attribute payload."""
    if not platform or not resource_type or not qualified_name:
        raise ValueError("platform, resource_type and qualified_name are required")

    with resource_db_connection() as conn:
        resource = _get_resource(conn, platform, resource_type, qualified_name)
        if resource is None:
            raise LookupError(
                f"Resource not found: platform={platform!r} "
                f"resource_type={resource_type!r} qualified_name={qualified_name!r}"
            )
        return json_safe(resource)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _summarize_bundle(bundle: dict[str, Any]) -> dict[str, Any]:
    return {
        "workspace_name": bundle.get("workspace_name"),
        "slx_name": bundle.get("slx_name"),
        "slx_directory": bundle.get("slx_directory"),
        "file_count": bundle.get("file_count"),
        "kinds": bundle.get("kinds", []),
        "has_skill": bundle.get("has_skill", False),
        "has_sli": bundle.get("has_sli", False),
        "has_runbook": bundle.get("has_runbook", False),
    }


def _bundle_content_for_ranking(conn, bundle: dict[str, Any]) -> str:
    """Concatenate skill + runbook + sli content for a bundle.

    We score against the union so a query that matches a runbook
    snippet still surfaces the bundle even when the SLX name itself is
    generic. Skill markdown is weighted highest by ordering it first
    (only matters if we ever truncate; harmless otherwise).
    """
    workspace_name = bundle.get("workspace_name")
    if not workspace_name:
        return ""
    slx_dir = bundle.get("slx_directory") or ""
    parts: list[str] = []
    for kind in ("skill", "runbook", "sli", "slx"):
        rows = search_workspace_artifacts(
            conn,
            workspace_name=workspace_name,
            artifact_kind=kind,
            limit=10,
            offset=0,
        )
        for row in rows:
            if not row.get("relative_path", "").startswith(slx_dir):
                continue
            content = row.get("content")
            if content:
                parts.append(content)
    return "\n\n".join(parts)


# Resource-availability helper for the server module so it can decide
# whether to register tools eagerly even when the DB doesn't exist yet
# (it does; tools surface a friendly StoreUnavailable / empty payload at
# call time).


def store_is_ready() -> bool:
    """Return ``True`` when the SQLite resource store is on disk."""
    try:
        return resolve_resource_db_path().is_file()
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Join: Skills <-> Resources
# ---------------------------------------------------------------------------


def get_skills_for_resource(
    platform: str,
    resource_type: str,
    qualified_name: str,
    limit: Optional[int] = None,
) -> dict[str, Any]:
    """Return Skill bundles that reference a specific resource.

    The workspace-builder doesn't store an explicit "this SLX is bound
    to this resource" link in the SQLite store today; instead, the
    binding is encoded into the rendered artifacts (``slx_directory``
    name, runbook ``configProvided`` values, SKILL.md prose). We do a
    best-effort match by scanning artifact content + paths for the
    resource's ``qualified_name`` and ``name``.

    This is the agent's natural "I'm looking at this Pod, what runbooks
    apply?" entry point. Future iterations can swap the content scan
    for an explicit binding once the renderer records one.
    """
    if not platform or not resource_type or not qualified_name:
        raise ValueError("platform, resource_type and qualified_name are required")

    limit = _clip_limit(limit)

    with resource_db_connection() as conn:
        # Resolve the resource so we know its short name (used in slx_directory
        # for many gen rule templates) and any reference attributes that might
        # also identify it.
        resource = _get_resource(conn, platform, resource_type, qualified_name)
        if resource is None:
            raise LookupError(
                f"Resource not found: platform={platform!r} "
                f"resource_type={resource_type!r} qualified_name={qualified_name!r}"
            )

        short_name = resource.get("name") or qualified_name.rsplit("/", 1)[-1]
        match_terms = {qualified_name, short_name}
        # SLX directories are usually slugified; basename of qualified_name
        # often appears in directory names verbatim or with separators
        # changed. Add the basename as an additional candidate.
        for term in (qualified_name, short_name):
            slug = term.replace("/", "-").replace(" ", "-").lower()
            if slug:
                match_terms.add(slug)

        seen_dirs: dict[str, dict[str, Any]] = {}
        for term in match_terms:
            if not term:
                continue
            data = list_slx_bundles(
                conn,
                q=term,
                limit=_SEARCH_CANDIDATE_POOL,
                offset=0,
            )
            for bundle in data["items"]:
                key = f"{bundle.get('workspace_name')}|{bundle.get('slx_directory')}"
                if key in seen_dirs:
                    seen_dirs[key]["matched_terms"].add(term)
                    continue
                summary = _summarize_bundle(bundle)
                summary["matched_terms"] = {term}
                seen_dirs[key] = summary

        items: list[dict[str, Any]] = []
        for entry in seen_dirs.values():
            entry["matched_terms"] = sorted(entry["matched_terms"])
            items.append(entry)
        # Bundles that match more than one term are likely better-bound; sort
        # most-matched first.
        items.sort(key=lambda b: (-len(b["matched_terms"]), b.get("slx_name") or ""))

    return {
        "resource": {
            "platform": platform,
            "resource_type": resource_type,
            "qualified_name": qualified_name,
            "name": short_name,
        },
        "total": len(items),
        "items": items[:limit],
    }


# ---------------------------------------------------------------------------
# Workspace health
# ---------------------------------------------------------------------------


def get_workspace_health() -> dict[str, Any]:
    """Surface the discovery-run health state so agents can answer
    "did discovery succeed?" / "when did it last run?".

    Mirrors the shape of the existing ``GET /health/`` endpoint, with a
    hard fallback so an agent always gets a usable response even if the
    health tracker hasn't been initialised yet.
    """
    try:
        from ..health import get_health_tracker

        tracker = get_health_tracker()
        info = tracker.get_health_info()
        payload: dict[str, Any] = {
            "status": info.service_status,
            "service_start_time": info.service_start_time,
            "uptime_seconds": info.uptime_seconds,
            "is_healthy": tracker.is_healthy(),
            "is_ready": tracker.is_ready(),
        }
        if info.last_run:
            last = info.last_run
            payload["last_run"] = {
                "start_time": last.start_time,
                "end_time": last.end_time,
                "status": last.status,
                "error_message": last.error_message,
                "warnings_count": last.warnings_count,
                "parsing_errors_count": last.parsing_errors_count,
                "components_run": list(last.components_run or []),
                "current_stage": last.current_stage,
                "current_component": last.current_component,
                "slx_count": last.slx_count,
                "duration_seconds": last.duration_seconds,
            }
        else:
            payload["last_run"] = None
        return payload
    except Exception as exc:
        return {
            "status": "unknown",
            "is_healthy": False,
            "is_ready": False,
            "error": str(exc),
            "last_run": None,
        }


# ---------------------------------------------------------------------------
# CodeCollection introspection
# ---------------------------------------------------------------------------


def list_codebundles() -> dict[str, Any]:
    """List the CodeCollections that have been loaded into the workspace
    builder, plus a count of Skills each contributes.

    This lets an agent explain *where* a Skill came from when answering
    a user ("this Skill ships in the rw-cli-codecollection repo,
    branch main"). The Skill-count side is best-effort: we can't
    definitively map an SLX to its source CodeCollection from the
    SQLite store alone, so we surface the loaded collections and let
    the explorer / authoring docs handle deeper provenance.
    """
    try:
        from enrichers import code_collection as _cc

        cache = getattr(_cc, "code_collection_cache", None)
        if not cache:
            return {"total": 0, "items": []}

        items: list[dict[str, Any]] = []
        for repo_url, collection in cache.items():
            items.append(
                {
                    "repo_url": repo_url,
                    "repo_directory": getattr(collection, "repo_directory_path", None),
                    "loaded": getattr(collection, "repo", None) is not None,
                }
            )
        return {"total": len(items), "items": items}
    except Exception as exc:
        return {"total": 0, "items": [], "error": str(exc)}


# ---------------------------------------------------------------------------
# Resource neighbors (graph walk)
# ---------------------------------------------------------------------------


def get_resource_neighbors(
    platform: str,
    resource_type: str,
    qualified_name: str,
    limit: Optional[int] = None,
) -> dict[str, Any]:
    """Return resources directly related to the given resource.

    Two passes:

    * **Forward refs**: walk the resource's attributes for ``$ref`` markers
      (the encoder in :mod:`indexers.sqlite_resource_writer` records every
      Resource cross-reference as a stable JSON marker) and resolve each
      to a real row in the resource store.
    * **Reverse refs**: SQL ``LIKE`` over ``attributes_json`` for the
      resource's qualified name to find anything that points back at it.

    Both directions are bounded by ``limit`` so an agent can't run away
    on a hub resource (e.g. a Resource Group with hundreds of
    descendants).
    """
    if not platform or not resource_type or not qualified_name:
        raise ValueError("platform, resource_type and qualified_name are required")

    limit = _clip_limit(limit)

    forward: list[dict[str, Any]] = []
    reverse: list[dict[str, Any]] = []

    with resource_db_connection() as conn:
        resource = _get_resource(conn, platform, resource_type, qualified_name)
        if resource is None:
            raise LookupError(
                f"Resource not found: platform={platform!r} "
                f"resource_type={resource_type!r} qualified_name={qualified_name!r}"
            )

        # --- Forward refs: walk attributes for $ref markers --------------
        seen_forward: set[tuple[str, str, str]] = set()
        for ref in _walk_refs(resource.get("attributes")):
            key = (
                ref.get("platform") or "",
                ref.get("resource_type") or "",
                ref.get("qualified_name") or "",
            )
            if not all(key) or key in seen_forward:
                continue
            seen_forward.add(key)
            target = _get_resource(conn, key[0], key[1], key[2])
            if target is None:
                # Reference to something not in the store (e.g. cross-
                # subscription Azure RG or a referenced K8s resource we
                # didn't index). Surface the marker so the agent can see
                # the link even though we can't resolve it.
                forward.append(
                    {
                        "platform": key[0],
                        "resource_type": key[1],
                        "qualified_name": key[2],
                        "name": ref.get("name"),
                        "resolved": False,
                    }
                )
            else:
                forward.append(
                    {
                        "platform": target["platform"],
                        "resource_type": target["resource_type"],
                        "qualified_name": target["qualified_name"],
                        "name": target.get("name"),
                        "resolved": True,
                    }
                )
            if len(forward) >= limit:
                break

        # --- Reverse refs: who references this resource? -----------------
        # We escape SQL LIKE wildcards so qualified_names containing
        # underscores ("default/api_v2") don't match as wildcards.
        like_pattern = "%" + qualified_name.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
        rows = conn.execute(
            "SELECT platform, resource_type, qualified_name, name "
            "FROM resources "
            "WHERE attributes_json LIKE ? ESCAPE '\\' "
            "  AND NOT (platform = ? AND resource_type = ? AND qualified_name = ?) "
            "LIMIT ?",
            (like_pattern, platform, resource_type, qualified_name, limit),
        ).fetchall()
        for row in rows:
            reverse.append(
                {
                    "platform": row[0],
                    "resource_type": row[1],
                    "qualified_name": row[2],
                    "name": row[3],
                    "resolved": True,
                }
            )

    return {
        "resource": {
            "platform": platform,
            "resource_type": resource_type,
            "qualified_name": qualified_name,
            "name": resource.get("name"),
        },
        "forward_refs": forward,
        "reverse_refs": reverse,
    }


def _walk_refs(value: Any):
    """Yield ``$ref`` marker dicts found anywhere inside a decoded
    attribute tree.

    The encoder represents Resource cross-references as
    ``{"$ref": {"platform": ..., "resource_type": ..., "qualified_name": ...}}``;
    we just descend recursively and yield each one we find.
    """
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, dict):
            yield ref
        for v in value.values():
            if isinstance(v, (dict, list)):
                yield from _walk_refs(v)
    elif isinstance(value, list):
        for v in value:
            if isinstance(v, (dict, list)):
                yield from _walk_refs(v)


# ---------------------------------------------------------------------------
# Skill recommendation (smarter than search_skills)
# ---------------------------------------------------------------------------


def recommend_skills(
    context_text: str,
    max_results: int = 5,
) -> dict[str, Any]:
    """Recommend Skills given a free-text context (an error trace, log
    line, the user's last message, etc.).

    Differences from :func:`search_skills`:

    * Accepts longer free-text input, not a curated query string.
    * Token-overlap scoring is run against every bundle (not gated by
      the SQL ``LIKE`` pre-filter), so a long stack trace can still
      surface a Skill whose relevance lives only in the runbook body.
    * The default ``max_results`` is small (5) because this is meant
      to feed an agent's "consider these next" list, not a browse.

    Implementation reuses the same ranking primitives so the contract
    stays drop-in compatible if we later replace the keyword scorer
    with embeddings.
    """
    if not context_text or not context_text.strip():
        return {"total": 0, "items": []}

    max_results = max(1, min(int(max_results or 5), MAX_LIMIT))

    with resource_db_connection() as conn:
        pool = list_slx_bundles(
            conn,
            q=None,
            limit=_SEARCH_CANDIDATE_POOL,
            offset=0,
        )
        query_tokens = tokenize(context_text)
        ranked: list[tuple[float, dict[str, Any]]] = []
        for bundle in pool["items"]:
            content = _bundle_content_for_ranking(conn, bundle)
            score = score_candidate(
                query_tokens,
                name=bundle.get("slx_name"),
                path=bundle.get("slx_directory"),
                kinds=bundle.get("kinds"),
                content=content,
            )
            if score <= 0.0:
                continue
            summary = _summarize_bundle(bundle)
            summary["score"] = score
            summary["snippet"] = make_snippet(content, context_text)
            ranked.append((score, summary))
        ranked.sort(key=lambda pair: pair[0], reverse=True)
        items = [item for _, item in ranked[:max_results]]

    return {
        "total": len(ranked),
        "candidate_pool": pool["total"],
        "items": items,
    }


# ---------------------------------------------------------------------------
# Skill invocation preview (read-only "what would I run?")
# ---------------------------------------------------------------------------


def preview_skill_invocation(slx_name: str) -> dict[str, Any]:
    """Return a human-readable preview of how the agent (or a user) would
    invoke a Skill, without executing anything.

    v1 returns:

    * the SLX directory and workspace name (the path the
      runwhen-cli expects),
    * the runbook YAML inline (clipped),
    * a templated invocation example that the user can copy.

    The actual execution surface is intentionally not part of v1; this
    tool is the "agent describes what would happen" handoff while we
    build the sandboxed micro-runtime. The exact CLI string is
    illustrative - the runwhen-cli spelling may differ in the user's
    install. The agent is expected to confirm with the user before
    running anything.
    """
    bundle = get_skill(slx_name)

    runbook_files = [f for f in bundle["files"] if f["artifact_kind"] == "runbook"]
    runbook = runbook_files[0] if runbook_files else None

    invocation = (
        f"# Run this Skill via runwhen-cli (illustrative)\n"
        f"runwhen-cli run \\\n"
        f"  --workspace {bundle['workspace_name']} \\\n"
        f"  --slx {bundle['slx_name']}"
    )

    return {
        "slx_name": bundle["slx_name"],
        "slx_directory": bundle["slx_directory"],
        "workspace_name": bundle["workspace_name"],
        "kinds": bundle["kinds"],
        "runbook_path": runbook["relative_path"] if runbook else None,
        "runbook_content": runbook["content"] if runbook else None,
        "invocation_example": invocation,
        "notes": (
            "v1 of the MCP server is read-only. This tool returns what "
            "*would* run; the agent should confirm with the user and "
            "either copy-paste the command or wait for the future "
            "micro-runtime tool. The exact CLI invocation depends on "
            "the user's runwhen-cli install."
        ),
    }


__all__ = [
    "DEFAULT_LIMIT",
    "MAX_LIMIT",
    "MAX_CONTENT_CHARS",
    "StoreUnavailable",
    "get_workspace_summary",
    "list_skills",
    "search_skills",
    "get_skill",
    "search_resources_tool",
    "get_resource_tool",
    "store_is_ready",
    "get_skills_for_resource",
    "get_workspace_health",
    "list_codebundles",
    "get_resource_neighbors",
    "recommend_skills",
    "preview_skill_invocation",
]

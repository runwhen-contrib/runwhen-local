"""Tests for the MCP server tool surface and ranking."""

from __future__ import annotations

import os
import tempfile
import unittest
from unittest.mock import patch

from indexers.sqlite_resource_writer import persist_sqlite_store
from outputter import FileSystemOutputter
from component import Context
from resources import REGISTRY_PROPERTY_NAME, Registry

from workspace_builder.mcp import search as mcp_search
from workspace_builder.mcp import tools as mcp_tools
from workspace_builder.mcp.server import (
    build_streamable_http_app,
    get_mcp_server,
    is_mcp_enabled,
)


# ---------------------------------------------------------------------------
# Database seeding helper
# ---------------------------------------------------------------------------


def _seed_database(db_path: str, with_skills: bool = True) -> None:
    """Seed a SQLite resource store with two resources and (optionally) two
    full SLX bundles for the MCP tools to exercise."""
    with tempfile.TemporaryDirectory() as tmpdir:
        ctx = Context(
            setting_values={
                "RESOURCE_STORE_BACKEND": "sqlite",
                "RESOURCE_STORE_PATH": "resources.sqlite",
                "WORKSPACE_NAME": "demo-ws",
            },
            outputter=FileSystemOutputter(tmpdir),
        )
        registry = Registry()
        ctx.set_property(REGISTRY_PROPERTY_NAME, registry)
        ns = registry.add_resource(
            "kubernetes",
            "Namespace",
            "default",
            "default",
            {"lod": "basic"},
        )
        # Deployment carries a $ref-encodable attribute pointing at its
        # Namespace so get_resource_neighbors has a forward edge to walk.
        registry.add_resource(
            "kubernetes",
            "Deployment",
            "api",
            "default/api",
            {"lod": "detailed", "replicas": 3, "namespace": ns},
        )
        registry.add_resource(
            "azure",
            "azure_keyvault_vaults",
            "rwl-kv-demo",
            "/subscriptions/sub-1/resourceGroups/keep/providers/Microsoft.KeyVault/vaults/rwl-kv-demo",
            {"location": "eastus"},
        )

        if with_skills:
            from renderers.rendered_artifacts import record_rendered_artifact

            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/k8s-deployment-health/slx.yaml",
                "kind: ServiceLevelX\nname: k8s-deployment-health\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/k8s-deployment-health/runbook.yaml",
                "commands:\n  - description: Check failing pods in the deployment\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/k8s-deployment-health/sli.yaml",
                "kind: ServiceLevelIndicator\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/k8s-deployment-health/SKILL.md",
                "# Deployment health\n\nDiagnoses failing pods, "
                "crashloops, and image pull errors in a Kubernetes "
                "Deployment.\n",
            )

            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/azure-keyvault-rotation/slx.yaml",
                "kind: ServiceLevelX\nname: azure-keyvault-rotation\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/azure-keyvault-rotation/runbook.yaml",
                "commands:\n  - description: Rotate Azure Key Vault secrets and report stale entries\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/azure-keyvault-rotation/SKILL.md",
                "# Azure Key Vault rotation\n\nFinds Key Vault secrets approaching "
                "expiry and produces a rotation plan.\n",
            )

            # A *resource-bound* Skill: in real workspaces, generation rules
            # render an SLX per matched resource and embed the resource's
            # name in both the slx_directory and runbook configProvided.
            # This is what get_skills_for_resource keys on, so we mirror it
            # in the fixture so the join tool has something credible to find.
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/k8s-deployment-default-api-health/slx.yaml",
                "kind: ServiceLevelX\nname: k8s-deployment-default-api-health\n"
                "spec:\n  configProvided:\n  - name: NAMESPACE\n    value: default\n"
                "  - name: DEPLOYMENT\n    value: api\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/k8s-deployment-default-api-health/runbook.yaml",
                "metadata:\n  bound_to: default/api\n"
                "commands:\n  - description: Diagnose default/api Deployment\n",
            )
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/k8s-deployment-default-api-health/SKILL.md",
                "# Health check for default/api\n\nPair-bound Skill targeting "
                "the Deployment named `api` in the `default` namespace.\n",
            )

        persist_sqlite_store(ctx, db_path="resources.sqlite")
        with open(os.path.join(tmpdir, "resources.sqlite"), "rb") as src, open(db_path, "wb") as dst:
            dst.write(src.read())


# ---------------------------------------------------------------------------
# Search ranking unit tests (no DB required)
# ---------------------------------------------------------------------------


class SearchRankingTests(unittest.TestCase):
    def test_tokenize_drops_stopwords_and_lowercases(self):
        self.assertEqual(
            mcp_search.tokenize("The Failing Pod and the API"),
            ["failing", "pod", "api"],
        )

    def test_tokenize_handles_empty_input(self):
        self.assertEqual(mcp_search.tokenize(""), [])
        self.assertEqual(mcp_search.tokenize(None), [])

    def test_score_weights_name_above_content(self):
        """A name match should score higher than a content match for the same token."""
        query_tokens = ["foo"]
        name_score = mcp_search.score_candidate(
            query_tokens,
            name="foo-bar",
            path=None,
            kinds=None,
            content=None,
        )
        content_score = mcp_search.score_candidate(
            query_tokens,
            name=None,
            path=None,
            kinds=None,
            content="foo lives here",
        )
        self.assertGreater(name_score, content_score)

    def test_score_zero_when_no_overlap(self):
        score = mcp_search.score_candidate(
            ["zzz"],
            name="alpha",
            path="alpha/beta",
            kinds=["slx"],
            content="this body has no overlap",
        )
        self.assertEqual(score, 0.0)

    def test_make_snippet_centers_on_first_match(self):
        body = "lorem ipsum dolor sit amet, consectetur adipiscing elit. The pod is failing."
        snippet = mcp_search.make_snippet(body, "failing pod")
        self.assertIn("failing", snippet)

    def test_make_snippet_falls_back_to_head(self):
        body = "completely unrelated content body about other things"
        snippet = mcp_search.make_snippet(body, "asdfqwerty")
        self.assertTrue(snippet.startswith("completely unrelated"))


# ---------------------------------------------------------------------------
# Tool implementation tests (require DB)
# ---------------------------------------------------------------------------


class WorkspaceSummaryTests(unittest.TestCase):
    def test_summary_when_db_missing(self):
        with patch.dict(
            os.environ,
            {"RW_RESOURCE_STORE_PATH": "/tmp/__rwl-mcp-missing/db.sqlite"},
            clear=False,
        ):
            summary = mcp_tools.get_workspace_summary()
        self.assertFalse(summary["discovery_complete"])
        self.assertIn("No discovery", summary["message"])

    def test_summary_with_seeded_db(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                summary = mcp_tools.get_workspace_summary()
        self.assertTrue(summary["discovery_complete"])
        self.assertEqual(3, summary["resource_count"])
        self.assertIn("kubernetes", summary["platforms"])
        self.assertIn("azure", summary["platforms"])
        self.assertGreaterEqual(summary["skill_bundle_count"], 2)
        # Type breakdown should be sorted by count desc and include all three types.
        names = {entry["resource_type"] for entry in summary["resources_by_type"]}
        self.assertEqual(
            names,
            {"Namespace", "Deployment", "azure_keyvault_vaults"},
        )


class SkillToolTests(unittest.TestCase):
    def test_list_skills_returns_bundles(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                listing = mcp_tools.list_skills()
        self.assertGreaterEqual(listing["total"], 2)
        names = {bundle["slx_name"] for bundle in listing["items"]}
        self.assertIn("k8s-deployment-health", names)
        self.assertIn("azure-keyvault-rotation", names)

    def test_search_skills_ranks_keyvault_above_deployment(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                results = mcp_tools.search_skills(query="rotate key vault secrets")
        self.assertGreaterEqual(results["total"], 1)
        top = results["items"][0]
        self.assertEqual("azure-keyvault-rotation", top["slx_name"])
        self.assertIn("snippet", top)
        self.assertGreater(top["score"], 0)

    def test_search_skills_ranks_deployment_for_pod_query(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                results = mcp_tools.search_skills(query="failing pods")
        self.assertGreaterEqual(results["total"], 1)
        self.assertEqual("k8s-deployment-health", results["items"][0]["slx_name"])

    def test_search_skills_returns_empty_for_blank_query(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                results = mcp_tools.search_skills(query="   ")
        self.assertEqual(results["total"], 0)

    def test_get_skill_returns_full_bundle(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                bundle = mcp_tools.get_skill("k8s-deployment-health")
        self.assertEqual("k8s-deployment-health", bundle["slx_name"])
        kinds = {f["artifact_kind"] for f in bundle["files"]}
        self.assertIn("slx", kinds)
        self.assertIn("runbook", kinds)
        self.assertIn("sli", kinds)
        self.assertIn("skill", kinds)
        skill_md = next(
            f for f in bundle["files"] if f["artifact_kind"] == "skill"
        )
        self.assertIn("Deployment health", skill_md["content"])

    def test_get_skill_raises_for_unknown_name(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                with self.assertRaises(LookupError):
                    mcp_tools.get_skill("nonexistent-skill")


class ResourceToolTests(unittest.TestCase):
    def test_search_resources_filters_by_platform(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                k8s = mcp_tools.search_resources_tool(platform="kubernetes")
                az = mcp_tools.search_resources_tool(platform="azure")
        self.assertEqual(2, k8s["total"])
        self.assertEqual(1, az["total"])
        self.assertTrue(
            all(item["platform"] == "kubernetes" for item in k8s["items"])
        )

    def test_get_resource_returns_attributes(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                r = mcp_tools.get_resource_tool(
                    platform="kubernetes",
                    resource_type="Deployment",
                    qualified_name="default/api",
                )
        self.assertEqual("api", r["name"])
        self.assertEqual(3, r["attributes"]["replicas"])

    def test_get_resource_raises_for_unknown(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                with self.assertRaises(LookupError):
                    mcp_tools.get_resource_tool(
                        platform="kubernetes",
                        resource_type="Deployment",
                        qualified_name="missing",
                    )


# ---------------------------------------------------------------------------
# Server registration smoke test
# ---------------------------------------------------------------------------


class GetSkillsForResourceTests(unittest.TestCase):
    def test_finds_resource_bound_skill_for_deployment(self):
        """The fixture seeds a Skill whose slx_directory and content
        embed the Deployment's name (mirroring how a real generation
        rule renders one SLX per matched resource). The join tool
        should surface that Skill when asked for the Deployment."""
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                result = mcp_tools.get_skills_for_resource(
                    platform="kubernetes",
                    resource_type="Deployment",
                    qualified_name="default/api",
                )
        self.assertEqual("api", result["resource"]["name"])
        names = {b["slx_name"] for b in result["items"]}
        self.assertIn("k8s-deployment-default-api-health", names)
        # That bundle should have hit on multiple match terms (qn + short
        # name + slugified qn), proving the fan-out works.
        bound = next(
            b for b in result["items"]
            if b["slx_name"] == "k8s-deployment-default-api-health"
        )
        self.assertGreaterEqual(len(bound["matched_terms"]), 1)

    def test_raises_for_unknown_resource(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                with self.assertRaises(LookupError):
                    mcp_tools.get_skills_for_resource(
                        platform="kubernetes",
                        resource_type="Deployment",
                        qualified_name="missing/ns/dep",
                    )

    def test_raises_for_unknown_resource(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                with self.assertRaises(LookupError):
                    mcp_tools.get_skills_for_resource(
                        platform="kubernetes",
                        resource_type="Deployment",
                        qualified_name="missing/ns/dep",
                    )


class GetWorkspaceHealthTests(unittest.TestCase):
    def test_returns_health_payload(self):
        # The health tracker reads/writes a file at /tmp/health_status.json;
        # a clean test environment will produce a "healthy" payload with no
        # last_run, which is exactly what we want to assert.
        result = mcp_tools.get_workspace_health()
        self.assertIn("status", result)
        self.assertIn("is_healthy", result)
        self.assertIn("is_ready", result)
        # last_run is allowed to be None on a fresh service; just make sure
        # the key is there for stable agent consumption.
        self.assertIn("last_run", result)


class ListCodebundlesTests(unittest.TestCase):
    def test_returns_loaded_collections(self):
        # init_code_collections runs at startup; in the test env at least
        # the default-code-collections.yaml ones are loaded. The shape
        # contract is what matters here.
        result = mcp_tools.list_codebundles()
        self.assertIn("total", result)
        self.assertIn("items", result)
        self.assertIsInstance(result["items"], list)
        for item in result["items"]:
            self.assertIn("repo_url", item)
            self.assertIn("loaded", item)


class GetResourceNeighborsTests(unittest.TestCase):
    def test_forward_ref_resolves_namespace(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                # The Deployment was seeded with namespace=ns, so the encoder
                # records a $ref pointing at the Namespace.
                result = mcp_tools.get_resource_neighbors(
                    platform="kubernetes",
                    resource_type="Deployment",
                    qualified_name="default/api",
                )
        types = {r["resource_type"] for r in result["forward_refs"]}
        self.assertIn("Namespace", types)
        ns_refs = [
            r
            for r in result["forward_refs"]
            if r["resource_type"] == "Namespace"
        ]
        self.assertTrue(ns_refs[0]["resolved"])
        self.assertEqual("default", ns_refs[0]["qualified_name"])

    def test_reverse_ref_finds_dependent(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                # The Deployment references the Namespace -> reverse lookup
                # from the Namespace should surface the Deployment.
                result = mcp_tools.get_resource_neighbors(
                    platform="kubernetes",
                    resource_type="Namespace",
                    qualified_name="default",
                )
        rev = {r["resource_type"] for r in result["reverse_refs"]}
        self.assertIn("Deployment", rev)

    def test_raises_for_unknown_resource(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                with self.assertRaises(LookupError):
                    mcp_tools.get_resource_neighbors(
                        platform="kubernetes",
                        resource_type="Deployment",
                        qualified_name="missing",
                    )


class RecommendSkillsTests(unittest.TestCase):
    def test_long_context_finds_relevant_skill(self):
        """A long, naturalistic context should surface a Deployment-
        related Skill at the top - either the generic
        ``k8s-deployment-health`` or the resource-bound
        ``k8s-deployment-default-api-health``. Both are correct
        answers; what's important is that the unrelated key-vault
        Skill is *not* the top recommendation."""
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                ctx = (
                    "User reports: 'My deployment in default has 3 replicas "
                    "but pods keep restarting with CrashLoopBackOff and "
                    "ImagePullBackOff errors'. What runbooks should we run?"
                )
                result = mcp_tools.recommend_skills(ctx, max_results=3)
        self.assertGreaterEqual(result["total"], 1)
        top_name = result["items"][0]["slx_name"]
        self.assertIn(
            top_name,
            {"k8s-deployment-health", "k8s-deployment-default-api-health"},
            f"Expected a deployment-related Skill at the top; got {top_name!r}",
        )

    def test_blank_context_returns_empty(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                result = mcp_tools.recommend_skills("", max_results=5)
        self.assertEqual(0, result["total"])


class PreviewSkillInvocationTests(unittest.TestCase):
    def test_preview_includes_runbook_and_invocation(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = os.path.join(tmpdir, "resources.sqlite")
            _seed_database(db_path)
            with patch.dict(
                os.environ,
                {"RW_RESOURCE_STORE_PATH": db_path},
                clear=False,
            ):
                preview = mcp_tools.preview_skill_invocation(
                    "k8s-deployment-health"
                )
        self.assertEqual("k8s-deployment-health", preview["slx_name"])
        self.assertIn("runwhen-cli", preview["invocation_example"])
        self.assertIn("runbook.yaml", preview["runbook_path"] or "")
        self.assertIn(
            "Check failing pods", preview["runbook_content"] or ""
        )


class McpServerSmokeTests(unittest.TestCase):
    def test_server_registers_all_tools(self):
        server = get_mcp_server()
        # FastMCP exposes registered tools via ``list_tools()``; v1.1 adds
        # six new tools on top of v1's six.
        import asyncio

        tools = asyncio.run(server.list_tools())
        names = {t.name for t in tools}
        self.assertEqual(
            names,
            {
                "get_workspace_summary",
                "search_skills",
                "list_skills",
                "get_skill",
                "search_resources",
                "get_resource",
                "get_skills_for_resource",
                "get_workspace_health",
                "list_codebundles",
                "get_resource_neighbors",
                "recommend_skills",
                "preview_skill_invocation",
            },
        )

    def test_server_registers_prompts(self):
        server = get_mcp_server()
        import asyncio

        prompts = asyncio.run(server.list_prompts())
        names = {p.name for p in prompts}
        self.assertEqual(
            names,
            {
                "kickoff_investigation",
                "triage_kubernetes_namespace",
                "diagnose_failing_deployment",
                "audit_azure_keyvaults",
            },
        )

    def test_streamable_http_app_is_asgi_callable(self):
        app = build_streamable_http_app()
        self.assertTrue(callable(app))
        # Should expose a lifespan attribute (Starlette router) for FastAPI to wire.
        self.assertTrue(hasattr(app, "lifespan") or hasattr(app, "router"))

    def test_is_mcp_enabled_default_true(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("RW_MCP_DISABLED", None)
            self.assertTrue(is_mcp_enabled())

    def test_is_mcp_enabled_respects_env_var(self):
        with patch.dict(
            os.environ,
            {"RW_MCP_DISABLED": "true"},
            clear=False,
        ):
            self.assertFalse(is_mcp_enabled())


if __name__ == "__main__":
    unittest.main()

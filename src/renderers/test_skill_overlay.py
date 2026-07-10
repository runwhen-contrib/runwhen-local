"""Tests for the Skill.md overlay end of the rendering pipeline."""

from __future__ import annotations

import os
import tempfile
import unittest

from component import Context
from outputter import FileSystemOutputter
from renderers.rendered_artifacts import (
    RENDERED_ARTIFACTS_PROPERTY,
    classify_workspace_artifact,
    init_rendered_artifacts,
    record_rendered_artifact,
    slx_directory_for_path,
)
from renderers.render_output_items import (
    OUTPUT_ITEMS_PROPERTY,
    OutputItem,
    render,
)


class ClassifyWorkspaceArtifactTests(unittest.TestCase):
    def test_skill_md_is_classified_as_skill_regardless_of_case(self):
        for variant in ("Skill.md", "SKILL.md", "skill.md", "sKiLL.Md"):
            with self.subTest(filename=variant):
                self.assertEqual(
                    "skill",
                    classify_workspace_artifact(f"workspaces/ws/slxs/foo/{variant}"),
                )

    def test_existing_kinds_still_classified(self):
        self.assertEqual("slx", classify_workspace_artifact("workspaces/ws/slxs/foo/slx.yaml"))
        self.assertEqual("sli", classify_workspace_artifact("workspaces/ws/slxs/foo/sli.yaml"))
        self.assertEqual("runbook", classify_workspace_artifact("workspaces/ws/slxs/foo/runbook.yaml"))
        self.assertEqual("workspace", classify_workspace_artifact("workspaces/ws/workspace.yaml"))

    def test_unrelated_md_files_under_slxs_are_slx_bundle(self):
        # README and other markdown files under an SLX directory should not
        # accidentally be classified as the canonical Skill overlay.
        self.assertEqual(
            "slx_bundle",
            classify_workspace_artifact("workspaces/ws/slxs/foo/README.md"),
        )

    def test_slx_directory_picks_up_skill_overlay_path(self):
        self.assertEqual(
            "workspaces/ws/slxs/foo",
            slx_directory_for_path("workspaces/ws/slxs/foo/SKILL.md"),
        )


class RawContentRenderingTests(unittest.TestCase):
    def _make_context(self, output_dir: str) -> Context:
        ctx = Context(
            setting_values={
                "WORKSPACE_NAME": "demo-ws",
                "LOCATION_ID": "location-01",
                "WORKSPACE_OUTPUT_PATH": "workspaces",
                # Disk writes are opt-out by default now; this test asserts the
                # on-disk verbatim write path, so opt back in explicitly.
                "WRITE_WORKSPACE_FILES_TO_DISK": True,
            },
            outputter=FileSystemOutputter(output_dir),
        )
        ctx.set_property(OUTPUT_ITEMS_PROPERTY, {})
        init_rendered_artifacts(ctx)
        return ctx

    def test_raw_content_is_written_verbatim_and_recorded(self):
        with tempfile.TemporaryDirectory() as out_dir:
            ctx = self._make_context(out_dir)
            skill_text = "# Skill: namespace healthcheck\n\nDoes a thing.\n"
            overlay_path = "workspaces/demo-ws/slxs/k8s-namespace/Skill.md"

            ctx.get_property(OUTPUT_ITEMS_PROPERTY)[overlay_path] = OutputItem(
                path=overlay_path,
                template_name="Skill.md",
                template_variables={},
                template_loader_func=None,
                raw_content=skill_text,
            )
            render(ctx)

            disk_path = os.path.join(out_dir, overlay_path)
            self.assertTrue(os.path.isfile(disk_path), f"expected overlay file at {disk_path}")
            with open(disk_path, encoding="utf-8") as fh:
                self.assertEqual(skill_text, fh.read())

            artifacts = ctx.get_property(RENDERED_ARTIFACTS_PROPERTY, [])
            self.assertEqual(1, len(artifacts))
            self.assertEqual("skill", artifacts[0]["artifact_kind"])
            self.assertEqual("markdown", artifacts[0]["media_type"])
            self.assertEqual("workspaces/demo-ws/slxs/k8s-namespace", artifacts[0]["slx_directory"])
            self.assertEqual(skill_text, artifacts[0]["content"])

    def test_record_rendered_artifact_with_skill_md(self):
        with tempfile.TemporaryDirectory() as out_dir:
            ctx = self._make_context(out_dir)
            record_rendered_artifact(
                ctx,
                "workspaces/demo-ws/slxs/foo/Skill.md",
                "# Hello\n",
            )
            artifacts = ctx.get_property(RENDERED_ARTIFACTS_PROPERTY)
            self.assertEqual(1, len(artifacts))
            self.assertEqual("skill", artifacts[0]["artifact_kind"])
            self.assertEqual("markdown", artifacts[0]["media_type"])


class _StubCodeCollection:
    """Minimal CodeCollection stand-in for `_emit_skill_overlay` tests.

    The overlay only touches ``repo_url`` (for cache keying) and
    ``find_code_bundle_file``, so we don't need GitPython here. ``file_lookup``
    is keyed by ``(ref_name, code_bundle_name)`` and maps to a dict of
    ``{filename_as_published: content}`` so each bundle can publish the Skill
    overlay under any casing variant (``SKILL.md``, ``Skill.md``, etc.).
    """

    def __init__(self, repo_url: str, file_lookup: dict):
        self.repo_url = repo_url
        # Normalize legacy {(ref, bundle, name): text} shape for backwards compat.
        normalized: dict[tuple, dict[str, str]] = {}
        for key, value in file_lookup.items():
            if isinstance(key, tuple) and len(key) == 3 and isinstance(value, str):
                ref, bundle, name = key
                normalized.setdefault((ref, bundle), {})[name] = value
            elif isinstance(key, tuple) and len(key) == 2 and isinstance(value, dict):
                normalized[key] = dict(value)
            else:
                raise TypeError(f"Unexpected file_lookup entry: {key!r} -> {value!r}")
        self._lookup = normalized
        self.calls: list[tuple] = []

    def find_code_bundle_file(self, ref_name, code_bundle_name, relative_path, case_insensitive=False):
        self.calls.append((ref_name, code_bundle_name, relative_path, case_insensitive))
        bundle_files = self._lookup.get((ref_name, code_bundle_name))
        if not bundle_files:
            return None
        if case_insensitive and "/" not in relative_path and "\\" not in relative_path:
            target = relative_path.lower()
            for actual_name, text in bundle_files.items():
                if actual_name.lower() == target:
                    return actual_name, text
            return None
        text = bundle_files.get(relative_path)
        return (relative_path, text) if text is not None else None

    def get_code_bundle_file_text(self, ref_name, code_bundle_name, relative_path, case_insensitive=False):
        resolved = self.find_code_bundle_file(
            ref_name, code_bundle_name, relative_path, case_insensitive=case_insensitive
        )
        return None if resolved is None else resolved[1]


class _StubFileSpec:
    def __init__(self, ref_name: str, code_bundle_name: str):
        self.ref_name = ref_name
        self.code_bundle_name = code_bundle_name


class _StubGenerationRuleInfo:
    def __init__(self, code_collection, ref_name: str, code_bundle_name: str):
        self.code_collection = code_collection
        self.generation_rule_file_spec = _StubFileSpec(ref_name, code_bundle_name)


class EmitSkillOverlayTests(unittest.TestCase):
    """Exercise the overlay wiring in generation_rules without GitPython."""

    def _make_context(self) -> Context:
        ctx = Context(
            setting_values={"WORKSPACE_NAME": "demo-ws"},
            outputter=FileSystemOutputter("."),
        )
        return ctx

    def test_overlay_emits_raw_content_renderer_item(self):
        from enrichers.generation_rules import _emit_skill_overlay

        repo_url = "https://example.com/foo.git"
        ref = "feat/skill-overlay"
        bundle = "k8s-namespace-healthcheck"
        skill_text = "# Skill: namespace healthcheck\n\nDoes a thing.\n"
        cc = _StubCodeCollection(repo_url, {(ref, bundle, "Skill.md"): skill_text})
        gr_info = _StubGenerationRuleInfo(cc, ref, bundle)

        renderer_output_items: dict = {}
        ctx = self._make_context()

        _emit_skill_overlay(
            generation_rule_info=gr_info,
            slx_directory_path="workspaces/demo-ws/slxs/cvb-ns-health",
            slx_base_template_variables={"slx_name": "cvb-ns-health"},
            renderer_output_items=renderer_output_items,
            context=ctx,
        )

        overlay_path = "workspaces/demo-ws/slxs/cvb-ns-health/Skill.md"
        self.assertIn(overlay_path, renderer_output_items)
        item = renderer_output_items[overlay_path]
        self.assertEqual(skill_text, item.raw_content)
        self.assertEqual("Skill.md", item.template_name)
        self.assertIsNone(item.template_loader_func)

    def test_overlay_preserves_upstream_filename_casing(self):
        from enrichers.generation_rules import _emit_skill_overlay

        # Upstream codebundle publishes the overlay as SKILL.md (uppercase).
        # The overlay should write SKILL.md into the SLX directory verbatim,
        # not normalize it to Skill.md.
        repo_url = "https://example.com/foo.git"
        ref = "feat/skill-overlay"
        bundle = "k8s-namespace-healthcheck"
        skill_text = "# SKILL: namespace healthcheck\n"
        cc = _StubCodeCollection(repo_url, {(ref, bundle, "SKILL.md"): skill_text})
        gr_info = _StubGenerationRuleInfo(cc, ref, bundle)

        renderer_output_items: dict = {}
        ctx = self._make_context()

        _emit_skill_overlay(
            generation_rule_info=gr_info,
            slx_directory_path="workspaces/demo-ws/slxs/foo",
            slx_base_template_variables={},
            renderer_output_items=renderer_output_items,
            context=ctx,
        )

        overlay_path = "workspaces/demo-ws/slxs/foo/SKILL.md"
        self.assertIn(overlay_path, renderer_output_items)
        # Lookup must have asked case-insensitively at least once.
        self.assertTrue(any(call[3] is True for call in cc.calls))

    def test_overlay_skipped_when_codebundle_has_no_skill_md(self):
        from enrichers.generation_rules import _emit_skill_overlay

        cc = _StubCodeCollection("https://example.com/foo.git", file_lookup={})
        gr_info = _StubGenerationRuleInfo(cc, "main", "k8s-namespace-healthcheck")

        renderer_output_items: dict = {}
        ctx = self._make_context()

        _emit_skill_overlay(
            generation_rule_info=gr_info,
            slx_directory_path="workspaces/demo-ws/slxs/foo",
            slx_base_template_variables={},
            renderer_output_items=renderer_output_items,
            context=ctx,
        )
        self.assertEqual({}, renderer_output_items)

    def test_overlay_lookup_is_cached_across_slxs_for_same_bundle(self):
        from enrichers.generation_rules import _emit_skill_overlay

        repo_url = "https://example.com/foo.git"
        ref = "feat/skill-overlay"
        bundle = "k8s-namespace-healthcheck"
        skill_text = "# Skill\n"
        cc = _StubCodeCollection(repo_url, {(ref, bundle, "Skill.md"): skill_text})
        gr_info = _StubGenerationRuleInfo(cc, ref, bundle)

        renderer_output_items: dict = {}
        ctx = self._make_context()

        for slx_dir in (
            "workspaces/demo-ws/slxs/foo",
            "workspaces/demo-ws/slxs/bar",
            "workspaces/demo-ws/slxs/baz",
        ):
            _emit_skill_overlay(
                generation_rule_info=gr_info,
                slx_directory_path=slx_dir,
                slx_base_template_variables={},
                renderer_output_items=renderer_output_items,
                context=ctx,
            )

        self.assertEqual(3, len(renderer_output_items))
        # Cache hit means we hit the git tree exactly once per bundle/ref.
        self.assertEqual(1, len(cc.calls))


if __name__ == "__main__":
    unittest.main()

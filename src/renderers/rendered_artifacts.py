"""Capture rendered workspace files for SQLite persistence."""

from __future__ import annotations

import os
from typing import Any

from component import Context

RENDERED_ARTIFACTS_PROPERTY = "rendered_artifacts"


def init_rendered_artifacts(context: Context) -> None:
    context.set_property(RENDERED_ARTIFACTS_PROPERTY, [])


def classify_workspace_artifact(relative_path: str) -> str:
    base = os.path.basename(relative_path).lower()
    if base == "slx.yaml":
        return "slx"
    if base == "sli.yaml" or base.endswith("-sli.yaml"):
        return "sli"
    if base == "runbook.yaml" or "runbook" in base:
        return "runbook"
    if base == "workspace.yaml":
        return "workspace"
    # Codebundle Skill overlay copied alongside each rendered SLX. The filename
    # is matched case-insensitively because upstream codebundles publish it as
    # ``SKILL.md`` or ``Skill.md`` (or, less commonly, ``skill.md``).
    if base == "skill.md":
        return "skill"
    normalized = relative_path.replace("\\", "/")
    if "/slxs/" in normalized:
        return "slx_bundle"
    return "other"


def classify_media_type(relative_path: str) -> str:
    _, ext = os.path.splitext(relative_path.lower())
    if ext in (".yaml", ".yml"):
        return "yaml"
    if ext == ".md":
        return "markdown"
    if ext == ".json":
        return "json"
    return "text"


def slx_directory_for_path(relative_path: str) -> str | None:
    normalized = relative_path.replace("\\", "/")
    if "/slxs/" not in normalized:
        return None
    directory = os.path.dirname(normalized)
    if os.path.basename(directory) and os.path.basename(directory) != "slxs":
        return directory
    return None


def record_rendered_artifact(context: Context, relative_path: str, content: str) -> None:
    artifacts: list[dict[str, Any]] = context.get_property(RENDERED_ARTIFACTS_PROPERTY, [])
    artifacts.append(
        {
            "relative_path": relative_path,
            "artifact_kind": classify_workspace_artifact(relative_path),
            "media_type": classify_media_type(relative_path),
            "slx_directory": slx_directory_for_path(relative_path),
            "content": content if isinstance(content, str) else content.decode("utf-8"),
        }
    )
    context.set_property(RENDERED_ARTIFACTS_PROPERTY, artifacts)

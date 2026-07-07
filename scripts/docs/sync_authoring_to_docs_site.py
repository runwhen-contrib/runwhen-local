#!/usr/bin/env python3
"""Sync ``docs/authoring/`` markdown into the RunWhen docs site (Starlight).

**Optional publish step only.** Canonical authoring reference stays in this repo
(``docs/authoring/`` + generated catalogs). MCP agents use the
``author-generation-rules`` skill, which points here — not docs.runwhen.com
legacy author pages.

Use when the docs team is ready to replace stale ``/authors/generation-rules/``
content on docs.runwhen.com with refreshed Starlight pages derived from this tree.

Transforms for Starlight:
  - Prepends YAML frontmatter (title, description, sidebar order/label)
  - Strips the first ``# heading`` (title comes from frontmatter)
  - Converts GitHub ``[!NOTE]`` alerts to Starlight ``:::note`` admonitions
  - Rewrites internal links to docs-site paths

Usage::

    python scripts/docs/sync_authoring_to_docs_site.py
    python scripts/docs/sync_authoring_to_docs_site.py --check   # exit 1 if drift
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_DOCS_REPO = _REPO_ROOT.parent.parent / "runwhen" / "docs"
_AUTHORS_ROOT = "src/content/docs/authors"


@dataclass(frozen=True)
class PageSpec:
    source: Path
    dest_rel: str
    title: str
    description: str
    sidebar_order: int
    sidebar_label: str | None = None
    sidebar_hidden: bool = False


_RWL_ARCH = "https://github.com/runwhen-contrib/runwhen-local/blob/main/docs/architecture"
_RWL_DOCS = "https://github.com/runwhen-contrib/runwhen-local/blob/main/docs"


def _pages() -> list[PageSpec]:
    authoring = _REPO_ROOT / "docs" / "authoring"
    return [
        PageSpec(
            authoring / "concepts.md",
            "concepts.md",
            "Authoring Concepts",
            "CodeBundle, Skill, SLX, and Runbook terminology for RunWhen Local authors.",
            1,
            "Concepts",
        ),
        PageSpec(
            authoring / "indexed-resources/README.md",
            "indexed-resources/index.md",
            "Indexed Resources",
            "Overview of platform indexers and resource type catalogs for generation rules.",
            0,
            "Overview",
        ),
        PageSpec(
            authoring / "indexed-resources/azure.md",
            "indexed-resources/azure.md",
            "Azure Indexed Resources",
            "What the azureapi indexer discovers and how generation rules match Azure resources.",
            1,
            "Azure",
        ),
        PageSpec(
            authoring / "indexed-resources/aws.md",
            "indexed-resources/aws.md",
            "AWS Indexed Resources",
            "What the awsapi indexer discovers and how generation rules match AWS resources.",
            2,
            "AWS",
        ),
        PageSpec(
            authoring / "indexed-resources/gcp.md",
            "indexed-resources/gcp.md",
            "GCP Indexed Resources",
            "What the gcpapi indexer discovers and how generation rules match GCP resources.",
            3,
            "GCP",
        ),
        PageSpec(
            authoring / "indexed-resources/kubernetes.md",
            "indexed-resources/kubernetes.md",
            "Kubernetes Indexed Resources",
            "Built-in and CRD resource types the kubeapi indexer discovers.",
            4,
            "Kubernetes",
        ),
        PageSpec(
            authoring / "indexed-resources/runwhen-platform.md",
            "indexed-resources/runwhen-platform.md",
            "RunWhen Platform Resources",
            "Workspace-scoped resources indexed under platform runwhen (MCP tool-builder output).",
            5,
            "RunWhen Platform",
        ),
        PageSpec(
            authoring / "indexed-resources/azure-resource-catalog.md",
            "indexed-resources/azure-resource-catalog.md",
            "Azure Resource Catalog",
            "Sortable table of every Azure resource type the azureapi indexer knows.",
            10,
            "Azure Catalog",
        ),
        PageSpec(
            authoring / "indexed-resources/aws-resource-catalog.md",
            "indexed-resources/aws-resource-catalog.md",
            "AWS Resource Catalog",
            "Sortable table of every AWS resource type the awsapi indexer knows.",
            11,
            "AWS Catalog",
        ),
        PageSpec(
            authoring / "indexed-resources/gcp-resource-catalog.md",
            "indexed-resources/gcp-resource-catalog.md",
            "GCP Resource Catalog",
            "Sortable table of every GCP resource type the gcpapi indexer knows.",
            12,
            "GCP Catalog",
        ),
        PageSpec(
            authoring / "indexed-resources/kubernetes-resource-catalog.md",
            "indexed-resources/kubernetes-resource-catalog.md",
            "Kubernetes Resource Catalog",
            "Built-in Kubernetes kinds available to generation rules.",
            13,
            "Kubernetes Catalog",
        ),
        PageSpec(
            authoring / "indexed-resources/runwhen-platform-resource-catalog.md",
            "indexed-resources/runwhen-platform-resource-catalog.md",
            "RunWhen Platform Resource Catalog",
            "Resource types under platform runwhen.",
            14,
            "RunWhen Catalog",
        ),
        PageSpec(
            authoring / "generation-rules/README.md",
            "generation-rules/schema.md",
            "Generation Rules Schema",
            "Schema reference for .runwhen/generation-rules YAML files.",
            1,
            "Schema Reference",
        ),
        PageSpec(
            _REPO_ROOT / "generation-rules-guide.md",
            "generation-rules/syntax-reference.md",
            "Generation Rules Syntax Reference",
            "Complete matchRules, slxs, outputItems, and platform-specific syntax.",
            2,
            "Syntax Reference",
        ),
        PageSpec(
            authoring / "generation-rules/tag-hierarchy-contract.md",
            "generation-rules/tag-hierarchy.md",
            "Tag and Hierarchy Contract",
            "Conventions for platform tag and hierarchy templates.",
            3,
            "Tag Hierarchy",
        ),
        PageSpec(
            authoring / "generation-rules/examples/README.md",
            "generation-rules/examples/index.md",
            "Generation Rule Examples",
            "End-to-end generation rule examples by platform and pattern.",
            10,
            "Examples Overview",
        ),
        PageSpec(
            authoring / "generation-rules/examples/azure-keyvault-slx.md",
            "generation-rules/examples/azure-keyvault-slx.md",
            "Example: Azure Key Vault SLX",
            "Generation rule for private Key Vaults with SKILL.md overlay.",
            11,
            "Azure Key Vault",
        ),
        PageSpec(
            authoring / "generation-rules/examples/azure-vm-disk-runbook.md",
            "generation-rules/examples/azure-vm-disk-runbook.md",
            "Example: Azure VM Disk Runbook",
            "Match production VMs and expose OS disk IDs to templates.",
            12,
            "Azure VM Disk",
        ),
        PageSpec(
            authoring / "generation-rules/examples/kubernetes-deployment-slx.md",
            "generation-rules/examples/kubernetes-deployment-slx.md",
            "Example: Kubernetes Deployment SLX",
            "Multi-replica Deployment rollout health check.",
            13,
            "K8s Deployment",
        ),
        PageSpec(
            authoring / "generation-rules/examples/multi-resource-runbook.md",
            "generation-rules/examples/multi-resource-runbook.md",
            "Example: Azure Web App Context",
            "Pass related ARM IDs from a single matched resource into templates.",
            14,
            "Web App Context",
        ),
    ]


_LINK_REWRITES: list[tuple[str, str]] = [
    (r"\(\./azure-resource-catalog\.md\)", "(/authors/indexed-resources/azure-resource-catalog/)"),
    (r"\(\./aws-resource-catalog\.md\)", "(/authors/indexed-resources/aws-resource-catalog/)"),
    (r"\(\./gcp-resource-catalog\.md\)", "(/authors/indexed-resources/gcp-resource-catalog/)"),
    (r"\(\./kubernetes-resource-catalog\.md\)", "(/authors/indexed-resources/kubernetes-resource-catalog/)"),
    (r"\(\./runwhen-platform-resource-catalog\.md\)", "(/authors/indexed-resources/runwhen-platform-resource-catalog/)"),
    (r"\(\./README\.md\)", "(/authors/indexed-resources/)"),
    (r"\(\./azure\.md\)", "(/authors/indexed-resources/azure/)"),
    (r"\(\./aws\.md\)", "(/authors/indexed-resources/aws/)"),
    (r"\(\./gcp\.md\)", "(/authors/indexed-resources/gcp/)"),
    (r"\(\./kubernetes\.md\)", "(/authors/indexed-resources/kubernetes/)"),
    (r"\(\./runwhen-platform\.md\)", "(/authors/indexed-resources/runwhen-platform/)"),
    (r"\(\.\./indexed-resources/README\.md\)", "(/authors/indexed-resources/)"),
    (r"\(\.\./indexed-resources/([^)]+)\)", r"(/authors/indexed-resources/\1/)"),
    (r"\(\.\./README\.md\)", "(/authors/generation-rules/schema/)"),
    (r"\(\.\./\.\./\.\./generation-rules-guide\.md\)", "(/authors/generation-rules/syntax-reference/)"),
    (r"\(\./tag-hierarchy-contract\.md\)", "(/authors/generation-rules/tag-hierarchy/)"),
    (r"\(\./examples/([^)]+)\)", r"(/authors/generation-rules/examples/\1/)"),
    (r"\(\.\./examples/([^)]+)\)", r"(/authors/generation-rules/examples/\1/)"),
    (r"\(\.\./\.\./architecture/([^)#]+)(#[^)]+)?\)", rf"({_RWL_ARCH}/\1\2)"),
    (r"\(\.\./\.\./user-guide/([^)]+)\)", rf"({_RWL_DOCS}/user-guide/\1)"),
    (r"\[([^\]]+)\]\(\.\./\.\./architecture/[^)]+\)", r"\1 (see runwhen-local architecture docs)"),
    (r"\[([^\]]+)\]\(\.\./\.\./user-guide/[^)]+\)", r"\1"),
]


def _strip_leading_h1(text: str) -> str:
    lines = text.splitlines()
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
        while lines and not lines[0].strip():
            lines = lines[1:]
    return "\n".join(lines)


def _convert_admonitions(text: str) -> str:
    out: list[str] = []
    i = 0
    lines = text.splitlines()
    while i < len(lines):
        line = lines[i]
        note_match = re.match(r"^>\s*\[!NOTE\]\s*$", line)
        if note_match:
            out.append(":::note")
            i += 1
            while i < len(lines) and lines[i].startswith(">"):
                out.append(lines[i][1:].lstrip() if lines[i].startswith("> ") else lines[i][1:])
                i += 1
            out.append(":::")
            continue
        out.append(line)
        i += 1
    return "\n".join(out)


def _rewrite_links(text: str) -> str:
    for pattern, replacement in _LINK_REWRITES:
        text = re.sub(pattern, replacement, text)
    return text


def _render_page(spec: PageSpec) -> str:
    raw = spec.source.read_text(encoding="utf-8")
    body = _strip_leading_h1(raw)
    body = _convert_admonitions(body)
    body = _rewrite_links(body)
    label_line = ""
    if spec.sidebar_label:
        label_line = f'  label: "{spec.sidebar_label}"\n'
    hidden_line = ""
    if spec.sidebar_hidden:
        hidden_line = "  hidden: true\n"
    frontmatter = (
        "---\n"
        f'title: "{spec.title}"\n'
        f'description: "{spec.description}"\n'
        "sidebar:\n"
        f"  order: {spec.sidebar_order}\n"
        f"{label_line}"
        f"{hidden_line}"
        "---\n\n"
    )
    if body and not body.startswith("##"):
        body = f"## Overview\n\n{body}"
    return frontmatter + body + ("\n" if body else "")


def sync(docs_repo: Path, check: bool = False) -> int:
    authors_dir = docs_repo / _AUTHORS_ROOT
    if not authors_dir.is_dir():
        print(f"ERROR: docs authors dir not found: {authors_dir}", file=sys.stderr)
        return 1

    drift = 0
    for spec in _pages():
        if not spec.source.is_file():
            print(f"ERROR: missing source {spec.source}", file=sys.stderr)
            return 1
        rendered = _render_page(spec)
        dest = authors_dir / spec.dest_rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.read_text(encoding="utf-8") == rendered:
            print(f"OK   {spec.dest_rel}")
            continue
        if check:
            print(f"DRIFT {spec.dest_rel}")
            drift += 1
            continue
        dest.write_text(rendered, encoding="utf-8")
        print(f"WROTE {spec.dest_rel}")

    return 1 if drift else 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--docs-repo",
        type=Path,
        default=_DEFAULT_DOCS_REPO,
        help=f"Path to runwhen/docs checkout (default: {_DEFAULT_DOCS_REPO})",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit 1 if destination files differ from rendered output",
    )
    args = parser.parse_args()
    raise SystemExit(sync(args.docs_repo, check=args.check))


if __name__ == "__main__":
    main()

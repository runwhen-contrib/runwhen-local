---
name: author-generation-rules
description: "Write generation rules using bundled references in this repo (airgap). Full skill body lives in runwhen-platform-mcp."
---

# Author Generation Rules (runwhen-local)

Canonical sources: `docs/authoring/` and generated catalogs in this repo.

For **airgap MCP**, use the bundled copy in `runwhen-platform-mcp`:

`skills/author-generation-rules/references/`

Regenerate MCP bundle (maintainers):

```bash
cd runwhen-platform-mcp
python scripts/sync_bundled_authoring.py --runwhen-local /path/to/runwhen-local
```

Regenerate catalogs here first:

```bash
python scripts/*/dump_*_resource_catalog.py
```

See `runwhen-platform-mcp/skills/author-generation-rules/SKILL.md` for the full workflow.

#!/usr/bin/env python3
"""DB-driven helpers for RunWhen Local test taskfiles.

Since ``writeWorkspaceFilesToDisk`` now defaults to ``False`` (with the sqlite
resource store, which is the default backend), a ``run`` no longer leaves a
rendered ``output/workspaces/<ws>/`` file tree on disk. The canonical source for
rendered SLX / SLI / runbook / workspace content is the ``workspace_artifacts``
table inside ``output/resources.sqlite``.

This script gives the test taskfiles a small, dependency-free (stdlib only)
way to do what they previously did by walking that on-disk tree:

  count                  -> COUNT(*) of artifact_kind='slx'  (replaces the
                            ``find .../slxs -type d | wc -l`` SLX count)
  slx-names              -> basename of each SLX directory     (replaces
                            iterating ``BASE_DIR/*`` for the upload/delete loop)
  location KIND          -> spec.location of the first artifact of KIND
                            (sli|runbook|slx) (replaces ``yq .spec.location``
                            on a file found via ``find``)
  content REL_PATH       -> full rendered content of one artifact (replaces
                            ``cat output/workspaces/.../<file>``)
  upload                 -> rebuild the per-SLX {slx,runbook,sli}.yaml payload
                            from the DB and POST it to the platform, byte-for-byte
                            equivalent to the old ``cat $dir/$file`` + curl loop.

All subcommands accept ``--db`` (default ``output/resources.sqlite``) and
``--workspace`` (optional filter; when omitted, every workspace in the DB is
considered).
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
import urllib.error
import urllib.request

DEFAULT_DB = os.environ.get("RW_RESOURCE_STORE_PATH", "output/resources.sqlite")
# File basenames the platform upload payload carries, in the original order used
# by the file-based ``for file in slx.yaml runbook.yaml sli.yaml`` loop.
UPLOAD_FILE_ORDER = ("slx.yaml", "runbook.yaml", "sli.yaml")
UPLOAD_KINDS = ("slx", "sli", "runbook")


def _connect(db_path: str) -> sqlite3.Connection:
    if not os.path.exists(db_path):
        sys.stderr.write(
            f"ERROR: resource store DB not found at {db_path!r}. "
            "Did discovery run with the sqlite backend (the default)?\n"
        )
        sys.exit(2)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def _ws_clause(workspace, params):
    if workspace:
        params.append(workspace)
        return " AND workspace_name = ?"
    return ""


def cmd_count(args) -> int:
    conn = _connect(args.db)
    try:
        params: list = []
        sql = "SELECT COUNT(*) AS n FROM workspace_artifacts WHERE artifact_kind = 'slx'"
        sql += _ws_clause(args.workspace, params)
        row = conn.execute(sql, params).fetchone()
        print(int(row["n"]) if row else 0)
    finally:
        conn.close()
    return 0


def cmd_slx_names(args) -> int:
    conn = _connect(args.db)
    try:
        params: list = []
        sql = (
            "SELECT slx_directory FROM workspace_artifacts "
            "WHERE artifact_kind = 'slx' AND slx_directory IS NOT NULL"
        )
        sql += _ws_clause(args.workspace, params)
        sql += " ORDER BY slx_directory"
        for row in conn.execute(sql, params):
            print(os.path.basename(row["slx_directory"]))
    finally:
        conn.close()
    return 0


def _spec_location(content: str):
    try:
        import yaml  # noqa: WPS433 - optional, falls back to a line scan

        data = yaml.safe_load(content)
        if isinstance(data, dict):
            spec = data.get("spec")
            if isinstance(spec, dict) and "location" in spec:
                return str(spec["location"])
    except Exception:
        pass
    # Fallback: shallow scan for a top-level "location:" under "spec:".
    in_spec = False
    for line in content.splitlines():
        if line.strip() == "spec:" or line.startswith("spec:"):
            in_spec = True
            continue
        if in_spec:
            if line and not line[0].isspace():
                in_spec = False
                continue
            stripped = line.strip()
            if stripped.startswith("location:"):
                return stripped.split(":", 1)[1].strip().strip('"').strip("'")
    return None


def cmd_location(args) -> int:
    conn = _connect(args.db)
    try:
        params: list = [args.kind]
        sql = (
            "SELECT content FROM workspace_artifacts "
            "WHERE artifact_kind = ?"
        )
        sql += _ws_clause(args.workspace, params)
        sql += " ORDER BY relative_path LIMIT 1"
        row = conn.execute(sql, params).fetchone()
        if not row:
            sys.stderr.write(f"ERROR: no '{args.kind}' artifact found in {args.db}\n")
            return 1
        loc = _spec_location(row["content"])
        if loc is None:
            sys.stderr.write("ERROR: spec.location not found in artifact\n")
            return 1
        print(loc)
    finally:
        conn.close()
    return 0


def cmd_content(args) -> int:
    conn = _connect(args.db)
    try:
        params: list = [args.relative_path]
        sql = "SELECT content FROM workspace_artifacts WHERE relative_path = ?"
        sql += _ws_clause(args.workspace, params)
        sql += " LIMIT 1"
        row = conn.execute(sql, params).fetchone()
        if not row:
            sys.stderr.write(f"ERROR: artifact {args.relative_path!r} not found\n")
            return 1
        sys.stdout.write(row["content"])
    finally:
        conn.close()
    return 0


def _iter_slx_bundles(conn, workspace):
    """Yield ``(slx_name, {basename: content})`` for each SLX directory."""
    params: list = []
    sql = (
        "SELECT slx_directory, relative_path, content, artifact_kind "
        "FROM workspace_artifacts "
        "WHERE artifact_kind IN ('slx', 'sli', 'runbook') "
        "AND slx_directory IS NOT NULL"
    )
    sql += _ws_clause(workspace, params)
    sql += " ORDER BY slx_directory, relative_path"
    bundles: dict[str, dict[str, str]] = {}
    order: list[str] = []
    for row in conn.execute(sql, params):
        slx_dir = row["slx_directory"]
        if slx_dir not in bundles:
            bundles[slx_dir] = {}
            order.append(slx_dir)
        bundles[slx_dir][os.path.basename(row["relative_path"])] = row["content"]
    for slx_dir in order:
        yield os.path.basename(slx_dir), bundles[slx_dir]


def cmd_upload(args) -> int:
    conn = _connect(args.db)
    try:
        bundles = list(_iter_slx_bundles(conn, args.workspace))
    finally:
        conn.close()

    if not bundles:
        sys.stderr.write("ERROR: no SLX bundles found in the resource store DB\n")
        return 1

    failures = 0
    for slx_name, files in bundles:
        payload = {"commitMsg": f"Creating new SLX {slx_name}", "files": {}}
        # Preserve the original payload file ordering (slx, runbook, sli) and
        # only include files that exist for this SLX, exactly like the old
        # ``for file in slx.yaml runbook.yaml sli.yaml; do [ -f ... ]`` loop.
        for fname in UPLOAD_FILE_ORDER:
            if fname in files:
                payload["files"][fname] = files[fname]
        # Include any other slx/sli/runbook-classified files not covered by the
        # canonical names so nothing is silently dropped.
        for fname, content in files.items():
            if fname not in payload["files"]:
                payload["files"][fname] = content

        url = (
            f"https://{args.api}/api/v3/workspaces/{args.workspace}"
            f"/branches/{args.branch}/slxs/{slx_name}"
        )
        if args.dry_run:
            print(f"[dry-run] POST {url} files={sorted(payload['files'])}")
            continue

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, method="POST")
        req.add_header("Authorization", f"Bearer {args.pat}")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req) as resp:
                code = resp.getcode()
            if code in (200, 201):
                print(f"Successfully uploaded SLX: {slx_name} to {url}")
            else:
                print(f"Failed to upload SLX: {slx_name} to {url}. Response code: {code}")
                failures += 1
        except urllib.error.HTTPError as exc:
            print(f"Failed to upload SLX: {slx_name} to {url}. HTTP {exc.code}: {exc.reason}")
            failures += 1
        except urllib.error.URLError as exc:
            print(f"Failed to upload SLX: {slx_name} to {url}. {exc}")
            failures += 1

    return 1 if failures else 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", default=DEFAULT_DB, help=f"sqlite resource store (default: {DEFAULT_DB})")
    parser.add_argument("--workspace", default=os.environ.get("RW_WORKSPACE"), help="workspace name filter")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("count", help="print SLX count from the DB")
    sub.add_parser("slx-names", help="print each SLX directory basename")

    p_loc = sub.add_parser("location", help="print spec.location of first artifact of KIND")
    p_loc.add_argument("kind", choices=["slx", "sli", "runbook", "workspace"])

    p_content = sub.add_parser("content", help="print full content of one artifact")
    p_content.add_argument("relative_path")

    p_up = sub.add_parser("upload", help="POST each SLX bundle to the platform from the DB")
    p_up.add_argument("--api", required=True, help="PAPI host (no scheme), e.g. papi.example.com")
    p_up.add_argument("--pat", default=os.environ.get("RW_PAT"), help="platform PAT (default: $RW_PAT)")
    p_up.add_argument("--branch", default="main")
    p_up.add_argument("--dry-run", action="store_true", help="print intended POSTs without sending")

    args = parser.parse_args(argv)

    if args.command == "upload" and not args.workspace:
        parser.error("--workspace (or $RW_WORKSPACE) is required for upload")

    dispatch = {
        "count": cmd_count,
        "slx-names": cmd_slx_names,
        "location": cmd_location,
        "content": cmd_content,
        "upload": cmd_upload,
    }
    return dispatch[args.command](args)


if __name__ == "__main__":
    raise SystemExit(main())

"""
Builds the `workspaceScope` upload payload: a summary of the Kubernetes
clusters and namespaces a run covered, and the kubeconfig credential each
cluster's tasks use, sent to the Platform alongside the upload so it can
configure resource discovery automatically.

Pure and side-effect free: given what ``indexers.kubeapi.index()`` captured
about each cluster during the current run (see
``indexers.kubeapi.ClusterScanResult`` / ``get_last_cluster_scan_results``)
plus the cluster ``Resource`` objects the registry already holds, this
renders the exact ``credentialRef`` string a rendered SLX's
``secretsProvided`` carries for ``kubeconfig`` -- reusing the builder's own
auth-template logic (``templates/kubernetes-auth.yaml``) rather than
re-deriving it, so the two can't drift.

No I/O, no secret material: only cluster/namespace names and credential refs
ever leave this module -- see the no-secrets guard in test_workspace_scope.py.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Iterable, Optional

import yaml

from indexers.kubeapi import ClusterScanResult
from indexers.kubetypes import KUBERNETES_PLATFORM, KubernetesResourceType
from resources import Registry
from template import render_template_file

logger = logging.getLogger(__name__)

VERSION = 1

# Namespace lists are bounded; longer lists are truncated with
# "namespacesTruncated": true rather than sent in full.
MAX_NAMESPACES = 2000

# Same template the rendered SLX secretsProvided.kubeconfig entry comes from
# (see src/test_gke_auth_templates.py).
AUTH_TEMPLATE_NAME = "kubernetes-auth.yaml"
AUTH_DETAILS_NOT_FOUND = "AUTH DETAILS NOT FOUND"


def _bounded_sorted(names: Iterable[str]) -> tuple[list[str], bool]:
    sorted_names = sorted(names)
    if len(sorted_names) > MAX_NAMESPACES:
        return sorted_names[:MAX_NAMESPACES], True
    return sorted_names, False


def _resolve_credential_ref(cluster_resource: Any, custom: dict, secrets: dict) -> Optional[str]:
    """Render ``kubernetes-auth.yaml`` for this cluster and pull the
    ``kubeconfig`` entry's ``workspaceKey`` back out of it -- the same
    rendering rendered SLX runbooks go through for their
    ``secretsProvided.kubeconfig``. Returns None if no auth branch matched
    (i.e. this cluster type's auth isn't a kubeconfig ref).
    """
    try:
        rendered = render_template_file(
            AUTH_TEMPLATE_NAME,
            {"cluster": cluster_resource, "custom": custom, "secrets": secrets},
        )
        entries = yaml.safe_load(rendered) or []
    except Exception:
        logger.warning("Could not render %s to resolve a cluster credentialRef", AUTH_TEMPLATE_NAME, exc_info=True)
        return None

    for entry in entries:
        if isinstance(entry, dict) and entry.get("name") == "kubeconfig":
            key = entry.get("workspaceKey")
            if key and key != AUTH_DETAILS_NOT_FOUND:
                return key
    return None


def build_workspace_scope(
    cluster_scan_results: dict[str, ClusterScanResult],
    registry: Optional[Registry] = None,
    custom: Optional[dict[str, Any]] = None,
    secrets: Optional[dict[str, Any]] = None,
    builder_version: str = "",
    now: Optional[datetime] = None,
) -> dict[str, Any]:
    """Build the ``workspaceScope`` dict from what ``indexers.kubeapi.index()``
    captured during the current run.

    ``cluster_scan_results`` is ``indexers.kubeapi.get_last_cluster_scan_results()``.
    ``registry`` and ``custom``/``secrets`` (the same vars used to render SLX
    auth templates) are only needed to resolve ``credentialRef``; without a
    registry (or a cluster missing from it) ``credentialRef`` is left null.
    """
    custom = custom or {}
    secrets = secrets or {}
    now = now or datetime.now(timezone.utc)

    clusters_out: list[dict[str, Any]] = []
    for cluster_name in sorted(cluster_scan_results):
        scan = cluster_scan_results[cluster_name]

        cluster_resource = None
        if registry is not None:
            cluster_resource = registry.lookup_resource(
                KUBERNETES_PLATFORM, KubernetesResourceType.CLUSTER.value, cluster_name
            )
        credential_ref = _resolve_credential_ref(cluster_resource, custom, secrets)

        namespaces, namespaces_truncated = _bounded_sorted(scan.included_namespaces)
        if scan.namespace_selection == "all":
            excluded_namespaces, excluded_truncated = _bounded_sorted(scan.excluded_namespaces)
        else:
            # excludedNamespaces is only meaningful for "all" selection.
            excluded_namespaces, excluded_truncated = [], False

        cluster_entry: dict[str, Any] = {
            "name": scan.cluster_name,
            "context": scan.context_name,
            "clusterType": scan.cluster_type,
            "namespaceSelection": scan.namespace_selection,
            "namespaces": namespaces,
            "excludedNamespaces": excluded_namespaces,
            "credentialRef": credential_ref,
            "inClusterAuth": scan.in_cluster_auth,
            "reachable": scan.reachable,
        }
        if namespaces_truncated or excluded_truncated:
            cluster_entry["namespacesTruncated"] = True
        clusters_out.append(cluster_entry)

    return {
        "version": VERSION,
        "generatedAt": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "builderVersion": builder_version,
        "kubernetes": {"clusters": clusters_out},
    }

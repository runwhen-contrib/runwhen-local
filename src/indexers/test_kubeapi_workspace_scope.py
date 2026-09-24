"""
Unit tests for the per-cluster ``workspaceScope`` scan-result plumbing in
``indexers.kubeapi`` (``ClusterScanResult`` / ``get_last_cluster_scan_results``).

Namespaces excluded by an LOD-``none`` setting or by label/annotation filters
are never added to the resource registry -- they're simply skipped during
``index()`` -- so this is the only place that information survives past
indexing. These tests drive ``index()`` end-to-end with a mocked Kubernetes
client to pin down exactly what gets captured, since ``src/workspace_scope.py``
(and, through it, the ``workspaceScope`` upload payload) depends on it.
"""

from __future__ import annotations

import base64
import os
import sys
from unittest import TestCase
from unittest.mock import MagicMock, patch

import yaml

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from component import Context  # noqa: E402
from enrichers.generation_rules import RESOURCE_TYPE_SPECS_PROPERTY  # noqa: E402
from kubernetes.client.rest import ApiException  # noqa: E402
from resources import REGISTRY_PROPERTY_NAME, Registry  # noqa: E402
import indexers.kubeapi as kubeapi  # noqa: E402


class _FakeApiClient:
    """Stand-in for the kubernetes client's ``ApiClient`` context manager,
    tagged with the kubeconfig context it was created for so the CoreV1Api /
    VersionApi / ApisApi mocks below can return per-context data."""

    def __init__(self, context_name):
        self.context_name = context_name

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False


def _make_namespace(name, labels=None, annotations=None):
    ns = MagicMock()
    ns.metadata.name = name
    ns.metadata.uid = f"uid-{name}"
    ns.metadata.labels = labels or {}
    ns.metadata.annotations = annotations or {}
    ns.kind = "Namespace"
    # Real dict + attribute_map so kubeapi_parsers.parse_namespace's
    # to-JSON-and-back round trip doesn't choke on a MagicMock.
    ns.to_dict.return_value = {}
    ns.attribute_map = {}
    return ns


def _cluster_entry(name, extension=None):
    cluster = {"server": f"https://{name}.example"}
    if extension is not None:
        cluster["extensions"] = [{"name": "workspace-builder", "extension": extension}]
    return {"name": name, "cluster": cluster}


def _context_entry(context_name, cluster_name, user_name="user"):
    return {"name": context_name, "context": {"cluster": cluster_name, "user": user_name}}


def _kubeconfig_file_setting(clusters, contexts, users=None):
    users = users or [{"name": "user", "user": {"token": "not-a-real-token"}}]
    kubeconfig_text = yaml.safe_dump({
        "apiVersion": "v1",
        "kind": "Config",
        "clusters": clusters,
        "contexts": contexts,
        "users": users,
        "current-context": contexts[0]["name"] if contexts else "",
    })
    return base64.b64encode(kubeconfig_text.encode("utf-8")).decode("utf-8")


def _run_index(cloud_config_settings, default_lod="detailed", namespace_lods=None,
                namespaces_by_context=None, unreachable_contexts=None):
    """Run ``kubeapi.index()`` against a mocked Kubernetes client and return the
    resulting ``get_last_cluster_scan_results()`` dict.

    ``namespaces_by_context`` maps kubeconfig context name -> list of
    ``(name, labels)`` tuples returned by that context's ``list_namespace()``.
    ``unreachable_contexts`` names contexts whose connectivity check should
    raise (simulating an unreachable cluster).
    """
    namespaces_by_context = namespaces_by_context or {}
    unreachable_contexts = unreachable_contexts or set()

    context = Context(
        {
            "CLOUD_CONFIG": cloud_config_settings,
            "DEFAULT_LOD": default_lod,
            "NAMESPACE_LODS": namespace_lods or {},
        },
        outputter=MagicMock(),
    )
    context.set_property(REGISTRY_PROPERTY_NAME, Registry())
    context.set_property(RESOURCE_TYPE_SPECS_PROPERTY, {})

    def new_client_from_config(config_file=None, context=None):
        return _FakeApiClient(context)

    def core_v1_api(api_client=None):
        core = MagicMock()
        entries = namespaces_by_context.get(api_client.context_name, [])
        ns_by_name = {name: _make_namespace(name, labels=labels) for name, labels in entries}
        core.list_namespace.return_value = MagicMock(items=list(ns_by_name.values()))
        core.read_namespace.side_effect = lambda name: ns_by_name[name]
        # Built-in per-namespace resource scanning (Services, PVCs) runs
        # unconditionally after the namespace-selection logic under test;
        # short-circuit it to empty results.
        core.list_namespaced_service.return_value = MagicMock(items=[])
        core.list_namespaced_persistent_volume_claim.return_value = MagicMock(items=[])
        return core

    def empty_typed_api(api_client=None):
        """Stand-in for AppsV1Api/BatchV1Api/NetworkingV1Api: index() scans
        Deployments/DaemonSets/StatefulSets/Jobs/CronJobs/Ingresses for every
        namespace unconditionally, unrelated to the namespace-selection scope
        under test here, so every list_namespaced_* method returns empty."""
        api = MagicMock()
        api.list_namespaced_deployment.return_value = MagicMock(items=[])
        api.list_namespaced_daemon_set.return_value = MagicMock(items=[])
        api.list_namespaced_stateful_set.return_value = MagicMock(items=[])
        api.list_namespaced_job.return_value = MagicMock(items=[])
        api.list_namespaced_cron_job.return_value = MagicMock(items=[])
        api.list_namespaced_ingress.return_value = MagicMock(items=[])
        return api

    def version_api(api_client=None):
        version = MagicMock()
        if api_client.context_name in unreachable_contexts:
            version.get_code.side_effect = ApiException(status=401, reason="Unauthorized")
        else:
            version.get_code.return_value = MagicMock(git_version="v1.30.0")
        return version

    def apis_api(api_client=None):
        apis = MagicMock()
        apis.get_api_versions.return_value = MagicMock(groups=[])
        return apis

    with patch("indexers.kubeapi.kubernetes_config.new_client_from_config",
               side_effect=new_client_from_config), \
         patch("indexers.kubeapi.client.CoreV1Api", side_effect=core_v1_api), \
         patch("indexers.kubeapi.client.VersionApi", side_effect=version_api), \
         patch("indexers.kubeapi.client.ApisApi", side_effect=apis_api), \
         patch("indexers.kubeapi.client.AppsV1Api", side_effect=empty_typed_api), \
         patch("indexers.kubeapi.client.BatchV1Api", side_effect=empty_typed_api), \
         patch("indexers.kubeapi.client.NetworkingV1Api", side_effect=empty_typed_api), \
         patch("indexers.kubeapi.client.CustomObjectsApi",
               side_effect=lambda api_client=None: MagicMock()):
        kubeapi.index(context)

    return kubeapi.get_last_cluster_scan_results()


class MultiContextNamespaceSelectionTest(TestCase):
    """A single kubeconfig with two contexts: one using global namespaceLODs
    with "all" selection, the other using a per-context explicit namespace
    list. Exercises both branches of ``namespaceSelection`` plus exclusions in
    a single ``index()`` call, the way a real multi-cluster kubeconfig would."""

    def setUp(self):
        clusters = [_cluster_entry("cluster-all"), _cluster_entry("cluster-explicit")]
        contexts = [
            _context_entry("ctx-all", "cluster-all"),
            _context_entry("ctx-explicit", "cluster-explicit"),
        ]
        cloud_config_settings = {
            "kubernetes": {
                "kubeconfigFile": _kubeconfig_file_setting(clusters, contexts),
                "contexts": {
                    "ctx-explicit": {"namespaces": ["payments", "orders"]},
                },
                "namespaceLODs": {"kube-system": "none"},
                "excludeLabels": {"team": "internal-only"},
            },
        }
        namespaces_by_context = {
            "ctx-all": [
                ("payments", {}),
                ("kube-system", {}),
                ("internal-ns", {"team": "internal-only"}),
            ],
            "ctx-explicit": [
                ("payments", {}),
                ("orders", {}),
                ("extra-ns", {}),
            ],
        }
        self.results = _run_index(cloud_config_settings, namespaces_by_context=namespaces_by_context)

    def test_all_selection_reports_lod_and_label_excluded_namespaces(self):
        scan = self.results["cluster-all"]
        self.assertEqual(scan.context_name, "ctx-all")
        self.assertEqual(scan.namespace_selection, "all")
        self.assertEqual(scan.included_namespaces, {"payments"})
        self.assertEqual(scan.excluded_namespaces, {"kube-system", "internal-ns"})
        self.assertTrue(scan.reachable)

    def test_explicit_selection_reports_only_configured_namespaces(self):
        scan = self.results["cluster-explicit"]
        self.assertEqual(scan.context_name, "ctx-explicit")
        self.assertEqual(scan.namespace_selection, "explicit")
        self.assertEqual(scan.included_namespaces, {"payments", "orders"})
        # excludedNamespaces is only meaningful for "all" selection.
        self.assertEqual(scan.excluded_namespaces, set())
        self.assertTrue(scan.reachable)


class InClusterAuthExtensionTest(TestCase):
    """A cluster whose kubeconfig carries the same `workspace-builder`
    extension shape run.py's create_kubeconfig() injects for in-cluster auth
    should be reported with inClusterAuth=true and clusterType=kubernetes."""

    def test_in_cluster_auth_extension_is_reported(self):
        clusters = [_cluster_entry("default", extension={
            "cluster_type": "kubernetes",
            "cluster_name": "default",
            "in_cluster_auth": True,
        })]
        contexts = [_context_entry("default", "default")]
        cloud_config_settings = {
            "kubernetes": {"kubeconfigFile": _kubeconfig_file_setting(clusters, contexts)},
        }
        results = _run_index(
            cloud_config_settings,
            namespaces_by_context={"default": [("app", {})]},
        )
        scan = results["default"]
        self.assertTrue(scan.in_cluster_auth)
        self.assertEqual(scan.cluster_type, "kubernetes")
        self.assertEqual(scan.included_namespaces, {"app"})


class UnreachableClusterTest(TestCase):
    """A cluster that fails the connectivity check is still reported, with
    reachable=False and empty namespace lists."""

    def test_unreachable_cluster_reports_reachable_false(self):
        clusters = [_cluster_entry("prod")]
        contexts = [_context_entry("prod", "prod")]
        cloud_config_settings = {
            "kubernetes": {"kubeconfigFile": _kubeconfig_file_setting(clusters, contexts)},
        }
        results = _run_index(
            cloud_config_settings,
            namespaces_by_context={"prod": [("app", {})]},
            unreachable_contexts={"prod"},
        )
        scan = results["prod"]
        self.assertFalse(scan.reachable)
        self.assertEqual(scan.included_namespaces, set())
        self.assertEqual(scan.excluded_namespaces, set())


if __name__ == "__main__":
    import unittest
    unittest.main()

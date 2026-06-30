"""
Unit tests for per-cluster Level-of-Detail (LOD) resolution in
``indexers.kubeapi.build_cluster_lod_maps``.

These pin the bug fix for RW-1123: per-cluster ``defaultNamespaceLOD`` /
``namespaceLODs`` must be honored for GKE and EKS clusters exactly the same way
they already were for AKS clusters, both from explicit ``cloudConfig`` entries
and from the ``workspace-builder`` kubeconfig extension injected by the
auto-discovery generators.

The tests exercise the dict-population + lookup helper directly with mocked
``cloudConfig`` / kubeconfig dicts, so they do NOT require a live K8s API.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.kubeapi import build_cluster_lod_maps  # noqa: E402


def _wb_cluster(name, cluster_type, default_lod=None, namespace_lods=None):
    """Build a kubeconfig `clusters[]` entry with a workspace-builder extension,
    mirroring what the AKS/GKE/EKS generators inject."""
    extension = {"cluster_type": cluster_type, "cluster_name": name}
    if default_lod is not None:
        extension["defaultNamespaceLOD"] = default_lod
    if namespace_lods is not None:
        extension["namespaceLODs"] = namespace_lods
    return {
        "name": name,
        "cluster": {
            "server": "https://example",
            "extensions": [{"name": "workspace-builder", "extension": extension}],
        },
    }


class BuildClusterLodMapsTest(TestCase):
    # ------------------------------------------------------------------
    # Explicit cloudConfig clusters[] readers
    # ------------------------------------------------------------------
    def test_explicit_aks_cluster_lod(self):
        """Regression-safe: AKS explicit config still populates the maps."""
        cloud_config = {
            "azure": {"aksClusters": {"clusters": [
                {"name": "aks-1", "defaultNamespaceLOD": "detailed"},
            ]}},
        }
        ns_lods = {}
        lod_settings, ns_cluster = build_cluster_lod_maps(cloud_config, [], "none", ns_lods)
        self.assertEqual(lod_settings["aks-1"], "detailed")

    def test_explicit_gke_cluster_lod(self):
        """GKE explicit config (the RW-1123 fixture shape) now resolves to its
        own defaultNamespaceLOD instead of the global default."""
        cloud_config = {
            "gcp": {"gkeClusters": {"clusters": [
                # The fixture name carries a literal `-cluster` suffix and the
                # GKE generator uses it verbatim as the kubeconfig context name.
                {"name": "sandbox-cluster-1-cluster", "location": "us-central1",
                 "defaultNamespaceLOD": "basic"},
            ]}},
        }
        ns_lods = {}
        lod_settings, ns_cluster = build_cluster_lod_maps(cloud_config, [], "none", ns_lods)
        self.assertIn("sandbox-cluster-1-cluster", lod_settings)
        self.assertEqual(lod_settings["sandbox-cluster-1-cluster"], "basic")
        # The cluster key must match what the kubeconfig context carries so the
        # downstream `cluster_name in cluster_lod_settings` lookup hits.
        self.assertNotEqual(lod_settings["sandbox-cluster-1-cluster"], "none")

    def test_explicit_eks_cluster_lod(self):
        cloud_config = {
            "aws": {"eksClusters": {"clusters": [
                {"name": "eks-1", "defaultNamespaceLOD": "detailed"},
            ]}},
        }
        ns_lods = {}
        lod_settings, ns_cluster = build_cluster_lod_maps(cloud_config, [], "none", ns_lods)
        self.assertEqual(lod_settings["eks-1"], "detailed")

    def test_explicit_default_falls_back_to_global(self):
        """A cluster without defaultNamespaceLOD inherits the global default."""
        cloud_config = {
            "gcp": {"gkeClusters": {"clusters": [{"name": "gke-nolod"}]}},
        }
        lod_settings, _ = build_cluster_lod_maps(cloud_config, [], "none", {})
        self.assertEqual(lod_settings["gke-nolod"], "none")

    def test_explicit_namespace_lods_merge_global(self):
        cloud_config = {
            "gcp": {"gkeClusters": {"clusters": [
                {"name": "gke-1", "defaultNamespaceLOD": "basic",
                 "namespaceLODs": {"kube-system": "none", "prod": "detailed"}},
            ]}},
        }
        ns_lods = {}
        lod_settings, ns_cluster = build_cluster_lod_maps(cloud_config, [], "none", ns_lods)
        self.assertEqual(ns_cluster["gke-1"], {"kube-system": "none", "prod": "detailed"})
        # Per-cluster namespaceLODs also merge into the global map (back-compat).
        self.assertEqual(ns_lods["prod"], "detailed")

    # ------------------------------------------------------------------
    # workspace-builder extension reader (auto-discovered clusters)
    # ------------------------------------------------------------------
    def test_extension_gke_cluster_lod(self):
        """A kubeconfig cluster with a `cluster_type: gke` workspace-builder
        extension carrying defaultNamespaceLOD now resolves to that LOD."""
        clusters = [_wb_cluster("sandbox-cluster-1-cluster", "gke", default_lod="basic")]
        lod_settings, _ = build_cluster_lod_maps({}, clusters, "none", {})
        self.assertEqual(lod_settings["sandbox-cluster-1-cluster"], "basic")

    def test_extension_eks_cluster_lod(self):
        clusters = [_wb_cluster("eks-auto", "eks", default_lod="detailed")]
        lod_settings, _ = build_cluster_lod_maps({}, clusters, "none", {})
        self.assertEqual(lod_settings["eks-auto"], "detailed")

    def test_extension_aks_cluster_lod_unchanged(self):
        """Regression-safe: AKS extension handling is unchanged."""
        clusters = [_wb_cluster("aks-auto", "aks", default_lod="basic",
                                namespace_lods={"ns1": "detailed"})]
        ns_lods = {}
        lod_settings, ns_cluster = build_cluster_lod_maps({}, clusters, "none", ns_lods)
        self.assertEqual(lod_settings["aks-auto"], "basic")
        self.assertEqual(ns_cluster["aks-auto"], {"ns1": "detailed"})
        self.assertEqual(ns_lods["ns1"], "detailed")

    def test_extension_non_managed_cluster_type_ignored(self):
        """An unrecognized cluster_type does not populate the per-cluster map,
        so it falls through to the context/global LOD path downstream."""
        clusters = [_wb_cluster("plain", "something-else", default_lod="basic")]
        lod_settings, _ = build_cluster_lod_maps({}, clusters, "none", {})
        self.assertNotIn("plain", lod_settings)

    def test_extension_gke_namespace_lods(self):
        clusters = [_wb_cluster("gke-1", "gke", default_lod="basic",
                                namespace_lods={"prod": "detailed"})]
        ns_lods = {}
        lod_settings, ns_cluster = build_cluster_lod_maps({}, clusters, "none", ns_lods)
        self.assertEqual(ns_cluster["gke-1"], {"prod": "detailed"})
        self.assertEqual(ns_lods["prod"], "detailed")

    # ------------------------------------------------------------------
    # Mixed / precedence sanity
    # ------------------------------------------------------------------
    def test_mixed_aks_gke_eks(self):
        cloud_config = {
            "azure": {"aksClusters": {"clusters": [{"name": "aks-1", "defaultNamespaceLOD": "detailed"}]}},
            "gcp": {"gkeClusters": {"clusters": [{"name": "gke-1", "defaultNamespaceLOD": "basic"}]}},
            "aws": {"eksClusters": {"clusters": [{"name": "eks-1", "defaultNamespaceLOD": "none"}]}},
        }
        lod_settings, _ = build_cluster_lod_maps(cloud_config, [], "none", {})
        self.assertEqual(lod_settings, {"aks-1": "detailed", "gke-1": "basic", "eks-1": "none"})

    def test_extension_overrides_explicit_for_same_name(self):
        """When both explicit config and the kubeconfig extension name the same
        cluster, the extension (read second) wins -- documents current order."""
        cloud_config = {
            "gcp": {"gkeClusters": {"clusters": [{"name": "gke-1", "defaultNamespaceLOD": "basic"}]}},
        }
        clusters = [_wb_cluster("gke-1", "gke", default_lod="detailed")]
        lod_settings, _ = build_cluster_lod_maps(cloud_config, clusters, "none", {})
        self.assertEqual(lod_settings["gke-1"], "detailed")

    def test_empty_inputs(self):
        lod_settings, ns_cluster = build_cluster_lod_maps(None, None, "none", {})
        self.assertEqual(lod_settings, {})
        self.assertEqual(ns_cluster, {})


if __name__ == "__main__":
    import unittest
    unittest.main()

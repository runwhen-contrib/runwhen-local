"""
Unit tests for ``workspace_scope.build_workspace_scope`` -- the pure builder
for the ``workspaceScope`` upload payload (a summary of the Kubernetes
clusters/namespaces a run covered, sent to the Platform alongside the upload).
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

from indexers.kubeapi import ClusterScanResult  # noqa: E402
from indexers.kubetypes import KUBERNETES_PLATFORM, KubernetesResourceType  # noqa: E402
from resources import Registry  # noqa: E402
from workspace_scope import MAX_NAMESPACES, build_workspace_scope  # noqa: E402


def _add_cluster(registry, name, **attributes):
    registry.add_resource(
        KUBERNETES_PLATFORM, KubernetesResourceType.CLUSTER.value, name, name, attributes
    )


class NamespaceSelectionShapeTest(TestCase):
    def test_all_selection_reports_namespaces_and_excluded_sorted(self):
        scan = ClusterScanResult(
            cluster_name="prod-eu",
            context_name="prod-eu-admin",
            cluster_type="kubernetes",
            namespace_selection="all",
            included_namespaces={"orders", "payments"},
            excluded_namespaces={"kube-system"},
        )
        scope = build_workspace_scope({"prod-eu": scan}, builder_version="0.12.2")
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertEqual(cluster["name"], "prod-eu")
        self.assertEqual(cluster["context"], "prod-eu-admin")
        self.assertEqual(cluster["clusterType"], "kubernetes")
        self.assertEqual(cluster["namespaceSelection"], "all")
        self.assertEqual(cluster["namespaces"], ["orders", "payments"])
        self.assertEqual(cluster["excludedNamespaces"], ["kube-system"])
        self.assertTrue(cluster["reachable"])
        self.assertFalse(cluster["inClusterAuth"])
        self.assertNotIn("namespacesTruncated", cluster)

    def test_explicit_selection_never_reports_excluded_namespaces(self):
        """excludedNamespaces is only meaningful for "all" selection -- even if
        the scan result carries some (defensively), the built scope omits them."""
        scan = ClusterScanResult(
            cluster_name="explicit-cluster",
            context_name="explicit-ctx",
            namespace_selection="explicit",
            included_namespaces={"payments", "orders"},
            excluded_namespaces={"should-not-appear"},
        )
        scope = build_workspace_scope({"explicit-cluster": scan})
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertEqual(cluster["namespaceSelection"], "explicit")
        self.assertEqual(cluster["namespaces"], ["orders", "payments"])
        self.assertEqual(cluster["excludedNamespaces"], [])

    def test_unreachable_cluster_has_empty_namespace_lists(self):
        scan = ClusterScanResult(
            cluster_name="gone",
            context_name="gone-ctx",
            reachable=False,
        )
        scope = build_workspace_scope({"gone": scan})
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertFalse(cluster["reachable"])
        self.assertEqual(cluster["namespaces"], [])
        self.assertEqual(cluster["excludedNamespaces"], [])

    def test_multiple_clusters_sorted_by_name(self):
        scans = {
            "zeta": ClusterScanResult(cluster_name="zeta", context_name="zeta-ctx"),
            "alpha": ClusterScanResult(cluster_name="alpha", context_name="alpha-ctx"),
        }
        scope = build_workspace_scope(scans)
        names = [c["name"] for c in scope["kubernetes"]["clusters"]]
        self.assertEqual(names, ["alpha", "zeta"])


class TruncationTest(TestCase):
    def test_namespaces_truncated_beyond_bound(self):
        included = {f"ns-{i}" for i in range(MAX_NAMESPACES + 5)}
        scan = ClusterScanResult(
            cluster_name="big",
            context_name="big-ctx",
            namespace_selection="all",
            included_namespaces=included,
        )
        scope = build_workspace_scope({"big": scan})
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertEqual(len(cluster["namespaces"]), MAX_NAMESPACES)
        self.assertTrue(cluster["namespacesTruncated"])

    def test_excluded_namespaces_truncated_beyond_bound(self):
        excluded = {f"ex-{i}" for i in range(MAX_NAMESPACES + 3)}
        scan = ClusterScanResult(
            cluster_name="big",
            context_name="big-ctx",
            namespace_selection="all",
            excluded_namespaces=excluded,
        )
        scope = build_workspace_scope({"big": scan})
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertEqual(len(cluster["excludedNamespaces"]), MAX_NAMESPACES)
        self.assertTrue(cluster["namespacesTruncated"])


class TopLevelEnvelopeTest(TestCase):
    def test_version_generated_at_and_builder_version(self):
        fixed_now = datetime(2026, 9, 25, 10, 0, 0, tzinfo=timezone.utc)
        scope = build_workspace_scope({}, builder_version="0.12.2", now=fixed_now)
        self.assertEqual(scope["version"], 1)
        self.assertEqual(scope["generatedAt"], "2026-09-25T10:00:00Z")
        self.assertEqual(scope["builderVersion"], "0.12.2")
        self.assertEqual(scope["kubernetes"]["clusters"], [])


class CredentialRefResolutionTest(TestCase):
    """credentialRef must come from the same auth-template rendering the
    rendered SLX secretsProvided.kubeconfig entry uses (see
    src/test_gke_auth_templates.py), not a re-derivation."""

    def test_gke_cluster_resolves_gcp_adc_workspace_key(self):
        registry = Registry()
        _add_cluster(
            registry, "gke-1",
            context="gke-1-ctx", cluster_type="gke", cluster_name="gke-1",
            auth_type="gcp_adc", project_id="my-project", location="us-west1",
        )
        scan = ClusterScanResult(cluster_name="gke-1", context_name="gke-1-ctx", cluster_type="gke")
        scope = build_workspace_scope({"gke-1": scan}, registry=registry)
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertEqual(cluster["credentialRef"], "gcp:adc@kubeconfig:my-project/gke-1/us-west1")

    def test_plain_kubernetes_cluster_falls_back_to_custom_kubeconfig_secret_name(self):
        registry = Registry()
        _add_cluster(registry, "plain", context="plain-ctx")
        scan = ClusterScanResult(cluster_name="plain", context_name="plain-ctx")
        scope = build_workspace_scope(
            {"plain": scan},
            registry=registry,
            custom={"kubeconfig_secret_name": "k8s:file@secret/kubeconfig:kubeconfig"},
        )
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertEqual(cluster["credentialRef"], "k8s:file@secret/kubeconfig:kubeconfig")

    def test_credential_ref_is_null_when_no_auth_branch_matches(self):
        scan = ClusterScanResult(cluster_name="unknown", context_name="unknown-ctx")
        # No registry -> no cluster Resource -> no custom.kubeconfig_secret_name either.
        scope = build_workspace_scope({"unknown": scan})
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertIsNone(cluster["credentialRef"])

    def test_aks_cluster_resolves_azure_identity_workspace_key(self):
        registry = Registry()
        _add_cluster(
            registry, "aks-1",
            context="aks-1-ctx", cluster_type="aks", cluster_name="aks-1",
            auth_type="azure_managed_identity", resource_group="rg-aks-1",
        )
        scan = ClusterScanResult(cluster_name="aks-1", context_name="aks-1-ctx", cluster_type="aks")
        scope = build_workspace_scope({"aks-1": scan}, registry=registry)
        cluster = scope["kubernetes"]["clusters"][0]
        self.assertEqual(cluster["credentialRef"], "azure:identity@kubeconfig:rg-aks-1/aks-1")


# ---------------------------------------------------------------------------
# No secret material, ever.
# ---------------------------------------------------------------------------

_SECRET_LOOKING_PATTERNS = [
    re.compile(r"BEGIN (RSA |EC )?(PRIVATE KEY|CERTIFICATE)"),
    re.compile(r"^[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$"),  # JWT-shaped
]

# Any single value this long is suspicious for a scope payload that's only
# ever supposed to carry short names/refs.
_MAX_PLAUSIBLE_VALUE_LENGTH = 500


def _iter_values(obj):
    if isinstance(obj, dict):
        for value in obj.values():
            yield from _iter_values(value)
    elif isinstance(obj, list):
        for value in obj:
            yield from _iter_values(value)
    else:
        yield obj


class NoSecretMaterialTest(TestCase):
    def _assert_scope_has_no_secret_looking_values(self, scope):
        for value in _iter_values(scope):
            if not isinstance(value, str):
                continue
            self.assertLessEqual(
                len(value), _MAX_PLAUSIBLE_VALUE_LENGTH,
                f"suspiciously long value in workspaceScope: {value[:80]}...",
            )
            for pattern in _SECRET_LOOKING_PATTERNS:
                self.assertIsNone(
                    pattern.search(value),
                    f"secret-looking value in workspaceScope: {value[:80]}...",
                )

    def test_extra_cluster_attributes_never_leak_into_the_scope(self):
        """Simulates a hypothetical future indexer bug that stashes actual
        secret material directly on the cluster Resource: build_workspace_scope
        only ever reads the specific attributes its auth template touches, so
        such values must never reach the output."""
        registry = Registry()
        fake_cert = "-----BEGIN CERTIFICATE-----\n" + ("MIIC" * 150) + "\n-----END CERTIFICATE-----"
        fake_token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYyJ9." + ("A" * 300) + "." + ("B" * 40)
        _add_cluster(
            registry, "prod",
            context="prod-ctx", cluster_type="gke", cluster_name="prod",
            auth_type="gcp_adc", project_id="proj", location="us-west1",
            leaked_kubeconfig_yaml=fake_cert,
            leaked_token=fake_token,
        )
        scan = ClusterScanResult(
            cluster_name="prod", context_name="prod-ctx", cluster_type="gke",
            namespace_selection="all", included_namespaces={"payments"},
        )
        scope = build_workspace_scope({"prod": scan}, registry=registry, builder_version="1.2.3")

        self._assert_scope_has_no_secret_looking_values(scope)
        dumped = json.dumps(scope)
        self.assertNotIn(fake_cert, dumped)
        self.assertNotIn(fake_token, dumped)

    def test_typical_scope_has_no_secret_looking_values(self):
        registry = Registry()
        _add_cluster(registry, "gke-1", context="gke-1-ctx", cluster_type="gke",
                     cluster_name="gke-1", auth_type="gcp_adc", project_id="my-project",
                     location="us-west1")
        scan = ClusterScanResult(
            cluster_name="gke-1", context_name="gke-1-ctx", cluster_type="gke",
            namespace_selection="all", included_namespaces={"payments", "orders"},
            excluded_namespaces={"kube-system"},
        )
        scope = build_workspace_scope({"gke-1": scan}, registry=registry, builder_version="0.12.2")
        self._assert_scope_has_no_secret_looking_values(scope)


if __name__ == "__main__":
    import unittest
    unittest.main()

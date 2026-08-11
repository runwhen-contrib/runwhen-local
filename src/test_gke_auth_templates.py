"""
Unit tests for GKE auth template branches in ``kubernetes-auth.yaml`` and
``gcp-kubernetes-auth.yaml``.

These pin the fix for the bug where GKE clusters discovered via
``cloudConfig.gcp.gkeClusters`` would fall through to the generic
``custom.kubeconfig_secret_name`` fallback in ``kubernetes-auth.yaml``
(producing ``k8s:file@secret/kubeconfig:kubeconfig``) instead of the correct
``gcp:adc@kubeconfig:...`` / ``gcp:sa@kubeconfig:...`` workspaceKeys.

The tests also verify that ``cluster.location`` (the attribute the GKE
kubeconfig generator actually injects via the workspace-builder extension) is
used as the location segment, fixing the secondary bug where the templates
only checked ``cluster.zone`` / ``cluster.region`` and rendered ``undefined``.
"""

from __future__ import annotations

import os
import sys
from typing import Any, Optional
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

from resources import Resource, ResourceType  # noqa: E402
from template import render_template_file  # noqa: E402


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_cluster(
    name: str = "platform-cluster-01",
    cluster_type: str = "gke",
    auth_type: str = "gcp_adc",
    auth_secret: Optional[str] = None,
    location: str = "us-west1",
    zone: Optional[str] = None,
    region: Optional[str] = None,
    project_id: Optional[str] = "my-project",
) -> Resource:
    """Build a cluster ``Resource`` mirroring what ``kubeapi.py`` creates from
    the workspace-builder kubeconfig extension injected by
    ``generate_kubeconfig_for_gke``."""
    attributes: dict[str, Any] = {
        "cluster_type": cluster_type,
        "cluster_name": name,
        "auth_type": auth_type,
        "location": location,
    }
    if auth_secret is not None:
        attributes["auth_secret"] = auth_secret
    if project_id is not None:
        attributes["project_id"] = project_id
    if zone is not None:
        attributes["zone"] = zone
    if region is not None:
        attributes["region"] = region
    rt = ResourceType("cluster", None)
    return Resource(name, name, rt, **attributes)


def _render_auth_template(
    template_name: str,
    cluster: Optional[Resource] = None,
    custom: Optional[dict] = None,
    secrets: Optional[dict] = None,
) -> str:
    """Render an auth template with the given variables and return the
    rendered text."""
    template_variables: dict[str, Any] = {}
    if cluster is not None:
        template_variables["cluster"] = cluster
    if custom is not None:
        template_variables["custom"] = custom
    if secrets is not None:
        template_variables["secrets"] = secrets
    return render_template_file(template_name, template_variables)


def _extract_workspace_key(rendered: str, name: str = "kubeconfig") -> str:
    """Extract the workspaceKey value for a given secret name from rendered text."""
    lines = rendered.splitlines()
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == f"- name: {name}":
            for j in range(i + 1, min(i + 5, len(lines))):
                key_line = lines[j].strip()
                if key_line.startswith("workspaceKey:"):
                    return key_line[len("workspaceKey:"):].strip()
                if key_line.startswith("- name:"):
                    break
    raise ValueError(f"workspaceKey for '{name}' not found in rendered output:\n{rendered}")


# ---------------------------------------------------------------------------
# kubernetes-auth.yaml — GKE branches
# ---------------------------------------------------------------------------

class KubernetesAuthGkeAdcTest(TestCase):
    """GKE + ADC should produce gcp:adc@kubeconfig, not the kubeconfig secret fallback."""

    def setUp(self):
        os.chdir(_THIS_DIR)

    def test_gke_adc_renders_gcp_adc_workspacekey(self):
        cluster = _make_cluster(auth_type="gcp_adc", location="us-west1")
        custom = {"kubeconfig_secret_name": "k8s:file@secret/kubeconfig:kubeconfig"}
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster, custom=custom)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:adc@kubeconfig:my-project/platform-cluster-01/us-west1")

    def test_gke_adc_does_not_fall_through_to_kubeconfig_secret(self):
        """The exact regression: Helm default kubeconfig_secret_name must NOT be used."""
        cluster = _make_cluster(auth_type="gcp_adc")
        custom = {"kubeconfig_secret_name": "k8s:file@secret/kubeconfig:kubeconfig"}
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster, custom=custom)
        key = _extract_workspace_key(rendered)
        self.assertNotIn("k8s:file@secret/kubeconfig", key)
        self.assertIn("gcp:adc@kubeconfig", key)

    def test_gke_adc_location_falls_back_to_zone(self):
        cluster = _make_cluster(auth_type="gcp_adc", location=None, zone="us-central1-a")
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:adc@kubeconfig:my-project/platform-cluster-01/us-central1-a")


class KubernetesAuthGkeServiceAccountTest(TestCase):
    """GKE + service account variants."""

    def setUp(self):
        os.chdir(_THIS_DIR)

    def test_gke_service_account_renders_gcp_sa_workspacekey(self):
        cluster = _make_cluster(auth_type="gcp_service_account", location="us-east1")
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:sa@kubeconfig:my-project/platform-cluster-01/us-east1")

    def test_gke_service_account_file_renders_gcp_sa_workspacekey(self):
        cluster = _make_cluster(auth_type="gcp_service_account_file", location="us-east1")
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:sa@kubeconfig:my-project/platform-cluster-01/us-east1")

    def test_gke_service_account_secret_renders_sa_plus_secret_refs(self):
        cluster = _make_cluster(
            auth_type="gcp_service_account_secret",
            auth_secret="gcp-prod-credentials",
            location="us-west1",
        )
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster)
        kubeconfig_key = _extract_workspace_key(rendered, "kubeconfig")
        self.assertEqual(kubeconfig_key, "gcp:sa@kubeconfig:my-project/platform-cluster-01/us-west1")
        project_key = _extract_workspace_key(rendered, "gcp_projectId")
        self.assertEqual(project_key, "k8s:file@secret/gcp-prod-credentials:projectId")
        sa_key = _extract_workspace_key(rendered, "gcp_serviceAccountKey")
        self.assertEqual(sa_key, "k8s:file@secret/gcp-prod-credentials:serviceAccountKey")


class KubernetesAuthGkeCatchAllTest(TestCase):
    """A GKE cluster with an unrecognized auth_type should fall to the gcp:adc
    catch-all branch, not the generic kubeconfig_secret_name fallback."""

    def setUp(self):
        os.chdir(_THIS_DIR)

    def test_gke_unknown_auth_type_uses_adc_catch_all(self):
        cluster = _make_cluster(auth_type="some_future_auth", location="us-west1")
        custom = {"kubeconfig_secret_name": "k8s:file@secret/kubeconfig:kubeconfig"}
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster, custom=custom)
        key = _extract_workspace_key(rendered)
        self.assertIn("gcp:adc@kubeconfig", key)
        self.assertNotIn("k8s:file@secret/kubeconfig", key)


class KubernetesAuthNonGkeFallbackTest(TestCase):
    """Non-GKE clusters should still fall through to the generic fallback."""

    def setUp(self):
        os.chdir(_THIS_DIR)

    def test_no_cluster_uses_kubeconfig_secret_name(self):
        custom = {"kubeconfig_secret_name": "k8s:file@secret/kubeconfig:kubeconfig"}
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=None, custom=custom)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "k8s:file@secret/kubeconfig:kubeconfig")

    def test_aks_still_works(self):
        cluster = _make_cluster(
            name="aks-cluster-1",
            cluster_type="aks",
            auth_type="azure_managed_identity",
            location=None,
        )
        cluster.resource_group = "rg-aks-1"
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "azure:identity@kubeconfig:rg-aks-1/aks-cluster-1")


# ---------------------------------------------------------------------------
# gcp-kubernetes-auth.yaml — location fix
# ---------------------------------------------------------------------------

class GcpKubernetesAuthLocationTest(TestCase):
    """Verify gcp-kubernetes-auth.yaml uses cluster.location (not just zone/region)."""

    def setUp(self):
        os.chdir(_THIS_DIR)

    def test_gcp_adc_uses_location(self):
        cluster = _make_cluster(auth_type="gcp_adc", location="us-west1")
        rendered = _render_auth_template("gcp-kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:adc@kubeconfig:my-project/platform-cluster-01/us-west1")

    def test_gcp_sa_uses_location(self):
        cluster = _make_cluster(auth_type="gcp_service_account", location="us-east1")
        rendered = _render_auth_template("gcp-kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:sa@kubeconfig:my-project/platform-cluster-01/us-east1")

    def test_gcp_sa_secret_uses_location(self):
        cluster = _make_cluster(
            auth_type="gcp_service_account_secret",
            auth_secret="gcp-creds",
            location="us-central1",
        )
        rendered = _render_auth_template("gcp-kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered, "kubeconfig")
        self.assertEqual(key, "gcp:sa@kubeconfig:my-project/platform-cluster-01/us-central1")

    def test_gcp_adc_location_falls_back_to_zone(self):
        cluster = _make_cluster(auth_type="gcp_adc", location=None, zone="us-central1-a")
        rendered = _render_auth_template("gcp-kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:adc@kubeconfig:my-project/platform-cluster-01/us-central1-a")


# ---------------------------------------------------------------------------
# Multi-project workspaceKey uniqueness
# ---------------------------------------------------------------------------

class KubernetesAuthMultiProjectTest(TestCase):
    """Same-named clusters in different projects must produce different workspaceKeys."""

    def setUp(self):
        os.chdir(_THIS_DIR)

    def test_same_name_different_project_different_keys(self):
        cluster_a = _make_cluster(
            name="prod-cluster", project_id="project-alpha", auth_type="gcp_adc", location="us-west1"
        )
        cluster_b = _make_cluster(
            name="prod-cluster", project_id="project-beta", auth_type="gcp_adc", location="us-west1"
        )
        rendered_a = _render_auth_template("kubernetes-auth.yaml", cluster=cluster_a)
        rendered_b = _render_auth_template("kubernetes-auth.yaml", cluster=cluster_b)
        key_a = _extract_workspace_key(rendered_a)
        key_b = _extract_workspace_key(rendered_b)
        self.assertEqual(key_a, "gcp:adc@kubeconfig:project-alpha/prod-cluster/us-west1")
        self.assertEqual(key_b, "gcp:adc@kubeconfig:project-beta/prod-cluster/us-west1")
        self.assertNotEqual(key_a, key_b)

    def test_same_name_different_project_sa_secret_keys(self):
        cluster_a = _make_cluster(
            name="prod-cluster", project_id="project-alpha",
            auth_type="gcp_service_account_secret",
            auth_secret="gcp-creds", location="us-west1"
        )
        cluster_b = _make_cluster(
            name="prod-cluster", project_id="project-beta",
            auth_type="gcp_service_account_secret",
            auth_secret="gcp-creds", location="us-west1"
        )
        rendered_a = _render_auth_template("kubernetes-auth.yaml", cluster=cluster_a)
        rendered_b = _render_auth_template("kubernetes-auth.yaml", cluster=cluster_b)
        key_a = _extract_workspace_key(rendered_a, "kubeconfig")
        key_b = _extract_workspace_key(rendered_b, "kubeconfig")
        self.assertEqual(key_a, "gcp:sa@kubeconfig:project-alpha/prod-cluster/us-west1")
        self.assertEqual(key_b, "gcp:sa@kubeconfig:project-beta/prod-cluster/us-west1")
        self.assertNotEqual(key_a, key_b)


class KubernetesAuthProjectIdNoneTest(TestCase):
    """When project_id is None, it should render as 'undefined'."""

    def setUp(self):
        os.chdir(_THIS_DIR)

    def test_project_id_none_renders_undefined_in_kubernetes_auth(self):
        cluster = _make_cluster(
            name="my-cluster", project_id=None, auth_type="gcp_adc", location="us-east1"
        )
        rendered = _render_auth_template("kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:adc@kubeconfig:undefined/my-cluster/us-east1")

    def test_project_id_none_renders_undefined_in_gcp_kubernetes_auth(self):
        cluster = _make_cluster(
            name="my-cluster", project_id=None, auth_type="gcp_service_account", location="us-east1"
        )
        rendered = _render_auth_template("gcp-kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:sa@kubeconfig:undefined/my-cluster/us-east1")

    def test_project_id_default_undefined_in_gcp_adc_gcp_template(self):
        cluster = _make_cluster(
            name="my-cluster", project_id=None, auth_type="gcp_adc", location="us-central1"
        )
        rendered = _render_auth_template("gcp-kubernetes-auth.yaml", cluster=cluster)
        key = _extract_workspace_key(rendered)
        self.assertEqual(key, "gcp:adc@kubeconfig:undefined/my-cluster/us-central1")


class GcpKubernetesAuthMultiProjectTest(TestCase):
    """gcp-kubernetes-auth.yaml multi-project uniqueness."""

    def setUp(self):
        os.chdir(_THIS_DIR)

    def test_same_name_different_project_different_keys(self):
        cluster_a = _make_cluster(
            name="prod-cluster", project_id="project-alpha", auth_type="gcp_adc", location="us-west1"
        )
        cluster_b = _make_cluster(
            name="prod-cluster", project_id="project-beta", auth_type="gcp_adc", location="us-west1"
        )
        rendered_a = _render_auth_template("gcp-kubernetes-auth.yaml", cluster=cluster_a)
        rendered_b = _render_auth_template("gcp-kubernetes-auth.yaml", cluster=cluster_b)
        key_a = _extract_workspace_key(rendered_a)
        key_b = _extract_workspace_key(rendered_b)
        self.assertEqual(key_a, "gcp:adc@kubeconfig:project-alpha/prod-cluster/us-west1")
        self.assertEqual(key_b, "gcp:adc@kubeconfig:project-beta/prod-cluster/us-west1")
        self.assertNotEqual(key_a, key_b)

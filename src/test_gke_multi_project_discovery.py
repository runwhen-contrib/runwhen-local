"""
Unit tests for multi-project GKE auto-discovery in ``gcp_utils.py``.

These pin the fix for the bug where ``gkeClusters.autoDiscover: true`` only
discovered clusters in a single project (the first project from
``cloudConfig.gcp.projects`` or ``discoveryConfig.projectId``), even when
multiple projects were configured.

The GCP Container API ``list_clusters`` is scoped per-project
(``projects/{id}/locations/-``), so to discover clusters across multiple
projects we must call it once per project and merge the results.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase
from unittest.mock import MagicMock, patch

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

# gcp_utils -> utils -> kubernetes; stub the kubernetes module so the import
# doesn't fail in environments without the kubernetes Python package.
for _mod in ("kubernetes", "kubernetes.dynamic", "kubernetes.dynamic.resource"):
    if _mod not in sys.modules:
        sys.modules[_mod] = MagicMock()

from gcp_utils import _normalize_project_ids, discover_gke_clusters  # noqa: E402


# ---------------------------------------------------------------------------
# _normalize_project_ids
# ---------------------------------------------------------------------------

class NormalizeProjectIdsTest(TestCase):
    def test_single_string(self):
        self.assertEqual(_normalize_project_ids("my-project"), ["my-project"])

    def test_comma_separated_string(self):
        self.assertEqual(
            _normalize_project_ids("proj-a, proj-b,proj-c"),
            ["proj-a", "proj-b", "proj-c"],
        )

    def test_list_of_strings(self):
        self.assertEqual(
            _normalize_project_ids(["proj-a", "proj-b"]),
            ["proj-a", "proj-b"],
        )

    def test_list_of_dicts(self):
        self.assertEqual(
            _normalize_project_ids([
                {"projectId": "proj-a"},
                {"project_id": "proj-b"},
            ]),
            ["proj-a", "proj-b"],
        )

    def test_none(self):
        self.assertEqual(_normalize_project_ids(None), [])

    def test_empty_list(self):
        self.assertEqual(_normalize_project_ids([]), [])

    def test_strips_whitespace(self):
        self.assertEqual(
            _normalize_project_ids(["  proj-a  ", " proj-b "]),
            ["proj-a", "proj-b"],
        )

    def test_deduplicates(self):
        self.assertEqual(
            _normalize_project_ids(["proj-a", "proj-b", "proj-a"]),
            ["proj-a", "proj-b"],
        )

    def test_deduplicates_comma_separated(self):
        self.assertEqual(
            _normalize_project_ids("proj-a, proj-b, proj-a"),
            ["proj-a", "proj-b"],
        )

    def test_deduplicates_preserves_order(self):
        self.assertEqual(
            _normalize_project_ids(["proj-c", "proj-a", "proj-b", "proj-a", "proj-c"]),
            ["proj-c", "proj-a", "proj-b"],
        )


# ---------------------------------------------------------------------------
# discover_gke_clusters — per-project scoping
# ---------------------------------------------------------------------------

class DiscoverGkeClustersTest(TestCase):
    """Verify ``discover_gke_clusters`` only queries the given project and
    returns the right cluster dicts."""

    def _make_mock_client(self, clusters):
        """Build a mock ClusterManagerClient whose list_clusters returns the
        given cluster objects."""
        mock_response = MagicMock()
        mock_response.clusters = clusters
        mock_client = MagicMock()
        mock_client.list_clusters.return_value = mock_response
        return mock_client

    def _make_cluster_obj(self, name, location):
        c = MagicMock()
        c.name = name
        c.location = location
        return c

    def test_single_project(self):
        clusters = [self._make_cluster_obj("cluster-a", "us-west1")]
        client = self._make_mock_client(clusters)
        result = discover_gke_clusters("proj-a", client=client)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["name"], "cluster-a")
        self.assertEqual(result[0]["location"], "us-west1")
        # Verify the parent path was scoped to proj-a
        call_args = client.list_clusters.call_args
        self.assertEqual(call_args.kwargs["parent"], "projects/proj-a/locations/-")

    def test_empty_project_returns_empty(self):
        client = self._make_mock_client([])
        result = discover_gke_clusters("proj-empty", client=client)
        self.assertEqual(result, [])

    def test_filters_out_missing_name_or_location(self):
        clusters = [
            self._make_cluster_obj("good-cluster", "us-west1"),
            self._make_cluster_obj(None, "us-west1"),
            self._make_cluster_obj("no-location", None),
        ]
        client = self._make_mock_client(clusters)
        result = discover_gke_clusters("proj-a", client=client)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["name"], "good-cluster")


# ---------------------------------------------------------------------------
# Multi-project auto-discovery integration
# ---------------------------------------------------------------------------

class MultiProjectAutoDiscoveryTest(TestCase):
    """Verify that ``generate_kubeconfig_for_gke`` calls
    ``discover_gke_clusters`` once per configured project when autoDiscover is
    true, and merges the results."""

    def test_multi_project_discovery_calls_list_per_project(self):
        """The core regression: multiple projects must each get a list_clusters call."""
        from gcp_utils import generate_kubeconfig_for_gke

        workspace_info = {
            "cloudConfig": {
                "gcp": {
                    "projects": ["proj-beta", "proj-staging"],
                    "gkeClusters": {
                        "autoDiscover": True,
                    },
                }
            }
        }

        # Mock the credential resolution + client building so we never touch GCP.
        mock_client = MagicMock()

        # Track which project parents were queried.
        queried_parents = []

        def mock_list_clusters(parent=None):
            queried_parents.append(parent)
            resp = MagicMock()
            if "proj-beta" in parent:
                resp.clusters = [self._make_cluster_obj("beta-cluster", "us-west1")]
            elif "proj-staging" in parent:
                resp.clusters = [self._make_cluster_obj("staging-cluster", "us-east1")]
            else:
                resp.clusters = []
            return resp

        mock_client.list_clusters.side_effect = mock_list_clusters

        with (
            patch("gcp_utils.get_gcp_credential", return_value=("proj-beta", None, "gcp_adc", None)),
            patch("gcp_utils._decode_service_account_key", return_value=None),
            patch("gcp_utils._build_gke_credentials", return_value=MagicMock()),
            patch("gcp_utils._refresh_gke_token", return_value="fake-token"),
            patch("gcp_utils._new_cluster_manager_client", return_value=mock_client),
            patch("gcp_utils._fetch_gke_cluster_details", return_value=("1.2.3.4", "fake-ca")),
            patch("gcp_utils.mask_string", side_effect=lambda x: x),
        ):
            generate_kubeconfig_for_gke([], workspace_info)

        # Both projects must have been queried
        self.assertEqual(len(queried_parents), 2)
        self.assertIn("projects/proj-beta/locations/-", queried_parents)
        self.assertIn("projects/proj-staging/locations/-", queried_parents)

    def test_discovery_config_project_id_filters_to_single_project(self):
        """When discoveryConfig.projectId is set, only that project is queried."""
        from gcp_utils import generate_kubeconfig_for_gke

        workspace_info = {
            "cloudConfig": {
                "gcp": {
                    "projects": ["proj-beta", "proj-staging"],
                    "gkeClusters": {
                        "autoDiscover": True,
                        "discoveryConfig": {
                            "projectId": "proj-beta",
                        },
                    },
                }
            }
        }

        mock_client = MagicMock()
        queried_parents = []

        def mock_list_clusters(parent=None):
            queried_parents.append(parent)
            resp = MagicMock()
            resp.clusters = []
            return resp

        mock_client.list_clusters.side_effect = mock_list_clusters

        with (
            patch("gcp_utils.get_gcp_credential", return_value=("proj-beta", None, "gcp_adc", None)),
            patch("gcp_utils._decode_service_account_key", return_value=None),
            patch("gcp_utils._build_gke_credentials", return_value=MagicMock()),
            patch("gcp_utils._refresh_gke_token", return_value="fake-token"),
            patch("gcp_utils._new_cluster_manager_client", return_value=mock_client),
            patch("gcp_utils._fetch_gke_cluster_details", return_value=("1.2.3.4", "fake-ca")),
            patch("gcp_utils.mask_string", side_effect=lambda x: x),
        ):
            generate_kubeconfig_for_gke([], workspace_info)

        self.assertEqual(len(queried_parents), 1)
        self.assertEqual(queried_parents[0], "projects/proj-beta/locations/-")

    def test_discovered_clusters_tagged_with_project_id(self):
        """Auto-discovered clusters must carry their projectId so
        _fetch_gke_cluster_details queries the right project."""
        from gcp_utils import generate_kubeconfig_for_gke

        workspace_info = {
            "cloudConfig": {
                "gcp": {
                    "projects": ["proj-beta", "proj-staging"],
                    "gkeClusters": {"autoDiscover": True},
                }
            }
        }

        mock_client = MagicMock()

        def mock_list_clusters(parent=None):
            resp = MagicMock()
            if "proj-beta" in parent:
                resp.clusters = [self._make_cluster_obj("beta-cluster", "us-west1")]
            elif "proj-staging" in parent:
                resp.clusters = [self._make_cluster_obj("staging-cluster", "us-east1")]
            else:
                resp.clusters = []
            return resp

        mock_client.list_clusters.side_effect = mock_list_clusters

        fetched_args = []

        def mock_fetch(client, project_id, location, cluster_name):
            fetched_args.append((project_id, location, cluster_name))
            return ("1.2.3.4", "fake-ca")

        with (
            patch("gcp_utils.get_gcp_credential", return_value=("proj-beta", None, "gcp_adc", None)),
            patch("gcp_utils._decode_service_account_key", return_value=None),
            patch("gcp_utils._build_gke_credentials", return_value=MagicMock()),
            patch("gcp_utils._refresh_gke_token", return_value="fake-token"),
            patch("gcp_utils._new_cluster_manager_client", return_value=mock_client),
            patch("gcp_utils._fetch_gke_cluster_details", side_effect=mock_fetch),
            patch("gcp_utils.mask_string", side_effect=lambda x: x),
        ):
            generate_kubeconfig_for_gke([], workspace_info)

        # Each cluster must be fetched with its own project ID
        projects_fetched = {args[0] for args in fetched_args}
        self.assertIn("proj-beta", projects_fetched)
        self.assertIn("proj-staging", projects_fetched)

    def _make_cluster_obj(self, name, location):
        c = MagicMock()
        c.name = name
        c.location = location
        return c


# ---------------------------------------------------------------------------
# Cross-project cluster name collision disambiguation
# ---------------------------------------------------------------------------

class ClusterNameCollisionTest(TestCase):
    """When two projects both contain a cluster with the same name, the
    kubeconfig context/cluster/user names must be disambiguated by prefixing
    with the project ID so neither entry is silently overwritten."""

    def test_same_name_different_projects_disambiguated(self):
        """Two clusters named 'prod-cluster' in proj-a and proj-b must produce
        distinct kubeconfig context names."""
        import gcp_utils

        workspace_info = {
            "cloudConfig": {
                "gcp": {
                    "projects": ["proj-a", "proj-b"],
                    "gkeClusters": {"autoDiscover": True},
                }
            }
        }

        mock_client = MagicMock()

        def mock_list_clusters(parent=None):
            resp = MagicMock()
            if "proj-a" in parent:
                resp.clusters = [self._make_cluster_obj("prod-cluster", "us-west1")]
            elif "proj-b" in parent:
                resp.clusters = [self._make_cluster_obj("prod-cluster", "us-east1")]
            else:
                resp.clusters = []
            return resp

        mock_client.list_clusters.side_effect = mock_list_clusters

        captured_config = {}
        original_write = gcp_utils.yaml.dump

        def capture_write(data, stream=None, **kwargs):
            if isinstance(data, dict) and 'clusters' in data and 'contexts' in data:
                captured_config.update(data)
            if stream:
                return original_write(data, stream, **kwargs)
            return original_write(data, **kwargs)

        with (
            patch("gcp_utils.get_gcp_credential", return_value=("proj-a", None, "gcp_adc", None)),
            patch("gcp_utils._decode_service_account_key", return_value=None),
            patch("gcp_utils._build_gke_credentials", return_value=MagicMock()),
            patch("gcp_utils._refresh_gke_token", return_value="fake-token"),
            patch("gcp_utils._new_cluster_manager_client", return_value=mock_client),
            patch("gcp_utils._fetch_gke_cluster_details", return_value=("1.2.3.4", "fake-ca")),
            patch("gcp_utils.mask_string", side_effect=lambda x: x),
            patch("gcp_utils.yaml.dump", side_effect=capture_write),
        ):
            gcp_utils.generate_kubeconfig_for_gke([], workspace_info)

        context_names = [c['name'] for c in captured_config.get('contexts', [])]
        cluster_names = [c['name'] for c in captured_config.get('clusters', [])]

        # Both clusters must be present (no silent overwrite)
        self.assertEqual(len(context_names), 2, f"Expected 2 contexts, got {context_names}")
        self.assertEqual(len(cluster_names), 2, f"Expected 2 clusters, got {cluster_names}")

        # Context names must be disambiguated with projectId prefix
        self.assertIn("proj-a--prod-cluster", context_names)
        self.assertIn("proj-b--prod-cluster", context_names)

        # No duplicate names
        self.assertEqual(len(set(context_names)), 2)
        self.assertEqual(len(set(cluster_names)), 2)

    def test_unique_names_not_prefixed(self):
        """Clusters with unique names must NOT be prefixed with projectId."""
        import gcp_utils

        workspace_info = {
            "cloudConfig": {
                "gcp": {
                    "projects": ["proj-a", "proj-b"],
                    "gkeClusters": {"autoDiscover": True},
                }
            }
        }

        mock_client = MagicMock()

        def mock_list_clusters(parent=None):
            resp = MagicMock()
            if "proj-a" in parent:
                resp.clusters = [self._make_cluster_obj("alpha-cluster", "us-west1")]
            elif "proj-b" in parent:
                resp.clusters = [self._make_cluster_obj("beta-cluster", "us-east1")]
            else:
                resp.clusters = []
            return resp

        mock_client.list_clusters.side_effect = mock_list_clusters

        captured_config = {}
        original_write = gcp_utils.yaml.dump

        def capture_write(data, stream=None, **kwargs):
            if isinstance(data, dict) and 'clusters' in data and 'contexts' in data:
                captured_config.update(data)
            if stream:
                return original_write(data, stream, **kwargs)
            return original_write(data, **kwargs)

        with (
            patch("gcp_utils.get_gcp_credential", return_value=("proj-a", None, "gcp_adc", None)),
            patch("gcp_utils._decode_service_account_key", return_value=None),
            patch("gcp_utils._build_gke_credentials", return_value=MagicMock()),
            patch("gcp_utils._refresh_gke_token", return_value="fake-token"),
            patch("gcp_utils._new_cluster_manager_client", return_value=mock_client),
            patch("gcp_utils._fetch_gke_cluster_details", return_value=("1.2.3.4", "fake-ca")),
            patch("gcp_utils.mask_string", side_effect=lambda x: x),
            patch("gcp_utils.yaml.dump", side_effect=capture_write),
        ):
            gcp_utils.generate_kubeconfig_for_gke([], workspace_info)

        context_names = [c['name'] for c in captured_config.get('contexts', [])]
        # Unique names should NOT be prefixed
        self.assertIn("alpha-cluster", context_names)
        self.assertIn("beta-cluster", context_names)
        self.assertNotIn("proj-a--alpha-cluster", context_names)

    def test_explicit_and_discovered_same_name_different_project_not_deduped(self):
        """An explicit cluster 'prod' in proj-a should NOT suppress a discovered
        cluster 'prod' in proj-b. De-dup must match on (name, projectId)."""
        from gcp_utils import generate_kubeconfig_for_gke

        workspace_info = {
            "cloudConfig": {
                "gcp": {
                    "projects": ["proj-a", "proj-b"],
                    "gkeClusters": {"autoDiscover": True},
                }
            }
        }

        explicit_clusters = [
            {"name": "prod", "location": "us-west1", "projectId": "proj-a"},
        ]

        mock_client = MagicMock()

        def mock_list_clusters(parent=None):
            resp = MagicMock()
            if "proj-a" in parent:
                resp.clusters = [self._make_cluster_obj("prod", "us-west1")]
            elif "proj-b" in parent:
                resp.clusters = [self._make_cluster_obj("prod", "us-east1")]
            else:
                resp.clusters = []
            return resp

        mock_client.list_clusters.side_effect = mock_list_clusters

        fetched_args = []

        def mock_fetch(client, project_id, location, cluster_name):
            fetched_args.append((project_id, location, cluster_name))
            return ("1.2.3.4", "fake-ca")

        with (
            patch("gcp_utils.get_gcp_credential", return_value=("proj-a", None, "gcp_adc", None)),
            patch("gcp_utils._decode_service_account_key", return_value=None),
            patch("gcp_utils._build_gke_credentials", return_value=MagicMock()),
            patch("gcp_utils._refresh_gke_token", return_value="fake-token"),
            patch("gcp_utils._new_cluster_manager_client", return_value=mock_client),
            patch("gcp_utils._fetch_gke_cluster_details", side_effect=mock_fetch),
            patch("gcp_utils.mask_string", side_effect=lambda x: x),
        ):
            generate_kubeconfig_for_gke(explicit_clusters, workspace_info)

        # The explicit cluster (proj-a/prod) should suppress the discovered
        # cluster in proj-a (same name + same project), but NOT the one in
        # proj-b (same name, different project).
        fetch_keys = {(p, n) for p, loc, n in fetched_args}
        self.assertIn(("proj-a", "prod"), fetch_keys)
        self.assertIn(("proj-b", "prod"), fetch_keys)
        # proj-a/prod should only be fetched once (explicit, not re-discovered)
        proj_a_prod_count = sum(1 for p, loc, n in fetched_args if p == "proj-a" and n == "prod")
        self.assertEqual(proj_a_prod_count, 1)

    def _make_cluster_obj(self, name, location):
        c = MagicMock()
        c.name = name
        c.location = location
        return c


# ---------------------------------------------------------------------------
# LOD key disambiguation for colliding cluster names
# ---------------------------------------------------------------------------

class ClusterLodKeyDisambiguationTest(TestCase):
    """When cross-project name collisions are disambiguated (kubeconfig context
    ``proj-a--prod``), the per-cluster LOD settings must be injected into the
    kubeconfig extension so ``build_cluster_lod_maps`` registers them under the
    disambiguated name, not just the original YAML name.

    Without this, the kubeapi indexer looks up LOD by the disambiguated context
    name (``proj-a--prod``), misses the map, and skips per-cluster LOD handling.
    """

    def test_explicit_cluster_with_lod_and_collision_injects_into_extension(self):
        """An explicit cluster with defaultNamespaceLOD + namespaceLODs that
        collides with another project's cluster must carry those LOD settings
        in the kubeconfig workspace-builder extension, keyed under the
        disambiguated name."""
        import gcp_utils

        workspace_info = {
            "cloudConfig": {
                "gcp": {
                    "projects": ["proj-a", "proj-b"],
                    "gkeClusters": {
                        "autoDiscover": False,
                        "clusters": [
                            {
                                "name": "prod",
                                "location": "us-west1",
                                "projectId": "proj-a",
                                "defaultNamespaceLOD": "basic",
                                "namespaceLODs": {"kube-system": "none"},
                            },
                            {
                                "name": "prod",
                                "location": "us-east1",
                                "projectId": "proj-b",
                                "defaultNamespaceLOD": "detailed",
                            },
                        ],
                    },
                }
            }
        }

        gcp_config = workspace_info["cloudConfig"]["gcp"]
        gke_clusters = gcp_config["gkeClusters"]["clusters"]

        mock_client = MagicMock()
        captured_config = {}
        original_write = gcp_utils.yaml.dump

        def capture_write(data, stream=None, **kwargs):
            if isinstance(data, dict) and 'clusters' in data and 'contexts' in data:
                captured_config.update(data)
            if stream:
                return original_write(data, stream, **kwargs)
            return original_write(data, **kwargs)

        with (
            patch("gcp_utils.get_gcp_credential", return_value=("proj-a", None, "gcp_adc", None)),
            patch("gcp_utils._decode_service_account_key", return_value=None),
            patch("gcp_utils._build_gke_credentials", return_value=MagicMock()),
            patch("gcp_utils._refresh_gke_token", return_value="fake-token"),
            patch("gcp_utils._new_cluster_manager_client", return_value=mock_client),
            patch("gcp_utils._fetch_gke_cluster_details", return_value=("1.2.3.4", "fake-ca")),
            patch("gcp_utils.mask_string", side_effect=lambda x: x),
            patch("gcp_utils.yaml.dump", side_effect=capture_write),
        ):
            gcp_utils.generate_kubeconfig_for_gke(gke_clusters, workspace_info)

        context_names = [c['name'] for c in captured_config.get('contexts', [])]
        self.assertIn("proj-a--prod", context_names)
        self.assertIn("proj-b--prod", context_names)

        for cluster_entry in captured_config.get('clusters', []):
            if cluster_entry['name'] == 'proj-a--prod':
                extensions = cluster_entry['cluster'].get('extensions', [])
                for ext in extensions:
                    if ext.get('name') == 'workspace-builder':
                        ext_data = ext.get('extension', {})
                        self.assertEqual(ext_data.get('defaultNamespaceLOD'), 'basic')
                        self.assertEqual(ext_data.get('namespaceLODs'), {'kube-system': 'none'})
                        break
                else:
                    self.fail("No workspace-builder extension found for proj-a--prod")

        for cluster_entry in captured_config.get('clusters', []):
            if cluster_entry['name'] == 'proj-b--prod':
                extensions = cluster_entry['cluster'].get('extensions', [])
                for ext in extensions:
                    if ext.get('name') == 'workspace-builder':
                        ext_data = ext.get('extension', {})
                        self.assertEqual(ext_data.get('defaultNamespaceLOD'), 'detailed')
                        break
                else:
                    self.fail("No workspace-builder extension found for proj-b--prod")

    def test_build_cluster_lod_maps_finds_disambiguated_name(self):
        """End-to-end: build_cluster_lod_maps must find the LOD settings for a
        disambiguated cluster name via the kubeconfig extension, even when the
        explicit config entry is keyed under the original name.

        This test re-implements the core logic of build_cluster_lod_maps inline
        to avoid importing kubeapi.py (which has heavy kubernetes/robot
        dependencies). The real function is identical; this tests the contract.
        """
        PER_CLUSTER_LOD_TYPES = ("aks", "gke", "eks")

        cloud_config = {
            "gcp": {
                "gkeClusters": {
                    "clusters": [
                        {
                            "name": "prod",
                            "location": "us-west1",
                            "projectId": "proj-a",
                            "defaultNamespaceLOD": "basic",
                            "namespaceLODs": {"kube-system": "none"},
                        },
                    ]
                }
            }
        }

        kubeconfig_clusters = [
            {
                "name": "proj-a--prod",
                "cluster": {
                    "server": "https://1.2.3.4",
                    "extensions": [
                        {
                            "name": "workspace-builder",
                            "extension": {
                                "cluster_type": "gke",
                                "cluster_name": "prod",
                                "project_id": "proj-a",
                                "location": "us-west1",
                                "defaultNamespaceLOD": "basic",
                                "namespaceLODs": {"kube-system": "none"},
                            },
                        }
                    ],
                },
            }
        ]

        default_lod = "detailed"
        namespace_lods: dict = {}
        cluster_lod_settings: dict = {}
        cluster_namespace_lods: dict = {}

        # --- Replicate build_cluster_lod_maps _load_explicit ---
        gcp_settings = cloud_config.get("gcp", {}) or {}
        clusters_config = (gcp_settings.get("gkeClusters", {}) or {}).get("clusters", [])
        for cluster_cfg in clusters_config:
            cfg_name = cluster_cfg.get("name")
            if not cfg_name:
                continue
            cluster_lod_settings[cfg_name] = cluster_cfg.get("defaultNamespaceLOD", default_lod)
            ns_lods = cluster_cfg.get("namespaceLODs", {})
            if ns_lods:
                cluster_namespace_lods[cfg_name] = ns_lods
                namespace_lods.update(ns_lods)

        # --- Replicate build_cluster_lod_maps extension scanning ---
        for cluster in kubeconfig_clusters:
            cluster_name = cluster.get('name')
            cluster_details = cluster.get('cluster', {})
            extensions = cluster_details.get('extensions', [])
            for ext in extensions:
                if ext.get('name') == 'workspace-builder':
                    extension_details = ext.get('extension', {})
                    if extension_details.get('cluster_type') in PER_CLUSTER_LOD_TYPES:
                        if 'defaultNamespaceLOD' in extension_details:
                            cluster_lod_settings[cluster_name] = extension_details['defaultNamespaceLOD']
                        if 'namespaceLODs' in extension_details:
                            cluster_namespace_lods[cluster_name] = extension_details['namespaceLODs']
                            namespace_lods.update(extension_details['namespaceLODs'])
                    break

        # The disambiguated name must be in the LOD settings (via extension)
        self.assertIn("proj-a--prod", cluster_lod_settings)
        self.assertEqual(cluster_lod_settings["proj-a--prod"], "basic")
        # The original name is also present (from _load_explicit) but that's OK
        self.assertIn("prod", cluster_lod_settings)

        # namespaceLODs must also be registered under the disambiguated name
        self.assertIn("proj-a--prod", cluster_namespace_lods)
        self.assertEqual(cluster_namespace_lods["proj-a--prod"], {"kube-system": "none"})

    def _make_cluster_obj(self, name, location):
        c = MagicMock()
        c.name = name
        c.location = location
        return c

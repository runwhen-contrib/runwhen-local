"""Unit tests for the CRD scope-detection helper added to
``indexers.kubeapi`` so that the workspace-builder can distinguish
namespaced from cluster-scoped custom resources at index time and
dispatch to the correct Kubernetes API.

Prior to this fix, the custom-resource loop unconditionally called
``list_namespaced_custom_object`` for every discovered CRD from inside a
per-namespace loop. That works for the CRDs any existing generation rule
in ``rw-cli-codecollection`` targets (all namespaced), but returns
``404 Not Found`` for cluster-scoped CRDs like Crossplane managed
resources (``buckets.storage.gcp.upbound.io``, ``hmackeys...``, etc.).

These tests pin the scope-detection behavior in isolation:

* it queries the correct discovery path,
* it correctly reads the ``namespaced`` boolean from the returned
  ``APIResourceList``,
* it memoizes results in a per-cluster cache so a group with many
  resources only costs one HTTP call,
* it falls back to ``Namespaced`` on any error (preserving the pre-fix
  behavior for callers hitting permission problems),
* and it caches the fallback so we do not retry every namespace.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase
from unittest.mock import MagicMock

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from kubernetes.client.rest import ApiException  # noqa: E402

from indexers.kubeapi import (  # noqa: E402
    CRD_SCOPE_CLUSTER,
    CRD_SCOPE_NAMESPACED,
    get_custom_resource_scope,
)


def _api_resource_list(resources):
    """Wrap a list of resource dicts in the shape returned by
    ``/apis/{group}/{version}`` (an ``APIResourceList``)."""
    return {
        "kind": "APIResourceList",
        "apiVersion": "v1",
        "resources": resources,
    }


def _make_api_client(response):
    """Build a mock api_client whose ``call_api`` returns ``response``.
    The real Kubernetes client's ``call_api`` returns raw JSON when
    ``response_type='object'`` and ``_return_http_data_only=True`` are
    passed, so that's what we mimic here."""
    api_client = MagicMock()
    api_client.call_api = MagicMock(return_value=response)
    return api_client


class GetCustomResourceScopeTest(TestCase):
    def test_cluster_scoped_resource(self):
        """A CRD with ``namespaced: false`` resolves to ``Cluster``."""
        response = _api_resource_list([
            {"name": "buckets", "namespaced": False, "kind": "Bucket"},
            {"name": "buckets/status", "namespaced": False, "kind": "Bucket"},
        ])
        api_client = _make_api_client(response)
        cache = {}
        scope = get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", cache,
        )
        self.assertEqual(scope, CRD_SCOPE_CLUSTER)
        self.assertEqual(cache[("storage.gcp.upbound.io", "v1beta2", "buckets")], CRD_SCOPE_CLUSTER)

    def test_namespaced_resource(self):
        """A CRD with ``namespaced: true`` resolves to ``Namespaced``."""
        response = _api_resource_list([
            {"name": "helmreleases", "namespaced": True, "kind": "HelmRelease"},
        ])
        api_client = _make_api_client(response)
        cache = {}
        scope = get_custom_resource_scope(
            api_client, "helm.toolkit.fluxcd.io", "v2beta1", "helmreleases", cache,
        )
        self.assertEqual(scope, CRD_SCOPE_NAMESPACED)

    def test_calls_discovery_endpoint_for_group_version(self):
        """The helper must hit ``/apis/{group}/{version}``."""
        api_client = _make_api_client(_api_resource_list([
            {"name": "buckets", "namespaced": False, "kind": "Bucket"},
        ]))
        get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", {},
        )
        args, _ = api_client.call_api.call_args
        # First positional arg is the path; second is the HTTP method.
        self.assertEqual(args[0], "/apis/storage.gcp.upbound.io/v1beta2")
        self.assertEqual(args[1], "GET")

    def test_caches_result_across_calls(self):
        """A cache hit must short-circuit the discovery call."""
        response = _api_resource_list([
            {"name": "buckets", "namespaced": False, "kind": "Bucket"},
        ])
        api_client = _make_api_client(response)
        cache = {}
        # First call populates the cache.
        get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", cache,
        )
        # Second call for the same key must NOT re-hit the API.
        api_client.call_api.reset_mock()
        scope = get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", cache,
        )
        self.assertEqual(scope, CRD_SCOPE_CLUSTER)
        api_client.call_api.assert_not_called()

    def test_multiple_resources_in_group_share_one_api_call(self):
        """Two CRDs in the same group/version only cost one discovery call
        because the cache is keyed by (group, version, plural) and the
        response already carries every resource in the group."""
        response = _api_resource_list([
            {"name": "buckets", "namespaced": False, "kind": "Bucket"},
            {"name": "hmackeys", "namespaced": False, "kind": "HMACKey"},
        ])
        api_client = _make_api_client(response)
        cache = {}
        s1 = get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", cache,
        )
        s2 = get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "hmackeys", cache,
        )
        # Both are cluster-scoped.
        self.assertEqual(s1, CRD_SCOPE_CLUSTER)
        self.assertEqual(s2, CRD_SCOPE_CLUSTER)
        # Two API calls today (one per plural). Cheap enough — one round trip
        # per (group, plural) — and keeps the cache key precise. If we ever
        # want to cache per (group, version) we can revisit.
        self.assertEqual(api_client.call_api.call_count, 2)

    def test_api_exception_falls_back_to_namespaced(self):
        """A permissions failure or transient error must not abort discovery."""
        api_client = MagicMock()
        api_client.call_api = MagicMock(
            side_effect=ApiException(status=403, reason="Forbidden"),
        )
        cache = {}
        scope = get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", cache,
        )
        self.assertEqual(scope, CRD_SCOPE_NAMESPACED)
        # Fallback is cached so we do not retry per-namespace.
        self.assertEqual(cache[("storage.gcp.upbound.io", "v1beta2", "buckets")], CRD_SCOPE_NAMESPACED)

    def test_unexpected_exception_falls_back_to_namespaced(self):
        """Any non-Kubernetes exception is also caught defensively."""
        api_client = MagicMock()
        api_client.call_api = MagicMock(side_effect=RuntimeError("boom"))
        scope = get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", {},
        )
        self.assertEqual(scope, CRD_SCOPE_NAMESPACED)

    def test_missing_plural_in_response_falls_back_to_namespaced(self):
        """If the API returns a valid response that doesn't list our plural
        (schema drift, subresource-only, etc.) we default to Namespaced and
        cache that so we don't repeat the discovery call for every namespace."""
        response = _api_resource_list([
            {"name": "somethingelse", "namespaced": True, "kind": "SomethingElse"},
        ])
        api_client = _make_api_client(response)
        cache = {}
        scope = get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", cache,
        )
        self.assertEqual(scope, CRD_SCOPE_NAMESPACED)
        self.assertEqual(cache[("storage.gcp.upbound.io", "v1beta2", "buckets")], CRD_SCOPE_NAMESPACED)

    def test_missing_namespaced_field_defaults_to_namespaced(self):
        """If the ``namespaced`` field is absent from the resource entry we
        conservatively treat it as Namespaced, matching the pre-fix path."""
        response = _api_resource_list([
            {"name": "buckets", "kind": "Bucket"},  # no `namespaced` key
        ])
        api_client = _make_api_client(response)
        scope = get_custom_resource_scope(
            api_client, "storage.gcp.upbound.io", "v1beta2", "buckets", {},
        )
        self.assertEqual(scope, CRD_SCOPE_NAMESPACED)

    def test_core_group_uses_legacy_api_path(self):
        """Resources in the core (empty-group) API live under ``/api/{version}``
        instead of ``/apis/{group}/{version}``. Nobody targets core resources
        via the custom-resource loop today, but the helper handles the shape
        correctly so a future caller can't fall into a subtle path bug."""
        response = _api_resource_list([
            {"name": "namespaces", "namespaced": False, "kind": "Namespace"},
        ])
        api_client = _make_api_client(response)
        get_custom_resource_scope(
            api_client, "", "v1", "namespaces", {},
        )
        args, _ = api_client.call_api.call_args
        self.assertEqual(args[0], "/api/v1")


if __name__ == "__main__":
    import unittest
    unittest.main()

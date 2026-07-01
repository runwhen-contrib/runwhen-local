"""Unit tests for the CRD-aware lookup in
``enrichers.kubernetes.KubernetesPlatformHandler.get_resources``.

These pin the change that made custom-resource discovery first-class:

* Each CRD lives in its own registry bucket keyed by
  ``{plural}.{group}`` (e.g. ``buckets.storage.gcp.upbound.io``) rather
  than being lumped under the coarse ``"custom"`` bucket.
* A generation rule whose spec resolves to ``resource_type_name ==
  "custom"`` (the ``KubernetesResourceType.CUSTOM.value`` sentinel) is
  routed to the specific bucket via ``{kind}.{group}`` \u2014 no
  linear-search-and-filter pass over every discovered CRD instance.
* Built-in Kubernetes types are untouched.
* Version pinning still works when a rule pins ``plural.group/vX``.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from resources import Registry, REGISTRY_PROPERTY_NAME  # noqa: E402
from enrichers.kubernetes import KubernetesPlatformHandler  # noqa: E402
from indexers.kubetypes import (  # noqa: E402
    KUBERNETES_PLATFORM,
    KubernetesResourceType,
    KubernetesResourceTypeSpec,
)


class _FakeContext:
    """Minimal Context stand-in exposing only ``get_property``."""

    def __init__(self, registry: Registry):
        self._props = {REGISTRY_PROPERTY_NAME: registry}

    def get_property(self, name):
        return self._props.get(name)


def _register_crd(registry: Registry, plural: str, group: str, version: str,
                  name: str, qualified_name: str):
    """Register a CRD instance under its per-CRD registry bucket, matching
    what ``indexers.kubeapi`` does at index time."""
    return registry.add_resource(
        KUBERNETES_PLATFORM,
        f"{plural}.{group}",
        name,
        qualified_name,
        {
            "plural_name": plural,
            "group": group,
            "version": version,
            "kind": plural.rstrip("s").capitalize(),
        },
    )


class GetResourcesForCustomTypeTest(TestCase):
    def setUp(self):
        self.registry = Registry()
        self.handler = KubernetesPlatformHandler()

    def _spec(self, plural: str, group: str, version=None):
        return KubernetesResourceTypeSpec(
            KUBERNETES_PLATFORM,
            KubernetesResourceType.CUSTOM.value,
            group,
            version,
            plural,
        )

    def test_returns_only_matching_crd_instances(self):
        """A spec for ``buckets.storage.gcp.upbound.io`` returns the
        Bucket instances but not the HelmRelease instances -- because
        they live in different registry buckets, not because we filter
        after the fetch."""
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta2", "b1", "default/buckets.storage.gcp.upbound.io/b1")
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta2", "b2", "default/buckets.storage.gcp.upbound.io/b2")
        _register_crd(self.registry, "helmreleases", "helm.toolkit.fluxcd.io",
                      "v2beta1", "hr1", "default/kube-system/helmreleases.helm.toolkit.fluxcd.io/hr1")

        spec = self._spec("buckets", "storage.gcp.upbound.io")
        resources = list(self.handler.get_resources(spec, _FakeContext(self.registry)))

        self.assertEqual(sorted(r.name for r in resources), ["b1", "b2"])

    def test_empty_result_for_unknown_crd(self):
        """A spec pointing at a CRD that was never indexed returns [],
        not an exception."""
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta2", "b1", "default/buckets.storage.gcp.upbound.io/b1")

        spec = self._spec("hmackeys", "storage.gcp.upbound.io")
        resources = list(self.handler.get_resources(spec, _FakeContext(self.registry)))

        self.assertEqual(resources, [])

    def test_version_pinned_spec_filters_out_other_versions(self):
        """A spec that pins a version returns only instances stored with
        that version. This exercises the version-filter branch that
        survived the refactor."""
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta1", "b_v1", "default/buckets.storage.gcp.upbound.io/b_v1")
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta2", "b_v2", "default/buckets.storage.gcp.upbound.io/b_v2")

        spec = self._spec("buckets", "storage.gcp.upbound.io", version="v1beta2")
        resources = list(self.handler.get_resources(spec, _FakeContext(self.registry)))

        self.assertEqual([r.name for r in resources], ["b_v2"])

    def test_star_version_matches_any(self):
        """A spec that uses the wildcard version ``'*'`` returns every
        registered instance regardless of version."""
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta1", "b_v1", "default/buckets.storage.gcp.upbound.io/b_v1")
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta2", "b_v2", "default/buckets.storage.gcp.upbound.io/b_v2")

        spec = self._spec("buckets", "storage.gcp.upbound.io", version="*")
        resources = list(self.handler.get_resources(spec, _FakeContext(self.registry)))

        self.assertEqual(sorted(r.name for r in resources), ["b_v1", "b_v2"])

    def test_unversioned_spec_matches_any_version(self):
        """A spec that omits the version (the common case) also matches
        every registered instance."""
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta1", "b_v1", "default/buckets.storage.gcp.upbound.io/b_v1")
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta2", "b_v2", "default/buckets.storage.gcp.upbound.io/b_v2")

        spec = self._spec("buckets", "storage.gcp.upbound.io")
        resources = list(self.handler.get_resources(spec, _FakeContext(self.registry)))

        self.assertEqual(sorted(r.name for r in resources), ["b_v1", "b_v2"])

    def test_builtin_kubernetes_type_lookup_is_unchanged(self):
        """A spec for a built-in K8s resource type (e.g. ``deployment``)
        still looks up that literal type name -- the CRD-lookup branch
        must not steal built-in traffic."""
        self.registry.add_resource(
            KUBERNETES_PLATFORM, "deployment", "d1",
            "default/kube-system/d1", {"cluster": "default"},
        )
        spec = KubernetesResourceTypeSpec(
            KUBERNETES_PLATFORM,
            KubernetesResourceType.DEPLOYMENT.value,
            None, None, None,
        )
        resources = list(self.handler.get_resources(spec, _FakeContext(self.registry)))
        self.assertEqual([r.name for r in resources], ["d1"])

    def test_resource_type_name_field_is_the_crd_specific_bucket(self):
        """Regression: each registered resource must expose
        ``resource_type.name == "{plural}.{group}"`` so the
        ``kubernetes-tags.yaml`` template surfaces the proper CRD type."""
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta2", "b1", "default/buckets.storage.gcp.upbound.io/b1")
        spec = self._spec("buckets", "storage.gcp.upbound.io")
        [bucket] = self.handler.get_resources(spec, _FakeContext(self.registry))
        self.assertEqual(bucket.resource_type.name, "buckets.storage.gcp.upbound.io")

    def test_no_resource_type_custom_bucket_is_ever_looked_up(self):
        """Sanity: even if some other CRD indexer erroneously wrote
        instances under the legacy ``custom`` bucket, our lookup path
        never touches that bucket for a CUSTOM spec. This documents the
        new invariant."""
        self.registry.add_resource(
            KUBERNETES_PLATFORM,
            KubernetesResourceType.CUSTOM.value,  # legacy bucket
            "legacy",
            "default/legacy",
            {"plural_name": "buckets", "group": "storage.gcp.upbound.io"},
        )
        _register_crd(self.registry, "buckets", "storage.gcp.upbound.io",
                      "v1beta2", "b1", "default/buckets.storage.gcp.upbound.io/b1")

        spec = self._spec("buckets", "storage.gcp.upbound.io")
        resources = list(self.handler.get_resources(spec, _FakeContext(self.registry)))
        # Only the properly-registered resource comes back; the legacy
        # bucket is ignored (the new lookup key is plural.group, not
        # "custom").
        self.assertEqual([r.name for r in resources], ["b1"])


if __name__ == "__main__":
    import unittest
    unittest.main()

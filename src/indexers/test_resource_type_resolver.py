"""Unit tests for alias-aware resource-type resolution.

These pin the Phase-1 fix for the CloudQuery-retirement naming mismatch:

* ``resource_type_resolver`` maps a requested type name to the full
  accepted-name set (canonical CloudQuery name + every legacy/alias name) for
  cloud platforms, and returns ``None`` for non-registry platforms
  (Kubernetes, azure_devops, custom) so callers fall back to exact matching.

* The generation-rule matcher (``PlatformHandler.get_resources``) therefore
  matches a resource against a rule whenever the rule's requested type is any
  accepted name of the resource's type, REGARDLESS of which accepted name the
  indexer stored the resource under. This is what restores the dropped Azure
  VM / Key Vault SLXs:
    - rule asks ``azure_compute_virtual_machines`` (canonical) but the indexer
      stored the VM under the legacy ``virtual_machine``;
    - rule asks ``azure_keyvault_keyvault`` (SINGULAR) but the indexer stored
      the vault under ``azure_keyvault_vaults`` and the canonical CQ table is
      the PLURAL ``azure_keyvault_keyvaults``.

* Kubernetes / custom resource-type names keep working via exact-string match.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from resources import Registry, ResourceTypeSpec, REGISTRY_PROPERTY_NAME  # noqa: E402
from resource_type_resolver import (  # noqa: E402
    accepted_resource_type_names,
    is_registry_backed,
    resolve_lookup_names,
)


class _FakeContext:
    """Minimal Context stand-in exposing only ``get_property`` for the registry."""

    def __init__(self, registry: Registry):
        self._props = {REGISTRY_PROPERTY_NAME: registry}

    def get_property(self, name):
        return self._props.get(name)

    def set_property(self, name, value):
        self._props[name] = value


class ResolverTests(TestCase):
    def test_known_platforms_are_registry_backed(self) -> None:
        self.assertTrue(is_registry_backed("azure"))
        self.assertTrue(is_registry_backed("gcp"))
        self.assertTrue(is_registry_backed("aws"))
        self.assertFalse(is_registry_backed("kubernetes"))
        self.assertFalse(is_registry_backed("azure_devops"))

    def test_azure_vm_canonical_includes_legacy_stored_name(self) -> None:
        names = accepted_resource_type_names("azure", "azure_compute_virtual_machines")
        self.assertIsNotNone(names)
        self.assertIn("azure_compute_virtual_machines", names)
        self.assertIn("virtual_machine", names)

    def test_azure_keyvault_singular_resolves_to_full_set(self) -> None:
        # The exact failure mode from the bug: rules ask for the SINGULAR.
        names = accepted_resource_type_names("azure", "azure_keyvault_keyvault")
        self.assertIsNotNone(names)
        self.assertIn("azure_keyvault_keyvaults", names)  # canonical CQ (plural)
        self.assertIn("azure_keyvault_vaults", names)      # legacy stored name
        self.assertIn("azure_keyvault_keyvault", names)    # singular rules use

    def test_gcp_and_aws_anchor_aliases_resolve(self) -> None:
        gcp = accepted_resource_type_names("gcp", "project")
        self.assertIn("gcp_projects", gcp)
        self.assertIn("project", gcp)
        aws = accepted_resource_type_names("aws", "account")
        self.assertIn("aws_iam_accounts", aws)
        self.assertIn("account", aws)

    def test_non_registry_platforms_return_none(self) -> None:
        # Kubernetes / azure_devops / custom -> exact-string fallback.
        self.assertIsNone(accepted_resource_type_names("kubernetes", "deployments"))
        self.assertIsNone(accepted_resource_type_names("azure_devops", "anything"))

    def test_unknown_cloud_name_returns_none(self) -> None:
        self.assertIsNone(accepted_resource_type_names("azure", "not_a_real_type"))
        self.assertIsNone(accepted_resource_type_names("azure", ""))

    def test_resolve_lookup_names_falls_back_to_exact(self) -> None:
        # Unknown / non-registry -> just the requested name (exact match).
        self.assertEqual(
            resolve_lookup_names("kubernetes", "deployments"), ("deployments",)
        )
        self.assertEqual(
            resolve_lookup_names("azure", "not_a_real_type"), ("not_a_real_type",)
        )
        # Known cloud type -> full accepted-name set.
        self.assertIn(
            "virtual_machine",
            resolve_lookup_names("azure", "azure_compute_virtual_machines"),
        )


class MatcherAliasAwarenessTests(TestCase):
    """Exercise the actual generation-rule matcher entrypoint
    (``PlatformHandler.get_resources``) against a registry whose resources are
    stored under the legacy names the indexer currently emits."""

    def setUp(self) -> None:
        from enrichers.azure import AzurePlatformHandler

        self.handler = AzurePlatformHandler()
        self.registry = Registry()
        # Store resources under the LEGACY names the azureapi indexer emits
        # today (aliases[0]); the rule will ask for the canonical / singular.
        self.registry.add_resource(
            "azure", "virtual_machine", "vm1", "rg1/vm1", {"tags": {}}
        )
        self.registry.add_resource(
            "azure", "azure_keyvault_vaults", "kv1", "rg1/kv1", {"tags": {}}
        )
        # A type whose stored name already agrees with the canonical CQ name.
        self.registry.add_resource(
            "azure", "azure_storage_accounts", "sa1", "rg1/sa1", {"tags": {}}
        )
        self.context = _FakeContext(self.registry)

    def _get(self, requested_name: str):
        spec = ResourceTypeSpec("azure", requested_name)
        return list(self.handler.get_resources(spec, self.context))

    def test_rule_canonical_vm_matches_legacy_stored_vm(self) -> None:
        resources = self._get("azure_compute_virtual_machines")
        self.assertEqual([r.name for r in resources], ["vm1"])

    def test_rule_legacy_vm_name_still_matches(self) -> None:
        resources = self._get("virtual_machine")
        self.assertEqual([r.name for r in resources], ["vm1"])

    def test_rule_keyvault_singular_matches_legacy_stored_vault(self) -> None:
        # azure_keyvault_keyvault (singular) -> stored azure_keyvault_vaults.
        resources = self._get("azure_keyvault_keyvault")
        self.assertEqual([r.name for r in resources], ["kv1"])

    def test_rule_keyvault_canonical_plural_matches(self) -> None:
        resources = self._get("azure_keyvault_keyvaults")
        self.assertEqual([r.name for r in resources], ["kv1"])

    def test_agreeing_name_still_matches_exactly_once(self) -> None:
        resources = self._get("azure_storage_accounts")
        self.assertEqual([r.name for r in resources], ["sa1"])

    def test_unknown_type_returns_nothing(self) -> None:
        self.assertEqual(self._get("azure_compute_disks"), [])

    def test_kubernetes_custom_type_uses_exact_match(self) -> None:
        # The base handler (used for non-k8s platforms too) must fall back to
        # exact-string matching for names no cloud registry knows. We model a
        # custom platform whose stored name equals the requested name.
        from enrichers.generation_rule_types import PlatformHandler

        registry = Registry()
        registry.add_resource("custom", "my_custom_kind", "c1", "c1", {})
        ctx = _FakeContext(registry)
        handler = PlatformHandler("custom")
        exact = list(handler.get_resources(ResourceTypeSpec("custom", "my_custom_kind"), ctx))
        self.assertEqual([r.name for r in exact], ["c1"])
        # A different name must NOT match (no fuzzy/alias behavior for custom).
        miss = list(handler.get_resources(ResourceTypeSpec("custom", "other_kind"), ctx))
        self.assertEqual(miss, [])

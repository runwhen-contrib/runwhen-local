"""
Unit tests for the AWS resource-type registry loader and the spec layer it
powers (``indexers.awsapi_resource_types``).

These tests pin the contract that:

1. The loader produces a fully-populated registry from the YAML on disk (1119
   entries today, with stable metadata fields and alias resolution).

2. The hand-written typed-collector specs in ``awsapi_resource_types`` resolve
   the legacy ``resource_type_name`` values generation rules expect
   (``account``, ``ec2_instance``) and the canonical CQ table names.

3. Aliases route to the canonical CQ table name; CloudFormation resource types
   reverse-map back to the owning table.
"""

from __future__ import annotations

import os
import sys
import tempfile
import textwrap
from pathlib import Path
from unittest import TestCase

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from indexers.aws_resource_type_registry import (  # noqa: E402
    find_entry,
    load_registry,
    load_registry_from_path,
    reset_cache,
)


class RegistryLoaderTests(TestCase):
    def setUp(self) -> None:
        reset_cache()

    def tearDown(self) -> None:
        reset_cache()

    def test_default_registry_loads_with_expected_metadata(self) -> None:
        registry = load_registry()
        self.assertGreater(len(registry), 1000)  # 1119 today, allow for growth
        self.assertEqual(len(registry), registry.metadata.total_tables)
        self.assertGreaterEqual(registry.metadata.typed_collectors, 1)
        self.assertEqual(
            registry.metadata.generator,
            "scripts/aws/sync_aws_resource_type_registry.py",
        )
        self.assertTrue(
            registry.metadata.source.startswith("https://"),
            f"metadata.source should be a URL, got {registry.metadata.source!r}",
        )

    def test_registry_lookup_by_canonical_name(self) -> None:
        registry = load_registry()
        accounts = registry.find("aws_iam_accounts")
        self.assertIsNotNone(accounts)
        self.assertEqual(accounts.cloudquery_table_name, "aws_iam_accounts")
        # The synthesized account anchor has no Cloud Control type.
        self.assertIsNone(accounts.cfn_type)
        self.assertTrue(accounts.mandatory)
        self.assertTrue(accounts.typed_collector)

    def test_registry_lookup_by_alias(self) -> None:
        registry = load_registry()
        legacy_account = registry.find("account")
        self.assertIsNotNone(legacy_account)
        self.assertEqual(legacy_account.cloudquery_table_name, "aws_iam_accounts")

        legacy_instance = registry.find("ec2_instance")
        self.assertIsNotNone(legacy_instance)
        self.assertEqual(
            legacy_instance.cloudquery_table_name, "aws_ec2_instances"
        )

    def test_registry_find_by_cfn_type(self) -> None:
        registry = load_registry()
        entry = registry.find_by_cfn_type("AWS::EC2::Instance")
        self.assertIsNotNone(entry)
        self.assertEqual(entry.cloudquery_table_name, "aws_ec2_instances")
        # Case-insensitive.
        entry2 = registry.find_by_cfn_type("aws::ec2::instance")
        self.assertIs(entry2, entry)

    def test_registry_unknown_name_returns_none(self) -> None:
        self.assertIsNone(load_registry().find("not_a_real_table"))
        self.assertIsNone(load_registry().find(""))

    def test_module_level_find_entry_uses_cache(self) -> None:
        e1 = find_entry("account")
        e2 = find_entry("aws_iam_accounts")
        self.assertIs(e1, e2)

    def test_membership_protocol(self) -> None:
        registry = load_registry()
        self.assertIn("account", registry)
        self.assertIn("aws_iam_accounts", registry)
        self.assertNotIn("nope", registry)
        self.assertNotIn(123, registry)

    def test_all_cfn_types_are_aws_prefixed(self) -> None:
        registry = load_registry()
        cfn_types = registry.all_cfn_types()
        self.assertGreater(len(cfn_types), 0)
        for value in cfn_types:
            self.assertIsInstance(value, str)
            self.assertTrue(value.startswith("AWS::"), value)
            # CFN type names always have three segments: AWS::Service::Entity.
            self.assertEqual(value.count("::"), 2, value)

    def test_typed_collector_tables_match_registry_flag(self) -> None:
        registry = load_registry()
        typed = set(registry.typed_collector_tables())
        for entry in registry:
            if entry.typed_collector:
                self.assertIn(entry.cloudquery_table_name, typed)
            else:
                self.assertNotIn(entry.cloudquery_table_name, typed)

    def test_mandatory_includes_accounts(self) -> None:
        registry = load_registry()
        self.assertIn("aws_iam_accounts", registry.mandatory_tables())

    def test_match_names_include_canonical_plus_aliases(self) -> None:
        registry = load_registry()
        accounts = registry.find("aws_iam_accounts")
        self.assertEqual(accounts.match_names[0], "aws_iam_accounts")
        self.assertIn("account", accounts.match_names)
        self.assertIn("aws_account", accounts.match_names)

    def test_match_names_are_pairwise_disjoint(self) -> None:
        registry = load_registry()
        all_names = registry.all_match_names()
        self.assertEqual(
            len(all_names),
            len(set(all_names)),
            "AWS accepted-name sets (match_names) are not pairwise disjoint",
        )

    def test_disjointness_invariant_raises_on_collision(self) -> None:
        from indexers.aws_resource_type_registry import (
            AwsResourceTypeEntry,
            AwsResourceTypeRegistry,
            AwsRegistryMetadata,
        )

        a = AwsResourceTypeEntry(
            cloudquery_table_name="aws_alpha",
            cfn_type="AWS::A::Thing",
            cfn_type_source="heuristic",
            category="a",
            aliases=("shared_name",),
            typed_collector=False,
            mandatory=False,
            match_names=("aws_alpha", "shared_name"),
        )
        b = AwsResourceTypeEntry(
            cloudquery_table_name="aws_beta",
            cfn_type="AWS::B::Thing",
            cfn_type_source="heuristic",
            category="b",
            aliases=(),
            typed_collector=False,
            mandatory=False,
            match_names=("aws_beta", "shared_name"),
        )
        with self.assertRaises(ValueError):
            AwsResourceTypeRegistry(metadata=AwsRegistryMetadata(), entries=(a, b))

    def test_regions_table_has_no_cfn_type(self) -> None:
        # Tables with no Cloud Control equivalent are pinned to null in the
        # overrides so generic discovery skips them.
        registry = load_registry()
        entry = registry.find("aws_regions")
        self.assertIsNotNone(entry)
        self.assertIsNone(entry.cfn_type)

    def test_every_table_resolves(self) -> None:
        # Parity guard: every canonical name resolves to itself (the gen-rule
        # contract that any CloudQuery table name is a valid resource_type).
        registry = load_registry()
        for name in registry.all_canonical_names():
            self.assertIsNotNone(registry.find(name), name)


class RegistryFromTempYamlTests(TestCase):
    """Loader behavior tests that don't depend on the shipped registry."""

    def _write(self, contents: str) -> Path:
        tmp = tempfile.NamedTemporaryFile(
            "w", suffix=".yaml", delete=False, encoding="utf-8"
        )
        tmp.write(textwrap.dedent(contents))
        tmp.close()
        path = Path(tmp.name)
        self.addCleanup(path.unlink, missing_ok=True)
        return path

    def test_minimal_registry_round_trips(self) -> None:
        path = self._write(
            """
            metadata:
              source: https://example.test
              snapshot_date: 2026-01-01
              total_tables: 1
              typed_collectors: 0
              cfn_types_assigned: 1
              generator: tests
              notes: synthetic
            types:
              aws_test_widgets:
                cfn_type: AWS::Test::Widget
                cfn_type_source: heuristic
                category: test
                aliases: []
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        self.assertEqual(len(registry), 1)
        entry = registry.find("aws_test_widgets")
        self.assertIsNotNone(entry)
        self.assertEqual(entry.cfn_type, "AWS::Test::Widget")

    def test_aliases_resolve_to_canonical(self) -> None:
        path = self._write(
            """
            metadata: {}
            types:
              aws_alpha_things:
                cfn_type: AWS::Alpha::Thing
                cfn_type_source: heuristic
                category: a
                aliases: [legacy_alpha, vintage_alpha]
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        self.assertIs(
            registry.find("legacy_alpha"), registry.find("aws_alpha_things")
        )
        self.assertIs(
            registry.find("vintage_alpha"), registry.find("aws_alpha_things")
        )

    def test_alias_collision_raises(self) -> None:
        path = self._write(
            """
            metadata: {}
            types:
              aws_alpha_things:
                cfn_type: AWS::Alpha::Thing
                aliases: [shared]
                typed_collector: false
                mandatory: false
              aws_beta_things:
                cfn_type: AWS::Beta::Thing
                aliases: [shared]
                typed_collector: false
                mandatory: false
            """
        )
        with self.assertRaises(ValueError):
            load_registry_from_path(path)

    def test_missing_file_raises_filenotfound(self) -> None:
        with self.assertRaises(FileNotFoundError):
            load_registry_from_path(Path("/nonexistent/registry.yaml"))

    def test_null_cfn_type_is_allowed(self) -> None:
        path = self._write(
            """
            metadata: {}
            types:
              aws_no_type_things:
                cfn_type: null
                cfn_type_source: null
                category: x
                aliases: []
                typed_collector: false
                mandatory: false
            """
        )
        registry = load_registry_from_path(path)
        entry = registry.find("aws_no_type_things")
        self.assertIsNotNone(entry)
        self.assertIsNone(entry.cfn_type)
        # A null cfn type must not be indexed for reverse lookup.
        self.assertIsNone(registry.find_by_cfn_type(None))


class AwsapiResourceTypesSpecTests(TestCase):
    """The spec layer must surface the legacy ``resource_type_name`` values
    generation rules know about and bind the SDK collectors."""

    def setUp(self) -> None:
        reset_cache()
        import importlib

        import indexers.awsapi_resource_types as mod

        self.mod = importlib.reload(mod)

    def test_typed_sdk_collectors_present(self) -> None:
        names = {s.cloudquery_table_name for s in self.mod.AWS_TYPED_RESOURCE_TYPE_SPECS}
        self.assertEqual(
            names,
            {
                "aws_ec2_instances",
                "aws_s3_buckets",
            },
        )

    def test_account_spec_is_first_and_mandatory(self) -> None:
        first = self.mod.AWS_RESOURCE_TYPE_SPECS[0]
        self.assertEqual(first.resource_type_name, "account")
        self.assertEqual(first.cloudquery_table_name, "aws_iam_accounts")
        self.assertTrue(first.mandatory)

    def test_legacy_short_names_resolve_via_find_spec(self) -> None:
        spec = self.mod.find_spec("account")
        self.assertIsNotNone(spec)
        self.assertEqual(spec.cloudquery_table_name, "aws_iam_accounts")

        inst = self.mod.find_spec("ec2_instance")
        self.assertIsNotNone(inst)
        self.assertEqual(inst.cloudquery_table_name, "aws_ec2_instances")

    def test_canonical_table_name_resolves_via_find_spec(self) -> None:
        # The gen-rule contract: the CloudQuery table name is always a valid
        # resource_type, regardless of backend.
        spec = self.mod.find_spec("aws_ec2_instances")
        self.assertIsNotNone(spec)
        self.assertEqual(spec.cloudquery_table_name, "aws_ec2_instances")

    def test_find_spec_by_cfn_type(self) -> None:
        spec = self.mod.find_spec_by_cfn_type("AWS::S3::Bucket")
        self.assertIsNotNone(spec)
        self.assertEqual(spec.cloudquery_table_name, "aws_s3_buckets")

    def test_unknown_name_returns_none(self) -> None:
        self.assertIsNone(self.mod.find_spec("totally_made_up"))
        self.assertIsNone(self.mod.find_spec(""))

    def test_typed_specs_have_callable_collectors(self) -> None:
        for spec in self.mod.AWS_TYPED_RESOURCE_TYPE_SPECS:
            self.assertTrue(callable(spec.collector), spec.cloudquery_table_name)

    def test_ec2_is_regional_s3_is_global(self) -> None:
        self.assertTrue(self.mod.find_spec("aws_ec2_instances").regional)
        self.assertFalse(self.mod.find_spec("aws_s3_buckets").regional)

    def test_generic_specs_have_no_collector(self) -> None:
        # A type with a CFN mapping but no SDK collector (e.g. RDS instances)
        # is materialized as a generic spec the Cloud Control pass owns.
        spec = self.mod.find_spec("aws_rds_instances")
        self.assertIsNotNone(spec)
        self.assertIsNone(spec.collector)
        self.assertEqual(spec.cfn_type, "AWS::RDS::DBInstance")

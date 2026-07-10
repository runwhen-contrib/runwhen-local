import unittest

from scripts.simulator import vocab


class VocabTestCase(unittest.TestCase):
    def test_banks_have_no_duplicates(self):
        for name in ("CLUSTERS", "NAMESPACES", "SERVICES", "COMPONENTS", "VARIANTS"):
            bank = getattr(vocab, name)
            self.assertEqual(len(bank), len(set(bank)), f"{name} has duplicates")

    def test_per_cluster_capacity_exceeds_demand(self):
        # Unique-per-cluster names come from services x components x (1 + variants).
        capacity = len(vocab.SERVICES) * len(vocab.COMPONENTS) * (1 + len(vocab.VARIANTS))
        # A 100K/50-cluster run averages 2000/cluster; long-tail peaks far higher.
        # Require comfortable headroom.
        self.assertGreaterEqual(capacity, 40000, f"per-cluster name capacity too low: {capacity}")

    def test_enough_clusters_and_namespaces_for_defaults(self):
        self.assertGreaterEqual(len(vocab.CLUSTERS), 50)
        self.assertGreaterEqual(len(vocab.NAMESPACES), 200)

    def test_kind_weights_are_positive_and_deployment_dominant(self):
        weights = dict(vocab.KIND_WEIGHTS)
        self.assertTrue(all(w > 0 for w in weights.values()))
        self.assertEqual(max(weights, key=weights.get), "Deployment")

    def test_names_are_dns_safe_tokens(self):
        import re
        token = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
        for bank in (vocab.SERVICES, vocab.COMPONENTS, vocab.VARIANTS, vocab.NAMESPACES):
            for w in bank:
                self.assertRegex(w, token, f"non-DNS-safe token: {w}")

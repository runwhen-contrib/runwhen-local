import random
import statistics
import unittest

from scripts.simulator.generate_scale_config import plan_namespaces


class DistributionTestCase(unittest.TestCase):
    def test_total_size_equals_count(self):
        slots = plan_namespaces(10000, 50, 20, "longtail", random.Random(1))
        self.assertEqual(sum(s.size for s in slots), 10000)

    def test_cluster_count_matches(self):
        slots = plan_namespaces(10000, 50, 20, "uniform", random.Random(1))
        self.assertEqual(len({s.cluster for s in slots}), 50)

    def test_namespaces_unique_within_cluster(self):
        slots = plan_namespaces(10000, 10, 15, "uniform", random.Random(2))
        by_cluster: dict[str, list[str]] = {}
        for s in slots:
            by_cluster.setdefault(s.cluster, []).append(s.namespace)
        for cluster, names in by_cluster.items():
            self.assertEqual(len(names), len(set(names)), f"dup namespace in {cluster}")

    def test_uniform_is_flatter_than_longtail(self):
        uni = plan_namespaces(20000, 20, 20, "uniform", random.Random(3))
        lt = plan_namespaces(20000, 20, 20, "longtail", random.Random(3))
        self.assertLess(statistics.pstdev([s.size for s in uni]),
                        statistics.pstdev([s.size for s in lt]))

    def test_deterministic_under_seed(self):
        a = plan_namespaces(5000, 12, 8, "longtail", random.Random(7))
        b = plan_namespaces(5000, 12, 8, "longtail", random.Random(7))
        self.assertEqual([(s.cluster, s.namespace, s.size) for s in a],
                         [(s.cluster, s.namespace, s.size) for s in b])

    def test_every_size_at_least_one(self):
        slots = plan_namespaces(10000, 50, 20, "longtail", random.Random(9))
        self.assertTrue(all(s.size >= 1 for s in slots))

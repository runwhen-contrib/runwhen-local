import random
import re
import unittest

from scripts.simulator.generate_scale_config import (
    compose_name, weighted_kind, coherent_labels,
)
from scripts.simulator import vocab

COUNTER = re.compile(r"-\d+$")


class NamingTestCase(unittest.TestCase):
    def test_names_are_unique_within_used_set(self):
        rng = random.Random(1)
        used: set[str] = set()
        names = [compose_name(rng, used)[0] for _ in range(5000)]
        self.assertEqual(len(names), len(set(names)))

    def test_names_have_no_numeric_counter_suffix(self):
        rng = random.Random(2)
        used: set[str] = set()
        for _ in range(2000):
            self.assertNotRegex(compose_name(rng, used)[0], COUNTER)

    def test_name_decomposes_into_vocab(self):
        rng = random.Random(3)
        used: set[str] = set()
        name, service, component = compose_name(rng, used)
        self.assertIn(service, vocab.SERVICES)
        self.assertIn(component, vocab.COMPONENTS)
        self.assertTrue(name.startswith(f"{service}-{component}"))

    def test_deterministic_under_seed(self):
        # Same seed + fresh used set -> same name.
        self.assertEqual(
            compose_name(random.Random(4), set()),
            compose_name(random.Random(4), set()),
        )

    def test_weighted_kind_only_returns_known_kinds(self):
        rng = random.Random(5)
        kinds = {weighted_kind(rng) for _ in range(500)}
        self.assertTrue(kinds.issubset({k for k, _ in vocab.KIND_WEIGHTS}))

    def test_coherent_labels_reflect_service_and_component(self):
        labels = coherent_labels("payments", "api")
        self.assertEqual(labels["app.kubernetes.io/part-of"], "payments")
        self.assertEqual(labels["app.kubernetes.io/component"], "api")

    def test_capacity_exhaustion_raises_clean_error(self):
        # Regression: the old "all variants exhausted -> recurse with a
        # fresh base" branch used tail recursion, which blew Python's
        # recursion limit (RecursionError) once `used` neared the full
        # compose space. Building the real space to trigger the guard would
        # be expensive, so fake a `used` set that is "full" without actually
        # holding every name: __len__ reports the real capacity and
        # __contains__ always says "already used".
        class _FullSet:
            def __len__(self):
                capacity = (len(vocab.SERVICES) * len(vocab.COMPONENTS)
                            * (1 + len(vocab.VARIANTS)))
                return capacity

            def __contains__(self, item):
                return True

            def add(self, item):
                pass

        rng = random.Random(1)
        with self.assertRaises(ValueError):
            compose_name(rng, _FullSet())

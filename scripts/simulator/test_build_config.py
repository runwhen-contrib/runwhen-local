import re
import unittest

from scripts.simulator.generate_scale_config import build_config

BUNDLES = ["k8s-deployment-ops", "k8s-statefulset-ops", "k8s-ingress-healthcheck"]
COUNTER = re.compile(r"-\d+$")


class BuildConfigTestCase(unittest.TestCase):
    def cfg(self, count=500, clusters=5, nspc=6, seed=1, sli=0.25, slo=0.10):
        return build_config(count, clusters, nspc, seed, sli, slo, BUNDLES)

    def test_slx_count_equals_count(self):
        self.assertEqual(len(self.cfg()["slxs"]), 500)

    def test_resource_count_equals_count(self):
        self.assertEqual(len(self.cfg()["inventory"]["resources"]), 500)

    def test_every_slx_binds_a_real_resource(self):
        cfg = self.cfg()
        ids = {r["id"] for r in cfg["inventory"]["resources"]}
        for slug, slx in cfg["slxs"].items():
            self.assertEqual(slx["resources"], [slug])
            self.assertIn(slug, ids)

    def test_names_unique_per_cluster(self):
        cfg = self.cfg()
        seen: dict[str, set[str]] = {}
        for r in cfg["inventory"]["resources"]:
            names = seen.setdefault(r["cluster"], set())
            self.assertNotIn(r["name"], names,
                             f"dup name {r['name']} in cluster {r['cluster']}")
            names.add(r["name"])

    def test_no_counter_style_names(self):
        for r in self.cfg()["inventory"]["resources"]:
            self.assertNotRegex(r["name"], COUNTER)

    def test_sli_slo_fraction_matches_ratio(self):
        cfg = self.cfg(count=2000)
        slxs = list(cfg["slxs"].values())
        sli = sum("sli" in s for s in slxs) / len(slxs)
        slo = sum("slo" in s for s in slxs) / len(slxs)
        self.assertAlmostEqual(sli, 0.25, delta=0.03)
        self.assertAlmostEqual(slo, 0.10, delta=0.03)

    def test_defaults_block_present(self):
        d = self.cfg()["defaults"]
        self.assertIn("repoURL", d)
        self.assertIn("codeCollection", d)

    def test_code_bundles_cycled(self):
        bundles = {s["codeBundle"] for s in self.cfg()["slxs"].values()}
        self.assertEqual(bundles, set(BUNDLES))  # all 3 bundles used at count=500

    def test_deterministic_under_seed(self):
        self.assertEqual(self.cfg(seed=7), self.cfg(seed=7))

    def test_different_seed_changes_output(self):
        self.assertNotEqual(self.cfg(seed=1), self.cfg(seed=2))

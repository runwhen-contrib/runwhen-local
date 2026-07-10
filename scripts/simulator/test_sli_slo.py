import unittest

from scripts.simulator.generate_scale_config import select_sli_slo


class SliSloTestCase(unittest.TestCase):
    def test_ratios_are_hit_over_many_indices(self):
        n = 10000
        sli = sum(select_sli_slo(i, 0.25, 0.10)[0] for i in range(n))
        slo = sum(select_sli_slo(i, 0.25, 0.10)[1] for i in range(n))
        self.assertAlmostEqual(sli / n, 0.25, delta=0.01)
        self.assertAlmostEqual(slo / n, 0.10, delta=0.01)

    def test_slo_implies_sli(self):
        for i in range(1000):
            has_sli, has_slo = select_sli_slo(i, 0.25, 0.10)
            if has_slo:
                self.assertTrue(has_sli, f"index {i}: slo without sli")

    def test_deterministic(self):
        self.assertEqual(select_sli_slo(42, 0.25, 0.10),
                         select_sli_slo(42, 0.25, 0.10))

    def test_zero_ratio_yields_none(self):
        self.assertEqual([select_sli_slo(i, 0.0, 0.0) for i in range(100)],
                         [(False, False)] * 100)

    def test_full_ratio_yields_all(self):
        self.assertTrue(all(select_sli_slo(i, 1.0, 1.0) == (True, True)
                            for i in range(100)))

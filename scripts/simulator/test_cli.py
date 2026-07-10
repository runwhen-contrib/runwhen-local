import os
import tempfile
import unittest

import yaml

from scripts.simulator.generate_scale_config import main, parse_args


class CliTestCase(unittest.TestCase):
    def _run(self, out, extra=None):
        argv = ["--count", "200", "--clusters", "4", "--namespaces-per-cluster", "5",
                "--seed", "1", "--output", out] + (extra or [])
        return main(argv)

    def test_writes_parseable_yaml_with_expected_counts(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, "c.yaml")
            rc = self._run(out)
            self.assertEqual(rc, 0)
            cfg = yaml.safe_load(open(out))
            self.assertEqual(len(cfg["slxs"]), 200)
            self.assertEqual(len(cfg["inventory"]["resources"]), 200)

    def test_same_seed_is_byte_identical(self):
        with tempfile.TemporaryDirectory() as d:
            a, b = os.path.join(d, "a.yaml"), os.path.join(d, "b.yaml")
            self._run(a); self._run(b)
            self.assertEqual(open(a, "rb").read(), open(b, "rb").read())

    def test_defaults_are_sane(self):
        args = parse_args(["--output", "x.yaml"])
        self.assertEqual(args.count, 100000)
        self.assertEqual(args.clusters, 50)
        self.assertEqual(args.sli_ratio, 0.25)
        self.assertEqual(args.slo_ratio, 0.10)

    def test_rejects_bad_ratio(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(SystemExit):
                self._run(os.path.join(d, "c.yaml"), ["--sli-ratio", "1.5"])

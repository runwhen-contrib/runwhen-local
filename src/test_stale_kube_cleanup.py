"""``run.clear_stale_kubeconfig_artifacts`` only clears ``~/.kube`` inside the
container image, where ``RW_CLEAR_STALE_KUBECONFIGS=true`` is set. Here
``$HOME`` is the temporary directory ``home_isolation`` provides."""

import os
import sys
import unittest
from unittest.mock import patch

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

import home_isolation  # noqa: E402,F401

from run import clear_stale_kubeconfig_artifacts  # noqa: E402

GENERATED = ("config", "azure-kubeconfig", "eks-kubeconfig", "gke-kubeconfig")


class ClearStaleKubeconfigArtifactsTest(unittest.TestCase):
    def setUp(self):
        self.kube_dir = os.path.expanduser("~/.kube")
        os.makedirs(self.kube_dir)
        for name in GENERATED + ("my-own-kubeconfig",):
            with open(os.path.join(self.kube_dir, name), "w") as f:
                f.write(name)

    def remaining(self):
        return sorted(os.listdir(self.kube_dir))

    def test_does_nothing_outside_the_container(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("RW_CLEAR_STALE_KUBECONFIGS", None)
            self.assertEqual(clear_stale_kubeconfig_artifacts({}), [])
        self.assertEqual(self.remaining(), sorted(GENERATED + ("my-own-kubeconfig",)))

    @patch.dict(os.environ, {"RW_CLEAR_STALE_KUBECONFIGS": "false"})
    def test_only_the_exact_value_true_opts_in(self):
        self.assertEqual(clear_stale_kubeconfig_artifacts({}), [])
        self.assertEqual(len(self.remaining()), len(GENERATED) + 1)

    @patch.dict(os.environ, {"RW_CLEAR_STALE_KUBECONFIGS": "true"})
    def test_clears_only_generated_files_in_the_container(self):
        removed = clear_stale_kubeconfig_artifacts({})
        self.assertEqual(sorted(removed), sorted(os.path.join(self.kube_dir, n) for n in GENERATED))
        self.assertEqual(self.remaining(), ["my-own-kubeconfig"])

    @patch.dict(os.environ, {"RW_CLEAR_STALE_KUBECONFIGS": "true"})
    def test_keeps_a_user_supplied_kubeconfig_file(self):
        user_file = os.path.join(self.kube_dir, "config")
        clear_stale_kubeconfig_artifacts({"kubernetes": {"kubeconfigFile": user_file}})
        self.assertEqual(self.remaining(), ["config", "my-own-kubeconfig"])


if __name__ == "__main__":
    unittest.main()

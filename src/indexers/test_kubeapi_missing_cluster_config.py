"""Regression test: kubeapi.index must not crash when cloudConfig.kubernetes
has no kubeconfigFile (e.g. in-cluster auth disabled and no kubeconfig produced).
Previously it base64-decoded a None value and returned HTTP 500.
"""

from __future__ import annotations

import os
import sys
from unittest import TestCase
from unittest.mock import Mock

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.dirname(_THIS_DIR)
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from enrichers.generation_rules import DEFAULT_LOD_SETTING  # noqa: E402
from indexers.common import CLOUD_CONFIG_SETTING  # noqa: E402
from indexers.kubeapi import NAMESPACE_LODS_SETTING, index  # noqa: E402


class MissingKubeconfigTest(TestCase):
    def test_index_skips_without_kubeconfig_file(self):
        context = Mock()
        settings = {
            DEFAULT_LOD_SETTING: "none",
            NAMESPACE_LODS_SETTING: {},
            CLOUD_CONFIG_SETTING: {"kubernetes": {"inClusterAuth": True}},
        }
        context.get_setting.side_effect = lambda setting: settings.get(setting)

        index(context)

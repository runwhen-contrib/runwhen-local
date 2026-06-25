import os
import sys
import unittest
from unittest.mock import Mock, patch

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

from config_reloader import (
    ConfigReloader,
    data_fingerprint,
    discover_mount_sources,
    resolve_watch_targets,
    should_trigger_restart,
)


def _pod_with_volumes(volumes):
    pod = Mock()
    pod.spec.volumes = volumes
    return pod


def _volume(*, config_map_name=None, secret_name=None):
    volume = Mock()
    if config_map_name is not None:
        volume.config_map = Mock(name=config_map_name)
        volume.config_map.name = config_map_name
    else:
        volume.config_map = None
    if secret_name is not None:
        volume.secret = Mock(secret_name=secret_name)
        volume.secret.secret_name = secret_name
    else:
        volume.secret = None
    return volume


class ConfigReloaderDiscoveryTests(unittest.TestCase):
    def test_discover_mount_sources(self):
        pod = _pod_with_volumes([
            _volume(config_map_name="workspace-builder"),
            _volume(secret_name="uploadinfo"),
            _volume(),
        ])
        configmaps, secrets = discover_mount_sources(pod)
        self.assertEqual(configmaps, {"workspace-builder"})
        self.assertEqual(secrets, {"uploadinfo"})

    def test_resolve_watch_targets_merges_and_excludes(self):
        pod = _pod_with_volumes([_volume(config_map_name="workspace-builder")])

        configmaps, secrets = resolve_watch_targets(
            pod,
            extra_configmaps=["extra-cm"],
            extra_secrets=["gcp-creds"],
            exclude=["extra-cm"],
        )
        self.assertEqual(configmaps, {"workspace-builder"})
        self.assertEqual(secrets, {"gcp-creds"})


class ConfigReloaderBehaviorTests(unittest.TestCase):
    def test_data_fingerprint_is_stable(self):
        first = data_fingerprint({"a": "1", "b": "2"})
        second = data_fingerprint({"b": "2", "a": "1"})
        self.assertEqual(first, second)
        self.assertNotEqual(first, data_fingerprint({"a": "1"}))

    def test_should_trigger_restart(self):
        self.assertFalse(should_trigger_restart("ADDED", initialized=False))
        self.assertFalse(should_trigger_restart("ADDED", initialized=True))
        self.assertTrue(should_trigger_restart("MODIFIED", initialized=True))
        self.assertFalse(should_trigger_restart("MODIFIED", initialized=False))
        self.assertTrue(should_trigger_restart("DELETED", initialized=True))

    def test_poll_once_detects_configmap_change(self):
        reloader = ConfigReloader(
            namespace="default",
            pod_name="wb-0",
            configmaps={"workspace-builder"},
            secrets=set(),
            poll_interval=1,
        )
        reloader._initialized.add(("configmap", "workspace-builder"))
        reloader._fingerprints[("configmap", "workspace-builder")] = data_fingerprint({"old": "1"})

        with patch.object(
            reloader,
            "_read_fingerprint",
            return_value=data_fingerprint({"new": "2"}),
        ):
            self.assertTrue(reloader._poll_once())

    def test_poll_once_seeds_without_trigger(self):
        reloader = ConfigReloader(
            namespace="default",
            pod_name="wb-0",
            configmaps={"workspace-builder"},
            secrets=set(),
            poll_interval=1,
        )
        with patch.object(
            reloader,
            "_read_fingerprint",
            return_value=data_fingerprint({"initial": "1"}),
        ):
            self.assertFalse(reloader._poll_once())
        self.assertIn(("configmap", "workspace-builder"), reloader._initialized)


if __name__ == "__main__":
    unittest.main()

#!/usr/bin/env python3
"""Watch mounted ConfigMaps/Secrets and exit when they change.

Helm mounts workspaceInfo.yaml and credential secrets with subPath, which
Kubernetes never updates in-place. File mtime/content checks inside the pod
therefore cannot detect upstream changes. This module watches the source
ConfigMap/Secret objects via the in-cluster API and exits when their data
changes so the entrypoint can terminate and kubelet restarts the pod.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import signal
import sys
import threading
import time
from typing import Iterable

from kubernetes import client, config, watch
from kubernetes.client.exceptions import ApiException

logger = logging.getLogger(__name__)

SA_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token"
DEFAULT_POLL_INTERVAL = 30
DEFAULT_WATCH_TIMEOUT = 300


def in_cluster() -> bool:
    return os.path.isfile(SA_TOKEN_PATH)


def get_namespace() -> str:
    namespace_file = "/var/run/secrets/kubernetes.io/serviceaccount/namespace"
    with open(namespace_file, encoding="utf-8") as handle:
        return handle.read().strip()


def _split_env_list(value: str | None) -> set[str]:
    if not value:
        return set()
    return {item.strip() for item in value.split(":") if item.strip()}


def data_fingerprint(data: dict[str, str] | None) -> str:
    """Stable hash of a ConfigMap/Secret .data mapping."""
    normalized = json.dumps(data or {}, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def discover_mount_sources(pod: client.V1Pod) -> tuple[set[str], set[str]]:
    """Return ConfigMap and Secret names referenced by the pod's volumes."""
    configmaps: set[str] = set()
    secrets: set[str] = set()
    for volume in pod.spec.volumes or []:
        if volume.config_map and volume.config_map.name:
            configmaps.add(volume.config_map.name)
        if volume.secret and volume.secret.secret_name:
            secrets.add(volume.secret.secret_name)
    return configmaps, secrets


def resolve_watch_targets(
    pod: client.V1Pod,
    *,
    extra_configmaps: Iterable[str] = (),
    extra_secrets: Iterable[str] = (),
    exclude: Iterable[str] = (),
) -> tuple[set[str], set[str]]:
    discovered_configmaps, discovered_secrets = discover_mount_sources(pod)
    configmaps = discovered_configmaps | set(extra_configmaps)
    secrets = discovered_secrets | set(extra_secrets)
    excluded = set(exclude)
    configmaps -= excluded
    secrets -= excluded
    return configmaps, secrets


def should_trigger_restart(event_type: str, *, initialized: bool) -> bool:
    if event_type == "DELETED":
        return initialized
    if event_type == "MODIFIED":
        return initialized
    return False


def request_pod_restart() -> None:
    """Ask the entrypoint to terminate so kubelet restarts the pod."""
    logger.info("Config change detected — requesting pod restart")
    try:
        os.kill(os.getppid(), signal.SIGUSR1)
    except OSError as exc:
        logger.warning("Could not signal entrypoint (pid %s): %s", os.getppid(), exc)
    sys.exit(0)


class ConfigReloader:
    def __init__(
        self,
        *,
        namespace: str,
        pod_name: str,
        configmaps: set[str],
        secrets: set[str],
        poll_interval: int = DEFAULT_POLL_INTERVAL,
        watch_timeout: int = DEFAULT_WATCH_TIMEOUT,
    ) -> None:
        self.namespace = namespace
        self.pod_name = pod_name
        self.configmaps = configmaps
        self.secrets = secrets
        self.poll_interval = poll_interval
        self.watch_timeout = watch_timeout
        self._core = client.CoreV1Api()
        self._fingerprints: dict[tuple[str, str], str] = {}
        self._initialized: set[tuple[str, str]] = set()

    def _resource_key(self, kind: str, name: str) -> tuple[str, str]:
        return kind, name

    def _read_fingerprint(self, kind: str, name: str) -> str | None:
        try:
            if kind == "configmap":
                obj = self._core.read_namespaced_config_map(name, self.namespace)
                return data_fingerprint(obj.data)
            obj = self._core.read_namespaced_secret(name, self.namespace)
            return data_fingerprint(obj.data)
        except ApiException as exc:
            logger.error("Failed to read %s/%s: %s", kind, name, exc.reason)
            return None

    def _seed_fingerprints(self) -> bool:
        ok = True
        for name in sorted(self.configmaps):
            key = self._resource_key("configmap", name)
            fingerprint = self._read_fingerprint("configmap", name)
            if fingerprint is None:
                ok = False
                continue
            self._fingerprints[key] = fingerprint
            self._initialized.add(key)
        for name in sorted(self.secrets):
            key = self._resource_key("secret", name)
            fingerprint = self._read_fingerprint("secret", name)
            if fingerprint is None:
                ok = False
                continue
            self._fingerprints[key] = fingerprint
            self._initialized.add(key)
        return ok

    def _poll_once(self) -> bool:
        changed = False
        for name in sorted(self.configmaps):
            key = self._resource_key("configmap", name)
            fingerprint = self._read_fingerprint("configmap", name)
            if fingerprint is None:
                continue
            previous = self._fingerprints.get(key)
            if key in self._initialized and previous is not None and fingerprint != previous:
                logger.info("ConfigMap %s data changed", name)
                return True
            self._fingerprints[key] = fingerprint
            self._initialized.add(key)
        for name in sorted(self.secrets):
            key = self._resource_key("secret", name)
            fingerprint = self._read_fingerprint("secret", name)
            if fingerprint is None:
                continue
            previous = self._fingerprints.get(key)
            if key in self._initialized and previous is not None and fingerprint != previous:
                logger.info("Secret %s data changed", name)
                return True
            self._fingerprints[key] = fingerprint
            self._initialized.add(key)
        return changed

    def _watch_resource(self, kind: str, name: str) -> bool:
        watcher = watch.Watch()
        list_fn = (
            self._core.list_namespaced_config_map
            if kind == "configmap"
            else self._core.list_namespaced_secret
        )
        field_selector = f"metadata.name={name}"
        key = self._resource_key(kind, name)

        while True:
            try:
                for event in watcher.stream(
                    list_fn,
                    self.namespace,
                    field_selector=field_selector,
                    timeout_seconds=self.watch_timeout,
                ):
                    event_type = event["type"]
                    obj = event["object"]
                    fingerprint = data_fingerprint(obj.data)
                    previous = self._fingerprints.get(key)
                    if should_trigger_restart(
                        event_type,
                        initialized=key in self._initialized,
                    ) and previous is not None and fingerprint != previous:
                        logger.info(
                            "%s %s changed (%s event)",
                            kind.title(),
                            name,
                            event_type,
                        )
                        return True
                    self._fingerprints[key] = fingerprint
                    self._initialized.add(key)
            except ApiException as exc:
                logger.warning(
                    "Watch stream for %s/%s failed: %s; retrying",
                    kind,
                    name,
                    exc.reason,
                )
                time.sleep(self.poll_interval)
            except Exception as exc:  # pragma: no cover - defensive reconnect
                logger.warning(
                    "Watch stream for %s/%s interrupted: %s; retrying",
                    kind,
                    name,
                    exc,
                )
                time.sleep(self.poll_interval)

    def run(self) -> None:
        if not self.configmaps and not self.secrets:
            logger.error("No ConfigMaps or Secrets configured to watch")
            sys.exit(2)

        if not self._seed_fingerprints():
            logger.warning(
                "Some watch targets could not be read; continuing with those available"
            )

        targets = [
            ("configmap", name) for name in sorted(self.configmaps)
        ] + [("secret", name) for name in sorted(self.secrets)]
        logger.info(
            "Watching %d ConfigMap(s) and %d Secret(s) in namespace %s",
            len(self.configmaps),
            len(self.secrets),
            self.namespace,
        )
        for kind, name in targets:
            logger.info("  - %s/%s", kind, name)

        use_poll = os.environ.get("RW_CONFIG_RELOAD_MODE", "watch").lower() == "poll"
        if use_poll:
            logger.info("Polling every %ss for config changes", self.poll_interval)
            while True:
                if self._poll_once():
                    request_pod_restart()
                time.sleep(self.poll_interval)
            return

        changed = threading.Event()

        def _watch_worker(kind: str, name: str) -> None:
            while not changed.is_set():
                if self._watch_resource(kind, name):
                    changed.set()
                    return

        threads = [
            threading.Thread(
                target=_watch_worker,
                args=(kind, name),
                name=f"config-reloader-{kind}-{name}",
                daemon=True,
            )
            for kind, name in targets
        ]
        for thread in threads:
            thread.start()

        while not changed.is_set():
            if not any(thread.is_alive() for thread in threads):
                logger.error("All config reloader watch threads exited unexpectedly")
                sys.exit(2)
            time.sleep(1)

        request_pod_restart()


def build_reloader_from_env() -> ConfigReloader:
    namespace = os.environ.get("RW_CONFIG_RELOAD_NAMESPACE") or get_namespace()
    pod_name = os.environ.get("HOSTNAME") or os.environ.get("POD_NAME")
    if not pod_name:
        raise RuntimeError("HOSTNAME or POD_NAME must be set")

    config.load_incluster_config()
    core = client.CoreV1Api()
    pod = core.read_namespaced_pod(pod_name, namespace)

    extra_configmaps = _split_env_list(os.environ.get("RW_WATCH_CONFIGMAPS"))
    extra_secrets = _split_env_list(os.environ.get("RW_WATCH_SECRETS"))
    exclude = _split_env_list(os.environ.get("RW_CONFIG_RELOAD_EXCLUDE"))

    configmaps, secrets = resolve_watch_targets(
        pod,
        extra_configmaps=extra_configmaps,
        extra_secrets=extra_secrets,
        exclude=exclude,
    )

    poll_interval = int(os.environ.get("RW_CONFIG_RELOAD_POLL_INTERVAL", DEFAULT_POLL_INTERVAL))
    watch_timeout = int(
        os.environ.get("RW_CONFIG_RELOAD_WATCH_TIMEOUT", DEFAULT_WATCH_TIMEOUT)
    )
    return ConfigReloader(
        namespace=namespace,
        pod_name=pod_name,
        configmaps=configmaps,
        secrets=secrets,
        poll_interval=poll_interval,
        watch_timeout=watch_timeout,
    )


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
    if not in_cluster():
        logger.error("Not running in-cluster; config reloader disabled")
        sys.exit(2)
    reloader = build_reloader_from_env()
    reloader.run()


if __name__ == "__main__":
    main()

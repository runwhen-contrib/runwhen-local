import datetime
import logging
from typing import Any
import yaml

from component import Context
from resources import Resource, Registry
from indexers.kubetypes import KUBERNETES_PLATFORM, ResourceType, get_cluster

logger = logging.getLogger(__name__)

DOCUMENTATION = "Render/dump Kubernetes resource state to a YAML file"


def _dump_resource_state(registry: Registry, resource_type_name: str, cluster_name: str) -> list[Any]:
    instances = list()
    resource_type = registry.lookup_resource_type(KUBERNETES_PLATFORM, resource_type_name)
    if resource_type:
        for resource in resource_type.instances.values():
            if get_cluster(resource).name == cluster_name:
                instances.append(resource.resource)
    return instances


def render(context: Context):
    registry = context.registry

    # Initialize the top-level state in the dump dict
    dump = dict()
    dump['creationDate'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    dump['description'] = "Dump of the Kubernetes resources collected during a run of the map generation tool"
    clusters = dict()
    dump['clusters'] = clusters

    # Iterate over the clusters. The other Kubernetes objects are contained/scoped within each
    # cluster entry to handle resources with the same name across different clusters.
    cluster_resource_type = registry.lookup_resource_type(KUBERNETES_PLATFORM, ResourceType.CLUSTER.value)
    for cluster in cluster_resource_type.instances.values():
        cluster_dump = dict()
        cluster_name = cluster.name
        cluster_dump['context'] = cluster.context
        clusters[cluster_name] = cluster_dump

        # Dump the resources that belong to the current cluster
        cluster_dump['namespaces'] = _dump_resource_state(registry, ResourceType.NAMESPACE.value, cluster_name)
        cluster_dump['ingresses'] = _dump_resource_state(registry, ResourceType.INGRESS.value, cluster_name)
        cluster_dump['services'] = _dump_resource_state(registry, ResourceType.SERVICE.value, cluster_name)
        cluster_dump['deployments'] = _dump_resource_state(registry, ResourceType.DEPLOYMENT.value, cluster_name)
        cluster_dump['statefulSets'] = _dump_resource_state(registry, ResourceType.STATEFUL_SET.value, cluster_name)
        cluster_dump['daemonSets'] = _dump_resource_state(registry, ResourceType.DAEMON_SET.value, cluster_name)
        cluster_dump['pods'] = _dump_resource_state(registry, ResourceType.POD.value, cluster_name)

    dump_text = yaml.safe_dump(dump)
    context.outputter.write_file("resource-dump.yaml", dump_text)

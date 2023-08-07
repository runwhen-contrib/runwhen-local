import datetime
import logging
from typing import Any
import yaml

from component import Context
import models


logger = logging.getLogger(__name__)

DOCUMENTATION = "Render/dump Kubernetes resource state to a YAML file"


def _dump_model_state(model_class: models.KubernetesBase, cluster_name: str) -> list[Any]:
    instances = list()
    for instance in model_class.nodes.all():
        if instance.get_cluster().get_name() == cluster_name:
            instances.append(instance.resource)
    return instances


def render(context: Context):
    # Initialize the top-level state in the dump dict
    dump = dict()
    dump['creationDate'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    dump['description'] = "Dump of the Kubernetes resources collected during a run of the map generation tool"
    clusters = dict()
    dump['clusters'] = clusters

    # Iterate over the clusters. The other Kubernetes objects are contained/scoped within each
    # cluster entry to handle resources with the same name across different clusters.
    for cluster in models.KubernetesCluster.nodes.all():
        cluster_dump = dict()
        cluster_name = cluster.get_name()
        cluster_dump['context'] = cluster.context
        clusters[cluster_name] = cluster_dump

        # Dump the resources that belong to the current cluster
        cluster_dump['namespaces'] = _dump_model_state(models.KubernetesNamespace, cluster_name)
        cluster_dump['ingresses'] = _dump_model_state(models.KubernetesIngress, cluster_name)
        cluster_dump['services'] = _dump_model_state(models.KubernetesService, cluster_name)
        cluster_dump['configMaps'] = _dump_model_state(models.KubernetesConfigMap, cluster_name)
        cluster_dump['statefulSets'] = _dump_model_state(models.KubernetesStatefulSet, cluster_name)
        cluster_dump['replicaSets'] = _dump_model_state(models.KubernetesReplicaSet, cluster_name)
        cluster_dump['daemonSets'] = _dump_model_state(models.KubernetesDaemonSet, cluster_name)
        cluster_dump['pods'] = _dump_model_state(models.KubernetesPod, cluster_name)

    dump_text = yaml.safe_dump(dump)
    context.outputter.write_file("resource-dump.yaml", dump_text)

import datetime
from typing import Any
import yaml

from component import Context
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from indexers.kubetypes import KUBERNETES_PLATFORM, KubernetesResourceType, get_cluster
from enrichers.generation_rule_types import LevelOfDetail

DOCUMENTATION = "Render/dump Kubernetes resource state to a YAML file"

def _dump_resource_state(registry: Registry, resource_type_name: str, cluster_name: str) -> list[Any]:
    instances = list()
    resource_type = registry.lookup_resource_type(KUBERNETES_PLATFORM, resource_type_name)
    if resource_type:
        for resource in resource_type.instances.values():
            if get_cluster(resource).name == cluster_name:
                instances.append(resource.resource)
    return instances


def resource_ref_representer(dumper: yaml.SafeDumper, resource: Resource) -> yaml.nodes.MappingNode:
    return dumper.represent_str(resource.qualified_name)

def level_of_detail_representer(dumper: yaml.SafeDumper, level_of_detail: LevelOfDetail) -> yaml.nodes.MappingNode:
    return dumper.represent_str(level_of_detail.name.lower())

def render(context: Context):
    registry: Registry = context.properties[REGISTRY_PROPERTY_NAME]

    # Initialize the top-level state in the dump dict
    dump = dict()
    dump['creationDate'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    dump['description'] = "Dump of the resources collected during a run of the workspace builder tool"

    # Iterate over the clusters. The other Kubernetes objects are contained/scoped within each
    # cluster entry to handle resources with the same name across different clusters.
    # FIXME: This next block of stuff that's added to the dump is backwards compatibility code
    # to support the format used before the switch from using neo4j to the new resource registry.
    # Once everything (which should just be the RWL cheat sheet stuff) has switched over to the
    # new dump format we can get rid of this Kubernetes-specific dump format.
    clusters = dict()
    dump['clusters'] = clusters
    cluster_resource_type = registry.lookup_resource_type(KUBERNETES_PLATFORM, KubernetesResourceType.CLUSTER.value)
    if cluster_resource_type:
        for cluster in cluster_resource_type.instances.values():
            cluster_dump = dict()
            cluster_name = cluster.name
            cluster_dump['context'] = cluster.context
            clusters[cluster_name] = cluster_dump

            # Dump the resources that belong to the current cluster
            cluster_dump['namespaces'] = _dump_resource_state(registry, KubernetesResourceType.NAMESPACE.value, cluster_name)
            cluster_dump['ingresses'] = _dump_resource_state(registry, KubernetesResourceType.INGRESS.value, cluster_name)
            cluster_dump['services'] = _dump_resource_state(registry, KubernetesResourceType.SERVICE.value, cluster_name)
            cluster_dump['deployments'] = _dump_resource_state(registry, KubernetesResourceType.DEPLOYMENT.value, cluster_name)
            cluster_dump['statefulSets'] = _dump_resource_state(registry, KubernetesResourceType.STATEFUL_SET.value, cluster_name)
            cluster_dump['daemonSets'] = _dump_resource_state(registry, KubernetesResourceType.DAEMON_SET.value, cluster_name)
            cluster_dump['pods'] = _dump_resource_state(registry, KubernetesResourceType.POD.value, cluster_name)
            cluster_dump['pvcs'] = _dump_resource_state(registry, KubernetesResourceType.PVC.value, cluster_name)

    # Dump all the info in the registry
    # Note that the Kubernetes-specific info will be duplicated in this part of the dump.
    # The Kubernetes-specific dump code above is the old way the info was dumped and is just
    # kept around for the time being in case anything (e.g. the cheat sheet stuff) is still
    # using it. Should check with Shea if he's dependent on it.
    # Anyway, eventually (hopefully soon) nothing will be using the old dump content and
    # we can get rid of the stuff above.
    # FIXME: There's probably a somewhat cleaner way to do this dump, presumably using the
    # mechanism built into the yaml module to customize how it dumps objects. I spent a
    # little bit of time looking into that, but it seemed like it was going to be more
    # work than just doing the code below. Possibly when I get around to doing supporting
    # a dump/load mechanism for the resource registry it will make sense to revisit this
    # and presumably leverage the dump code here.
    platforms_dump = list()
    dump['platforms'] = platforms_dump
    for platform in registry.platforms.values():
        resource_types_dump = list()
        platform_dump = {
            "name": platform.name,
            "resourceTypes": resource_types_dump
        }
        platforms_dump.append(platform_dump)
        for resource_type in platform.resource_types.values():
            instances_dump = list()
            resource_type_dump = {
                "name": resource_type.name,
                "instances": instances_dump
            }
            resource_types_dump.append(resource_type_dump)
            for instance in resource_type.instances.values():
                instance_dump = dict()
                instances_dump.append(instance_dump)
                attributes_names = dir(instance)
                for attribute_name in attributes_names:
                    if attribute_name.startswith("__") or attribute_name == "resource_type":
                        continue
                    attribute_value = getattr(instance, attribute_name)
                    if callable(attribute_value):
                        continue
                    instance_dump[attribute_name] = attribute_value

    yaml.SafeDumper.add_representer(Resource, resource_ref_representer)
    yaml.SafeDumper.add_representer(LevelOfDetail, level_of_detail_representer)
    dump_text = yaml.safe_dump(dump)
    context.outputter.write_file("resource-dump.yaml", dump_text)

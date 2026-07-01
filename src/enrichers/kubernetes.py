from typing import Any, Optional, Sequence, Union

from component import Context
from indexers.kubetypes import (
    KUBERNETES_PLATFORM,
    KubernetesResourceType,
    KubernetesResourceTypeSpec,
    get_cluster,
    get_namespace,
    get_context
)
from resources import Resource, Registry, REGISTRY_PROPERTY_NAME
from .generation_rule_types import LevelOfDetail, PlatformHandler

import logging
logger = logging.getLogger(__name__)


class KubernetesPlatformHandler(PlatformHandler):

    def __init__(self):
        super().__init__(KUBERNETES_PLATFORM)

    def construct_resource_type_spec(self, config: Union[str, dict[str, Any]]) -> KubernetesResourceTypeSpec:
        return KubernetesResourceTypeSpec.construct_from_config(config)

    def get_resources(self,
                      resource_type_spec: KubernetesResourceTypeSpec,
                      context: Context) -> Sequence[Resource]:
        result = list()
        registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)

        if resource_type_spec.resource_type_name == KubernetesResourceType.CUSTOM.value:
            # Each CRD lives in its own registry bucket keyed by
            # ``{plural}.{group}`` (see the custom-resource loop in
            # ``indexers.kubeapi``). Look up that specific bucket instead of
            # the coarse "custom" bucket -- no linear search or per-instance
            # attribute filter is needed to disambiguate kinds any more.
            lookup_name = f"{resource_type_spec.kind}.{resource_type_spec.group}"
            resource_type = registry.lookup_resource_type(KUBERNETES_PLATFORM, lookup_name)
            if not resource_type:
                return result
            check_version = (resource_type_spec.version is not None
                             and resource_type_spec.version != '*')
            for resource in resource_type.instances.values():
                # Version pinning is still supported: the indexer stores each
                # discovered version's resources under the same plural.group
                # bucket, so callers that pin a specific version filter here.
                if check_version and getattr(resource, "version", None) != resource_type_spec.version:
                    continue
                result.append(resource)
            return result

        # Non-custom (built-in) Kubernetes resource types.
        resource_type = registry.lookup_resource_type(KUBERNETES_PLATFORM, resource_type_spec.resource_type_name)
        if not resource_type:
            return result
        for resource in resource_type.instances.values():
            result.append(resource)
        return result

    def get_level_of_detail(self, resource: Resource) -> LevelOfDetail:
        namespace = get_namespace(resource)
        return namespace.lod if namespace else LevelOfDetail.DETAILED

    @staticmethod
    def get_common_resource_property_values(resource: Resource, qualifier_name: str) -> Optional[str]:
        if qualifier_name == "cluster":
            cluster = get_cluster(resource)
            return cluster.name if cluster else None
        elif qualifier_name == "context":
            return get_context(resource)
        elif qualifier_name == "namespace":
            # Cluster-scoped custom resources have no owning namespace.
            namespace = get_namespace(resource)
            return namespace.name if namespace else None
        elif qualifier_name == "subscription_id":
            cluster = get_cluster(resource)
            if cluster:
                return getattr(cluster, 'subscription_id', None)
            return None
        elif qualifier_name == "subscription_name":
            cluster = get_cluster(resource)
            if cluster:
                return getattr(cluster, 'subscription_name', None)
            return None
        else:
            # FIXME: Should we treat this as an error, i.e. raise Exception?
            return None

    def get_resource_qualifier_value(self, resource: Resource, qualifier_name: str) -> Optional[str]:
        return self.get_common_resource_property_values(resource, qualifier_name)

    def get_resource_property_values(self, resource: Resource, property_name: str) -> Optional[list[Any]]:
        property_name = property_name.lower()
        if property_name == "labels":
            return list(resource.labels.keys()) + list(resource.labels.values())
        elif property_name == "label-keys":
            return list(resource.labels.keys())
        elif property_name == "label-values":
            return list(resource.labels.values())
        elif property_name == "annotations":
            return list(resource.annotations.keys()) + list(resource.annotations.values())
        elif property_name == "annotation-keys":
            return list(resource.annotations.keys())
        elif property_name == "annotation-values":
            return list(resource.annotations.values())
        else:
            return None

    def get_standard_template_variables(self, resource: Resource) -> dict[str, Any]:
        template_variables = dict()
        cluster = get_cluster(resource)
        if cluster:
            template_variables['cluster'] = cluster
            context = cluster.context
            if context:
                template_variables['context'] = context
            
            # Add subscription information as top-level template variables if available
            subscription_id = getattr(cluster, 'subscription_id', None)
            if subscription_id:
                template_variables['subscription_id'] = subscription_id
                
            subscription_name = getattr(cluster, 'subscription_name', None)
            if subscription_name:
                template_variables['subscription_name'] = subscription_name
                
        namespace = get_namespace(resource)
        if namespace:
            template_variables['namespace'] = namespace
        
        return template_variables

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        return self.get_common_resource_property_values(resource, variable_name)

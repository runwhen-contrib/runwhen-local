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
        resource_type = registry.lookup_resource_type(KUBERNETES_PLATFORM, resource_type_spec.resource_type_name)
        if not resource_type:
            return result

        for resource in resource_type.instances.values():
            if resource_type_spec.resource_type_name == KubernetesResourceType.CUSTOM.value:
                # TODO: This isn't a super efficient implementation, especially if there are a lot of
                # different custom resource types, because we do a linear search over the complete list of
                # custom resources. Currently, there aren't a lot of custom resources that are indexed,
                # so I don't think this will be a problem. But if it turns out to be a performance issue,
                # it wouldn't be too hard to come up with some more efficient implementation, presumably
                # one that structures the data more by the group/version/plural-name, so that we don't
                # have to iterate over everything. Or, of course, switching back to some sort of actual
                # database, preferably something that runs in-process, but I think it only makes sense
                # to do that if there's some other compelling reason to want that, e.g. separating out
                # the resource discovery process into a standalone service that supports more
                # full-featured querying of the resources.
                # NB: Use getattr here to avoid linting errors, since currently these attributes
                # are set dynamically, so they're not known to do static type analysis.
                # Should think about ways to make this more type-safe...
                if getattr(resource, "plural_name") != resource_type_spec.kind:
                    continue
                if getattr(resource, "group") != resource_type_spec.group:
                    continue
                check_version = resource_type_spec.version is not None and resource_type_spec.version != '*'
                if check_version and getattr(resource, "version") != resource_type_spec.version:
                    continue
            result.append(resource)

        return result

    def get_level_of_detail(self, resource: Resource) -> LevelOfDetail:
        namespace = get_namespace(resource)
        return namespace.lod if namespace else LevelOfDetail.DETAILED

    @staticmethod
    def get_common_resource_property_values(resource: Resource, qualifier_name: str) -> Optional[str]:
        if qualifier_name == "cluster":
            return get_cluster(resource).name
        elif qualifier_name == "context":
            return get_context(resource)
        elif qualifier_name == "namespace":
            return get_namespace(resource).name
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
        namespace = get_namespace(resource)
        if namespace:
            template_variables['namespace'] = namespace
        return template_variables

    def resolve_template_variable_value(self, resource: Resource, variable_name: str) -> Optional[Any]:
        return self.get_common_resource_property_values(resource, variable_name)

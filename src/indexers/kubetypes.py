from enum import Enum
from typing import Any, Union
from exceptions import WorkspaceBuilderException
from resources import Resource, ResourceTypeSpec
from typing import Optional

# NB: These types are refactored from kubeapi into a separate file to avoid
# circular import issues, since they also need to be accessed by the
# generation rules module. Should revisit the module dependencies at some
# point to see if there's a way to clean up the module dependencies.

KUBERNETES_PLATFORM = "kubernetes"


class KubernetesResourceType(Enum):
    """
    The resource types supported for Kubernetes.
    """
    CLUSTER = "cluster"
    NAMESPACE = "namespace"
    DEPLOYMENT = "deployment"
    DAEMON_SET = "daemonset"
    STATEFUL_SET = "statefulset"
    INGRESS = "ingress"
    SERVICE = "service"
    POD = "pod"
    CUSTOM = "custom"
    PVC = "persistentvolumeclaim"


class KubernetesResourceTypeSpec(ResourceTypeSpec):
    """
    Kubernetes-specific subclass of the base ResourceTypeSpec class that adds fields
    that are used Kubernetes custom resources.
    """
    group: Optional[str]
    version: Optional[str]
    kind: Optional[str]

    def __init__(self,
                 platform_name: str,
                 resource_type_name: str,
                 group: Optional[str],
                 version: Optional[str],
                 kind: Optional[str]):
        super().__init__(platform_name, resource_type_name)
        self.group = group
        self.version = version
        self.kind = kind

    def get_resource_type_name(self):
        if self.resource_type_name == KubernetesResourceType.CUSTOM.value:
            group_suffix = f".{self.group}" if self.group else ""
            return f"{self.kind}{group_suffix}"
        else:
            return super().get_resource_type_name()

    def __eq__(self, other):
        if not isinstance(other, KubernetesResourceTypeSpec):
            return NotImplemented
        if not super().__eq__(other):
            return False
        return self.group == other.group and self.version == other.version and self.kind == other.kind

    @staticmethod
    def construct_from_config(config: Union[str, dict[str, Any]]) -> "KubernetesResourceTypeSpec":
        """
        Construct a KubernetesResourceTypeSpec from the specified config value.

        FIXME: This gives a Python warning currently because the signature doesn't match the
        signature of the ResourceTypeSpec base class. This is actually ok, because this is
        static factory method that's always invoked via the class, not the instance. But it
        would be nice to get rid of the error. Could give it a different name than the base
        class or could just make it a top-level method.
        """
        platform_name, remaining_config = ResourceTypeSpec.parse_platform_name(config, KUBERNETES_PLATFORM)

        if isinstance(remaining_config, str):
            try:
                resource_type = KubernetesResourceType(remaining_config)
                resource_type_name = resource_type.value
                group = None
                version = None
                kind = None
            except ValueError:
                resource_type_name = KubernetesResourceType.CUSTOM.value
                parts = remaining_config.split('/')
                if len(parts) == 1:
                    version = None
                    group_and_kind = remaining_config
                elif len(parts) == 2:
                    version = parts[1]
                    group_and_kind = parts[0]
                else:
                    raise WorkspaceBuilderException(f"Invalid resource type spec configuration: {remaining_config}.")
                dot_index = group_and_kind.find('.')
                if dot_index > 0:
                    kind = group_and_kind[0:dot_index]
                    group = group_and_kind[dot_index+1:]
                elif dot_index < 0:
                    kind = group_and_kind
                    group = ""
                else:
                    raise WorkspaceBuilderException(f'Expected resource type spec string for a custom resource '
                                                    f'to begin with the kind: {config}')
        elif isinstance(remaining_config, dict):
            platform_name = remaining_config.get('platform', KUBERNETES_PLATFORM)
            resource_type_name = remaining_config.get("resourceType")
            if not resource_type_name:
                raise WorkspaceBuilderException(f'Resource type spec must specify a "resourceType" field')
            resource_type = KubernetesResourceType(resource_type_name)
            group = remaining_config.get("group")
            version = remaining_config.get("version")
            kind = remaining_config.get("kind")
            if resource_type == KubernetesResourceType.CUSTOM and not kind:
                raise WorkspaceBuilderException(f'The resource type spec for a custom resource '
                                                f'must specify a "kind" field.')
        else:
            raise WorkspaceBuilderException(f'Unexpected type ("{type(remaining_config)}") for ResourceTypeSpec; '
                                            f'expected str or dict.')
        return KubernetesResourceTypeSpec(platform_name, resource_type_name, group, version, kind)


def check_kubernetes_resource(resource: Resource):
    if resource.resource_type.platform.name != KUBERNETES_PLATFORM:
        raise WorkspaceBuilderException("Invalid call of get_namespace for non-Kubernetes resource.")

def get_namespace(resource: Resource) -> Optional[Resource]:
    check_kubernetes_resource(resource)
    resource_type = resource.resource_type
    if resource_type.name == KubernetesResourceType.NAMESPACE.value:
        return resource
    elif resource_type.name == KubernetesResourceType.CLUSTER.value:
        # TODO: Should possibly raise an exception here instead?
        return None
    else:
        return getattr(resource, "namespace")

def get_cluster(resource: Resource) -> Optional[Resource]:
    check_kubernetes_resource(resource)
    if resource.resource_type.name == KubernetesResourceType.CLUSTER.value:
        return resource
    else:
        namespace = get_namespace(resource)
        return getattr(namespace, "cluster")

def get_context(resource: Resource) -> Optional[str]:
    check_kubernetes_resource(resource)
    cluster = get_cluster(resource)
    return getattr(cluster, "context") if cluster else None

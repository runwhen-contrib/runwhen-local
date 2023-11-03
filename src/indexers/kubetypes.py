from enum import Enum
from exceptions import WorkspaceBuilderException
from resources import Resource

# NB: These types are refactored from kubeapi into a separate file to avoid
# circular import issues, since they also need to be accessed by the
# generation rules module. Should revisit the module dependencies at some
# point to see if there's a way to clean up the module dependencies.

KUBERNETES_PLATFORM = "kubernetes"

class ResourceType(Enum):
    """
    The resource types supported for Kubernetes.

    FIXME: These definitions mostly overlap with the ResourceType definition in the
    generation_rules module. Should refactor to get rid of the code duplication.
    This will need to resolved when support is added for non-Kubernetes indexers.
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


def check_kubernetes_resource(resource: Resource):
    if resource.resource_type.platform.name != KUBERNETES_PLATFORM:
        raise WorkspaceBuilderException("Invalid call of get_namespace for non-Kubernetes resource.")

def get_namespace(resource: Resource) -> Resource:
    check_kubernetes_resource(resource)
    resource_type = resource.resource_type
    if resource_type.name == ResourceType.NAMESPACE.value:
        return resource
    elif resource_type.name == ResourceType.CLUSTER.value:
        # TODO: Should possibly raise an exception here instead?
        return None
    else:
        return resource.namespace

def get_cluster(resource: Resource) -> Resource:
    check_kubernetes_resource(resource)
    if resource.resource_type.name == ResourceType.CLUSTER.value:
        return resource
    else:
        namespace = get_namespace(resource)
        return namespace.cluster

def get_context(resource: Resource) -> str:
    check_kubernetes_resource(resource)
    cluster = get_cluster(resource)
    return cluster.context

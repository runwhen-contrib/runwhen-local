""" Hard Coded Enricher

    A "hello world" enricher that sets the lod property 
    of the hardcoded KubernetesNamespaces below (across all clusters) or None,
    over-writing previous values.
"""
from component import Context, Setting, SettingDependency, ComponentDependency
from indexers.kubetypes import KUBERNETES_PLATFORM, ResourceType

NAMESPACE_LODS_SETTING = Setting("NAMESPACE_LODS",
                                 "namespaceLODs",
                                 Setting.Type.DICT,
                                 "Level of Detail (LOD) settings for different Kubernetes namespace",
                                 default_value=dict())

DEFAULT_LOD_SETTING = Setting("DEFAULT_LOD",
                              "defaultLOD",
                              Setting.Type.INTEGER,
                              "Default LOD setting to use for any namespaces not specified in NAMESPACE_LODS",
                              default_value=2)

# Variables that are used to initialize/configure the component instance
DOCUMENTATION = "Simple enricher that tags Kubernetes namespaces with a level of detail (LOD) value"
SETTINGS = (
    SettingDependency(NAMESPACE_LODS_SETTING, False),
    SettingDependency(DEFAULT_LOD_SETTING, False)
)
DEPENDENCIES = (
    ComponentDependency("indexer", "kubeapi"),
)


def enrich(context: Context):
    """
    FIXME: Similar to runwhen_default_workspace, it's not clear that the LOD info should
    be put in the namespace resources in the resource registry as opposed to just
    having the LOD info available in the settings and referencing it as needed.
    Especially if we move resource discovery/management to a standalone service,
    it probably doesn't make sense to store stuff there that's really associated
    with a client application of the service, which I think applies to the LOD
    setting, i.e. it controls/filters which gen rules we're going to apply to
    build the workspace which is associated with the workspace builder, not the
    resource discovery.

    Also, namespaces are a Kubernetes-specific feature (although other cloud
    platform may have something similar), so we'll need to think about how to
    generalize the LOD mechanism to support non-Kubernetes resources.
    """
    namespace_lods = context.get_setting("NAMESPACE_LODS")
    default_lod = context.get_setting("DEFAULT_LOD")
    namespace_resource_type = context.registry.lookup_resource_type(KUBERNETES_PLATFORM, ResourceType.NAMESPACE.value)
    for namespace in namespace_resource_type.instances.values():
        configured_lod = namespace_lods.get(namespace.name)
        if configured_lod is not None:
            namespace.lod = configured_lod
        else:
            namespace.lod = default_lod

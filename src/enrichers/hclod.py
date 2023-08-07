""" Hard Coded Enricher

    A "hello world" enricher that sets the lod property 
    of the hardcoded KubernetesNamespaces below (across all clusters) or None,
    over-writing previous values.
"""
import models
from component import Context, Setting, SettingDependency, ComponentDependency


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
    namespace_lods = context.get_setting("NAMESPACE_LODS")
    default_lod = context.get_setting("DEFAULT_LOD")
    namespace_models = models.KubernetesNamespace.nodes.all()
    for namespace_model in namespace_models:
        configured_lod = namespace_lods.get(namespace_model.name)
        if configured_lod is not None:
            namespace_model.lod = configured_lod
        else:
            namespace_model.lod = default_lod
        namespace_model.save()

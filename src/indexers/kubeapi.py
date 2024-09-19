"""
Index assets that we can find by querying K8s API servers
to fetch live clusters, Namespaces, Ingresses, Services,
Deployments, StatefulSets, etc.

Recently updated to support anotations/label discovery, readded robvs comments
where possible. 
"""

import base64
from tempfile import TemporaryDirectory
import logging
import os
import yaml
from typing import Any, Optional, List, Dict

from kubernetes import client
from kubernetes import config as kubernetes_config
from kubernetes.client.rest import ApiException

from component import Setting, SettingDependency, Context, KUBECONFIG_SETTING
# FIXME: It's a little kludgy to have these cross-references between components (especially
# a reference from an indexer to an enricher, since the enrichers are executed after the
# indexer), since at least ideally they're meant to be decoupled from one another. But in
# practice there are linkages between them, although at some point it might make sense
# to make another pass over the design to see if they can be made more decoupled.
# Or possibly just get rid of the whole component/indexer/enricher/renderer model since
# at least with the current workspace builder model with the generation rule mechanism
# it's arguably a bit of an overkill. Although if/when this turns into more of a
# product/resource discovery/graphing service across multiple IaaS platforms it might
# be useful to have the notion of different indexing components. But we'll cross that
# bridge when we get to it...
from enrichers.generation_rules import RESOURCE_TYPE_SPECS_PROPERTY
# FIXME: Would be cleaner if this code didn't depend on any enricher/genrule code.
# This would make it easier to split out resource indexing code out into a standalone
# service or use it for some function outside of the workspace builder use case.
# And the level of detail handling doesn't really belong here.
# Should think some more about how to get rid of this dependency.
# One option would be to not do the level of detail filtering here via a custom
# filter function that's specified by a higher-level component.
# Or something like that...
from enrichers.generation_rule_types import LevelOfDetail
from enrichers.generation_rules import DEFAULT_LOD_SETTING
from .kubetypes import KUBERNETES_PLATFORM, KubernetesResourceType
from resources import Registry, REGISTRY_PROPERTY_NAME
from . import kubeapi_parsers
from .common import CLOUD_CONFIG_SETTING
from utils import write_file

logger = logging.getLogger(__name__)

NAMESPACES_SETTING = Setting("NAMESPACES",
                             "namespaces",
                             Setting.Type.LIST,
                             "Persona data used to initialize persona files",
                             list())

NAMESPACE_LODS_SETTING = Setting("NAMESPACE_LODS",
                                 "namespaceLODs",
                                 Setting.Type.DICT,
                                 "Level of Detail (LOD) settings for different Kubernetes namespace",
                                 default_value=dict())

EXCLUDE_ANNOTATIONS_SETTING = Setting("EXCLUDE_ANNOTATIONS",
                                      "excludeAnnotations",
                                      Setting.Type.LIST,
                                      "Annotations to exclude resources from indexing",
                                      default_value=list())

EXCLUDE_LABELS_SETTING = Setting("EXCLUDE_LABELS",
                                 "excludeLabels",
                                 Setting.Type.LIST,
                                 "Labels to exclude resources from indexing",
                                 default_value=list())

HARDCODED_EXCLUDE_ANNOTATIONS = {
    "config.runwhen.com/ignore": "true"
}

HARDCODED_EXCLUDE_LABELS = {
    "runwhen-local": "ignore"
}


HARDCODED_LOD_ANNOTATIONS = {
    "config.runwhen.com/lod": ["none", "basic", "detailed"]
}

OWNER_ANNOTATION_KEY = "config.runwhen.com/owner"

DOCUMENTATION = "Index assets from a Kubernetes configuration"

SETTINGS = (
    SettingDependency(CLOUD_CONFIG_SETTING, False),
    SettingDependency(KUBECONFIG_SETTING, False),
    SettingDependency(NAMESPACES_SETTING, False),
    SettingDependency(NAMESPACE_LODS_SETTING, False),
    SettingDependency(DEFAULT_LOD_SETTING, False),
    SettingDependency(EXCLUDE_ANNOTATIONS_SETTING, False),
    SettingDependency(EXCLUDE_LABELS_SETTING, False),
)


def get_qualified_name(parent_qualified_name: str, object_name: str):
    return f"{parent_qualified_name}/{object_name}"


class GroupVersionInfo:
    def __init__(self, preferred_version: str, versions: list[str]):
        self.preferred_version = preferred_version
        self.versions = versions

def get_lod_from_annotations(resource, lod_annotations: Dict[str, List[str]]) -> Optional[LevelOfDetail]:
    if not hasattr(resource, 'metadata'):
        return None
    metadata = resource.metadata
    annotations = metadata.annotations if metadata.annotations else {}

    for key, values in lod_annotations.items():
        if key in annotations and annotations[key] in values:
            lod_value = annotations[key]
            if lod_value == "none":
                return LevelOfDetail.NONE
            elif lod_value == "basic":
                return LevelOfDetail.BASIC
            elif lod_value == "detailed":
                return LevelOfDetail.DETAILED

    return None

def extract_owner_name(resource) -> Optional[str]:
    if not hasattr(resource, 'metadata'):
        return None
    annotations = resource.metadata.annotations if resource.metadata.annotations else {}
    return annotations.get(OWNER_ANNOTATION_KEY)



def has_excluded_annotations_or_labels(resource, exclude_annotations: Dict[str, str], exclude_labels: Dict[str, Any]) -> bool:
    if not hasattr(resource, 'metadata'):
        return False
    metadata = resource.metadata
    annotations = metadata.annotations if metadata.annotations else {}
    labels = metadata.labels if metadata.labels else {}

    # FIXME - why is the Kind always None? we should be able to extract this for better logging / debugging without
    # complex code, but this is something that probably needs to be tackled in a longer term way - I suspect it's
    # just a factor of how the collection is performed on certain resource types.     
    for key, value in exclude_annotations.items():
        if annotations.get(key) == value:
            logger.info(f"Matched annotation {key} on {resource.metadata.name}, excluding from discovery.")
            return True
    
    for key, values in exclude_labels.items():
        if key in labels:
            if isinstance(values, list):
                if labels[key] in values:
                    logger.info(f"Matched label {key} on {resource.metadata.name}, excluding from discovery.")
                    return True
            else:
                if labels[key] == values:
                    logger.info(f"Matched label {key} on {resource.metadata.name}, excluding from discovery.")
                    return True
    
    return False


def index(component_context: Context):
    logger.debug("Starting kube API scan")

    # Access the settings/properties that we need.
    # The preferred way of doing this is to use the top-level CLOUD_CONFIG
    # setting, which is a dictionary setting that has platform-specific
    # blocks nested under it for each platform (e.g. "kubernetes", "azure",
    # etc.). This setting corresponds to the "cloudConfig" block in the
    # workspaceInfo.yaml file when the workspace builder is invoked in the
    # usual way from the command line tool. So in this case there would be a
    # "kubernetes" block in the cloud config setting that contains all the
    # Kubernetes-specific config information.

    # But there's also an older (now deprecated) config style, from when
    # the workspace builder only supported Kubernetes, where the Kubernetes
    # config settings are individual top-level settings. To preserve
    # backward compatibility with existing workspaceInfo.yaml files
    # that uses that older format, we still support that style too.
    # Eventually (presumably sometime after we've done a 1.0 release),
    # we can get rid of the support for this older format.
    
    kubeconfig_path: Optional[str] = None
    encoded_kubeconfig_file = None
    namespace_lods: Optional[dict[str, LevelOfDetail]] = None
    custom_namespace_names: Optional[list[str]] = None
    exclude_annotations: Dict[str, str] = {}
    exclude_labels: Dict[str, str] = {}
    lod_annotations = HARDCODED_LOD_ANNOTATIONS

    # Extract settings from the context
    cloud_config_settings: Optional[dict[str, Any]] = component_context.get_setting("CLOUD_CONFIG")
    if cloud_config_settings:
        kubernetes_settings: Optional[dict[str, Any]] = cloud_config_settings.get("kubernetes")
        if kubernetes_settings:
            # Since the contents of the cloud config are not top-level settings for the
            # component framework, they don't get the normal settings processing, in
            # particular the file settings handling that automatically writes the
            # contents of the file settings to a temp file and replaces the setting with
            # a path to the temp file. So we need to do it manually here for the
            # kubeconfig file.
            logger.info(f"Found kubernetes settings.")
            encoded_kubeconfig_file = kubernetes_settings.get("kubeconfigFile")
            kubeconfig_path = "/workspace-builder/.kube/config"
            namespace_lods = kubernetes_settings.get("namespaceLODs", {})
            custom_namespace_names = kubernetes_settings.get("namespaces", [])
            exclude_annotations = kubernetes_settings.get("excludeAnnotations", {})
            exclude_labels = kubernetes_settings.get("excludeLabels", {})

        # Same process as above for AKS clusters
        ## TODO Combine this with vanilla kubernetes (and future other cloud k8s discovery)
        ## into a dict list, as some of these settings will overlap themselves
        ## though, in theory, many of these settings will never be used if annotations 
        ## or labels are used for lod discovery
        logger.info(f"Checking for AKS clusters.")     
        azure_settings = cloud_config_settings.get("azure", {})
        aks_settings: Optional[dict[str, Any]] = azure_settings.get("aksClusters")
        if aks_settings:
            logger.info(f"Discovering AKS clusters: {aks_settings}")
            kubeconfig_path = "/workspace-builder/.kube/config"
            namespace_lods = aks_settings.get("namespaceLODs", {})
            custom_namespace_names = aks_settings.get("namespaces", [])
            exclude_annotations = aks_settings.get("excludeAnnotations", {})
            exclude_labels = aks_settings.get("excludeLabels", {})


    # Hard-code values to be added
    exclude_annotations.update(HARDCODED_EXCLUDE_ANNOTATIONS)
    for key, values in HARDCODED_EXCLUDE_LABELS.items():
        if key in exclude_labels:
            if isinstance(exclude_labels[key], list):
                if isinstance(values, list):
                    exclude_labels[key].extend(values)
                else:
                    exclude_labels[key].append(values)
            else:
                if isinstance(values, list):
                    exclude_labels[key] = [exclude_labels[key]] + values
                else:
                    exclude_labels[key] = [exclude_labels[key], values]
        else:
            exclude_labels[key] = values

    # If the settings weren't specified in the cloud config, then check if they're
    # configured as top-level settings.
    # TODO: This is the backwards compatibility code that can eventually be removed.
    if not kubeconfig_path:
        kubeconfig_path = component_context.get_setting("KUBECONFIG")
    if not namespace_lods:
        namespace_lods = component_context.get_setting("NAMESPACE_LODS")
    if not custom_namespace_names:
        custom_namespace_names = component_context.get_setting("NAMESPACES")

    if not kubeconfig_path:
        logger.info("No Kubernetes configuration found, so skipping Kubernetes indexing")
        return

    default_lod = component_context.get_setting("DEFAULT_LOD")
    all_accessed_resource_type_specs = component_context.get_property(RESOURCE_TYPE_SPECS_PROPERTY)
    accessed_resource_type_specs = all_accessed_resource_type_specs.get(KUBERNETES_PLATFORM, dict()).keys()
    registry: Registry = component_context.get_property(REGISTRY_PROPERTY_NAME)

    # NOTE: In theory we should just call kubernetes_config.load_config here to load
    # the config file, but there is a bug in that method where the name of the kwarg
    # that it expect for the path to the config file, "kube_config_path", doesn't
    # match the name used for the load_kube_config method, "config_path", so there's
    # no way to specify the kubeconfig location with that API. To get around this
    # we just call the underlying method directly below. Luckily the load_config
    # method doesn't really do any work, it pretty much just forwards to
    # load_kube_config, so it works to bypass it.

    with TemporaryDirectory() as temp_dir:
        # if encoded_kubeconfig_file:
        #     kubeconfig_text = base64.b64decode(encoded_kubeconfig_file).decode('utf-8')
        #     kubeconfig_path = os.path.join(temp_dir, "kubeconfig")
        #     write_file(kubeconfig_path, kubeconfig_text)

        # kubernetes_config.load_kube_config(config_file=kubeconfig_path)
        # contexts, active_context = kubernetes_config.list_kube_config_contexts(config_file=kubeconfig_path)
        # for context in contexts:
        #     context_name = context.get('name')
        #     context_info = context.get('context')
        #     # Create the model object for the cluster associated with the current context
        #     # FIXME: If there are multiple contexts for the same cluster this will update the
        #     # cluster instance with the last context we see, so we'll lose the previous context
        #     # info for the cluster. In practice, I'm not sure this is really a problem, though.
        #     # I don't think any of the gen rules access the context field of the cluster currently,
        #     # and not sure why they would need to. So possibly this info just shouldn't be
        #     # included in the resource at all.
        #     cluster_name = context_info.get('cluster')
        #     # Check if there's already a resource for this cluster.
        #     # This could happen if there were multiple contexts accessing the same cluster,
        #     # presumably with different user credentials that might have different permissions
        #     # to access different namespaces in the cluster, so we might be able to access
        #     # additional resources across different context passes for the same cluster.
        #     # Note: We don't use the built-in add or update logic in the registry's add_resource
        #     # method because if the cluster already exists it would update the namespaces dict in
        #     # the existing resource, which would clobber any of the namespaces that had been
        #     # collected on previous indexing of the cluster.
        #     # FIXME: This feels kludgy. Should think some more about if there's a cleaner way
        #     # to handle this...
        #     # FIXME: Another (nitpicky) issue is that we only keep track of a single context
        #     # for the cluster, even though its resources might be the union of scans across
        #     # multiple contexts. But I don't think we currently really use the context attribute
        #     # for anything, so I don't think this is a big deal.

        # Load the kubeconfig file
        with open(kubeconfig_path, 'r') as kubeconfig_file:
            kubeconfig = yaml.safe_load(kubeconfig_file)

        # Get the lists of clusters and users
        clusters = kubeconfig.get('clusters', [])
        users = kubeconfig.get('users', [])
        contexts = kubeconfig.get('contexts', [])

        for context in contexts:
            context_name = context.get('name')
            context_info = context.get('context')

            # Get the cluster and user names from the context
            cluster_name = context_info.get('cluster')
            user_name = context_info.get('user')

            # Retrieve the full cluster details, including extensions
            cluster_details = next((cluster['cluster'] for cluster in clusters if cluster['name'] == cluster_name), {})
            # Extract extensions from the cluster details
            extensions = cluster_details.get('extensions', {})
            extension_details = None
            if extensions: 
                for ext in extensions:
                    if ext.get('name') == 'workspace-builder':
                        # Fetch the extension details
                        extension_details = ext.get('extension', {})
                        print(f"Found workspace-builder extension for cluster '{cluster_name}': {extension_details}")


            # Retrieve the full user details
            user_details = next((user['user'] for user in users if user['name'] == user_name), {})

            # Debug: Print out all details
            logger.debug(f"Context Name: {context_name}")
            logger.debug(f"Cluster Name: {cluster_name}")
            logger.debug(f"Full Cluster Details: {cluster_details}")

            logger.debug(f"Extensions: {extension_details}")
            logger.debug(f"User Name: {user_name}")
            logger.debug(f"Full User Details: {user_details}")

            cluster = registry.lookup_resource(KUBERNETES_PLATFORM, KubernetesResourceType.CLUSTER.value, cluster_name)
            if cluster:
                cluster_namespaces = getattr(cluster, "namespaces")
            else:
                cluster_namespaces = dict()
                cluster_attributes = {
                    'context': context_name,
                    'namespaces': cluster_namespaces
                }

                if extension_details: 
                    cluster_attributes.update(extension_details)
                    print(f"Adding new cluster '{cluster_name}' with attributes including extension details: {cluster_attributes}")

                cluster = registry.add_resource(KUBERNETES_PLATFORM,
                                                KubernetesResourceType.CLUSTER.value,
                                                cluster_name,
                                                cluster_name,
                                                cluster_attributes)

            logger.info(f"Scanning Kubernetes cluster {cluster_name} from context {context_name}")

            with (kubernetes_config.new_client_from_config(config_file=kubeconfig_path, context=context_name) as api_client):
                core_api_client = client.CoreV1Api(api_client=api_client)
                custom_objects_api_client = client.CustomObjectsApi(api_client=api_client)

                # Get the group info for all the available groups.
                # This contains the preferred version and all available version, which
                # we use below when we access custom resources.

                apis_api_client = client.ApisApi(api_client=api_client)
                ret = apis_api_client.get_api_versions()
                group_version_infos = dict()
                for group in ret.groups:
                    if group.name in group_version_infos:
                        logger.warning(f"Duplicate group information in results from ApisApi.get_api_versions; "
                                       f"group={group.name}")
                    versions = [group_version.version for group_version in group.versions]
                    group_version_info = GroupVersionInfo(group.preferred_version, versions)
                    group_version_infos[group.name] = group_version_info

                namespace_names = set()
                try:
                    # FIXME: Following line is debugging code to simulate not having permissions
                    # to list the namespaces. Remove or comment out before committing!!!!
                    # raise ApiException()
                    ret = core_api_client.list_namespace()
                    logger.debug(f"kube API scan: {len(ret.items)} namespaces")
                    for raw_resource in ret.items:
                        if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                            continue
                        namespace_name = raw_resource.metadata.name
                        namespace_names.add(namespace_name)
                except ApiException as e:
                    # FIXME: Should catch narrower exception corresponding to permissions error
                    # User didn't have permissions access to the namespaces.
                    # This is a common case for OpenShift deployments, so we ignore it here
                    # and check for the OpenShift project resources, which basically mirror
                    # the associated namespace.
                    logger.info(f"Error scanning for namespace instances; skipping and continuing; error: {e}")

                if len(namespace_names) == 0:
                    # We weren't able to retrieve any namespace info above, presumably because the user
                    # associated with the current context doesn't have permissions to list the namespaces.
                    # Next we'll check if it's an OpenShift deployment, in which case there should be
                    # accessible project instances that mirror the namespaces, so we can use the names
                    # of the project to infer the namespace names.
                    # Check for OpenShift project resources and map to namespace instances in the neo4j database
                    # FIXME: Should we always do this or only if we can't access the namespaces?
                    # Is there a case where you'd have access to some subset of the namespaces where
                    # the OpenShift project instances are a superset of the accessible namespaces?
                    openshift_project_group = "project.openshift.io"
                    project_version_info = group_version_infos.get(openshift_project_group)
                    if project_version_info:
                        for version in project_version_info.versions:
                            try:
                                ret = custom_objects_api_client.list_cluster_custom_object(group=openshift_project_group,
                                                                                           version=version,
                                                                                           plural="projects")
                            except ApiException as e:
                                # If there was some error getting the custom resources, just ignore the error
                                # and keep going, so that it's not a fatal error. The typical case we're
                                # handling here is if the user does not have permissions to access the
                                # custom resources.
                                # FIXME: Should probably catch the narrow exception corresponding to a
                                # permissions error.
                                logger.info(f"Error scanning for OpenShift project instances; "
                                            f"skipping and continuing; error: {e}")
                                continue
                            for raw_resource in ret['items']:
                                # FIXME: Will the namespace metadata field be set?
                                # If so, then that seems like a better way to infer the namespace name.
                                # But for now we'll just map from the name of the project
                                metadata = raw_resource['metadata']
                                if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                                    continue
                                project_name = metadata['name']
                                namespace_names.add(project_name)

                if len(namespace_names) == 0:
                    # We still haven't been able to get any information about the available namespaces.
                    # At this point we only have a few things to go on. We have the namespace that's
                    # configured for the context. We can also get namespace names from the keys in the
                    # namespaceLODs setting, if it's specified. Finally, we have the NAMESPACES
                    # setting, which is just an explicit user-configured list of namespace names
                    # FIXME: Eventually it might make sense to decouple this Kubernetes resource discovery
                    # logic from the workspace builder context, i.e. make it a separate resource
                    # discovery REST service. In that case the the namespaceLODs setting, which, at
                    # least currently, is intended for setting the level of detail for the generated
                    # SLXs, might not make sense. Although you could still imagine that something like
                    # it might still be appropriate for a service discovery service to turn on or off
                    # the discovery of specific namespaces. But, anyway, for now, it's a small
                    # convenience to the user to use the namespaceLODs setting, so we'll cross that
                    # potential bridge when we come to it...
                    # First, add the namespace associated with the current context we're scanning
                    namespace_name = context_info.get('namespace')
#                   # The context may not have an associated namespace, so we need to check
                    if namespace_name:
                        namespace_names.add(namespace_name)

                    # Second, add any names gleaned from the namespace LODs setting.
                    # NB: We check for and exclude namespaces with an LOD of 0 below when
                    # we check for accessibility of the namespace, so it doesn't make sense
                    # to also check for it here.
                    namespace_names.update(namespace_lods)

                    # Finally, add the explicit user-configured list of namespace names
                    # FIXME: Currently we don't qualify/scope the configured namespace names with a
                    # corresponding cluster name, so the list will be across all clusters.
                    # Presumably, this will mean that, at least in a multi-cluster kubeconfig
                    # situation, we'll be unnecessarily checking for namespace names when
                    # we're indexing the clusters to which they're not associated. But, at
                    # least functionally this should be ok. We'll just exclude those namespace
                    # names when we do the namespace accessibility check below, so when we
                    # scan for the other types of Kubernetes resources we'll already have
                    # pruned the namespace name list to only the ones that are available in
                    # the current cluster. I guess the only case where it might be an issue
                    # is if we're unnecessarily logging spurious warnings in those cases.
                    # Or, I guess, if there's a case where there's a namespace name that
                    # exists in multiple clusters and the user only wants to index it in
                    # some subset of the clusters. But that seems like an edge case that
                    # I doubt will be an issue for the foreseeable future (famous last words).
                    # And also, that's an issue with the current format of the namespace
                    # LODs dict too, i.e. the key names are not scoped to a specific cluster.
                    namespace_names.update(custom_namespace_names)

                if len(namespace_names) == 0:
                    logger.warning("Unable to determine any namespace names, so can't index any Kubernetes resources")
                    return

                namespaces = dict()
                for namespace_name in namespace_names:
                    namespace_qualified_name = get_qualified_name(cluster_name, namespace_name)
                    # FIXME: Currently you can't have different levels of detail for namespaces with
                    # the same name in different clusters. Should have syntax in the LOD configuration
                    # that let's you qualify by cluster name. For example, a key format that's
                    # "<cluster-name>:<namespace-name>" or something like that.

                    # First, check for LOD in the workspaceInfo configuration
                    namespace_lod_config = namespace_lods.get(namespace_name)
                    namespace_lod = LevelOfDetail.construct_from_config(namespace_lod_config) \
                        if namespace_lod_config is not None else default_lod

                    try:
                        raw_resource = core_api_client.read_namespace(namespace_name)
                        
                        # If LOD is not specified in workspaceInfo, check the annotations
                        if namespace_lod == default_lod:
                            namespace_lod = get_lod_from_annotations(raw_resource, lod_annotations) or namespace_lod
                        
                        if namespace_lod == LevelOfDetail.NONE:
                            continue
                        
                        if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                            continue

                        owner_name = extract_owner_name(raw_resource)
                        namespace_attributes = kubeapi_parsers.parse_namespace(raw_resource)
                        namespace_attributes['cluster'] = cluster
                        namespace_attributes['lod'] = namespace_lod
                        if owner_name:
                            namespace_attributes['owner'] = owner_name 
                        namespace = registry.add_resource(KUBERNETES_PLATFORM,
                                                        KubernetesResourceType.NAMESPACE.value,
                                                        namespace_name,
                                                        namespace_qualified_name,
                                                        namespace_attributes)
                        cluster_namespaces[namespace_qualified_name] = namespace
                        namespaces[namespace_qualified_name] = namespace
                    except ApiException:
                        # We weren't able to access the namespace, presumably either because the
                        # namespace name doesn't exist (e.g. invalid configured explicit
                        # namespace name or the namespace name is associated with a different
                        # cluster) or else the user for this context does not have permission
                        # to access the namespace. In either case, we just ignore the error
                        # and continue.
                        # FIXME: Could possibly log something here, but the concern is that that would
                        # generate too much noise.
                        pass

                for namespace in namespaces.values():
                    namespace_qualified_name = namespace.qualified_name
                    namespace_name = namespace.name

                    logger.info(f'Scanning for Kubernetes resources in namespace "{namespace_name}"')

                    #
                    # Index Deployments, DaemonSets and StatefulSets (the common app Kinds)
                    #

                    apps_api_client = client.AppsV1Api(api_client=api_client)
                    app_info = (
                        ('Deployment', apps_api_client.list_namespaced_deployment, KubernetesResourceType.DEPLOYMENT),
                        ('DaemonSet', apps_api_client.list_namespaced_daemon_set, KubernetesResourceType.DAEMON_SET),
                        ('StatefulSet', apps_api_client.list_namespaced_stateful_set, KubernetesResourceType.STATEFUL_SET),
                    )

                    # Query for the application instances.
                    # We wrap these in try blocks so that any permissions error are just ignored instead
                    # of resulting in fatal errors. So we just log that there was the error and continue.
                    # FIXME: Should really refactor this code a bit to reduce code duplication.

                    for app_class_kind, app_class_list_method, app_resource_type in app_info:
                        try:
                            ret = app_class_list_method(namespace_name)
                            for raw_resource in ret.items:
                                if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                                    continue
                                owner_name = extract_owner_name(raw_resource)
                                app_name = raw_resource.metadata.name
                                app_qualified_name = get_qualified_name(namespace_qualified_name, app_name)
                                app_attributes = kubeapi_parsers.parse_app(raw_resource)
                                app_attributes['kind'] = app_class_kind
                                app_attributes['namespace'] = namespace
                                if owner_name:
                                    app_attributes['owner'] = owner_name
                                app = registry.add_resource(KUBERNETES_PLATFORM,
                                                            app_resource_type.value,
                                                            app_name,
                                                            app_qualified_name,
                                                            app_attributes)
                        except ApiException as e:
                            logger.debug(f"Error scanning for deployment instances; skipping and continuing; error: {e}")

                    #
                    # Index the namespace ingresses
                    #

                    ingresses = dict()
                    ingresses_connected_services = dict()
                    networking_api_client = client.NetworkingV1Api(api_client=api_client)
                    try:
                        ret = networking_api_client.list_namespaced_ingress(namespace_name)
                        logger.debug(f"kube API scan: {len(ret.items)} ingresses")
                        for raw_resource in ret.items:
                            if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                                continue
                            owner_name = extract_owner_name(raw_resource)
                            ingress_name = raw_resource.metadata.name
                            ingress_qualified_name = get_qualified_name(namespace_qualified_name, ingress_name)
                            ingress_attributes = kubeapi_parsers.parse_ingress(raw_resource)
                            paths = ingress_attributes['paths']
                            ingress_attributes["namespace"] = namespace
                            if owner_name:
                                ingress_attributes['owner'] = owner_name
                            ingress = registry.add_resource(KUBERNETES_PLATFORM,
                                                            KubernetesResourceType.INGRESS.value,
                                                            ingress_name,
                                                            ingress_qualified_name,
                                                            ingress_attributes)
                            ingresses[ingress_qualified_name] = ingress
                            # Set this for wiring up services to ingresses later
                            # FIXME: Not sure what this is doing? (RobV)
                            for service_name in paths.values():
                                service_qualified_name = get_qualified_name(namespace_name, service_name)
                                ingresses_connected_services[service_qualified_name] = ingress
                    except ApiException as e:
                        logger.info(f"Error scanning for Ingress instances; skipping and continuing; error: {e}")

                    #
                    # Index the namespace services
                    #
                    services = dict()
                    try:
            
                        ret = core_api_client.list_namespaced_service(namespace_name)
                        logger.debug(f"kube API scan: {len(ret.items)} services")
                        for raw_resource in ret.items:
                            if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                                continue
                            owner_name = extract_owner_name(raw_resource)
                            service_name = raw_resource.metadata.name
                            service_qualified_name = get_qualified_name(namespace_qualified_name, service_name)
                            service_attributes = kubeapi_parsers.parse_service(raw_resource)
                            namespace_name = service_attributes["namespace_name"]
                            service_attributes["namespace"] = namespace
                            if owner_name:
                                service_attributes['owner'] = owner_name
                            if 'ingress' not in service_attributes:
                                ingress = ingresses_connected_services.get(service_qualified_name)
                                service_attributes['ingress'] = ingress
                            service = registry.add_resource(KUBERNETES_PLATFORM,
                                                            KubernetesResourceType.SERVICE.value,
                                                            service_name,
                                                            service_qualified_name,
                                                            service_attributes)
                            services[service_qualified_name] = service
                    except ApiException as e:
                        logger.info(f"Error scanning for Service instances; skipping and continuing; error: {e}")
                    #
                    # Index the pvcs
                    #
                    try:
                        ret = core_api_client.list_namespaced_persistent_volume_claim(namespace_name, watch=False)
                        logger.debug(f"kube API scan for namespace {namespace_name}: {len(ret.items)} pvcs")
                        for raw_resource in ret.items:
                            if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                                continue
                            owner_name = extract_owner_name(raw_resource)
                            pvc_name = raw_resource.metadata.name
                            pvc_qualified_name = get_qualified_name(namespace_qualified_name, pvc_name)
                            pvc_attributes = kubeapi_parsers.parse_pvc(raw_resource)
                            pvc_attributes["namespace"] = namespace
                            if owner_name:
                                pvc_attributes['owner'] = owner_name
                            persistentvolumeclaim = registry.add_resource(KUBERNETES_PLATFORM,
                                                                          KubernetesResourceType.PVC.value,
                                                                          pvc_name,
                                                                          pvc_qualified_name,
                                                                          pvc_attributes)
                    except ApiException as e:
                        logger.info(f"Error scanning for PVC instances; skipping and continuing; error: {e}")
                    ## Dropping this for now since the granularity of pod discovery isn't something
                    ## we would typically add to a map. 
                    #
                    # Index the pods
                    #
                    # try:
                    #     ret = core_api_client.list_namespaced_pod(namespace_name, field_selector="status.phase=Running")
                    #     logger.debug(f"kube API scan for namespace {namespace_name}: {len(ret.items)} pods")
                    #     for raw_resource in ret.items:
                    #         if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                    #             continue
                    #         phase = raw_resource.status.phase
                    #         if phase != "Running":
                    #             continue
                    #         owner_name = extract_owner_name(raw_resource)
                    #         pod_name = raw_resource.metadata.name
                    #         pod_qualified_name = get_qualified_name(namespace_qualified_name, pod_name)
                    #         pod_attributes = kubeapi_parsers.parse_pod(raw_resource)
                    #         pod_attributes["namespace"] = namespace
                    #         if owner_name:
                    #             pod_attributes['owner'] = owner_name
                    #         pod = registry.add_resource(KUBERNETES_PLATFORM,
                    #                                     KubernetesResourceType.POD.value,
                    #                                     pod_name,
                    #                                     pod_qualified_name,
                    #                                     pod_attributes)
                    # except ApiException as e:
                    #     logger.info(f"Error scanning for Pod instances; skipping and continuing; error: {e}")


                    #
                    # Index the custom resources
                    #
                    for resource_type_spec in accessed_resource_type_specs:
                        if resource_type_spec.resource_type_name != KubernetesResourceType.CUSTOM.value:
                            continue
                        group = resource_type_spec.group
                        version = resource_type_spec.version
                        # FIXME: Some remaining inconsistencies between kind vs. plural_name.
                        # Should probably change the field in ResourceTypeSpec to be plural_name, since
                        # it's really not the same as the kind field of the resource.
                        plural_name = resource_type_spec.kind
                        logger.info(f"Trying custom resource {plural_name}.{group}")
                        if version:
                            wildcard_spec = KubernetesResourceTypeSpec(KUBERNETES_PLATFORM,
                                                                       KubernetesResourceType.CUSTOM.value,
                                                                       group,
                                                                       None,
                                                                       plural_name)
                            if wildcard_spec in accessed_resource_type_specs:
                                continue
                            versions = [version]
                        else:
                            group_version_info = group_version_infos.get(group)
                            versions = group_version_info.versions if group_version_info else list()
                        try:
                            for version in versions:
                                ret = custom_objects_api_client.list_namespaced_custom_object(group=group,
                                                                                              version=version,
                                                                                              namespace=namespace_name,
                                                                                              plural=plural_name)
                                for raw_resource in ret['items']:
                                    if has_excluded_annotations_or_labels(raw_resource, exclude_annotations, exclude_labels):
                                        continue
                                    owner_name = extract_owner_name(raw_resource)
                                    resource_name = raw_resource['metadata']['name']
                                    custom_name = f"{plural_name}_{group}_{version}_{resource_name}"
                                    custom_qualified_name = get_qualified_name(namespace_qualified_name, custom_name)
                                    custom_attributes = kubeapi_parsers.parse_custom_resource(raw_resource,
                                                                                              group,
                                                                                              version,
                                                                                              plural_name)
                                    custom_attributes["namespace"] = namespace
                                    if owner_name:
                                        pod_attributes['namespace'] = owner_name
                                    custom_resource = registry.add_resource(KUBERNETES_PLATFORM,
                                                                            KubernetesResourceType.CUSTOM.value,
                                                                            custom_name,
                                                                            custom_qualified_name,
                                                                            custom_attributes)
                        except ApiException as e:
                            # Just log and continue, instead of raising a fatal exception.
                            logger.info(f"Error scanning for custom resource instances; skipping and continuing; "
                                        f"error: {e}, group={group}, kind={plural_name}")

    logger.info("Finished Kubernetes indexing")

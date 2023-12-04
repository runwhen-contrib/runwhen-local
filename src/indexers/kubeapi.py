"""
Index assets that we can find by querying K8s API servers
to fetch live clusters, Namespaces, Ingresses, Services,
Deployments, StatefulSets, etc.
"""
import logging

#########
# K8s API Indexer
#########
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
from .kubetypes import KUBERNETES_PLATFORM, KubernetesResourceType, KubernetesResourceTypeSpec
from resources import Registry, REGISTRY_PROPERTY_NAME
from . import kubeapi_parsers

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

DOCUMENTATION = "Index assets from a Kubernetes configuration"
# FIXME: Is there value in specifying the kube and neo4j settings explicitly
# since it seems like for any reasonable run they will be required. Except
# I guess if we have the split execution where the kube indexing is done by
# the user in their local environment and the rest of the stuff is run on
# RunWhen servers, in which case the RunWhen part presumably won't/can't
# depend on the kube settings (i.e. it won't have access to the kubeconfig)
# and presumably will conceptually just be running enrichers/renderers
# and not the indexers (except possibly for an "indexer" that just reads in
# the serialized state that came from the "real" indexers that were executed
# in the first part by the user in their local environment.
# Need to think about this some more...
SETTINGS = (
    SettingDependency(KUBECONFIG_SETTING, True),
    SettingDependency(NAMESPACES_SETTING, False),
    SettingDependency(NAMESPACE_LODS_SETTING, False),
    SettingDependency(DEFAULT_LOD_SETTING, False)
)


def get_qualified_name(parent_qualified_name: str, object_name: str):
    return f"{parent_qualified_name}/{object_name}"


class GroupVersionInfo:
    def __init__(self, preferred_version: str, versions: list[str]):
        self.preferred_version = preferred_version
        self.versions = versions


def index(component_context: Context):
    logger.debug("starting kube API scan")

    # Access the settings/properties that we need
    kubeconfig_path = component_context.get_setting("KUBECONFIG")
    namespace_lods = component_context.get_setting("NAMESPACE_LODS")
    custom_namespace_names = component_context.get_setting("NAMESPACES")
    default_lod = component_context.get_setting("DEFAULT_LOD")
    all_accessed_resource_type_specs = component_context.get_property(RESOURCE_TYPE_SPECS_PROPERTY)
    accessed_resource_type_specs = all_accessed_resource_type_specs.get(KUBERNETES_PLATFORM)
    registry: Registry = component_context.get_property(REGISTRY_PROPERTY_NAME)

    # NOTE: In theory we should just call kubernetes_config.load_config here to load
    # the config file, but there is a bug in that method where the name of the kwarg
    # that it expect for the path to the config file, "kube_config_path", doesn't
    # match the name used for the load_kube_config method, "config_path", so there's
    # no way to specify the kubeconfig location with that API. To get around this
    # we just call the underlying method directly below. Luckily the load_config
    # method doesn't really do any work, it pretty much just forwards to
    # load_kube_config, so it works to bypass it.
    kubernetes_config.load_kube_config(config_file=kubeconfig_path)
    contexts, active_context = kubernetes_config.list_kube_config_contexts(config_file=kubeconfig_path)
    for context in contexts:
        context_name = context.get('name')
        context_info = context.get('context')

        # Create the model object for the cluster associated with the current context
        # FIXME: If there are multiple contexts for the same cluster this will update the
        # cluster instance with the last context we see, so we'll lose the previous context
        # info for the cluster. In practice, I'm not sure this is really a problem, though.
        # I don't think any of the gen rules access the context field of the cluster currently,
        # and not sure why they would need to. So possibly this info just shouldn't be
        # included in the resource at all.
        cluster_name = context_info.get('cluster')
        # Check if there's already a resource for this cluster.
        # This could happen if there were multiple contexts accessing the same cluster,
        # presumably with different user credentials that might have different permissions
        # to access different namespaces in the cluster, so we might be able to access
        # additional resources across different context passes for the same cluster.
        # Note: We don't use the built-in add or update logic in the registry's add_resource
        # method because if the cluster already exists it would update the namespaces dict in
        # the existing resource, which would clobber any of the namespaces that had been
        # collected on previous indexing of the cluster.
        # FIXME: This feels kludgy. Should think some more about if there's a cleaner way
        # to handle this...
        # FIXME: Another (nitpicky) issue is that we only keep track of a single context
        # for the cluster, even though its resources might be the union of scans across
        # multiple contexts. But I don't think we currently really use the context attribute
        # for anything, so I don't think this is a big deal.
        cluster = registry.lookup_resource(KUBERNETES_PLATFORM, KubernetesResourceType.CLUSTER.value, cluster_name)
        if cluster:
            cluster_namespaces = getattr(cluster, "namespaces")
        else:
            cluster_namespaces = dict()
            cluster_attributes = {
                'context': context_name,
                'namespaces': cluster_namespaces
            }
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
                # I think the group names in the list should be unique, but just to be sure...
                if group.name in group_version_infos:
                    logger.warning(f"Duplicate group information in results from ApisApi.get_api_versions; "
                                   f"group={group.name}")
                versions = [group_version.version for group_version in group.versions]
                group_version_info = GroupVersionInfo(group.preferred_version, versions)
                group_version_infos[group.name] = group_version_info

            #
            # Index the namespaces
            #
            namespace_names = set()
            try:
                # FIXME: Following line is debugging code to simulate not having permissions
                # to list the namespaces. Remove or comment out before committing!!!!
                # raise ApiException()
                ret = core_api_client.list_namespace()
                logger.debug(f"kube API scan: {len(ret.items)} namespaces")
                for raw_resource in ret.items:
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
                # The context may not have an associated namespace, so we need to check
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
                namespace_lod_config = namespace_lods.get(namespace_name)
                namespace_lod = LevelOfDetail.construct_from_config(namespace_lod_config) \
                    if namespace_lod_config is not None else default_lod
                if namespace_lod == LevelOfDetail.NONE:
                    continue
                try:
                    raw_resource = core_api_client.read_namespace(namespace_name)
                    namespace_attributes = kubeapi_parsers.parse_namespace(raw_resource)
                    namespace_attributes['cluster'] = cluster
                    namespace_attributes['lod'] = namespace_lod
                    # namespace_attributes['resources'] = list()
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
                # app_items = list()
                # Query for the application instances.
                # We wrap these in try blocks so that any permissions error are just ignored instead
                # of resulting in fatal errors. So we just log that there was the error and continue.
                # FIXME: Should really refactor this code a bit to reduce code duplication.
                for app_class_kind, app_class_list_method, app_resource_type in app_info:
                    try:
                        ret = app_class_list_method(namespace_name)
                        for raw_resource in ret.items:
                            app_name = raw_resource.metadata.name
                            app_qualified_name = get_qualified_name(namespace_qualified_name, app_name)
                            app_attributes = kubeapi_parsers.parse_app(raw_resource)
                            # When getting lists from the api server, kind and apiVersion are set to None
                            app_attributes['kind'] = app_class_kind
                            app_attributes['namespace'] = namespace
                            # r["cluster_name"] = cluster_name
                            app = registry.add_resource(KUBERNETES_PLATFORM,
                                                        app_resource_type.value,
                                                        app_name,
                                                        app_qualified_name,
                                                        app_attributes)
                            # namespace.resources.append(app)
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
                        ingress_name = raw_resource.metadata.name
                        ingress_qualified_name = get_qualified_name(namespace_qualified_name, ingress_name)
                        ingress_attributes = kubeapi_parsers.parse_ingress(raw_resource)
                        # ingress_attributes["cluster_name"] = cluster_name
                        paths = ingress_attributes['paths']
                        ingress_attributes["namespace"] = namespace
                        ingress = registry.add_resource(KUBERNETES_PLATFORM,
                                                        KubernetesResourceType.INGRESS.value,
                                                        ingress_name,
                                                        ingress_qualified_name,
                                                        ingress_attributes)
                        # namespace.resources.append(ingress)
                        ingresses[ingress_qualified_name] = ingress
                        # Set this for wiring up services to ingresses later
                        # FIXME: Not sure what this is doing? (RobV)
                        for service_name in paths.values():
                            service_qualified_name = get_qualified_name(namespace_name, service_name)
                            ingresses_connected_services[service_qualified_name] = ingress
                except ApiException as e:
                    # Just log and continue, instead of raising a fatal exception.
                    logger.info(f"Error scanning for Ingress instances; skipping and continuing; error: {e}")

                #
                # Index the namespace services
                #
                services = dict()
                try:
                    ret = core_api_client.list_namespaced_service(namespace_name)
                    logger.debug(f"kube API scan: {len(ret.items)} services")
                    for raw_resource in ret.items:
                        service_name = raw_resource.metadata.name
                        service_qualified_name = get_qualified_name(namespace_qualified_name, service_name)
                        service_attributes = kubeapi_parsers.parse_service(raw_resource)
                        namespace_name = service_attributes["namespace_name"]
                        service_attributes["namespace"] = namespace
                        # r["cluster_name"] = cluster_name
                        # Connect service to ingress
                        if 'ingress' not in service_attributes:
                            ingress = ingresses_connected_services.get(service_qualified_name)
                            service_attributes['ingress'] = ingress
                        service = registry.add_resource(KUBERNETES_PLATFORM,
                                                        KubernetesResourceType.SERVICE.value,
                                                        service_name,
                                                        service_qualified_name,
                                                        service_attributes)
                        services[service_qualified_name] = service
                        # namespace.resources.append(service)

                        # Connect service to Deployments, StatefulSets, DaemonSets
                        # FIXME: Need to reimplement the following code to perform the same function as
                        # the neo4j query. Although there's nothing that actually uses the service
                        # connections that are established, so I don't think it will break anything to
                        # not reproduce the old behavior, at least for now.
                        # if service.selector is not None:
                        #     apps = models.kubernetes_filter_by_template_labels(models.KubernetesApp,
                        #                                                        labels=service.selector,
                        #                                                        namespace_name=namespace_name,
                        #                                                        cluster_name=cluster_name)
                        #     for app in apps:
                        #         service.apps.connect(app)
                except ApiException as e:
                    # Just log and continue, instead of raising a fatal exception.
                    logger.info(f"Error scanning for Service instances; skipping and continuing; error: {e}")
                #
                # Index the pvcs
                #
                # pvcs = dict()
                try:
                    ret = core_api_client.list_namespaced_persistent_volume_claim(namespace_name, watch=False)
                    logger.debug(f"kube API scan for namespace {namespace_name}: {len(ret.items)} pvcs")
                    for raw_resource in ret.items:
                        pvc_name = raw_resource.metadata.name
                        pvc_qualified_name = get_qualified_name(namespace_qualified_name, pvc_name)
                        pvc_attributes = kubeapi_parsers.parse_pvc(raw_resource)
                        pvc_attributes["namespace"] = namespace
                        # r['cluster_name'] = cluster_name
                        persistentvolumeclaim = registry.add_resource(KUBERNETES_PLATFORM,
                                                    KubernetesResourceType.PVC.value,
                                                    pvc_name,
                                                    pvc_qualified_name,
                                                    pvc_attributes)
                        # namespace.resources.append(persistentvolumeclaim)
                except ApiException as e:
                    # Just log and continue, instead of raising a fatal exception.
                    logger.info(f"Error scanning for PVC instances; skipping and continuing; error: {e}")

                #
                # Index the pods
                #
                # pods = dict()
                try:
                    ret = core_api_client.list_namespaced_pod(namespace_name, field_selector="status.phase=Running")
                    logger.debug(f"kube API scan for namespace {namespace_name}: {len(ret.items)} pods")
                    for raw_resource in ret.items:
                        phase = raw_resource.status.phase
                        # FIXME: Seems like non-running pods should have already been filtered out by
                        # the field_selector in the list call? So not sure why/if the following lines
                        # are needed?
                        if phase != "Running":
                            continue
                        pod_name = raw_resource.metadata.name
                        pod_qualified_name = get_qualified_name(namespace_qualified_name, pod_name)
                        pod_attributes = kubeapi_parsers.parse_pod(raw_resource)
                        pod_attributes["namespace"] = namespace
                        # r['cluster_name'] = cluster_name
                        pod = registry.add_resource(KUBERNETES_PLATFORM,
                                                    KubernetesResourceType.POD.value,
                                                    pod_name,
                                                    pod_qualified_name,
                                                    pod_attributes)
                        # namespace.resources.append(pod)
                        # pod_key = get_pod_key(namespace_name, pod_name)
                        # pods[pod_key] = pod
                        # TODO: Extract the IP address of the pod
                        # TODO: Create relationship of the pod with a parent service
                except ApiException as e:
                    # Just log and continue, instead of raising a fatal exception.
                    logger.info(f"Error scanning for Pod instances; skipping and continuing; error: {e}")

                #
                # Index the custom resources
                #
                if accessed_resource_type_specs:
                    for resource_type_spec in accessed_resource_type_specs:
                        if resource_type_spec.resource_type_name != KubernetesResourceType.CUSTOM.value:
                            continue
                        group = resource_type_spec.group
                        version = resource_type_spec.version
                        # FIXME: Some remaining inconsistencies between kind vs. plural_name.
                        # Should probably change the field in ResourceTypeSpec to be plural_name, since
                        # it's really not the same as the kind field of the resource.
                        plural_name = resource_type_spec.kind
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
                                    resource_name = raw_resource['metadata']['name']
                                    custom_name = f"{plural_name}|{group}|{version}|{resource_name}"
                                    custom_qualified_name = get_qualified_name(namespace_qualified_name, custom_name)
                                    custom_attributes = kubeapi_parsers.parse_custom_resource(raw_resource,
                                                                                              group,
                                                                                              version,
                                                                                              plural_name)
                                    custom_attributes["namespace"] = namespace
                                    custom_resource = registry.add_resource(KUBERNETES_PLATFORM,
                                                                            KubernetesResourceType.CUSTOM.value,
                                                                            custom_name,
                                                                            custom_qualified_name,
                                                                            custom_attributes)
                                    # namespace.resources.append(custom_resource)
                        except ApiException as e:
                            # Just log and continue, instead of raising a fatal exception.
                            logger.info(f"Error scanning for custom resource instances; skipping and continuing; "
                                        f"error: {e}, group={group}, kind={plural_name}")

    logger.info("Finished Kubernetes indexing")

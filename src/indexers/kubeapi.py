"""
Index assets that we can find by querying K8s API servers
to fetch live clusters, Namepsaces, Ingresses, Services,
Deployments, StatefulSets, etc.
"""
import logging

#########
# K8s API Indexer
#########
from kubernetes import client
from kubernetes import config as kubernetes_config
from kubernetes.client.rest import ApiException

import models
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
from enrichers.generation_rules import ResourceTypeSpec, ResourceType, CUSTOM_RESOURCE_TYPE_SPECS
from enrichers.hclod import NAMESPACE_LODS_SETTING, DEFAULT_LOD_SETTING
from . import kubeapi_parsers

logger = logging.getLogger(__name__)

NAMESPACES_SETTING = Setting("NAMESPACES",
                             "namespaces",
                             Setting.Type.LIST,
                             "Persona data used to initialize persona files",
                             list())


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


def get_service_key(namespace_name, service_name):
    return f"{namespace_name}/{service_name}"


def get_pod_key(namespace_name, pod_name):
    return f"{namespace_name}/{pod_name}"


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
    custom_resource_type_specs = component_context.get_property(CUSTOM_RESOURCE_TYPE_SPECS)

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
        # info for the cluster. In practice, I'm nost sure this is really a problem, though.
        # I don't think any of the gen rules access the context field of the cluster currently,
        # and not sure why they would need to.
        cluster_name = context_info.get('cluster')
        logger.debug(f"starting kube API scan of context {context_name} in cluster {cluster_name}")
        cluster = models.KubernetesCluster.create_or_update({'name': cluster_name, 'context': context_name})[0]

        with kubernetes_config.new_client_from_config(config_file=kubeconfig_path, context=context_name) as api_client:
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
                namespace_lod = namespace_lods.get(namespace_name, default_lod)
                if namespace_lod == 0:
                    continue
                try:
                    raw_resource = core_api_client.read_namespace(namespace_name)
                    r = kubeapi_parsers.parse_namespace(raw_resource)
                    namespace = models.KubernetesNamespace.create_or_update(r, relationship=cluster.namespaces)[0]
                    namespaces[namespace_name] = namespace
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

            for namespace_name in namespaces.keys():
                logger.info(f'Scanning for Kubernetes resources in namespace "{namespace_name}"')
                namespace = namespaces[namespace_name]

                #
                # Index Deployments, DaemonSets and StatefulSets (the common app Kinds)
                #
                apps_api_client = client.AppsV1Api(api_client=api_client)
                app_classes = (
                    ('Deployment', apps_api_client.list_namespaced_deployment, models.KubernetesDeployment),
                    ('DaemonSet', apps_api_client.list_namespaced_daemon_set, models.KubernetesDaemonSet),
                    ('StatefulSet', apps_api_client.list_namespaced_stateful_set, models.KubernetesStatefulSet),
                )
                # app_items = list()
                # Query for the application instances.
                # We wrap these in try blocks so that any permissions error are just ignored instead
                # of resulting in fatal errors. So we just log that there was the error and continue.
                # FIXME: Should really refactor this code a bit to reduce code duplication.
                for app_class_kind, app_class_list_method, app_class_model in app_classes:
                    try:
                        ret = app_class_list_method(namespace_name)
                        for raw_resource in ret.items:
                            r = kubeapi_parsers.parse_app(raw_resource)
                            # When getting lists from the api server, kind and apiVersion are set to None
                            r['kind'] = app_class_kind
                            # r["cluster_name"] = cluster_name
                            app = app_class_model.create_or_update(r, relationship=namespace.resources)[0]
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
                        r = kubeapi_parsers.parse_ingress(raw_resource)
                        # r["cluster_name"] = cluster_name
                        paths = r['paths']  # NOTE - create_or_update will mutate r's values to strings
                        ingress = models.KubernetesIngress.create_or_update(r, relationship=namespace.resources)[0]
                        ingresses[f"{namespace_name}/{ingress_name}"] = ingress
                        # Set this for wiring up services to ingresses later
                        # FIXME: Not sure what this is doing? (RobV)
                        for service_name in paths.values():
                            service_key = get_service_key(namespace_name, service_name)
                            ingresses_connected_services[service_key] = ingress
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
                        r = kubeapi_parsers.parse_service(raw_resource)
                        # r["cluster_name"] = cluster_name
                        service = models.KubernetesService.create_or_update(r, relationship=namespace.resources)[0]
                        service_key = get_service_key(namespace_name, service_name)
                        services[service_key] = service

                        # Connect service to ingress
                        ingress = ingresses_connected_services.get(service_key)
                        if ingress and not service.ingress:
                            service.ingress.connect(ingress)
                            service.save()
                        # Connect service to Deployments, StatefulSets, DaemonSets
                        if service.selector is not None:
                            apps = models.kubernetes_filter_by_template_labels(models.KubernetesApp,
                                                                               labels=service.selector,
                                                                               namespace_name=namespace_name,
                                                                               cluster_name=cluster_name)
                            for app in apps:
                                service.apps.connect(app)
                except ApiException as e:
                    # Just log and continue, instead of raising a fatal exception.
                    logger.info(f"Error scanning for Service instances; skipping and continuing; error: {e}")

                #
                # Index the pods
                #
                # pods = dict()
                try:
                    ret = core_api_client.list_namespaced_pod(namespace_name, field_selector="status.phase=Running")
                    logger.debug(f"kube API scan for namespace {namespace_name}: {len(ret.items)} pods")
                    for raw_resource in ret.items:
                        phase = raw_resource.status.phase
                        # FIXME: Seems like non-running pods should have already beeen filtered out by
                        # the field_selector in the list call? So not sure why/if the following lines
                        # are needed?
                        if phase != "Running":
                            continue
                        # pod_name = raw_resource.metadata.name
                        namespace_name = raw_resource.metadata.namespace
                        namespace = namespaces[namespace_name]
                        r = kubeapi_parsers.parse_pod(raw_resource)
                        # r['cluster_name'] = cluster_name
                        pod = models.KubernetesPod.create_or_update(r, relationship=namespace.resources)[0]
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
                if custom_resource_type_specs:
                    for custom_resource_type_spec in custom_resource_type_specs:
                        group = custom_resource_type_spec.group
                        version = custom_resource_type_spec.version
                        # FIXME: Some remaining inconsistencies between kind vs. plural_name.
                        # Should probably change the field in ResourceTypeSpec to be plural_name, since
                        # it's really not the same as the kind field of the resource.
                        plural_name = custom_resource_type_spec.kind
                        if version:
                            wildcard_spec = ResourceTypeSpec(ResourceType.CUSTOM,
                                                             group=group,
                                                             version=None,
                                                             kind=plural_name)
                            if wildcard_spec in custom_resource_type_specs:
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
                                    kwargs = dict()
                                    # FIXME: Is it guaranteed that there will always be an associated namespace?
                                    # I think probably yes, but should check with Shea. But for now, be careful
                                    # and handle
                                    try:
                                        kwargs['relationship'] = namespace.resources
                                    except ValueError:
                                        # No associated namespace, but continue and just don't set the namespace
                                        # relationship when creating the model instance.
                                        pass
                                    r = kubeapi_parsers.parse_custom_resource(raw_resource, group, version, plural_name)
                                    custom_resource = models.KubernetesCustomResource.create_or_update(r, **kwargs)[0]
                        except ApiException as e:
                            # Just log and continue, instead of raising a fatal exception.
                            logger.info(f"Error scanning for custom resource instances; skipping and continuing; "
                                        f"error: {e}, group={group}, kind={plural_name}")

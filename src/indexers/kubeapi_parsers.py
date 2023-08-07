"""
K8s resource parsing
Take the raw objects that come back from the Kubernetes client APi
and transform them to a form ready for initializing the model state.
"""

from models import kube_escape
from utils import kubernetes_resource_to_dict


def parse_resource(resource):
    """
    Parse fields of interest from a generic resource, returning a dict that will be
    used to initialize the neomodel model instance.
    """
    labels = resource.metadata.labels if resource.metadata.labels else dict()
    annotations = resource.metadata.annotations if resource.metadata.annotations else dict()
    ret = {
        'name': resource.metadata.name,
        'uid': resource.metadata.uid,
        'kind': resource.kind,
        'labels': labels,
        'annotations': annotations,
        'resource': kubernetes_resource_to_dict(resource),
    }
    try:
        ret.update({'owner_uid': resource.metadata.owner.uid})
    except AttributeError as ae:
        pass
    return ret


def parse_namespaced_resource(resource):
    ret = parse_resource(resource)
    ret['namespace_name'] = resource.metadata.namespace
    return ret


def parse_service(resource):
    ret = parse_namespaced_resource(resource)
    # The neomodel library throws a DeflateConflict on create_or_update
    # when a key matching a JSONProperty is set to None.  Undefined is OK,
    # empty {} is OK.  Undefined seems to more easily connote the k8s selector == None
    # than {}.
    if resource.spec.selector:
        ret['selector'] = resource.spec.selector
    return ret


def parse_ingress(resource):
    ret = parse_namespaced_resource(resource)
    service_names = set()
    paths = {}
    for rule in resource.spec.rules:
        host = rule.host
        for path_o in rule.http.paths:
            service_name = path_o.backend.service.name
            service_names.add(service_name)
            path = path_o.path
            paths[f'{host}{path}'] = service_name
    ret['service_names'] = list(service_names)
    ret['paths'] = paths
    return ret


def parse_namespace(resource):
    ret = parse_resource(resource)
    return ret


def parse_app(resource):
    """ Used for Deployments, StatefulSets, DaemonSets and Jobs"""
    ret = parse_namespaced_resource(resource)
    template_labels = resource.spec.template.metadata.labels
    for k, v in template_labels.items():
        fqk = f"template/{k}"
        ret[f"{kube_escape(fqk)}"] = v
    return ret


def parse_pod(resource):
    ret = parse_namespaced_resource(resource)
    return ret


def parse_custom_resource_common(resource):
    # Annoyingly, the results from the call to list the custom resources returns
    # the info in dict form, as opposed to all the other resource types, which
    # return the data in custom classes. So we need to essentially duplicate
    # the logic above for parse_resource, but using dictionary lookups instead
    # of object attribute lookups.
    metadata = resource.get('metadata')

    labels = metadata.get('labels', dict())
    annotations = metadata.get('annotations', dict())
    ret = {
        'name': metadata.get('name'),
        'uid': metadata.get('uid'),
        'kind': resource.get('kind'),
        'labels': labels,
        'annotations': annotations,
        'resource': resource,
    }
    try:
        ret['owner_uid'] = metadata.get('owner').get('uid')
    except AttributeError as ae:
        pass
    return ret


def parse_custom_resource(resource, group, version, plural_name):
    ret = parse_custom_resource_common(resource)
    try:
        # FIXME: Is it safe to assume there will always be a namespace field for
        # a custom resource?
        metadata = resource.get('metadata')
        ret['namespace_name'] = metadata.get('namespace')
    except AttributeError as ae:
        pass
    ret['group'] = group
    ret['version'] = version
    ret['plural_name'] = plural_name
    return ret

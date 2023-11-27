import datetime
import json
import os
from collections.abc import Sequence
from typing import Any, AnyStr, Union

from kubernetes.dynamic.resource import ResourceInstance

from exceptions import WorkspaceBuilderException


def _apply_resource_attribute_map(resource, obj):
    """
    The Kubernetes Python module converts the field names from the Kubernetes YAML file
    from the YAML camel-case standard to the Python snake-case standard. For presenting
    data to the user we want to use the camel-case naming convention that they're used
    to from authoring Kubernetes resource files. That name mapping is available via the
    attribute_map field in the nested resource data. Unfortunately the to_dict method
    doesn't respect the attribute map, so we need to do the remapping ourselves by
    walking the nested data and applying the attribute map to rename the keys in any
    dict object.

    :param resource:
    :param obj:
    :return:
    """
    if isinstance(obj, str):
        converted_obj = obj
    elif isinstance(obj, dict):
        try:
            attribute_map = getattr(resource, "attribute_map")
        except AttributeError:
            # I think there should always be an attribute_map but just to be safe...
            attribute_map = None
        converted_obj = dict()
        for key, obj_value in obj.items():
            converted_key = attribute_map[key] if attribute_map else key
            try:
                # The corresponding obj in the resource is an object with attributes
                # corresponding to the key names
                resource_value = getattr(resource, key)
            except AttributeError:
                try:
                    # The corresponding object in the resource is a dict with keys
                    # corresponding to the key names
                    resource_value = resource[key]
                except (KeyError, TypeError):
                    # There's some unexpected non-object or non-dict in the resource data
                    # I don't think this should ever happen, but just in case...
                    raise WorkspaceBuilderException("Error converting Kubernetes resource to dict")
            converted_value = _apply_resource_attribute_map(resource_value, obj_value)
            converted_obj[converted_key] = converted_value
    elif isinstance(obj, Sequence):
        converted_obj = list()
        for i in range(len(obj)):
            converted_item = _apply_resource_attribute_map(resource[i], obj[i])
            converted_obj.append(converted_item)
    else:
        converted_obj = obj
    return converted_obj


def kubernetes_resource_to_dict(resource: ResourceInstance, use_attribute_map: bool = True) -> dict[str, Any]:
    """
    Convert a resource object returned from the Kubernetes python module into
    an object that only uses standard built-in Python types like scalar types
    dicts, and lists, so that the object is suitable for JSON/YAML serialization.
    In theory, this is what you'd think the resource.to_dict() method would do,
    but the problem is that that returns data that contains datetime objects
    that can't be directly serialized to JSON/YAML. To work around that issue
    we use a custom JSON encoder that converts the datetime objects to strings
    during JSON serialization, so that the data only contains simple data types.

    Note: this implementation is sort of hacky and not super efficient, because
    it round-trips a conversion from the object to JSON and back to objects (minus
    the datetime objects). But we're typically doing this to get an object that
    can then be re-serialized back to JSON or YAML, so not so efficient. There's
    probably a better/cleaner way to do this (e.g. maybe support a similar
    method that converts directly to JSON and then pass the JSON text directly
    to the consumer instead of relying on it to do the JSON serialization, or
    something like that...). But for now, in the context of the map generator
    tool, these small inefficiencies aren't a big deal, so it's not worth
    trying to optimize it at this point.

    :param resource:
        Resource obtained from the Kubernetes python module
    :param use_attribute_map:
        Use the attribute_map field to handle name mappings
    :return:
        Dict object that contains only simple, built-in objects that
        is suitable for JSON serialization
    """
    class DateTimeEncoder(json.JSONEncoder):
        def default(self, value):
            if isinstance(value, datetime.datetime):
                return value.astimezone(datetime.timezone.utc).isoformat()
            else:
                return super().default(value)
    obj = resource.to_dict()
    if use_attribute_map:
        # Convert it again to apply the attribute_map names so that the keys in the
        # dicts use the camel-case naming conventions that the user expects.
        # Again, this is not super efficient, but we don't need to be super performant.
        obj = _apply_resource_attribute_map(resource, obj)
    json_str = json.dumps(obj, cls=DateTimeEncoder)
    obj = json.loads(json_str)
    return obj

def read_file(file_path: AnyStr, mode="r", encoding=None) -> Union[str, bytes]:
    with open(file_path, mode=mode, encoding=encoding) as f:
        return f.read()

def write_file(path: AnyStr, data: AnyStr) -> None:
    directory_path, _ = os.path.split(path)
    os.makedirs(directory_path, exist_ok=True)
    mode = "wb" if type(data) == bytes else "w"
    with open(path, mode=mode) as f:
        f.write(data)

def get_version_info() -> dict[str, Any]:
    json_info = read_file("VERSION", encoding="utf8")
    # with open("VERSION", encoding="utf8") as f:
    #     json_info = f.read()
    info = json.loads(json_info)
    return info

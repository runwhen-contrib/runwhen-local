import base64
import datetime
import json
import os
import fnmatch
from urllib.parse import urlparse

from collections.abc import Sequence
from typing import Any, AnyStr, Union

from kubernetes.dynamic.resource import ResourceInstance

from exceptions import WorkspaceBuilderException, WorkspaceBuilderObjectNotFoundException

class Style:
  RED = "\033[31m"
  GREEN = "\033[32m"
  BLUE = "\033[34m"
  RESET = "\033[0m"


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

def transform_client_cloud_config(base_directory: str, cloud_config: dict[str, dict[str,str]]) -> None:
    """
    Automatically do a path->data transformation for any cloud config setting whose
    name ends in "File".

    TODO: Not 100% sure it's the right thing to do to have this generic code that does
    the file path -> data transformations. It does mean that we don't need to have any
    platform-specific knowledge about which settings are files, but it could cause
    problems if for some reason a platform wants to have a setting in its cloud config
    that ends in "File" but is actually not file data. We can wait to see if that
    turns out to be a problem in practice and only then come up with a different approach
    (presumably something like an explicit list of all of the cloud config settings
    that should be handled as files).

    FIXME: This method doesn't really belong in this utils module, so probably should
    move it somewhere else.
    """
    for platform_name, platform_config in cloud_config.items():
        # Skip if platform_config is None or not a dictionary
        if platform_config is None or not isinstance(platform_config, dict):
            continue
        for key, value in platform_config.items():
            if key.endswith("File") and isinstance(value, str):
                try:
                    file_path = os.path.join(base_directory, value)
                    file_data = read_file(file_path, "rb")
                    encoded_file_data = base64.b64encode(file_data).decode('utf-8')
                    platform_config[key] = encoded_file_data
                except Exception as e:
                    raise WorkspaceBuilderObjectNotFoundException(f"File not found for cloud config setting: "
                                                                  f"base_directory={base_directory}; "
                                                                  f"path={platform_name}/{key}; value={value}") from e

def get_proxy_config(url):
    """
    Checks for HTTP_PROXY, HTTPS_PROXY, and NO_PROXY environment variables
    and returns a dictionary with proxy settings if the URL should not bypass the proxy.

    Args:
        url (str): The URL for the request.

    Returns:
        dict: A dictionary with proxy settings or an empty dictionary if no proxies are configured or should be bypassed.
    """
    if 'NO_PROXY' in os.environ:
        no_proxy = os.environ.get('NO_PROXY', '').split(',')
        if any(fnmatch.fnmatch(urlparse(url).hostname, pattern) for pattern in no_proxy):
            return {}

    proxies = {}
    if 'HTTP_PROXY' in os.environ:
        proxies['http'] = os.environ['HTTP_PROXY']
    if 'HTTPS_PROXY' in os.environ:
        proxies['https'] = os.environ['HTTPS_PROXY']
    return proxies

# FIXME: This function is a workaround for the issue with the requests library not
# recognizing the REQUESTS_CA_BUNDLE environment variable. In the future, this function
# should be removed and the requests library should be updated to recognize the
# REQUESTS_CA_BUNDLE environment variable. This just gives us an easy testing point without
# having to edit all of the lines manually at once where we're currently setting verify.
def get_request_verify():
    """
    Checks for REQUESTS_CA_BUNDLE environment variable and returns the path to the CA bundle if set.

    For today this will just be a workaround for the issue with the requests library not
    recognizing the REQUESTS_CA_BUNDLE environment variable, but in the future it should do as described
    above.

    Today we either want to return None if the REQUESTS_CA_BUNDLE environment variable is not set, or
    False if it is set.
    """
    if 'REQUESTS_CA_BUNDLE' in os.environ:
        return False
    return None

def mask_string(input_string: str, start_visible: int = 2, end_visible: int = 2, mask_char: str = '*') -> str:
    """
    Mask a string by keeping the first and last few characters visible and replacing 
    the middle characters with a specified mask character.

    Args:
        input_string (str): The original string to be masked.
        start_visible (int): The number of characters to keep visible at the start of the string.
        end_visible (int): The number of characters to keep visible at the end of the string.
        mask_char (str): The character used for masking the middle part of the string.

    Returns:
        str: The masked string.
    """
    if len(input_string) <= start_visible + end_visible:
        # If the string is too short to mask, return it as is
        return input_string
    
    masked_string = (
        input_string[:start_visible] +
        mask_char * (len(input_string) - start_visible - end_visible) +
        input_string[-end_visible:]
    )
    return masked_string

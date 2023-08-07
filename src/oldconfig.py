# A simple wrapper to load in configuration as we may change
# this a few times.  Note 

import os
from component import Context
from exceptions import ProdGraphException

# Set logging config
import logging, sys
logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger('neo4j')
logger.setLevel(logging.ERROR)
logger = logging.getLogger('graphviz')
logger.setLevel(logging.ERROR)

# Set internal config
_config = {}
UNDEFINED = "UNDEFINED"

def set_config(key:str, val:str):
    _config[key] = val
    return val

def get_config(key: str, default: str = UNDEFINED):
    """Gets the config value at this key, or returns the default if one was given, or raises
       an AssertionError if the key does not exist and no default was given
    """
    if default == UNDEFINED and not key in _config:
        raise AssertionError(f"No configuration value set for key {key}")
    return _config.get(key, default)

def set_config_from_env(env_var: str, default:str = UNDEFINED):
    val = os.getenv(env_var, default)
    if val == UNDEFINED:
        raise AssertionError(f"No environment variable found at {env_var} to bootstrap configuration")
    return set_config(env_var, val)

def config_to_str():
    ret = ""
    for k,v in _config.items():
        ret += f"{k}={v}"
    return ret

def config_to_dict():
    return _config.copy()

def init_config():
    set_config_from_env('DEFAULT_LOCATION', default='beta-location-us-west2-01')
    set_config_from_env('NAMESPACE_LODS', default='{"kube-system": 0, "kube-public": 0}')
    set_config_from_env('OUTPUT_DIRECTORY', default='/data')
    set_config_from_env('KUBECONFIG', default='/.kube/config/kubeconfig.yaml')
    set_config_from_env('NEO4J_AUTH')
    set_config_from_env('DEFAULT_WORKSPACE_NAME')
    set_config_from_env('WORKSPACE_OWNER_EMAIL')

def build_context() -> Context:
    # FIXME: Need to implement this for the code in the "run" module to work
    raise(ProdGraphException("Not implemented yet"))
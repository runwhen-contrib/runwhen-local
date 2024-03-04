from component import Context, Setting, SettingDependency
from utils import read_file

from resources import Registry, REGISTRY_PROPERTY_NAME

DOCUMENTATION = "Load resource state from a resource dump YAML file"

RESOURCE_LOAD_FILE_SETTING = Setting("RESOURCE_LOAD_FILE",
                                     "resourceLoadFile",
                                     Setting.Type.FILE,
                                     "Dumped resource file to use to load/initialize the resource database.")

SETTINGS = (
    SettingDependency(RESOURCE_LOAD_FILE_SETTING, False),
)

def index(context: Context):
    resource_load_path = context.get_setting(RESOURCE_LOAD_FILE_SETTING)
    if not resource_load_path:
        return
    resource_load_text = read_file(resource_load_path, "r")
    registry = Registry.load(resource_load_text)
    context.set_property(REGISTRY_PROPERTY_NAME, registry)


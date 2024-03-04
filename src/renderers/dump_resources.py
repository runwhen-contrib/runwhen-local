from component import Context, Setting, SettingDependency
from resources import Registry, REGISTRY_PROPERTY_NAME

DOCUMENTATION = "Render/dump resource state to a YAML file"


RESOURCE_DUMP_PATH_SETTING = Setting("RESOURCE_DUMP_PATH",
                                     "resourceDumpPath",
                                     Setting.Type.STRING,
                                     "Location where the resource dump should be written. "
                                     "The path is relative to the output directory")

SETTINGS = (
    SettingDependency(RESOURCE_DUMP_PATH_SETTING, False),
)

def render(context: Context):
    resource_dump_path = context.get_setting(RESOURCE_DUMP_PATH_SETTING)
    if not resource_dump_path:
        return
    registry: Registry = context.properties[REGISTRY_PROPERTY_NAME]
    text = registry.dump()
    context.outputter.write_file(resource_dump_path, text)

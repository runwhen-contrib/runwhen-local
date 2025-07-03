from component import Context, Setting, SettingDependency
from resources import Registry, REGISTRY_PROPERTY_NAME
from enrichers.generation_rules import SLXS_PROPERTY  # for access to aggregated SLX info
import yaml

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
    # ------------------------------------------------------------------
    # 1. Dump the Registry (raw resources)
    # ------------------------------------------------------------------
    registry: Registry = context.properties[REGISTRY_PROPERTY_NAME]

    # ------------------------------------------------------------------
    # 2. Collect SLX aggregated information for easier debugging
    # ------------------------------------------------------------------
    slxs_property = context.get_property(SLXS_PROPERTY, {})
    slx_dump = []
    try:
        for slx_info in slxs_property.values():
            slx_dump.append({
                "full_name": slx_info.full_name,
                "base_name": slx_info.base_name,
                "qualifiers": slx_info.qualifiers,
                "child_resource_names": slx_info.child_resource_names,
            })
    except Exception as e:
        # Fail gracefully – still emit registry even if SLX info unavailable
        slx_dump = [f"error collecting SLX info: {e}"]

    # ------------------------------------------------------------------
    # 3. Write a combined YAML document so everything is in one place
    # ------------------------------------------------------------------
    dump_obj = {
        "registry": registry,
        "slx_infos": slx_dump,
    }

    text = yaml.safe_dump(dump_obj, sort_keys=False)
    context.outputter.write_file(resource_dump_path, text)

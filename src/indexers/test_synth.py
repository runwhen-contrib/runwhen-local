import yaml

from component import Context, Setting, SettingDependency
from resources import Registry, REGISTRY_PROPERTY_NAME

DOCUMENTATION = "Synthesize deterministic test resources for E2E upload tests"

TEST_PLATFORM_NAME = "test"
TEST_RESOURCE_TYPE_NAME = "test_resource"

TEST_CONFIG_SETTING = Setting(
    "TEST_CONFIG",
    "testConfig",
    Setting.Type.STRING,
    "YAML string describing SLXs to synthesize for the simulator pipeline",
)

SETTINGS = (
    SettingDependency(TEST_CONFIG_SETTING, False),
)


def _resource_attrs_from_slx_entry(slug: str, entry: dict) -> dict:
    """Project a test config SLX entry into the attribute dict for a TestResource."""
    return {
        "slx_slug": slug,
        "level_of_detail": entry.get("levelOfDetail", "basic"),
        "code_collection": entry["codeCollection"],
        "code_bundle": entry["codeBundle"],
        "runbook": entry.get("runbook") or {},
        "sli": entry.get("sli") or None,
        "slo": entry.get("slo") or None,
    }


def index(context: Context):
    config_text = context.get_setting(TEST_CONFIG_SETTING)
    if not config_text:
        return

    config = yaml.safe_load(config_text) or {}
    slxs = config.get("slxs") or {}

    registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)
    if registry is None:
        registry = Registry()
        context.set_property(REGISTRY_PROPERTY_NAME, registry)

    for slug, entry in slxs.items():
        attrs = _resource_attrs_from_slx_entry(slug, entry)
        registry.add_resource(
            platform_name=TEST_PLATFORM_NAME,
            resource_type_name=TEST_RESOURCE_TYPE_NAME,
            resource_name=slug,
            resource_qualified_name=slug,
            resource_attributes=attrs,
        )

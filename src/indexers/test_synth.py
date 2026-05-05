from component import Context, Setting, SettingDependency

DOCUMENTATION = "Synthesize deterministic test resources for E2E upload tests"

TEST_CONFIG_SETTING = Setting(
    "TEST_CONFIG",
    "testConfig",
    Setting.Type.STRING,
    "YAML string describing SLXs to synthesize for the simulator pipeline",
)

SETTINGS = (
    SettingDependency(TEST_CONFIG_SETTING, False),
)


def index(context: Context):
    # No-op for now; real synthesis lands in Task 2.
    return

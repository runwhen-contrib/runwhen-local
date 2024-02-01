from component import Setting

CLOUD_CONFIG_SETTING = Setting("CLOUD_CONFIG",
                               "cloudConfig",
                               Setting.Type.DICT,
                               "Configuration/credential info for the cloud input sources",
                               dict())


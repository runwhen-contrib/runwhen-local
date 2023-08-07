"""
    A simple enricher that checks to see if there's an existing RunWhen workspace instance
    in the model database, and, if not, creates one.
"""
import models
from component import Context, SettingDependency, \
    WORKSPACE_NAME_SETTING, WORKSPACE_OWNER_EMAIL_SETTING

# Variables that are used to initialize/configure the component instance
DOCUMENTATION = "A simple enricher that tags any RunWhen workspace nodes with a default workspace name"
SETTINGS = (
    SettingDependency(WORKSPACE_NAME_SETTING, True),
    SettingDependency(WORKSPACE_OWNER_EMAIL_SETTING, True)
)


def enrich(context: Context):
    workspace_name = context.get_setting("WORKSPACE_NAME")
    workspace_owner_email = context.get_setting("WORKSPACE_OWNER_EMAIL")

    # Check if the workspace has already been created. If so, then just use that one.
    # If not, create it.
    try:
        workspace_model = models.RunWhenWorkspace.nodes.get(short_name=workspace_name)
        return
    except Exception as e:
        # Assuming it failed because it doesn't exist, so continue on to create it
        pass

    workspace_model = models.RunWhenWorkspace(short_name=workspace_name, owner_email=workspace_owner_email)
    workspace_model.save()

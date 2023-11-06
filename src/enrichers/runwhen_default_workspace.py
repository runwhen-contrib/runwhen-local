"""
    A simple enricher that checks to see if there's an existing RunWhen workspace instance
    in the model database, and, if not, creates one.
"""
from component import Context, SettingDependency, \
    WORKSPACE_NAME_SETTING, WORKSPACE_OWNER_EMAIL_SETTING
from resources import RUNWHEN_PLATFORM, RunWhenResourceType

# Variables that are used to initialize/configure the component instance
DOCUMENTATION = "A simple enricher that tags any RunWhen workspace nodes with a default workspace name"
SETTINGS = (
    SettingDependency(WORKSPACE_NAME_SETTING, True),
    SettingDependency(WORKSPACE_OWNER_EMAIL_SETTING, True)
)


def enrich(context: Context):
    """
    Initialize the workspace model instance.
    FIXME: At least in the context of the workspace builder use case, I'm not sure it makes
    sense to represent the workspace in the resource registry. Instead if could just be
    initialized as part of the context or something like that.
    Also if we do want to continue to model the workspace as a resource in the registry,
    then it seems like this should be an indexer, not an enricher?
    But to minimize the changes for the removal of neo4j I'm just going to leave it the
    same for now...
    """
    workspace_name = context.get_setting("WORKSPACE_NAME")
    workspace_owner_email = context.get_setting("WORKSPACE_OWNER_EMAIL")
    registry = context.registry

    # Check if the workspace has already been created. If so, then just use that one.
    # If not, create it.
    workspace = registry.lookup_resource(RUNWHEN_PLATFORM, RunWhenResourceType.WORKSPACE.value, workspace_name)
    if not workspace:
        workspace_attributes = {
            "short_name": workspace_name,
            "owner_email": workspace_owner_email,
        }
        workspace = registry.add_resource(RUNWHEN_PLATFORM,
                                          RunWhenResourceType.WORKSPACE.value,
                                          workspace_name,
                                          workspace_name,
                                          workspace_attributes)

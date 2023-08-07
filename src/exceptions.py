# Define some standard exceptions that should be used when raising exception
# from the workspace builder code

class WorkspaceBuilderException(Exception):
    pass


class WorkspaceBuilderUserException(WorkspaceBuilderException):
    pass


class WorkspaceBuilderObjectNotFoundException(WorkspaceBuilderUserException):
    pass

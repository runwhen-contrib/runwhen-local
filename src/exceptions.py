# Define some standard exceptions that should be used when raising exception
# from the workspace builder code

class WorkspaceBuilderException(Exception):
    pass


class WorkspaceBuilderUserException(WorkspaceBuilderException):
    pass


class WorkspaceBuilderObjectNotFoundException(WorkspaceBuilderUserException):
    def __init__(self, kind: str, name: str):
        super().__init__(f"{kind} not found; name={name}")


INVALID_GIT_REPO_MESSAGE = "Invalid/unsupported git repo URL"


class InvalidGitRepoURLException(WorkspaceBuilderUserException):
    def __init__(self, repo_url):
        super().__init__(f"{INVALID_GIT_REPO_MESSAGE}: {repo_url}")
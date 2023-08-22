import os

from exceptions import WorkspaceBuilderException, WorkspaceBuilderUserException, InvalidGitRepoURLException

GIT_REPO_EXTENSION = ".git"
CREATE_REPO_DIRECTORY_NO_AVAILABLE_NAME_MESSAGE = "Too many repos with the same name"


SCHEMA_END_STRING: str = "://"

def get_repo_url_with_auth(repo_url: str, user: str, token: str) -> str:
    """
    Takes a git repo URL without user authentication info and inserts the
    user/token info into the URL before the authority / host name.
    FIXME: Copied (with some modifications) from the git cache code.
    Should refactor to get rid of code duplication
    """
    if not token:
        return repo_url
    i = repo_url.find(SCHEMA_END_STRING)
    if i < 0:
        raise InvalidGitRepoURLException(repo_url)
    scheme_end = i + len(SCHEMA_END_STRING)
    scheme = repo_url[:scheme_end]
    remaining = repo_url[scheme_end:]
    return f"{scheme}{user}:{token}@{remaining}" if user else f"{scheme}{token}@{remaining}"


def get_repo_name(repo_url: str) -> str:
    start = repo_url.rfind('/')
    if start < 0:
        raise InvalidGitRepoURLException(repo_url)
    end = -len(GIT_REPO_EXTENSION) if repo_url.endswith(GIT_REPO_EXTENSION) else len(repo_url)
    return repo_url[start + 1:end]


def create_repo_directory(parent_directory, repo_name, max_tries=100) -> str:
    os.makedirs(parent_directory, exist_ok=True)
    for i in range(1, max_tries):
        name = repo_name if i == 1 else f"{repo_name}.{i}"
        path = os.path.join(parent_directory, name)
        try:
            os.makedirs(path, exist_ok = False)
            return path
        except FileExistsError as e:
            # The directory already exists, presumably because we've already accessed/loaded
            # a different repo with the same name, e.g. a fork of one of the standard code collection.
            # In that case we just continue and try with the next, incremented suffix value.
            pass

    # If we reach here it means that we've exceeded the max number of retries so raise an exception
    raise WorkspaceBuilderException(f"{CREATE_REPO_DIRECTORY_NO_AVAILABLE_NAME_MESSAGE}: {repo_name}")


ORIGIN_REMOTE_PREFIX = "origin/"


def full_to_simple_ref_name(full_name: str) -> str:
    return full_name[len(ORIGIN_REMOTE_PREFIX):] if full_name.startswith(ORIGIN_REMOTE_PREFIX) else full_name


def simple_to_full_ref_name(simple_name: str) -> str:
    return simple_name if simple_name.startswith(ORIGIN_REMOTE_PREFIX) else f"{ORIGIN_REMOTE_PREFIX}{simple_name}"

from azure.devops.connection import Connection
from azure.devops.v7_0.core.models import TeamProject
from azure.devops.v7_0.git.models import GitRepository
from azure.devops.v7_0.pipelines.models import Pipeline
from azure.devops.v7_0.release.models import ReleaseDefinition
from msrest.authentication import BasicAuthentication
from azure.identity import DefaultAzureCredential, ClientSecretCredential
import logging
import os
import requests
import base64
from typing import Any, Dict, List, Optional

from component import Context, SettingDependency
from resources import Registry, REGISTRY_PROPERTY_NAME
from .common import CLOUD_CONFIG_SETTING
from k8s_utils import get_secret

logger = logging.getLogger(__name__)

DOCUMENTATION = "Index Azure DevOps resources including projects, repositories, pipelines, and releases"

SETTINGS = (
    SettingDependency(CLOUD_CONFIG_SETTING, False),
)

AZURE_DEVOPS_PLATFORM = "azure_devops"

def get_azure_devops_access_token_from_service_principal(tenant_id: str, client_id: str, client_secret: str) -> str:
    """Get an Azure DevOps access token using service principal credentials."""
    try:
        credential = ClientSecretCredential(tenant_id, client_id, client_secret)
        # Azure DevOps scope for service principal authentication
        token = credential.get_token("499b84ac-1321-427f-aa17-267ca6975798/.default")
        return token.token
    except Exception as e:
        logger.error(f"Failed to get Azure DevOps access token using service principal: {e}")
        raise

def get_azure_devops_connection_with_pat(organization_url: str, personal_access_token: str) -> Connection:
    """Create an Azure DevOps connection using Personal Access Token."""
    credentials = BasicAuthentication('', personal_access_token)
    return Connection(base_url=organization_url, creds=credentials)

def get_azure_devops_connection_with_service_principal(organization_url: str, access_token: str) -> Connection:
    """Create an Azure DevOps connection using Azure AD access token."""
    credentials = BasicAuthentication('', access_token)
    return Connection(base_url=organization_url, creds=credentials)

def get_pat_from_secret(secret_name: str) -> str:
    """Get Personal Access Token from Kubernetes secret."""
    try:
        logger.info(f"Attempting to retrieve PAT from Kubernetes secret: {secret_name}")
        secret_data = get_secret(secret_name)
        
        # Try different possible key names for the PAT
        pat_keys = ['personalAccessToken', 'pat', 'token', 'access_token']
        for key in pat_keys:
            if key in secret_data:
                pat = base64.b64decode(secret_data[key]).decode('utf-8')
                logger.info(f"Successfully retrieved PAT from secret key: {key}")
                return pat
        
        # If no standard keys found, list available keys for debugging
        available_keys = list(secret_data.keys())
        logger.error(f"PAT not found in secret '{secret_name}'. Available keys: {available_keys}")
        logger.error("Expected one of: personalAccessToken, pat, token, access_token")
        raise ValueError(f"PAT not found in secret '{secret_name}'. Available keys: {available_keys}")
        
    except Exception as e:
        logger.error(f"Failed to retrieve PAT from Kubernetes secret '{secret_name}': {e}")
        raise

def index_projects(connection: Connection) -> List[TeamProject]:
    """Get all projects in the organization."""
    core_client = connection.clients.get_core_client()
    return core_client.get_projects()

def index_repositories(connection: Connection, project: TeamProject) -> List[GitRepository]:
    """Get all Git repositories in a project."""
    git_client = connection.clients.get_git_client()
    return git_client.get_repositories(project.id)

def index_pipelines(connection: Connection, project: TeamProject) -> List[Pipeline]:
    """Get all pipelines in a project."""
    pipelines_client = connection.clients.get_pipelines_client()
    return pipelines_client.list_pipelines(project.id)

def index_releases(connection: Connection, project: TeamProject) -> List[ReleaseDefinition]:
    """Get all release definitions in a project."""
    release_client = connection.clients.get_release_client()
    return release_client.get_release_definitions(project.id)

def index(context: Context) -> None:
    """Index Azure DevOps resources into the registry."""
    logger.info("Starting Azure DevOps indexing")
    
    cloud_config = context.get_setting("CLOUD_CONFIG")
    if not cloud_config:
        logger.warning("No cloud configuration found. Skipping Azure DevOps indexing.")
        return

    logger.debug(f"Cloud config keys: {list(cloud_config.keys())}")
    
    azure_config = cloud_config.get("azure", {})
    logger.debug(f"Azure config keys: {list(azure_config.keys())}")
    
    azure_devops_config = azure_config.get("devops", {})
    logger.debug(f"Azure DevOps config: {azure_devops_config}")
    
    if not azure_devops_config:
        logger.warning("No Azure DevOps configuration found. Skipping indexing.")
        return

    organization_url = azure_devops_config.get("organizationUrl")
    if not organization_url:
        logger.error("Azure DevOps organization URL not specified.")
        return

    # Try multiple authentication methods in order of preference
    connection = None
    
    # Method 1: Personal Access Token from Kubernetes secret
    pat_secret_name = azure_devops_config.get("patSecretName")
    if pat_secret_name:
        logger.info("Using Personal Access Token from Kubernetes secret for Azure DevOps authentication")
        try:
            personal_access_token = get_pat_from_secret(pat_secret_name)
            connection = get_azure_devops_connection_with_pat(organization_url, personal_access_token)
        except Exception as e:
            logger.warning(f"Failed to authenticate with PAT from Kubernetes secret: {e}")
    
    # Method 2: Personal Access Token (from config or environment)
    if not connection:
        personal_access_token = azure_devops_config.get("personalAccessToken") or os.environ.get("AZURE_DEVOPS_PAT")
        if personal_access_token:
            logger.info("Using Personal Access Token for Azure DevOps authentication")
            try:
                connection = get_azure_devops_connection_with_pat(organization_url, personal_access_token)
            except Exception as e:
                logger.warning(f"Failed to authenticate with Personal Access Token: {e}")
    
    # Method 3: Service Principal (from Azure config or environment variables)
    if not connection:
        tenant_id = azure_config.get("tenantId") or os.environ.get("AZURE_TENANT_ID")
        client_id = azure_config.get("clientId") or os.environ.get("AZURE_CLIENT_ID")
        client_secret = azure_config.get("clientSecret") or os.environ.get("AZURE_CLIENT_SECRET")
        
        if tenant_id and client_id and client_secret:
            logger.info("Using Service Principal for Azure DevOps authentication")
            try:
                access_token = get_azure_devops_access_token_from_service_principal(tenant_id, client_id, client_secret)
                connection = get_azure_devops_connection_with_service_principal(organization_url, access_token)
            except Exception as e:
                logger.warning(f"Failed to authenticate with Service Principal: {e}")
    
    # Method 4: Default Azure Credential (for managed identity, Azure CLI, etc.)
    if not connection:
        logger.info("Trying DefaultAzureCredential for Azure DevOps authentication")
        try:
            credential = DefaultAzureCredential()
            token = credential.get_token("499b84ac-1321-427f-aa17-267ca6975798/.default")
            connection = get_azure_devops_connection_with_service_principal(organization_url, token.token)
        except Exception as e:
            logger.warning(f"Failed to authenticate with DefaultAzureCredential: {e}")
    
    if not connection:
        logger.error("Failed to authenticate to Azure DevOps. Please provide either:")
        logger.error("1. Personal Access Token from Kubernetes secret (patSecretName in config)")
        logger.error("2. Personal Access Token (personalAccessToken in config or AZURE_DEVOPS_PAT environment variable)")
        logger.error("3. Service Principal credentials (tenantId, clientId, clientSecret in config or environment variables)")
        logger.error("4. Azure CLI login or managed identity")
        return
    
    try:
        
        # Get registry
        registry: Registry = context.get_property(REGISTRY_PROPERTY_NAME)

        # Index projects
        projects = index_projects(connection)
        for project in projects:
            project_resource = registry.add_resource(
                AZURE_DEVOPS_PLATFORM,
                "project", 
                project.name,
                project.name,
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "state": project.state,
                    "revision": project.revision,
                    "url": project.url,
                    "visibility": project.visibility
                }
            )

            # Index repositories for this project
            repositories = index_repositories(connection, project)
            for repo in repositories:
                repo_resource = registry.add_resource(
                    AZURE_DEVOPS_PLATFORM,
                    "repository",
                    repo.name,
                    f"{project.name}/{repo.name}",
                    {
                        "id": repo.id,
                        "name": repo.name,
                        "url": repo.url,
                        "default_branch": repo.default_branch,
                        "size": repo.size,
                        "remote_url": repo.remote_url,
                        "project": project_resource
                    }
                )

            # Index pipelines for this project
            pipelines = index_pipelines(connection, project)
            for pipeline in pipelines:
                pipeline_resource = registry.add_resource(
                    AZURE_DEVOPS_PLATFORM,
                    "pipeline",
                    pipeline.name,
                    f"{project.name}/{pipeline.name}",
                    {
                        "id": pipeline.id,
                        "name": pipeline.name,
                        "url": pipeline.url,
                        "revision": pipeline.revision,
                        "project": project_resource
                    }
                )

            # Index releases for this project
            releases = index_releases(connection, project)
            for release in releases:
                release_resource = registry.add_resource(
                    AZURE_DEVOPS_PLATFORM,
                    "release",
                    release.name,
                    f"{project.name}/{release.name}",
                    {
                        "id": release.id,
                        "name": release.name,
                        "url": release.url,
                        "revision": release.revision,
                        "project": project_resource
                    }
                )

        logger.info(f"Successfully indexed Azure DevOps resources for organization: {organization_url}")
        logger.info(f"Found {len(projects)} projects, {sum(len(index_repositories(connection, p)) for p in projects)} repositories, "
                   f"{sum(len(index_pipelines(connection, p)) for p in projects)} pipelines, and "
                   f"{sum(len(index_releases(connection, p)) for p in projects)} releases")

    except Exception as e:
        logger.error(f"Error indexing Azure DevOps resources: {str(e)}")
        raise 
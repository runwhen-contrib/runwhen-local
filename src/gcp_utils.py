import base64
import json
import os
import subprocess
import tempfile
import logging
from typing import Any, Optional, Dict, List, Tuple
import sys
from utils import mask_string
from k8s_utils import get_secret

logger = logging.getLogger(__name__)

# Cache for GCP credentials and project info
_gcp_credentials = {
    "project_id": None,
    "service_account_key": None,
    "credentials_file": None,
    "auth_type": None,
    "auth_secret": None
}

def set_gcp_credentials(project_id: str = None, service_account_key: str = None, 
                       credentials_file: str = None, auth_type: str = None, auth_secret: str = None):
    """
    Explicitly set GCP credentials to use for all GCP operations in this module.
    
    Args:
        project_id: The GCP project ID
        service_account_key: Service account JSON key as string
        credentials_file: Path to service account key file
        auth_type: Type of authentication (gcp_service_account, gcp_adc, etc.)
        auth_secret: Name of Kubernetes secret containing credentials
    """
    global _gcp_credentials
    if project_id:
        _gcp_credentials["project_id"] = project_id
    if service_account_key:
        _gcp_credentials["service_account_key"] = service_account_key
    if credentials_file:
        _gcp_credentials["credentials_file"] = credentials_file
    if auth_type:
        _gcp_credentials["auth_type"] = auth_type
    if auth_secret:
        _gcp_credentials["auth_secret"] = auth_secret
        
    logger.info(f"Set GCP credentials with auth type: {auth_type}")

def get_project_name(project_id: str) -> str:
    """
    Get the display name for a GCP project.
    Falls back to project ID if name cannot be retrieved.
    """
    try:
        # Try to get project display name using gcloud
        result = subprocess.run(
            ["gcloud", "projects", "describe", project_id, "--format=value(name)"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        else:
            logger.warning(f"Could not retrieve project name for {mask_string(project_id)}: {result.stderr}")
            return project_id
            
    except Exception as e:
        logger.warning(f"Error retrieving project name for {mask_string(project_id)}: {e}")
        return project_id

def get_gcp_credential(workspace_info):
    """
    Get GCP credentials using workspace configuration.
    Returns project_id, service_account_key, auth_type, auth_secret tuple.
    """
    auth_type = None
    auth_secret = None
    gcp_config = workspace_info.get('cloudConfig', {}).get('gcp', {})
    
    project_id = gcp_config.get('projectId') or gcp_config.get('projects', [None])[0] if gcp_config.get('projects') else None
    service_account_key = gcp_config.get('serviceAccountKey')
    sa_secret_name = gcp_config.get('saSecretName')
    application_credentials_file = gcp_config.get('applicationCredentialsFile')

    # Method 1: Explicit project ID and service account key in workspaceInfo.yaml
    if project_id and service_account_key:
        logger.info("Using explicit GCP service account configuration from workspaceInfo.yaml")
        auth_type = "gcp_service_account"
        return project_id, service_account_key, auth_type, auth_secret

    # Method 2: Service account from Kubernetes secret
    if sa_secret_name:
        logger.info(f"Using GCP service account from Kubernetes secret named {mask_string(sa_secret_name)}")
        try:
            secret_data = get_secret(sa_secret_name)
            project_id = base64.b64decode(secret_data.get('projectId')).decode('utf-8') if secret_data.get('projectId') else project_id
            service_account_key = base64.b64decode(secret_data.get('serviceAccountKey')).decode('utf-8')
            auth_type = "gcp_service_account_secret"
            auth_secret = sa_secret_name
            
            if not project_id:
                logger.warning("Project ID not found in Kubernetes secret. Attempting to extract from service account key.")
                project_id = extract_project_id_from_service_account_key(service_account_key)
                
            return project_id, service_account_key, auth_type, auth_secret
            
        except Exception as e:
            logger.error(f"Failed to retrieve GCP credentials from Kubernetes secret '{sa_secret_name}': {e}")
            sys.exit(1)

    # Method 3: Application credentials file (legacy support)
    if application_credentials_file:
        logger.info(f"Using GCP application credentials file: {application_credentials_file}")
        try:
            with open(application_credentials_file, 'r') as f:
                service_account_key = f.read()
            
            if not project_id:
                project_id = extract_project_id_from_service_account_key(service_account_key)
                
            auth_type = "gcp_service_account_file"
            return project_id, service_account_key, auth_type, auth_secret
            
        except Exception as e:
            logger.error(f"Failed to read GCP application credentials file '{application_credentials_file}': {e}")
            sys.exit(1)

    # Method 4: Application Default Credentials (ADC)
    logger.info("Using GCP Application Default Credentials")
    try:
        # Try to get default project from gcloud config
        if not project_id:
            project_id = get_default_project_id()
            
        auth_type = "gcp_adc"
        return project_id, None, auth_type, auth_secret
        
    except Exception as e:
        logger.error(f"Failed to use GCP Application Default Credentials: {e}")
        sys.exit(1)

def extract_project_id_from_service_account_key(service_account_key: str) -> Optional[str]:
    """
    Extract project ID from a service account JSON key.
    """
    try:
        key_data = json.loads(service_account_key)
        return key_data.get('project_id')
    except json.JSONDecodeError as e:
        logger.error(f"Invalid service account key format: {e}")
        return None
    except Exception as e:
        logger.error(f"Error extracting project ID from service account key: {e}")
        return None

def get_default_project_id() -> Optional[str]:
    """
    Get the default project ID from gcloud configuration.
    """
    try:
        result = subprocess.run(
            ["gcloud", "config", "get-value", "project"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0 and result.stdout.strip():
            project_id = result.stdout.strip()
            logger.info(f"Found default GCP project ID: {mask_string(project_id)}")
            return project_id
        else:
            logger.warning("No default GCP project configured in gcloud")
            return None
            
    except Exception as e:
        logger.warning(f"Error getting default project ID: {e}")
        return None

def authenticate_gcloud(project_id: str = None, service_account_key: str = None, auth_type: str = None):
    """
    Authenticate gcloud CLI with the provided credentials.
    """
    try:
        if auth_type in ["gcp_service_account", "gcp_service_account_secret", "gcp_service_account_file"] and service_account_key:
            # Create temporary service account key file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                f.write(service_account_key)
                key_file = f.name
            
            # Activate service account
            result = subprocess.run(
                ["gcloud", "auth", "activate-service-account", f"--key-file={key_file}"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Clean up temporary file
            os.unlink(key_file)
            
            if result.returncode != 0:
                logger.error(f"Failed to activate GCP service account: {result.stderr}")
                return False
                
            logger.info("Successfully activated GCP service account")
            
        elif auth_type == "gcp_adc":
            # For ADC, we assume gcloud is already authenticated or will use other credential sources
            logger.info("Using GCP Application Default Credentials")
            
        # Set project if provided
        if project_id:
            result = subprocess.run(
                ["gcloud", "config", "set", "project", project_id],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                logger.warning(f"Failed to set GCP project: {result.stderr}")
            else:
                logger.info(f"Set GCP project to: {mask_string(project_id)}")
                
        return True
        
    except Exception as e:
        logger.error(f"Error authenticating gcloud: {e}")
        return False

def generate_gke_kubeconfig(cluster_name: str, zone_or_region: str, project_id: str = None) -> Optional[str]:
    """
    Generate kubeconfig for a GKE cluster using gcloud.
    
    Args:
        cluster_name: Name of the GKE cluster
        zone_or_region: Zone or region where the cluster is located
        project_id: GCP project ID (optional, uses current project if not provided)
        
    Returns:
        Path to the generated kubeconfig file, or None if failed
    """
    try:
        # Create temporary kubeconfig file
        kubeconfig_fd, kubeconfig_path = tempfile.mkstemp(suffix='.kubeconfig')
        os.close(kubeconfig_fd)
        
        # Build gcloud command
        cmd = [
            "gcloud", "container", "clusters", "get-credentials",
            cluster_name,
            f"--zone={zone_or_region}",  # Works for both zones and regions
            f"--kubeconfig={kubeconfig_path}"
        ]
        
        if project_id:
            cmd.extend([f"--project={project_id}"])
            
        # Execute command
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0:
            logger.error(f"Failed to generate GKE kubeconfig: {result.stderr}")
            os.unlink(kubeconfig_path)
            return None
            
        logger.info(f"Successfully generated kubeconfig for GKE cluster {mask_string(cluster_name)}")
        return kubeconfig_path
        
    except Exception as e:
        logger.error(f"Error generating GKE kubeconfig: {e}")
        if 'kubeconfig_path' in locals():
            try:
                os.unlink(kubeconfig_path)
            except:
                pass
        return None

def list_gcp_projects() -> List[Dict[str, str]]:
    """
    List all accessible GCP projects.
    """
    try:
        result = subprocess.run(
            ["gcloud", "projects", "list", "--format=json"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode != 0:
            logger.error(f"Failed to list GCP projects: {result.stderr}")
            return []
            
        projects = json.loads(result.stdout)
        return projects
        
    except Exception as e:
        logger.error(f"Error listing GCP projects: {e}")
        return []

def validate_gcp_credentials(project_id: str = None, service_account_key: str = None, auth_type: str = None) -> bool:
    """
    Validate GCP credentials by attempting to authenticate and access basic project information.
    """
    try:
        if not authenticate_gcloud(project_id, service_account_key, auth_type):
            return False
            
        # Try to access project information as a validation
        if project_id:
            result = subprocess.run(
                ["gcloud", "projects", "describe", project_id],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                logger.error(f"Cannot access GCP project {mask_string(project_id)}: {result.stderr}")
                return False
                
        logger.info("GCP credentials validated successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error validating GCP credentials: {e}")
        return False 
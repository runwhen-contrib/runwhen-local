import base64
import json
import os
import subprocess
import tempfile
import logging
from typing import Any, Optional, Dict, List, Tuple
import sys
import yaml
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
            service_account_key = base64.b64decode(secret_data.get('serviceAccountKey')).decode('utf-8') if secret_data.get('serviceAccountKey') else None
            
            if not service_account_key:
                logger.error(f"Service account key not found in Kubernetes secret '{sa_secret_name}'")
                sys.exit(1)
                
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

def _decode_service_account_key(service_account_key: Optional[str]) -> Optional[str]:
    """
    Normalize a service account key so ``gcloud auth activate-service-account``
    can consume it.

    ``applicationCredentialsFile`` / ``serviceAccountKey`` may arrive either as
    raw JSON or base64-encoded JSON at runtime (the same shapes
    ``src/indexers/gcp_common.py`` handles). Return raw JSON text, or the input
    unchanged when it cannot be confidently decoded.
    """
    if not service_account_key:
        return service_account_key
    text = service_account_key
    if not text.lstrip().startswith("{"):
        try:
            decoded = base64.b64decode(service_account_key).decode("utf-8")
            if decoded.lstrip().startswith("{"):
                text = decoded
        except Exception:
            # Not base64 - fall back to the original content.
            text = service_account_key
    return text


# ---------------------------------------------------------------------------
# Project-ID normalization (shared by GKE auto-discovery)
# ---------------------------------------------------------------------------

def _normalize_project_ids(value) -> list[str]:
    """Normalize a projects config value into a de-duplicated list of project IDs.

    Accepts a single string, a list of strings, or None.
    """
    if value is None:
        return []
    if isinstance(value, str):
        return [p.strip() for p in value.split(",") if p.strip()]
    if isinstance(value, (list, tuple)):
        out: list[str] = []
        for item in value:
            if isinstance(item, dict):
                pid = item.get("projectId") or item.get("project_id") or item.get("id")
                if pid:
                    out.append(str(pid).strip())
            elif item:
                out.append(str(item).strip())
        return out
    return [str(value).strip()]


# Scope every GKE credential to the full cloud-platform scope so the same token
# works for the Container API call and for talking to the cluster apiserver.
GKE_OAUTH_SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]


def _build_gke_credentials(service_account_key: Optional[str], auth_type: Optional[str]):
    """Build a ``google.auth`` credentials object for GKE access (no gcloud).

    Mirrors ``src/indexers/gcp_common.py``: a resolved service-account key
    (already normalized by ``_decode_service_account_key``) becomes a
    ``service_account.Credentials``; the ADC path (``gcp_adc`` / no key) falls
    back to ``google.auth.default()``. SDK imports are lazy so importing this
    module never hard-requires ``google-*`` packages.
    """
    if auth_type == "gcp_adc" or not service_account_key:
        import google.auth  # noqa: WPS433 (lazy import)

        credentials, _ = google.auth.default(scopes=GKE_OAUTH_SCOPES)
        return credentials

    from google.oauth2 import service_account  # noqa: WPS433 (lazy import)

    info = json.loads(service_account_key)
    return service_account.Credentials.from_service_account_info(
        info, scopes=GKE_OAUTH_SCOPES
    )


def _refresh_gke_token(credentials) -> Optional[str]:
    """Mint a fresh OAuth bearer token from ``credentials``.

    GKE authenticates kubeapi calls with a short-lived OAuth2 access token
    (the same token the gke-gcloud-auth-plugin would otherwise fetch). We
    refresh once here and embed it directly in the kubeconfig user.
    """
    import google.auth.transport.requests  # noqa: WPS433 (lazy import)

    credentials.refresh(google.auth.transport.requests.Request())
    return credentials.token


def _new_cluster_manager_client(credentials):
    """Construct a ``container_v1.ClusterManagerClient`` from ``credentials``."""
    from google.cloud import container_v1  # noqa: WPS433 (lazy import)

    return container_v1.ClusterManagerClient(credentials=credentials)


def _fetch_gke_cluster_details(client, project_id: str, location: str, cluster_name: str):
    """Return ``(endpoint, cluster_ca_certificate)`` for a GKE cluster.

    Uses ``ClusterManagerClient.get_cluster`` with the fully-qualified resource
    name, which works identically for zonal and regional ``location`` values.
    ``cluster_ca_certificate`` is already base64-encoded (exactly what a
    kubeconfig ``certificate-authority-data`` field expects).
    """
    name = f"projects/{project_id}/locations/{location}/clusters/{cluster_name}"
    cluster = client.get_cluster(name=name)
    endpoint = getattr(cluster, "endpoint", None)
    master_auth = getattr(cluster, "master_auth", None)
    ca_cert = getattr(master_auth, "cluster_ca_certificate", None) if master_auth else None
    return endpoint, ca_cert


def discover_gke_clusters(project_id: str = None, client=None) -> List[Dict[str, str]]:
    """
    Enumerate GKE clusters via the Container API
    (``ClusterManagerClient.list_clusters`` with ``locations/-``) for use with
    ``gkeClusters.autoDiscover``. Returns a list of cluster dicts shaped like
    the explicit-cluster config (``name`` + ``location``).

    Args:
        project_id: GCP project to enumerate clusters in.
        client: Optional pre-built ``ClusterManagerClient``. When omitted, one
            is built from Application Default Credentials.
    """
    if client is None:
        try:
            credentials = _build_gke_credentials(None, "gcp_adc")
            client = _new_cluster_manager_client(credentials)
        except Exception as e:
            logger.error(f"Failed to build GKE client for auto-discovery: {e}")
            return []

    try:
        parent = f"projects/{project_id}/locations/-"
        response = client.list_clusters(parent=parent)
        raw_clusters = getattr(response, "clusters", None) or []
    except Exception as e:
        logger.error(f"Error listing GKE clusters: {e}")
        return []

    discovered = []
    for c in raw_clusters:
        name = getattr(c, "name", None)
        # The Container API reports the cluster's zone or region in ``location``.
        location = getattr(c, "location", None)
        if name and location:
            discovered.append({"name": name, "location": location})
    logger.info(f"Auto-discovered {len(discovered)} GKE cluster(s)")
    return discovered


def generate_kubeconfig_for_gke(gke_clusters, workspace_info):
    """
    Generate a merged kubeconfig for GKE clusters from GCP credentials, mirroring
    the Azure (``generate_kubeconfig_for_aks``) and AWS
    (``generate_kubeconfig_for_eks``) discovery-time contract.

    This uses the native Google SDKs (``google-cloud-container`` +
    ``google-auth``) instead of shelling out to ``gcloud`` -- consistent with
    the project's "native SDK, drop CLI dependencies" direction (the container
    image does not ship the gcloud CLI). For each cluster it fetches the
    endpoint + CA via the Container API, embeds a short-lived OAuth bearer
    token, injects a ``workspace-builder`` extension (matching the AKS/EKS shape
    so the ``gcp-*`` auth/tag templates and kubeapi indexing work identically),
    and merges every cluster into ``~/.kube/gke-kubeconfig``.

    Args:
        gke_clusters: List of explicit GKE cluster configs. Each is a dict with
            ``name``, ``location`` (or ``zone`` / ``region``), and optional
            ``projectId``.
        workspace_info: Workspace configuration dictionary.
    """
    combined_kubeconfig = {
        'apiVersion': 'v1',
        'kind': 'Config',
        'clusters': [],
        'contexts': [],
        'current-context': '',
        'users': []
    }

    # Resolve GCP credentials once, build a google.auth credential + Container
    # API client, and mint a single short-lived OAuth token reused across every
    # cluster's kubeconfig user. NB: this token is short-lived; that's fine for
    # discovery-time use because kubeapi connects immediately after this runs.
    # We deliberately do NOT wire the gke-gcloud-auth-plugin exec flow (that is
    # exactly the gcloud dependency this rewrite removes).
    project_id, service_account_key, auth_type, auth_secret = get_gcp_credential(workspace_info)
    service_account_key = _decode_service_account_key(service_account_key)
    try:
        credentials = _build_gke_credentials(service_account_key, auth_type)
        oauth_token = _refresh_gke_token(credentials)
        client = _new_cluster_manager_client(credentials)
    except Exception as e:
        logger.error(
            f"Failed to build GCP SDK credentials/client for GKE kubeconfig "
            f"generation; skipping GKE discovery: {e}"
        )
        return

    if not oauth_token:
        logger.error("Could not obtain an OAuth token for GKE; skipping GKE discovery.")
        return

    gke_config = workspace_info.get('cloudConfig', {}).get('gcp', {}).get('gkeClusters', {})
    auto_discover = gke_config.get('autoDiscover', False)

    explicit_clusters = gke_clusters if gke_clusters else []
    if auto_discover:
        logger.info("Auto-discovery enabled for GKE clusters")
        discovery_config = gke_config.get('discoveryConfig', {}) or {}

        # Resolve the set of projects to enumerate. The GCP Container API
        # ``list_clusters`` is scoped per-project (``projects/{id}/locations/-``),
        # so to discover clusters across multiple projects we must call it once
        # per project and merge.
        #
        # Priority:
        #   1. ``discoveryConfig.projectId`` — if set, discover ONLY that project
        #      (acts as an explicit filter). Can be a single string or a list.
        #   2. ``cloudConfig.gcp.projects`` — discover ALL configured projects.
        #   3. ``cloudConfig.gcp.projectId`` — single-project fallback.
        discovery_project_ids: list[str] = []
        discovery_project_id = discovery_config.get('projectId')
        if discovery_project_id:
            discovery_project_ids = _normalize_project_ids(discovery_project_id)
        if not discovery_project_ids:
            gcp_config = workspace_info.get('cloudConfig', {}).get('gcp', {}) or {}
            discovery_project_ids = _normalize_project_ids(gcp_config.get('projects'))
        if not discovery_project_ids:
            discovery_project_ids = _normalize_project_ids(gcp_config.get('projectId'))
        if not discovery_project_ids and project_id:
            discovery_project_ids = [project_id]
        if not discovery_project_ids:
            logger.warning(
                "GKE auto-discovery enabled but no projects configured; "
                "set cloudConfig.gcp.projects or gkeClusters.discoveryConfig.projectId"
            )

        discovered_clusters: list[dict[str, str]] = []
        for pid in discovery_project_ids:
            clusters_in_project = discover_gke_clusters(pid, client=client)
            # Tag each discovered cluster with its project so _fetch_gke_cluster_details
            # uses the right project when the user hasn't set projectId explicitly.
            for c in clusters_in_project:
                c.setdefault('projectId', pid)
            discovered_clusters.extend(clusters_in_project)

        # De-dupe discovered clusters already named explicitly.
        explicit_names = {c.get('name') for c in explicit_clusters}
        discovered_clusters = [c for c in discovered_clusters if c.get('name') not in explicit_names]
        all_clusters = explicit_clusters + discovered_clusters
        logger.info(
            f"Auto-discovered GKE clusters across {len(discovery_project_ids)} project(s): "
            f"{discovery_project_ids}. "
            f"Using {len(explicit_clusters)} explicit clusters + "
            f"{len(discovered_clusters)} discovered clusters = {len(all_clusters)} total"
        )
    else:
        logger.info("Auto-discovery disabled, using only explicitly configured GKE clusters")
        all_clusters = explicit_clusters

    if not all_clusters:
        logger.warning("No GKE clusters configured or discovered")
        return

    for cluster in all_clusters:
        cluster_name = cluster.get('name')
        # Accept location, zone, or region; get_cluster treats them the same.
        location = cluster.get('location') or cluster.get('zone') or cluster.get('region')
        cluster_project_id = cluster.get('projectId') or project_id

        if not cluster_name or not location:
            logger.error(
                f"Skipping GKE cluster with missing name/location: name={cluster_name}, location={location}"
            )
            continue

        try:
            endpoint, ca_cert = _fetch_gke_cluster_details(
                client, cluster_project_id, location, cluster_name
            )
        except Exception as e:
            logger.error(
                f"Skipping GKE cluster {mask_string(cluster_name)}: "
                f"failed to fetch cluster details: {e}"
            )
            continue

        if not endpoint or not ca_cert:
            logger.error(
                f"Skipping GKE cluster {mask_string(cluster_name)}: missing "
                f"endpoint={endpoint is not None} / ca={ca_cert is not None}"
            )
            continue

        # Build the cluster entry directly (no gcloud, no exec), mirroring the
        # EKS generator so merge_kubeconfigs + kubeapi + the gcp-* templates
        # treat GKE identically.
        extension_data = {
            'cluster_type': 'gke',
            'cluster_name': cluster_name,
            'project_id': cluster_project_id,
            'location': location,
            'auth_type': auth_type,
            'auth_secret': auth_secret,
        }
        if 'defaultNamespaceLOD' in cluster:
            extension_data['defaultNamespaceLOD'] = cluster['defaultNamespaceLOD']
            logger.info(
                f"Adding defaultNamespaceLOD to extension for cluster '{cluster_name}': "
                f"{cluster['defaultNamespaceLOD']}"
            )

        cluster_entry = {
            'name': cluster_name,
            'cluster': {
                'server': f"https://{endpoint}",
                'certificate-authority-data': ca_cert,
                'extensions': [{
                    'name': 'workspace-builder',
                    'extension': extension_data,
                }],
            },
        }

        # GKE uses short-lived OAuth bearer tokens for apiserver auth. Embed the
        # token minted above directly (the gke-gcloud-auth-plugin exec flow is
        # intentionally avoided -- that's the gcloud dependency being removed).
        user_name = f"{cluster_name}-user"
        user_entry = {
            'name': user_name,
            'user': {'token': oauth_token},
        }
        context_entry = {
            'name': cluster_name,
            'context': {'cluster': cluster_name, 'user': user_name},
        }

        combined_kubeconfig['clusters'].append(cluster_entry)
        combined_kubeconfig['users'].append(user_entry)
        combined_kubeconfig['contexts'].append(context_entry)

        if not combined_kubeconfig['current-context']:
            combined_kubeconfig['current-context'] = cluster_name
            logger.info(f"Setting current context to: {cluster_name}")

        logger.info(f"Added kubeconfig entry for GKE cluster {mask_string(cluster_name)} in {location}")

    if not combined_kubeconfig['clusters']:
        logger.warning("No GKE clusters were successfully added to the kubeconfig")
        return

    # Save combined kubeconfig to file (run.py's merge_kubeconfigs picks it up).
    kubeconfig_dir = os.path.expanduser("~/.kube")
    if not os.path.exists(kubeconfig_dir):
        os.makedirs(kubeconfig_dir)

    kubeconfig_path = os.path.join(kubeconfig_dir, "gke-kubeconfig")
    try:
        with open(kubeconfig_path, "w") as kubeconfig_file:
            yaml.dump(combined_kubeconfig, kubeconfig_file, default_flow_style=False)
        logger.info(f"Combined GKE kubeconfig saved to {kubeconfig_path}")
    except IOError as e:
        logger.error(f"Failed to write GKE kubeconfig file: {e}")
        raise


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
"""
AWS authentication utilities for RunWhen Local.

Supports multiple authentication methods (in priority order):
1. Explicit access keys from workspaceInfo.yaml
2. Access keys from Kubernetes secret
3. Assume Role (with or without base credentials)
4. EKS Workload Identity (IRSA or Pod Identity)
5. Default AWS credential chain

This module follows the patterns established in azure_utils.py and gcp_utils.py.
"""

import base64
import logging
import os
import sys
import yaml
from typing import Any, Optional, Tuple

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

from k8s_utils import get_secret
from utils import mask_string

logger = logging.getLogger(__name__)

# Cache for AWS credentials
_aws_credentials = {
    "access_key_id": None,
    "secret_access_key": None,
    "session_token": None,
    "region": None,
    "auth_type": None,
    "auth_secret": None,
    "session": None,
}


def set_aws_credentials(
    access_key_id: str = None,
    secret_access_key: str = None,
    session_token: str = None,
    region: str = None,
    auth_type: str = None,
    auth_secret: str = None,
    session: boto3.Session = None
):
    """
    Set AWS credentials for reuse across modules.
    
    Args:
        access_key_id: AWS access key ID
        secret_access_key: AWS secret access key
        session_token: AWS session token (for temporary credentials)
        region: AWS region
        auth_type: Type of authentication used
        auth_secret: Name of Kubernetes secret (if applicable)
        session: Pre-configured boto3 session
    """
    global _aws_credentials
    if access_key_id:
        _aws_credentials["access_key_id"] = access_key_id
    if secret_access_key:
        _aws_credentials["secret_access_key"] = secret_access_key
    if session_token:
        _aws_credentials["session_token"] = session_token
    if region:
        _aws_credentials["region"] = region
    if auth_type:
        _aws_credentials["auth_type"] = auth_type
    if auth_secret:
        _aws_credentials["auth_secret"] = auth_secret
    if session:
        _aws_credentials["session"] = session
    
    logger.info(f"Set AWS credentials with auth type: {auth_type}")


def get_cached_credentials() -> dict:
    """Get the cached AWS credentials."""
    return _aws_credentials.copy()


def get_aws_credential(workspace_info: dict) -> Tuple[boto3.Session, str, Optional[str], Optional[str], Optional[str], str, Optional[str]]:
    """
    Get AWS credentials using workspace configuration.
    
    Evaluates authentication methods in priority order:
    1. Explicit access keys in workspaceInfo.yaml
    2. Credentials from Kubernetes secret
    3. Workload Identity (IRSA or Pod Identity) - detected via environment or config
    4. Assume Role only (uses default chain for base credentials)
    5. Default AWS credential chain
    
    Args:
        workspace_info: The workspace configuration dictionary
        
    Returns:
        Tuple of (session, region, access_key_id, secret_access_key, session_token, auth_type, auth_secret)
    """
    auth_type = None
    auth_secret = None
    aws_config = workspace_info.get('cloudConfig', {}).get('aws', {})
    
    # Get region with fallbacks
    region = aws_config.get('region') or aws_config.get('defaultRegion') or os.environ.get('AWS_DEFAULT_REGION') or 'us-east-1'
    
    # Extract configuration options
    access_key_id = aws_config.get('awsAccessKeyId')
    secret_access_key = aws_config.get('awsSecretAccessKey')
    session_token = aws_config.get('awsSessionToken')
    aws_secret_name = aws_config.get('awsSecretName')
    assume_role_arn = aws_config.get('assumeRoleArn')
    use_workload_identity = aws_config.get('useWorkloadIdentity', False)
    
    # Method 1: Explicit access keys in workspaceInfo.yaml
    if access_key_id and secret_access_key:
        logger.info("Using explicit AWS access keys from workspaceInfo.yaml")
        auth_type = "aws_explicit"
        session = create_boto_session(access_key_id, secret_access_key, session_token, region)
        
        # Handle assume role if specified
        if assume_role_arn:
            session, access_key_id, secret_access_key, session_token = assume_role(
                session, assume_role_arn, aws_config, region
            )
            auth_type = "aws_explicit_assume_role"
        
        # Cache credentials
        set_aws_credentials(
            access_key_id=access_key_id,
            secret_access_key=secret_access_key,
            session_token=session_token,
            region=region,
            auth_type=auth_type,
            session=session
        )
        
        return session, region, access_key_id, secret_access_key, session_token, auth_type, auth_secret
    
    # Method 2: Credentials from Kubernetes secret
    if aws_secret_name:
        logger.info(f"Using AWS credentials from Kubernetes secret: {mask_string(aws_secret_name)}")
        try:
            secret_data = get_secret(aws_secret_name)
            
            # Decode credentials from secret
            access_key_id = base64.b64decode(secret_data.get('awsAccessKeyId', '')).decode('utf-8') if secret_data.get('awsAccessKeyId') else None
            secret_access_key = base64.b64decode(secret_data.get('awsSecretAccessKey', '')).decode('utf-8') if secret_data.get('awsSecretAccessKey') else None
            
            if not access_key_id or not secret_access_key:
                logger.error(f"AWS credentials not found in Kubernetes secret '{aws_secret_name}'")
                sys.exit(1)
            
            session_token = None
            if secret_data.get('awsSessionToken'):
                session_token = base64.b64decode(secret_data.get('awsSessionToken')).decode('utf-8')
            
            # Check for region in secret
            if secret_data.get('region'):
                region = base64.b64decode(secret_data.get('region')).decode('utf-8')
            
            auth_type = "aws_secret"
            auth_secret = aws_secret_name
            session = create_boto_session(access_key_id, secret_access_key, session_token, region)
            
            # Handle assume role if specified
            if assume_role_arn:
                session, access_key_id, secret_access_key, session_token = assume_role(
                    session, assume_role_arn, aws_config, region
                )
                auth_type = "aws_secret_assume_role"
            
            # Cache credentials
            set_aws_credentials(
                access_key_id=access_key_id,
                secret_access_key=secret_access_key,
                session_token=session_token,
                region=region,
                auth_type=auth_type,
                auth_secret=auth_secret,
                session=session
            )
            
            return session, region, access_key_id, secret_access_key, session_token, auth_type, auth_secret
            
        except Exception as e:
            logger.error(f"Failed to retrieve AWS credentials from Kubernetes secret '{aws_secret_name}': {e}")
            sys.exit(1)
    
    # Method 3: EKS Workload Identity (IRSA or Pod Identity)
    if use_workload_identity or os.environ.get('AWS_WEB_IDENTITY_TOKEN_FILE') or os.environ.get('AWS_CONTAINER_CREDENTIALS_FULL_URI'):
        # Determine which workload identity method is in use
        if os.environ.get('AWS_CONTAINER_CREDENTIALS_FULL_URI'):
            logger.info("Using AWS Pod Identity for authentication")
            auth_type = "aws_pod_identity"
        else:
            logger.info("Using AWS Workload Identity (IRSA) for authentication")
            auth_type = "aws_workload_identity"
        
        try:
            # boto3 automatically handles both IRSA and Pod Identity via environment variables
            # IRSA: AWS_WEB_IDENTITY_TOKEN_FILE + AWS_ROLE_ARN
            # Pod Identity: AWS_CONTAINER_CREDENTIALS_FULL_URI + AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE
            session = boto3.Session(region_name=region)
            
            # Verify credentials are working
            if not validate_aws_credentials(session):
                logger.error(f"Failed to authenticate using {auth_type}")
                sys.exit(1)
            
            # Handle additional assume role if specified (in addition to workload identity)
            if assume_role_arn:
                session, access_key_id, secret_access_key, session_token = assume_role(
                    session, assume_role_arn, aws_config, region
                )
                if auth_type == "aws_pod_identity":
                    auth_type = "aws_pod_identity_assume_role"
                else:
                    auth_type = "aws_workload_identity_assume_role"
            
            # Cache credentials
            set_aws_credentials(
                region=region,
                auth_type=auth_type,
                session=session
            )
            
            return session, region, None, None, None, auth_type, auth_secret
            
        except Exception as e:
            logger.error(f"Failed to use AWS Workload Identity: {e}")
            sys.exit(1)
    
    # Method 4: Assume Role only (relies on default chain for base credentials)
    if assume_role_arn:
        logger.info(f"Using AWS Assume Role with default credential chain: {mask_string(assume_role_arn)}")
        auth_type = "aws_assume_role"
        
        try:
            base_session = boto3.Session(region_name=region)
            session, access_key_id, secret_access_key, session_token = assume_role(
                base_session, assume_role_arn, aws_config, region
            )
            
            # Cache credentials
            set_aws_credentials(
                access_key_id=access_key_id,
                secret_access_key=secret_access_key,
                session_token=session_token,
                region=region,
                auth_type=auth_type,
                session=session
            )
            
            return session, region, access_key_id, secret_access_key, session_token, auth_type, auth_secret
            
        except Exception as e:
            logger.error(f"Failed to assume role: {e}")
            sys.exit(1)
    
    # Method 5: Default AWS credential chain
    logger.info("Using default AWS credential chain for authentication")
    auth_type = "aws_default_chain"
    
    try:
        session = boto3.Session(region_name=region)
        
        # Verify credentials are available
        if not validate_aws_credentials(session):
            logger.error("Failed to authenticate using default AWS credential chain. No valid credentials found.")
            sys.exit(1)
        
        identity = get_caller_identity(session)
        if identity:
            logger.info(f"Authenticated as: {mask_string(identity.get('Arn', 'unknown'))}")
        
        # Cache credentials
        set_aws_credentials(
            region=region,
            auth_type=auth_type,
            session=session
        )
        
        return session, region, None, None, None, auth_type, auth_secret
        
    except Exception as e:
        logger.error(f"Failed to authenticate using default AWS credential chain: {e}")
        sys.exit(1)


def create_boto_session(
    access_key_id: str,
    secret_access_key: str,
    session_token: str = None,
    region: str = None
) -> boto3.Session:
    """
    Create a boto3 session with explicit credentials.
    
    Args:
        access_key_id: AWS access key ID
        secret_access_key: AWS secret access key
        session_token: Optional session token for temporary credentials
        region: AWS region
        
    Returns:
        Configured boto3 Session
    """
    return boto3.Session(
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        aws_session_token=session_token,
        region_name=region
    )


def assume_role(
    session: boto3.Session,
    role_arn: str,
    aws_config: dict,
    region: str
) -> Tuple[boto3.Session, str, str, str]:
    """
    Assume an IAM role and return a new session with the assumed credentials.
    
    Args:
        session: Base boto3 session to use for assuming the role
        role_arn: ARN of the role to assume
        aws_config: AWS configuration dictionary with optional assume role settings
        region: AWS region
        
    Returns:
        Tuple of (new_session, access_key_id, secret_access_key, session_token)
    """
    external_id = aws_config.get('assumeRoleExternalId')
    session_name = aws_config.get('assumeRoleSessionName', 'runwhen-local-session')
    duration_seconds = aws_config.get('assumeRoleDurationSeconds', 3600)
    
    logger.info(f"Assuming role: {mask_string(role_arn)}")
    
    sts = session.client('sts', region_name=region)
    
    assume_role_params = {
        'RoleArn': role_arn,
        'RoleSessionName': session_name,
        'DurationSeconds': duration_seconds
    }
    
    if external_id:
        assume_role_params['ExternalId'] = external_id
        logger.info(f"Using external ID for role assumption")
    
    try:
        response = sts.assume_role(**assume_role_params)
    except ClientError as e:
        logger.error(f"Failed to assume role {mask_string(role_arn)}: {e}")
        raise
    
    credentials = response['Credentials']
    access_key_id = credentials['AccessKeyId']
    secret_access_key = credentials['SecretAccessKey']
    session_token = credentials['SessionToken']
    
    new_session = boto3.Session(
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        aws_session_token=session_token,
        region_name=region
    )
    
    logger.info(f"Successfully assumed role: {mask_string(role_arn)}")
    
    return new_session, access_key_id, secret_access_key, session_token


def get_caller_identity(session: boto3.Session) -> Optional[dict]:
    """
    Get the caller identity for the current session.
    
    Args:
        session: boto3 session
        
    Returns:
        Dictionary with Account, Arn, and UserId, or None if failed
    """
    try:
        sts = session.client('sts')
        return sts.get_caller_identity()
    except Exception as e:
        logger.warning(f"Failed to get caller identity: {e}")
        return None


def get_account_id(session: boto3.Session) -> Optional[str]:
    """
    Get the AWS account ID for the current session.
    
    Args:
        session: boto3 session
        
    Returns:
        Account ID string, or None if failed
    """
    identity = get_caller_identity(session)
    if identity:
        return identity.get('Account')
    return None


def get_account_alias(session: boto3.Session) -> Optional[str]:
    """
    Get the AWS account alias for the current session.
    
    Args:
        session: boto3 session
        
    Returns:
        Account alias string, or None if not set or failed
    """
    try:
        iam = session.client('iam')
        aliases = iam.list_account_aliases()
        if aliases.get('AccountAliases'):
            return aliases['AccountAliases'][0]
        return None
    except Exception as e:
        logger.warning(f"Failed to get AWS account alias: {e}")
        return None


def get_account_name(
    session: boto3.Session,
    account_id: str = None,
    account_alias: str = None,
) -> str:
    """
    Get a human-readable AWS account name, similar to Azure's subscription_name.
    
    Resolution order:
    1. IAM account alias (if already provided)
    2. AWS Account Management API (account:GetAccountInformation) - works for own account
    3. Falls back to account_id (similar to Azure falling back to subscription_id)
    
    Args:
        session: boto3 session
        account_id: AWS account ID (used as fallback)
        account_alias: Pre-fetched IAM account alias (avoids redundant API call)
        
    Returns:
        Human-readable account name string (never None)
    """
    logger.info(f"Resolving account name: account_id={account_id}, account_alias={account_alias}")
    
    # 1. Use IAM alias if already fetched
    if account_alias:
        logger.info(f"[account_name] Using IAM account alias: {account_alias}")
        return account_alias
    
    # 2. Try AWS Account Management API (account:GetAccountInformation)
    target_account_id = account_id or get_account_id(session)
    caller_account_id = get_account_id(session)
    is_cross_account = target_account_id and caller_account_id and target_account_id != caller_account_id
    logger.info(f"[account_name] No IAM alias available, trying Account Management API for account {target_account_id} "
                 f"(caller={caller_account_id}, cross_account={is_cross_account})")
    try:
        account_client = session.client('account')
        # For cross-account lookups, pass AccountId explicitly.
        # For the caller's own account, omit it (AWS requires this for management accounts).
        api_params = {}
        if is_cross_account:
            api_params['AccountId'] = target_account_id
        response = account_client.get_account_information(**api_params)
        logger.info(f"[account_name] Account Management API raw response keys: {list(response.keys())}")
        account_name = response.get('AccountName')
        logger.info(f"[account_name] AccountName from response: {account_name}")
        if account_name:
            logger.info(f"[account_name] Resolved account name from Account Management API: {target_account_id} -> {account_name}")
            return account_name
        else:
            logger.warning(f"[account_name] Account Management API returned no AccountName. Full response: {response}")
    except Exception as e:
        logger.warning(
            f"[account_name] account:GetAccountInformation failed for account {target_account_id}: {type(e).__name__}: {e}. "
            f"Ensure the credentials have account:GetAccountInformation permission."
        )
    
    # 3. Fall back to account_id
    fallback = target_account_id or "unknown-account"
    logger.warning(f"[account_name] Could not resolve account name, falling back to account_id: {fallback}")
    return fallback


def enumerate_regions(session: boto3.Session, service: str = 'ec2') -> list:
    """
    Enumerate all available AWS regions for a service.
    
    Args:
        session: boto3 session
        service: AWS service name (default: ec2)
        
    Returns:
        List of region names
    """
    try:
        # Use us-east-1 as a reliable region to query available regions
        ec2 = session.client('ec2', region_name='us-east-1')
        regions = ec2.describe_regions()
        return [r['RegionName'] for r in regions.get('Regions', [])]
    except Exception as e:
        logger.warning(f"Failed to enumerate AWS regions: {e}")
        return ['us-east-1']  # Fallback to us-east-1


def validate_aws_credentials(session: boto3.Session) -> bool:
    """
    Validate AWS credentials by calling STS GetCallerIdentity.
    
    Args:
        session: boto3 session to validate
        
    Returns:
        True if credentials are valid, False otherwise
    """
    try:
        sts = session.client('sts')
        sts.get_caller_identity()
        return True
    except (ClientError, NoCredentialsError) as e:
        logger.warning(f"AWS credential validation failed: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error validating AWS credentials: {e}")
        return False


def get_aws_environment_vars(
    access_key_id: Optional[str] = None,
    secret_access_key: Optional[str] = None,
    session_token: Optional[str] = None,
    region: Optional[str] = None,
    session: Optional[boto3.Session] = None
) -> dict:
    """
    Get AWS environment variables for passing to subprocesses.
    
    For Pod Identity, CloudQuery rejects the credential endpoint (169.254.170.23) 
    as non-loopback, so we fetch temporary credentials and pass them explicitly.
    
    Args:
        access_key_id: AWS access key ID
        secret_access_key: AWS secret access key
        session_token: AWS session token
        region: AWS region
        session: boto3 session to get credentials from (for Pod Identity)
        
    Returns:
        Dictionary of environment variable names and values
    """
    env_vars = {}
    
    # For Pod Identity: fetch credentials explicitly since CloudQuery rejects the endpoint
    if os.environ.get('AWS_CONTAINER_CREDENTIALS_FULL_URI') and not access_key_id and session:
        logger.info("Pod Identity detected - fetching temporary credentials for CloudQuery")
        try:
            creds = session.get_credentials()
            if creds:
                access_key_id = creds.access_key
                secret_access_key = creds.secret_key
                session_token = creds.token
                logger.info("Retrieved temporary credentials from Pod Identity for CloudQuery")
        except Exception as e:
            logger.warning(f"Failed to fetch Pod Identity credentials explicitly: {e}")
    
    # Pass explicit credentials if provided
    if access_key_id:
        env_vars['AWS_ACCESS_KEY_ID'] = access_key_id
    if secret_access_key:
        env_vars['AWS_SECRET_ACCESS_KEY'] = secret_access_key
    if session_token:
        env_vars['AWS_SESSION_TOKEN'] = session_token
    if region:
        env_vars['AWS_DEFAULT_REGION'] = region
        env_vars['AWS_REGION'] = region
    
    # Pass IRSA environment variables (CloudQuery supports these)
    # IRSA uses web identity token files which CloudQuery accepts
    if os.environ.get('AWS_WEB_IDENTITY_TOKEN_FILE') and not access_key_id:
        env_vars['AWS_WEB_IDENTITY_TOKEN_FILE'] = os.environ.get('AWS_WEB_IDENTITY_TOKEN_FILE')
        if os.environ.get('AWS_ROLE_ARN'):
            env_vars['AWS_ROLE_ARN'] = os.environ.get('AWS_ROLE_ARN')
        if os.environ.get('AWS_ROLE_SESSION_NAME'):
            env_vars['AWS_ROLE_SESSION_NAME'] = os.environ.get('AWS_ROLE_SESSION_NAME')
    
    # Note: We do NOT pass Pod Identity env vars to CloudQuery as it rejects the endpoint
    # Instead, we fetch credentials above and pass them explicitly
    
    return env_vars


def discover_eks_clusters(session: boto3.Session, regions: list = None) -> list:
    """
    Discover EKS clusters in specified regions.
    
    Args:
        session: boto3 session
        regions: List of regions to search (default: all available regions)
        
    Returns:
        List of discovered cluster configurations
    """
    discovered_clusters = []
    
    if not regions:
        regions = enumerate_regions(session)
    
    for region in regions:
        try:
            eks = session.client('eks', region_name=region)
            clusters = eks.list_clusters()
            
            for cluster_name in clusters.get('clusters', []):
                try:
                    cluster_info = eks.describe_cluster(name=cluster_name)
                    cluster = cluster_info.get('cluster', {})
                    
                    discovered_clusters.append({
                        'name': cluster_name,
                        'region': region,
                        'endpoint': cluster.get('endpoint'),
                        'arn': cluster.get('arn'),
                        'status': cluster.get('status'),
                        'version': cluster.get('version'),
                        'certificateAuthority': cluster.get('certificateAuthority', {}).get('data'),
                        'cluster_type': 'eks'
                    })
                    logger.info(f"Discovered EKS cluster: {cluster_name} in {region} (endpoint: {cluster.get('endpoint') is not None}, ca: {cluster.get('certificateAuthority', {}).get('data') is not None})")
                    
                except ClientError as e:
                    logger.warning(f"Error describing EKS cluster {cluster_name} in {region}: {e}")
                    
        except ClientError as e:
            logger.debug(f"Error listing EKS clusters in {region}: {e}")
    
    logger.info(f"Total EKS clusters discovered: {len(discovered_clusters)}")
    return discovered_clusters


def generate_kubeconfig_for_eks(clusters, workspace_info):
    """
    Generate kubeconfig for EKS clusters with AWS IAM authenticator.
    
    Args:
        clusters: List of explicit EKS cluster configurations
        workspace_info: Workspace configuration dictionary
    """
    combined_kubeconfig = {
        'apiVersion': 'v1',
        'kind': 'Config',
        'clusters': [],
        'contexts': [],
        'current-context': '',
        'users': []
    }
    
    # Get AWS session and configuration
    aws_config = workspace_info.get('cloudConfig', {}).get('aws', {})
    
    # Get or create AWS session
    # get_aws_credential returns: session, region, akid, sak, stkn, auth_type, auth_secret
    session, region, _, _, _, auth_type, auth_secret = get_aws_credential(workspace_info)
    
    # Get account info
    account_id = get_account_id(session)
    account_alias = get_account_alias(session)
    
    # Check if auto-discovery is enabled
    eks_config = aws_config.get('eksClusters', {})
    auto_discover = eks_config.get('autoDiscover', False)
    
    if auto_discover:
        logger.info("Auto-discovery enabled for EKS clusters")
        discovery_config = eks_config.get('discoveryConfig', {})
        regions = discovery_config.get('regions', [region])
        discovered_clusters = discover_eks_clusters(session, regions)
        
        # Merge discovered clusters with explicitly configured clusters
        explicit_clusters = clusters if clusters else []
        all_clusters = explicit_clusters + discovered_clusters
        
        logger.info(f"Using {len(explicit_clusters)} explicit clusters + {len(discovered_clusters)} discovered clusters = {len(all_clusters)} total")
    else:
        logger.info("Auto-discovery disabled, using only explicitly configured clusters")
        all_clusters = clusters if clusters else []
    
    if not all_clusters:
        logger.warning("No EKS clusters configured or discovered")
        return
    
    # Generate kubeconfig entries for each cluster
    for cluster in all_clusters:
        cluster_name = cluster.get('name')
        cluster_region = cluster.get('region', region)
        
        # Always fetch full cluster details from EKS API
        try:
            eks = session.client('eks', region_name=cluster_region)
            cluster_info = eks.describe_cluster(name=cluster_name)
            cluster_data = cluster_info.get('cluster', {})
            cluster_endpoint = cluster_data.get('endpoint')
            cluster_arn = cluster_data.get('arn')
            cluster_ca_data = cluster_data.get('certificateAuthority', {}).get('data')
            
            logger.info(f"Fetched cluster details for {cluster_name}: endpoint={cluster_endpoint is not None}, ca_data={cluster_ca_data is not None}")
            
        except ClientError as e:
            logger.error(f"Failed to describe EKS cluster {cluster_name} in region {cluster_region}: {e}")
            continue
        
        if not cluster_endpoint or not cluster_ca_data:
            logger.error(f"Missing required data for EKS cluster {cluster_name}: endpoint={cluster_endpoint is not None}, ca_data={cluster_ca_data is not None}")
            continue
        
        # Create cluster entry
        cluster_entry = {
            'name': cluster_name,
            'cluster': {
                'server': cluster_endpoint,
                'certificate-authority-data': cluster_ca_data,
                'extensions': [{
                    'name': 'workspace-builder',
                    'extension': {
                        'cluster_type': 'eks',
                        'cluster_name': cluster_name,
                        'region': cluster_region,
                        'account_id': account_id,
                        'auth_type': auth_type,
                        'auth_secret': auth_secret,
                        'cluster_arn': cluster_arn
                    }
                }]
            }
        }
        
        # Add defaultNamespaceLOD if it exists in the cluster config
        if 'defaultNamespaceLOD' in cluster:
            cluster_entry['cluster']['extensions'][0]['extension']['defaultNamespaceLOD'] = cluster['defaultNamespaceLOD']
            logger.info(f"Adding defaultNamespaceLOD to extension for cluster '{cluster_name}': {cluster['defaultNamespaceLOD']}")
        
        combined_kubeconfig['clusters'].append(cluster_entry)
        
        # Create user entry with AWS IAM authenticator
        user_name = f"{cluster_name}-user"
        
        # Build environment variables for the exec command
        # Must pass AWS auth env vars so kubectl can authenticate
        exec_env = []
        
        # Pass Pod Identity env vars
        if os.environ.get('AWS_CONTAINER_CREDENTIALS_FULL_URI'):
            exec_env.append({
                'name': 'AWS_CONTAINER_CREDENTIALS_FULL_URI',
                'value': os.environ.get('AWS_CONTAINER_CREDENTIALS_FULL_URI')
            })
        if os.environ.get('AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE'):
            exec_env.append({
                'name': 'AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE',
                'value': os.environ.get('AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE')
            })
        
        # Pass IRSA env vars
        if os.environ.get('AWS_WEB_IDENTITY_TOKEN_FILE'):
            exec_env.append({
                'name': 'AWS_WEB_IDENTITY_TOKEN_FILE',
                'value': os.environ.get('AWS_WEB_IDENTITY_TOKEN_FILE')
            })
        if os.environ.get('AWS_ROLE_ARN'):
            exec_env.append({
                'name': 'AWS_ROLE_ARN',
                'value': os.environ.get('AWS_ROLE_ARN')
            })
        if os.environ.get('AWS_ROLE_SESSION_NAME'):
            exec_env.append({
                'name': 'AWS_ROLE_SESSION_NAME',
                'value': os.environ.get('AWS_ROLE_SESSION_NAME')
            })
        
        # Pass region
        if cluster_region:
            exec_env.append({
                'name': 'AWS_DEFAULT_REGION',
                'value': cluster_region
            })
        
        user_entry = {
            'name': user_name,
            'user': {
                'exec': {
                    'apiVersion': 'client.authentication.k8s.io/v1beta1',
                    'command': 'aws',
                    'args': [
                        'eks',
                        'get-token',
                        '--cluster-name', cluster_name,
                        '--region', cluster_region
                    ],
                    'env': exec_env if exec_env else None
                }
            }
        }
        combined_kubeconfig['users'].append(user_entry)
        
        # Create context entry
        context_name = cluster_name
        context_entry = {
            'name': context_name,
            'context': {
                'cluster': cluster_name,
                'user': user_name
            }
        }
        combined_kubeconfig['contexts'].append(context_entry)
        
        # Set first cluster as current context
        if not combined_kubeconfig['current-context']:
            combined_kubeconfig['current-context'] = context_name
            logger.info(f"Setting current context to: {context_name}")
        
        logger.info(f"Added kubeconfig entry for EKS cluster {cluster_name} in region {cluster_region}")
    
    # Save combined kubeconfig to file
    kubeconfig_dir = os.path.expanduser("~/.kube")
    if not os.path.exists(kubeconfig_dir):
        os.makedirs(kubeconfig_dir)
    
    kubeconfig_path = os.path.join(kubeconfig_dir, "eks-kubeconfig")
    try:
        with open(kubeconfig_path, "w") as kubeconfig_file:
            yaml.dump(combined_kubeconfig, kubeconfig_file, default_flow_style=False)
        logger.info(f"Combined kubeconfig saved to {kubeconfig_path}")
    except IOError as e:
        logger.error(f"Failed to write kubeconfig file: {e}")
        raise

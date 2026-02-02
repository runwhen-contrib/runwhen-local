# AWS Authentication Enhancement Plan

## Overview

This document outlines the plan to enhance AWS authentication support in RunWhen Local, following the patterns established for Azure and GCP. Currently, AWS authentication only supports explicit access key/secret key pairs. This enhancement will add support for:

- **Kubernetes Secret-based credentials** (like Azure's `spSecretName` and GCP's `saSecretName`)
- **Default AWS credential chain** (IAM roles, instance profiles, environment variables)
- **AWS Workload Identity (EKS IRSA)** - IAM Roles for Service Accounts
- **Assume Role support** for cross-account access

## Current State Analysis

### Azure Authentication (Reference Pattern)

Azure supports three authentication methods in priority order:

1. **Explicit Service Principal** - Direct credentials in `workspaceInfo.yaml`
   - Fields: `tenantId`, `clientId`, `clientSecret`, `subscriptionId`
   - Auth type: `azure_explicit`

2. **Kubernetes Secret Service Principal** - Credentials from K8s secret
   - Field: `spSecretName`
   - Auth type: `azure_service_principal_secret`

3. **Managed Identity/DefaultAzureCredential** - Automatic credential chain
   - No explicit credentials needed
   - Auth type: `azure_managed_identity` or `azure_identity`

Key implementation files:
- `src/azure_utils.py` - Core authentication logic
- `src/enrichers/azure.py` - Credential caching and enricher integration
- `src/templates/azure-auth.yaml` - Template for auth configuration in generated workspace
- `src/indexers/cloudquery.py` - CloudQuery integration

### GCP Authentication (Reference Pattern)

GCP supports four authentication methods:

1. **Explicit Service Account** - Key in `workspaceInfo.yaml`
   - Fields: `projectId`, `serviceAccountKey`
   - Auth type: `gcp_service_account`

2. **Kubernetes Secret Service Account** - Key from K8s secret
   - Field: `saSecretName`
   - Auth type: `gcp_service_account_secret`

3. **Application Credentials File** - Local file reference
   - Field: `applicationCredentialsFile`
   - Auth type: `gcp_service_account_file`

4. **Application Default Credentials (ADC)** - Automatic credential chain
   - Auth type: `gcp_adc`

### Current AWS Authentication (Limited)

Currently, AWS only supports:
- `awsAccessKeyId` and `awsSecretAccessKey` in `workspaceInfo.yaml`
- Optional `awsSessionToken` for temporary credentials
- No fallback to AWS credential chain
- No Kubernetes secret support
- `boto3` is imported but unused

## Proposed AWS Authentication Methods

### Priority Order (Matching Azure/GCP Pattern)

1. **Explicit Access Keys** (`aws_explicit`)
   - Fields: `awsAccessKeyId`, `awsSecretAccessKey`, `awsSessionToken` (optional)
   - Existing functionality - keep as-is

2. **Kubernetes Secret** (`aws_secret`)
   - Field: `awsSecretName`
   - Secret keys: `awsAccessKeyId`, `awsSecretAccessKey`, `awsSessionToken` (optional)

3. **Assume Role** (`aws_assume_role`)
   - Field: `assumeRoleArn` (with optional `assumeRoleExternalId`, `assumeRoleSessionName`)
   - Can be combined with other auth methods as the base credential

4. **AWS Workload Identity / IRSA** (`aws_workload_identity` or `aws_irsa`)
   - Field: `useWorkloadIdentity: true` or auto-detected in EKS
   - Uses web identity token from projected service account token

5. **Default Credential Chain** (`aws_default_chain`)
   - No explicit credentials - fallback behavior
   - Supports: environment variables, shared credentials file, instance profile, etc.

## Implementation Plan

### Phase 1: Create `aws_utils.py` Module

Create a new module following the pattern of `azure_utils.py` and `gcp_utils.py`.

**File: `src/aws_utils.py`**

```python
"""
AWS authentication utilities for RunWhen Local.

Supports multiple authentication methods:
1. Explicit access keys from workspaceInfo.yaml
2. Access keys from Kubernetes secret
3. Assume Role (with or without base credentials)
4. EKS Workload Identity (IRSA)
5. Default AWS credential chain
"""

import base64
import json
import logging
import os
import sys
from typing import Any, Optional, Dict, Tuple

import boto3
from botocore.credentials import RefreshableCredentials
from botocore.session import get_session

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
    """Set AWS credentials for reuse across modules."""
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


def get_aws_credential(workspace_info: dict) -> Tuple[boto3.Session, str, str, str, str, str, str]:
    """
    Get AWS credentials using workspace configuration.
    
    Returns:
        Tuple of (session, region, access_key_id, secret_access_key, session_token, auth_type, auth_secret)
    """
    auth_type = None
    auth_secret = None
    aws_config = workspace_info.get('cloudConfig', {}).get('aws', {})
    
    region = aws_config.get('region') or aws_config.get('defaultRegion') or 'us-east-1'
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
        
        return session, region, access_key_id, secret_access_key, session_token, auth_type, auth_secret
    
    # Method 2: Credentials from Kubernetes secret
    if aws_secret_name:
        logger.info(f"Using AWS credentials from Kubernetes secret: {mask_string(aws_secret_name)}")
        try:
            secret_data = get_secret(aws_secret_name)
            access_key_id = base64.b64decode(secret_data.get('awsAccessKeyId')).decode('utf-8')
            secret_access_key = base64.b64decode(secret_data.get('awsSecretAccessKey')).decode('utf-8')
            session_token = None
            if secret_data.get('awsSessionToken'):
                session_token = base64.b64decode(secret_data.get('awsSessionToken')).decode('utf-8')
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
            
            return session, region, access_key_id, secret_access_key, session_token, auth_type, auth_secret
            
        except Exception as e:
            logger.error(f"Failed to retrieve AWS credentials from Kubernetes secret '{aws_secret_name}': {e}")
            sys.exit(1)
    
    # Method 3: Assume Role with Web Identity (EKS IRSA / Workload Identity)
    if use_workload_identity or os.environ.get('AWS_WEB_IDENTITY_TOKEN_FILE'):
        logger.info("Using AWS Workload Identity (IRSA) for authentication")
        auth_type = "aws_workload_identity"
        
        try:
            session = boto3.Session(region_name=region)
            
            # Handle assume role if specified (in addition to IRSA)
            if assume_role_arn:
                session, access_key_id, secret_access_key, session_token = assume_role(
                    session, assume_role_arn, aws_config, region
                )
                auth_type = "aws_workload_identity_assume_role"
            
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
        sts = session.client('sts')
        identity = sts.get_caller_identity()
        logger.info(f"Authenticated as: {mask_string(identity['Arn'])}")
        
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
    """Create a boto3 session with explicit credentials."""
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
    
    response = sts.assume_role(**assume_role_params)
    
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


def get_account_id(session: boto3.Session) -> str:
    """Get the AWS account ID for the current session."""
    try:
        sts = session.client('sts')
        identity = sts.get_caller_identity()
        return identity['Account']
    except Exception as e:
        logger.error(f"Failed to get AWS account ID: {e}")
        return None


def get_account_alias(session: boto3.Session) -> Optional[str]:
    """Get the AWS account alias for the current session."""
    try:
        iam = session.client('iam')
        aliases = iam.list_account_aliases()
        if aliases['AccountAliases']:
            return aliases['AccountAliases'][0]
        return None
    except Exception as e:
        logger.warning(f"Failed to get AWS account alias: {e}")
        return None


def enumerate_regions(session: boto3.Session, service: str = 'ec2') -> list:
    """Enumerate all available AWS regions for a service."""
    try:
        ec2 = session.client('ec2', region_name='us-east-1')
        regions = ec2.describe_regions()
        return [r['RegionName'] for r in regions['Regions']]
    except Exception as e:
        logger.warning(f"Failed to enumerate AWS regions: {e}")
        return ['us-east-1']  # Fallback to us-east-1


def validate_aws_credentials(session: boto3.Session) -> bool:
    """Validate AWS credentials by calling STS GetCallerIdentity."""
    try:
        sts = session.client('sts')
        sts.get_caller_identity()
        return True
    except Exception as e:
        logger.error(f"AWS credential validation failed: {e}")
        return False
```

### Phase 2: Update CloudQuery Indexer

**File: `src/indexers/cloudquery.py`**

Update the AWS credential handling section:

```python
# Add import at top
from aws_utils import get_aws_credential, set_aws_credentials, get_account_id

# Replace the existing AWS credential handling (around line 841)
elif platform_name == "aws":
    session, region, akid, sak, stkn, auth_type, auth_secret = get_aws_credential(workspace_info)
    
    # Set environment variables for CloudQuery
    if akid and sak:
        cq_process_environment_vars["AWS_ACCESS_KEY_ID"] = akid
        cq_process_environment_vars["AWS_SECRET_ACCESS_KEY"] = sak
        if stkn:
            cq_process_environment_vars["AWS_SESSION_TOKEN"] = stkn
    
    if region:
        cq_process_environment_vars["AWS_DEFAULT_REGION"] = region
    
    # Store auth type for template rendering
    platform_cfg["_auth_type"] = auth_type
    platform_cfg["_auth_secret"] = auth_secret
    
    # Update enrichers.aws module with credentials
    try:
        from enrichers.aws import set_aws_credentials as set_enricher_aws_credentials
        set_enricher_aws_credentials(session=session, auth_type=auth_type)
    except ImportError:
        pass

# Update get_auth_type function to include AWS
def get_auth_type(platform_name, platform_config_data: dict[str,Any]): 
    auth_secret = None
    auth_type = None
    
    if platform_name == "azure":
        # ... existing Azure logic ...
        
    elif platform_name == "aws":
        if platform_config_data.get("awsAccessKeyId"):
            auth_type = "aws_explicit"
        elif platform_config_data.get("awsSecretName"):
            auth_secret = platform_config_data.get("awsSecretName")
            auth_type = "aws_secret"
        elif platform_config_data.get("useWorkloadIdentity") or os.environ.get('AWS_WEB_IDENTITY_TOKEN_FILE'):
            auth_type = "aws_workload_identity"
        elif platform_config_data.get("assumeRoleArn"):
            auth_type = "aws_assume_role"
        else:
            auth_type = "aws_default_chain"
            
        # Check for assume role modifier
        if platform_config_data.get("assumeRoleArn") and auth_type != "aws_assume_role":
            auth_type = auth_type + "_assume_role"
    
    return auth_type, auth_secret
```

### Phase 3: Update AWS Enricher

**File: `src/enrichers/aws.py`**

Add credential caching support:

```python
# Add at the top of the file, after imports
_aws_credentials = {
    "session": None,
    "auth_type": None,
}

def set_aws_credentials(session: 'boto3.Session' = None, auth_type: str = None):
    """Set AWS credentials for reuse in enricher operations."""
    global _aws_credentials
    if session:
        _aws_credentials["session"] = session
    if auth_type:
        _aws_credentials["auth_type"] = auth_type
    logger.info(f"Set AWS enricher credentials with auth type: {auth_type}")

def get_aws_session():
    """Get the cached AWS session or create a new one."""
    global _aws_credentials
    if _aws_credentials["session"]:
        return _aws_credentials["session"]
    return boto3.Session()
```

### Phase 4: Create AWS Auth Template

**File: `src/templates/aws-auth.yaml`**

```yaml
{% if cluster is defined and cluster.cluster_type | default('') == "eks" and cluster.auth_type | default('') == "aws_explicit" %}
    - name: aws_credentials
      workspaceKey: aws:access_key@cli
    - name: aws_access_key_id
      workspaceKey: k8s:file@secret/{{ custom.aws_credentials_secret_name | default('undefined') }}:awsAccessKeyId
    - name: aws_secret_access_key
      workspaceKey: k8s:file@secret/{{ custom.aws_credentials_secret_name | default('undefined') }}:awsSecretAccessKey
{% elif cluster is defined and cluster.cluster_type | default('') == "eks" and cluster.auth_type | default('') == "aws_secret" %}
    - name: aws_credentials
      workspaceKey: aws:access_key@cli
    - name: aws_access_key_id
      workspaceKey: k8s:file@secret/{{ cluster.auth_secret | default('undefined') }}:awsAccessKeyId
    - name: aws_secret_access_key
      workspaceKey: k8s:file@secret/{{ cluster.auth_secret | default('undefined') }}:awsSecretAccessKey
{% elif match_resource is defined and match_resource.auth_type | default('') == "aws_explicit" %}
    - name: aws_credentials
      workspaceKey: aws:access_key@cli
    - name: aws_access_key_id
      workspaceKey: k8s:file@secret/{{ custom.aws_credentials_secret_name | default('undefined') }}:awsAccessKeyId
    - name: aws_secret_access_key
      workspaceKey: k8s:file@secret/{{ custom.aws_credentials_secret_name | default('undefined') }}:awsSecretAccessKey
{% elif match_resource is defined and match_resource.auth_type | default('') == "aws_secret" %}
    - name: aws_credentials
      workspaceKey: aws:access_key@cli
    - name: aws_access_key_id
      workspaceKey: k8s:file@secret/{{ match_resource.auth_secret | default('undefined') }}:awsAccessKeyId
    - name: aws_secret_access_key
      workspaceKey: k8s:file@secret/{{ match_resource.auth_secret | default('undefined') }}:awsSecretAccessKey
{% elif match_resource is defined and match_resource.auth_type | default('') == "aws_workload_identity" %}
    - name: aws_credentials
      workspaceKey: aws:irsa@cli
{% elif match_resource is defined and match_resource.auth_type | default('') == "aws_assume_role" %}
    - name: aws_credentials
      workspaceKey: aws:assume_role@cli
    - name: aws_role_arn
      value: "{{ match_resource.assume_role_arn | default('undefined') }}"
{% elif match_resource is defined and match_resource.auth_type | default('') == "aws_default_chain" %}
    - name: aws_credentials
      workspaceKey: aws:default_chain@cli
{% elif custom is defined and custom.aws_credentials_key is defined %}
    - name: aws_credentials
      workspaceKey: "{{ custom.aws_credentials_key }}"
{% else %}
    - name: aws_credentials
      workspaceKey: AUTH DETAILS NOT FOUND
{% endif %}
```

### Phase 5: Update Kubernetes Auth Template for EKS

**File: `src/templates/kubernetes-auth.yaml`** (add EKS section)

Add support for EKS clusters with various auth types, similar to AKS handling.

### Phase 6: Configuration Schema Updates

**workspaceInfo.yaml schema additions:**

```yaml
cloudConfig:
  aws:
    # Existing fields
    awsAccessKeyId: "AKIA..."           # Explicit access key
    awsSecretAccessKey: "..."           # Explicit secret key
    awsSessionToken: "..."              # Optional session token
    
    # New fields
    region: "us-east-1"                 # Default region
    defaultRegion: "us-east-1"          # Alias for region
    
    # Kubernetes secret auth
    awsSecretName: "aws-credentials"    # K8s secret containing credentials
    
    # Workload Identity (IRSA)
    useWorkloadIdentity: true           # Enable IRSA authentication
    
    # Assume Role
    assumeRoleArn: "arn:aws:iam::123456789012:role/MyRole"
    assumeRoleExternalId: "external-id" # Optional external ID
    assumeRoleSessionName: "my-session" # Optional session name
    assumeRoleDurationSeconds: 3600     # Optional duration (default 3600)
    
    # Multi-account support (future)
    accounts:
      - accountId: "123456789012"
        assumeRoleArn: "arn:aws:iam::123456789012:role/MyRole"
        regions:
          - "us-east-1"
          - "us-west-2"
```

---

## Test Infrastructure Plan

### Directory Structure

```
.test/aws/
├── basic/                          # Existing - update for multiple auth methods
│   ├── workspaceInfo.yaml
│   ├── Taskfile.yaml
│   └── README.md
├── secret-auth/                    # NEW: Kubernetes secret authentication
│   ├── workspaceInfo.yaml
│   ├── Taskfile.yaml
│   └── README.md
├── assume-role/                    # NEW: Assume role testing
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── provider.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── backend.tf
│   ├── workspaceInfo.yaml
│   ├── Taskfile.yaml
│   └── README.md
├── workload-identity-eks/          # NEW: EKS IRSA testing
│   ├── terraform/
│   │   ├── main.tf              # EKS cluster + IRSA config
│   │   ├── provider.tf
│   │   ├── iam.tf               # IAM roles for IRSA
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── backend.tf
│   ├── workspaceInfo.yaml
│   ├── Taskfile.yaml
│   └── README.md
├── multi-account/                  # NEW: Multi-account cross-account access
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── cross-account-role.tf
│   │   ├── provider.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── workspaceInfo.yaml
│   ├── Taskfile.yaml
│   └── README.md
└── ecr-registry-sync/              # Existing
```

### Test Case: Kubernetes Secret Authentication

**File: `.test/aws/secret-auth/terraform/main.tf`**

```hcl
# Create IAM user with limited permissions for testing
resource "aws_iam_user" "test_user" {
  name = "runwhen-test-user-${var.resource_suffix}"
  tags = local.common_tags
}

resource "aws_iam_access_key" "test_user" {
  user = aws_iam_user.test_user.name
}

resource "aws_iam_user_policy" "test_user_policy" {
  name = "runwhen-test-policy"
  user = aws_iam_user.test_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "s3:List*",
          "s3:GetBucket*",
          "iam:GetUser",
          "iam:ListUsers",
          "sts:GetCallerIdentity"
        ]
        Resource = "*"
      }
    ]
  })
}

# Output for creating K8s secret
output "aws_access_key_id" {
  value     = aws_iam_access_key.test_user.id
  sensitive = true
}

output "aws_secret_access_key" {
  value     = aws_iam_access_key.test_user.secret
  sensitive = true
}
```

**File: `.test/aws/secret-auth/workspaceInfo.yaml`**

```yaml
workspaceName: "aws-secret-auth-test"
workspaceOwnerEmail: test@runwhen.com
defaultLocation: location-01
defaultLOD: detailed
cloudConfig:
  aws:
    region: "us-east-1"
    awsSecretName: "aws-credentials"
codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/aws-c7n-codecollection"
    branch: "main"
    codeBundles: ["aws-c7n-s3-health"]
```

**File: `.test/aws/secret-auth/Taskfile.yaml`**

```yaml
version: '3'

vars:
  TEST_NAME: aws-secret-auth
  NAMESPACE: runwhen-local

tasks:
  default:
    cmds:
      - task: setup-k8s-secret
      - task: run-rwl-discovery
      - task: verify-results

  build-terraform-infra:
    dir: terraform
    cmds:
      - terraform init
      - terraform apply -auto-approve

  setup-k8s-secret:
    desc: Create K8s secret from Terraform outputs
    cmds:
      - |
        cd terraform
        ACCESS_KEY=$(terraform output -raw aws_access_key_id)
        SECRET_KEY=$(terraform output -raw aws_secret_access_key)
        kubectl create secret generic aws-credentials \
          --namespace={{.NAMESPACE}} \
          --from-literal=awsAccessKeyId=$ACCESS_KEY \
          --from-literal=awsSecretAccessKey=$SECRET_KEY \
          --dry-run=client -o yaml | kubectl apply -f -

  run-rwl-discovery:
    desc: Run RunWhen Local discovery
    cmds:
      - |
        docker run --rm \
          -v $(pwd):/shared \
          -v ~/.kube/config:/root/.kube/config \
          runwhen-local:test \
          python run.py --config /shared/workspaceInfo.yaml

  verify-results:
    desc: Verify discovery results
    cmds:
      - |
        # Check that AWS resources were discovered
        if [ -f output/resources.yaml ]; then
          grep -q "platform: aws" output/resources.yaml && echo "SUCCESS: AWS resources found"
        else
          echo "FAILED: No resources output"
          exit 1
        fi

  cleanup:
    desc: Clean up test resources
    cmds:
      - kubectl delete secret aws-credentials --namespace={{.NAMESPACE}} --ignore-not-found
      - task: cleanup-terraform-infra

  cleanup-terraform-infra:
    dir: terraform
    cmds:
      - terraform destroy -auto-approve
```

### Test Case: Assume Role

**File: `.test/aws/assume-role/terraform/main.tf`**

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}

locals {
  common_tags = {
    Project     = "runwhen-local"
    Environment = "test"
    Purpose     = "assume-role-testing"
    Lifecycle   = "deleteme"
  }
}

# IAM Role that can be assumed
resource "aws_iam_role" "assume_role_test" {
  name = "runwhen-assume-role-test-${var.resource_suffix}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = data.aws_caller_identity.current.arn
        }
        Action = "sts:AssumeRole"
        Condition = {
          StringEquals = {
            "sts:ExternalId" = var.external_id
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "assume_role_test_policy" {
  name = "runwhen-test-policy"
  role = aws_iam_role.assume_role_test.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "s3:List*",
          "s3:GetBucket*",
          "sts:GetCallerIdentity"
        ]
        Resource = "*"
      }
    ]
  })
}

variable "region" {
  default = "us-east-1"
}

variable "resource_suffix" {
  default = "test"
}

variable "external_id" {
  default = "runwhen-test-external-id"
}

output "assume_role_arn" {
  value = aws_iam_role.assume_role_test.arn
}

output "external_id" {
  value = var.external_id
}
```

**File: `.test/aws/assume-role/workspaceInfo.yaml`**

```yaml
workspaceName: "aws-assume-role-test"
workspaceOwnerEmail: test@runwhen.com
defaultLocation: location-01
defaultLOD: detailed
cloudConfig:
  aws:
    region: "us-east-1"
    assumeRoleArn: "${ASSUME_ROLE_ARN}"
    assumeRoleExternalId: "${EXTERNAL_ID}"
    assumeRoleSessionName: "runwhen-test-session"
codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/aws-c7n-codecollection"
    branch: "main"
    codeBundles: ["aws-c7n-s3-health"]
```

### Test Case: EKS Workload Identity (IRSA)

**File: `.test/aws/workload-identity-eks/terraform/main.tf`**

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}

locals {
  common_tags = {
    Project     = "runwhen-local"
    Environment = "test"
    Purpose     = "workload-identity-testing"
    Lifecycle   = "deleteme"
  }
  cluster_name = "runwhen-irsa-test-${var.resource_suffix}"
}

# VPC for EKS
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.cluster_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = local.common_tags
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = local.cluster_name
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    default = {
      min_size     = 1
      max_size     = 2
      desired_size = 1

      instance_types = ["t3.medium"]
    }
  }

  tags = local.common_tags
}

# OIDC Provider for IRSA
data "tls_certificate" "eks" {
  url = module.eks.cluster_oidc_issuer_url
}

# IAM Role for Service Account (IRSA)
resource "aws_iam_role" "runwhen_irsa" {
  name = "runwhen-irsa-${var.resource_suffix}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = module.eks.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${module.eks.oidc_provider}:aud" = "sts.amazonaws.com"
            "${module.eks.oidc_provider}:sub" = "system:serviceaccount:runwhen-local:runwhen-local"
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "runwhen_irsa_policy" {
  name = "runwhen-discovery-policy"
  role = aws_iam_role.runwhen_irsa.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "s3:List*",
          "s3:GetBucket*",
          "iam:GetUser",
          "iam:ListUsers",
          "sts:GetCallerIdentity"
        ]
        Resource = "*"
      }
    ]
  })
}

variable "region" {
  default = "us-east-1"
}

variable "resource_suffix" {
  default = "test"
}

output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "irsa_role_arn" {
  value = aws_iam_role.runwhen_irsa.arn
}

output "oidc_provider_arn" {
  value = module.eks.oidc_provider_arn
}
```

**File: `.test/aws/workload-identity-eks/workspaceInfo.yaml`**

```yaml
workspaceName: "aws-workload-identity-test"
workspaceOwnerEmail: test@runwhen.com
defaultLocation: location-01
defaultLOD: detailed
cloudConfig:
  aws:
    region: "us-east-1"
    useWorkloadIdentity: true
codeCollections:
  - repoURL: "https://github.com/runwhen-contrib/aws-c7n-codecollection"
    branch: "main"
    codeBundles: ["aws-c7n-s3-health"]
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Create `src/aws_utils.py` module
- [ ] Add unit tests for `aws_utils.py`
- [ ] Update `src/indexers/cloudquery.py` for enhanced AWS auth
- [ ] Update `get_auth_type()` function for AWS

### Phase 2: Enricher Integration (Week 2)
- [ ] Update `src/enrichers/aws.py` with credential caching
- [ ] Add `set_aws_credentials()` function
- [ ] Test enricher with various auth types

### Phase 3: Template Support (Week 2-3)
- [ ] Create `src/templates/aws-auth.yaml`
- [ ] Update `src/templates/kubernetes-auth.yaml` for EKS
- [ ] Test template rendering with all auth types

### Phase 4: Test Infrastructure (Week 3-4)
- [ ] Create `.test/aws/secret-auth/` test case
- [ ] Create `.test/aws/assume-role/` test case
- [ ] Create `.test/aws/workload-identity-eks/` test case
- [ ] Create `.test/aws/multi-account/` test case
- [ ] Update existing `.test/aws/basic/` for comprehensive testing

### Phase 5: Documentation (Week 4)
- [ ] Update `docs/cloud-discovery-configuration/` for AWS auth methods
- [ ] Add examples in `src/examples/` for AWS configurations
- [ ] Update main README with AWS auth options

---

## Testing Strategy

### Unit Tests
- Test each authentication method in isolation
- Test credential resolution priority
- Test error handling for invalid credentials
- Test assume role functionality

### Integration Tests
- Test CloudQuery indexer with each auth type
- Test enricher with real AWS resources
- Test template rendering for workspace generation

### End-to-End Tests
- Full discovery workflow with Kubernetes secret auth
- Full discovery workflow with assume role
- Full discovery workflow with IRSA on EKS
- Multi-account discovery test

---

## Risk Mitigation

1. **Backwards Compatibility**: Existing `awsAccessKeyId`/`awsSecretAccessKey` configurations continue to work unchanged.

2. **Credential Security**: 
   - Never log credentials
   - Use `mask_string()` utility for all credential-related logging
   - Session tokens have limited lifetime

3. **Error Handling**:
   - Clear error messages for auth failures
   - Graceful fallback behavior
   - Don't expose sensitive info in error messages

4. **Testing Coverage**:
   - Each auth method has dedicated test infrastructure
   - CI/CD tests for regression prevention

---

## Success Criteria

1. All five AWS authentication methods work correctly
2. Existing configurations continue to work (backwards compatible)
3. Auth type correctly propagates to templates
4. Test infrastructure covers all scenarios
5. Documentation is complete and accurate
6. CloudQuery successfully indexes AWS resources with all auth types

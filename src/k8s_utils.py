import subprocess
import os
import yaml
import sys
import base64
import logging
from kubernetes import client, config
from utils import mask_string


logger = logging.getLogger(__name__)


def get_namespace():
    namespace_file = "/var/run/secrets/kubernetes.io/serviceaccount/namespace"
    try:
        with open(namespace_file, 'r') as file:
            return file.read().strip()
    except IOError as e:
        print(f"Failed to read namespace file at {namespace_file}: {e}", file=sys.stderr)
        sys.exit(1)

def get_secret(secret_name):
    try:
        # Load the in-cluster Kubernetes configuration
        config.load_incluster_config()
        print("In-cluster Kubernetes configuration loaded successfully.")
    except config.ConfigException as e:
        print(f"Failed to load in-cluster Kubernetes configuration: {e}", file=sys.stderr)
        sys.exit(1)

    namespace = get_namespace()
    print(f"Using namespace: {namespace}")
    
    v1 = client.CoreV1Api()

    try:
        logger.info(f"Attempting to fetch secret '{mask_string(secret_name)}' from namespace '{namespace}'...")
        secret = v1.read_namespaced_secret(secret_name, namespace)
        
        if not secret.data:
            logger.error(f"Error: Secret '{mask_string(secret_name)}' in namespace '{namespace}' is empty or has no data.", file=sys.stderr)
            sys.exit(1)

        logger.info(f"Secret '{mask_string(secret_name)}' fetched successfully from namespace '{namespace}'.")
        return secret.data

    except client.exceptions.ApiException as e:
        print(f"API error occurred while fetching secret '{mask_string(secret_name)}' in namespace '{namespace}': {e.reason}", file=sys.stderr)
        print(f"HTTP response status code: {e.status}, response body: {e.body}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error occurred while fetching secret '{mask_string(secret_name)}' in namespace '{namespace}': {e}", file=sys.stderr)
        sys.exit(1)
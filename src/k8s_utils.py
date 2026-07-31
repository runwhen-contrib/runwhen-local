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
        logger.error("Failed to read namespace file at %s: %s", namespace_file, e)
        sys.exit(1)

def get_secret(secret_name):
    try:
        # Load the in-cluster Kubernetes configuration
        config.load_incluster_config()
        logger.info("In-cluster Kubernetes configuration loaded successfully.")
    except config.ConfigException as e:
        logger.error("Failed to load in-cluster Kubernetes configuration: %s", e)
        sys.exit(1)

    namespace = get_namespace()
    logger.info("Using namespace: %s", namespace)
    
    v1 = client.CoreV1Api()

    try:
        logger.info(f"Attempting to fetch secret '{mask_string(secret_name)}' from namespace '{namespace}'...")
        secret = v1.read_namespaced_secret(secret_name, namespace)
        
        if not secret.data:
            logger.error("Secret '%s' in namespace '%s' is empty or has no data.",
                          mask_string(secret_name), namespace)
            sys.exit(1)

        logger.info(f"Secret '{mask_string(secret_name)}' fetched successfully from namespace '{namespace}'.")
        return secret.data

    except client.exceptions.ApiException as e:
        logger.error("API error occurred while fetching secret '%s' in namespace '%s': %s",
                      mask_string(secret_name), namespace, e.reason)
        logger.error("HTTP response status code: %s, response body: %s", e.status, e.body)
        sys.exit(1)
    except Exception as e:
        logger.error("Unexpected error occurred while fetching secret '%s' in namespace '%s': %s",
                      mask_string(secret_name), namespace, e)
        sys.exit(1)
#!/bin/bash

# Variables
SERVER_DETAILS="$1"
CA_CERT_PATH="/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"

# Check if the kubeconfig file is provided
if [[ -z "$1" ]]; then
    echo "Please provide the kubeconfig file as an argument."
    exit 1
fi

KUBECONFIG_FILE="/shared/in_cluster_kubeconfig.yaml"
NEW_KUBECONFIG_FILE="/shared/generated-kubeconfig.yaml"

# Check if the CA cert file exists
if [[ ! -f "$CA_CERT_PATH" ]]; then
    echo "CA certificate not found at $CA_CERT_PATH."
    exit 1
fi

# Embed the CA certificate
CA_CERT_CONTENT=$(sed ':a;N;$!ba;s/\n/\\n/g' "$CA_CERT_PATH")

# Substitute server details and embed the CA certificate
sed -e "s|server:.*|server: $SERVER_DETAILS|" \
    -e "s|certificate-authority:.*|certificate-authority-data: $CA_CERT_CONTENT|" \
    "$KUBECONFIG_FILE" > "$NEW_KUBECONFIG_FILE"


echo "Modified kubeconfig saved to $NEW_KUBECONFIG_FILE"

# Validate the kubeconfig
if kubectl --kubeconfig="$NEW_KUBECONFIG_FILE" get api-versions > /dev/null 2>&1; then
    echo "Kubeconfig is valid!"
else
    echo "Kubeconfig validation failed."
    exit 1
fi
#!/bin/bash

# Variables
SERVER_DETAILS="$1"
KUBECONFIG_FILE="/shared/in_cluster_kubeconfig.yaml"
NEW_KUBECONFIG_FILE="/shared/generated-kubeconfig.yaml"
NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)
SERVICE_ACCOUNT=$(kubectl get pods $HOSTNAME -o=jsonpath='{.spec.serviceAccountName}')

# Validate namespace
if [[ -z "$NAMESPACE" ]]; then
    echo "Can't determine namespace details"
    exit 1
fi

# Validate Service Account
if [[ -z "$SERVICE_ACCOUNT" ]]; then
    echo "Can't determine service account name"
    exit 1
fi

# Check if the server details are provided
if [[ -z "$SERVER_DETAILS" ]]; then
    echo "Please provide the server details."
    exit 1
fi

# Check if certificate-authority is a file path
if grep -q "certificate-authority:" "$KUBECONFIG_FILE"; then
    CA_CERT_PATH=$(grep "certificate-authority:" "$KUBECONFIG_FILE" | awk '{print $2}')
    if [[ -f "$CA_CERT_PATH" ]]; then
        # Embed the CA certificate
        CA_CERT_CONTENT=$(base64 -w 0 "$CA_CERT_PATH")
        # Substitute server details and embed the CA certificate
        sed -e "s|^    server:.*|    server: $SERVER_DETAILS|" \
            -e "/certificate-authority:/a \    certificate-authority-data: $CA_CERT_CONTENT" \
            -e "/certificate-authority:/d" \
            "$KUBECONFIG_FILE" > "$NEW_KUBECONFIG_FILE"
    else
        echo "CA certificate path specified in kubeconfig is not valid."
        exit 1
    fi
else
    # If certificate-authority-data is already present, just update server details
    sed "s|^    server:.*|    server: $SERVER_DETAILS|" "$KUBECONFIG_FILE" > "$NEW_KUBECONFIG_FILE"
fi

# Replace the user token with the contents of the secret
SECRET_DATA=$(kubectl get secret "$SERVICE_ACCOUNT-token" -o jsonpath='{.data.token}' | base64 -d)
if [[ -n "$SECRET_DATA" ]]; then
    sed -i "s|^    token:.*|    token: $SECRET_DATA|" "$NEW_KUBECONFIG_FILE"
else
    echo "Failed to retrieve token from the secret."
    exit 1
fi

echo "Modified kubeconfig saved to $NEW_KUBECONFIG_FILE"

# Validate the kubeconfig
if timeout 10s kubectl --kubeconfig="$NEW_KUBECONFIG_FILE" get ns > /dev/null 2>&1; then
    echo "Kubeconfig is valid!"
else
    echo "Kubeconfig validation failed."
    exit 1
fi
#!/bin/bash

# Ensure we have the correct number of arguments
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 context1,context2,... namespace serviceAccount"
    exit 1
fi

# Extract arguments
IFS=',' read -ra CONTEXTS <<< "$1"
NAMESPACE="$2"
SERVICE_ACCOUNT="$3"

OUTPUT_KUBECONFIG="/shared/generated-kubeconfig.yaml"
TEMP_CERT_FILE="temp-ca.crt"


# Initialize the kubeconfig with an empty config
echo "apiVersion: v1
clusters: []
contexts: []
current-context: ''
kind: Config
preferences: {}
users: []" > $OUTPUT_KUBECONFIG


# Check if kubectl is installed
command -v kubectl >/dev/null 2>&1 || { echo >&2 "kubectl is required but it's not installed. Exiting."; exit 1; }

for context in "${CONTEXTS[@]}"; do
    echo "---"
    echo "Working with context: $context"

    # Create namespace
    kubectl get namespace "$NAMESPACE" --context="$context" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        kubectl create namespace "$NAMESPACE" --context="$context"
    else
        echo "Namespace $NAMESPACE already exists in context $context. Skipping..."
    fi

    # Create service account
    kubectl -n "$NAMESPACE" get sa "$SERVICE_ACCOUNT" --context="$context" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        kubectl -n "$NAMESPACE" create sa "$SERVICE_ACCOUNT" --context="$context"
    else
        echo "Service Account $SERVICE_ACCOUNT already exists in namespace $NAMESPACE of context $context. Skipping..."
    fi

    # Check for the secret associated with the service account. If it doesn't exist, create and annotate it.
    SECRET_NAME="${SERVICE_ACCOUNT}-token"
    kubectl -n "$NAMESPACE" get secret "$SECRET_NAME" --context="$context" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        # Generate the secret YAML and apply it
        echo "apiVersion: v1
kind: Secret
metadata:
  name: $SECRET_NAME
  namespace: $NAMESPACE
  annotations:
    kubernetes.io/service-account.name: $SERVICE_ACCOUNT
type: kubernetes.io/service-account-token" | kubectl apply -f - --context="$context"
    else
        echo "Secret $SECRET_NAME already exists in namespace $NAMESPACE of context $context. Skipping..."
    fi

    # Create cluster role binding
    CRB_NAME="${SERVICE_ACCOUNT}-viewer-crb"
    kubectl get clusterrolebinding "$CRB_NAME" --context="$context" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        kubectl create clusterrolebinding "$CRB_NAME" \
          --clusterrole=view \
          --serviceaccount="$NAMESPACE:$SERVICE_ACCOUNT" \
          --context="$context"
        echo "Created $SERVICE_ACCOUNT in $NAMESPACE with ClusterRoleBinding $CRB_NAME in context $context."
    else
        echo "ClusterRoleBinding $CRB_NAME already exists in context $context. Skipping..."
    fi

    # Extract the Bearer token for the service account
    SA_JWT_TOKEN=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" --context="$context" -o jsonpath='{.data.token}' | base64 --decode)

    # Get the certificate for the current context
    CERTIFICATE_DATA=$(kubectl config view --raw --minify --flatten --context="$context" -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')
    echo "$CERTIFICATE_DATA" | base64 --decode > $TEMP_CERT_FILE

    # Get the API server endpoint for the current context
    APISERVER=$(kubectl config view --raw --minify --flatten --context="$context" -o jsonpath='{.clusters[0].cluster.server}')

    # Create or update kubeconfig with the service account's token
    kubectl config --kubeconfig=$OUTPUT_KUBECONFIG set-credentials "$SERVICE_ACCOUNT-$context" --token="$SA_JWT_TOKEN"

    kubectl config --kubeconfig=$OUTPUT_KUBECONFIG set-cluster "$context" --server="$APISERVER" --certificate-authority="$TEMP_CERT_FILE" --embed-certs
    
    kubectl config --kubeconfig=$OUTPUT_KUBECONFIG set-context "$context" --cluster="$context" --user="$SERVICE_ACCOUNT-$context" --namespace="$NAMESPACE"

    kubectl config --kubeconfig=$OUTPUT_KUBECONFIG use-context "$context"

    # Remove the temporary certificate file
    rm $TEMP_CERT_FILE

done

echo "---"
echo "Kubeconfig has been generated at $OUTPUT_KUBECONFIG"
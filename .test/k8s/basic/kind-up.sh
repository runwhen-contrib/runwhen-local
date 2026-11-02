#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Stand up the ephemeral Kind cluster that backs the Kubernetes discovery CI
# tests, seed it with the `ci-verify-basic` fixture, and export a kubeconfig the
# tests read from .test/k8s/basic/kubeconfig.secret.
#
# This replaces the old shared SANDBOX cluster: CI now creates a disposable
# Kind cluster per test job. Idempotent -- re-running reuses an existing
# cluster, so it is also safe to run locally while iterating.
#
# The exported kubeconfig points at the control-plane container over the kind
# Docker network rather than 127.0.0.1, so the RunWhen Local container (which is
# attached to that same network via RWL_CONTAINER_NETWORK=kind) can reach the
# API server without host networking.
#
# Usage:  ./kind-up.sh [cluster-name]        (default: rwl-ci)
# ---------------------------------------------------------------------------
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="${1:-rwl-ci}"
KIND_NODE_IMAGE="${KIND_NODE_IMAGE:-kindest/node:v1.31.0}"
KIND_VERSION="${KIND_VERSION:-v0.24.0}"
FIXTURE="${FIXTURE:-$HERE/kind/ci-verify-basic.yaml}"
KUBECONFIG_OUT="${KUBECONFIG_OUT:-$HERE/kubeconfig.secret}"

if ! command -v kind >/dev/null 2>&1; then
  case "$(uname -s)" in
    Linux)
      echo "kind not found; installing ${KIND_VERSION}..."
      KARCH="$(uname -m)"
      [ "$KARCH" = "x86_64" ] && KARCH="amd64"
      [ "$KARCH" = "aarch64" ] && KARCH="arm64"
      curl -fsSL -o /tmp/kind \
        "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-${KARCH}"
      chmod +x /tmp/kind
      sudo mv /tmp/kind /usr/local/bin/kind
      ;;
    *)
      echo "kind is not installed. Install it from https://kind.sigs.k8s.io/docs/user/quick-start/#installation" >&2
      exit 2
      ;;
  esac
fi

if kind get clusters 2>/dev/null | grep -qx "$NAME"; then
  echo "Kind cluster '$NAME' already exists; reusing."
else
  echo "Creating Kind cluster '$NAME' (image=${KIND_NODE_IMAGE})..."
  kind create cluster --name "$NAME" --image "$KIND_NODE_IMAGE" --wait 120s
fi

echo "Applying CI fixture '$(basename "$FIXTURE")'..."
kubectl apply -f "$FIXTURE"
kubectl -n ci-verify-basic wait --for=condition=Available \
  deployment/podinfo --timeout=120s \
  || echo "WARN: podinfo is not Available yet; discovery only needs the API objects."

echo "Exporting kubeconfig for cluster '$NAME' to $KUBECONFIG_OUT..."
kind get kubeconfig --name "$NAME" > "$KUBECONFIG_OUT"
# The RWL container joins the kind Docker network, so it reaches the API server
# over that network. Point the server at the control-plane container's IP on the
# kind network (which is in the API server certificate SANs via the kubeadm
# advertise address) so TLS verification still works -- no insecure flag needed.
CP_IP="$(docker inspect -f '{{ (index .NetworkSettings.Networks "kind").IPAddress }}' "${NAME}-control-plane")"
if [ -z "$CP_IP" ]; then
  echo "Could not determine control-plane IP for '$NAME' on the 'kind' network" >&2
  exit 1
fi
kubectl --kubeconfig "$KUBECONFIG_OUT" config set-cluster "kind-$NAME" \
  --server="https://${CP_IP}:6443" >/dev/null
chmod 0644 "$KUBECONFIG_OUT"

echo "Kind cluster '$NAME' ready (context: kind-$NAME, API: https://${CP_IP}:6443)."

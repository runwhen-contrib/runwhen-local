#!/usr/bin/env bash
# Shared discovery helpers for .test/k8s/basic Taskfile tasks.
# Sourced by run-rwl-discovery / ci-run-rwl-discovery variants.

set -euo pipefail

_rwl_prepare_container() {
  local container_name="${1:-RunWhenLocal}"
  rm -f run_sh_output.log container_logs.log slx_count.txt || true
  docker rm -f "$container_name" 2>/dev/null || true
  echo "Cleaning up output directory..."
  rm -rf output || { echo "Failed to remove output directory"; exit 1; }
  mkdir output && chmod 777 output || { echo "Failed to set permissions"; exit 1; }
}

_rwl_start_container() {
  local container_name="$1"
  shift
  # Extra docker run args (e.g. --add-host github.com:0.0.0.0) follow $container_name.
  echo "Starting new container $container_name..."
  docker run -d \
    -e DEBUG_LOGGING="${DEBUG_LOGGING:-false}" \
    -e WB_WRITE_WORKSPACE_FILES_TO_DISK=true \
    --name "$container_name" \
    -p 8000:8000 \
    -v "$(pwd):/shared" \
    "$@" \
    runwhen-local:test || { echo "Failed to start container"; exit 1; }
}

_rwl_wait_for_rest() {
  local container_name="$1"
  echo "Waiting for workspace builder REST service..."
  local rest_ready=0
  local i
  for i in $(seq 1 30); do
    if ! docker ps -q --filter "name=$container_name" | grep -q .; then
      echo "Container $container_name exited during startup. Logs:"
      docker logs "$container_name" 2>&1 | tee container_logs.log
      exit 1
    fi
    if docker exec "$container_name" curl -sf http://localhost:8000/info/ >/dev/null 2>&1; then
      rest_ready=1
      break
    fi
    sleep 2
  done
  if [ "$rest_ready" -ne 1 ]; then
    echo "REST service never became ready. Container logs:"
    docker logs "$container_name" 2>&1 | tee container_logs.log
    exit 1
  fi
}

_rwl_run_discovery() {
  local container_name="$1"
  local extra_args="${2:-}"
  echo "Running workspace builder script in container..."
  set -o pipefail
  # shellcheck disable=SC2086
  docker exec -w /workspace-builder "$container_name" ./run.sh $extra_args --verbose 2>&1 | tee run_sh_output.log || {
    echo "Error executing script in container. Container logs:"
    docker logs "$container_name" 2>&1 | tee container_logs.log
    exit 1
  }
  set +o pipefail
  docker logs "$container_name" > container_logs.log 2>&1 || true
}

_rwl_count_slxs() {
  if [ -f output/resources.sqlite ]; then
    python3 ../../lib/slx_db.py --db output/resources.sqlite count
  else
    local slxs_root
    slxs_root=$(find 'output/' -type d -name 'slxs' 2>/dev/null | head -n 1)
    if [ -n "$slxs_root" ]; then
      find "$slxs_root" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' '
    else
      echo 0
    fi
  fi
}

_rwl_write_slx_count() {
  local total_slxs
  total_slxs=$(_rwl_count_slxs)
  echo "Review rendered SLXs via the explorer UI (http://localhost:8000/explorer/) or output/resources.sqlite"
  echo "Total SLXs: $total_slxs"
  echo "$total_slxs" > slx_count.txt
}

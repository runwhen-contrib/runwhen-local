#!/bin/bash

function create_system_user_if_missing() {
  # This is needed in case of OpenShift-compatible container execution. In case of OpenShift random
  # User id is used when starting the image, however group 0 is kept as the user group. Our production
  # Image is OpenShift compatible, so all permissions on all folders are set so that 0 group can exercise
  # the same privileges as the default "runwhen" user, this code checks if the user is already
  # present in /etc/passwd and will create the system user dynamically
  if ! whoami &> /dev/null; then
    if [[ -w /etc/passwd ]]; then
      echo "${USER_NAME:-default}:x:$(id -u):0:${USER_NAME:-default} user:${RUNWHEN_HOME}:/sbin/nologin" \
          >> /etc/passwd
    fi
    export HOME="${RUNWHEN_HOME}"
  fi
}
## Handle permissions when UID is randomly assigned
create_system_user_if_missing

# Configure Git safe directories for local git cache
# This prevents "dubious ownership" errors when useLocalGit: true
CODE_COLLECTION_CACHE_ROOT="${CODE_COLLECTION_CACHE_ROOT:-/opt/runwhen/codecollection-cache}"

echo "Configuring Git safe directories..."

# Configure pre-built cache directories (both old and new paths for backward compatibility)
for cache_root in "/opt/runwhen/codecollection-cache" "/home/runwhen/codecollection-cache"; do
  if [ -d "$cache_root" ]; then
    echo "Found cache directory: $cache_root"
    # Add the entire cache root as a safe directory (only if not already present)
    if ! git config --global --get-all safe.directory | grep -q "^$cache_root$"; then
      git config --global --add safe.directory "$cache_root"
    fi
    # Add all .git directories in the cache as safe directories  
    for repo_dir in "$cache_root"/*.git; do
      if [ -d "$repo_dir" ]; then
        if ! git config --global --get-all safe.directory | grep -q "^$repo_dir$"; then
          git config --global --add safe.directory "$repo_dir"
          echo "Added safe directory: $repo_dir"
        fi
      fi
    done
  fi
done

# Configure git safe directories for temporary directories that may be created at runtime
# Python's TemporaryDirectory() typically creates directories under /tmp/tmp*
# Also handle any custom WB_CODE_COLLECTION_CACHE_DIR that might be set
echo "Configuring git safe directories for temporary locations..."
if ! git config --global --get-all safe.directory | grep -q "^/tmp/\*$"; then
  git config --global --add safe.directory '/tmp/*'
fi
if ! git config --global --get-all safe.directory | grep -q "^/tmp/tmp\*$"; then
  git config --global --add safe.directory '/tmp/tmp*'
fi

# Handle custom cache directory if WB_CODE_COLLECTION_CACHE_DIR is set
if [ -n "$WB_CODE_COLLECTION_CACHE_DIR" ]; then
  echo "Configuring git safe directory for custom cache: $WB_CODE_COLLECTION_CACHE_DIR"
  if ! git config --global --get-all safe.directory | grep -q "^$WB_CODE_COLLECTION_CACHE_DIR$"; then
    git config --global --add safe.directory "$WB_CODE_COLLECTION_CACHE_DIR"
  fi
  if ! git config --global --get-all safe.directory | grep -q "^$WB_CODE_COLLECTION_CACHE_DIR/\*$"; then
    git config --global --add safe.directory "$WB_CODE_COLLECTION_CACHE_DIR/*"
  fi
fi

OUTPUT="/shared/output"
# Check if the output directory exists
if [ -d "$OUTPUT" ]; then
  echo "Directory $OUTPUT already exists."
else
  mkdir -p "$OUTPUT"
  echo "Directory $OUTPUT has been created."
fi

# Use TMPDIR if set, or fall back to /tmp
TMPDIR="${TMPDIR:-/tmp}"

## Clean stale lock files
rm $TMPDIR/.wb_lock || true

## Execute main discovery process

cd $RUNWHEN_HOME
echo Starting workspace builder REST server

# Check if AUTORUN_WORKSPACE_BUILDER_INTERVAL environment variable is set
# This is mostly for our kubernetes demo environment
# Merge mode options are for continuous upload
if [ -n "$AUTORUN_WORKSPACE_BUILDER_INTERVAL" ]; 
then
    echo "AUTORUN_WORKSPACE_BUILDER_INTERVAL is set. Running workspace-builder"
    uvicorn workspace_builder.api:app --host 0.0.0.0 --port 8000 &
    sleep 5

    CONFIG_RELOADER_PID=""
    start_config_reloader() {
        if [ "${RW_CONFIG_RELOAD_ENABLED:-auto}" = "false" ]; then
            return
        fi
        if [ "${RW_CONFIG_RELOAD_ENABLED:-auto}" = "auto" ]; then
            if [ ! -f /var/run/secrets/kubernetes.io/serviceaccount/token ]; then
                return
            fi
        fi
        echo "Starting Kubernetes config reloader (watches mounted ConfigMaps/Secrets)..."
        python "$RUNWHEN_HOME/config_reloader.py" &
        CONFIG_RELOADER_PID=$!
    }

    check_config_reloader_exit() {
        if [ -n "${CONFIG_RELOADER_PID:-}" ] && ! kill -0 "$CONFIG_RELOADER_PID" 2>/dev/null; then
            wait "$CONFIG_RELOADER_PID" 2>/dev/null
            local exit_code=$?
            if [ "$exit_code" -eq 0 ]; then
                echo "ConfigMap/Secret change detected — exiting for pod restart"
                exit 1
            fi
            echo "Config reloader exited unexpectedly (code $exit_code); continuing without auto-reload"
            CONFIG_RELOADER_PID=""
        fi
    }

    # subPath-mounted ConfigMaps/Secrets never update in-place; watch via the API.
    start_config_reloader

    if [[ "${RW_LOCAL_UPLOAD_ENABLED,,}" == "true" ]]; 
    then
        echo "Upload to RunWhen Platform Enabled"
        if [[ "$RW_LOCAL_UPLOAD_MERGE_MODE" == "keep-uploaded" ]]; 
        then
            echo "Merge Mode: keep-uploaded"
            while true; do
                ./run.sh --upload --upload-merge-mode keep-uploaded --prune-stale-slxs
                check_config_reloader_exit
                sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL
            done
        else
            echo "Merge Mode: keep-existing"
            while true; do
                ./run.sh --upload --upload-merge-mode keep-existing --prune-stale-slxs
                check_config_reloader_exit
                sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL
            done
        fi
    else
        while true; do
            ./run.sh
            check_config_reloader_exit
            sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL
        done
    fi 
else
  uvicorn workspace_builder.api:app --host 0.0.0.0 --port 8000
fi

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
# Run mkdocs in the background
# Check if the directory exists
if [ -d "$OUTPUT" ]; then
  echo "Directory $OUTPUT already exists."
else
  # Create the directory
  mkdir -p "$OUTPUT"
  echo "Directory $OUTPUT has been created."
fi

# Set mkdocs to run out of TMPDIR
# Use TMPDIR if set, or fall back to /tmp
TMPDIR="${TMPDIR:-/tmp}"
MKDOCS_TMP="$TMPDIR/mkdocs-temp"

# 1) Copy everything to a writable temp location
rm -rf "$MKDOCS_TMP"
mkdir -p "$MKDOCS_TMP"
cp -r /workspace-builder/cheat-sheet-docs/* "$MKDOCS_TMP"

# If your mkdocs.yml is in cheat-sheet-docs/, now it's in $MKDOCS_TMP/mkdocs.yml
# If you store docs/ within cheat-sheet-docs/, it's also in $MKDOCS_TMP/docs/

# 2) Start mkdocs serve from inside that writable directory
cd "$MKDOCS_TMP"

# Optionally set site_dir in mkdocs.yml or run with an alternate config that points site_dir somewhere in TMPDIR
# For live reload on 0.0.0.0:8081 (configured in mkdocs.yml):
mkdocs serve -f mkdocs.yml &
echo "MkDocs serve started in the background, serving from $MKDOCS_TMP"

## Clean stale lock files
rm $TMPDIR/.wb_lock || true

## Execute main discovery process

cd $RUNWHEN_HOME
# Run Django in the background
python manage.py migrate
echo Starting workspace builder REST server

# Check if AUTORUN_WORKSPACE_BUILDER_INTERVAL environment variable is set
# This is mostly for our kubernetes demo environment
# Merge mode options are for continuous upload
if [ -n "$AUTORUN_WORKSPACE_BUILDER_INTERVAL" ]; 
then
    echo "AUTORUN_WORKSPACE_BUILDER_INTERVAL is set. Running workspace-builder"
    python manage.py runserver 0.0.0.0:8000 &
    # Put this back after testing
    # python manage.py runserver 0.0.0.0:8000 --noreload &
    sleep 60
    
    # Configure which files to watch for changes (inclusive list)
    # Can be overridden via RW_WATCH_FILES environment variable (colon-separated)
    # or via /shared/watch-files.conf config file (one file per line)
    # This prevents race conditions with script-generated files like kubeconfig
    
    if [ -f "/shared/watch-files.conf" ]; then
        echo "Loading watch list from /shared/watch-files.conf"
        mapfile -t WATCH_FILES < <(grep -v '^#' /shared/watch-files.conf | grep -v '^[[:space:]]*$')
    elif [ -n "$RW_WATCH_FILES" ]; then
        echo "Loading watch list from RW_WATCH_FILES environment variable"
        IFS=':' read -ra WATCH_FILES <<< "$RW_WATCH_FILES"
    else
        echo "Using default watch list"
        WATCH_FILES=(
            "/shared/workspaceInfo.yaml"
            "/shared/uploadInfo.yaml"
        )
    fi
    
    get_config_checksum() {
        local checksum=""
        
        # Generate checksum only for files in the watch list
        for file in "${WATCH_FILES[@]}"; do
            if [ -f "$file" ]; then
                # Use stat to get modification time (works on both Linux and macOS)
                local mtime=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null)
                checksum="${checksum}${file}:${mtime}|"
            fi
        done
        
        echo "$checksum"
    }
    
    LAST_CONFIG_CHECKSUM=$(get_config_checksum)
    
    # Log which files are being watched from the watch list
    echo "File watcher enabled with inclusive watch list..."
    WATCHED_COUNT=0
    for file in "${WATCH_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✓ $file (found)"
            WATCHED_COUNT=$((WATCHED_COUNT + 1))
        else
            echo "  ✗ $file (not found)"
        fi
    done
    
    if [ "$WATCHED_COUNT" -gt 0 ]; then
        echo "Monitoring $WATCHED_COUNT file(s) from watch list for changes"
    else
        echo "No watched files found yet (files may not be mounted)"
    fi
    
    if [[ "${RW_LOCAL_UPLOAD_ENABLED,,}" == "true" ]]; 
    then
        echo "Upload to RunWhen Platform Enabled"
        if [[ "$RW_LOCAL_UPLOAD_MERGE_MODE" == "keep-uploaded" ]]; 
        then
            echo "Merge Mode: keep-uploaded"
            while true; do
                ./run.sh --upload --upload-merge-mode keep-uploaded --prune-stale-slxs
                
                # Check for config changes and adjust sleep accordingly
                CURRENT_CONFIG_CHECKSUM=$(get_config_checksum)
                if [ "$CURRENT_CONFIG_CHECKSUM" != "$LAST_CONFIG_CHECKSUM" ]; then
                    echo "Configuration change detected! Running discovery immediately..."
                    LAST_CONFIG_CHECKSUM=$CURRENT_CONFIG_CHECKSUM
                    sleep 5  # Short delay to allow potential cascading updates
                else
                    sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL
                fi
            done
        else
            echo "Merge Mode: keep-existing"
            while true; do
                ./run.sh --upload --upload-merge-mode keep-existing --prune-stale-slxs
                
                # Check for config changes and adjust sleep accordingly
                CURRENT_CONFIG_CHECKSUM=$(get_config_checksum)
                if [ "$CURRENT_CONFIG_CHECKSUM" != "$LAST_CONFIG_CHECKSUM" ]; then
                    echo "Configuration change detected! Running discovery immediately..."
                    LAST_CONFIG_CHECKSUM=$CURRENT_CONFIG_CHECKSUM
                    sleep 5  # Short delay to allow potential cascading updates
                else
                    sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL
                fi
            done
        fi
    else
        while true; do
            ./run.sh
            
            # Check for config changes and adjust sleep accordingly
            CURRENT_CONFIG_CHECKSUM=$(get_config_checksum)
            if [ "$CURRENT_CONFIG_CHECKSUM" != "$LAST_CONFIG_CHECKSUM" ]; then
                echo "Configuration change detected! Running discovery immediately..."
                LAST_CONFIG_CHECKSUM=$CURRENT_CONFIG_CHECKSUM
                sleep 5  # Short delay to allow potential cascading updates
            else
                sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL
            fi
        done
    fi 
else
  python manage.py runserver 0.0.0.0:8000 
  # Put this back after testing
  # python manage.py runserver 0.0.0.0:8000 --noreload
fi

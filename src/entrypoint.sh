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
# For live reload on 0.0.0.0:8000:
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
    if [[ "${RW_LOCAL_UPLOAD_ENABLED,,}" == "true" ]]; 
    then
        echo "Upload to RunWhen Platform Enabled"
        if [[ "$RW_LOCAL_UPLOAD_MERGE_MODE" == "keep-uploaded" ]]; 
        then
            echo "Merge Mode: keep-uploaded"
            while true; do ./run.sh --upload --upload-merge-mode keep-uploaded --prune-stale-slxs; sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL; done
        else
            echo "Merge Mode: keep-existing"
            while true; do ./run.sh --upload --upload-merge-mode keep-existing --prune-stale-slxs; sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL; done
        fi
    else
        while true; do ./run.sh; sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL; done
    fi 
else
  python manage.py runserver 0.0.0.0:8000 
  # Put this back after testing
  # python manage.py runserver 0.0.0.0:8000 --noreload
fi

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

if [ -L "cheat-sheet-docs/docs/output" ]; then
  rm "cheat-sheet-docs/docs/output"
fi

# Link the shared output dir so that mkdocs and surface config files
ln -s /shared/output cheat-sheet-docs/docs/output
mkdocs serve -f cheat-sheet-docs/mkdocs.yml &

if [[ "${RW_LOCAL_TERMINAL_DISABLED,,}" == "true" ]]; 
then
    echo "Terminal is disabled"
else
    node server.js &
fi 
nginx &

# Run neo4j in the background
echo Starting up neo4j
tini -g -s -- /startup/docker-entrypoint.sh neo4j &
echo Waiting a bit before starting workspace builder REST server
sleep 5
python manage.py migrate
echo Starting workspace builder REST server

# Check if AUTORUN_WORKSPACE_BUILDER_INTERVAL environment variable is set
# This is mostly for our kubernetes demo environment 
if [ -n "$AUTORUN_WORKSPACE_BUILDER_INTERVAL" ]; 
then
    echo "AUTORUN_WORKSPACE_BUILDER_INTERVAL is set. Running workspace-builder"
    python manage.py runserver 0.0.0.0:8000 --noreload &
    sleep 60
    if [[ "${RW_LOCAL_UPLOAD_ENABLED,,}" == "true" ]]; 
    then
        echo "Upload to RunWhen Platform Enabled"
        if [[ "$RW_LOCAL_UPLOAD_MERGE_MODE" == "keep-uploaded" ]]; 
        then
            echo "Merge Mode: keep-uploaded"
            while true; do ./run.sh --upload --upload-merge-mode keep-uploaded; sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL; done
        else
            echo "Merge Mode: keep-existing"
            while true; do ./run.sh --upload --upload-merge-mode keep-existing; sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL; done
        fi
    else
        while true; do ./run.sh; sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL; done
    fi 
else
    python manage.py runserver 0.0.0.0:8000 --noreload
fi

#!/bin/sh

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
    echo AUTORUN_WORKSPACE_BUILDER_INTERVAL is set. Running workspace-builder
    python manage.py runserver 0.0.0.0:8000 --noreload &
    sleep 60
    while true; do ./run.sh; sleep $AUTORUN_WORKSPACE_BUILDER_INTERVAL; done
else
    python manage.py runserver 0.0.0.0:8000 --noreload
fi
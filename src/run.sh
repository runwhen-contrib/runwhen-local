#!/bin/bash

# Path to the lock file
LOCK_FILE="/workspace-builder/.wb_lock"
DISABLE_CLOUDQUERY=0

# Parse arguments
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      echo """Usage: $(basename $0) [-w WORKSPACE_INFO_FILE] [-k KUBECONFIG_FILE] [-r CUSTOMIZATION_RULES_FILE] [-o OUTPUT_DIRECTORY] [--disable-cloudquery]
Optional arguments:
  -h, --help
      Display help about running the command and exit
  -w WORKSPACE_INFO_FILE, --workspace-info WORKSPACE_INFO_FILE
      Name/path of the workspace info file. Default is \"workspaceInfo.yaml\".
  -k KUBECONFIG_FILE, --kubeconfig KUBECONFIG_FILE
      Name/path of the kubeconfig file. Default is \"kubeconfig\".
  -r CUSTOMIZATION_RULES_FILE, --customization-rules CUSTOMIZATION_RULES_FILE
      Name/path of the customization rules file. Default is \"customizationRules.yaml\".
  -o OUTPUT_DIRECTORY, --output OUTPUT_DIRECTORY
      Name/path of the output directory for generated files. Default is \"output\".
  --upload
      Upload the generated workspace content to the PAPI server specified in the workspace info file.
  -v, --verbose
      Print more detailed output.
  --disable-cloudquery
      Disable the cloudquery component."""
      exit 0
      ;;
    --disable-cloudquery)
      DISABLE_CLOUDQUERY=1
      shift # past argument
      ;;
    *)    # unknown option
      POSITIONAL_ARGS+=("$1") # save it in an array for later
      shift # past argument
      ;;
  esac
done
set -- "${POSITIONAL_ARGS[@]}" # restore positional parameters

# Check if the lock file exists and exit if it's locked
if [ -e "$LOCK_FILE" ]; then
    echo "Lock file exists at $LOCK_FILE. Another process may be running." >&2
    echo "Lock file exists at $LOCK_FILE. Another process may be running." >> /shared/output/.status
    exit 1
fi

# Create the lock file
touch "$LOCK_FILE"

# Construct components string based on whether --disable-cloudquery is set
COMPONENTS="kubeapi,runwhen_default_workspace,generation_rules,render_output_items,dump_resources"
if [ $DISABLE_CLOUDQUERY -eq 0 ]; then
    COMPONENTS="kubeapi,cloudquery,runwhen_default_workspace,generation_rules,render_output_items,dump_resources"
fi

# Run the Python script with your specified arguments
python3 run.py run --components "$COMPONENTS" $@

# Remove the lock file after the Python script exits
rm -f "$LOCK_FILE"

exit 0

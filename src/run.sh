#!/bin/bash

# Path to the lock file
TMPDIR=${TMPDIR:-/tmp}
LOCK_FILE="$TMPDIR/.wb_lock"
# Honor DISABLE_CLOUDQUERY from the environment (e.g. Helm extraEnv); --disable-cloudquery still sets it below
DISABLE_CLOUDQUERY=${DISABLE_CLOUDQUERY:-0}

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
# `azureapi` / `gcpapi` / `awsapi` are the native Azure / GCP / AWS SDK
# indexers and are now the DEFAULT backend for each cloud. To opt back into the
# legacy CloudQuery path for a cloud, set its backend explicitly in
# workspaceInfo.yaml (azureIndexerBackend=cloudquery, gcpIndexerBackend=cloudquery,
# awsIndexerBackend=cloudquery). CloudQuery is still included below so the
# override keeps working; by default it is a no-op for all three clouds.
COMPONENTS="load_resources,kubeapi,azureapi,gcpapi,awsapi,azure_devops,generation_rules,render_output_items,dump_resources"
if [ $DISABLE_CLOUDQUERY -eq 0 ]; then
    COMPONENTS="load_resources,kubeapi,azureapi,gcpapi,awsapi,cloudquery,azure_devops,generation_rules,render_output_items,dump_resources"
fi

# Run the Python script with your specified arguments
python3 run.py run --components "$COMPONENTS" $@
# Remove the lock file after the Python script exits
rm -f "$LOCK_FILE"

exit 0

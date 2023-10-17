#!/bin/sh

# Path to the lock file
LOCK_FILE="/workspace-builder/.wb_lock"

if [ "$1" = "-h" -o "$1" = "--help" ]; then
  echo """Usage: `basename $0` [-w WORKSPACE_INFO_FILE] [-k KUBECONFIG_FILE] [-r CUSTOMIZATION_RULES_FILE] [-o OUTPUT_DIRECTORY]
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
      Print more detailed output."""

  exit 0
fi

# Check if the lock file exists and exit if it's locked
if [ -e "$LOCK_FILE" ]; then
    echo "Lock file exists at $LOCK_FILE. Another process may be running." >&2
    echo "Lock file exists at $LOCK_FILE. Another process may be running." >> /shared/output/.status
    exit 1
fi

# Create the lock file
touch "$LOCK_FILE"

# Run the Python script with your specified arguments
python3 run.py run --components "reset_models,kubeapi,runwhen_default_workspace,hclod,generation_rules,render_output_items,dump_resources" $@

# Remove the lock file after the Python script exits
rm -f "$LOCK_FILE"

exit 0
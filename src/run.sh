#!/bin/sh

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
python3 run.py run --components "reset_models,kubeapi,runwhen_default_workspace,hclod,generation_rules,render_output_items,dump_resources" $@

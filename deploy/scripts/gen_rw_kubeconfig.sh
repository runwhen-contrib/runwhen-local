#!/bin/bash
#######################################
# Helper script to create a kubeconfig using auth plugin helpers 
# to generate temporary tokens. As the RunWhen Local container 
# has no access to local system binaries, this is the simplest way
# to produce a kubeconfig that it can use.
#
# Currently supports: 
#   - google kubernetes engine (via gcloud)
#   - oracle cloud infrasructure (via oci)
#
# Author: @stewartshea
#######################################


#######################################
# Extract OCI command function by combining command and args
# Note: This is possibly reusable as we add various providers
#
# Arguments: 
#   path to shared kubeconfig which has parameters to build up the command
# Returns: 
#   full command to be executed
#######################################
extract_oci_command() {
    kubeconfig_file=$1
    
    # Extract command
    cmd=$(yq e '.users[] | select(.user.exec.command == "oci").user.exec.command' "$kubeconfig_file")

    # Extract args
    args=$(yq e '.users[] | select(.user.exec.command == "oci").user.exec.args[]' "$kubeconfig_file" | tr '\n' ' ')

    # Construct full command
    echo "$cmd $args"
}


# Set the working directory
workdir="$workdir"

# Check if the workdir/shared folder exists
if [ -d "$workdir/shared" ]; then
  echo "Directory '$workdir/shared' exists."
else
  echo "Error: Directory '$workdir/shared' does not exist."
  exit 1
fi

# Copy ~/.kube/config to $shared_dir/kubeconfig
cp ~/.kube/config "$workdir/shared/kubeconfig"

# Convert YAML to JSON
kubeconfig_json=$(yq eval -o=json "$workdir/shared/kubeconfig")

# Process the JSON
processed_json=$(echo "$kubeconfig_json" | jq --arg gke_token "$(gke-gcloud-auth-plugin generate-token "$user" | jq -r .status.token)" --arg oci_token "$($(extract_oci_command $workdir/shared/kubeconfig) | jq -r .status.token)" '
  .users[] |= 
    if .user.exec.command == "gke-gcloud-auth-plugin" then 
      .user.token = $gke_token 
      | del(.user.exec) 
    elif .user.exec.command == "oci" then 
      .user.token = $oci_token 
      | del(.user.exec) 
    else 
      . 
    end
')

# Convert JSON back to YAML and overwrite shared kubeconfig
echo "$processed_json" | yq eval -P - > "$workdir/shared/kubeconfig"


# Set permissions for container to read the file
chmod 655 "$workdir/shared/kubeconfig" 

# Output the modified kubeconfig
cat "$workdir/shared/kubeconfig"
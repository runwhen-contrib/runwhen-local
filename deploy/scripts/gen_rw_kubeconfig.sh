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

# Set the working directory
workdir="$workdir"


# Check if the workdir/shared folder exists
if [ -d "$workdir/shared" ]; then
  echo "Directory '$workdir/shared' exists."
else
  echo "Error: Directory '$workdir/shared' does not exist."
  exit 1
fi

# Use KUBECONFIG if set, else default to ~/.kube/config
if [ -z "${KUBECONFIG}" ]; then
    kubeconfig_path="$HOME/.kube/config"
else
    kubeconfig_path="${KUBECONFIG}"
fi

# Copy kubeconfig to $shared_dir/kubeconfig
cp "$kubeconfig_path" "$workdir/shared/kubeconfig"


# Convert YAML to JSON
kubeconfig_json=$(yq eval -o=json "$workdir/shared/kubeconfig")

# Check existence of each command in kubeconfig
gke_exists=$(yq e '.users[] | select(.user.exec.command == "gke-gcloud-auth-plugin")' "$workdir/shared/kubeconfig")
oci_exists=$(yq e '.users[] | select(.user.exec.command == "oci")' "$workdir/shared/kubeconfig")
oidc_exists=$(yq e '.users[] | select(.user.exec.command == "kubectl").user.exec.args[]' "$workdir/shared/kubeconfig" | grep "oidc-login")
kubelogin_exists=$(yq e '.users[] | select(.user.exec.command == "kubelogin")' "$workdir/shared/kubeconfig")

### New bits
users_count=$(yq e '.users|length' "$workdir/shared/kubeconfig")

# Iterate over each user stanza in the kubeconfig to generate unique tokens
for ((i = 0; i < $users_count; i++)); do

    # Extract the command and args for the current user
    user_command=$(yq e ".users[$i].user.exec.command" "$workdir/shared/kubeconfig")
    user_args=$(yq e ".users[$i].user.exec.args[]" "$workdir/shared/kubeconfig" | tr '\n' ' ')
    # Generate token based on the command and args
    case $user_command in
        gke-gcloud-auth-plugin)
            token=$(gke-gcloud-auth-plugin $user_args | jq -r .status.token)
            ;;
        oci)
            token=$(oci $user_args | jq -r .status.token)
            ;;
        kubectl)
            token=$(kubectl $user_args | jq -r .status.token)
            ;;
        kubelogin)
            token=$(kubelogin $user_args | jq -r .status.token)
            ;;
        *)
            token=""
            ;;
    esac

    # Update the user stanza with the generated token
    kubeconfig_json=$(echo "$kubeconfig_json" | jq --argjson i $i --arg token $token '.users[$i].user.token = $token | del(.users[$i].user.exec)')
done

# Convert JSON back to YAML and overwrite shared kubeconfig
echo "$kubeconfig_json" | yq eval -P - > "$workdir/shared/kubeconfig"


# Set permissions for container to read the file
chmod 655 "$workdir/shared/kubeconfig" 

# Output the modified kubeconfig
cat "$workdir/shared/kubeconfig"
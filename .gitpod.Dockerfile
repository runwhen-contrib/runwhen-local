FROM gitpod/workspace-full


USER root
#### Install tools for cli processing
## Install yq
RUN brew install yq
RUN brew install jq

#### Install Auth Tools for testing
## Kubectl 
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
RUN curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
RUN echo "$(cat kubectl.sha256) kubectl" | sha256sum --check
RUN rm kubectl.sha256
RUN chmod +x kubectl
RUN mv kubectl /usr/local/bin/

## Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
RUN az aks install-cli


## Gcloud 
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH "$PATH:/home/gitpod/google-cloud-sdk/bin/"
RUN gcloud components install gke-gcloud-auth-plugin --quiet

USER gitpod

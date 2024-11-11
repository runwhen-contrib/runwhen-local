# Use a Python-based Debian image with Docker installed as the base
FROM mcr.microsoft.com/vscode/devcontainers/python:3.12

# Create the runwhen user and add it to the sudo group
RUN useradd -m -s /bin/bash runwhen && \
    echo "runwhen ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Switch to root to install required tools
USER root

# Update and install dependencies
RUN apt-get update && apt-get install -y \
    jq \
    curl \
    sudo \
    unzip

# Install yq
RUN curl -Lo /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && \
    chmod +x /usr/local/bin/yq

# Install Kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256" && \
    echo "$(cat kubectl.sha256) kubectl" | sha256sum --check && \
    rm kubectl.sha256 && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/

# Install Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash && \
    az aks install-cli

# Install Google Cloud SDK
RUN curl -sSL https://sdk.cloud.google.com | bash && \
    echo "source /root/google-cloud-sdk/path.bash.inc" >> ~/.bashrc && \
    source ~/.bashrc && \
    gcloud components install gke-gcloud-auth-plugin --quiet

# Install Trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Add Docker CLI
RUN apt-get install -y docker.io

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Switch to the 'runwhen' user
USER runwhen

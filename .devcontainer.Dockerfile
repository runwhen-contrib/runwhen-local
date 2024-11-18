# Use a Python-based Debian image with Docker installed as the base
FROM debian:bullseye-slim


ENV RUNWHEN_HOME=/home/runwhen

USER root

# Set up directories and permissions
RUN mkdir -p $RUNWHEN_HOME/runwhen-local
WORKDIR $RUNWHEN_HOME/runwhen-local

# Copy files into container with correct ownership
COPY --chown=runwhen:0 . .

# Create the runwhen user and add it to the sudo group
RUN useradd -m -s /bin/bash runwhen && \
    echo "runwhen ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Update and install dependencies
RUN apt-get update && apt-get install -y \
    jq \
    curl \
    sudo \
    unzip && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Terraform
ENV TERRAFORM_VERSION=1.9.8
RUN wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip terraform -d /usr/local/bin/ && \
    rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

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

# Install AWS CLI v2 using tarball
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip" && \
    unzip /tmp/awscliv2.zip -d /tmp && \
    /tmp/aws/install && \
    rm -rf /tmp/awscliv2.zip /tmp/aws

# Install Google Cloud CLI using tarball
ENV GCLOUD_CLI_VERSION="441.0.0"
RUN curl -LO "https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-${GCLOUD_CLI_VERSION}-linux-x86_64.tar.gz" && \
    tar -xzf google-cloud-cli-${GCLOUD_CLI_VERSION}-linux-x86_64.tar.gz -C /usr/local && \
    /usr/local/google-cloud-sdk/install.sh --quiet && \
    rm -f google-cloud-cli-${GCLOUD_CLI_VERSION}-linux-x86_64.tar.gz

# Update PATH for gcloud
ENV PATH="/usr/local/google-cloud-sdk/bin:$PATH"

# Install Trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Adjust permissions for runwhen user
RUN chown runwhen:0 -R $RUNWHEN_HOME/

# Switch to the runwhen user for Homebrew installation
USER runwhen

# Download and install Homebrew in the user's home directory
RUN NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || true

# Add Homebrew to PATH for runwhen user
RUN echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> $RUNWHEN_HOME/.bashrc

# Switch back to root to finalize environment
USER root

# Set up the environment for Homebrew and Google Cloud SDK
ENV PATH="/home/linuxbrew/.linuxbrew/bin:/root/google-cloud-sdk/bin:${PATH}"


# Set RunWhen Temp Dir
RUN mkdir -p /var/tmp/runwhen && chmod 1777 /var/tmp/runwhen
ENV TMPDIR=/var/tmp/runwhen

# Adjust permissions for runwhen user
RUN chown runwhen:0 -R $RUNWHEN_HOME/runwhen-local

# Switch back to the 'runwhen' user as default
USER runwhen

RUN brew install \
    go-task \   
    azure-cli \
    awscli

CMD ["bash"]

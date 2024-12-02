FROM python:3.12.6-slim

# Create a non-root user `runwhen` to run commands
ENV RUNWHEN_HOME=/home/runwhen

RUN groupadd -r runwhen && \
    useradd -r -g runwhen -d $RUNWHEN_HOME -m -s /bin/bash runwhen && \
    mkdir -p $RUNWHEN_HOME && \
    chown -R runwhen:runwhen $RUNWHEN_HOME && \
    echo "runwhen ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

RUN mkdir $RUNWHEN_HOME/runwhen-local
WORKDIR $RUNWHEN_HOME/runwhen-local

# Install CLI tools and OS app dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    entr curl wget jq bc vim dnsutils unzip git apt-transport-https lsb-release bsdmainutils \
    build-essential file locales procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/share/doc /usr/share/man /usr/share/info /var/cache/man

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

RUN git clone https://github.com/Homebrew/brew ~/.linuxbrew/Homebrew \
&& mkdir ~/.linuxbrew/bin \
&& ln -s ../Homebrew/bin/brew ~/.linuxbrew/bin \
&& eval $(~/.linuxbrew/bin/brew shellenv) \
&& brew --version

# Switch back to root to finalize environment
USER root

# Set RunWhen Temp Dir
RUN mkdir -p /var/tmp/runwhen && chmod 1777 /var/tmp/runwhen
ENV TMPDIR=/var/tmp/runwhen

# Copy files into container with correct ownership
COPY --chown=runwhen:0 . .

# Adjust permissions for runwhen user
RUN chown runwhen:0 -R $RUNWHEN_HOME/runwhen-local

# Set up Homebrew path for the runwhen user in the Docker build process
ENV PATH="/home/runwhen/.linuxbrew/bin:$PATH"

# Add sudo
RUN apt-get update && \
    echo "sudo sudo/installer/default_select string N" | debconf-set-selections && \
    apt-get install -y --no-install-recommends sudo && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt

RUN echo "runwhen ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers


# Switch back to the 'runwhen' user as default
USER runwhen

RUN brew install \
    go-task \   
    azure-cli \
    awscli

CMD ["bash"]

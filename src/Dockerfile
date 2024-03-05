FROM node:21.6.1-bullseye-slim AS node-base

RUN apt-get update && apt-get install -y \
    python3 \
    pip \
    entr \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VERSION=1.2.1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Builder stage used for building and installing python dependencies within the venv
FROM node-base as builder-base

# Install Build Time Only Dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry (Utilizes POETRY_HOME & POETRY_VERSION)
RUN curl -sSL https://install.python-poetry.org | python3 - --version 1.3.2

# Copy project requirement files here to ensure they will be cached.
WORKDIR $PYSETUP_PATH

COPY pyproject.toml poetry.lock ./
COPY pyproject.toml ./

# Install Python Dependencies
RUN poetry install

# Final Image Stage
FROM node-base AS app
LABEL org.opencontainers.image.description="The RunWhen Local container image is a local tool to scan your Kubernetes based clusters and provide human readable and searchable troubleshooting documentation and commands."
RUN groupadd -r runwhen && useradd --no-log-init -r -g runwhen runwhen

ENV RUNWHEN_HOME='/workspace-builder' \
    RUNWHEN_SHARED='/shared'

# Copy Poetry to final image
COPY --from=builder-base $POETRY_HOME $POETRY_HOME

# Copy Virtual Environment to final image
COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH

RUN apt-get update \
    && apt-get install tree wget unzip vim git -y --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR $RUNWHEN_HOME

RUN pip install --no-cache-dir \
    mkdocs \
    mkdocs-material \
    mkdocs-print-site-plugin \
    pymdown-extensions \
    ruamel.yaml \
    gitpython

RUN npm install \
    xterm \
    express \
    ws \
    node-pty \
    multer

ENV NODE_PATH="/var/lib/neo4j/node_modules"

# Install gcloud
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH "$PATH:/root/google-cloud-sdk/bin/"
RUN gcloud components install gke-gcloud-auth-plugin --quiet

# Install Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

# Install lnav (https://github.com/tstack/lnav)
ENV LNAV_VERSION 0.11.2
RUN wget https://github.com/tstack/lnav/releases/download/v${LNAV_VERSION}/lnav-${LNAV_VERSION}-x86_64-linux-musl.zip\
    && unzip lnav-${LNAV_VERSION}-x86_64-linux-musl.zip \
    && rm lnav-${LNAV_VERSION}-x86_64-linux-musl.zip \
    && cd lnav-${LNAV_VERSION} \
    && mkdir -p /home/runwhen/.lnav/formats/installed \
    && mv lnav /usr/local/bin

# Install and validate kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256" \
    && echo "$(cat kubectl.sha256) kubectl" | sha256sum --check \
    && rm kubectl.sha256 \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/ \
    && KUBECONFIG=/shared/kubeconfig

# Download and install the latest OpenShift CLI (oc)
RUN wget -O /tmp/oc.tar.gz https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/openshift-client-linux.tar.gz \
    && tar -xzf /tmp/oc.tar.gz -C /usr/local/bin/ \
    && rm /tmp/oc.tar.gz

# Download the cloudquery CLI
RUN curl -L https://github.com/cloudquery/cloudquery/releases/download/cli-v5.3.0/cloudquery_linux_amd64 -o /usr/local/bin/cloudquery \
    && chmod a+x /usr/local/bin/cloudquery

# RunWhen customizations
ADD . $RUNWHEN_HOME


RUN mkdir $RUNWHEN_SHARED \
    && usermod -g 0 runwhen -G 0  \
    && chown -R runwhen:0 $RUNWHEN_HOME $RUNWHEN_SHARED \
    && chmod g=u /etc/passwd \
    && chmod -R g+w ${RUNWHEN_HOME} ${RUNWHEN_SHARED}


# Reverse Proxy Bits
RUN apt-get update && apt-get install -y nginx && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY nginx.conf /etc/nginx/sites-enabled/default


# Adjust ownership and permissions for Nginx directories and files to ensure compatibility with arbitrary user IDs
RUN mkdir -p /var/log/nginx /var/lib/nginx /run/nginx /usr/share/nginx/html && \
    chown -R :0 /etc/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx && \
    chmod -R g+rwX /etc/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx && \
    touch /run/nginx.pid && \
    chown :0 /run/nginx.pid && \
    chmod g+rwX /run/nginx.pid && \
    find /etc/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx -type d -exec chmod g+s {} \+


# # Set ownership for Nginx directories and files
# RUN chown -R runwhen:0 /etc/nginx/ \
#     && chown -R runwhen:0 /var/log/nginx/ \
#     && chown -R runwhen:0 /usr/share/nginx/html \
#     && touch /run/nginx.pid \
#     && chown runwhen:0 /run/nginx.pid \
#     && chown -R runwhen:0 /var/lib/nginx/

# # Set ownership for Nginx directories and files
# RUN chown -R runwhen:runwhen /etc/nginx/ \
#     && chown -R runwhen:runwhen /var/log/nginx/ \
#     && chown -R runwhen:runwhen /usr/share/nginx/html \
#     && touch /run/nginx.pid \
#     && chown runwhen:runwhen /run/nginx.pid \
#     && chown -R runwhen:runwhen /var/lib/nginx/


USER runwhen
EXPOSE 8081
ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]
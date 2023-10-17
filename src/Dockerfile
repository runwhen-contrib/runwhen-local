FROM neo4j:5-community as neo4j-base

RUN apt-get update && apt-get install -y \
    python3 \
    pip \
    libgeos-dev \
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
    VENV_PATH="/opt/pysetup/.venv" \
    NEO4J_AUTH='neo4j/thisisnotalongrunningdb' 

ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Install CLI tools and OS Runtime Dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    entr \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Builder stage used for building and installing python dependencies within the venv
FROM neo4j-base as builder-base

# Install Build Time Only Dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl build-essential unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry (Utilizes POETRY_HOME & POETRY_VERSION)
RUN curl -sSL https://install.python-poetry.org | python3 - --version 1.3.2

# Copy project requirement files here to ensure they will be cached.
WORKDIR $PYSETUP_PATH
# COPY pyproject.toml poetry.lock ./
COPY pyproject.toml ./

# Install Python Dependencies
RUN poetry install

# Install the neo4j gds plugin
RUN curl -o neo4j-gds.zip https://graphdatascience.ninja/neo4j-graph-data-science-2.3.0.zip
RUN mkdir /plugins
RUN unzip neo4j-gds.zip -d /plugins

# Final Image Stage
FROM neo4j-base AS app
LABEL org.opencontainers.image.description The RunWhen Local container image is a local tool to scan your Kubernetes based clusters and provide human readable and searchable troubleshooting documentation and commands.
RUN groupadd -r runwhen && useradd --no-log-init -r -g runwhen runwhen

ENV RUNWHEN_HOME='/workspace-builder' \
    RUNWHEN_SHARED='/shared'

# Copy Poetry to final image
COPY --from=builder-base $POETRY_HOME $POETRY_HOME

# Copy Virtual Environment to final image
COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH

# Add tools for live tool documentation
RUN set -uex; \
    apt-get update; \
    apt-get install -y ca-certificates curl gnupg; \
    mkdir -p /etc/apt/keyrings; \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
     | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
    NODE_MAJOR=20; \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
     > /etc/apt/sources.list.d/nodesource.list; \
    apt-get update; \
    apt-get install nodejs -y;

RUN apt-get install tree wget unzip vim git -y --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir mkdocs mkdocs-material mkdocs-print-site-plugin pymdown-extensions ruamel.yaml gitpython
RUN npm install -g npm@10.2.0
RUN npm install xterm express ws node-pty multer
ENV NODE_PATH="/var/lib/neo4j/node_modules"

# Add command-line tools
# Commented out if not needed in the dev container
# Install gcloud sdk 
# RUN curl -sSL https://sdk.cloud.google.com | bash
# ENV PATH "$PATH:/home/runwhen/google-cloud-sdk/bin/"
# RUN gcloud components install gke-gcloud-auth-plugin --quiet

# Install lnav (https://github.com/tstack/lnav)
ENV LNAV_VERSION 0.11.2
RUN wget https://github.com/tstack/lnav/releases/download/v${LNAV_VERSION}/lnav-${LNAV_VERSION}-x86_64-linux-musl.zip && \
    unzip lnav-${LNAV_VERSION}-x86_64-linux-musl.zip && \
    cd lnav-${LNAV_VERSION} && \
    mkdir -p /home/runwhen/.lnav/formats/installed && \ 
    mv lnav /usr/local/bin

# Install and validate kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
RUN curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
RUN echo "$(cat kubectl.sha256) kubectl" | sha256sum --check
RUN rm kubectl.sha256
RUN chmod +x kubectl
RUN mv kubectl /usr/local/bin/
ENV KUBECONFIG=/shared/kubeconfig

# Download and install the latest OpenShift CLI (oc)
RUN wget -O /tmp/oc.tar.gz https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/openshift-client-linux.tar.gz && \
    tar -xzf /tmp/oc.tar.gz -C /usr/local/bin/ && \
    rm /tmp/oc.tar.gz
# Verify the installation
RUN oc version

WORKDIR $RUNWHEN_HOME

# RunWhen customizations
ADD . $RUNWHEN_HOME


# Copy over the neo4j config file and gds plugin jar
COPY --from=builder-base /plugins/* /plugins
COPY ./neo4j.conf /conf

RUN mkdir $RUNWHEN_SHARED \
    && usermod -g 0 runwhen -G 0  \
    &&  chown -R runwhen:0 $RUNWHEN_HOME $RUNWHEN_SHARED \ 
    && chmod g=u /etc/passwd \
    && chmod -R g+w ${RUNWHEN_HOME} ${RUNWHEN_SHARED}  


# Reverse Proxy Bits
RUN apt-get update && apt-get install -y nginx && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY nginx.conf /etc/nginx/sites-enabled/default

# Set ownership for Nginx directories and files
RUN chown -R runwhen:runwhen /etc/nginx/ \
    && chown -R runwhen:runwhen /var/log/nginx/ \
    && chown -R runwhen:runwhen /usr/share/nginx/html \
    && touch /run/nginx.pid \
    && chown runwhen:runwhen /run/nginx.pid \
    && chown -R runwhen:runwhen /var/lib/nginx/


USER runwhen
EXPOSE 8081
ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]
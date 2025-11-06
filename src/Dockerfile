# renovate: datasource=docker depName=python
FROM python:3.14-slim AS node-base

# Install Node.js from official NodeSource repository
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_current.x | bash - \
    && apt-get install -y \
    nodejs \
    entr \
    && apt-get -y upgrade \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_HOME="/opt/poetry" \
    # renovate: datasource=github-releases depName=python-poetry/poetry
    POETRY_VERSION=2.2.1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Builder stage used for building and installing python dependencies within the venv
FROM node-base AS builder-base

# Install Build Time Only Dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry (Utilizes POETRY_HOME & POETRY_VERSION)
RUN curl -sSL https://install.python-poetry.org | python3 - --version $POETRY_VERSION

# Copy project requirement files here to ensure they will be cached.
WORKDIR $PYSETUP_PATH

COPY pyproject.toml ./

# Install Python Dependencies
RUN poetry run pip install --upgrade pip setuptools wheel
RUN poetry install --only main

# Final Image Stage
FROM node-base AS app
LABEL org.opencontainers.image.description="RunWhen Local discovers and generates troubleshooting and automation tasks for your environment."
RUN groupadd -r runwhen && useradd --no-log-init -r -g runwhen runwhen

# Make sure we do NOT override HOME to /workspace-builder; set it to /shared
ENV RUNWHEN_HOME='/workspace-builder'
ENV RUNWHEN_SHARED='/shared'
ENV HOME='/shared'

# Copy in code
WORKDIR $RUNWHEN_HOME
ADD . $RUNWHEN_HOME

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
    mkdocs-macros-plugin \
    pymdown-extensions \
    ruamel.yaml \
    gitpython \
    pyyaml

ENV NODE_PATH="/var/lib/neo4j/node_modules"
ENV CLOUDQUERY_PLUGINS_PREINSTALLED=true

# Determine architecture and set variables
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
    KUBE_ARCH="amd64"; \
    CQ_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then \
    KUBE_ARCH="arm64"; \
    CQ_ARCH="arm64"; \
    else \
    echo "Unsupported architecture"; \
    exit 1; \
    fi && \
    # Install and validate kubectl
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${KUBE_ARCH}/kubectl" \
    && curl -LO "https://dl.k8s.io/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${KUBE_ARCH}/kubectl.sha256" \
    && echo "$(cat kubectl.sha256) kubectl" | sha256sum --check \
    && rm kubectl.sha256 \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/ \
    && KUBECONFIG=/shared/kubeconfig \
    # Download the cloudquery CLI
    # Temporary hack to fix critical vuln
    && curl -L "https://github.com/stewartshea/cloudquery/releases/latest/download/cloudquery-linux-${CQ_ARCH}" -o /usr/local/bin/cloudquery \
    && chmod a+x /usr/local/bin/cloudquery \
    # Pre-install CloudQuery plugins for airgap support
    && mkdir -p /opt/cloudquery/plugins \
    && cd /opt/cloudquery/plugins \
    # Download Azure plugin
    && curl -L "https://github.com/cloudquery/cloudquery/releases/download/plugins-source-azure-v11.4.3/cloudquery_source_azure_v11.4.3_linux_${CQ_ARCH}" -o azure \
    && chmod +x azure \
    # Download AWS plugin  
    && curl -L "https://github.com/cloudquery/cloudquery/releases/download/plugins-source-aws-v25.1.0/cloudquery_source_aws_v25.1.0_linux_${CQ_ARCH}" -o aws \
    && chmod +x aws \
    # Download GCP plugin
    && curl -L "https://github.com/cloudquery/cloudquery/releases/download/plugins-source-gcp-v13.1.0/cloudquery_source_gcp_v13.1.0_linux_${CQ_ARCH}" -o gcp \
    && chmod +x gcp \
    # Download SQLite destination plugin
    && curl -L "https://github.com/cloudquery/cloudquery/releases/download/plugins-destination-sqlite-v2.5.1/cloudquery_destination_sqlite_v2.5.1_linux_${CQ_ARCH}" -o sqlite \
    && chmod +x sqlite \
    # Download Kubernetes plugin (if needed)
    && curl -L "https://github.com/cloudquery/cloudquery/releases/download/plugins-source-k8s-v8.0.2/cloudquery_source_k8s_v8.0.2_linux_${CQ_ARCH}" -o k8s \
    && chmod +x k8s \
    && cd - \
    # Install kubelogin for azure kubeconfig conversion
    # renovate: datasource=github-releases depName=Azure/kubelogin
    && curl -Lo kubelogin.zip https://github.com/Azure/kubelogin/releases/latest/download/kubelogin-linux-amd64.zip \
    && unzip kubelogin.zip \
    && mv bin/linux_amd64/kubelogin /usr/local/bin/kubelogin \
    && rm kubelogin.zip \ 
    && rm -rf bin \
    && chmod +x /usr/local/bin/kubelogin

# RunWhen customizations
ENV HOME=$RUNWHEN_SHARED
ADD . $RUNWHEN_HOME

RUN mkdir -p ${RUNWHEN_SHARED} \
    && usermod -g 0 runwhen -G 0  \
    && chown -R runwhen:0 $RUNWHEN_HOME $RUNWHEN_SHARED \
    && chmod g=u /etc/passwd \
    && chmod -R g+w ${RUNWHEN_HOME} ${RUNWHEN_SHARED}


# Local CodeCollection Cache
# ------------------------------------------------------------------
# Args / env
ARG INCLUDE_CODE_COLLECTION_CACHE=true
ENV CODE_COLLECTION_CACHE_ROOT=/opt/runwhen/codecollection-cache
# ------------------------------------------------------------------

# Copy defaults list so the build stage can read it
COPY default-code-collections.yaml ${CODE_COLLECTION_CACHE_ROOT}/

# clone as root (still) and then chown the result for the app user
RUN set -eux; \
    mkdir -p "$CODE_COLLECTION_CACHE_ROOT"; \
    grep -Eo 'https://[^ ]+' "$CODE_COLLECTION_CACHE_ROOT/default-code-collections.yaml" \
    | while read -r url; do \
          name="$(basename "${url%.*}")"; \
          git clone --mirror --quiet "$url" "$CODE_COLLECTION_CACHE_ROOT/${name}.git"; \
      done; \
    chown -R runwhen:runwhen "$CODE_COLLECTION_CACHE_ROOT"

USER runwhen
EXPOSE 8081
ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]

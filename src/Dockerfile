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
    POETRY_VERSION=2.4.2 \
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

COPY pyproject.toml poetry.lock ./

# Install Python Dependencies. The lockfile pins every transitive dep so the
# image build is reproducible and is not exposed to upstream resolution flakes
# (e.g. a freshly-published transitive that doesn't yet have wheels for the
# Python ABI we target).
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

ENV NODE_PATH="/var/lib/neo4j/node_modules"

# Determine architecture for kubectl download
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        export KUBE_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        export KUBE_ARCH="arm64"; \
    else \
        echo "Unsupported architecture"; \
        exit 1; \
    fi

# Install kubectl v1.35.0 (pinned for stability)
RUN KUBE_ARCH=$(if [ "$(uname -m)" = "x86_64" ]; then echo "amd64"; else echo "arm64"; fi) && \
    KUBE_VERSION="v1.35.0" && \
    echo "Installing kubectl version: ${KUBE_VERSION}" && \
    curl -LO "https://dl.k8s.io/release/${KUBE_VERSION}/bin/linux/${KUBE_ARCH}/kubectl" && \
    curl -LO "https://dl.k8s.io/release/${KUBE_VERSION}/bin/linux/${KUBE_ARCH}/kubectl.sha256" && \
    echo "$(cat kubectl.sha256) kubectl" | sha256sum --check && \
    rm kubectl.sha256 && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/ && \
    kubectl version --client

# Install kubelogin for Azure
RUN KL_ARCH=$(if [ "$(uname -m)" = "x86_64" ]; then echo "amd64"; else echo "arm64"; fi) && \
    curl -Lo kubelogin.zip "https://github.com/Azure/kubelogin/releases/latest/download/kubelogin-linux-${KL_ARCH}.zip" \
    && unzip kubelogin.zip \
    && mv "bin/linux_${KL_ARCH}/kubelogin" /usr/local/bin/kubelogin \
    && rm kubelogin.zip \
    && rm -rf bin \
    && chmod +x /usr/local/bin/kubelogin

# Install AWS CLI for EKS authentication
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; \
    fi && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf aws awscliv2.zip

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

# Mark all repositories as safe for git's "dubious ownership" check.
#
# Local code collections (workspaceInfo codeCollections with a file:// repoURL,
# e.g. the gcpapi-test-codecollection) live on the bind-mounted /shared, which
# is owned by the *host* runner's uid. Inside the container the app runs as
# uid 999 (runwhen), so that uid rarely matches the bind-mount owner and git
# aborts the GitPython 'git clone --mirror' with
# "fatal: detected dubious ownership" (exit 128), silently skipping the code
# collection and its generation rules.
#
# This MUST be written to git's SYSTEM config (/etc/gitconfig). git only honors
# safe.directory from system/global config files -- values injected via the
# command line or GIT_CONFIG_COUNT/GIT_CONFIG_KEY_*/GIT_CONFIG_VALUE_* env vars
# report origin "command line" and are deliberately IGNORED for safe.directory.
# System config is also independent of HOME (=/shared, which is read-only for
# the container uid when the host runner uid differs), so it works regardless of
# the runner/container uid mismatch.
RUN git config --system --add safe.directory '*'

USER runwhen
EXPOSE 8000
ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]

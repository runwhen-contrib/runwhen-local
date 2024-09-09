FROM node:current-slim AS node-base

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

COPY pyproject.toml ./

# Install Python Dependencies
RUN poetry install --only main

# Final Image Stage
FROM node-base AS app
LABEL org.opencontainers.image.description="The RunWhen Local container image discovers your cloud resources and provides tailored and executable troubleshooting and health check commands from a community of experts."
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
    mkdocs-macros-plugin \
    pymdown-extensions \
    ruamel.yaml \
    gitpython \
    azure-identity \
    azure-mgmt-containerservice \
    azure-mgmt-resource \
    pyyaml

RUN npm install \
    xterm \
    express \
    ws \
    node-pty \
    multer

ENV NODE_PATH="/var/lib/neo4j/node_modules"

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
    && curl -L "https://github.com/stewartshea/cloudquery/releases/download/cli-v5.25.3/cloudquery_linux_${CQ_ARCH}" -o /usr/local/bin/cloudquery \
    # && curl -L "https://github.com/cloudquery/cloudquery/releases/download/cli-v5.3.0/cloudquery_linux_${CQ_ARCH}" -o /usr/local/bin/cloudquery \
    && chmod a+x /usr/local/bin/cloudquery \
    # Install kubelogin for azure kubeconfig conversion
    && curl -Lo kubelogin.zip https://github.com/Azure/kubelogin/releases/latest/download/kubelogin-linux-amd64.zip \
    && unzip kubelogin.zip \
    && mv bin/linux_amd64/kubelogin /usr/local/bin/kubelogin \
    && rm kubelogin.zip \ 
    && rm -rf bin \
    && chmod +x /usr/local/bin/kubelogin

# RunWhen customizations
ENV HOME $RUNWHEN_HOME
ADD . $RUNWHEN_HOME

RUN mkdir $RUNWHEN_SHARED \
    && usermod -g 0 runwhen -G 0  \
    && chown -R runwhen:0 $RUNWHEN_HOME $RUNWHEN_SHARED \
    && chmod g=u /etc/passwd \
    && chmod -R g+w ${RUNWHEN_HOME} ${RUNWHEN_SHARED}

# Reverse Proxy Bits
RUN apt-get update && apt-get install -y nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/sites-enabled/default

# Adjust ownership and permissions for Nginx directories and files to ensure compatibility with arbitrary user IDs
RUN mkdir -p /var/log/nginx /var/lib/nginx /run/nginx /usr/share/nginx/html && \
    chown -R :0 /etc/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx && \
    chmod -R g+rwX /etc/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx && \
    touch /run/nginx.pid && \
    chown :0 /run/nginx.pid && \
    chmod g+rwX /run/nginx.pid && \
    find /etc/nginx /var/log/nginx /usr/share/nginx/html /var/lib/nginx -type d -exec chmod g+s {} \+

USER runwhen
EXPOSE 8081
ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]

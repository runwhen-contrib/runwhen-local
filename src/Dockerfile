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


# Copy Poetry to final image
COPY --from=builder-base $POETRY_HOME $POETRY_HOME

# Copy Virtual Environment to final image
COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH

WORKDIR /workspace-builder

# Add tools for live tool documentation
RUN wget -q -O - https://deb.nodesource.com/setup_19.x | bash - \
    && apt-get install nodejs gnupg wget vim git -y --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir mkdocs mkdocs-material mkdocs-print-site-plugin pymdown-extensions ruamel.yaml gitpython

# RunWhen customizations
ADD . /workspace-builder


# Copy over the neo4j config file and gds plugin jar
COPY --from=builder-base /plugins/* /plugins
COPY ./neo4j.conf /conf

RUN mkdir /shared

RUN chown -R runwhen:runwhen /shared \ 
    && chown -R runwhen:runwhen /workspace-builder 

RUN chmod 755 /workspace-builder 

USER runwhen
EXPOSE 8081
ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]
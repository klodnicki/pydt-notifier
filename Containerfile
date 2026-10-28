FROM debian:bookworm-slim

ENV NVM_DIR=/usr/local/nvm
ENV PATH=/usr/local/nvm/current/bin:${PATH}

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

WORKDIR /opt/pydt-notifier

COPY nvm_version .nvmrc ./

RUN apt-get update \
    && apt-get install --yes --no-install-recommends bash ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && NVM_VERSION="$(cat nvm_version)" \
    && NODE_VERSION="$(cat .nvmrc)" \
    && mkdir -p "$NVM_DIR" \
    && curl --fail --silent --show-error --location \
        "https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh" \
        | bash \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install "$NODE_VERSION" \
    && nvm alias default "$NODE_VERSION" \
    && ln -s "$NVM_DIR/versions/node/v${NODE_VERSION}" "$NVM_DIR/current"

COPY . .

RUN npm install --global --omit=dev /opt/pydt-notifier \
    && npm cache clean --force

LABEL org.opencontainers.image.source="https://github.com/klodnicki/pydt-notifier"

ENTRYPOINT ["com-klodnicki-pydt-notifier", "/etc/com-klodnicki-pydt-notifier/config.json"]

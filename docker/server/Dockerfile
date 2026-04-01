# LaHIM core API — minimal workspace (server + loinc only). Build context: LaHIM/.
# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app

ENV NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_FACTOR=2 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_PREFER_OFFLINE=true \
    NPM_CONFIG_PROGRESS=false \
    NPM_CONFIG_LOGLEVEL=notice

COPY docker/context/server/package.json ./package.json
COPY docker/context/server/package.server.json ./packages/server/package.json
COPY packages/loinc/package.json ./packages/loinc/package.json

RUN --mount=type=cache,target=/root/.npm \
    npm install --ignore-scripts --legacy-peer-deps --verbose

FROM base AS build
WORKDIR /app

ENV NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_FACTOR=2 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_PREFER_OFFLINE=true \
    NPM_CONFIG_PROGRESS=false \
    NPM_CONFIG_LOGLEVEL=notice

COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/server/package.json ./packages/server/package.json
COPY --from=deps /app/packages/loinc/package.json ./packages/loinc/package.json

COPY packages/server ./packages/server
COPY packages/loinc ./packages/loinc

WORKDIR /app/packages/loinc
RUN npm run build

WORKDIR /app/packages/server
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

WORKDIR /app/packages/server
COPY docker/server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]

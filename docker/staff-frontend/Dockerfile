# Staff SPA — workspaces: frontend + components-lahim. Build context: LaHIM/.
# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
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

ARG VITE_LAHIM_API=http://localhost:3000
ARG VITE_HOSPITALRUN_API=http://localhost:3000
ENV VITE_LAHIM_API=${VITE_LAHIM_API}
ENV VITE_HOSPITALRUN_API=${VITE_HOSPITALRUN_API}

COPY docker/context/staff-frontend/package.json ./package.json
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/components-lahim/package.json ./packages/components-lahim/package.json

RUN --mount=type=cache,target=/root/.npm \
    npm install --ignore-scripts --legacy-peer-deps --verbose

FROM node:20-bookworm-slim AS build
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

ARG VITE_LAHIM_API=http://localhost:3000
ARG VITE_HOSPITALRUN_API=http://localhost:3000
ENV VITE_LAHIM_API=${VITE_LAHIM_API}
ENV VITE_HOSPITALRUN_API=${VITE_HOSPITALRUN_API}

COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/frontend/package.json ./packages/frontend/package.json
COPY --from=deps /app/packages/components-lahim/package.json ./packages/components-lahim/package.json

COPY packages/frontend ./packages/frontend
COPY packages/components-lahim ./packages/components-lahim
RUN npm run build --workspace=@lahim/components
RUN npm run build --workspace=@lahim/frontend

FROM nginx:1.27-alpine
COPY --from=build /app/packages/frontend/build /usr/share/nginx/html
COPY docker/nginx/spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

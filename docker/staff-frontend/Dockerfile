# Staff SPA — workspaces: frontend + components-lahim. Build context: LaHIM/.
# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

ARG VITE_HOSPITALRUN_API=http://localhost:3000
ENV VITE_HOSPITALRUN_API=${VITE_HOSPITALRUN_API}

COPY docker/context/staff-frontend/package.json ./package.json
COPY packages/frontend ./packages/frontend
COPY packages/components-lahim ./packages/components-lahim

RUN npm install --ignore-scripts --legacy-peer-deps
RUN npm run build --workspace=@lahim/components
RUN npm run build --workspace=@lahim/frontend

FROM nginx:1.27-alpine
COPY --from=build /app/packages/frontend/build /usr/share/nginx/html
COPY docker/nginx/spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

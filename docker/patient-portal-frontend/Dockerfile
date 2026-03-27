# Patient portal SPA — workspaces: patient-portal-frontend + components-lahim. Build context: LaHIM/.
# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

ARG VITE_PORTAL_API_URL=http://localhost:4001
ENV VITE_PORTAL_API_URL=${VITE_PORTAL_API_URL}

COPY docker/context/patient-portal-frontend/package.json ./package.json
COPY packages/patient-portal-frontend ./packages/patient-portal-frontend
COPY packages/components-lahim ./packages/components-lahim

RUN npm install --ignore-scripts --legacy-peer-deps
RUN npm run build --workspace=@lahim/components
RUN npm run build --workspace=@lahim/patient-portal-frontend

FROM nginx:1.27-alpine
COPY --from=build /app/packages/patient-portal-frontend/dist /usr/share/nginx/html
COPY docker/nginx/spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

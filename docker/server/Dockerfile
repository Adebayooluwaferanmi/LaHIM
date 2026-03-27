# LaHIM core API — minimal workspace (server + loinc only). Build context: LaHIM/.
# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY docker/context/server/package.json ./package.json
COPY packages/server ./packages/server
COPY packages/loinc ./packages/loinc

RUN npm install --ignore-scripts --legacy-peer-deps

WORKDIR /app/packages/loinc
RUN npm run build

WORKDIR /app/packages/server
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
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

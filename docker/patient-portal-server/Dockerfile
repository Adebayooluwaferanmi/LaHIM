# Patient portal API — single package (no full monorepo). Build context: LaHIM/.
# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY packages/patient-portal-server .

RUN npm install --ignore-scripts --legacy-peer-deps
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

COPY docker/patient-portal-server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 4001
ENTRYPOINT ["/entrypoint.sh"]

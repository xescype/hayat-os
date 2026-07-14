# Build context = repo root. PWA'yi build eder, Caddy imajina koyar (Caddy hem statik servis hem /api proxy).
FROM node:22-slim AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @hayatos/pwa build

FROM caddy:2-alpine
COPY infra/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/pwa/dist /srv

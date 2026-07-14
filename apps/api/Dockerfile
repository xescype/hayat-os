# Build context = repo root (bkz infra/docker-compose.yml). Tek asama: tsx ile source'tan kosar.
FROM node:22-slim

# pg_dump 16 (PG16 sunucuyu dump'lamak icin >=16 sart) + age (yedek sifreleme).
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates gnupg age \
 && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/pgdg.gpg \
 && echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
 && apt-get update && apt-get install -y --no-install-recommends postgresql-client-16 \
 && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable

WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile

ENV NODE_ENV=production
WORKDIR /app/apps/api
# 1GB RAM prod: Node heap sinirla.
ENV NODE_OPTIONS=--max-old-space-size=512
EXPOSE 3000
CMD ["pnpm", "start"]

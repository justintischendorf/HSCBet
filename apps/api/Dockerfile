# ============================================================
# API – Elysia-Server
#
# Build-Context: Repo-Root (wird für den Workspace-Install und
# das Prisma-Generate benötigt, siehe docker-compose-prod.yml).
# Dasselbe Image führt im Service "migrate" die Migrationen aus.
# ============================================================
FROM oven/bun:1

WORKDIR /app

COPY . .

ENV DATABASE_URL=file:./data/hscbet.db

RUN bun install --frozen-lockfile
RUN cd packages/database && bunx prisma generate

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]

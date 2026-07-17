# ============================================================
# API – Elysia-Server
#
# Build-Context: Repo-Root (wird für den Workspace-Install und
# das Prisma-Generate benötigt, siehe docker-compose-dev.yml).
# ============================================================
FROM oven/bun:1

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile
RUN cd packages/database && bunx prisma generate

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]

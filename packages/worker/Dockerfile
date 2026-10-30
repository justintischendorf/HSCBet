# ============================================================
# Worker – Queue-Consumer, der BullMQ-Jobs verarbeitet und
# Ergebnisse per Pub/Sub an die API weiterleitet.
#
# Build-Context: Repo-Root (wird für den Workspace-Install
# benötigt, siehe docker-compose-dev.yml). Die SQLite-Datei wird
# per Volume aus packages/database/data eingebunden.
# ============================================================
FROM oven/bun:1

WORKDIR /app

COPY . .

ENV DATABASE_URL=file:./data/hscbet.db

RUN bun install --frozen-lockfile
RUN cd packages/database && bunx prisma generate

WORKDIR /app/packages/worker

CMD ["bun", "run", "src/worker.ts"]

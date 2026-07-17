# ============================================================
# Worker – Queue-Consumer, der BullMQ-Jobs verarbeitet und
# Ergebnisse per Pub/Sub an die API weiterleitet.
#
# Build-Context: Repo-Root (wird für den Workspace-Install
# benötigt, siehe docker-compose-dev.yml).
# ============================================================
FROM oven/bun:1

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

WORKDIR /app/packages/worker

CMD ["bun", "run", "src/worker.ts"]

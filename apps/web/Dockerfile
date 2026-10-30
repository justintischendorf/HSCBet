# ============================================================
# Web – Next.js-App (Produktions-Build)
#
# Build-Context: Repo-Root (wird für den Workspace-Install und
# das Prisma-Generate benötigt, siehe docker-compose-prod.yml).
#
# NEXT_PUBLIC_*-Variablen werden zur Build-Zeit in das Client-
# Bundle eingebettet und müssen daher als Build-Args übergeben
# werden (siehe docker-compose-prod.yml, build.args).
# ============================================================
FROM oven/bun:1

WORKDIR /app

COPY . .

ARG NEXT_PUBLIC_API_SERVER_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_AUTH_BASE_URL
ENV NEXT_PUBLIC_API_SERVER_URL=$NEXT_PUBLIC_API_SERVER_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_AUTH_BASE_URL=$NEXT_PUBLIC_AUTH_BASE_URL
ENV DATABASE_URL=file:./data/hscbet.db

RUN bun install --frozen-lockfile
RUN cd packages/database && bunx prisma generate

WORKDIR /app/apps/web

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]

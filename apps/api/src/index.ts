import { Elysia } from "elysia";
import { createLogger } from "@repo/logger";

const logger = createLogger("api");

const app = new Elysia({ prefix: "/api" })
  .get("/", () => "Hello Elysia")
  .listen(process.env.API_SERVER_PORT || 3001);

logger.info(`🦊 Elysia läuft auf http://localhost:${app.server?.port}`);

export type App = typeof app;

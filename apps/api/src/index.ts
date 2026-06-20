import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createLogger } from "@repo/logger";
import { socket } from "./modules/socket";
import { authPlugin } from "./modules/auth";

const logger = createLogger("api");

const app = new Elysia({ prefix: "/api" })
  .get("/", () => "Hello Elysia")
  .use(
    cors({
      origin: process.env.WEB_SERVER_URL,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PATCH", "DELETE"],
    }),
  )
  .use(authPlugin)
  .use(socket)
  .onError(({ error, set }) => {
    if (error instanceof Error && error.message === "Unauthorized") {
      set.status = 401;
      logger.warn("Nicht autorisiert");
      return {
        success: false,
        message: "Nicht autorisiert",
        error: "UNAUTHORIZED",
      };
    }

    if (error instanceof Error && error.message.includes("validation")) {
      set.status = 422;
      logger.warn("Validierungsfehler");
      return {
        success: false,
        message: "Validierungsfehler",
        error: "VALIDATION_ERROR",
      };
    }

    set.status = 500;
    logger.error("Interner Serverfehler");
    return {
      success: false,
      message: "Ein Fehler ist aufgetreten",
      error: "INTERNAL_SERVER_ERROR",
    };
  })
  .listen(process.env.API_SERVER_PORT || 3001);

logger.info(`🦊 Elysia läuft auf http://localhost:${app.server?.port}`);

export type App = typeof app;

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createLogger } from "@repo/logger";
import { socket } from "./modules/socket";
import { authPlugin } from "./modules/auth";
import { media } from "./modules/media";
import { S3Manager } from "@repo/bucket";
import { S3Service } from "./global/services/s3-service";
import { WebAppStore } from "./context";
import cron, { Patterns } from "@elysia/cron";
import { rateLimit } from "elysia-rate-limit";

const logger = createLogger("api");
const s3Manager = new S3Manager();

const app = new Elysia({ prefix: "/api" })
  .state("s3Manager", s3Manager)
  .use(
    rateLimit({
      duration: 60000,
      max: 50,
      generator: (request, server) => {
        const forwardedFor = request.headers.get("x-forwarded-for");
        if (forwardedFor) {
          return forwardedFor.split(",")[0].trim();
        }
        const ip = server?.requestIP(request)?.address;
        return ip || "unknown";
      },
      errorResponse: new Error("rate-limit"),
    }),
  )
  .use(
    cors({
      origin: process.env.WEB_SERVER_URL,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PATCH", "DELETE"],
    }),
  )
  .use(
    cron({
      name: "s3-cleanup",
      pattern: Patterns.EVERY_10_MINUTES,
      async run() {
        const store = app.store as WebAppStore;
        const s3Manager = store.s3Manager;
        await S3Service.cleanup({ s3Manager });
      },
    }),
  )
  .use(authPlugin)
  .use(socket)
  .use(media)
  .onError(({ error, set }) => {
    if (error instanceof Error && error.message === "rate-limit") {
      set.status = 429;
      logger.warn("Rate-Limit erreicht");
      return {
        success: false,
        message: "Zu viele Anfragen, bitte warte einen Moment.",
        error: "RATE_LIMITED",
      };
    }

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

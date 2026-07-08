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
import { season } from "./modules/season";
import { admin } from "./modules/admin";
import { tip } from "./modules/tip";

const logger = createLogger("api");
const s3Manager = new S3Manager();

const app = new Elysia({ prefix: "/api" })
  .state("s3Manager", s3Manager)
  .use(
    cors({
      origin: process.env.WEB_SERVER_URL,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
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
  .derive({ as: "global" }, () => ({
    requestStart: Date.now(),
  }))
  .onAfterHandle(({ request, set, requestStart }) => {
    const durationMs = Date.now() - requestStart;
    const url = new URL(request.url);
    const path = `${url.pathname}${url.search}`;
    logger.info(
      `${request.method} ${path} status=${set.status ?? 200} duration=${durationMs}ms`,
    );
  })
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
  .use(admin)
  .use(authPlugin)
  .use(socket)
  .use(media)
  .use(tip)
  .use(season)
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

    if (error instanceof Error && error.message === "DUPLICATE_TIP") {
      set.status = 409;
      logger.warn("Tipp für dieses Spiel bereits abgegeben");
      return {
        success: false,
        message: "Du hast für dieses Spiel bereits einen Tipp abgegeben",
        error: "DUPLICATE_TIP",
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

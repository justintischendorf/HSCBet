import Elysia from "elysia";
import { sessionPlugin } from "../auth";
import { createLogger } from "@repo/logger";

const logger = createLogger("api:socket");

export const socket = new Elysia({ prefix: "/socket" })
  .use(sessionPlugin)
  .ws("/", {
    open(ws) {
      logger.info(`Client connected. userId=${ws.data.session.userId}`);
    },
  });

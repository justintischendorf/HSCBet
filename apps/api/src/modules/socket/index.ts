import Elysia from "elysia";
import { sessionPlugin } from "../auth";
import { createLogger } from "@repo/logger";
import { PubSubManager } from "@repo/pubsub";

const logger = createLogger("api:socket");

export const socket = new Elysia({ prefix: "/socket" })
  .use(sessionPlugin)
  .ws("/", {
    open(ws) {
      logger.info(`Client connected. userId=${ws.data.session.userId}`);

      // bitte pm in Kontext injecten
      const pm = new PubSubManager({
        port: Number(process.env.REDIS_PORT),
        hostname: String(process.env.REDIS_HOST),
      });
      pm.subscribe({
        chanelName: `user:${ws.data.session.userId}`,
        callback({ payload }) {
          ws.send({ payload });
        },
      });
    },
  });

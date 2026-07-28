import Elysia from "elysia";

import { createLogger } from "@repo/logger";

import { contextPlugin } from "../../context";
import { sessionPlugin } from "../auth";

const logger = createLogger("api:socket");

export const socket = new Elysia({ prefix: "/socket" })
  .use(sessionPlugin)
  .use(contextPlugin)
  .ws("/", {
    open(ws) {
      logger.info(`Client connected. userId=${ws.data.session.userId}`);

      ws.data.store.pubSubManager.subscribe({
        chanelName: `user:${ws.data.session.userId}`,
        callback({ payload }) {
          ws.send({ payload });
        },
      });

      ws.data.store.pubSubManager.subscribe({
        chanelName: "broadcast",
        callback({ payload }) {
          ws.send({ payload });
        },
      });
    },
  });

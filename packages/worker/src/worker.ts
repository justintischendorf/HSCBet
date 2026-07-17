import { QueueManager } from "../../queue/src/client";
import { PubSubManager } from "../../pub-sub/src/client";
import { createLogger } from "@repo/logger";

const logger = createLogger("Worker");

const qm = new QueueManager({
  port: Number(process.env.REDIS_PORT),
  hostname: String(process.env.REDIS_HOST),
});

const pm = new PubSubManager({
  port: Number(process.env.REDIS_PORT),
  hostname: String(process.env.REDIS_HOST),
});

function startGamesLoop() {
  qm.consume({
    topic: "games",
    callback: async ({ payload }) => {
      logger.info("processing game update:", payload);
      pm.publish({
        chanelName: "broadcast",
        payload,
      });
    },
  });
}

function startGroupsLoop() {
  qm.consume({
    topic: "groups",
    callback: async ({ payload }) => {
      logger.info("processing group update:", payload);
      pm.publish({
        chanelName: `user:${payload.targetId}`,
        payload,
      });
    },
  });
}

function startSeasonsLoop() {
  qm.consume({
    topic: "seasons",
    callback: async ({ payload }) => {
      logger.info("processing season update:", payload);
      pm.publish({
        chanelName: "broadcast",
        payload,
      });
    },
  });
}

async function main() {
  logger.info("starting worker...");
  await Promise.all([startGamesLoop(), startGroupsLoop(), startSeasonsLoop()]);
}

main();

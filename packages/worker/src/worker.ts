import { NotificationType, prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { PubSubManager } from "../../pub-sub/src/client";
import { QueueManager } from "../../queue/src/client";

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
      logger.info("processing group invite:", payload);

      const group = await prisma.group.findUnique({
        where: { id: payload.groupId },
        select: { name: true, leader: { select: { name: true } } },
      });

      if (group) {
        await prisma.notification.create({
          data: {
            userId: payload.targetId,
            groupId: payload.groupId,
            type: NotificationType.GROUP_INVITE,
            message: `${group.leader.name} hat dich eingeladen, der Gruppe "${group.name}" beizutreten.`,
          },
        });
      }

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

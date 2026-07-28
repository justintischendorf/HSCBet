import { Elysia } from "elysia";

import { S3Manager } from "@repo/bucket";
import { PubSubManager } from "@repo/pubsub";
import { QueueManager } from "@repo/queue";

const s3Manager = new S3Manager();

const queueManager = new QueueManager({
  port: Number(process.env.REDIS_PORT),
  hostname: String(process.env.REDIS_HOST),
});

const pubSubManager = new PubSubManager({
  port: Number(process.env.REDIS_PORT),
  hostname: String(process.env.REDIS_HOST),
});

export const contextPlugin = new Elysia({ name: "context" })
  .state("s3Manager", s3Manager)
  .state("queueManager", queueManager)
  .state("pubSubManager", pubSubManager);

export type WebAppStore = {
  s3Manager: S3Manager;
  queueManager: QueueManager;
  pubSubManager: PubSubManager;
};

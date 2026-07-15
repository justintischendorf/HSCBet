import { Elysia } from "elysia";
import { S3Manager } from "@repo/bucket";
import { QueueManager } from "@repo/queue";
import { PubSubManager } from "@repo/pubsub";

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

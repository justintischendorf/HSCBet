import { Elysia } from "elysia";
import { S3Manager } from "@repo/bucket";
import { QueueManager } from "@repo/queue";

const s3Manager = new S3Manager();
const queueManager = new QueueManager({
  port: Number(process.env.REDIS_PORT),
  hostname: String(process.env.REDIS_HOST),
});

export const contextPlugin = new Elysia({ name: "context" })
  .state("s3Manager", s3Manager)
  .state("queueManager", queueManager);

export type WebAppStore = {
  s3Manager: S3Manager;
  queueManager: QueueManager;
};

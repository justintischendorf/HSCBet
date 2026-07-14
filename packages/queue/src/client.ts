import IORedis from "ioredis";
import type { Options, TopicPayloadMap, Topic } from "./types";
import { Job, Queue, Worker } from "bullmq";

export class QueueManager {
  private queues: Record<Topic, Queue>;
  private redis: IORedis;
  constructor({ port, hostname }: Options) {
    this.redis = new IORedis(port, hostname);
    this.queues = {
      games: new Queue("games", { connection: this.redis }),
      groups: new Queue("groups", { connection: this.redis }),
      tips: new Queue("tips", { connection: this.redis }),
    };
  }

  // --------------------------------------------------------------------------> produce
  async produce({
    topic,
    payload,
  }: {
    [K in keyof TopicPayloadMap]: {
      topic: K;
      payload: TopicPayloadMap[K];
    };
  }[keyof TopicPayloadMap]): Promise<void> {
    await this.queues[topic].add(payload.eventType, JSON.stringify(payload));
  }

  // --------------------------------------------------------------------------> consume
  consume<K extends keyof TopicPayloadMap>({
    topic,
    callback,
  }: {
    topic: K;
    callback: ({
      payload,
      job,
    }: {
      payload: TopicPayloadMap[K];
      job: Job;
    }) => void | Promise<void>;
  }): Worker {
    return new Worker(topic, async (job: Job) => {
      return callback({ job: job, payload: job.data });
    });
  }
}

import { Job, Queue, Worker } from "bullmq";

import type { Options, TopicPayloadMap, Topic } from "./types";

export class QueueManager {
  private queues: Record<Topic, Queue>;
  private connection: { host: string; port: number };
  constructor({ port, hostname }: Options) {
    this.connection = { host: hostname, port };
    this.queues = {
      games: new Queue("games", { connection: this.connection }),
      groups: new Queue("groups", { connection: this.connection }),
      tips: new Queue("tips", { connection: this.connection }),
      seasons: new Queue("seasons", { connection: this.connection }),
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
    await this.queues[topic].add(payload.eventType, payload);
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
    return new Worker(
      topic,
      async (job: Job) => {
        return callback({ job: job, payload: job.data });
      },
      { connection: this.connection },
    );
  }
}

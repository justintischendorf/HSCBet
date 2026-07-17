import IORedis from "ioredis";
import type { ChanelName, Options, Payload } from "./types";
import { createLogger } from "@repo/logger";

const logger = createLogger("PubSubManager");

export class PubSubManager {
  private redis: IORedis;
  constructor({ port, hostname }: Options) {
    this.redis = new IORedis(port, hostname);
  }

  publish({
    chanelName,
    payload,
  }: {
    chanelName: ChanelName;
    payload: Payload;
  }) {
    this.redis.publish(chanelName, JSON.stringify(payload));
  }

  subscribe({
    chanelName,
    callback,
  }: {
    chanelName: ChanelName;
    callback: ({ payload }: { payload: Payload }) => void | Promise<void>;
  }) {
    this.redis.subscribe(chanelName, (err, count) => {
      if (err) {
        logger.error(
          `error subscribing to channel ${chanelName}: ${err.message}`,
        );
      } else {
        logger.info(
          `subscribed to channel ${chanelName}, total subscriptions: ${count}`,
        );
      }
    });
    this.redis.on("message", (channel, payload) => {
      if (channel === chanelName) {
        callback({ payload: JSON.parse(payload) });
      }
    });
  }
}

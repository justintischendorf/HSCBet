import IORedis from "ioredis";
import type { ChanelName, Options, Payload } from "./types";
import { string, unknown } from "zod";

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
        console.error(
          `Fehler bei dem Subscriben auf den Chanel: ${chanelName}, Fehler: ${err.message}`,
        );
      } else {
        console.log(`Subscribe erfolgreich auf ${count} Chanels`);
      }
    });
    this.redis.on("message", (_, payload) =>
      callback({ payload: JSON.parse(payload) }),
    );
  }
}

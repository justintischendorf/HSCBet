import IORedis from "ioredis";
import type { ChanelName, Options, Payload } from "./types";

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
}

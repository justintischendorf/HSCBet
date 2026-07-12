import Redis from "ioredis";
import type {
  ChannelPayloadMap,
  Options,
  ProducerParams,
  TopicPayloadMap,
} from "./queuemanager_types";

export class QueueManager {
  private redis: Redis;
  constructor({ port, hostname }: Options) {
    this.redis = new Redis(port, hostname);
  }

  // --------------------------------------------------------------------------> produce
  async produce({ topic, payload }: ProducerParams): Promise<void> {
    await this.redis.lpush(topic, JSON.stringify(payload));
  }

  // --------------------------------------------------------------------------> consume
  async consume<K extends keyof TopicPayloadMap>(
    topic: K,
    callback: (payload: TopicPayloadMap[K]) => void | Promise<void>,
  ): Promise<void> {
    console.log(`[QueueManager] Worker gestartet für Topic: ${String(topic)}`);
    try {
      // Wir nutzen BRPOP (Blocking Pop) mit einem Timeout von 30 Sekunden -> timeout zu hoch?
      const result = await this.redis.brpop(String(topic), 30);

      if (result) {
        const [_queueName, rawPayload] = result;
        const payload = JSON.parse(rawPayload) as TopicPayloadMap[K];

        // Hier rufen wir deine Callback-Funktion auf und übergeben die Daten.
        // Das 'await' sorgt dafür, dass das nächste Event erst geholt wird,
        // wenn die Verarbeitung des aktuellen Events fertig ist (wichtig für Reihenfolge).
        await callback(payload);
      }
    } catch (error) {
      console.error(
        `[QueueManager] Fehler im Worker bei Topic ${String(topic)}:`,
        error,
      );
      // Falls Redis mal kurz weg ist, warten wir 1 Sekunde,
      // um die CPU nicht mit einer rasanten Fehlerschleife zu grillen.
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  // --------------------------------------------------------------------------> publish
  async publish<C extends keyof ChannelPayloadMap>(
    channel: C,
    payload: ChannelPayloadMap[C],
  ): Promise<void> {
    await this.redis.publish(channel, JSON.stringify(payload));
  }
}

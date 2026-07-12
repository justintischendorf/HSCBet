import Redis from "ioredis";

type Options = {
  port: number;
  hostname: string;
};

type ProducerParams = {
  [K in keyof TopicPayloadMap]: {
    topic: K;
    payload: TopicPayloadMap[K];
  };
}[keyof TopicPayloadMap];

//type Topic = keyof TopicPayloadMap;

type ChannelPayloadMap = {
  "live_updates:games": {
    event: "GAME_UPDATED" | "GAME_DELETED";
    gameId: string;
  };
  "live_updates:groups": { event: "GROUP_INVITED"; groupId: string };
};

type TopicPayloadMap = {
  games: GameUpdatedPayload | GameDeletedPayload;
  groups: GroupeInvitedPayload;
  tips: never;
};

type GameUpdatedPayload = {
  gameId: string;
  eventType: "game_updated";
};

type GameDeletedPayload = {
  gameId: string;
  reasons: string;
  eventType: "game_deleted";
};

type GroupeInvitedPayload = {
  groupId: string;
  targetId: string;
  executorId: string;
  eventType: "group_invited";
};

export class QueueManager {
  private redis: Redis;
  constructor({ port, hostname }: Options) {
    this.redis = new Redis(port, hostname);
  }

  // --------------------------------------------------------------------------> produce
  async produce({ topic, payload }: ProducerParams) {
    await this.redis.lpush(topic, JSON.stringify(payload));
  }

  // --------------------------------------------------------------------------> consume
  async consume<K extends keyof TopicPayloadMap>(
    topic: K,
    callback: (payload: TopicPayloadMap[K]) => void | Promise<void>,
  ) {
    console.log(`[QueueManager] Worker gestartet für Topic: ${String(topic)}`);
    try {
      // Wir nutzen BRPOP (Blocking Pop) mit einem Timeout von 30 Sekunden
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
    // Redis erwartet beim PUBLISH-Befehl immer einen String,
    // daher wandeln wir das Objekt mit JSON.stringify um.
    await this.redis.publish(channel, JSON.stringify(payload));
  }
}
//consume methode für worker mit callback function damit man nicht durch return den workflow beendet.
// callback function ist lamda expression als parameter mitgeben und dann wieder aufrufen, ist wie bei def() in PL/1 um wieder an den wert zu kommen
// im worker: qm.conume(cbf=>code) im QM consume(cbf=>)

/* Erklärung für Callback Function: https://dev.to/sureshkrishnannair/understanding-callback-functions-in-typescript-a-beginners-guide-1579

  //wie man einen worker schreibt -> dauerschleife die durchgehend consumend
  //wie man PUB/SUB mit worker verbindet
  */

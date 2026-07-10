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

  async produce({ topic, payload }: ProducerParams) {
    await this.redis.lpush(topic, JSON.stringify(payload));
  }

  //consume methode für worker mit callback function damit man nicht durch return den workflow beendet.
  // callback function ist lamda expression als parameter mitgeben und dann wieder aufrufen, ist wie bei def() in PL/1 um wieder an den wert zu kommen
  // im worker: qm.conume(cbf=>code) im QM consume(cbf=>)

  /* Erklärung für Callback Function: https://dev.to/sureshkrishnannair/understanding-callback-functions-in-typescript-a-beginners-guide-1579
  
  function fetchData(callback: (data: any) => void) {
  // Simulate fetching data asynchronously
  setTimeout(() => {
    const data = 'Sample data 1';
    callback(data);
  }, 5000);

  console.log("Initiated "); // Added log message to see when fetchData is initiated

  // Simulate fetching more data asynchronously after a delay
  setTimeout(() => {
    const data = 'Sample data 2';
    callback(data);
  }, 6000);
}

// Usage of the callback function
fetchData((data) => {
  console.log('Data received:', data);
});
  
  */
}

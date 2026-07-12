export type Options = {
  port: number;
  hostname: string;
};

export type ProducerParams = {
  [K in keyof TopicPayloadMap]: {
    topic: K;
    payload: TopicPayloadMap[K];
  };
}[keyof TopicPayloadMap];

export type ChannelPayloadMap = {
  "live_updates:games": {
    event: "GAME_UPDATED" | "GAME_DELETED";
    gameId: string;
  };
  "live_updates:groups": { event: "GROUP_INVITED"; groupId: string };
};

export type TopicPayloadMap = {
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
  eventType: "game_deleted";
};

type GroupeInvitedPayload = {
  groupId: string;
  targetId: string;
  executorId: string;
  eventType: "group_invited";
};

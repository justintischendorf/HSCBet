export type Options = {
  port: number;
  hostname: string;
};

export type TopicPayloadMap = {
  games: GameUpdatedPayload | GameDeletedPayload;
  groups: GroupeInvitedPayload;
  tips: never;
};

export type Topic = keyof TopicPayloadMap;

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

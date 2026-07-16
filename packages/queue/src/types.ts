export type Options = {
  port: number;
  hostname: string;
};

export type TopicPayloadMap = {
  games: GameUpdatedPayload;
  groups: GroupeInvitedPayload;
  tips: never;
  seasons: SeasonsUpdatedPayload;
};

export type Topic = keyof TopicPayloadMap;

type GameUpdatedPayload = {
  gameId: string;
  eventType: "game_updated";
};

type GroupeInvitedPayload = {
  groupId: string;
  targetId: string;
  executorId: string;
  eventType: "group_invited";
};

type SeasonsUpdatedPayload = {
  eventType: "seasons_updated";
};

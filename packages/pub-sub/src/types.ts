export type Options = {
  port: number;
  hostname: string;
};

export type ChanelName<userId extends string = string> = `user:${userId}`;

export type Payload =
  | GameDeletedPayload
  | GameUpdatedPayload
  | GroupeInvitedPayload;

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

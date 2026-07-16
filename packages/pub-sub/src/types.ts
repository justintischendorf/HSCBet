import { unknown } from "zod";

export type Options = {
  port: number;
  hostname: string;
};

export type ChanelName<userId extends string = string> =
  | `user:${userId}`
  | "broadcast";

export type Payload =
  | GameDeletedPayload
  | GameUpdatedPayload
  | GroupeInvitedPayload
  | SeasonsUpdatedPayload;

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

type SeasonsUpdatedPayload = {
  eventType: "seasons_updated";
};

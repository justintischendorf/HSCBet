import { t, type UnwrapSchema } from "elysia";

export namespace TipModel {
  export const UpsertTip = t.Object({
    seasonId: t.String(),
    gameId: t.String(),
    userId: t.String(),
    tipHost: t.Number(),
    tipGuest: t.Number(),
  });
}

export type TipModel = {
  [k in keyof typeof TipModel]: UnwrapSchema<(typeof TipModel)[k]>;
};

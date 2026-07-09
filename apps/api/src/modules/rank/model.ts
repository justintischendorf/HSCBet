import { t, UnwrapSchema } from "elysia";

export namespace RankModel {
  export const UpdateUserRank = t.Object({
    rankPoints: t.Number(),
  });
}

export type RankModel = {
  [k in keyof typeof RankModel]: UnwrapSchema<(typeof RankModel)[k]>;
};

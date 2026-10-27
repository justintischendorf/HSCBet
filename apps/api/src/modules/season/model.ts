import { t, type UnwrapSchema } from "elysia";

export namespace SeasonModel {
  export const CreateSeason = t.Object({
    title: t.String({ minLength: 1 }),
    league: t.Union([t.Literal("1. Bundesliga"), t.Literal("2. Bundesliga")]),
    from: t.Date(),
    to: t.Date(),
  });

  export const GameParams = t.Object({
    id: t.String(),
    gameId: t.String(),
  });

  export const AddGame = t.Object({
    date: t.Date(),
    host: t.String({ minLength: 1 }),
    guest: t.String({ minLength: 1 }),
  });
}

export type SeasonModel = {
  [k in keyof typeof SeasonModel]: UnwrapSchema<(typeof SeasonModel)[k]>;
};

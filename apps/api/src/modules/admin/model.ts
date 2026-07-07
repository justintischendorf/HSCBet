import { t, UnwrapSchema } from "elysia";

export namespace AdminModel {
  export const AddNewSeason = t.Object({
    title: t.String(),
    from: t.Date(),
    to: t.Date(),
    league: t.String(),
    game: t.Array(
      t.Object({
        date: t.String(),
        host: t.String(),
        guest: t.String(),
      }),
    ),
  });
}

export type AdminModel = {
  [k in keyof typeof AdminModel]: UnwrapSchema<(typeof AdminModel)[k]>;
};

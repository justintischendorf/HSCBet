import { MimeType } from "@repo/database";
import { t, UnwrapSchema } from "elysia";

export namespace SeasonModel {
  export const GetSeasonByID = t.Object({
    id: t.String(),
  });
}

export type SeasonModel = {
  [k in keyof typeof SeasonModel]: UnwrapSchema<(typeof SeasonModel)[k]>;
};

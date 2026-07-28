import Elysia from "elysia";

import { IdParams } from "../../global/models";
import { sessionPlugin } from "../auth";
import { TipModel } from "./model";
import { TipService } from "./service";

export const tip = new Elysia({ prefix: "/tip" })
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> GET api/tip/:id
  //                                                                             - get all tips for a season by their id
  .get(
    "/:id",
    async ({ set, params }) => {
      set.status = 200;
      return {
        success: true,
        season: await TipService.getTipsBySeasonId({ params }),
      };
    },
    {
      params: IdParams,
    },
  )

  // --------------------------------------------------------------------------> PUT api/tip
  //                                                                             - create or update a tip for a game, as long as it hasn't started yet
  .put(
    "/",
    async ({ set, body, user }) => {
      set.status = 200;
      return {
        success: true,
        tip: await TipService.upsertTip({ body, user }),
      };
    },
    {
      body: TipModel.UpsertTip,
    },
  );

import Elysia, { t } from "elysia";
import { sessionPlugin } from "../auth";
import { TipService } from "./service";
import { IdParams } from "src/global/models";
import { TipModel } from "./model";

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

  // --------------------------------------------------------------------------> POST api/tip
  //                                                                             - add a new tip to the database
  .post(
    "/",
    async ({ set, body, user }) => {
      set.status = 200;
      return {
        success: true,
        season: await TipService.createNewTip({ body, user }),
      };
    },
    {
      body: TipModel.CreateNewTip,
    },
  );

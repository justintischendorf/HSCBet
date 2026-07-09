import Elysia from "elysia";
import { sessionPlugin } from "../auth";
import { RankService } from "./service";
import { RankModel } from "./model";

export const season = new Elysia({ prefix: "/rank" })
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> GET api/rank
  //                                                                             - get user rank from the database
  .get("/", async ({ set, user }) => {
    set.status = 200;
    return {
      success: true,
      season: await RankService.getRankById({ user }),
    };
  })

  // --------------------------------------------------------------------------> PATCH api/rank
  //                                                                             - update user rank score
  .patch(
    "/",
    async ({ set, user, body }) => {
      set.status = 200;
      return {
        success: true,
        rank: await RankService.evaluatePoints({ user, body }),
      };
    },
    {
      body: RankModel.UpdateUserRank,
    },
  );

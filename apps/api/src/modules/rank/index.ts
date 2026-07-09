import Elysia from "elysia";
import { sessionPlugin } from "../auth";
import { RankService } from "./service";
import { RankModel } from "./model";

export const season = new Elysia({ prefix: "/rank" })
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> GET api/rank
  //                                                                             - get user rank from the database
  .get("/", async ({ set, user }) => {
    const userId = user.id;
    set.status = 200;
    return {
      success: true,
      season: await RankService.getRankById({ userId }),
    };
  })

  // --------------------------------------------------------------------------> PATCH api/rank
  //                                                                             - update user rank score
  .patch(
    "/",
    async ({ set, user, body }) => {
      const userId = user.id;
      set.status = 200;
      return {
        success: true,
        rank: await RankService.evaluatePoints({ userId, body }),
      };
    },
    {
      body: RankModel.UpdateUserRank,
    },
  );

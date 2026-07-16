import Elysia from "elysia";
import { sessionPlugin } from "../auth";
import { RankService } from "./service";

export const rank = new Elysia({ prefix: "/rank" })
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> GET api/rank
  //                                                                             - get user rank from the database
  .get("/", async ({ set, user }) => {
    set.status = 200;
    return {
      success: true,
      rank: await RankService.getRankById({ user }),
    };
  })

  // --------------------------------------------------------------------------> PATCH api/rank/evaluate-points
  //                                                                             - update user rank score
  .patch("/evaluate-points", async ({ set, user }) => {
    set.status = 200;
    return {
      success: true,
      rank: await RankService.evaluatePoints({ user }),
    };
  });

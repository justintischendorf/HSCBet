import Elysia, { t } from "elysia";
import { sessionPlugin } from "../auth";
import { SeasonService } from "./service";
import { IdParams } from "../../global/models";

export const season = new Elysia({ prefix: "/season" })
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> GET api/season
  //                                                                             - get all seasons from the database
  .get("/", async ({ set }) => {
    set.status = 200;
    return { success: true, season: await SeasonService.getAllSeasons() };
  })

  // --------------------------------------------------------------------------> GET api/season/:id
  //                                                                             - get a season by its ID from the database
  .get(
    "/:id",
    async ({ set, params }) => {
      set.status = 200;
      return {
        success: true,
        season: await SeasonService.getSeasonByID({ params }),
      };
    },
    {
      params: IdParams,
    },
  )

  // --------------------------------------------------------------------------> GET api/season
  //                                                                             - get all seasons, games, and tips from the database
  .get("/stats", async ({ set, user }) => {
    set.status = 200;
    return {
      success: true,
      stats: await SeasonService.getStats({ user }),
    };
  });

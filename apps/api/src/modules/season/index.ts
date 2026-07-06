import Elysia, { t } from "elysia";
import { sessionPlugin } from "../auth";
import { SeasonService } from "./service";
import { SeasonModel } from "./model";

export const season = new Elysia({ prefix: "/season" })
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> GET all seasons
  .get("/", async ({ set }) => {
    const seasons = await SeasonService.getAllSeasons();
    set.status = 200;
    return seasons;
  })

  // --------------------------------------------------------------------------> GET season by id
  .get(
    "/:id",
    async ({ set, params }) => {
      const season = await SeasonService.getSeasonByID({ params });
      set.status = 200;
      return season;
    },
    {
      params: SeasonModel.GetSeasonByID,
    },
  );

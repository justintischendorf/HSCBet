import Elysia from "elysia";

import { contextPlugin } from "../../context";
import { IdParams } from "../../global/models";
import { AdminModel } from "./model";
import { AdminService } from "./service";

export const admin = new Elysia({ prefix: "/admin" })
  .use(contextPlugin)

  // --------------------------------------------------------------------------> GET api/admin/all-seasons
  //                                                                             - get all seasons from the database
  .get("/all-seasons", async ({ set, request }) => {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      set.status = 401;
      return { success: false, error: "UNAUTHORIZED" };
    }

    set.status = 200;
    return {
      success: true,
      season: await AdminService.getAllSeasons(),
    };
  })

  // --------------------------------------------------------------------------> POST api/admin/new-season
  //                                                                             - add a new season to the database
  .post(
    "/new-season",
    async ({ body, set, request, store }) => {
      const apiKey = request.headers.get("x-api-key");
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        set.status = 401;
        return { success: false, error: "UNAUTHORIZED" };
      }

      set.status = 200;
      const season = await AdminService.addNewSeason({ body });
      store.queueManager.produce({
        topic: "seasons",
        payload: { eventType: "seasons_updated" },
      });
      return {
        success: true,
        season: season,
      };
    },
    {
      body: AdminModel.AddNewSeason,
    },
  )

  // --------------------------------------------------------------------------> DELETE api/admin/delete-season/:id
  //                                                                             - delete a season from the database
  .delete(
    "/delete-season/:id",
    async ({ params, set, request, store }) => {
      const apiKey = request.headers.get("x-api-key");
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        set.status = 401;
        return { success: false, error: "UNAUTHORIZED" };
      }

      set.status = 200;
      return {
        success: true,
        season: await AdminService.deleteSeason({ params }),
      };
    },
    {
      params: IdParams,
    },
  )

  // --------------------------------------------------------------------------> PATCH api/admin/update-game/:id
  //                                                                             - update a game by id in the database
  .patch(
    "/update-game/:id",
    async ({ params, set, request, body, store }) => {
      const apiKey = request.headers.get("x-api-key");
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        set.status = 401;
        return { success: false, error: "UNAUTHORIZED" };
      }

      const updatedGame = await AdminService.updateGameById({ params, body });
      store.queueManager.produce({
        topic: "games",
        payload: { eventType: "game_updated", gameId: params.id },
      });

      set.status = 200;
      return {
        success: true,
        season: updatedGame,
      };
    },
    {
      params: IdParams,
      body: AdminModel.UpdateGame,
    },
  );

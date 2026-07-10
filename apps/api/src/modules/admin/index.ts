import Elysia, { t } from "elysia";
import { AdminModel } from "./model";
import { AdminService } from "./service";
import { IdParams } from "src/global/models";

export const admin = new Elysia({ prefix: "/admin" })

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
    async ({ body, set, request }) => {
      const apiKey = request.headers.get("x-api-key");
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        set.status = 401;
        return { success: false, error: "UNAUTHORIZED" };
      }

      set.status = 200;

      const season = await AdminService.addNewSeason({ body });

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
    async ({ params, set, request }) => {
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

  // --------------------------------------------------------------------------> GET api/admin/game-by-id/:id
  //                                                                             - get a game by id from the database
  .get(
    "/game-by-id/:id",
    async ({ params, set, request }) => {
      const apiKey = request.headers.get("x-api-key");
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        set.status = 401;
        return { success: false, error: "UNAUTHORIZED" };
      }

      set.status = 200;
      return {
        success: true,
        season: await AdminService.getGameById({ params }),
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
    async ({ params, set, request, body }) => {
      const apiKey = request.headers.get("x-api-key");
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        set.status = 401;
        return { success: false, error: "UNAUTHORIZED" };
      }

      set.status = 200;
      return {
        success: true,
        season: await AdminService.updateGameById({ params, body }),
      };
    },
    {
      params: IdParams,
      body: AdminModel.UpdateGame,
    },
  );

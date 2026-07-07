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
      return {
        success: true,
        season: await AdminService.addNewSeason({ body }),
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
  );

import Elysia from "elysia";

import { contextPlugin } from "../../context";
import { IdParams } from "../../global/models";
import { sessionPlugin } from "../auth";
import { SeasonModel } from "./model";
import { SeasonService } from "./service";

export const season = new Elysia({ prefix: "/season" })
  .use(contextPlugin)
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
  })

  // --------------------------------------------------------------------------> POST api/season
  //                                                                             - create a new season, only allowed for admins
  .post(
    "/",
    async ({ set, user, body, store }) => {
      const season = await SeasonService.createSeason({ body, user });
      store.queueManager.produce({
        topic: "seasons",
        payload: { eventType: "seasons_updated" },
      });

      set.status = 201;
      return { success: true, season };
    },
    {
      body: SeasonModel.CreateSeason,
    },
  )

  // --------------------------------------------------------------------------> POST api/season/:id/game
  //                                                                             - add a game to a season, only allowed for admins
  .post(
    "/:id/game",
    async ({ set, user, params, body, store }) => {
      const game = await SeasonService.addGame({ params, body, user });
      store.queueManager.produce({
        topic: "games",
        payload: { eventType: "game_updated", gameId: game.id },
      });

      set.status = 201;
      return { success: true, game };
    },
    {
      params: IdParams,
      body: SeasonModel.AddGame,
    },
  )

  // --------------------------------------------------------------------------> PATCH api/season/:id
  //                                                                             - update a season, only allowed for admins
  .patch(
    "/:id",
    async ({ set, user, params, body, store }) => {
      const season = await SeasonService.updateSeason({ params, body, user });
      store.queueManager.produce({
        topic: "seasons",
        payload: { eventType: "season_changed" },
      });

      set.status = 200;
      return { success: true, season };
    },
    {
      params: IdParams,
      body: SeasonModel.CreateSeason,
    },
  )

  // --------------------------------------------------------------------------> DELETE api/season/:id
  //                                                                             - delete a season with its games and tips, only allowed for admins
  .delete(
    "/:id",
    async ({ set, user, params, store }) => {
      const season = await SeasonService.deleteSeason({ params, user });
      store.queueManager.produce({
        topic: "seasons",
        payload: { eventType: "season_changed" },
      });

      set.status = 200;
      return { success: true, season };
    },
    {
      params: IdParams,
    },
  )

  // --------------------------------------------------------------------------> PATCH api/season/:id/game/:gameId
  //                                                                             - update a game of a season, only allowed for admins
  .patch(
    "/:id/game/:gameId",
    async ({ set, user, params, body, store }) => {
      const game = await SeasonService.updateGame({ params, body, user });
      store.queueManager.produce({
        topic: "games",
        payload: { eventType: "game_updated", gameId: game.id },
      });

      set.status = 200;
      return { success: true, game };
    },
    {
      params: SeasonModel.GameParams,
      body: SeasonModel.AddGame,
    },
  )

  // --------------------------------------------------------------------------> DELETE api/season/:id/game/:gameId
  //                                                                             - delete a game with its tips, only allowed for admins
  .delete(
    "/:id/game/:gameId",
    async ({ set, user, params, store }) => {
      const game = await SeasonService.deleteGame({ params, user });
      store.queueManager.produce({
        topic: "games",
        payload: { eventType: "game_updated", gameId: game.id },
      });

      set.status = 200;
      return { success: true, game };
    },
    {
      params: SeasonModel.GameParams,
    },
  );

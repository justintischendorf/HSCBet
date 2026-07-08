import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { AdminModel } from "./model";
import { IdParams } from "src/global/models";

const logger = createLogger("api:admin");

export abstract class AdminService {
  // --------------------------------------------------------------------------> GET api/admin/all-seasons
  //                                                                             - get all seasons from the database
  static async getAllSeasons() {
    logger.info("fetching all seasons from the database");

    return await prisma.season.findMany({
      include: {
        game: true,
      },
    });
  }

  // --------------------------------------------------------------------------> POST api/admin/new-season
  //                                                                             - add a new season to the database
  static async addNewSeason({
    body,
  }: {
    body: (typeof AdminModel.AddNewSeason)["static"];
  }) {
    logger.info("adding new season to the database with title: " + body.title);

    return await prisma.season.create({
      data: {
        title: body.title,
        from: new Date(body.from),
        to: new Date(body.to),
        league: body.league,
        game: {
          create: body.game.map((g) => ({
            date: new Date(g.date),
            host: g.host,
            guest: g.guest,
          })),
        },
      },
    });

    quue.push(NEW_SEASON_AVAILABLE);
  }

  // --------------------------------------------------------------------------> DELETE api/admin/delete-season/:id
  //                                                                             - delete a season from the database
  static async deleteSeason({
    params,
  }: {
    params: (typeof IdParams)["static"];
  }) {
    logger.info("deleting season from the database with id: " + params.id);

    return await prisma.season.delete({
      where: {
        id: params.id,
      },
    });
  }

  // --------------------------------------------------------------------------> GET api/admin/game-by-id/:id
  //                                                                             - get a game by id from the database
  static async getGameById({
    params,
  }: {
    params: (typeof IdParams)["static"];
  }) {
    logger.info("fetching game from the database with id: " + params.id);

    return await prisma.game.findUnique({
      where: {
        id: params.id,
      },
    });
  }

  // --------------------------------------------------------------------------> PATCH api/admin/update-game/:id
  //                                                                             - update a game by id in the database
  static async updateGameById({
    params,
    body,
  }: {
    params: (typeof IdParams)["static"];
    body: (typeof AdminModel.UpdateGame)["static"];
  }) {
    logger.info("updating game in the database with id: " + params.id);

    return await prisma.game.update({
      where: {
        id: params.id,
      },
      data: {
        hostPoints: body.hostPoints,
        guestPoints: body.guestPoints,
        result: body.hostPoints - body.guestPoints,
      },
    });
  }
}

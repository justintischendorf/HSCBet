import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { AdminModel } from "./model";
import { IdParams } from "src/global/models";

const logger = createLogger("api:admin");

export abstract class AdminService {
  // --------------------------------------------------------------------------> GET api/admin/all-seasons
  static async getAllSeasons() {
    logger.info("fetching all seasons from the database");

    return await prisma.season.findMany({
      include: {
        game: true,
      },
    });
  }

  // --------------------------------------------------------------------------> POST api/admin/new-season
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
  }

  // --------------------------------------------------------------------------> DELETE api/admin/delete-season/:id
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
}

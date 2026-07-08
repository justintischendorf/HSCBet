import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { IdParams } from "src/global/models";

const logger = createLogger("api:season");

export abstract class SeasonService {
  // --------------------------------------------------------------------------> GET api/season
  //                                                                             - get all seasons from the database
  static async getAllSeasons() {
    logger.info("fetching season data");
    const seasons = await prisma.season.findMany({
      include: {
        game: true,
      },
      orderBy: {
        from: "desc",
      },
    });
    return seasons;
  }

  // --------------------------------------------------------------------------> GET api/season/:id
  //                                                                             - get a season by its ID from the database
  static async getSeasonByID({
    params,
  }: {
    params: (typeof IdParams)["static"];
  }) {
    logger.info("fetching season by id: " + params.id);
    const seasons = await prisma.season.findUnique({
      where: {
        id: params.id,
      },
    });
    return seasons;
  }
}

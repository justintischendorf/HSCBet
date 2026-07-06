import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { SeasonModel } from "./model";

const logger = createLogger("api:season");

export abstract class SeasonService {
  //----------------------------------------------------------------> GET all seasons
  static async getAllSeasons() {
    logger.info("fetching season data");
    const seasons = await prisma.season.findMany();
    return seasons;
  }

  // --------------------------------------------------------------------------> GET season by id
  static async getSeasonByID({
    params,
  }: {
    params: (typeof SeasonModel.GetSeasonByID)["static"];
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

import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { IdParams } from "../../global/models";
import { TipEvaluationService } from "../../global/services/tip-evaluation-service";

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

  // --------------------------------------------------------------------------> GET api/season/stats
  //                                                                             - get the correct/incorrect tip counts per season for the authenticated user
  static async getStats({ user }: { user: { id: string } }) {
    logger.info("fetching tip stats for user: " + user.id);
    const seasons = await prisma.season.findMany({
      include: {
        tips: {
          where: { userId: user.id },
          include: { game: true },
        },
      },
      orderBy: {
        from: "desc",
      },
    });

    return seasons.map((season) => {
      const evaluatedTips = season.tips.filter(
        (tip) => tip.game.date <= new Date(),
      );

      const correct = evaluatedTips.filter((tip) =>
        TipEvaluationService.isWinnerCorrect({
          tipHost: tip.tipHost,
          tipGuest: tip.tipGuest,
          hostPoints: tip.game.hostPoints ?? 0,
          guestPoints: tip.game.guestPoints ?? 0,
        }),
      ).length;

      return {
        seasonId: season.id,
        title: season.title,
        correct,
        incorrect: evaluatedTips.length - correct,
      };
    });
  }
}

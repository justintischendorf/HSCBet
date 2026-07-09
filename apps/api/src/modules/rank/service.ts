import { Position, prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { RankModel } from "./model";

const logger = createLogger("api:rank");
export abstract class RankService {
  // --------------------------------------------------------------------------> GET api/rank
  //                                                                             - get user rank from the database
  static async getRankById({ user }: { user: { id: string } }) {
    logger.info("fetching position by ID" + user.id);
    const rank = await prisma.rank.findUnique({
      where: {
        userId: user.id,
      },
    });
    return rank;
  }

  // --------------------------------------------------------------------------> GET api/rank
  //                                                                             - get user rank from the database
  static async evaluatePoints({
    user,
    body,
  }: {
    user: { id: string };
    body: (typeof RankModel.UpdateUserRank)["static"];
  }) {
    logger.info(
      "updating points and position in the database with id: " + user.id,
    );

    const rank = await prisma.rank.findUnique({
      where: {
        userId: user.id,
      },
    });

    function calculatePosition(
      currentPoints: number,
      addingPoints: number,
    ): Position {
      const newCurrentPoints = currentPoints + addingPoints;
      switch (true) {
        case newCurrentPoints > 250:
          return Position.SILVER;
        case newCurrentPoints > 500:
          return Position.GOLD;
        case newCurrentPoints > 750:
          return Position.PLATINUM;
        case newCurrentPoints > 1000:
          return Position.DIAMOND;
        default:
          return Position.BRONZE;
      }
    }

    return await prisma.rank.update({
      where: {
        userId: user.id,
      },
      data: {
        points: (rank?.points ?? 0) + body.rankPoints,
        position: calculatePosition(rank?.points ?? 0, body.rankPoints),
      },
    });
  }
}

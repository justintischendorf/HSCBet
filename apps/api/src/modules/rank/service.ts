import { Position, prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { TipEvaluationService } from "../../global/services/tip-evaluation-service";

const logger = createLogger("api:rank");

const WINNER_POINTS = 50;
const EXACT_RESULT_BONUS_MULTIPLIER = 2;
const WRONG_TIP_PENALTY = -25;
const MIN_EVALUATED_TIPS_FOR_RANK = 3;

function getPositionForPoints(points: number): Position {
  if (points <= 200) return "BRONZE";
  if (points <= 400) return "SILVER";
  if (points <= 600) return "GOLD";
  if (points <= 800) return "PLATINUM";
  return "DIAMOND";
}

export abstract class RankService {
  // --------------------------------------------------------------------------> GET api/rank
  //                                                                             - get user rank from the database
  static async getRankById({ user }: { user: { id: string } }) {
    logger.info("fetching position by ID" + user.id);
    return prisma.rank.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        points: 0,
        position: "DEFAULT",
      },
      update: {},
    });
  }

  // --------------------------------------------------------------------------> PATCH api/rank/evaluate-points
  //                                                                             - update user rank score
  static async evaluatePoints({ user }: { user: { id: string } }) {
    logger.info(
      "updating points and position in the database for user with id: " +
        user.id,
    );

    const tips = await prisma.tip.findMany({
      where: { userId: user.id },
      include: { game: true },
    });

    const evaluatedTips = tips.filter((tip) => tip.game.date <= new Date());

    let totalPoints = 0;

    for (const tip of evaluatedTips) {
      const hostPoints = tip.game.hostPoints ?? 0;
      const guestPoints = tip.game.guestPoints ?? 0;

      const isWinnerCorrect = TipEvaluationService.isWinnerCorrect({
        tipHost: tip.tipHost,
        tipGuest: tip.tipGuest,
        hostPoints,
        guestPoints,
      });

      let points = WRONG_TIP_PENALTY;
      if (isWinnerCorrect) {
        points = WINNER_POINTS;

        const isExactResult = TipEvaluationService.isExactResult({
          tipHost: tip.tipHost,
          tipGuest: tip.tipGuest,
          hostPoints,
          guestPoints,
        });
        if (isExactResult) {
          points *= EXACT_RESULT_BONUS_MULTIPLIER;
        }
      }

      if (tip.result !== points) {
        await prisma.tip.update({
          where: { id: tip.id },
          data: { result: points },
        });
      }

      totalPoints += points;
    }

    const clampedTotalPoints = Math.max(0, totalPoints);

    const position: Position =
      evaluatedTips.length >= MIN_EVALUATED_TIPS_FOR_RANK
        ? getPositionForPoints(clampedTotalPoints)
        : "DEFAULT";

    return prisma.rank.upsert({
      where: { userId: user.id },
      create: { userId: user.id, points: clampedTotalPoints, position },
      update: { points: clampedTotalPoints, position },
    });
  }
}

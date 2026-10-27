import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { TipEvaluationService } from "../../global/services/tip-evaluation-service";

const logger = createLogger("api:rank");

const WINNER_POINTS = 50;
const EXACT_RESULT_BONUS_MULTIPLIER = 2;
const WRONG_TIP_PENALTY = -25;

export abstract class RankService {
  // --------------------------------------------------------------------------> GET api/rank
  //                                                                             - get user points from the database
  static async getRankById({ user }: { user: { id: string } }) {
    logger.info("fetching points by ID" + user.id);
    return prisma.rank.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        points: 0,
      },
      update: {},
    });
  }

  // --------------------------------------------------------------------------> PATCH api/rank/evaluate-points
  //                                                                             - update user points
  static async evaluatePoints({ user }: { user: { id: string } }) {
    logger.info("updating points in the database for user with id: " + user.id);

    const tips = await prisma.tip.findMany({
      where: { userId: user.id },
      include: { game: true },
    });

    const evaluatedTips = tips.filter(
      (tip) =>
        tip.game.date <= new Date() &&
        tip.game.hostPoints !== null &&
        tip.game.guestPoints !== null,
    );
    const evaluatedTipIds = new Set(evaluatedTips.map((tip) => tip.id));

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

    const staleTips = tips.filter(
      (tip) => !evaluatedTipIds.has(tip.id) && tip.result !== 0,
    );

    await Promise.all(
      staleTips.map((tip) =>
        prisma.tip.update({ where: { id: tip.id }, data: { result: 0 } }),
      ),
    );

    const clampedTotalPoints = Math.max(0, totalPoints);

    return prisma.rank.upsert({
      where: { userId: user.id },
      create: { userId: user.id, points: clampedTotalPoints },
      update: { points: clampedTotalPoints },
    });
  }
}

import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { TipEvaluationService } from "../../global/services/tip-evaluation-service";

const logger = createLogger("api:rank");

export abstract class RankService {
  // --------------------------------------------------------------------------> PATCH api/rank/evaluate-points
  //                                                                             - update user points
  static async evaluatePoints({ user }: { user: { id: string } }) {
    logger.info("updating points in the database for user with id: " + user.id);

    // points depend on the other tips of the same game, so all of them are loaded
    const tips = await prisma.tip.findMany({
      where: { userId: user.id },
      include: {
        game: {
          include: {
            tips: { select: { id: true, tipHost: true, tipGuest: true } },
          },
        },
      },
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
      const points =
        TipEvaluationService.scoreGameTips({
          hostPoints: tip.game.hostPoints ?? 0,
          guestPoints: tip.game.guestPoints ?? 0,
          tips: tip.game.tips,
        }).get(tip.id) ?? 0;

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

    return prisma.rank.upsert({
      where: { userId: user.id },
      create: { userId: user.id, points: totalPoints },
      update: { points: totalPoints },
    });
  }
}

import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { IdParams } from "../../global/models";
import { TipModel } from "./model";

const logger = createLogger("api:tip");

export abstract class TipService {
  // --------------------------------------------------------------------------> GET api/tip/:id
  //                                                                             - get all tips for a season by their id
  static async getTipsBySeasonId({
    params,
  }: {
    params: (typeof IdParams)["static"];
  }) {
    logger.info("fetching tips by season id: " + params.id);
    const tips = await prisma.tip.findMany({
      where: {
        seasonId: params.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return tips;
  }

  // --------------------------------------------------------------------------> PUT api/tip
  //                                                                             - create or update a tip for a game, as long as it hasn't started yet
  static async upsertTip({
    body,
    user,
  }: {
    body: (typeof TipModel.UpsertTip)["static"];
    user: { id: string };
  }) {
    const game = await prisma.game.findUniqueOrThrow({
      where: { id: body.gameId },
      select: { date: true },
    });

    if (game.date <= new Date()) {
      logger.warn("tip rejected, game already started: " + body.gameId);
      throw new Error("GAME_ALREADY_STARTED");
    }

    return prisma.tip.upsert({
      where: {
        userId_gameId: { userId: user.id, gameId: body.gameId },
      },
      create: {
        seasonId: body.seasonId,
        gameId: body.gameId,
        userId: user.id,
        tipHost: body.tipHost,
        tipGuest: body.tipGuest,
      },
      update: {
        tipHost: body.tipHost,
        tipGuest: body.tipGuest,
      },
    });
  }
}

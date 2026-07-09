import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { IdParams } from "src/global/models";
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

  // --------------------------------------------------------------------------> POST api/tip
  //                                                                             - add a new tip to the database
  static async createNewTip({
    body,
    user,
  }: {
    body: (typeof TipModel.CreateNewTip)["static"];
    user: { id: string };
  }) {
    const existingTip = await prisma.tip.findFirst({
      where: {
        userId: user.id,
        gameId: body.gameId,
      },
    });

    if (existingTip) {
      return { success: false, message: "Tip already exists for this game." };
    }

    const createdTip = await prisma.tip.create({
      data: {
        seasonId: body.seasonId,
        gameId: body.gameId,
        userId: user.id,
        tipHost: body.tipHost,
        tipGuest: body.tipGuest,
      },
    });
    return createdTip;
  }
}

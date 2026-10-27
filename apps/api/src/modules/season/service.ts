import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { IdParams } from "../../global/models";
import { TipEvaluationService } from "../../global/services/tip-evaluation-service";
import { SeasonModel } from "./model";

const logger = createLogger("api:season");

const DAY_MS = 24 * 60 * 60 * 1000;

function assertAdmin(user: { role?: string | null }) {
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
}

// season.to is the start of the last day, games on that day are still allowed
function isWithinSeason(date: Date, season: { from: Date; to: Date }) {
  return date >= season.from && date.getTime() < season.to.getTime() + DAY_MS;
}

async function findSeasonOrThrow(id: string) {
  const season = await prisma.season.findUnique({ where: { id } });
  if (!season) {
    throw new Error("SEASON_NOT_FOUND");
  }
  return season;
}

export abstract class SeasonService {
  // --------------------------------------------------------------------------> POST api/season
  //                                                                             - create a new season, only allowed for admins
  static async createSeason({
    body,
    user,
  }: {
    body: SeasonModel["CreateSeason"];
    user: { id: string; role?: string | null };
  }) {
    assertAdmin(user);

    if (body.from > body.to) {
      throw new Error("INVALID_SEASON_RANGE");
    }

    logger.info("creating new season with title: " + body.title);

    return await prisma.season.create({
      data: {
        title: body.title,
        league: body.league,
        from: body.from,
        to: body.to,
      },
    });
  }

  // --------------------------------------------------------------------------> POST api/season/:id/game
  //                                                                             - add a game to a season, only allowed for admins
  static async addGame({
    params,
    body,
    user,
  }: {
    params: (typeof IdParams)["static"];
    body: SeasonModel["AddGame"];
    user: { id: string; role?: string | null };
  }) {
    assertAdmin(user);

    const season = await findSeasonOrThrow(params.id);

    if (!isWithinSeason(body.date, season)) {
      throw new Error("GAME_OUTSIDE_SEASON");
    }

    logger.info(
      `adding game ${body.host} vs ${body.guest} to season ${season.title}`,
    );

    return await prisma.game.create({
      data: {
        seasonId: season.id,
        date: body.date,
        host: body.host,
        guest: body.guest,
      },
    });
  }

  // --------------------------------------------------------------------------> PATCH api/season/:id
  //                                                                             - update a season, only allowed for admins
  static async updateSeason({
    params,
    body,
    user,
  }: {
    params: (typeof IdParams)["static"];
    body: SeasonModel["CreateSeason"];
    user: { id: string; role?: string | null };
  }) {
    assertAdmin(user);
    await findSeasonOrThrow(params.id);

    if (body.from > body.to) {
      throw new Error("INVALID_SEASON_RANGE");
    }

    const games = await prisma.game.findMany({
      where: { seasonId: params.id },
      select: { date: true },
    });
    if (games.some((game) => !isWithinSeason(game.date, body))) {
      throw new Error("SEASON_EXCLUDES_GAMES");
    }

    logger.info("updating season with id: " + params.id);

    return await prisma.season.update({
      where: { id: params.id },
      data: {
        title: body.title,
        league: body.league,
        from: body.from,
        to: body.to,
      },
    });
  }

  // --------------------------------------------------------------------------> DELETE api/season/:id
  //                                                                             - delete a season with its games and tips, only allowed for admins
  static async deleteSeason({
    params,
    user,
  }: {
    params: (typeof IdParams)["static"];
    user: { id: string; role?: string | null };
  }) {
    assertAdmin(user);
    await findSeasonOrThrow(params.id);

    logger.info("deleting season with id: " + params.id);

    return await prisma.season.delete({ where: { id: params.id } });
  }

  // --------------------------------------------------------------------------> PATCH api/season/:id/game/:gameId
  //                                                                             - update a game of a season, only allowed for admins
  static async updateGame({
    params,
    body,
    user,
  }: {
    params: (typeof SeasonModel.GameParams)["static"];
    body: SeasonModel["AddGame"];
    user: { id: string; role?: string | null };
  }) {
    assertAdmin(user);
    const season = await findSeasonOrThrow(params.id);

    const game = await prisma.game.findFirst({
      where: { id: params.gameId, seasonId: season.id },
    });
    if (!game) {
      throw new Error("GAME_NOT_FOUND");
    }

    if (!isWithinSeason(body.date, season)) {
      throw new Error("GAME_OUTSIDE_SEASON");
    }

    logger.info("updating game with id: " + game.id);

    return await prisma.game.update({
      where: { id: game.id },
      data: {
        date: body.date,
        host: body.host,
        guest: body.guest,
      },
    });
  }

  // --------------------------------------------------------------------------> DELETE api/season/:id/game/:gameId
  //                                                                             - delete a game with its tips, only allowed for admins
  static async deleteGame({
    params,
    user,
  }: {
    params: (typeof SeasonModel.GameParams)["static"];
    user: { id: string; role?: string | null };
  }) {
    assertAdmin(user);

    const game = await prisma.game.findFirst({
      where: { id: params.gameId, seasonId: params.id },
    });
    if (!game) {
      throw new Error("GAME_NOT_FOUND");
    }

    logger.info("deleting game with id: " + game.id);

    return await prisma.game.delete({ where: { id: game.id } });
  }

  // --------------------------------------------------------------------------> GET api/season
  //                                                                             - get all seasons from the database
  static async getAllSeasons() {
    logger.info("fetching season data");
    const seasons = await prisma.season.findMany({
      include: {
        game: {
          orderBy: { date: "asc" },
        },
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
        (tip) =>
          tip.game.date <= new Date() &&
          tip.game.hostPoints !== null &&
          tip.game.guestPoints !== null,
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

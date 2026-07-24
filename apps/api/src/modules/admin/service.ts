import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { AdminModel } from "./model";
import { IdParams } from "../../global/models";

const logger = createLogger("api:admin");

const KICKOFF_TIME_ZONE = "Europe/Berlin";

// Kickoff times are always meant as Europe/Berlin wall-clock time, even when
// the incoming string carries a "Z" suffix, so we strip it and convert from
// Berlin time to UTC ourselves (DST-aware) instead of trusting the raw offset.
function berlinKickoffToUtc(dateTimeStr: string): Date {
  const isoLocal = dateTimeStr.replace(/Z$/, "");
  const naiveUtc = new Date(`${isoLocal}Z`);

  const offsetPart = new Intl.DateTimeFormat("en-US", {
    timeZone: KICKOFF_TIME_ZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(naiveUtc)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = offsetPart?.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  const hours = Number(match?.[1] ?? 0);
  const minutes = Number(match?.[2] ?? 0);
  const offsetMs = (Math.abs(hours) * 60 + minutes) * 60_000 * Math.sign(hours || 1);

  return new Date(naiveUtc.getTime() - offsetMs);
}

export abstract class AdminService {
  // --------------------------------------------------------------------------> GET api/admin/all-seasons
  //                                                                             - get all seasons from the database
  static async getAllSeasons() {
    logger.info("fetching all seasons from the database");

    return await prisma.season.findMany({
      include: {
        game: true,
      },
    });
  }

  // --------------------------------------------------------------------------> POST api/admin/new-season
  //                                                                             - add a new season to the database
  static async addNewSeason({
    body,
  }: {
    body: (typeof AdminModel.AddNewSeason)["static"];
  }) {
    logger.info("adding new season to the database with title: " + body.title);

    return await prisma.season.create({
      data: {
        title: body.title,
        from: new Date(body.from),
        to: new Date(body.to),
        league: body.league,
        game: {
          create: body.game.map((g) => ({
            date: berlinKickoffToUtc(g.date),
            host: g.host,
            guest: g.guest,
          })),
        },
      },
    });
  }

  // --------------------------------------------------------------------------> DELETE api/admin/delete-season/:id
  //                                                                             - delete a season from the database
  static async deleteSeason({
    params,
  }: {
    params: (typeof IdParams)["static"];
  }) {
    logger.info("deleting season from the database with id: " + params.id);

    return await prisma.season.delete({
      where: {
        id: params.id,
      },
    });
  }

  // --------------------------------------------------------------------------> PATCH api/admin/update-game/:id
  //                                                                             - update a game by id in the database
  static async updateGameById({
    params,
    body,
  }: {
    params: (typeof IdParams)["static"];
    body: (typeof AdminModel.UpdateGame)["static"];
  }) {
    logger.info("updating game in the database with id: " + params.id);

    return await prisma.game.update({
      where: {
        id: params.id,
      },
      data: {
        hostPoints: body.hostPoints,
        guestPoints: body.guestPoints,
        result: body.hostPoints - body.guestPoints,
      },
    });
  }
}

import { randomBytes, randomUUID, scrypt } from "node:crypto";

import type { Position } from "../generated/prisma/client";
import { prisma } from "../src/index";

// Same scrypt parameters/format better-auth's default email/password hasher
// uses, so the seeded credential account can log in through the real
// sign-in flow (apps/web -> better-auth -> Account.password).
const SCRYPT_CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 };

function scryptKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      SCRYPT_CONFIG.dkLen,
      {
        N: SCRYPT_CONFIG.N,
        r: SCRYPT_CONFIG.r,
        p: SCRYPT_CONFIG.p,
        maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
      },
      (err, key) => (err ? reject(err) : resolve(key)),
    );
  });
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptKey(password.normalize("NFKC"), salt);
  return `${salt}:${key.toString("hex")}`;
}

// Mirrors apps/api/src/modules/rank/service.ts so seeded points/positions stay
// consistent with how the real app scores tips and assigns ranks.
const WINNER_POINTS = 50;
const EXACT_RESULT_BONUS_MULTIPLIER = 2;
const WRONG_TIP_PENALTY = -25;

function getPositionForPoints(points: number): Position {
  if (points <= 200) return "BRONZE";
  if (points <= 400) return "SILVER";
  if (points <= 600) return "GOLD";
  if (points <= 800) return "PLATINUM";
  return "DIAMOND";
}

function tipResult(
  tipHost: number,
  tipGuest: number,
  hostPoints: number | null,
  guestPoints: number | null,
): number {
  if (hostPoints === null || guestPoints === null) return 0;
  if (tipHost === hostPoints && tipGuest === guestPoints) {
    return WINNER_POINTS * EXACT_RESULT_BONUS_MULTIPLIER;
  }
  if (Math.sign(hostPoints - guestPoints) === Math.sign(tipHost - tipGuest)) {
    return WINNER_POINTS;
  }
  return WRONG_TIP_PENALTY;
}

const CLUB = "HSC 2000 Coburg";
const LEAGUE = "2. Handball-Bundesliga";
const OPPONENTS = [
  "TuS Fönix Wanne-Eickel",
  "ThSV Eisenach",
  "Die Eulen Ludwigshafen",
  "HSG Krefeld",
  "TSV Bayer Dormagen",
  "Wilhelmshavener HV",
  "VfL Eintracht Hagen",
  "SG Pforzheim/Eutingen",
  "ASV Hamm-Westfalen",
  "HC Elbflorenz",
];

type GameSeed = {
  date: string;
  host: string;
  guest: string;
  hostPoints: number | null;
  guestPoints: number | null;
};

type SeasonSeed = {
  title: string;
  from: string;
  to: string;
  league: string;
  games: GameSeed[];
};

const SEASONS: SeasonSeed[] = [
  {
    title: "Saison 2022/2023",
    from: "2022-08-01",
    to: "2023-06-30",
    league: LEAGUE,
    games: [
      {
        date: "2022-08-20T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[0]!,
        hostPoints: 29,
        guestPoints: 26,
      },
      {
        date: "2022-09-17T15:30:00Z",
        host: OPPONENTS[1]!,
        guest: CLUB,
        hostPoints: 24,
        guestPoints: 28,
      },
      {
        date: "2022-10-15T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[2]!,
        hostPoints: 27,
        guestPoints: 27,
      },
      {
        date: "2022-11-12T15:30:00Z",
        host: OPPONENTS[3]!,
        guest: CLUB,
        hostPoints: 30,
        guestPoints: 25,
      },
      {
        date: "2022-12-10T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[4]!,
        hostPoints: 33,
        guestPoints: 22,
      },
      {
        date: "2023-01-21T15:30:00Z",
        host: OPPONENTS[5]!,
        guest: CLUB,
        hostPoints: 26,
        guestPoints: 26,
      },
      {
        date: "2023-02-18T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[6]!,
        hostPoints: 31,
        guestPoints: 29,
      },
      {
        date: "2023-03-18T15:30:00Z",
        host: OPPONENTS[7]!,
        guest: CLUB,
        hostPoints: 23,
        guestPoints: 27,
      },
      {
        date: "2023-04-15T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[8]!,
        hostPoints: 28,
        guestPoints: 24,
      },
      {
        date: "2023-05-13T15:30:00Z",
        host: OPPONENTS[9]!,
        guest: CLUB,
        hostPoints: 29,
        guestPoints: 31,
      },
    ],
  },
  {
    title: "Saison 2023/2024",
    from: "2023-08-01",
    to: "2024-06-30",
    league: LEAGUE,
    games: [
      {
        date: "2023-08-19T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[1]!,
        hostPoints: 30,
        guestPoints: 27,
      },
      {
        date: "2023-09-16T15:30:00Z",
        host: OPPONENTS[2]!,
        guest: CLUB,
        hostPoints: 25,
        guestPoints: 29,
      },
      {
        date: "2023-10-14T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[3]!,
        hostPoints: 26,
        guestPoints: 26,
      },
      {
        date: "2023-11-11T15:30:00Z",
        host: OPPONENTS[4]!,
        guest: CLUB,
        hostPoints: 31,
        guestPoints: 28,
      },
      {
        date: "2023-12-09T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[5]!,
        hostPoints: 34,
        guestPoints: 24,
      },
      {
        date: "2024-01-20T15:30:00Z",
        host: OPPONENTS[6]!,
        guest: CLUB,
        hostPoints: 27,
        guestPoints: 27,
      },
      {
        date: "2024-02-17T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[7]!,
        hostPoints: 29,
        guestPoints: 25,
      },
      {
        date: "2024-03-16T15:30:00Z",
        host: OPPONENTS[8]!,
        guest: CLUB,
        hostPoints: 28,
        guestPoints: 30,
      },
      {
        date: "2024-04-13T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[9]!,
        hostPoints: 32,
        guestPoints: 26,
      },
      {
        date: "2024-05-11T15:30:00Z",
        host: OPPONENTS[0]!,
        guest: CLUB,
        hostPoints: 24,
        guestPoints: 22,
      },
    ],
  },
  {
    title: "Saison 2024/2025",
    from: "2024-08-01",
    to: "2025-06-30",
    league: LEAGUE,
    games: [
      {
        date: "2024-08-17T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[3]!,
        hostPoints: 28,
        guestPoints: 24,
      },
      {
        date: "2024-09-14T15:30:00Z",
        host: OPPONENTS[4]!,
        guest: CLUB,
        hostPoints: 25,
        guestPoints: 29,
      },
      {
        date: "2024-10-12T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[1]!,
        hostPoints: 31,
        guestPoints: 31,
      },
      {
        date: "2024-11-09T15:30:00Z",
        host: OPPONENTS[5]!,
        guest: CLUB,
        hostPoints: 27,
        guestPoints: 23,
      },
      {
        date: "2024-12-07T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[2]!,
        hostPoints: 30,
        guestPoints: 28,
      },
      {
        date: "2025-01-18T15:30:00Z",
        host: OPPONENTS[7]!,
        guest: CLUB,
        hostPoints: 22,
        guestPoints: 26,
      },
      {
        date: "2025-02-15T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[6]!,
        hostPoints: 29,
        guestPoints: 29,
      },
      {
        date: "2025-03-15T15:30:00Z",
        host: OPPONENTS[9]!,
        guest: CLUB,
        hostPoints: 26,
        guestPoints: 30,
      },
      {
        date: "2025-04-12T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[8]!,
        hostPoints: 33,
        guestPoints: 21,
      },
      {
        date: "2025-05-10T15:30:00Z",
        host: OPPONENTS[0]!,
        guest: CLUB,
        hostPoints: 25,
        guestPoints: 25,
      },
    ],
  },
  {
    title: "Saison 2026/2027",
    from: "2026-07-01",
    to: "2027-06-30",
    league: LEAGUE,
    games: [
      // gespielt
      {
        date: "2026-07-18T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[5]!,
        hostPoints: 27,
        guestPoints: 25,
      },
      {
        date: "2026-07-25T15:30:00Z",
        host: OPPONENTS[1]!,
        guest: CLUB,
        hostPoints: 24,
        guestPoints: 24,
      },
      // zukünftig, noch ohne Ergebnis
      {
        date: "2026-08-22T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[2]!,
        hostPoints: null,
        guestPoints: null,
      },
      {
        date: "2026-09-19T15:30:00Z",
        host: OPPONENTS[3]!,
        guest: CLUB,
        hostPoints: null,
        guestPoints: null,
      },
      {
        date: "2026-10-17T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[4]!,
        hostPoints: null,
        guestPoints: null,
      },
      {
        date: "2026-11-14T15:30:00Z",
        host: OPPONENTS[6]!,
        guest: CLUB,
        hostPoints: null,
        guestPoints: null,
      },
      {
        date: "2026-12-12T15:30:00Z",
        host: CLUB,
        guest: OPPONENTS[7]!,
        hostPoints: null,
        guestPoints: null,
      },
      {
        date: "2027-01-23T15:30:00Z",
        host: OPPONENTS[8]!,
        guest: CLUB,
        hostPoints: null,
        guestPoints: null,
      },
    ],
  },
];

type TipSeed = {
  seasonIndex: number;
  gameIndex: number;
  tipHost: number;
  tipGuest: number;
};

// Test-Nutzer: 7x exakt (700), 2x Tendenz (100), 2x falsch (-50) -> 750 Punkte -> PLATINUM
const MAIN_USER_TIPS: TipSeed[] = [
  { seasonIndex: 0, gameIndex: 0, tipHost: 29, tipGuest: 26 }, // exakt
  { seasonIndex: 0, gameIndex: 2, tipHost: 27, tipGuest: 27 }, // exakt
  { seasonIndex: 0, gameIndex: 6, tipHost: 28, tipGuest: 30 }, // falsch (Heimsieg statt Auswärtssieg getippt)
  { seasonIndex: 1, gameIndex: 1, tipHost: 25, tipGuest: 29 }, // exakt
  { seasonIndex: 1, gameIndex: 4, tipHost: 34, tipGuest: 24 }, // exakt
  { seasonIndex: 1, gameIndex: 8, tipHost: 28, tipGuest: 24 }, // Tendenz (Heimsieg, falscher Spielstand)
  { seasonIndex: 2, gameIndex: 0, tipHost: 28, tipGuest: 24 }, // exakt
  { seasonIndex: 2, gameIndex: 4, tipHost: 30, tipGuest: 28 }, // exakt
  { seasonIndex: 2, gameIndex: 8, tipHost: 30, tipGuest: 20 }, // Tendenz (Heimsieg, falscher Spielstand)
  { seasonIndex: 3, gameIndex: 0, tipHost: 27, tipGuest: 25 }, // exakt
  { seasonIndex: 3, gameIndex: 1, tipHost: 22, tipGuest: 26 }, // falsch (Auswärtssieg statt Unentschieden getippt)
  // zukünftige Spiele, noch nicht ausgewertet
  { seasonIndex: 3, gameIndex: 2, tipHost: 28, tipGuest: 25 },
  { seasonIndex: 3, gameIndex: 3, tipHost: 24, tipGuest: 27 },
  { seasonIndex: 3, gameIndex: 4, tipHost: 30, tipGuest: 26 },
];

type DemoUserSeed = {
  email: string;
  name: string;
  emailVerified: boolean;
  points: number;
};

const DEMO_USERS: DemoUserSeed[] = [
  {
    email: "anna.fischer@example.com",
    name: "Anna Fischer",
    emailVerified: true,
    points: 550,
  },
  {
    email: "max.weber@example.com",
    name: "Max Weber",
    emailVerified: true,
    points: 350,
  },
  {
    email: "laura.schmidt@example.com",
    name: "Laura Schmidt",
    emailVerified: true,
    points: 150,
  },
  {
    email: "tom.vogel@example.com",
    name: "Tom Vogel",
    emailVerified: false,
    points: 850,
  },
];

const SEED_EMAILS = ["test@example.com", ...DEMO_USERS.map((u) => u.email)];
const SEED_SEASON_TITLES = SEASONS.map((s) => s.title);
const MAIN_PASSWORD = "Test123!";

async function createAccount(userId: string, password: string) {
  return prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: await hashPassword(password),
    },
  });
}

async function main() {
  console.log("Räume alte Seed-Daten auf ...");
  await prisma.user.deleteMany({ where: { email: { in: SEED_EMAILS } } });
  await prisma.season.deleteMany({
    where: { title: { in: SEED_SEASON_TITLES } },
  });

  console.log("Erstelle Saisons und Spiele ...");
  const seasons = await Promise.all(
    SEASONS.map((season) =>
      prisma.season.create({
        data: {
          title: season.title,
          from: new Date(season.from),
          to: new Date(season.to),
          league: season.league,
          game: {
            create: season.games.map((game) => ({
              date: new Date(game.date),
              host: game.host,
              guest: game.guest,
              hostPoints: game.hostPoints,
              guestPoints: game.guestPoints,
              result:
                game.hostPoints !== null && game.guestPoints !== null
                  ? game.hostPoints - game.guestPoints
                  : null,
            })),
          },
        },
        include: { game: true },
      }),
    ),
  );

  console.log("Erstelle Hauptnutzer test@example.com ...");
  const mainUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: "Test Nutzer",
      email: "test@example.com",
      emailVerified: false,
      twoFactorEnabled: false,
    },
  });
  await createAccount(mainUser.id, MAIN_PASSWORD);

  let mainUserPoints = 0;
  for (const tip of MAIN_USER_TIPS) {
    const season = seasons[tip.seasonIndex]!;
    const gameSeed = SEASONS[tip.seasonIndex]!.games[tip.gameIndex]!;
    const game = season.game.find(
      (g) =>
        g.host === gameSeed.host &&
        g.guest === gameSeed.guest &&
        g.date.getTime() === new Date(gameSeed.date).getTime(),
    )!;
    const result = tipResult(
      tip.tipHost,
      tip.tipGuest,
      gameSeed.hostPoints,
      gameSeed.guestPoints,
    );
    mainUserPoints += result;
    await prisma.tip.create({
      data: {
        seasonId: season.id,
        gameId: game.id,
        userId: mainUser.id,
        tipHost: tip.tipHost,
        tipGuest: tip.tipGuest,
        result,
      },
    });
  }

  await prisma.rank.create({
    data: {
      userId: mainUser.id,
      points: Math.max(0, mainUserPoints),
      position: getPositionForPoints(mainUserPoints),
    },
  });
  console.log(
    `Hauptnutzer Punktestand: ${mainUserPoints} (${getPositionForPoints(mainUserPoints)})`,
  );

  await prisma.notification.createMany({
    data: [
      {
        userId: mainUser.id,
        message:
          "Willkommen bei HSCBet! Tippe jetzt auf die kommenden Spiele des HSC 2000 Coburg.",
        type: "GENERIC",
        read: true,
      },
      {
        userId: mainUser.id,
        message:
          "Dein Tipp für HSC 2000 Coburg gegen Die Eulen Ludwigshafen wurde gespeichert.",
        type: "GENERIC",
        read: false,
      },
    ],
  });

  console.log("Erstelle weitere Demo-Nutzer ...");
  const demoUsers = [];
  for (const demo of DEMO_USERS) {
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: demo.name,
        email: demo.email,
        emailVerified: demo.emailVerified,
        twoFactorEnabled: false,
      },
    });
    await createAccount(user.id, MAIN_PASSWORD);
    await prisma.rank.create({
      data: {
        userId: user.id,
        points: demo.points,
        position: getPositionForPoints(demo.points),
      },
    });
    demoUsers.push(user);
  }

  // Etwas Tipp-Vielfalt für die Demo-Nutzer über alle Spiele hinweg, damit die
  // Gruppen-Rangliste und die Tipp-Ansicht gefüllt sind.
  console.log("Erstelle Tipps der Demo-Nutzer ...");
  let globalGameIndex = 0;
  for (let seasonIdx = 0; seasonIdx < seasons.length; seasonIdx++) {
    const season = seasons[seasonIdx]!;
    const seasonSeed = SEASONS[seasonIdx]!;
    for (let gameIdx = 0; gameIdx < seasonSeed.games.length; gameIdx++) {
      const gameSeed = seasonSeed.games[gameIdx]!;
      const game = season.game.find(
        (g) =>
          g.host === gameSeed.host &&
          g.guest === gameSeed.guest &&
          g.date.getTime() === new Date(gameSeed.date).getTime(),
      )!;

      for (let userIdx = 0; userIdx < demoUsers.length; userIdx++) {
        const mode = (globalGameIndex + userIdx) % 4;
        if (mode === 3) continue; // dieser Nutzer hat auf dieses Spiel nicht getippt

        let tipHost: number;
        let tipGuest: number;
        if (gameSeed.hostPoints === null || gameSeed.guestPoints === null) {
          tipHost = 26 + mode;
          tipGuest = 24 + ((mode + 1) % 3);
        } else if (mode === 0) {
          tipHost = gameSeed.hostPoints;
          tipGuest = gameSeed.guestPoints;
        } else if (mode === 1) {
          const diff = gameSeed.hostPoints - gameSeed.guestPoints;
          if (diff === 0) {
            tipHost = gameSeed.hostPoints + 1;
            tipGuest = gameSeed.guestPoints + 1;
          } else if (diff > 0) {
            tipHost = gameSeed.hostPoints + 2;
            tipGuest = Math.max(0, gameSeed.guestPoints - 1);
          } else {
            tipHost = Math.max(0, gameSeed.hostPoints - 1);
            tipGuest = gameSeed.guestPoints + 2;
          }
        } else {
          const diff = gameSeed.hostPoints - gameSeed.guestPoints;
          if (diff === 0) {
            tipHost = gameSeed.hostPoints + 4;
            tipGuest = Math.max(0, gameSeed.guestPoints - 4);
          } else if (diff > 0) {
            tipHost = Math.max(0, gameSeed.hostPoints - 8);
            tipGuest = gameSeed.guestPoints + 8;
          } else {
            tipHost = gameSeed.hostPoints + 8;
            tipGuest = Math.max(0, gameSeed.guestPoints - 8);
          }
        }

        await prisma.tip.create({
          data: {
            seasonId: season.id,
            gameId: game.id,
            userId: demoUsers[userIdx]!.id,
            tipHost,
            tipGuest,
            result: tipResult(
              tipHost,
              tipGuest,
              gameSeed.hostPoints,
              gameSeed.guestPoints,
            ),
          },
        });
      }
      globalGameIndex++;
    }
  }

  console.log("Erstelle Gruppe mit mehreren Spielern ...");
  await prisma.group.create({
    data: {
      name: "HSC Fanfreunde",
      description: "Tippgemeinschaft der HSC-2000-Coburg-Fans",
      leaderId: mainUser.id,
      members: {
        connect: [mainUser, ...demoUsers].map((u) => ({ id: u.id })),
      },
    },
  });

  console.log("Fertig!");
  console.log(
    `Login: test@example.com / ${MAIN_PASSWORD} (E-Mail nicht bestätigt, 2FA deaktiviert, Rang PLATINUM)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

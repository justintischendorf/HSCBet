import { RankService } from "../apps/api/src/modules/rank/service";
import { prisma } from "../packages/database/src/index";

// Recalculates tip results and points of all users, e.g. after the scoring
// rules changed. Usage:
//   bun db:evaluate

export async function evaluateAllPoints() {
  const users = await prisma.user.findMany({ select: { id: true } });

  for (const user of users) {
    await RankService.evaluatePoints({ user });
  }

  return users.length;
}

if (import.meta.main) {
  evaluateAllPoints()
    .then((count) => console.log(`Punkte von ${count} Nutzern neu berechnet.`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

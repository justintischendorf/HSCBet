import { prisma } from "../packages/database/src/index";

// Usage:
//   bun db:admin user@example.com
//   bun db:admin --revoke user@example.com

async function main() {
  const args = process.argv.slice(2);
  const revoke = args.includes("--revoke");
  const emails = args.filter((arg) => !arg.startsWith("--"));

  if (emails.length === 0) {
    console.error("Usage: bun db:admin [--revoke] <email> [<email> ...]");
    process.exitCode = 1;
    return;
  }

  const role = revoke ? "user" : "admin";

  for (const email of emails) {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      console.error(`Kein Nutzer mit E-Mail ${email} gefunden.`);
      process.exitCode = 1;
      continue;
    }

    await prisma.user.update({ where: { id: user.id }, data: { role } });
    console.log(`${email}: Rolle auf "${role}" gesetzt.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

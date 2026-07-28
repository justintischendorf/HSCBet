import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { PrismaClient } from "../generated/prisma/client";

export * from "./types";

const databaseDir = dirname(fileURLToPath(import.meta.url));
config({ path: join(databaseDir, "..", ".env") });
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

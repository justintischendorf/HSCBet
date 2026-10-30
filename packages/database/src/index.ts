import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { config } from "dotenv";

import { PrismaClient } from "../generated/prisma/client";
import { resolveDatabaseUrl } from "./url";

export * from "./types";

const databaseDir = dirname(fileURLToPath(import.meta.url));
config({ path: join(databaseDir, "..", ".env") });
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL");
}

const adapter = new PrismaLibSql({ url: resolveDatabaseUrl(databaseUrl) });
const prisma = new PrismaClient({ adapter });

export { prisma };

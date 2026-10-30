import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Löst relative SQLite-Pfade (z. B. "file:./data/hscbet.db") relativ zum
 * Database-Package auf, damit API, Web, Scripts und Prisma CLI unabhängig
 * vom aktuellen Arbeitsverzeichnis dieselbe Datei verwenden.
 */
export function resolveDatabaseUrl(url: string): string {
  if (!url.startsWith("file:")) return url;

  const path = url.slice("file:".length);
  if (isAbsolute(path)) return url;

  return `file:${join(packageDir, path)}`;
}

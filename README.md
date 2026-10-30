# HSCBet

Tippspiel-Plattform für den HSC 2000 Coburg. Das Projekt ist ein [Turborepo](https://turborepo.dev/)-Monorepo und nutzt [Bun](https://bun.sh/) als Paketmanager und Runtime.

## Aufbau

| Pfad                | Inhalt                                                     |
| ------------------- | ---------------------------------------------------------- |
| `apps/web`          | Frontend (Next.js)                                         |
| `apps/api`          | Backend (Elysia auf Bun)                                   |
| `packages/database` | Prisma-Schema, Migrationen und Client (SQLite über libSQL) |
| `packages/auth`     | Authentifizierung (Better Auth)                            |
| `packages/bucket`   | Dateispeicher (MinIO / S3)                                 |
| `packages/queue`    | Job-Queue (Redis)                                          |
| `packages/worker`   | Worker für Hintergrund-Jobs (läuft in Docker)              |
| `packages/pub-sub`  | Pub/Sub über Redis                                         |
| `packages/treaty`   | Typisierter API-Client für das Frontend                    |
| `packages/logger`   | Gemeinsamer Logger                                         |
| `scripts`           | Seed- und Admin-Scripts für die Datenbank                  |
| `docs/architecture` | Systemdiagramm                                             |

## Voraussetzungen

- [Bun](https://bun.sh/) in der Version aus `package.json` (`packageManager`, aktuell `1.4.2`)
- [Docker Desktop](https://www.docker.com/) inklusive Docker Compose. Docker muss laufen, bevor `bun docker:dev` ausgeführt wird.

## Einrichtung nach dem Klonen

Alle Befehle werden im Projekt-Root ausgeführt.

### 1. Abhängigkeiten installieren

```sh
bun install
```

### 2. `.env`-Dateien anlegen

Im Projekt-Root, in `apps/api`, `apps/web` und in jedem Package unter `packages/` liegt eine `.env.example` mit allen Variablen. Daraus muss jeweils eine `.env` erstellt werden, weil Bun, Next.js und die Prisma CLI die `.env` im eigenen Arbeitsverzeichnis laden. Alle `.env`-Dateien haben denselben Inhalt.

Zuerst die `.env` im Root anlegen:

```sh
cp .env.example .env
```

Dann in der `.env` die `YOUR_...`-Platzhalter ersetzen. Für die lokale Entwicklung funktionieren diese Werte:

```env
# Database configuration
DATABASE_URL="file:./data/hscbet.db"

# Server configuration
API_SERVER_PORT=3001
WEB_SERVER_PORT=3000
API_SERVER_URL=http://localhost:3001
WEB_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_API_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/api/socket

# BetterAuth configuration
BETTER_AUTH_SECRET=<zufälliger Wert, siehe unten>
BETTER_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:3001

# Minio configuration
MINIO_CONTAINER_NAME=hscbet-minio
MINIO_ROOT_USER=<frei wählbar, z. B. minio>
MINIO_ROOT_PASSWORD=<frei wählbar, mindestens 8 Zeichen>
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ENDPOINT=http://localhost:9000
MINIO_PUBLIC_ENDPOINT=http://localhost:9000
MINIO_REGION=eu-central-1
MINIO_BUCKET_NAME=hscbet-bucket
MINIO_S3_PRESIGNED_URL_EXPIRATION_TIME=3600

# Redis configuration
REDIS_CONTAINER_NAME=hscbet-redis
REDIS_PORT=6379
REDIS_HOST=localhost

# Admin configuration
ADMIN_API_KEY=<zufälliger Wert, siehe unten>
SIGNUP_REVIEW_MAIL_ADDRESS=<E-Mail-Adresse, die neue Registrierungen freigibt>

# Mail configuration (Resend)
RESEND_API_KEY=
RESEND_MAIL_ADDRESS=
```

- `BETTER_AUTH_SECRET` und `ADMIN_API_KEY` sind beliebige, lange Zufallswerte, z. B. aus `openssl rand -base64 32`.
- `DATABASE_URL` bleibt so. Relative Pfade werden immer relativ zu `packages/database` aufgelöst, alle Apps nutzen also dieselbe Datei.
- `RESEND_API_KEY` und `RESEND_MAIL_ADDRESS` können vorerst leer bleiben. Was dann nicht funktioniert, steht unter [Ohne Resend](#ohne-resend).

Danach die fertige `.env` in alle anderen Ordner kopieren:

```sh
for d in apps/api apps/web packages/*; do cp .env "$d/.env"; done
```

> [!IMPORTANT]
> Wird später eine Variable geändert, muss die Root-`.env` erneut in alle Ordner kopiert werden (gleicher Befehl). Sonst arbeiten API, Web und Prisma mit unterschiedlichen Werten.

### 3. Infrastruktur starten (Docker)

```sh
bun docker:dev
```

Startet in Docker:

- **MinIO** (Dateispeicher) auf Port 9000, Web-Konsole unter http://localhost:9001 (Login mit `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`)
- **minio-init**, legt einmalig den Bucket `MINIO_BUCKET_NAME` an und beendet sich danach
- **Redis** auf Port 6379
- den **Worker** für Hintergrund-Jobs

API und Web laufen **nicht** in Docker, sondern lokal mit Hot-Reload (Schritt 8).

### 4. Datenbank migrieren

```sh
bun db:migrate:dev
```

Legt die SQLite-Datei `packages/database/data/hscbet.db` an und spielt alle Migrationen ein.

### 5. Prisma Client generieren

```sh
bun db:generate
```

Erzeugt den Prisma Client nach `packages/database/generated/`. Ohne diesen Schritt starten API und Web nicht.

### 6. Testdaten einspielen

```sh
bun db:seed
```

Legt Saisons, Spiele, Tipps und bereits freigegebene Demo-Nutzer an. Alle Demo-Nutzer haben das Passwort `Test123!`, zum Beispiel:

| E-Mail                     | Passwort   |
| -------------------------- | ---------- |
| `test@example.com`         | `Test123!` |
| `anna.fischer@example.com` | `Test123!` |
| `max.weber@example.com`    | `Test123!` |

Das Script löscht vorher seine eigenen alten Seed-Daten und kann beliebig oft ausgeführt werden.

### 7. Admin-Rechte vergeben

```sh
bun db:admin test@example.com
```

Macht einen bestehenden Nutzer zum Admin. Mit `--revoke` wird die Rolle wieder entzogen. Mehrere E-Mail-Adressen sind möglich.

### 8. Entwicklungsserver starten

```sh
bun dev
```

Startet API und Web parallel über Turborepo:

- Web: http://localhost:3000
- API: http://localhost:3001

Danach im Browser http://localhost:3000 öffnen und mit einem der Seed-Nutzer anmelden.

## Kurzfassung

```sh
bun install
cp .env.example .env
# .env ausfüllen (siehe Schritt 2), dann:
for d in apps/api apps/web packages/*; do cp .env "$d/.env"; done
bun docker:dev
bun db:migrate:dev
bun db:generate
bun db:seed
bun db:admin test@example.com
bun dev
```

## Ohne Resend

Solange `RESEND_API_KEY` und `RESEND_MAIL_ADDRESS` leer sind, werden keine E-Mails verschickt. Das betrifft:

- **Registrierung:** Neue Accounts sind zunächst nicht freigegeben und brauchen die Review-Mail an `SIGNUP_REVIEW_MAIL_ADDRESS`. Ohne Mail kann man sich mit einem neu registrierten Account nicht anmelden.
- Passwort vergessen, E-Mail-Bestätigung und E-Mail-Änderung

Zum Entwickeln einfach die Seed-Nutzer verwenden. Soll trotzdem ein neu registrierter Account freigeschaltet werden, `bun db:show` ausführen und in Prisma Studio beim Nutzer in der Tabelle `User` das Feld `approved` auf `true` setzen.

## Alltag

Nach dem ersten Setup reicht in der Regel:

```sh
bun docker:dev   # falls die Container nicht mehr laufen
bun dev
```

Nach einem `git pull` mit neuen Migrationen oder Abhängigkeiten:

```sh
bun install
bun db:migrate:dev
bun db:generate
```

Container stoppen:

```sh
docker compose -f docker-compose-dev.yml down
```

## Schema ändern

1. `packages/database/prisma/schema.prisma` anpassen
2. `bun db:migrate:dev` ausführen und einen Namen für die Migration vergeben
3. `bun db:generate` ausführen
4. Die neue Migration unter `packages/database/prisma/migrations/` mit committen

## Alle Scripts

| Befehl                 | Beschreibung                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `bun dev`              | Startet API und Web im Entwicklungsmodus                             |
| `bun run build`        | Baut alle Apps und Packages                                          |
| `bun docker:dev`       | Startet MinIO, Redis und den Worker in Docker                        |
| `bun db:migrate:dev`   | Spielt Migrationen ein bzw. erzeugt nach Schema-Änderungen eine neue |
| `bun db:generate`      | Generiert den Prisma Client                                          |
| `bun db:migrate:reset` | Setzt die Datenbank komplett zurück (**alle Daten gehen verloren**)  |
| `bun db:seed`          | Spielt Testdaten ein                                                 |
| `bun db:admin <email>` | Vergibt Admin-Rechte (`--revoke` entzieht sie)                       |
| `bun db:show`          | Öffnet Prisma Studio zum Ansehen und Bearbeiten der Datenbank        |
| `bun lint`             | Lintet den Code mit oxlint                                           |
| `bun format`           | Formatiert den Code mit oxlint und oxfmt                             |
| `bun check-types`      | Prüft die TypeScript-Typen in allen Packages                         |

## Vor einem Pull Request

Die CI prüft Linting und Formatierung. Lokal vorab:

```sh
bun lint
bun run oxfmt --check apps packages
```

Bei Formatierungsfehlern hilft `bun format`.

## Fehlerbehebung

- **API oder Web starten nicht, Fehler zum Prisma Client:** `bun db:generate` ausführen.
- **`Missing required S3/MinIO environment variables`:** In der `.env` des betroffenen Ordners fehlen MinIO-Werte. Root-`.env` erneut in alle Ordner kopieren.
- **`Missing NEXT_PUBLIC_AUTH_BASE_URL`:** `apps/web/.env` fehlt oder ist unvollständig. Nach dem Anpassen `bun dev` neu starten, da Next.js `NEXT_PUBLIC_*`-Variablen nur beim Start einliest.
- **„Dein Account wurde noch nicht freigegeben":** siehe [Ohne Resend](#ohne-resend).
- **Port belegt:** Prüfen, ob noch eine alte Instanz von `bun dev` oder ein anderer Container auf 3000, 3001, 6379, 9000 oder 9001 läuft.

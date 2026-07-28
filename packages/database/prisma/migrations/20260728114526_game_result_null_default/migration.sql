-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "hostPoints" DROP DEFAULT,
ALTER COLUMN "guestPoints" DROP DEFAULT,
ALTER COLUMN "result" DROP DEFAULT;

-- DataMigration: games that were never given a real result via the admin
-- "update game" action are indistinguishable from a genuine 0:0 final,
-- because 0/0/0 used to be the column default. Treat existing 0/0/0 rows
-- as "result not yet entered" and null them out so evaluation logic can
-- tell unplayed games apart from real results going forward.
UPDATE "Game"
SET "hostPoints" = NULL, "guestPoints" = NULL, "result" = NULL
WHERE "hostPoints" = 0 AND "guestPoints" = 0 AND "result" = 0;

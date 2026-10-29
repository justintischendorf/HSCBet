-- AlterTable
ALTER TABLE "Tip" ALTER COLUMN "result" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Rank" ALTER COLUMN "points" SET DATA TYPE DOUBLE PRECISION;

-- new scoring system: old points are invalid, recalculate with `bun db:evaluate`
UPDATE "Tip" SET "result" = 0;
UPDATE "Rank" SET "points" = 0;

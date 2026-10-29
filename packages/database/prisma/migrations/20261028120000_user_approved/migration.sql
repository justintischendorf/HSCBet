-- AlterTable
ALTER TABLE "user" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;

-- existing accounts stay usable
UPDATE "user" SET "approved" = true;

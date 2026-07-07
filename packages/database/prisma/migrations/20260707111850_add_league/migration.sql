/*
  Warnings:

  - Added the required column `from` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `league` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Season` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "from" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "league" TEXT NOT NULL,
ADD COLUMN     "to" TIMESTAMP(3) NOT NULL;

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateTable
CREATE TABLE "Rank" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "position" "Position" NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rank_userId_key" ON "Rank"("userId");

-- AddForeignKey
ALTER TABLE "Rank" ADD CONSTRAINT "Rank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

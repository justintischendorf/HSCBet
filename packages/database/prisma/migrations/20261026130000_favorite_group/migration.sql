-- AlterTable
ALTER TABLE "user" ADD COLUMN "favoriteGroupId" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_favoriteGroupId_fkey" FOREIGN KEY ("favoriteGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

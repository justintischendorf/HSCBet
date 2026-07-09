-- AlterEnum
ALTER TYPE "Position" ADD VALUE 'DEFAULT';

-- AlterTable
ALTER TABLE "file" ADD COLUMN     "groupId" TEXT;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GENERIC', 'GROUP_INVITE');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'GENERIC';

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

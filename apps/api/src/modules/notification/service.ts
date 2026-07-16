import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { IdParams } from "../../global/models";

const logger = createLogger("api:notification");

export abstract class NotificationService {
  // --------------------------------------------------------------------------> GET api/notification
  //                                                                             - get all notifications for the authenticated user
  static async getNotificationsForUser({ user }: { user: { id: string } }) {
    logger.info("fetching notifications for user: " + user.id);
    return prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  // --------------------------------------------------------------------------> PATCH api/notification/:id/read
  //                                                                             - mark a single notification as read
  static async markAsRead({
    user,
    params,
  }: {
    user: { id: string };
    params: (typeof IdParams)["static"];
  }) {
    const notification = await prisma.notification.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!notification) {
      throw new Error("Unauthorized");
    }

    return prisma.notification.update({
      where: { id: notification.id },
      data: { read: true },
    });
  }

  // --------------------------------------------------------------------------> PATCH api/notification/readAll
  //                                                                             - mark all notifications as read for the authenticated user
  static async markAllAsRead({ user }: { user: { id: string } }) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  }
}

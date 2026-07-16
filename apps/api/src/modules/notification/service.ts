import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import { IdParams } from "../../global/models";
import { NotificationModel } from "./model";

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

  // --------------------------------------------------------------------------> PATCH api/notification/:id/unread
  //                                                                             - mark a single notification as unread
  static async markAsUnread({
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
      data: { read: false },
    });
  }

  // --------------------------------------------------------------------------> DELETE api/notification/:id
  //                                                                             - delete a single notification
  static async deleteNotification({
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

    return prisma.notification.delete({
      where: { id: notification.id },
    });
  }

  // --------------------------------------------------------------------------> DELETE api/notification/read
  //                                                                             - delete all read notifications for the authenticated user
  static async deleteAllRead({ user }: { user: { id: string } }) {
    await prisma.notification.deleteMany({
      where: { userId: user.id, read: true },
    });
  }

  // --------------------------------------------------------------------------> PATCH api/notification
  //                                                                             - add a new notification for the authenticated user
  static async addNotification({
    user,
    body,
  }: {
    user: { id: string };
    body: (typeof NotificationModel.AddNotification)["static"];
  }) {
    return prisma.notification.create({
      data: {
        ...body,
        userId: user.id,
      },
    });
  }
}

import { NotificationType, prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { IdParams } from "../../global/models";
import { NotificationModel } from "./model";

const logger = createLogger("api:notification");

const MAX_GROUP_MEMBERS = 16;

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

  // --------------------------------------------------------------------------> PATCH api/notification/:id/accept
  //                                                                             - accept a group invite notification, joining the group
  static async acceptGroupInvite({
    user,
    params,
  }: {
    user: { id: string };
    params: (typeof IdParams)["static"];
  }) {
    const notification = await prisma.notification.findFirst({
      where: { id: params.id, userId: user.id, type: NotificationType.GROUP_INVITE },
    });

    if (!notification || !notification.groupId) {
      throw new Error("Einladung nicht gefunden");
    }

    const group = await prisma.group.findUnique({
      where: { id: notification.groupId },
      include: { members: { select: { id: true } } },
    });

    if (!group) {
      await prisma.notification.delete({ where: { id: notification.id } });
      throw new Error("Gruppe existiert nicht mehr");
    }

    const alreadyMember = group.members.some((member) => member.id === user.id);

    if (!alreadyMember && group.members.length >= MAX_GROUP_MEMBERS) {
      throw new Error("Die Gruppe hat die maximale Mitgliederzahl erreicht");
    }

    const [updatedGroup] = await prisma.$transaction([
      prisma.group.update({
        where: { id: group.id },
        data: { members: { connect: { id: user.id } } },
      }),
      prisma.notification.delete({ where: { id: notification.id } }),
    ]);

    return updatedGroup;
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

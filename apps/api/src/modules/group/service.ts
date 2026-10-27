import { S3Manager } from "@repo/bucket";
import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";
import type { QueueManager } from "@repo/queue";

import { IdParams } from "../../global/models";
import { GroupModel } from "./model";

const logger = createLogger("api:group");

const MAX_GROUP_MEMBERS = 16;

export abstract class GroupService {
  // --------------------------------------------------------------------------> GET api/group
  //                                                                             - get all groups for user from the database
  //                                                                             - favoriteGroupId falls back to the oldest group if none is set
  static async getAllGroupsForUser({ user }: { user: { id: string } }) {
    logger.info("fetching all groups for user from the database");

    const [groups, dbUser] = await Promise.all([
      prisma.group.findMany({
        where: {
          members: {
            some: { id: user.id },
          },
        },
        include: {
          leader: {
            select: { id: true, name: true, image: true },
          },
          members: {
            select: {
              id: true,
              name: true,
              image: true,
              rank: { select: { points: true } },
              tips: { select: { result: true } },
            },
          },
          files: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { favoriteGroupId: true },
      }),
    ]);

    const favoriteGroupId =
      groups.find((group) => group.id === dbUser?.favoriteGroupId)?.id ??
      groups[0]?.id ??
      null;

    return {
      group: groups.map((group) => ({
        ...group,
        members: group.members.map(({ tips, ...member }) => ({
          ...member,
          tipCount: tips.length,
          correctTipCount: tips.filter((tip) => (tip.result ?? 0) > 0).length,
        })),
      })),
      favoriteGroupId,
    };
  }

  // --------------------------------------------------------------------------> PATCH api/group/favorite
  //                                                                             - mark a group as favorite, user must be a member
  static async setFavoriteGroup({
    user,
    body,
  }: {
    user: { id: string };
    body: (typeof GroupModel.SetFavoriteGroup)["static"];
  }) {
    logger.info("setting favorite group " + body.groupId + " for " + user.id);

    const group = await prisma.group.findFirst({
      where: { id: body.groupId, members: { some: { id: user.id } } },
      select: { id: true },
    });

    if (!group) {
      throw new Error("Gruppe nicht gefunden");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { favoriteGroupId: group.id },
    });
  }

  // --------------------------------------------------------------------------> GET api/group/:id
  //                                                                             - get group by their id
  static async getGroupById({
    params,
  }: {
    params: (typeof IdParams)["static"];
  }) {
    logger.info("fetching group by group id: " + params.id);
    const group = await prisma.group.findUnique({
      where: {
        id: params.id,
      },
      include: {
        leader: {
          select: { id: true, name: true, image: true },
        },
        members: {
          select: {
            id: true,
            name: true,
            image: true,
            rank: { select: { points: true } },
          },
        },
      },
    });
    return group;
  }

  // --------------------------------------------------------------------------> POST api/group
  //                                                                             - create a new group by a user
  static async createNewGroup({
    user,
    body,
  }: {
    user: { id: string };
    body: (typeof GroupModel.CreateNewGroup)["static"];
  }) {
    logger.info("creating a new group");

    return await prisma.group.create({
      data: {
        name: body.name,
        description: body.description,
        leader: {
          connect: { id: user.id },
        },
        members: {
          connect: { id: user.id },
        },
        ...(body.fileId && {
          files: {
            connect: { id: body.fileId },
          },
        }),
      },
    });
  }

  // --------------------------------------------------------------------------> PATCH api/group/leaveGroup
  //                                                                             - leave a group, deleting it if it becomes empty
  static async leaveGroup({
    user,
    body,
    s3Manager,
  }: {
    user: { id: string };
    body: (typeof GroupModel.LeaveGroup)["static"];
    s3Manager: S3Manager;
  }) {
    logger.info("leaving a group");

    const group = await prisma.group.update({
      where: { id: body.groupId },
      data: {
        members: {
          disconnect: { id: user.id },
        },
      },
      include: {
        members: { select: { id: true } },
        files: { select: { id: true, s3Key: true } },
      },
    });

    if (group.members.length === 0) {
      await prisma.group.delete({ where: { id: group.id } });

      await Promise.all(
        group.files.map(async (file) => {
          await prisma.file.delete({ where: { id: file.id } });
          await s3Manager.deleteFile(file.s3Key);
        }),
      );

      return null;
    }

    return group;
  }

  // --------------------------------------------------------------------------> PATCH api/group/editGroup
  //                                                                             - edit name, description and picture of a group (leader only)
  //                                                                             - fileId: undefined = keep, null = remove, string = replace
  static async editGroup({
    user,
    body,
    s3Manager,
  }: {
    user: { id: string };
    body: (typeof GroupModel.EditGroup)["static"];
    s3Manager: S3Manager;
  }) {
    logger.info("editing group " + body.groupId);

    const group = await prisma.group.findUnique({
      where: { id: body.groupId },
      include: { files: { select: { id: true, s3Key: true } } },
    });

    if (!group) {
      throw new Error("Gruppe nicht gefunden");
    }

    if (group.leaderId !== user.id) {
      throw new Error("Nur der Gruppenleiter kann die Gruppe bearbeiten");
    }

    if (body.fileId) {
      const file = await prisma.file.findUnique({
        where: { id: body.fileId },
        select: { userId: true },
      });

      if (!file || file.userId !== user.id) {
        throw new Error("Bild nicht gefunden");
      }
    }

    const updatedGroup = await prisma.group.update({
      where: { id: body.groupId },
      data: {
        name: body.name,
        description: body.description,
        ...(body.fileId !== undefined && {
          files: {
            set: body.fileId ? [{ id: body.fileId }] : [],
          },
        }),
      },
    });

    if (body.fileId !== undefined) {
      const replacedFiles = group.files.filter(
        (file) => file.id !== body.fileId,
      );

      await Promise.all(
        replacedFiles.map(async (file) => {
          await prisma.file.delete({ where: { id: file.id } });
          await s3Manager.deleteFile(file.s3Key);
        }),
      );
    }

    return updatedGroup;
  }

  // --------------------------------------------------------------------------> POST api/group/:id/invite
  //                                                                             - invite a player to the group by their id (leader only)
  //                                                                             - the invite notification itself is created asynchronously
  //                                                                             - by the worker once it consumes the queued event
  static async inviteToGroup({
    user,
    params,
    body,
    queueManager,
  }: {
    user: { id: string };
    params: (typeof IdParams)["static"];
    body: (typeof GroupModel.InviteToGroup)["static"];
    queueManager: QueueManager;
  }) {
    logger.info("inviting player " + body.playerId + " to group " + params.id);

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: { select: { id: true } },
      },
    });

    if (!group) {
      throw new Error("Gruppe nicht gefunden");
    }

    if (group.leaderId !== user.id) {
      throw new Error("Nur der Gruppenleiter kann Spieler einladen");
    }

    if (body.playerId === user.id) {
      throw new Error("Du kannst dich nicht selbst einladen");
    }

    if (group.members.some((member) => member.id === body.playerId)) {
      throw new Error("Spieler ist bereits Mitglied der Gruppe");
    }

    if (group.members.length >= MAX_GROUP_MEMBERS) {
      throw new Error("Die Gruppe hat die maximale Mitgliederzahl erreicht");
    }

    const invitedPlayer = await prisma.user.findUnique({
      where: { id: body.playerId },
      select: { id: true },
    });

    if (!invitedPlayer) {
      throw new Error("Spieler nicht gefunden");
    }

    await queueManager.produce({
      topic: "groups",
      payload: {
        eventType: "group_invited",
        groupId: group.id,
        targetId: body.playerId,
        executorId: user.id,
      },
    });
  }
}

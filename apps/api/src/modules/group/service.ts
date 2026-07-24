import { prisma } from "@repo/database";
import { S3Manager } from "@repo/bucket";
import { createLogger } from "@repo/logger";
import { GroupModel } from "./model";
import { IdParams } from "src/global/models";

const logger = createLogger("api:group");

export abstract class GroupService {
  // --------------------------------------------------------------------------> GET api/group
  //                                                                             - get all groups for user from the database
  static async getAllGroupsForUser({ user }: { user: { id: string } }) {
    logger.info("fetching all groups for user from the database");

    return await prisma.group.findMany({
      where: {
        user: {
          some: { id: user.id },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            rank: { select: { points: true, position: true } },
          },
        },
        files: {
          select: { id: true },
        },
      },
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
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            rank: { select: { points: true, position: true } },
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
        user: {
          connect: {
            id: user.id,
          },
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
        user: {
          disconnect: { id: user.id },
        },
      },
      include: {
        user: { select: { id: true } },
        files: { select: { id: true, s3Key: true } },
      },
    });

    if (group.user.length === 0) {
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
}

import { S3Manager } from "@repo/bucket";
import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { MediaModel } from "./model";

const logger = createLogger("MediaService");

export abstract class MediaService {
  static extractFileIdFromImageUrl(imageUrl: string) {
    try {
      const pathname = new URL(imageUrl).pathname;
      const match = pathname.match(/\/media\/([^/]+)\/image$/);

      return match?.[1];
    } catch {
      return undefined;
    }
  }

  static async generateSignedURL({
    body,
    s3Key,
    s3Manager,
  }: {
    body: MediaModel["UploadMediaBody"];
    s3Key: string;
    s3Manager: S3Manager;
  }) {
    const { mimetype } = body;

    return await s3Manager.generateUploadURL({
      key: s3Key,
      mimeType: mimetype,
    });
  }

  static async catalogMediaToDb({
    body,
    s3Key,
    userId,
  }: {
    body: MediaModel["UploadMediaBody"];
    s3Key: string;
    userId: string;
  }) {
    const { filename, mimetype, size } = body;

    logger.info(
      `Cataloging media to DB for user ${userId} with filename ${filename}`,
    );
    return await prisma.file.create({
      data: {
        filename,
        mimetype,
        size,
        s3Key,
        user: {
          connect: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        filename: true,
        mimetype: true,
        size: true,
        s3Key: true,
        user: { select: { id: true } },
      },
    });
  }

  static async deleteMediaFromDb({ id }: { id: string }) {
    try {
      logger.info(`Deleting media from DB with id ${id}`);
      const file = await prisma.file.delete({
        where: {
          id: id,
        },
        select: {
          s3Key: true,
        },
      });
      return file;
    } catch (err) {
      logger.error("Error deleting media from DB:", err);
    }
    return { s3Key: undefined };
  }

  static async deleteMediaByImageUrl({ imageUrl }: { imageUrl: string }) {
    const fileId = this.extractFileIdFromImageUrl(imageUrl);

    if (!fileId) {
      return { s3Key: undefined };
    }

    logger.info(`Deleting media from DB with id ${fileId} (from image URL)`);
    return await this.deleteMediaFromDb({ id: fileId });
  }

  static async generateDownloadURL({
    s3Key,
    s3Manager,
  }: {
    s3Key: string;
    s3Manager: S3Manager;
  }) {
    return await s3Manager.generateDownloadURL({ key: s3Key });
  }

  static async fetchFiles({ userId }: { userId: string }) {
    logger.info(`Fetching files for user ${userId}`);
    const files = await prisma.file.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        filename: true,
        mimetype: true,
        size: true,
        s3Key: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return files.map((f) => ({
      ...f,
    }));
  }
}

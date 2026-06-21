import { S3Manager } from "@repo/bucket";
import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

const logger = createLogger("S3Service");

export abstract class S3Service {
  private static isCleaning = false;

  static async cleanup({ s3Manager }: { s3Manager: S3Manager }) {
    if (this.isCleaning) {
      logger.info("Cleanup already in progress, skipping this run.");
      return;
    }

    this.isCleaning = true;

    await Promise.all([
      this.cleanupDb({ s3Manager }),
      this.cleanupS3({ s3Manager }),
    ]);

    this.isCleaning = false;
  }

  private static async cleanupS3({ s3Manager }: { s3Manager: S3Manager }) {
    logger.info("Starting S3-cleanup...");
    let token: string | undefined;
    const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);

    try {
      do {
        const response = await s3Manager.listAllObjects(token);
        const { Contents, NextContinuationToken } = response;
        token = NextContinuationToken;

        if (!Contents?.length) continue;

        const s3Keys = Contents.filter(
          (obj) => obj.LastModified && obj.LastModified < ONE_HOUR_AGO,
        )
          .map((obj) => obj.Key)
          .filter((k): k is string => !!k);

        if (s3Keys.length === 0) continue;

        const toDelete = await this.identifyUnusedKeys(s3Keys);

        if (toDelete.length > 0) {
          logger.info(`Deleting ${toDelete.length} unused files from S3...`);
          const deleteResponse = await s3Manager.deleteManyFiles(toDelete);

          if (deleteResponse?.Errors?.length) {
            logger.error(
              "Errors occurred during S3 deletion:",
              deleteResponse.Errors,
            );
          }
        }
      } while (token);

      logger.info("S3 Cleanup done");
    } catch (error) {
      logger.error("CleanupS3 Job failed:", error);
    }
  }

  private static async identifyUnusedKeys(keys: string[]) {
    const existingKeys = new Set<string>();
    const chunkSize = 300;

    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize);

      const dbFiles = await prisma.file.findMany({
        where: { s3Key: { in: chunk } },
        select: { s3Key: true },
      });

      dbFiles.forEach((file) => existingKeys.add(file.s3Key));
    }

    return keys.filter((key) => !existingKeys.has(key));
  }

  private static async cleanupDb({ s3Manager }: { s3Manager: S3Manager }) {
    logger.info("Starting DB-cleanup...");

    const chunkSize = 300;
    let lastId: string | undefined = undefined;
    let totalDeleted = 0;
    type SelectedFile = { id: string; s3Key: string };

    try {
      while (true) {
        const dbFileEntries = (await prisma.file.findMany({
          take: chunkSize,
          ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
          orderBy: { id: "asc" },
          select: { id: true, s3Key: true },
        })) as SelectedFile[];

        if (dbFileEntries.length === 0) {
          break;
        }

        lastId = dbFileEntries[dbFileEntries.length - 1]!.id;

        const checkResults = await Promise.all(
          dbFileEntries.map(async (file) => {
            const exists = await s3Manager.fileExists(file.s3Key);
            return !exists ? file.id : null;
          }),
        );

        const toDeleteIds = checkResults.filter(
          (id): id is string => id !== null,
        );

        if (toDeleteIds.length > 0) {
          logger.info(`Deleting ${toDeleteIds.length} unused Ids...`);

          await prisma.file.deleteMany({
            where: { id: { in: toDeleteIds } },
          });

          totalDeleted += toDeleteIds.length;
        }
      }

      logger.info(`Db Cleanup done. Total entries deleted: ${totalDeleted}`);
    } catch (error) {
      logger.error("CleanupDb Job failed:", error);
    }
  }
}

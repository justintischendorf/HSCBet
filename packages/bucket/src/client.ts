import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createLogger } from "@repo/logger";

const logger = createLogger("S3Manager");

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT as string;
const MINIO_PUBLIC_ENDPOINT =
  process.env.MINIO_PUBLIC_ENDPOINT || MINIO_ENDPOINT;
const MINIO_REGION = process.env.MINIO_REGION || "us-east-1";
const MINIO_ROOT_USER = process.env.MINIO_ROOT_USER as string;
const MINIO_ROOT_PASSWORD = process.env.MINIO_ROOT_PASSWORD as string;
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME as string;
const MINIO_S3_PRESIGNED_URL_EXPIRATION_TIME = process.env
  .MINIO_S3_PRESIGNED_URL_EXPIRATION_TIME as string;

if (
  !MINIO_ENDPOINT ||
  !MINIO_ROOT_USER ||
  !MINIO_ROOT_PASSWORD ||
  !MINIO_BUCKET_NAME ||
  !MINIO_S3_PRESIGNED_URL_EXPIRATION_TIME
) {
  throw new Error(
    "Missing required S3/MinIO environment variables: MINIO_ENDPOINT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD, MINIO_BUCKET_NAME, MINIO_S3_PRESIGNED_URL_EXPIRATION_TIME",
  );
}

export class S3Manager {
  private s3Client: S3Client;
  private publicS3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: MINIO_ENDPOINT,
      region: MINIO_REGION,
      credentials: {
        accessKeyId: MINIO_ROOT_USER,
        secretAccessKey: MINIO_ROOT_PASSWORD,
      },
      forcePathStyle: true,
    });

    this.publicS3Client = new S3Client({
      endpoint: MINIO_PUBLIC_ENDPOINT,
      region: MINIO_REGION,
      credentials: {
        accessKeyId: MINIO_ROOT_USER,
        secretAccessKey: MINIO_ROOT_PASSWORD,
      },
      forcePathStyle: true,
    });
  }

  async generateUploadURL({
    key,
    mimeType,
  }: {
    key: string;
    mimeType: string;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: MINIO_BUCKET_NAME,
      Key: key,
      ContentType: mimeType,
    });

    return await getSignedUrl(this.publicS3Client, command, {
      expiresIn: Number(MINIO_S3_PRESIGNED_URL_EXPIRATION_TIME),
    });
  }

  async generateDownloadURL({ key }: { key: string }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: MINIO_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(this.publicS3Client, command, {
      expiresIn: Number(MINIO_S3_PRESIGNED_URL_EXPIRATION_TIME),
    });
  }

  async deleteFile(fileKey: string) {
    const params = {
      Bucket: MINIO_BUCKET_NAME,
      Key: fileKey,
    };

    try {
      const data = await this.s3Client.send(new DeleteObjectCommand(params));
      logger.info(`Datei ${fileKey} erfolgreich gelöscht:`, data);
    } catch (err) {
      logger.error(`Fehler beim Löschen der Datei ${fileKey}:`, err);
      throw err;
    }
  }

  async listAllObjects(token?: string) {
    return this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: MINIO_BUCKET_NAME,
        ContinuationToken: token,
      }),
    );
  }

  async deleteManyFiles(keys: string[]) {
    return this.s3Client.send(
      new DeleteObjectsCommand({
        Bucket: MINIO_BUCKET_NAME,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    );
  }

  async fileExists(key: string) {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: MINIO_BUCKET_NAME,
          Key: key,
        }),
      );
      return true;
    } catch (error: any) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }
}

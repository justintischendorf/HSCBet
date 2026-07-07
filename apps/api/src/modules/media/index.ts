import Elysia, { t } from "elysia";
import { prisma } from "@repo/database";
import { sessionPlugin } from "../auth";
import { IdParams } from "../../global/models";
import { MediaModel } from "./model";
import { MediaService } from "./service";
import { WebAppStore } from "src/context";

export const media = new Elysia({ prefix: "/media" })
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> POST api/media/upload/get-presigned-url
  //                                                                             - get a presigned URL for uploading media to S3 and catalog the media in the database
  .post(
    "/upload/get-presigned-url",
    async ({ body, store, user }) => {
      const { s3Manager } = store as WebAppStore;

      const userId = user.id;
      const s3Key = `uploads/${userId}/${Date.now()}-${body.filename.replace(/\s/g, "_")}`;
      const pre_signed_url = await MediaService.generateSignedURL({
        body,
        s3Key,
        s3Manager,
      });
      const file = await MediaService.catalogMediaToDb({
        body,
        s3Key,
        userId,
      });
      return {
        success: true,
        pre_signed_url,
        file_id: file.id,
        s3Key: file.s3Key,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
      };
    },
    {
      body: MediaModel.UploadMediaBody,
    },
  )

  // --------------------------------------------------------------------------> GET api/media
  //                                                                             - get all media files for the authenticated user
  .get("/", async ({ user }) => {
    return {
      success: true,
      files: await MediaService.fetchFiles({
        userId: user.id,
      }),
    };
  })

  // --------------------------------------------------------------------------> DELETE api/media/:id
  //                                                                             - delete a media file by its ID from the database and S3
  .delete(
    "/:id",
    async ({ params: { id }, store, set }) => {
      const { s3Manager } = store as WebAppStore;
      const { s3Key } = await MediaService.deleteMediaFromDb({ id });

      if (s3Key) {
        await s3Manager.deleteFile(s3Key);
      }

      set.status = 204;
    },
    {
      params: IdParams,
      response: {
        204: t.Void(),
      },
    },
  )

  // --------------------------------------------------------------------------> DELETE api/media/by-url
  //                                                                             - delete a media file by its URL from the database and S3
  .delete(
    "/by-url",
    async ({ body, store, set }) => {
      const { s3Manager } = store as WebAppStore;
      const { s3Key } = await MediaService.deleteMediaByImageUrl({
        imageUrl: body.imageUrl,
      });

      if (s3Key) {
        await s3Manager.deleteFile(s3Key);
      }

      set.status = 204;
    },
    {
      body: MediaModel.DeleteMediaByUrlBody,
      response: {
        204: t.Void(),
      },
    },
  )

  // --------------------------------------------------------------------------> GET api/media/:id/download-url
  //
  .get(
    "/:id/download-url",
    async ({ params: { id }, store }) => {
      const { s3Manager } = store as WebAppStore;
      const file = await prisma.file.findUniqueOrThrow({
        where: { id },
        select: { s3Key: true },
      });
      const url = await MediaService.generateDownloadURL({
        s3Key: file.s3Key,
        s3Manager,
      });
      return { url };
    },
    { params: IdParams },
  );

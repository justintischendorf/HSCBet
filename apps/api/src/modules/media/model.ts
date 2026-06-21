import { MimeType } from "@repo/database";
import { t, UnwrapSchema } from "elysia";

export namespace MediaModel {
  export const UploadMediaBody = t.Object({
    filename: t.String(),
    mimetype: t.Enum(MimeType),
    size: t.Numeric(),
  });

  export const DeleteMediaByUrlBody = t.Object({
    imageUrl: t.String(),
  });
}
export type MediaModel = {
  [k in keyof typeof MediaModel]: UnwrapSchema<(typeof MediaModel)[k]>;
};

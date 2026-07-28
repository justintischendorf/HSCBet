import { t, type UnwrapSchema } from "elysia";

export namespace NotificationModel {
  export const AddNotification = t.Object({
    message: t.String(),
  });
}

export type NotificationModel = {
  [k in keyof typeof NotificationModel]: UnwrapSchema<
    (typeof NotificationModel)[k]
  >;
};

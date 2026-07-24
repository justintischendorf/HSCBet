import Elysia from "elysia";

import { IdParams } from "../../global/models";
import { sessionPlugin } from "../auth";
import { NotificationModel } from "./model";
import { NotificationService } from "./service";

export const notification = new Elysia({ prefix: "/notification" })
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> GET api/notification
  //                                                                             - get all notifications for the authenticated user
  .get("/", async ({ set, user }) => {
    set.status = 200;
    return {
      success: true,
      notification: await NotificationService.getNotificationsForUser({
        user,
      }),
    };
  })

  // --------------------------------------------------------------------------> PATCH api/notification/readAll
  //                                                                             - mark all notifications as read
  .patch("/readAll", async ({ set, user }) => {
    await NotificationService.markAllAsRead({ user });
    set.status = 200;
    return { success: true };
  })

  // --------------------------------------------------------------------------> PATCH api/notification/:id/read
  //                                                                             - mark a single notification as read
  .patch(
    "/:id/read",
    async ({ set, user, params }) => {
      set.status = 200;
      return {
        success: true,
        notification: await NotificationService.markAsRead({ user, params }),
      };
    },
    {
      params: IdParams,
    },
  )

  // --------------------------------------------------------------------------> PATCH api/notification/:id/unread
  //                                                                             - mark a single notification as unread
  .patch(
    "/:id/unread",
    async ({ set, user, params }) => {
      set.status = 200;
      return {
        success: true,
        notification: await NotificationService.markAsUnread({
          user,
          params,
        }),
      };
    },
    {
      params: IdParams,
    },
  )

  // --------------------------------------------------------------------------> DELETE api/notification/read
  //                                                                             - delete all read notifications
  .delete("/read", async ({ set, user }) => {
    await NotificationService.deleteAllRead({ user });
    set.status = 200;
    return { success: true };
  })

  // --------------------------------------------------------------------------> DELETE api/notification/:id
  //                                                                             - delete a single notification
  .delete(
    "/:id",
    async ({ set, user, params }) => {
      set.status = 200;
      return {
        success: true,
        notification: await NotificationService.deleteNotification({
          user,
          params,
        }),
      };
    },
    {
      params: IdParams,
    },
  )

  // --------------------------------------------------------------------------> POST api/notification
  //                                                                             - add a new notification for the authenticated user
  .post(
    "/",
    async ({ set, user, body }) => {
      set.status = 200;
      return {
        success: true,
        notification: await NotificationService.addNotification({ user, body }),
      };
    },
    {
      body: NotificationModel.AddNotification,
    },
  );

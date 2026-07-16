import Elysia from "elysia";
import { sessionPlugin } from "../auth";
import { NotificationService } from "./service";
import { IdParams } from "../../global/models";

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
  );

import Elysia, { t } from "elysia";
import { auth } from "@repo/auth";
import { MailService } from "./service";
import { MailModel } from "./model";

export const mail = new Elysia({ prefix: "/mail" })
  // --------------------------------------------------------------------------> GET api/mail/forgot-password
  //                                                                             - send forgot password email
  .post(
    "/forgot-password",
    async ({ set, body }) => {
      set.status = 200;
      return {
        success: true,
        message: await MailService.sendForgotPasswordMail({ body }),
      };
    },
    {
      body: MailModel.SendForgotPasswordMail,
    },
  )

  // --------------------------------------------------------------------------> POST api/mail/verify-mail
  //                                                                             - send email verification mail
  .post(
    "/verify-mail",
    async ({ set, body, request }) => {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session) {
        set.status = 401;
        return { success: false, error: "UNAUTHORIZED" };
      }

      set.status = 200;
      return {
        success: true,
        message: await MailService.sendVerifyMail({
          body,
          user: session.user,
        }),
      };
    },
    {
      body: MailModel.SendVerifyMail,
    },
  );

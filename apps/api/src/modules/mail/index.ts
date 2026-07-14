import Elysia, { t } from "elysia";
import { MailService } from "./service";
import { MailModel } from "./model";

export const mail = new Elysia({ prefix: "/mail" })
  // --------------------------------------------------------------------------> GET api/mail
  //                                                                             - send forgot password email
  .post(
    "/",
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
  );

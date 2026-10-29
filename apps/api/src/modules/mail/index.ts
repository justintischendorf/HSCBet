import Elysia from "elysia";

import { MailModel } from "./model";
import { MailService } from "./service";

export const mail = new Elysia({ prefix: "/mail" })
  // --------------------------------------------------------------------------> POST api/mail/signup-review
  //                                                                             - approve or reject signup (token from admin review mail)
  .post(
    "/signup-review",
    async ({ set, body }) => {
      const result = await MailService.reviewSignup({ body });
      set.status = result.success ? 200 : 400;
      return result;
    },
    {
      body: MailModel.ReviewSignup,
    },
  );

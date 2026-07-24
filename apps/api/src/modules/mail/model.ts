import { t, type UnwrapSchema } from "elysia";

export namespace MailModel {
  export const SendForgotPasswordMail = t.Object({
    email: t.String(),
    subject: t.String(),
    html: t.String(),
  });

  export const SendVerifyMail = t.Object({
    email: t.String(),
    subject: t.String(),
    html: t.String(),
  });
}

export type MailModel = {
  [k in keyof typeof MailModel]: UnwrapSchema<(typeof MailModel)[k]>;
};

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

  export const SendSignupReviewMail = t.Object({
    userId: t.String(),
    name: t.String(),
    email: t.String(),
  });

  export const ReviewSignup = t.Object({
    token: t.String(),
    action: t.Union([t.Literal("approve"), t.Literal("reject")]),
  });
}

export type MailModel = {
  [k in keyof typeof MailModel]: UnwrapSchema<(typeof MailModel)[k]>;
};

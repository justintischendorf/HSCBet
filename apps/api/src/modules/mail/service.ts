import { Resend } from "resend";

import { createLogger } from "@repo/logger";

import { MailModel } from "./model";

const logger = createLogger("api:mail");

let resend: Resend | undefined;
function getResendClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export abstract class MailService {
  // --------------------------------------------------------------------------> GET api/mail
  //                                                                             - send forgot password email
  static async sendForgotPasswordMail({
    body,
  }: {
    body: (typeof MailModel.SendForgotPasswordMail)["static"];
  }) {
    const { error, data } = await getResendClient().emails.send({
      from: process.env.RESEND_MAIL_ADDRESS as string,
      to: body.email,
      subject: body.subject,
      html: body.html,
    });

    if (error) {
      logger.error("error sending forgot password email", error);
      return error;
    }

    logger.info("forgot password email sent", data);
    return data;
  }

  // --------------------------------------------------------------------------> POST api/mail/verify-mail
  //                                                                             - send email verification mail
  static async sendVerifyMail({
    body,
    user,
  }: {
    body: (typeof MailModel.SendVerifyMail)["static"];
    user: { id: string };
  }) {
    logger.info("sending verification email for user: " + user.id);

    const { error, data } = await getResendClient().emails.send({
      from: process.env.RESEND_MAIL_ADDRESS as string,
      to: body.email,
      subject: body.subject,
      html: body.html,
    });

    if (error) {
      logger.error("error sending verify email", error);
      return error;
    }

    logger.info("verify email sent", data);
    return data;
  }
}

import { createLogger } from "@repo/logger";
import { Resend } from "resend";
import { MailModel } from "./model";

// const resend = new Resend(process.env.RESEND_API_KEY);
const logger = createLogger("api:mail");

export abstract class MailService {
  // --------------------------------------------------------------------------> GET api/mail
  //                                                                             - send forgot password email
  static async sendForgotPasswordMail({
    body,
  }: {
    body: (typeof MailModel.SendForgotPasswordMail)["static"];
  }) {
    const { error, data } = await resend.emails.send({
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
}

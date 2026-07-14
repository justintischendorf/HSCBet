import { createLogger } from "@repo/logger";
import { sendMail } from "@repo/auth/mail";
import { MailModel } from "./model";

const logger = createLogger("api:mail");

export abstract class MailService {
  // --------------------------------------------------------------------------> GET api/mail
  //                                                                             - send forgot password email
  static async sendForgotPasswordMail({
    body,
  }: {
    body: (typeof MailModel.SendForgotPasswordMail)["static"];
  }) {
    const { error, data } = await sendMail({
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

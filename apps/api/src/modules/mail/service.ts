import { signJWT, verifyJWT } from "better-auth/crypto";
import { Resend } from "resend";

import { prisma } from "@repo/database";
import { createLogger } from "@repo/logger";

import { MailModel } from "./model";

const logger = createLogger("api:mail");

const SIGNUP_REVIEW_PURPOSE = "signup-review";
const SIGNUP_REVIEW_EXPIRES_IN = 60 * 60 * 24 * 7;

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

  // --------------------------------------------------------------------------> called by better-auth on signup
  //                                                                             - send signup review mail (approve / reject) to admin
  static async sendSignupReviewMail({
    body,
  }: {
    body: (typeof MailModel.SendSignupReviewMail)["static"];
  }) {
    logger.info("user requests signup: " + body.userId);

    const token = await signJWT(
      { userId: body.userId, purpose: SIGNUP_REVIEW_PURPOSE },
      process.env.BETTER_AUTH_SECRET as string,
      SIGNUP_REVIEW_EXPIRES_IN,
    );
    const reviewUrl = `${process.env.WEB_SERVER_URL}/signup/review?token=${token}`;

    const { error, data } = await getResendClient().emails.send({
      from: process.env.RESEND_MAIL_ADDRESS as string,
      to: process.env.SIGNUP_REVIEW_MAIL_ADDRESS as string,
      subject: "Registrierungsanfrage",
      html: `<p>Neue Registrierungsanfrage bei HSCBet:</p>
<p>Nutzername: <strong>${escapeHtml(body.name)}</strong><br>E-Mail: <strong>${escapeHtml(body.email)}</strong></p>
<p><a href="${reviewUrl}&action=approve">Nutzer zulassen</a></p>
<p><a href="${reviewUrl}&action=reject">Nutzer ablehnen</a></p>`,
    });

    if (error) {
      logger.error("error sending signup review mail", error);
      return error;
    }

    logger.info("signup review email sent", data);
    return data;
  }

  // --------------------------------------------------------------------------> POST api/mail/signup-review
  //                                                                             - approve or reject signup, notify user
  static async reviewSignup({
    body,
  }: {
    body: (typeof MailModel.ReviewSignup)["static"];
  }) {
    const payload = await verifyJWT<{ userId?: string; purpose?: string }>(
      body.token,
      process.env.BETTER_AUTH_SECRET as string,
    );

    if (!payload?.userId || payload.purpose !== SIGNUP_REVIEW_PURPOSE) {
      return { success: false, error: "INVALID_TOKEN" } as const;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return { success: false, error: "NOT_FOUND" } as const;
    }

    if (user.approved) {
      return { success: false, error: "ALREADY_APPROVED" } as const;
    }

    if (body.action === "approve") {
      await prisma.user.update({
        where: { id: user.id },
        data: { approved: true },
      });
      logger.info("signup approved: " + user.id);

      await MailService.sendSignupResultMail({
        email: user.email,
        subject: "Deine Registrierung wurde bestätigt",
        html: `<p>Hallo ${escapeHtml(user.name)},</p>
<p>deine Registrierung bei HSCBet wurde bestätigt. Du kannst dich jetzt anmelden:</p>
<p><a href="${process.env.WEB_SERVER_URL}/signin">Zur Anmeldung</a></p>`,
      });
    } else {
      await prisma.user.delete({ where: { id: user.id } });
      logger.info("signup rejected, deleted user: " + user.id);

      await MailService.sendSignupResultMail({
        email: user.email,
        subject: "Deine Registrierung wurde abgelehnt",
        html: `<p>Hallo ${escapeHtml(user.name)},</p>
<p>deine Registrierung bei HSCBet wurde leider abgelehnt.</p>`,
      });
    }

    return { success: true, action: body.action } as const;
  }

  private static async sendSignupResultMail({
    email,
    subject,
    html,
  }: {
    email: string;
    subject: string;
    html: string;
  }) {
    const { error, data } = await getResendClient().emails.send({
      from: process.env.RESEND_MAIL_ADDRESS as string,
      to: email,
      subject,
      html,
    });

    if (error) {
      logger.error("error sending signup result mail", error);
      return error;
    }

    logger.info("signup result email sent", data);
    return data;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

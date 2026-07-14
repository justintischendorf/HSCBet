import { createLogger } from "@repo/logger";
import { Resend } from "resend";

const logger = createLogger("auth:mail");

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_MAIL_ADDRESS as string,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error("failed to send email", error);
  }

  return { data, error };
}

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database";
import { twoFactor } from "better-auth/plugins/two-factor";
import { emailOTP } from "better-auth/plugins/email-otp";
import { MailService } from "@repo/api/mail";

type OTPType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

const otpEmailSubjects: Record<OTPType, string> = {
  "sign-in": "Dein Anmeldecode",
  "email-verification": "Bestätige deine E-Mail-Adresse",
  "forget-password": "Passwort zurücksetzen",
  "change-email": "Bestätige deine neue E-Mail-Adresse",
};

export const auth = betterAuth({
  appName: "HSCBet",
  plugins: [
    twoFactor(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await MailService.sendForgotPasswordMail({
          body: {
            email,
            subject: otpEmailSubjects[type],
            html: `<p>Dein Bestätigungscode lautet: <strong>${otp}</strong></p><p>Der Code ist 5 Minuten gültig.</p>`,
          },
        });
      },
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.WEB_SERVER_URL!],
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});

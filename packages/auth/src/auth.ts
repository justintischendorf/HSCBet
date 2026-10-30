import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { emailOTP } from "better-auth/plugins/email-otp";
import { twoFactor } from "better-auth/plugins/two-factor";

import { MailService } from "@repo/api/mail";
import { prisma } from "@repo/database";

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

const MAX_USERNAME_LENGTH = 22;

function assertValidUsername(name: unknown) {
  if (typeof name === "string" && name.length > MAX_USERNAME_LENGTH) {
    throw new APIError("BAD_REQUEST", {
      message: `Der Nutzername darf höchstens ${MAX_USERNAME_LENGTH} Zeichen lang sein.`,
    });
  }
}

export const auth = betterAuth({
  appName: "HSCBet",
  plugins: [
    twoFactor(),
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await MailService.sendForgotPasswordMail({
          body: {
            email,
            subject: otpEmailSubjects[type],
            html: `<p>Dein Bestätigungscode lautet: <strong>${otp}</strong></p>`,
          },
        });
      },
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          assertValidUsername(user.name);
        },
        after: async (user) => {
          await prisma.rank.create({
            data: {
              userId: user.id,
              points: 0,
            },
          });

          // new accounts start unapproved, admin decides via review mail
          await MailService.sendSignupReviewMail({
            body: { userId: user.id, name: user.name, email: user.email },
          });
        },
      },
      update: {
        before: async (user) => {
          assertValidUsername(user.name);
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { approved: true },
          });

          if (!user?.approved) {
            throw new APIError("FORBIDDEN", {
              message: "Dein Account wurde noch nicht freigegeben.",
            });
          }
        },
      },
    },
  },
  trustedOrigins: [process.env.WEB_SERVER_URL!],
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await MailService.sendVerifyMail({
        body: {
          email: user.email,
          subject: otpEmailSubjects["email-verification"],
          html: `<p>Klicke auf den folgenden Link, um deine E-Mail-Adresse zu bestätigen:</p><p><a href="${url}">${url}</a></p>`,
        },
        user: { id: user.id },
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await MailService.sendVerifyMail({
          body: {
            email: user.email,
            subject: otpEmailSubjects["change-email"],
            html: `<p>Klicke auf den folgenden Link, um deine neue E-Mail-Adresse (${newEmail}) zu bestätigen:</p><p><a href="${url}">${url}</a></p>`,
          },
          user: { id: user.id },
        });
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    // no session on signup, account has to be approved first
    autoSignIn: false,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database";
import { twoFactor } from "better-auth/plugins/two-factor";

export const auth = betterAuth({
  appName: "HSCBet",
  plugins: [twoFactor()],
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

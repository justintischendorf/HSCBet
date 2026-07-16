import { twoFactorClient } from "better-auth/plugins/two-factor";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authBaseURL = process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim();
if (!authBaseURL) {
  throw new Error(
    "Missing NEXT_PUBLIC_AUTH_BASE_URL. Configure the auth API base URL for the mobile app.",
  );
}

export const authClient = createAuthClient({
  plugins: [twoFactorClient(), emailOTPClient()],
  baseURL: authBaseURL.replace(/\/+$/, ""),
});

export const { signIn, signUp, useSession, signOut, deleteUser, verifyEmail } =
  authClient;

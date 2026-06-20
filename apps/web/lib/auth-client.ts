import { twoFactorClient } from "better-auth/plugins/two-factor";
import { createAuthClient } from "better-auth/react";

const authBaseURL = process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim();
if (!authBaseURL) {
  throw new Error(
    "Missing NEXT_PUBLIC_AUTH_BASE_URL. Configure the auth API base URL for the mobile app.",
  );
}

export const authClient = createAuthClient({
  plugins: [twoFactorClient()],
  baseURL: authBaseURL.replace(/\/+$/, ""),
});

export const { signIn, signUp, useSession, signOut, deleteUser } = authClient;

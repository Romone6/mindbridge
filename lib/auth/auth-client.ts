import { createAuthClient } from "better-auth/react";
import { magicLinkClient, twoFactorClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: (() => {
    const configured =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (configured) return configured;
    return process.env.NODE_ENV === "production"
      ? "https://www.mindbridge.health"
      : "http://localhost:3000";
  })(),
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/two-factor";
      },
    }),
    magicLinkClient(),
    passkeyClient(),
  ],
});

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink, twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { Pool } from "pg";

const authBaseUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const rpId = authBaseUrl ? new URL(authBaseUrl).hostname : "localhost";

const databaseUrl =
  process.env.BETTER_AUTH_DATABASE_URL || process.env.DATABASE_URL;

const database = databaseUrl ? new Pool({ connectionString: databaseUrl }) : undefined;

if (!database) {
  console.warn(
    "Better Auth database not configured. Set BETTER_AUTH_DATABASE_URL to enable persistent sessions, 2FA, and passkeys."
  );
}

export const auth = betterAuth({
  appName: "MindBridge",
  baseURL: authBaseUrl,
  database,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      // TODO: Replace with your email provider (SendGrid, Resend, SES)
      console.info(`Password reset email for ${user.email}: ${url}`);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      // TODO: Replace with your email provider (SendGrid, Resend, SES)
      console.info(
        `Verification email for ${user.email}: ${url}`
      );
    },
  },
  plugins: [
    twoFactor({ issuer: "MindBridge" }),
    magicLink({
      sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
        // TODO: Replace with your email provider (SendGrid, Resend, SES)
        console.info(`Magic link for ${email}: ${url}`);
      },
    }),
    passkey({
      rpID: rpId,
      rpName: "MindBridge",
      origin: authBaseUrl || "http://localhost:3000",
    }),
    nextCookies(),
  ],
});

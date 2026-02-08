import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink, twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { Pool } from "pg";
import { Resend } from "resend";

function inferBaseUrlFromVercelEnv() {
  const v = process.env.VERCEL_URL;
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

const authBaseUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  inferBaseUrlFromVercelEnv() ||
  (process.env.NODE_ENV === "production"
    ? "https://www.mindbridge.health"
    : "http://localhost:3000");

const rpId = authBaseUrl ? new URL(authBaseUrl).hostname : "localhost";

const databaseUrl =
  process.env.BETTER_AUTH_DATABASE_URL || process.env.DATABASE_URL;

const database = databaseUrl ? new Pool({ connectionString: databaseUrl }) : undefined;

if (!database) {
  console.warn(
    "Better Auth database not configured. Set BETTER_AUTH_DATABASE_URL to enable persistent sessions, 2FA, and passkeys."
  );
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) return null;
  const fromName = process.env.RESEND_FROM_NAME || "MindBridge";
  return `${fromName} <${fromEmail}>`;
}

function redactUrlForLog(url: string) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "<redacted>";
  }
}

async function sendAuthEmail({
  to,
  subject,
  intro,
  url,
}: {
  to: string;
  subject: string;
  intro: string;
  url: string;
}) {
  const resend = getResendClient();
  const from = getFromAddress();
  if (!resend || !from) {
    const message =
      "Auth email provider not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.";

    // In production, failing silently breaks auth flows with no operator signal.
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }

    // In development, log a safe version of the URL (no query params/tokens).
    console.info(
      `[AuthEmail:dev] ${subject} for ${to}: ${redactUrlForLog(url)}`
    );
    return;
  }

  const html = `
<!doctype html>
<html>
  <body style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5; color: #0f172a;">
    <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">${subject}</h1>
      <p style="margin: 0 0 16px;">${intro}</p>
      <p style="margin: 0 0 16px;">
        <a href="${url}" style="display: inline-block; padding: 10px 14px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px;">Continue</a>
      </p>
      <p style="margin: 0; font-size: 12px; color: #475569;">If the button doesn't work, paste this link into your browser:</p>
      <p style="margin: 6px 0 0; font-size: 12px; word-break: break-all; color: #475569;">${url}</p>
    </div>
  </body>
</html>
  `.trim();

  const text = `${subject}

${intro}

${url}
`;

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(error.message || "Unknown Resend error");
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to send auth email: ${reason}`);
  }
}

export const auth = betterAuth({
  appName: "MindBridge",
  baseURL: authBaseUrl,
  database,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your MindBridge password",
        intro: "Use the link below to reset your password.",
        url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Verify your MindBridge email",
        intro: "Use the link below to verify your email address.",
        url,
      });
    },
  },
  plugins: [
    twoFactor({ issuer: "MindBridge" }),
    magicLink({
      sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
        await sendAuthEmail({
          to: email,
          subject: "Your MindBridge sign-in link",
          intro: "Use the link below to sign in to the clinician portal.",
          url,
        });
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

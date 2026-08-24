import { Pool } from "pg";
import { getMigrations } from "better-auth/db";
import { magicLink, twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "@better-auth/passkey";
import fs from "node:fs";

function readEnvValue(fileContents: string, key: string) {
  const line = fileContents
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${key}=`));
  if (!line) return null;
  let value = line.slice(key.length + 1).trim();
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
    value = value.slice(1, -1);
  }
  return value;
}

function getDatabaseUrlFromLocalEnvFile() {
  const envPath = ".env.local";
  const raw = fs.readFileSync(envPath, "utf8");

  return (
    readEnvValue(raw, "SUPABASE_CONNECTION_STRING") ||
    readEnvValue(raw, "BETTER_AUTH_DATABASE_URL") ||
    readEnvValue(raw, "DATABASE_URL")
  );
}

async function main() {
  const databaseUrl = getDatabaseUrlFromLocalEnvFile();
  if (!databaseUrl) {
    throw new Error(
      "Missing SUPABASE_CONNECTION_STRING (or BETTER_AUTH_DATABASE_URL / DATABASE_URL) in .env.local"
    );
  }

  // Use a fixed base URL; migrations use this config to build schema metadata.
  const baseURL = "https://www.mindbridge.health";
  const rpId = new URL(baseURL).hostname;

  const pool = new Pool({ connectionString: databaseUrl });

  // Provide the same plugin set as production, but with no-op email senders.
  const config = {
    appName: "MindBridge",
    baseURL,
    database: pool,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async () => {
        // no-op for migrations
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async () => {
        // no-op for migrations
      },
    },
    plugins: [
      twoFactor({ issuer: "MindBridge" }),
      magicLink({
        sendMagicLink: async () => {
          // no-op for migrations
        },
      }),
      passkey({
        rpID: rpId,
        rpName: "MindBridge",
        origin: baseURL,
      }),
      nextCookies(),
    ],
  };

  try {
    const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(config);
    await runMigrations();

    // Don't print SQL or secrets; just print table names.
    const createdTables = toBeCreated.map((t) => t.table);
    const alteredTables = toBeAdded.map((t) => t.table);

    console.log(
      JSON.stringify(
        {
          ok: true,
          createdTables,
          alteredTables,
        },
        null,
        2
      )
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});

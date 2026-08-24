import fs from "node:fs";
import { Pool } from "pg";

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

function getDbUrlFromLocalEnv() {
  const raw = fs.readFileSync(".env.local", "utf8");
  return (
    readEnvValue(raw, "SUPABASE_CONNECTION_STRING") ||
    readEnvValue(raw, "DATABASE_URL") ||
    readEnvValue(raw, "BETTER_AUTH_DATABASE_URL")
  );
}

type TableRlsRow = {
  table_name: string;
  rls_enabled: boolean;
  rls_forced: boolean;
};

async function main() {
  const dbUrl = getDbUrlFromLocalEnv();
  if (!dbUrl) {
    throw new Error(
      "Missing SUPABASE_CONNECTION_STRING (or DATABASE_URL / BETTER_AUTH_DATABASE_URL) in .env.local"
    );
  }

  const pool = new Pool({ connectionString: dbUrl });

  // Avoid altering Better Auth core tables here; those are used by Better Auth directly.
  // This script focuses on app tables exposed via PostgREST where RLS is the protection layer.
  const skipTables = new Set([
    "user",
    "session",
    "account",
    "verification",
    "twoFactor",
    "passkey",
  ]);

  try {
    const { rows } = await pool.query<TableRlsRow>(
      `
      select
        c.relname as table_name,
        c.relrowsecurity as rls_enabled,
        c.relforcerowsecurity as rls_forced
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
      order by c.relname;
      `.trim()
    );

    const candidates = rows.filter((r) => !skipTables.has(r.table_name));
    const changed: string[] = [];
    const alreadyEnabled: string[] = [];
    const skipped: string[] = rows
      .filter((r) => skipTables.has(r.table_name))
      .map((r) => r.table_name);

    for (const t of candidates) {
      if (t.rls_enabled) {
        alreadyEnabled.push(t.table_name);
        continue;
      }
      await pool.query(`alter table public."${t.table_name}" enable row level security;`);
      changed.push(t.table_name);
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          enabledRlsOn: changed,
          alreadyEnabled,
          skipped,
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

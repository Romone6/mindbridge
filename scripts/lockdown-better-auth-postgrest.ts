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

type PrivRow = {
  table_name: string;
  rls_enabled: boolean;
  anon_select: boolean;
  auth_select: boolean;
  service_select: boolean;
};

async function main() {
  const dbUrl = getDbUrlFromLocalEnv();
  if (!dbUrl) {
    throw new Error(
      "Missing SUPABASE_CONNECTION_STRING (or DATABASE_URL / BETTER_AUTH_DATABASE_URL) in .env.local"
    );
  }

  const pool = new Pool({ connectionString: dbUrl });
  const tables = ["user", "session", "account", "verification", "twoFactor", "passkey"];

  try {
    // 1) Enable RLS + revoke PostgREST roles + grant service_role + ensure service_role policy.
    for (const table of tables) {
      // Enable RLS (not FORCE) to avoid breaking the DB role Better Auth connects with.
      await pool.query(`alter table public."${table}" enable row level security;`);

      // Remove API access for anon/authenticated roles.
      await pool.query(
        `revoke all on table public."${table}" from anon, authenticated;`
      );
      await pool.query(`grant all on table public."${table}" to service_role;`);

      // Service role policy (idempotent)
      const policyName = `service_role_${table}`;
      await pool.query(
        `drop policy if exists "${policyName}" on public."${table}";`
      );
      await pool.query(
        `create policy "${policyName}" on public."${table}" for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');`
      );
    }

    // 2) Report current state without printing secrets.
    const { rows } = await pool.query<PrivRow>(
      `
      select
        c.relname as table_name,
        c.relrowsecurity as rls_enabled,
        has_table_privilege('anon', format('public.%I', c.relname), 'select') as anon_select,
        has_table_privilege('authenticated', format('public.%I', c.relname), 'select') as auth_select,
        has_table_privilege('service_role', format('public.%I', c.relname), 'select') as service_select
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and c.relname = any($1::text[])
      order by c.relname;
      `.trim(),
      [tables]
    );

    console.log(JSON.stringify({ ok: true, tables: rows }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});

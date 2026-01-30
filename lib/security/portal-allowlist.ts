import { createServiceSupabaseClient } from "@/lib/supabase";

export type PortalAllowlistResult =
  | { ok: true; allowed: boolean }
  | { ok: false; error: string };

export async function isEmailAllowlisted(email: string): Promise<PortalAllowlistResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { ok: true, allowed: false };

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase service role key is not configured." };
  }

  const { data, error } = await supabase
    .from("portal_allowlist")
    .select("email")
    .eq("email", normalized)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, allowed: Boolean(data?.email) };
}

export async function upsertAllowlistedEmail({
  email,
  source,
  stripeCustomerId,
}: {
  email: string;
  source: string;
  stripeCustomerId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { ok: false, error: "Email is required" };

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase service role key is not configured." };
  }

  const { error } = await supabase.from("portal_allowlist").upsert(
    {
      email: normalized,
      source,
      stripe_customer_id: stripeCustomerId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

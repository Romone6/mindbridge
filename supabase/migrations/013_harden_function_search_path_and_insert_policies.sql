-- 013_harden_function_search_path_and_insert_policies.sql
-- Remediates Supabase linter warnings:
-- - function_search_path_mutable
-- - rls_policy_always_true (INSERT policies with true)

-- 1) Fix mutable search_path on public functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.set_user_notification_preferences_updated_at() SET search_path = public;
ALTER FUNCTION public.update_user_role_timestamp() SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.current_profile_id() SET search_path = public, auth;
ALTER FUNCTION public.auth_user_id() SET search_path = public, auth;
ALTER FUNCTION public.is_clinic_member(uuid) SET search_path = public, auth;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2) Remove permissive always-true INSERT policy where secure equivalent already exists
DROP POLICY IF EXISTS analytics_insert ON public.analytics_events;

-- 3) Tighten clinic creation insert policy
ALTER POLICY "Anyone can create a clinic" ON public.clinics
  WITH CHECK (
    auth.role() = 'authenticated'
    AND name IS NOT NULL
    AND length(trim(name)) > 0
  );

-- 4) Tighten public intake insert policy while preserving anon/auth submit path
ALTER POLICY "Public can insert intakes" ON public.intakes
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated')
    AND clinic_id IS NOT NULL
    AND id IS NOT NULL
    AND patient_id IS NOT NULL
    AND status IS NOT NULL
  );

-- 5) Tighten public messages insert policy
ALTER POLICY "Anyone can insert messages" ON public.messages
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated')
    AND session_id IS NOT NULL
    AND role IN ('user', 'assistant', 'system')
    AND content IS NOT NULL
    AND length(content) > 0
  );

-- 6) Tighten public patients insert policy
ALTER POLICY "Public can insert patients" ON public.patients
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated')
    AND clinic_id IS NOT NULL
    AND id IS NOT NULL
    AND patient_ref IS NOT NULL
    AND length(trim(patient_ref)) > 0
  );

-- 7) Tighten public triage insert policy
ALTER POLICY "Public can insert triage" ON public.triage_outputs
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated')
    AND clinic_id IS NOT NULL
    AND intake_id IS NOT NULL
    AND urgency_tier IS NOT NULL
    AND summary_json IS NOT NULL
  );

-- 8) Tighten triage session creation policy
ALTER POLICY "Anyone can create triage session" ON public.triage_sessions
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated')
    AND session_id IS NOT NULL
    AND length(session_id) BETWEEN 8 AND 128
  );

-- 9) Consolidate waitlist INSERT policies into one constrained policy
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
DROP POLICY IF EXISTS waitlist_insert ON public.waitlist;
DROP POLICY IF EXISTS waitlist_insert_public ON public.waitlist;

CREATE POLICY waitlist_insert_public ON public.waitlist
  FOR INSERT
  TO public
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated')
    AND email IS NOT NULL
    AND length(email) <= 254
    AND position('@' in email) > 1
    AND position('.' in split_part(email, '@', 2)) > 0
  );

NOTIFY pgrst, 'reload schema';

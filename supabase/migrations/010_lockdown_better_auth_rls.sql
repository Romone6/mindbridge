-- 010_lockdown_better_auth_rls.sql
-- Lock down Better Auth tables from anon/authenticated PostgREST access.

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY['user', 'session', 'account', 'verification', 'twoFactor', 'passkey'];
BEGIN
  -- Ensure roles exist (Supabase creates these, but guard anyway)
  PERFORM 1 FROM pg_roles WHERE rolname = 'anon';
  PERFORM 1 FROM pg_roles WHERE rolname = 'authenticated';
  PERFORM 1 FROM pg_roles WHERE rolname = 'service_role';

  FOREACH tbl IN ARRAY tables LOOP
    IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl);
      EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', tbl);

      -- Replace permissive RLS policies with service_role-only policies (per-table)
      IF tbl = 'user' THEN
        EXECUTE 'DROP POLICY IF EXISTS service_role_user ON public."user"';
        EXECUTE 'CREATE POLICY service_role_user ON public."user" FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
      ELSIF tbl = 'session' THEN
        EXECUTE 'DROP POLICY IF EXISTS service_role_session ON public."session"';
        EXECUTE 'CREATE POLICY service_role_session ON public."session" FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
      ELSIF tbl = 'account' THEN
        EXECUTE 'DROP POLICY IF EXISTS service_role_account ON public."account"';
        EXECUTE 'CREATE POLICY service_role_account ON public."account" FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
      ELSIF tbl = 'verification' THEN
        EXECUTE 'DROP POLICY IF EXISTS service_role_verification ON public."verification"';
        EXECUTE 'CREATE POLICY service_role_verification ON public."verification" FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
      ELSIF tbl = 'twoFactor' THEN
        EXECUTE 'DROP POLICY IF EXISTS service_role_twofactor ON public."twoFactor"';
        EXECUTE 'CREATE POLICY service_role_twofactor ON public."twoFactor" FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
      ELSIF tbl = 'passkey' THEN
        EXECUTE 'DROP POLICY IF EXISTS service_role_passkey ON public."passkey"';
        EXECUTE 'CREATE POLICY service_role_passkey ON public."passkey" FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')';
      END IF;
    END IF;
  END LOOP;
END $$;

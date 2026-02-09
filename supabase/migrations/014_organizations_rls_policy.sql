-- 014_organizations_rls_policy.sql
-- Remediates Supabase linter warning 0008 (RLS enabled, no policy) for public.organizations.

CREATE POLICY organizations_service_role_all ON public.organizations
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

NOTIFY pgrst, 'reload schema';

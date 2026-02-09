-- 015_rls_initplan_auth_select_wrappers.sql
-- Remediates Supabase linter warning 0003 (auth_rls_initplan) by
-- wrapping auth functions in SELECT so Postgres can cache initPlans.

DO $$
DECLARE
  p RECORD;
  updated_qual TEXT;
  updated_with_check TEXT;
  stmt TEXT;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        coalesce(qual, '') LIKE '%auth.uid(%'
        OR coalesce(qual, '') LIKE '%auth.role(%'
        OR coalesce(qual, '') LIKE '%auth.jwt(%'
        OR coalesce(with_check, '') LIKE '%auth.uid(%'
        OR coalesce(with_check, '') LIKE '%auth.role(%'
        OR coalesce(with_check, '') LIKE '%auth.jwt(%'
      )
    ORDER BY tablename, policyname
  LOOP
    updated_qual := p.qual;
    updated_with_check := p.with_check;

    IF updated_qual IS NOT NULL THEN
      updated_qual := replace(updated_qual, 'auth.uid()', '(select auth.uid())');
      updated_qual := replace(updated_qual, 'auth.role()', '(select auth.role())');
      updated_qual := replace(updated_qual, 'auth.jwt()', '(select auth.jwt())');
    END IF;

    IF updated_with_check IS NOT NULL THEN
      updated_with_check := replace(updated_with_check, 'auth.uid()', '(select auth.uid())');
      updated_with_check := replace(updated_with_check, 'auth.role()', '(select auth.role())');
      updated_with_check := replace(updated_with_check, 'auth.jwt()', '(select auth.jwt())');
    END IF;

    IF updated_qual IS DISTINCT FROM p.qual OR updated_with_check IS DISTINCT FROM p.with_check THEN
      stmt := format('ALTER POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);

      IF updated_qual IS NOT NULL THEN
        stmt := stmt || format(' USING (%s)', updated_qual);
      END IF;

      IF updated_with_check IS NOT NULL THEN
        stmt := stmt || format(' WITH CHECK (%s)', updated_with_check);
      END IF;

      EXECUTE stmt;
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

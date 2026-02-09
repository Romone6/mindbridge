-- 016_consolidate_permissive_policies.sql
-- Consolidates overlapping permissive RLS policies (Supabase lint 0006)
-- while preserving intended access behavior.

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_policy ON public.audit_logs;
DROP POLICY IF EXISTS "Users can read own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_read_policy ON public.audit_logs;

CREATE POLICY audit_logs_service_role_all ON public.audit_logs
  FOR ALL
  TO service_role
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY audit_logs_read_authenticated ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())::text
    OR EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_roles.user_id = (select auth.uid())::text
        AND user_roles.role::text = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- session_logs
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.session_logs;
DROP POLICY IF EXISTS session_logs_insert_policy ON public.session_logs;
DROP POLICY IF EXISTS "Users can read own sessions" ON public.session_logs;
DROP POLICY IF EXISTS session_logs_read_policy ON public.session_logs;

CREATE POLICY session_logs_service_role_all ON public.session_logs
  FOR ALL
  TO service_role
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY session_logs_read_authenticated ON public.session_logs
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())::text
    OR EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_roles.user_id = (select auth.uid())::text
        AND user_roles.role::text = ANY (ARRAY['admin', 'clinician'])
    )
  );

-- ---------------------------------------------------------------------------
-- clinic_memberships
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view memberships" ON public.clinic_memberships;
DROP POLICY IF EXISTS "Owners can manage memberships" ON public.clinic_memberships;
DROP POLICY IF EXISTS "Users can join a clinic" ON public.clinic_memberships;

CREATE POLICY clinic_memberships_select_authenticated ON public.clinic_memberships
  FOR SELECT
  TO authenticated
  USING (public.is_clinic_member(clinic_id));

CREATE POLICY clinic_memberships_insert_authenticated ON public.clinic_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = public.auth_user_id()
    OR EXISTS (
      SELECT 1
      FROM public.clinic_memberships cm
      WHERE cm.clinic_id = clinic_memberships.clinic_id
        AND cm.user_id = public.auth_user_id()
        AND cm.role = 'OWNER'
    )
  );

CREATE POLICY clinic_memberships_update_owner ON public.clinic_memberships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clinic_memberships cm
      WHERE cm.clinic_id = clinic_memberships.clinic_id
        AND cm.user_id = public.auth_user_id()
        AND cm.role = 'OWNER'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clinic_memberships cm
      WHERE cm.clinic_id = clinic_memberships.clinic_id
        AND cm.user_id = public.auth_user_id()
        AND cm.role = 'OWNER'
    )
  );

CREATE POLICY clinic_memberships_delete_owner ON public.clinic_memberships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clinic_memberships cm
      WHERE cm.clinic_id = clinic_memberships.clinic_id
        AND cm.user_id = public.auth_user_id()
        AND cm.role = 'OWNER'
    )
  );

-- ---------------------------------------------------------------------------
-- intakes
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view/edit intakes" ON public.intakes;

CREATE POLICY intakes_select_authenticated ON public.intakes
  FOR SELECT
  TO authenticated
  USING (public.is_clinic_member(clinic_id));

CREATE POLICY intakes_update_authenticated ON public.intakes
  FOR UPDATE
  TO authenticated
  USING (public.is_clinic_member(clinic_id))
  WITH CHECK (public.is_clinic_member(clinic_id));

CREATE POLICY intakes_delete_authenticated ON public.intakes
  FOR DELETE
  TO authenticated
  USING (public.is_clinic_member(clinic_id));

ALTER POLICY "Public can insert intakes" ON public.intakes
  TO public
  WITH CHECK (
    public.is_clinic_member(clinic_id)
    OR (
      (select auth.role()) = ANY (ARRAY['anon', 'authenticated'])
      AND clinic_id IS NOT NULL
      AND id IS NOT NULL
      AND patient_id IS NOT NULL
      AND status IS NOT NULL
    )
  );

-- ---------------------------------------------------------------------------
-- patients
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view/edit patients" ON public.patients;

CREATE POLICY patients_select_authenticated ON public.patients
  FOR SELECT
  TO authenticated
  USING (public.is_clinic_member(clinic_id));

CREATE POLICY patients_update_authenticated ON public.patients
  FOR UPDATE
  TO authenticated
  USING (public.is_clinic_member(clinic_id))
  WITH CHECK (public.is_clinic_member(clinic_id));

CREATE POLICY patients_delete_authenticated ON public.patients
  FOR DELETE
  TO authenticated
  USING (public.is_clinic_member(clinic_id));

ALTER POLICY "Public can insert patients" ON public.patients
  TO public
  WITH CHECK (
    public.is_clinic_member(clinic_id)
    OR (
      (select auth.role()) = ANY (ARRAY['anon', 'authenticated'])
      AND clinic_id IS NOT NULL
      AND id IS NOT NULL
      AND patient_ref IS NOT NULL
      AND length(trim(patient_ref)) > 0
    )
  );

-- ---------------------------------------------------------------------------
-- triage_outputs
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can insert triage" ON public.triage_outputs;
DROP POLICY IF EXISTS "Public can insert triage" ON public.triage_outputs;

CREATE POLICY triage_outputs_insert_canonical ON public.triage_outputs
  FOR INSERT
  TO public
  WITH CHECK (
    public.is_clinic_member(clinic_id)
    OR (
      (select auth.role()) = ANY (ARRAY['anon', 'authenticated'])
      AND clinic_id IS NOT NULL
      AND intake_id IS NOT NULL
      AND urgency_tier IS NOT NULL
      AND summary_json IS NOT NULL
    )
  );

-- ---------------------------------------------------------------------------
-- patient_links
-- ---------------------------------------------------------------------------
ALTER POLICY "Public can read active patient links" ON public.patient_links
  TO anon, authenticated;

ALTER POLICY service_role_patient_links ON public.patient_links
  TO service_role
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

CREATE POLICY profiles_select_authenticated ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR clerk_user_id = (select auth.uid())::text
  );

CREATE POLICY profiles_update_authenticated ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR clerk_user_id = (select auth.uid())::text
  )
  WITH CHECK (
    (select auth.uid()) = id
    OR clerk_user_id = (select auth.uid())::text
  );

-- ---------------------------------------------------------------------------
-- user_notification_preferences
-- ---------------------------------------------------------------------------
ALTER POLICY service_role_user_notification_preferences
  ON public.user_notification_preferences
  TO service_role
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

ALTER POLICY users_read_own_notification_preferences
  ON public.user_notification_preferences
  TO authenticated;

ALTER POLICY users_insert_own_notification_preferences
  ON public.user_notification_preferences
  TO authenticated;

ALTER POLICY users_update_own_notification_preferences
  ON public.user_notification_preferences
  TO authenticated;

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS user_roles_read_own_policy ON public.user_roles;
DROP POLICY IF EXISTS user_roles_admin_all_policy ON public.user_roles;

CREATE POLICY user_roles_service_role_all ON public.user_roles
  FOR ALL
  TO service_role
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY user_roles_select_authenticated ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())::text
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = (select auth.uid())::text
        AND ur.role::text = 'admin'
    )
  );

CREATE POLICY user_roles_insert_admin ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = (select auth.uid())::text
        AND ur.role::text = 'admin'
    )
  );

CREATE POLICY user_roles_update_admin ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = (select auth.uid())::text
        AND ur.role::text = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = (select auth.uid())::text
        AND ur.role::text = 'admin'
    )
  );

CREATE POLICY user_roles_delete_admin ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = (select auth.uid())::text
        AND ur.role::text = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- user_subscriptions
-- ---------------------------------------------------------------------------
ALTER POLICY "Service role can manage subscriptions" ON public.user_subscriptions
  TO service_role
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

ALTER POLICY "Users can read own subscription" ON public.user_subscriptions
  TO authenticated;

-- ---------------------------------------------------------------------------
-- waitlist
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only admins can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS waitlist_select_service ON public.waitlist;

ALTER POLICY "Service role can manage waitlist" ON public.waitlist
  TO service_role
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

ALTER POLICY waitlist_insert_public ON public.waitlist
  TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

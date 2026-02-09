-- 017_fk_indexes_and_redundant_index_cleanup.sql
-- Performance optimization:
-- - Add covering indexes for foreign keys flagged by Supabase lint 0001
-- - Drop only high-confidence redundant duplicate indexes flagged by lint 0005

-- Missing FK covering indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_clinic_id ON public.audit_log (clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_invites_clinic_id ON public.clinic_invites (clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinician_notes_clinic_id ON public.clinician_notes (clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinician_notes_intake_id ON public.clinician_notes (intake_id);
CREATE INDEX IF NOT EXISTS idx_intake_links_created_by_profile_id ON public.intake_links (created_by_profile_id);
CREATE INDEX IF NOT EXISTS idx_intakes_patient_id ON public.intakes (patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages (session_id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by_profile_id ON public.organizations (created_by_profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_clinic_id ON public.subscriptions (clinic_id);
CREATE INDEX IF NOT EXISTS idx_triage_outputs_clinic_id ON public.triage_outputs (clinic_id);
CREATE INDEX IF NOT EXISTS idx_triage_outputs_intake_id ON public.triage_outputs (intake_id);
CREATE INDEX IF NOT EXISTS idx_triage_sessions_user_id ON public.triage_sessions (user_id);

-- Redundant duplicate indexes (covered by equivalent unique/alternate indexes)
DROP INDEX IF EXISTS public.idx_waitlist_email;
DROP INDEX IF EXISTS public.idx_user_roles_user_id;
DROP INDEX IF EXISTS public.idx_session_logs_session_id;
DROP INDEX IF EXISTS public.waitlist_created_at_idx;

NOTIFY pgrst, 'reload schema';

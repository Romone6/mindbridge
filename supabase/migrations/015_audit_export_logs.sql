-- 015_audit_export_logs.sql
-- Immutable log of workflow audit exports for compliance traceability.

CREATE TABLE IF NOT EXISTS audit_export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  exported_by_user_id TEXT NOT NULL,
  exported_by_label TEXT NOT NULL,
  export_format TEXT NOT NULL CHECK (export_format IN ('json', 'csv')),
  filter_json JSONB NOT NULL DEFAULT '{}',
  event_count INTEGER NOT NULL DEFAULT 0,
  metadata_json JSONB NOT NULL DEFAULT '{}',
  exported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_export_logs_clinic_id
  ON audit_export_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_audit_export_logs_exported_at
  ON audit_export_logs(exported_at DESC);

ALTER TABLE audit_export_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_export_logs_service_role_all ON audit_export_logs;
CREATE POLICY audit_export_logs_service_role_all ON audit_export_logs
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

NOTIFY pgrst, 'reload schema';

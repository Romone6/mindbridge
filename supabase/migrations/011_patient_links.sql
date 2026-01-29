-- 011_patient_links.sql
-- Ensure patient_links exists and is readable for token validation.

CREATE TABLE IF NOT EXISTS patient_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  link_token UUID NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_patient_links_clinic_id ON patient_links(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_links_expires_at ON patient_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_patient_links_token ON patient_links(link_token);

ALTER TABLE patient_links ENABLE ROW LEVEL SECURITY;

-- Public read for active links (used by intake link landing page)
DROP POLICY IF EXISTS "Public can read active patient links" ON patient_links;
CREATE POLICY "Public can read active patient links" ON patient_links
  FOR SELECT
  USING (expires_at IS NULL OR expires_at > NOW());

-- Allow service_role full access
DROP POLICY IF EXISTS "service_role_patient_links" ON patient_links;
CREATE POLICY "service_role_patient_links" ON patient_links
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Prompt PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

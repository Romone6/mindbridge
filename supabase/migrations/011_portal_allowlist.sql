-- Clinician portal allowlist

CREATE TABLE IF NOT EXISTS portal_allowlist (
  email TEXT PRIMARY KEY,
  stripe_customer_id TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portal_allowlist ENABLE ROW LEVEL SECURITY;

-- Service role can manage allowlist
DROP POLICY IF EXISTS "Service role can manage portal allowlist" ON portal_allowlist;
CREATE POLICY "Service role can manage portal allowlist" ON portal_allowlist
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- No user-level access; this table is used by server middleware/gates.

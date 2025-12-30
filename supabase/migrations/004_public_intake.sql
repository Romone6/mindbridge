-- 004_public_intake.sql
-- Idempotent application of public intake policies

-- Allow public access to insert intakes
DROP POLICY IF EXISTS "Public can insert intakes" ON intakes;
CREATE POLICY "Public can insert intakes" ON intakes
  FOR INSERT WITH CHECK (true);

-- Allow public access to insert patients
DROP POLICY IF EXISTS "Public can insert patients" ON patients;
CREATE POLICY "Public can insert patients" ON patients
  FOR INSERT WITH CHECK (true);

-- Allow public to insert triage outputs
DROP POLICY IF EXISTS "Public can insert triage" ON triage_outputs;
CREATE POLICY "Public can insert triage" ON triage_outputs
  FOR INSERT WITH CHECK (true);

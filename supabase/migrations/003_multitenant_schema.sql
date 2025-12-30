-- 003_multitenant_schema_v2.sql
-- FULL RESET & FIX for Clerk Integration
-- Run this in Supabase SQL Editor

-- 1. Drop existing tables to ensure clean slate (cascade will handle dependencies)
-- Note: 'patient_sessions' and others are from a legacy schema found in the environment.
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS clinician_notes CASCADE;
DROP TABLE IF EXISTS triage_outputs CASCADE;
DROP TABLE IF EXISTS intakes CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS clinic_invites CASCADE;
DROP TABLE IF EXISTS clinic_memberships CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

-- Drop legacy/conflicting tables if they exist
DROP TABLE IF EXISTS patient_sessions CASCADE;
DROP TABLE IF EXISTS session_messages CASCADE;
DROP TABLE IF EXISTS risk_events CASCADE;
DROP TABLE IF EXISTS audit_events CASCADE;

-- Drop functions that might be lingering
DROP FUNCTION IF EXISTS auth_user_id() CASCADE;
DROP FUNCTION IF EXISTS is_clinic_member(uuid) CASCADE;

-- 2. Create Tables

-- Clinics
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    abn TEXT,
    address TEXT,
    timezone TEXT DEFAULT 'Australia/Sydney',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinic Memberships
CREATE TABLE clinic_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT NOT NULL, -- Clerk ID (String)
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'CLINICIAN', 'STAFF', 'READ_ONLY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, user_id)
);

-- Clinic Invites
CREATE TABLE clinic_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'CLINICIAN', 'STAFF', 'READ_ONLY')),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    patient_ref TEXT, -- External ID or Name (Minimal PII)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intakes
CREATE TABLE intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'triaged', 'reviewed', 'archived')),
    answers_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triage Outputs
CREATE TABLE triage_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE NOT NULL,
    summary_json JSONB,
    risk_flags_json JSONB,
    urgency_tier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinician Notes
CREATE TABLE clinician_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    intake_id UUID REFERENCES intakes(id) ON DELETE CASCADE NOT NULL,
    author_user_id TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log (Specific to this system)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    actor_user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinician_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 4. Indexes
CREATE INDEX idx_clinic_memberships_user_id ON clinic_memberships(user_id);
CREATE INDEX idx_clinic_memberships_clinic_id ON clinic_memberships(clinic_id);
CREATE INDEX idx_intakes_clinic_id ON intakes(clinic_id);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);

-- 5. RLS Policies

-- Helper Function: Safe Auth ID
-- Returns the 'sub' claim from the JWT (Clerk User ID) as text.
-- This avoids the "invalid input syntax for type uuid" error when using auth.uid() with Clerk.
CREATE OR REPLACE FUNCTION auth_user_id() RETURNS text AS $$
  SELECT (auth.jwt() ->> 'sub');
$$ LANGUAGE sql STABLE;

-- Helper to check membership
CREATE OR REPLACE FUNCTION is_clinic_member(_clinic_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM clinic_memberships
    WHERE clinic_id = _clinic_id
    AND user_id = auth_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clinics:
CREATE POLICY "Members can view their clinics" ON clinics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_id = clinics.id
      AND user_id = auth_user_id()
    )
  );

CREATE POLICY "Owners can update their clinics" ON clinics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_id = clinics.id
      AND user_id = auth_user_id()
      AND role = 'OWNER'
    )
  );

CREATE POLICY "Anyone can create a clinic" ON clinics
  FOR INSERT WITH CHECK (true);

-- Clinic Memberships:
CREATE POLICY "Members can view memberships" ON clinic_memberships
  FOR SELECT USING (
    is_clinic_member(clinic_id)
  );

CREATE POLICY "Owners can manage memberships" ON clinic_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships cm
      WHERE cm.clinic_id = clinic_memberships.clinic_id
      AND cm.user_id = auth_user_id()
      AND cm.role = 'OWNER'
    )
  );

CREATE POLICY "Users can join a clinic" ON clinic_memberships
    FOR INSERT WITH CHECK (
        user_id = auth_user_id()
    );

-- Patients:
CREATE POLICY "Members can view/edit patients" ON patients
  FOR ALL USING (is_clinic_member(clinic_id));
  
-- Allow Public Insert (for Intake flow)
CREATE POLICY "Public can insert patients" ON patients
  FOR INSERT WITH CHECK (true);

-- Intakes:
CREATE POLICY "Members can view/edit intakes" ON intakes
  FOR ALL USING (is_clinic_member(clinic_id));

-- Allow Public Insert (for Intake flow)
CREATE POLICY "Public can insert intakes" ON intakes
  FOR INSERT WITH CHECK (true);

-- Clinic Invites:
CREATE POLICY "Owners can manage invites" ON clinic_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_id = clinic_invites.clinic_id
      AND user_id = auth_user_id()
      AND role = 'OWNER'
    )
  );

-- Triage Outputs:
CREATE POLICY "Members can view triage" ON triage_outputs
  FOR SELECT USING (is_clinic_member(clinic_id));

CREATE POLICY "Members can insert triage" ON triage_outputs
  FOR INSERT WITH CHECK (is_clinic_member(clinic_id));

-- Allow Public Insert (for Intake flow server action)
CREATE POLICY "Public can insert triage" ON triage_outputs
  FOR INSERT WITH CHECK (true);

-- Clinician Notes:
CREATE POLICY "Members can view notes" ON clinician_notes
  FOR SELECT USING (is_clinic_member(clinic_id));

CREATE POLICY "Members can write notes" ON clinician_notes
  FOR INSERT WITH CHECK (is_clinic_member(clinic_id));

-- Audit Log:
CREATE POLICY "Members can view audit log" ON audit_log
  FOR SELECT USING (is_clinic_member(clinic_id));

CREATE POLICY "Members can insert audit log" ON audit_log
  FOR INSERT WITH CHECK (is_clinic_member(clinic_id));

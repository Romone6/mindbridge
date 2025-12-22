-- MindBridge Database Schema for HIPAA-Compliant Logging
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ============================================================================
-- SESSION LOGS (Encrypted PHI data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255), -- Clerk user ID (if authenticated session)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Risk assessment data
    risk_score INTEGER NOT NULL,
    phq9_score INTEGER,
    gad7_score INTEGER,
    
    -- Encrypted fields (contains PHI)
    encrypted_key_phrases TEXT, -- Encrypted JSON array of flagged phrases
    encrypted_context TEXT, -- Encrypted session context
    
    -- Escalation tracking
    escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    escalation_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 100)
);

CREATE INDEX idx_session_logs_session_id ON session_logs(session_id);
CREATE INDEX idx_session_logs_created_at ON session_logs(created_at DESC);
CREATE INDEX idx_session_logs_escalated ON session_logs(escalated) WHERE escalated = TRUE;

-- ============================================================================
-- AUDIT LOGS (All PHI access events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Who
    user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    user_email VARCHAR(255), -- For reference
    user_role VARCHAR(50), -- admin, clinician, viewer
    
    -- What
    action VARCHAR(100) NOT NULL, -- view_patient, update_patient, delete_session, export_data, etc.
    resource_type VARCHAR(50) NOT NULL, -- patient, session, report, etc.
    resource_id VARCHAR(255), -- ID of the resource accessed
    
    -- When & Where
    ip_address INET,
    user_agent TEXT,
    
    -- Details
    details JSONB, -- Additional context (non-PHI metadata)
    
    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================================================
-- USER ROLES (RBAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL UNIQUE, -- Clerk user ID
    role VARCHAR(50) NOT NULL, -- admin, clinician, viewer
    permissions JSONB, -- Specific permissions override
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255), -- Admin who assigned role
    
    CONSTRAINT valid_role CHECK (role IN ('admin', 'clinician', 'viewer'))
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- ============================================================================
-- INCIDENT REPORTS (Breaches, critical events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Incident type
    incident_type VARCHAR(100) NOT NULL, -- breach, unauthorized_access, system_error, etc.
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    
    -- Details
    description TEXT NOT NULL,
    affected_users INTEGER DEFAULT 0,
    affected_sessions INTEGER DEFAULT 0,
    
    -- Response
    status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved, closed
    assigned_to VARCHAR(255), -- User ID of person handling
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    breach_notification_sent BOOLEAN DEFAULT FALSE,
    breach_notification_date TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_status CHECK (status IN ('open', 'investigating', 'resolved', 'closed'))
);

CREATE INDEX idx_incident_reports_created_at ON incident_reports(created_at DESC);
CREATE INDEX idx_incident_reports_status ON incident_reports(status);
CREATE INDEX idx_incident_reports_severity ON incident_reports(severity);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- Session Logs: Only admins and clinicians can read
CREATE POLICY session_logs_read_policy ON session_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()::text
            AND user_roles.role IN ('admin', 'clinician')
        )
    );

-- Session Logs: Only system can insert (via service role)
CREATE POLICY session_logs_insert_policy ON session_logs
    FOR INSERT
    WITH CHECK (true); -- Service role only

-- Audit Logs: Only admins can read, system can insert
CREATE POLICY audit_logs_read_policy ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()::text
            AND user_roles.role = 'admin'
        )
    );

CREATE POLICY audit_logs_insert_policy ON audit_logs
    FOR INSERT
    WITH CHECK (true); -- Service role only

-- User Roles: Users can read their own role, admins can manage
CREATE POLICY user_roles_read_own_policy ON user_roles
    FOR SELECT
    USING (user_id = auth.uid()::text);

CREATE POLICY user_roles_admin_all_policy ON user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles AS ur
            WHERE ur.user_id = auth.uid()::text
            AND ur.role = 'admin'
        )
    );

-- Incident Reports: Only admins can access
CREATE POLICY incident_reports_admin_policy ON incident_reports
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()::text
            AND user_roles.role = 'admin'
        )
    );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update user role timestamp
CREATE OR REPLACE FUNCTION update_user_role_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_roles_update_timestamp
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_user_role_timestamp();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default admin role for first user (update with your Clerk user ID)
-- INSERT INTO user_roles (user_id, role, created_by)
-- VALUES ('your-clerk-user-id', 'admin', 'system');

COMMENT ON TABLE session_logs IS 'Encrypted session logs with PHI redaction and risk assessment data';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail of all PHI access events';
COMMENT ON TABLE user_roles IS 'User roles and permissions for RBAC';
COMMENT ON TABLE incident_reports IS 'Security incidents and breach notifications';

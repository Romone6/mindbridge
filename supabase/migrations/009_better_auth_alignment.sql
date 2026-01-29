-- 009_better_auth_alignment.sql
-- Align Better Auth users with RBAC tables

-- Ensure new Better Auth users get a default role record
CREATE OR REPLACE FUNCTION handle_better_auth_user_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role, created_by, created_at, updated_at)
  VALUES (NEW.id, 'viewer', 'system_better_auth', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_better_auth_user_roles ON "user";
CREATE TRIGGER trg_better_auth_user_roles
AFTER INSERT ON "user"
FOR EACH ROW EXECUTE FUNCTION handle_better_auth_user_insert();

-- Update column comments to reflect Better Auth IDs
COMMENT ON COLUMN user_roles.user_id IS 'Better Auth user id';
COMMENT ON COLUMN clinic_memberships.user_id IS 'Better Auth user id';
COMMENT ON COLUMN clinician_notes.author_user_id IS 'Better Auth user id';
COMMENT ON COLUMN session_logs.user_id IS 'Better Auth user id';
COMMENT ON COLUMN audit_logs.user_id IS 'Better Auth user id';

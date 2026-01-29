-- Admin User Setup for MindBridge
-- Creates the initial admin account: romone@mindbridge.health

-- Insert admin user (use ON CONFLICT to handle re-runs)
INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
VALUES (
    'admin_mindbridge_001',
    'Romone Dunlop',
    'romone@mindbridge.health',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    "emailVerified" = TRUE,
    "updatedAt" = NOW();

-- Assign admin role in user_roles table
INSERT INTO user_roles (user_id, role, created_by, created_at, updated_at)
SELECT 
    u.id,
    'admin',
    'system_migration',
    NOW(),
    NOW()
FROM "user" u
WHERE u.email = 'romone@mindbridge.health'
ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

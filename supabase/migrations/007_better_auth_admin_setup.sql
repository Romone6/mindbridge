-- Better Auth Schema and Admin User Setup
-- Run each section separately in Supabase SQL Editor if needed

-- Users table (Better Auth)
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    image TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Sessions table (Better Auth)
CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    token TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);

-- Account table (Better Auth)
CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ,
    "refreshTokenExpiresAt" TIMESTAMPTZ,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"("userId");

-- Verification table (Better Auth)
CREATE TABLE IF NOT EXISTS "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);

-- Two Factor table (Better Auth)
CREATE TABLE IF NOT EXISTS "twoFactor" (
    id TEXT PRIMARY KEY,
    secret TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_two_factor_user_id ON "twoFactor"("userId");

-- Passkey table (Better Auth)
CREATE TABLE IF NOT EXISTS "passkey" (
    id TEXT PRIMARY KEY,
    name TEXT,
    "publicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "webauthnUserID" TEXT NOT NULL,
    counter INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    transports TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_passkey_user_id ON "passkey"("userId");

-- Enable RLS on all Better Auth tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "twoFactor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "passkey" ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow service role full access (required for auth operations)
DROP POLICY IF EXISTS "service_role_user" ON "user";
CREATE POLICY "service_role_user" ON "user" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_session" ON "session";
CREATE POLICY "service_role_session" ON "session" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_account" ON "account";
CREATE POLICY "service_role_account" ON "account" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_verification" ON "verification";
CREATE POLICY "service_role_verification" ON "verification" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_twofactor" ON "twoFactor";
CREATE POLICY "service_role_twofactor" ON "twoFactor" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_passkey" ON "passkey";
CREATE POLICY "service_role_passkey" ON "passkey" FOR ALL USING (true) WITH CHECK (true);

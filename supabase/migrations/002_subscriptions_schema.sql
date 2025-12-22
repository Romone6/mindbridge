-- MindBridge Subscription Management Schema
-- Add this to track user subscriptions from Stripe
-- Run in Supabase SQL Editor AFTER running the main schema

-- ============================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================
-- Tracks active subscriptions and their status

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    tier TEXT NOT NULL, -- 'proactive', 'clinics', 'payers'
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own subscription
CREATE POLICY "Users can read own subscription" ON user_subscriptions
    FOR SELECT
    USING (user_id = auth.uid()::text);

-- RLS Policy: Service role can manage all subscriptions
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER VIEW: Active Subscriptions
-- ============================================

CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    user_id,
    tier,
    status,
    current_period_end,
    trial_end,
    cancel_at_period_end
FROM user_subscriptions
WHERE status IN ('active', 'trialing')
ORDER BY created_at DESC;

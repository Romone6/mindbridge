-- ============================================
-- Fix SECURITY DEFINER issue in active_subscriptions view
-- ============================================
-- This migration updates the existing active_subscriptions view
-- to use SECURITY INVOKER instead of SECURITY DEFINER.
-- This ensures the view respects the querying user's permissions
-- and enforces RLS policies from the underlying user_subscriptions table.

-- Drop and recreate the view with SECURITY INVOKER
DROP VIEW IF EXISTS active_subscriptions;

CREATE VIEW active_subscriptions
WITH (security_invoker = true) AS
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

-- 005_subscriptions.sql

-- Add Stripe Customer ID to clinics
ALTER TABLE clinics ADD COLUMN stripe_customer_id TEXT;

-- Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_price_id TEXT,
    status TEXT NOT NULL, -- active, trialing, past_due, canceled, etc.
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view subscription" ON subscriptions
  FOR SELECT USING (is_clinic_member(clinic_id));

-- Only service role (webhook) can insert/update subscriptions usually, 
-- but we might allow owners to read.
-- For now, we rely on service role for updates via webhook.

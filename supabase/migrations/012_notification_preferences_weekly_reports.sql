-- 012_notification_preferences_weekly_reports.sql
-- Persist clinician notification preferences and track weekly summary delivery.

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  high_risk_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_reports BOOLEAN NOT NULL DEFAULT FALSE,
  timezone TEXT NOT NULL DEFAULT 'Australia/Sydney',
  last_weekly_report_sent_at TIMESTAMPTZ,
  last_weekly_report_window_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_weekly_reports
  ON user_notification_preferences(weekly_reports);

CREATE OR REPLACE FUNCTION set_user_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER trg_user_notification_preferences_updated_at
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW EXECUTE FUNCTION set_user_notification_preferences_updated_at();

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_user_notification_preferences ON user_notification_preferences;
CREATE POLICY service_role_user_notification_preferences ON user_notification_preferences
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS users_read_own_notification_preferences ON user_notification_preferences;
CREATE POLICY users_read_own_notification_preferences ON user_notification_preferences
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS users_insert_own_notification_preferences ON user_notification_preferences;
CREATE POLICY users_insert_own_notification_preferences ON user_notification_preferences
  FOR INSERT
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS users_update_own_notification_preferences ON user_notification_preferences;
CREATE POLICY users_update_own_notification_preferences ON user_notification_preferences
  FOR UPDATE
  USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

NOTIFY pgrst, 'reload schema';

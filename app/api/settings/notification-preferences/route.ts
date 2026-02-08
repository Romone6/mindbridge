import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getServerUserId } from "@/lib/auth/server";

type PreferencesRow = {
  email_notifications: boolean;
  high_risk_alerts: boolean;
  weekly_reports: boolean;
  timezone: string;
  last_weekly_report_sent_at: string | null;
};

const DEFAULTS = {
  emailNotifications: true,
  highRiskAlerts: true,
  weeklyReports: false,
  timezone: "Australia/Sydney",
};

function parseTimezone(value: unknown) {
  if (typeof value !== "string") return DEFAULTS.timezone;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 64) return DEFAULTS.timezone;
  return trimmed;
}

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 }
      );
    }

    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_notification_preferences")
      .select(
        "email_notifications, high_risk_alerts, weekly_reports, timezone, last_weekly_report_sent_at"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    const row = (data || null) as PreferencesRow | null;

    if (!row) {
      return NextResponse.json({
        preferences: {
          ...DEFAULTS,
          lastWeeklyReportSentAt: null,
        },
      });
    }

    return NextResponse.json({
      preferences: {
        emailNotifications: row.email_notifications,
        highRiskAlerts: row.high_risk_alerts,
        weeklyReports: row.weekly_reports,
        timezone: row.timezone || DEFAULTS.timezone,
        lastWeeklyReportSentAt: row.last_weekly_report_sent_at,
      },
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 }
      );
    }

    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      emailNotifications?: unknown;
      highRiskAlerts?: unknown;
      weeklyReports?: unknown;
      timezone?: unknown;
    };

    if (
      typeof body.emailNotifications !== "boolean" ||
      typeof body.highRiskAlerts !== "boolean" ||
      typeof body.weeklyReports !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid notification preference payload." },
        { status: 400 }
      );
    }

    const timezone = parseTimezone(body.timezone);

    const { data, error } = await supabase
      .from("user_notification_preferences")
      .upsert(
        {
          user_id: userId,
          email_notifications: body.emailNotifications,
          high_risk_alerts: body.highRiskAlerts,
          weekly_reports: body.weeklyReports,
          timezone,
        },
        { onConflict: "user_id" }
      )
      .select(
        "email_notifications, high_risk_alerts, weekly_reports, timezone, last_weekly_report_sent_at"
      )
      .single();

    if (error) throw error;

    const row = data as PreferencesRow;

    return NextResponse.json({
      preferences: {
        emailNotifications: row.email_notifications,
        highRiskAlerts: row.high_risk_alerts,
        weeklyReports: row.weekly_reports,
        timezone: row.timezone,
        lastWeeklyReportSentAt: row.last_weekly_report_sent_at,
      },
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

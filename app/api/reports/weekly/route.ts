import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceSupabaseClient } from "@/lib/supabase";

type PreferenceRow = {
  user_id: string;
  email_notifications: boolean;
  high_risk_alerts: boolean;
  weekly_reports: boolean;
  timezone: string;
  last_weekly_report_sent_at: string | null;
};

type MembershipRow = {
  clinic_id: string;
  clinic: { id: string; name: string } | { id: string; name: string }[] | null;
};

type IntakeRow = {
  id: string;
  clinic_id: string;
  status: string;
  created_at: string;
};

type TriageRow = {
  clinic_id: string;
  urgency_tier: string | null;
};

type ClinicSummary = {
  clinicId: string;
  clinicName: string;
  totalIntakes: number;
  triagedIntakes: number;
  highUrgencyFlags: number;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) return null;
  const fromName = process.env.RESEND_FROM_NAME || "MindBridge";
  return `${fromName} <${fromEmail}>`;
}

function isAuthorizedCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

function isHighUrgency(urgencyTier: string | null) {
  if (!urgencyTier) return false;
  const normalized = urgencyTier.trim().toLowerCase();
  return normalized === "high" || normalized === "urgent" || normalized === "critical";
}

function startOfPreviousWeek(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysFromMonday - 7);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function startOfCurrentWeek(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysFromMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function buildWeeklyReportEmail(params: {
  userName: string;
  weekStartIso: string;
  weekEndIso: string;
  clinicSummaries: ClinicSummary[];
}) {
  const { userName, weekStartIso, weekEndIso, clinicSummaries } = params;
  const weekStart = new Date(weekStartIso).toLocaleDateString("en-AU");
  const weekEnd = new Date(weekEndIso).toLocaleDateString("en-AU");

  const totalIntakes = clinicSummaries.reduce((sum, item) => sum + item.totalIntakes, 0);
  const totalTriaged = clinicSummaries.reduce((sum, item) => sum + item.triagedIntakes, 0);
  const totalHighUrgency = clinicSummaries.reduce((sum, item) => sum + item.highUrgencyFlags, 0);

  const perClinicRows = clinicSummaries
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.clinicName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.totalIntakes}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.triagedIntakes}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.highUrgencyFlags}</td>
        </tr>
      `
    )
    .join("");

  const html = `
<!doctype html>
<html>
  <body style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5; color: #0f172a;">
    <div style="max-width: 680px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px; margin: 0 0 12px;">Weekly clinic summary</h1>
      <p style="margin: 0 0 16px;">Hi ${userName}, here is your weekly activity summary for <strong>${weekStart}</strong> to <strong>${weekEnd}</strong>.</p>

      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0 0 20px;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
          <div style="font-size: 12px; color: #475569;">Total intakes</div>
          <div style="font-size: 24px; font-weight: 700;">${totalIntakes}</div>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
          <div style="font-size: 12px; color: #475569;">Triaged</div>
          <div style="font-size: 24px; font-weight: 700;">${totalTriaged}</div>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
          <div style="font-size: 12px; color: #475569;">High urgency flags</div>
          <div style="font-size: 24px; font-weight: 700;">${totalHighUrgency}</div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0;">Clinic</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #e2e8f0;">Intakes</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #e2e8f0;">Triaged</th>
            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #e2e8f0;">High urgency</th>
          </tr>
        </thead>
        <tbody>
          ${perClinicRows}
        </tbody>
      </table>

      <p style="margin: 18px 0 0; font-size: 12px; color: #64748b;">
        You are receiving this because Weekly Reports are enabled in your MindBridge settings.
      </p>
    </div>
  </body>
</html>
  `.trim();

  const lines = [
    `Weekly clinic summary (${weekStart} - ${weekEnd})`,
    "",
    `Total intakes: ${totalIntakes}`,
    `Triaged: ${totalTriaged}`,
    `High urgency flags: ${totalHighUrgency}`,
    "",
    "Per clinic:",
    ...clinicSummaries.map(
      (item) =>
        `- ${item.clinicName}: intakes ${item.totalIntakes}, triaged ${item.triagedIntakes}, high urgency ${item.highUrgencyFlags}`
    ),
  ];

  return {
    html,
    text: lines.join("\n"),
  };
}

async function sendWeeklyReportEmail(params: {
  to: string;
  userName: string;
  weekStartIso: string;
  weekEndIso: string;
  clinicSummaries: ClinicSummary[];
}) {
  const resend = getResendClient();
  const from = getFromAddress();

  if (!resend || !from) {
    throw new Error("Weekly report email provider not configured.");
  }

  const { html, text } = buildWeeklyReportEmail(params);
  const subject = `MindBridge weekly summary (${new Date(params.weekStartIso).toLocaleDateString("en-AU")}-${new Date(params.weekEndIso).toLocaleDateString("en-AU")})`;

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Unknown Resend error");
  }
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCron(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 }
      );
    }

    const now = new Date();
    const weekStart = startOfPreviousWeek(now);
    const weekEnd = startOfCurrentWeek(now);

    const { data: preferences, error: prefError } = await supabase
      .from("user_notification_preferences")
      .select(
        "user_id, email_notifications, high_risk_alerts, weekly_reports, timezone, last_weekly_report_sent_at"
      )
      .eq("weekly_reports", true)
      .eq("email_notifications", true);

    if (prefError) throw prefError;

    const rows = (preferences || []) as PreferenceRow[];

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const failures: string[] = [];

    for (const pref of rows) {
      try {
        if (pref.last_weekly_report_sent_at) {
          const sentAt = new Date(pref.last_weekly_report_sent_at);
          if (sentAt >= weekEnd) {
            skipped += 1;
            continue;
          }
        }

        const { data: userRow, error: userError } = await supabase
          .from("user")
          .select("id, email, name")
          .eq("id", pref.user_id)
          .maybeSingle();

        if (userError) throw userError;
        const user = (userRow || null) as { id: string; email: string; name: string | null } | null;
        if (!user?.email) {
          skipped += 1;
          continue;
        }

        const { data: memberships, error: membershipError } = await supabase
          .from("clinic_memberships")
          .select("clinic_id, clinic:clinics(id, name)")
          .eq("user_id", pref.user_id);

        if (membershipError) throw membershipError;

        const membershipRows = (memberships || []) as MembershipRow[];
        const clinics = membershipRows
          .map((row) => {
            const clinic = Array.isArray(row.clinic) ? row.clinic[0] : row.clinic;
            if (!clinic) return null;
            return { id: clinic.id, name: clinic.name };
          })
          .filter((clinic): clinic is { id: string; name: string } => Boolean(clinic));

        if (clinics.length === 0) {
          skipped += 1;
          continue;
        }

        const clinicIds = clinics.map((clinic) => clinic.id);

        const { data: intakes, error: intakesError } = await supabase
          .from("intakes")
          .select("id, clinic_id, status, created_at")
          .in("clinic_id", clinicIds)
          .gte("created_at", weekStart.toISOString())
          .lt("created_at", weekEnd.toISOString());

        if (intakesError) throw intakesError;

        const { data: triage, error: triageError } = await supabase
          .from("triage_outputs")
          .select("clinic_id, urgency_tier")
          .in("clinic_id", clinicIds)
          .gte("created_at", weekStart.toISOString())
          .lt("created_at", weekEnd.toISOString());

        if (triageError) throw triageError;

        const intakeRows = (intakes || []) as IntakeRow[];
        const triageRows = (triage || []) as TriageRow[];

        const clinicSummaries = clinics.map((clinic) => {
          const clinicIntakes = intakeRows.filter((row) => row.clinic_id === clinic.id);
          const clinicTriage = triageRows.filter((row) => row.clinic_id === clinic.id);

          const triagedIntakes = clinicIntakes.filter(
            (row) => row.status === "triaged" || row.status === "reviewed"
          ).length;

          const highUrgencyFlags = clinicTriage.filter((row) => isHighUrgency(row.urgency_tier)).length;

          return {
            clinicId: clinic.id,
            clinicName: clinic.name,
            totalIntakes: clinicIntakes.length,
            triagedIntakes,
            highUrgencyFlags,
          } satisfies ClinicSummary;
        });

        await sendWeeklyReportEmail({
          to: user.email,
          userName: user.name || "Clinician",
          weekStartIso: weekStart.toISOString(),
          weekEndIso: weekEnd.toISOString(),
          clinicSummaries,
        });

        const { error: updateError } = await supabase
          .from("user_notification_preferences")
          .update({
            last_weekly_report_sent_at: now.toISOString(),
            last_weekly_report_window_start: weekStart.toISOString(),
          })
          .eq("user_id", pref.user_id);

        if (updateError) throw updateError;

        sent += 1;
      } catch (error) {
        failed += 1;
        const reason = error instanceof Error ? error.message : "Unknown failure";
        failures.push(`${pref.user_id}: ${reason}`);
      }
    }

    return NextResponse.json({
      success: true,
      window: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      },
      processed: rows.length,
      sent,
      skipped,
      failed,
      failures,
    });
  } catch (error) {
    console.error("Weekly report cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

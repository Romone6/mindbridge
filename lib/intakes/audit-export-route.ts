import { NextResponse } from "next/server";
import {
  authorizeAuditExportRole,
  buildAuditCsvHeaders,
  buildAuditExportMetadata,
  parseAuditExportQuery,
} from "@/lib/intakes/audit-export";
import {
  buildWorkflowAuditEvents,
  filterWorkflowAuditEvents,
  paginateWorkflowAuditEvents,
  workflowAuditEventsToCsvStream,
  type IntakeAuditSource,
} from "@/lib/intakes/workflow-audit";
import { createServiceSupabaseClient } from "@/lib/supabase";

type SupabaseServiceClient = NonNullable<
  ReturnType<typeof createServiceSupabaseClient>
>;

type SessionLike = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
} | null;

export type AuditExportRouteDeps = {
  createSupabase: () => SupabaseServiceClient | null;
  getUserId: () => Promise<string | null>;
  getSession: () => Promise<SessionLike>;
};

function errorJson(message: string, status: number, code: string) {
  return NextResponse.json({ error: message, code }, { status });
}

async function resolveMembershipRole(
  supabase: SupabaseServiceClient,
  clinicId: string,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("clinic_memberships")
    .select("role")
    .eq("clinic_id", clinicId)
    .eq("user_id", userId)
    .single<{ role: string }>();

  if (error || !data) {
    return null;
  }

  return data.role;
}

export function createAuditExportRouteHandlers(deps: AuditExportRouteDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const supabase = deps.createSupabase();
        if (!supabase) {
          return errorJson(
            "Supabase service role key is not configured.",
            503,
            "INTAKE_AUDIT_NO_SUPABASE",
          );
        }

        const userId = await deps.getUserId();
        if (!userId) {
          return errorJson("Unauthorized", 401, "INTAKE_AUDIT_UNAUTHORIZED");
        }

        const parsed = parseAuditExportQuery(request.url);
        if (!parsed.ok) {
          return errorJson(parsed.error, parsed.status, parsed.code);
        }

        const { clinicId, intakeId, format, from, to, actor, eventType, limit, offset } =
          parsed.query;

        const membershipRole = await resolveMembershipRole(supabase, clinicId, userId);
        const authorization = authorizeAuditExportRole(membershipRole);
        if (!authorization.ok) {
          return errorJson(
            authorization.error,
            authorization.status,
            authorization.code,
          );
        }

        let query = supabase
          .from("intakes")
          .select("id, patient_id, status, answers_json")
          .eq("clinic_id", clinicId);

        if (intakeId) {
          query = query.eq("id", intakeId);
        }

        const { data, error } = await query;
        if (error) {
          throw error;
        }

        const rows = (data || []) as IntakeAuditSource[];
        const filteredEvents = filterWorkflowAuditEvents(buildWorkflowAuditEvents(rows), {
          from: from || undefined,
          to: to || undefined,
          actor: actor || undefined,
          eventType: eventType || undefined,
        });
        const events = paginateWorkflowAuditEvents(filteredEvents, { limit, offset });

        const session = await deps.getSession();
        const exportedBy =
          session?.user?.name?.trim() ||
          session?.user?.email?.trim() ||
          session?.user?.id ||
          userId;

        const metadata = buildAuditExportMetadata({
          exportedBy,
          format,
          query: parsed.query,
          count: events.length,
        });

        const { error: logError } = await supabase.from("audit_export_logs").insert({
          clinic_id: clinicId,
          exported_by_user_id: userId,
          exported_by_label: metadata.exportedBy,
          export_format: format,
          filter_json: metadata.filters,
          event_count: metadata.count,
          metadata_json: {
            intakeId: intakeId || null,
          },
          exported_at: metadata.exportedAt,
        });

        if (logError) {
          console.error("Failed to persist audit export log:", logError);
          return errorJson(
            "Failed to persist export audit log.",
            500,
            "INTAKE_AUDIT_LOG_WRITE_FAILED",
          );
        }

        if (format === "csv") {
          if (events.length > 2000) {
            return errorJson(
              "CSV export is too large. Narrow filters or use pagination.",
              413,
              "INTAKE_AUDIT_CSV_TOO_LARGE",
            );
          }

          const filename = intakeId
            ? `intake-workflow-audit-${intakeId}.csv`
            : `intake-workflow-audit-${clinicId}.csv`;

          return new Response(workflowAuditEventsToCsvStream(events), {
            status: 200,
            headers: buildAuditCsvHeaders({ filename, metadata }),
          });
        }

        return NextResponse.json({
          events,
          count: events.length,
          total: filteredEvents.length,
          clinicId,
          intakeId: intakeId || null,
          metadata,
        });
      } catch (error) {
        console.error("Intake audit export error:", error);
        return errorJson(
          "Internal server error",
          500,
          "INTAKE_AUDIT_INTERNAL_ERROR",
        );
      }
    },
  };
}

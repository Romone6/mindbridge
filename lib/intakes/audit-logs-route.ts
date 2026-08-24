import { NextResponse } from "next/server";
import {
  authorizeAuditExportRole,
  parseAuditLogQuery,
} from "@/lib/intakes/audit-export";
import { createServiceSupabaseClient } from "@/lib/supabase";

type SupabaseServiceClient = NonNullable<
  ReturnType<typeof createServiceSupabaseClient>
>;

export type AuditLogsRouteDeps = {
  createSupabase: () => SupabaseServiceClient | null;
  getUserId: () => Promise<string | null>;
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

export function createAuditLogsRouteHandlers(deps: AuditLogsRouteDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const supabase = deps.createSupabase();
        if (!supabase) {
          return errorJson(
            "Supabase service role key is not configured.",
            503,
            "INTAKE_AUDIT_LOGS_NO_SUPABASE",
          );
        }

        const userId = await deps.getUserId();
        if (!userId) {
          return errorJson("Unauthorized", 401, "INTAKE_AUDIT_LOGS_UNAUTHORIZED");
        }

        const parsed = parseAuditLogQuery(request.url);
        if (!parsed.ok) {
          return errorJson(parsed.error, parsed.status, parsed.code);
        }

        const { clinicId, limit, offset, from, to, actor, format } = parsed.query;

        const membershipRole = await resolveMembershipRole(supabase, clinicId, userId);
        const authorization = authorizeAuditExportRole(membershipRole);
        if (!authorization.ok) {
          return errorJson(
            authorization.error,
            authorization.status,
            authorization.code,
          );
        }

        let totalQuery = supabase
          .from("audit_export_logs")
          .select("id")
          .eq("clinic_id", clinicId);

        if (from) {
          totalQuery = totalQuery.gte("exported_at", from);
        }

        if (to) {
          totalQuery = totalQuery.lte("exported_at", to);
        }

        if (actor) {
          totalQuery = totalQuery.ilike("exported_by_label", `%${actor}%`);
        }

        if (format) {
          totalQuery = totalQuery.eq("export_format", format);
        }

        const { data: totalRows, error: totalError } = await totalQuery;

        if (totalError) {
          throw totalError;
        }

        const total = totalRows?.length || 0;

        let query = supabase
          .from("audit_export_logs")
          .select(
            "id, clinic_id, exported_by_user_id, exported_by_label, export_format, filter_json, event_count, metadata_json, exported_at, created_at",
          )
          .eq("clinic_id", clinicId)
          .order("exported_at", { ascending: false });

        if (from) {
          query = query.gte("exported_at", from);
        }

        if (to) {
          query = query.lte("exported_at", to);
        }

        if (actor) {
          query = query.ilike("exported_by_label", `%${actor}%`);
        }

        if (format) {
          query = query.eq("export_format", format);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        const count = data?.length || 0;

        return NextResponse.json({
          logs: data || [],
          count,
          total,
          hasMore: offset + count < total,
          clinicId,
          limit,
          offset,
          filters: {
            from,
            to,
            actor,
            format,
          },
        });
      } catch (error) {
        console.error("Audit export logs error:", error);
        return errorJson(
          "Internal server error",
          500,
          "INTAKE_AUDIT_LOGS_INTERNAL_ERROR",
        );
      }
    },
  };
}

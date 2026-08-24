import { getServerUserId } from "@/lib/auth/server";
import {
  createAuditLogsRouteHandlers,
  type AuditLogsRouteDeps,
} from "@/lib/intakes/audit-logs-route";
import { createServiceSupabaseClient } from "@/lib/supabase";

const defaultDeps: AuditLogsRouteDeps = {
  createSupabase: createServiceSupabaseClient,
  getUserId: getServerUserId,
};

export const { GET } = createAuditLogsRouteHandlers(defaultDeps);

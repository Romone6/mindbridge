import { getServerSession, getServerUserId } from "@/lib/auth/server";
import {
  createAuditExportRouteHandlers,
  type AuditExportRouteDeps,
} from "@/lib/intakes/audit-export-route";
import { createServiceSupabaseClient } from "@/lib/supabase";

const defaultDeps: AuditExportRouteDeps = {
  createSupabase: createServiceSupabaseClient,
  getUserId: getServerUserId,
  getSession: getServerSession,
};

export const { GET } = createAuditExportRouteHandlers(defaultDeps);

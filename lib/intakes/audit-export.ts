import { isPrivilegedMembershipRole } from "@/lib/intakes/capabilities";
import type { WorkflowAuditEventType } from "@/lib/intakes/workflow-audit";

export type AuditExportFormat = "json" | "csv";

export type AuditExportQuery = {
  clinicId: string;
  intakeId: string | null;
  format: AuditExportFormat;
  from: string | null;
  to: string | null;
  actor: string | null;
  eventType: WorkflowAuditEventType | null;
  limit: number;
  offset: number;
};

export type AuditLogQuery = {
  clinicId: string;
  from: string | null;
  to: string | null;
  actor: string | null;
  format: AuditExportFormat | null;
  limit: number;
  offset: number;
};

export type AuditExportParseResult =
  | { ok: true; query: AuditExportQuery }
  | {
      ok: false;
      status: number;
      error: string;
      code: string;
    };

export type AuditExportMetadata = {
  exportedAt: string;
  exportedBy: string;
  filters: {
    from: string | null;
    to: string | null;
    actor: string | null;
    intakeId: string | null;
    eventType: WorkflowAuditEventType | null;
    limit: number;
    offset: number;
  };
  format: AuditExportFormat;
  count: number;
};

export function buildAuditCsvHeaders(params: {
  filename: string;
  metadata: AuditExportMetadata;
}): Record<string, string> {
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${params.filename}"`,
    "X-Audit-Exported-At": params.metadata.exportedAt,
    "X-Audit-Exported-By": params.metadata.exportedBy,
    "X-Audit-Export-Filters": JSON.stringify(params.metadata.filters),
  };
}

function normalizeIsoDateOrNull(raw: string | null): string | null {
  if (!raw) {
    return null;
  }

  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString();
}

function parseBoundedInteger(params: {
  raw: string | null;
  fallback: number;
  min: number;
  max: number;
}): number | null {
  if (!params.raw) {
    return params.fallback;
  }

  const parsed = Number(params.raw);
  if (!Number.isInteger(parsed) || parsed < params.min || parsed > params.max) {
    return null;
  }

  return parsed;
}

export function parseAuditExportQuery(url: string): AuditExportParseResult {
  const { searchParams } = new URL(url);
  const clinicId = searchParams.get("clinicId");
  const intakeId = searchParams.get("intakeId");
  const formatRaw = searchParams.get("format")?.toLowerCase() || "json";

  if (!clinicId) {
    return {
      ok: false,
      status: 400,
      error: "Clinic ID is required",
      code: "INTAKE_AUDIT_MISSING_CLINIC",
    };
  }

  if (formatRaw !== "json" && formatRaw !== "csv") {
    return {
      ok: false,
      status: 400,
      error: "Format must be either 'json' or 'csv'.",
      code: "INTAKE_AUDIT_INVALID_FORMAT",
    };
  }

  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");
  const actorRaw = searchParams.get("actor");
  const eventTypeRaw = searchParams.get("eventType");
  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");

  const from = normalizeIsoDateOrNull(fromRaw);
  if (fromRaw && !from) {
    return {
      ok: false,
      status: 400,
      error: "Invalid 'from' timestamp.",
      code: "INTAKE_AUDIT_INVALID_FROM",
    };
  }

  const to = normalizeIsoDateOrNull(toRaw);
  if (toRaw && !to) {
    return {
      ok: false,
      status: 400,
      error: "Invalid 'to' timestamp.",
      code: "INTAKE_AUDIT_INVALID_TO",
    };
  }

  if (from && to && from > to) {
    return {
      ok: false,
      status: 400,
      error: "'from' must be before or equal to 'to'.",
      code: "INTAKE_AUDIT_INVALID_RANGE",
    };
  }

  const actor = actorRaw?.trim() || null;

  let eventType: WorkflowAuditEventType | null = null;
  if (eventTypeRaw) {
    if (
      eventTypeRaw !== "takeover_claimed" &&
      eventTypeRaw !== "status_change" &&
      eventTypeRaw !== "note_added"
    ) {
      return {
        ok: false,
        status: 400,
        error: "Invalid 'eventType'.",
        code: "INTAKE_AUDIT_INVALID_EVENT_TYPE",
      };
    }
    eventType = eventTypeRaw;
  }

  const limitMax = formatRaw === "csv" ? 5000 : 1000;
  const limitDefault = formatRaw === "csv" ? 1000 : 100;

  const limit = parseBoundedInteger({
    raw: limitRaw,
    fallback: limitDefault,
    min: 1,
    max: limitMax,
  });
  if (limit === null) {
    return {
      ok: false,
      status: 400,
      error: "Invalid 'limit'.",
      code: "INTAKE_AUDIT_INVALID_LIMIT",
    };
  }

  const offset = parseBoundedInteger({
    raw: offsetRaw,
    fallback: 0,
    min: 0,
    max: 100000,
  });
  if (offset === null) {
    return {
      ok: false,
      status: 400,
      error: "Invalid 'offset'.",
      code: "INTAKE_AUDIT_INVALID_OFFSET",
    };
  }

  return {
    ok: true,
    query: {
      clinicId,
      intakeId,
      format: formatRaw,
      from,
      to,
      actor,
      eventType,
      limit,
      offset,
    },
  };
}

export function parseAuditLogQuery(url: string):
  | { ok: true; query: AuditLogQuery }
  | { ok: false; status: number; error: string; code: string } {
  const { searchParams } = new URL(url);
  const clinicId = searchParams.get("clinicId");
  if (!clinicId) {
    return {
      ok: false,
      status: 400,
      error: "Clinic ID is required",
      code: "INTAKE_AUDIT_LOGS_MISSING_CLINIC",
    };
  }

  const limit = parseBoundedInteger({
    raw: searchParams.get("limit"),
    fallback: 20,
    min: 1,
    max: 200,
  });
  if (limit === null) {
    return {
      ok: false,
      status: 400,
      error: "Invalid 'limit'.",
      code: "INTAKE_AUDIT_LOGS_INVALID_LIMIT",
    };
  }

  const offset = parseBoundedInteger({
    raw: searchParams.get("offset"),
    fallback: 0,
    min: 0,
    max: 100000,
  });
  if (offset === null) {
    return {
      ok: false,
      status: 400,
      error: "Invalid 'offset'.",
      code: "INTAKE_AUDIT_LOGS_INVALID_OFFSET",
    };
  }

  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");
  const from = normalizeIsoDateOrNull(fromRaw);
  const to = normalizeIsoDateOrNull(toRaw);

  if (fromRaw && !from) {
    return {
      ok: false,
      status: 400,
      error: "Invalid 'from' timestamp.",
      code: "INTAKE_AUDIT_LOGS_INVALID_FROM",
    };
  }

  if (toRaw && !to) {
    return {
      ok: false,
      status: 400,
      error: "Invalid 'to' timestamp.",
      code: "INTAKE_AUDIT_LOGS_INVALID_TO",
    };
  }

  if (from && to && from > to) {
    return {
      ok: false,
      status: 400,
      error: "'from' must be before or equal to 'to'.",
      code: "INTAKE_AUDIT_LOGS_INVALID_RANGE",
    };
  }

  const actor = searchParams.get("actor")?.trim() || null;

  const formatRaw = searchParams.get("format")?.toLowerCase() || null;
  let format: AuditExportFormat | null = null;
  if (formatRaw) {
    if (formatRaw !== "json" && formatRaw !== "csv") {
      return {
        ok: false,
        status: 400,
        error: "Invalid 'format'.",
        code: "INTAKE_AUDIT_LOGS_INVALID_FORMAT",
      };
    }
    format = formatRaw;
  }

  return {
    ok: true,
    query: {
      clinicId,
      from,
      to,
      actor,
      format,
      limit,
      offset,
    },
  };
}

export function authorizeAuditExportRole(role: string | null):
  | { ok: true }
  | { ok: false; status: number; error: string; code: string } {
  if (!role) {
    return {
      ok: false,
      status: 403,
      error: "Unauthorized",
      code: "INTAKE_AUDIT_FORBIDDEN",
    };
  }

  if (!isPrivilegedMembershipRole(role)) {
    return {
      ok: false,
      status: 403,
      error: "Forbidden",
      code: "INTAKE_AUDIT_ROLE_FORBIDDEN",
    };
  }

  return { ok: true };
}

export function buildAuditExportMetadata(params: {
  exportedBy: string;
  format: AuditExportFormat;
  query: AuditExportQuery;
  count: number;
}): AuditExportMetadata {
  return {
    exportedAt: new Date().toISOString(),
    exportedBy: params.exportedBy,
    filters: {
      from: params.query.from,
      to: params.query.to,
      actor: params.query.actor,
      intakeId: params.query.intakeId,
      eventType: params.query.eventType,
      limit: params.query.limit,
      offset: params.query.offset,
    },
    format: params.format,
    count: params.count,
  };
}

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  authorizeAuditExportRole,
  buildAuditCsvHeaders,
  buildAuditExportMetadata,
  parseAuditLogQuery,
  parseAuditExportQuery,
} from "@/lib/intakes/audit-export";

test("parseAuditExportQuery parses valid request with filters", () => {
  const result = parseAuditExportQuery(
    "http://localhost/api/intakes/audit?clinicId=clinic-1&format=csv&from=2026-02-10T00:00:00.000Z&to=2026-02-11T00:00:00.000Z&actor=dr&eventType=note_added&limit=25&offset=50",
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.query.clinicId, "clinic-1");
  assert.equal(result.query.format, "csv");
  assert.equal(result.query.actor, "dr");
  assert.equal(result.query.from, "2026-02-10T00:00:00.000Z");
  assert.equal(result.query.to, "2026-02-11T00:00:00.000Z");
  assert.equal(result.query.eventType, "note_added");
  assert.equal(result.query.limit, 25);
  assert.equal(result.query.offset, 50);
});

test("parseAuditExportQuery rejects invalid range and format", () => {
  const invalidFormat = parseAuditExportQuery(
    "http://localhost/api/intakes/audit?clinicId=clinic-1&format=xml",
  );
  assert.equal(invalidFormat.ok, false);
  if (invalidFormat.ok) return;
  assert.equal(invalidFormat.code, "INTAKE_AUDIT_INVALID_FORMAT");

  const invalidRange = parseAuditExportQuery(
    "http://localhost/api/intakes/audit?clinicId=clinic-1&from=2026-02-12T00:00:00.000Z&to=2026-02-11T00:00:00.000Z",
  );
  assert.equal(invalidRange.ok, false);
  if (invalidRange.ok) return;
  assert.equal(invalidRange.code, "INTAKE_AUDIT_INVALID_RANGE");

  const invalidEventType = parseAuditExportQuery(
    "http://localhost/api/intakes/audit?clinicId=clinic-1&eventType=foo",
  );
  assert.equal(invalidEventType.ok, false);
  if (invalidEventType.ok) return;
  assert.equal(invalidEventType.code, "INTAKE_AUDIT_INVALID_EVENT_TYPE");

  const invalidLimit = parseAuditExportQuery(
    "http://localhost/api/intakes/audit?clinicId=clinic-1&limit=0",
  );
  assert.equal(invalidLimit.ok, false);
  if (invalidLimit.ok) return;
  assert.equal(invalidLimit.code, "INTAKE_AUDIT_INVALID_LIMIT");

  const invalidOffset = parseAuditExportQuery(
    "http://localhost/api/intakes/audit?clinicId=clinic-1&offset=-1",
  );
  assert.equal(invalidOffset.ok, false);
  if (invalidOffset.ok) return;
  assert.equal(invalidOffset.code, "INTAKE_AUDIT_INVALID_OFFSET");
});

test("parseAuditLogQuery parses and validates query", () => {
  const valid = parseAuditLogQuery(
    "http://localhost/api/intakes/audit/logs?clinicId=clinic-3&limit=15&offset=5&actor=dr&format=csv&from=2026-02-10T00:00:00.000Z&to=2026-02-12T00:00:00.000Z",
  );
  assert.equal(valid.ok, true);
  if (!valid.ok) return;
  assert.equal(valid.query.clinicId, "clinic-3");
  assert.equal(valid.query.limit, 15);
  assert.equal(valid.query.offset, 5);
  assert.equal(valid.query.actor, "dr");
  assert.equal(valid.query.format, "csv");

  const missing = parseAuditLogQuery(
    "http://localhost/api/intakes/audit/logs?limit=15",
  );
  assert.equal(missing.ok, false);
  if (missing.ok) return;
  assert.equal(missing.code, "INTAKE_AUDIT_LOGS_MISSING_CLINIC");
});

test("authorizeAuditExportRole returns forbidden for non-privileged role", () => {
  const denied = authorizeAuditExportRole("READ_ONLY");
  assert.equal(denied.ok, false);
  if (denied.ok) return;
  assert.equal(denied.code, "INTAKE_AUDIT_ROLE_FORBIDDEN");

  const allowed = authorizeAuditExportRole("STAFF");
  assert.equal(allowed.ok, true);
});

test("buildAuditExportMetadata returns signed export envelope", () => {
  const parsed = parseAuditExportQuery(
    "http://localhost/api/intakes/audit?clinicId=clinic-2&actor=Dr",
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const metadata = buildAuditExportMetadata({
    exportedBy: "clinician@example.com",
    format: "json",
    query: parsed.query,
    count: 4,
  });

  assert.equal(metadata.exportedBy, "clinician@example.com");
  assert.equal(metadata.format, "json");
  assert.equal(metadata.count, 4);
  assert.equal(metadata.filters.actor, "Dr");
  assert.equal(typeof metadata.exportedAt, "string");
});

test("buildAuditCsvHeaders includes compliance metadata headers", () => {
  const parsed = parseAuditExportQuery(
    "http://localhost/api/intakes/audit?clinicId=clinic-2&actor=Dr",
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const metadata = buildAuditExportMetadata({
    exportedBy: "clinician@example.com",
    format: "csv",
    query: parsed.query,
    count: 3,
  });

  const headers = buildAuditCsvHeaders({
    filename: "audit.csv",
    metadata,
  });

  assert.equal(headers["Content-Type"], "text/csv; charset=utf-8");
  assert.equal(headers["Content-Disposition"], "attachment; filename=\"audit.csv\"");
  assert.equal(headers["X-Audit-Exported-By"], "clinician@example.com");
  assert.equal(typeof headers["X-Audit-Export-Filters"], "string");
});

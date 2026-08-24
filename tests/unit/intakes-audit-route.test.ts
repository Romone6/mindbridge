import assert from "node:assert/strict";
import { test } from "node:test";
import { createAuditExportRouteHandlers } from "@/lib/intakes/audit-export-route";

type FakeConfig = {
  memberships: Array<{ clinic_id: string; user_id: string; role: string }>;
  intakes: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
  failInsert?: boolean;
};

function createFakeSupabase(config: FakeConfig) {
  const inserted: Array<Record<string, unknown>> = [];

  class Query {
    private eqFilters: Array<{ field: string; value: unknown }> = [];
    private gteFilters: Array<{ field: string; value: string }> = [];
    private lteFilters: Array<{ field: string; value: string }> = [];
    private ilikeFilters: Array<{ field: string; value: string }> = [];
    private rangeWindow: { start: number; end: number } | null = null;
    private orderBy: { field: string; asc: boolean } | null = null;
    private limitCount: number | null = null;

    constructor(private table: "clinic_memberships" | "intakes" | "audit_export_logs") {}

    select(): this {
      return this;
    }

    eq(field: string, value: unknown): this {
      this.eqFilters.push({ field, value });
      return this;
    }

    gte(field: string, value: string): this {
      this.gteFilters.push({ field, value });
      return this;
    }

    lte(field: string, value: string): this {
      this.lteFilters.push({ field, value });
      return this;
    }

    ilike(field: string, value: string): this {
      this.ilikeFilters.push({ field, value });
      return this;
    }

    order(field: string, opts: { ascending: boolean }): this {
      this.orderBy = { field, asc: opts.ascending };
      return this;
    }

    limit(count: number): this {
      this.limitCount = count;
      return this;
    }

    range(start: number, end: number): this {
      this.rangeWindow = { start, end };
      return this;
    }

    insert(payload: Record<string, unknown>) {
      inserted.push(payload);
      return Promise.resolve({
        error: config.failInsert ? { message: "insert failed" } : null,
      });
    }

    single<T>() {
      const rows = this.executeRows();
      const row = rows[0] as T | undefined;
      if (!row) {
        return Promise.resolve({ data: null, error: { message: "not found" } });
      }

      return Promise.resolve({ data: row, error: null });
    }

    then<TResult1 = { data: unknown[]; error: null }>(
      onfulfilled?: ((value: { data: unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    ): Promise<TResult1> {
      const payload = { data: this.executeRows(), error: null as null };
      return Promise.resolve(payload).then(onfulfilled, onrejected);
    }

    private executeRows(): unknown[] {
      let rows: Array<Record<string, unknown>> =
        this.table === "clinic_memberships"
          ? [...config.memberships]
          : this.table === "intakes"
            ? [...config.intakes]
            : [...config.auditLogs];

      for (const filter of this.eqFilters) {
        rows = rows.filter((row) => row[filter.field] === filter.value);
      }

      for (const filter of this.gteFilters) {
        rows = rows.filter((row) =>
          String(row[filter.field] ?? "") >= filter.value,
        );
      }

      for (const filter of this.lteFilters) {
        rows = rows.filter((row) =>
          String(row[filter.field] ?? "") <= filter.value,
        );
      }

      for (const filter of this.ilikeFilters) {
        const needle = filter.value.replace(/%/g, "").toLowerCase();
        rows = rows.filter((row) =>
          String(row[filter.field] ?? "").toLowerCase().includes(needle),
        );
      }

      if (this.orderBy) {
        const { field, asc } = this.orderBy;
        rows.sort((a, b) => {
          const aValue = String(a[field] ?? "");
          const bValue = String(b[field] ?? "");
          return asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });
      }

      if (this.rangeWindow) {
        rows = rows.slice(this.rangeWindow.start, this.rangeWindow.end + 1);
      }

      if (typeof this.limitCount === "number") {
        rows = rows.slice(0, this.limitCount);
      }

      return rows;
    }
  }

  return {
    inserted,
    from(table: "clinic_memberships" | "intakes" | "audit_export_logs") {
      return new Query(table);
    },
  };
}

function makeIntakeRow(): Record<string, unknown> {
  return {
    id: "intake-1",
    clinic_id: "clinic-1",
    patient_id: "patient-1",
    status: "reviewed",
    answers_json: {
      clinician_takeover: {
        claimed_at: "2026-02-10T00:00:00.000Z",
        claimed_by: "Dr Test",
      },
      clinician_workflow: {
        status: "Actioned",
        notes: [
          {
            content: "Reviewed",
            author: "Dr Test",
            timestamp: "2026-02-10T01:00:00.000Z",
          },
        ],
        auditTrail: [
          {
            timestamp: "2026-02-10T00:30:00.000Z",
            oldStatus: "In Review",
            newStatus: "Actioned",
            changedBy: "Dr Test",
          },
        ],
      },
    },
  };
}

function makeIntakeRows(count: number): Array<Record<string, unknown>> {
  return Array.from({ length: count }, (_, index) => ({
    ...makeIntakeRow(),
    id: `intake-${index + 1}`,
    patient_id: `patient-${index + 1}`,
  }));
}

test("audit route returns JSON payload and writes export log", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "STAFF" }],
    intakes: [makeIntakeRow()],
    auditLogs: [],
  });

  const handlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => ({ user: { name: "Dr Test" } }),
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=json"),
  );

  assert.equal(response.status, 200);
  const payload = (await response.json()) as {
    events: unknown[];
    count: number;
    total: number;
    metadata: { exportedBy: string };
  };
  assert.equal(payload.count, 3);
  assert.equal(payload.total, 3);
  assert.equal(payload.metadata.exportedBy, "Dr Test");
  assert.equal(supabase.inserted.length, 1);
});

test("audit route returns CSV response with export headers", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    intakes: [makeIntakeRow()],
    auditLogs: [],
  });

  const handlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => ({ user: { email: "clinician@example.com" } }),
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=csv"),
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/csv; charset=utf-8");
  assert.equal(response.headers.get("x-audit-exported-by"), "clinician@example.com");
  const csv = await response.text();
  assert.equal(csv.includes("event_at,event_type,intake_id"), true);
});

test("audit route rejects non-privileged role", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "READ_ONLY" }],
    intakes: [makeIntakeRow()],
    auditLogs: [],
  });

  const handlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => ({ user: { name: "Dr Test" } }),
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=json"),
  );

  assert.equal(response.status, 403);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_ROLE_FORBIDDEN");
});

test("audit route rejects unauthenticated user", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    intakes: [makeIntakeRow()],
    auditLogs: [],
  });

  const handlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => null,
    getSession: async () => null,
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=json"),
  );

  assert.equal(response.status, 401);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_UNAUTHORIZED");
});

test("audit route rejects missing clinicId", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    intakes: [makeIntakeRow()],
    auditLogs: [],
  });

  const handlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => null,
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit?format=json"),
  );

  assert.equal(response.status, 400);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_MISSING_CLINIC");
});

test("audit route rejects invalid export format", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    intakes: [makeIntakeRow()],
    auditLogs: [],
  });

  const handlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => ({ user: { id: "user-1" } }),
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=xml"),
  );

  assert.equal(response.status, 400);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_INVALID_FORMAT");
});

test("audit route rejects oversized csv export", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    intakes: makeIntakeRows(2101),
    auditLogs: [],
  });

  const handlers = createAuditExportRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
    getSession: async () => ({ user: { name: "Dr Test" } }),
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit?clinicId=clinic-1&format=csv&limit=5000"),
  );

  assert.equal(response.status, 413);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_CSV_TOO_LARGE");
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { createAuditLogsRouteHandlers } from "@/lib/intakes/audit-logs-route";

type FakeConfig = {
  memberships: Array<{ clinic_id: string; user_id: string; role: string }>;
  auditLogs: Array<Record<string, unknown>>;
};

function createFakeSupabase(config: FakeConfig) {
  class Query {
    private eqFilters: Array<{ field: string; value: unknown }> = [];
    private gteFilters: Array<{ field: string; value: string }> = [];
    private lteFilters: Array<{ field: string; value: string }> = [];
    private ilikeFilters: Array<{ field: string; value: string }> = [];
    private rangeWindow: { start: number; end: number } | null = null;

    constructor(private table: "clinic_memberships" | "audit_export_logs") {}

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

    order(): this {
      return this;
    }

    range(start: number, end: number): this {
      this.rangeWindow = { start, end };
      return this;
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
          : [...config.auditLogs];

      for (const filter of this.eqFilters) {
        rows = rows.filter((row) => row[filter.field] === filter.value);
      }

      for (const filter of this.gteFilters) {
        rows = rows.filter((row) => String(row[filter.field] ?? "") >= filter.value);
      }

      for (const filter of this.lteFilters) {
        rows = rows.filter((row) => String(row[filter.field] ?? "") <= filter.value);
      }

      for (const filter of this.ilikeFilters) {
        const needle = filter.value.replace(/%/g, "").toLowerCase();
        rows = rows.filter((row) =>
          String(row[filter.field] ?? "").toLowerCase().includes(needle),
        );
      }

      if (this.rangeWindow) {
        rows = rows.slice(this.rangeWindow.start, this.rangeWindow.end + 1);
      }

      return rows;
    }
  }

  return {
    from(table: "clinic_memberships" | "audit_export_logs") {
      return new Query(table);
    },
  };
}

test("audit logs route applies filters and returns matching records", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    auditLogs: [
      {
        id: "log-1",
        clinic_id: "clinic-1",
        exported_by_label: "Dr Alpha",
        export_format: "csv",
        event_count: 4,
        exported_at: "2026-02-11T00:00:00.000Z",
      },
      {
        id: "log-2",
        clinic_id: "clinic-1",
        exported_by_label: "Dr Beta",
        export_format: "json",
        event_count: 2,
        exported_at: "2026-02-12T00:00:00.000Z",
      },
    ],
  });

  const handlers = createAuditLogsRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
  });

  const response = await handlers.GET(
    new Request(
      "http://localhost/api/intakes/audit/logs?clinicId=clinic-1&actor=beta&format=json&from=2026-02-11T00:00:00.000Z&limit=10",
    ),
  );

  assert.equal(response.status, 200);
  const payload = (await response.json()) as {
    count: number;
    total: number;
    logs: Array<{ id: string }>;
  };
  assert.equal(payload.count, 1);
  assert.equal(payload.total, 1);
  assert.equal(payload.logs[0].id, "log-2");
});

test("audit logs route returns total and page metadata", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    auditLogs: [
      {
        id: "log-1",
        clinic_id: "clinic-1",
        exported_by_label: "Dr One",
        export_format: "csv",
        event_count: 4,
        exported_at: "2026-02-11T00:00:00.000Z",
      },
      {
        id: "log-2",
        clinic_id: "clinic-1",
        exported_by_label: "Dr Two",
        export_format: "json",
        event_count: 2,
        exported_at: "2026-02-12T00:00:00.000Z",
      },
      {
        id: "log-3",
        clinic_id: "clinic-1",
        exported_by_label: "Dr Three",
        export_format: "json",
        event_count: 1,
        exported_at: "2026-02-13T00:00:00.000Z",
      },
    ],
  });

  const handlers = createAuditLogsRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit/logs?clinicId=clinic-1&limit=1&offset=1"),
  );

  assert.equal(response.status, 200);
  const payload = (await response.json()) as {
    count: number;
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    logs: Array<{ id: string }>;
  };
  assert.equal(payload.count, 1);
  assert.equal(payload.total, 3);
  assert.equal(payload.limit, 1);
  assert.equal(payload.offset, 1);
  assert.equal(payload.hasMore, true);
  assert.equal(payload.logs.length, 1);
  assert.equal(payload.logs[0].id, "log-2");
});

test("audit logs route denies read-only role", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "READ_ONLY" }],
    auditLogs: [],
  });

  const handlers = createAuditLogsRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit/logs?clinicId=clinic-1"),
  );

  assert.equal(response.status, 403);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_ROLE_FORBIDDEN");
});

test("audit logs route rejects unauthenticated user", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    auditLogs: [],
  });

  const handlers = createAuditLogsRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => null,
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit/logs?clinicId=clinic-1"),
  );

  assert.equal(response.status, 401);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_LOGS_UNAUTHORIZED");
});

test("audit logs route rejects missing clinicId", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    auditLogs: [],
  });

  const handlers = createAuditLogsRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit/logs?limit=10"),
  );

  assert.equal(response.status, 400);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_LOGS_MISSING_CLINIC");
});

test("audit logs route rejects invalid format", async () => {
  const supabase = createFakeSupabase({
    memberships: [{ clinic_id: "clinic-1", user_id: "user-1", role: "OWNER" }],
    auditLogs: [],
  });

  const handlers = createAuditLogsRouteHandlers({
    createSupabase: () => supabase as never,
    getUserId: async () => "user-1",
  });

  const response = await handlers.GET(
    new Request("http://localhost/api/intakes/audit/logs?clinicId=clinic-1&format=xml"),
  );

  assert.equal(response.status, 400);
  const payload = (await response.json()) as { code: string };
  assert.equal(payload.code, "INTAKE_AUDIT_LOGS_INVALID_FORMAT");
});
